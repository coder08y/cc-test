import usePosHelper from '@/hooks/position/usePosHelper'
import { usePosMergeToken } from '@/hooks/position/usePosMergeToken'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionCompoundStore from '@/store/position/compound'
import usePositionDetailStore from '@/store/position/detail'
import { AggregatorServerErrorCode, PosBaseInfo, PosReward } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { CommonTypeInfo } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useState } from 'react'
import useTransaction from '../common/useTransaction'
import useGetPosPools from '../position/useGetPosPools'
import useGetPosRewards from '../position/useGetPosRewards'
import useGetPosfees from '../position/useGetPosfees'
import useCompoundCommon from './useCompoundCommon'

export default function useClaimMerge() {
  const { mevProtect } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { currentPosBaseInfo } = usePositionStore()
  const { curPosContractPoolInfo } = usePositionDetailStore()
  const { getPosPoolsOriginalObj } = useGetPosPools()
  const { getPosFeeData } = useGetPosfees()
  const { getPosRewardsData } = useGetPosRewards()
  const {
    rewardAndFeeList,
    clmmRewardList,
    setRoutePriceImpact,
    mergeableRewards,
    notMergeableRewards,
    mergeToToken,
    setMergeToToken,
    setIsOpenCompoundModal
  } = usePositionCompoundStore()

  useEffect(() => {
    setRoutePriceImpact(0, 0, 'merge', true)
    return () => {
      setRoutePriceImpact(0, 0, 'merge', true)
      setMergeToToken(envConfigs.cetus_coin)
    }
  }, [])
  const { getMergedTokenValue } = usePosHelper()

  // 总收益计算
  const notMergeableTotalYield = useMemo(() => {
    if (!notMergeableRewards?.length) return 0

    const validValues = notMergeableRewards.map(r => Number(r?.amountUSD)).filter(v => !isNaN(v))
    return validValues.length === 0 ? '--' : validValues.reduce((acc, v) => acc + v, 0)
  }, [notMergeableRewards])

  // 总收益计算
  const totalYield = useMemo(() => {
    if (!mergeableRewards?.length) return 0

    const validValues = mergeableRewards.map(r => Number(r?.amountUSD)).filter(v => !isNaN(v))
    return validValues.length === 0 ? '--' : validValues.reduce((acc, v) => acc + v, 0)
  }, [mergeableRewards])

  // 可用的输入 token 列表，并过滤掉toToken
  const fromTokenList = useMemo(() => {
    if (!mergeableRewards?.length) return []

    return mergeableRewards
      .map(r => r?.token)
      .filter(Boolean) // 先去掉 null/undefined
      .map(token => ({
        ...token,
        coin_type: fixCoinType(token.coin_type, false) // 统一处理 coin_type
      }))
      .filter(token => token.coin_type !== fixCoinType(mergeToToken?.coin_type, false)) // 再做排除
  }, [mergeableRewards, mergeToToken])

  // 构建 token 对应数量对象
  const fromAmountObj = useMemo(() => {
    if (!fromTokenList?.length) return undefined

    return fromTokenList.reduce(
      (acc, token) => {
        const coinType = fixCoinType(token?.coin_type, false)
        const reward = mergeableRewards.find(r => fixCoinType(r?.token?.coin_type, false) === coinType)
        if (coinType && reward?.amount != null) {
          acc[coinType] = reward.amount
        }
        return acc
      },
      {} as Record<string, string | number>
    )
  }, [fromTokenList, mergeableRewards])

  useDeepCompareEffect(() => {
    if (!mergeableRewards?.length) return

    const CETUS_COIN = envConfigs.cetus_coin
    const SUI_COIN = envConfigs.sui_coin

    // 多于 1 个可合并 token 不改
    if (mergeableRewards.length > 1) return

    const onlyReward = mergeableRewards[0]
    if (!onlyReward || fixCoinType(onlyReward?.token?.coin_type) !== fixCoinType(mergeToToken?.coin_type)) return
    // 唯一 token 是 CETUS 则切换为 SUI，否则切 CETUS
    setMergeToToken(fixCoinType(onlyReward?.token?.coin_type) === fixCoinType(CETUS_COIN?.coin_type) ? SUI_COIN : CETUS_COIN)
  }, [mergeableRewards])

  const { targetTokenList, resetData, mergeSwapQuote, findRouterLoading, totalOutValue, reCalculateRouteData } = usePosMergeToken(
    fromTokenList,
    mergeToToken,
    fromAmountObj
  )

  const toTokenAmountValue: any = useMemo(() => {
    return getMergedTokenValue({
      rewardAndFeeList,
      toToken: mergeToToken,
      totalValue: totalOutValue,
      type: 'amountUSD'
    })
  }, [mergeToToken, totalOutValue, mergeableRewards])

  const toTokenRawAmountValue: any = useMemo(() => {
    console.log('🚀 ~ ClaimMerged ~ mergeSwapQuote:', mergeSwapQuote)
    return getMergedTokenValue({
      rewardAndFeeList,
      toToken: mergeToToken,
      totalValue: mergeSwapQuote?.totalAmountOutDisplay,
      type: 'amount'
    })
  }, [mergeToToken, mergeSwapQuote?.totalAmountOutDisplay, mergeableRewards])

  const btnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Claim',
      disabled: false
    }

    // token 选择判断
    if (mergeableRewards.length === 0) {
      btnInfo.text = 'Insufficient Yield'
      btnInfo.disabled = true
      return btnInfo
    }

    //  errorCode
    if (mergeSwapQuote?.error) {
      if (
        mergeSwapQuote.error.code === AggregatorServerErrorCode.InsufficientLiquidity ||
        mergeSwapQuote.error.code === AggregatorServerErrorCode.HoneyPot
      ) {
        btnInfo.text = 'Insufficient Liquidity'
        btnInfo.disabled = true
        return btnInfo
      }
      if (mergeSwapQuote.error.code === AggregatorServerErrorCode.BadRequest) {
        btnInfo.text = 'No Available Route'
        btnInfo.disabled = true
        return btnInfo
      }
    }

    return btnInfo
  }, [mergeableRewards, mergeSwapQuote])

  const { signAndExecuteTransaction } = useTransaction()
  const [isClaimMergeLoading, setIsClaimMergeLoading] = useState(false)
  const { getClaimMergePayload } = useCompoundCommon()
  const toClaimMerge = async () => {
    setIsClaimMergeLoading(true)
    try {
      const rewarderMiningCoinTypes = clmmRewardList?.length > 0 ? clmmRewardList?.map((r: PosReward) => fixCoinType(r.token.coin_type, false)) : []
      const notMergeCoins = notMergeableRewards?.length > 0 ? notMergeableRewards?.map((item: any) => item.token?.coin_type) : []

      const params: any = {
        rewarderCoinTypes: rewarderMiningCoinTypes,
        targetCoinType: mergeToToken?.coin_type,
        mergeRouters: mergeSwapQuote?.data,
        notMergeCoins
      }

      console.log('🚀 ~ toClaimMerge ~ params:', params)
      const tx = await getClaimMergePayload(params)
      console.log('🚀 ~ toClaimMerge ~ tx:', tx)

      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: status => {
            const info: CommonTypeInfo = {
              modalDescriptionText: '',
              toastTitleText: ''
            }
            console.log('🚀 ~ toClaimMerge ~ status:', status)
            return info
          }
        },
        {
          useMev: mevProtect
        }
      )

      console.log('🚀 ~ toClaimMerge ~ res:', res)

      if (res) {
        const poolInfo = curPosContractPoolInfo || (await getPosPoolsOriginalObj([currentPosBaseInfo as PosBaseInfo]))

        console.log('🚀 ~ toClaim ~ poolInfo:', poolInfo)

        // 延迟刷新数据
        setTimeout(() => {
          fetchAccountBalance()
          getPosFeeData([currentPosBaseInfo as PosBaseInfo])
          getPosRewardsData([currentPosBaseInfo as PosBaseInfo], {
            [poolInfo.poolAddress]: poolInfo
          })
          setIsOpenCompoundModal(false)
          // getCurrentPosHistory(id, posId) // 如需历史记录
        }, 2000)
      }
      setIsClaimMergeLoading(false)
    } catch (error) {
      setIsClaimMergeLoading(false)
      console.log('🚀 ~ claimYieldAction ~ error:', error)
    }
  }

  const isShowAutoClaim = useMemo(() => {
    if (!notMergeableRewards?.length || !mergeableRewards?.length) return false
    if (notMergeableRewards?.length > 1) return true
    if (fixCoinType(notMergeableRewards[0]?.token?.coin_type) == fixCoinType(mergeToToken?.coin_type)) {
      return false
    } else {
      return true
    }
  }, [notMergeableRewards, mergeableRewards, mergeToToken?.coin_type])
  return {
    isShowAutoClaim,
    btnInfo,
    reCalculateRouteData,
    toClaimMerge,
    isClaimMergeLoading,
    mergeToToken,
    setMergeToToken,
    notMergeableTotalYield,
    totalYield,
    mergeSwapQuote,
    findRouterLoading,
    totalOutValue,
    resetData,
    targetTokenList,
    toTokenAmountValue,
    toTokenRawAmountValue
  }
}
