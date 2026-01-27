import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionCompoundStore from '@/store/position/compound'
import usePositionDetailStore from '@/store/position/detail'
import { AggregatorServerErrorCode, PosReward } from '@/types'
import { useDebounceFunction } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo } from '@cetus/types'
import { formatNumberWithDown } from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 } from 'uuid'
import useTransaction from '../common/useTransaction'
import useCurrentPos from '../position/useCurrentPos'
import { usePosMergeToken } from '../position/usePosMergeToken'
import useCompoundCommon from './useCompoundCommon'

export default function useCompound() {
  const { mevProtect, liquiditySlippage } = useGlobalStore()
  const { rebalancePre, mergeRewardsToTokenA, getCompoundRebalanceAddPayload, getAmountMergeWithFee, compoundableRewardsHasCurFee } =
    useCompoundCommon()
  const { currentPosBaseInfo, posLiquidityData } = usePositionStore()
  const { curPosContractPoolInfo } = usePositionDetailStore()
  const {
    rewardAndFeeList,
    clmmFeeList,
    clmmRewardList,
    setCompoundValue,
    compoundableRewards,
    notCompoundableRewards,
    setIsOpenCompoundModal,
    setRoutePriceImpact
  } = usePositionCompoundStore()

  const [fromTokenList, setFromTokenList] = useState<any[]>([])
  const [fromAmountObj, setFromAmountObj] = useState<Record<string, string | number>>({})
  const [needMerge, setNeedMerge] = useState<boolean>(false)
  const [compoundPreResult, setCompoundPreResult] = useState<any>(undefined)
  const [isRebalancePreLoading, setIsRebalancePreLoading] = useState(true)

  const { signAndExecuteTransaction } = useTransaction()
  const [isCompoundLoading, setIsCompoundLoading] = useState(false)
  const { position_nft_id } = useParams()
  const { getCurrentPosBaseInfo } = useCurrentPos()
  const { currentAccount } = useAccountStore()

  useEffect(() => {
    setRoutePriceImpact(0, 0, 'compound', true)
    return () => {
      setRoutePriceImpact(0, 0, 'compound', true)
    }
  }, [])
  const currentPosLiquidityData = useMemo(() => {
    return posLiquidityData[currentPosBaseInfo?.posId as string]
  }, [posLiquidityData, currentPosBaseInfo?.posId])

  const getDisplayPercent = (value?: string) => {
    return !value || value === '<0.01' ? 0 : value
  }

  const toToken: any = useMemo(() => {
    if (!currentPosLiquidityData || !currentPosBaseInfo) return {}

    const { tokenA, tokenB, isReverse } = currentPosBaseInfo

    const percentA = !isReverse
      ? getDisplayPercent(currentPosLiquidityData?.displayPercentA)
      : getDisplayPercent(currentPosLiquidityData?.displayPercentB)

    const percentB = !isReverse
      ? getDisplayPercent(currentPosLiquidityData?.displayPercentB)
      : getDisplayPercent(currentPosLiquidityData?.displayPercentA)

    const isAGreater = d(percentA || 0).gte(percentB || 0)

    return isAGreater ? tokenA : tokenB
  }, [currentPosLiquidityData, currentPosBaseInfo])

  const uuidRef = useRef('')

  // 能复投的奖励收益计算
  const totalYield = useMemo(() => {
    if (!compoundableRewards?.length) return 0
    const validValues = compoundableRewards.map(r => Number(r?.amountUSD)).filter(v => !isNaN(v))
    return validValues.length === 0 ? '--' : validValues.reduce((acc, v) => acc + v, 0)
  }, [compoundableRewards])

  // 不能复投的奖励收益计算
  const notCompoundableTotalYield = useMemo(() => {
    if (!notCompoundableRewards?.length) return 0
    const validValues = notCompoundableRewards.map(r => Number(r?.amountUSD)).filter(v => !isNaN(v))
    return validValues.length === 0 ? '--' : validValues.reduce((acc, v) => acc + v, 0)
  }, [notCompoundableRewards])

  const { mergeSwapQuote, findRouterLoading, totalOutValue, reCalculateRouteData } = usePosMergeToken(fromTokenList, toToken, fromAmountObj)

  useDeepCompareEffect(() => {
    if (!curPosContractPoolInfo?.current_sqrt_price || !currentPosBaseInfo) return

    let isMerge = false
    if (compoundableRewards?.length > 0) {
      // Step 1: 计算 mergeRewardsToTokenA
      const { needMerge, fromTokenList, fromAmountObj }: any = mergeRewardsToTokenA(compoundableRewards, toToken)

      console.log('🚀 ~ usePosRebalancePage ~ fromAmountObj:', needMerge, fromTokenList, fromAmountObj)

      setNeedMerge(needMerge)
      isMerge = needMerge

      if (needMerge) {
        setFromTokenList(fromTokenList)
        setFromAmountObj(fromAmountObj)
      }
    }

    // Step 2: 如果需要 merge，则更新列表并重新计算 route
    if (isMerge && !mergeSwapQuote?.error) {
      // 等待 usePosMergeToken 返回新值
      if (totalOutValue && clmmFeeList?.length > 0) {
        const { mergeWithFeeAmountA, mergeWithFeeAmountB } = getAmountMergeWithFee(
          {
            value: mergeSwapQuote?.totalAmountOutDisplay,
            coin: mergeSwapQuote?.toToken
          },
          clmmFeeList,
          currentPosBaseInfo?.tokenA,
          compoundableRewards
        )
        debounceRebalancePre(mergeWithFeeAmountA, mergeWithFeeAmountB)
      }
    } else {
      // Step 3: 不需要 merge，直接从 clmmFeeList 计算
      noMergeRebalancePre(compoundableRewards)
    }
  }, [
    liquiditySlippage,
    curPosContractPoolInfo?.current_sqrt_price,
    compoundableRewards,
    currentPosBaseInfo,
    clmmFeeList,
    totalOutValue,
    mergeSwapQuote?.error
  ])

  const noMergeRebalancePre = (compoundableRewards: any) => {
    if (!currentPosBaseInfo) return
    console.log('🚀 ~ noMergeRebalancePre ~ compoundableRewards:', compoundableRewards, clmmFeeList)
    // && compoundableRewards?.length > 0
    if (clmmFeeList?.length > 0) {
      const coin_amount_a = compoundableRewardsHasCurFee(compoundableRewards, clmmFeeList[0]?.token)
      const coin_amount_b = compoundableRewardsHasCurFee(compoundableRewards, clmmFeeList[1]?.token)

      const coinInfoNeedReverse = fixCoinType(currentPosBaseInfo?.tokenA?.coin_type) !== fixCoinType(clmmFeeList[0]?.token?.coin_type)
      console.log('🚀 ~ handleRebalancePre:', { coin_amount_a, coin_amount_b, coinInfoNeedReverse })

      debounceRebalancePre(coinInfoNeedReverse ? coin_amount_b : coin_amount_a, coinInfoNeedReverse ? coin_amount_a : coin_amount_b)
    }
  }

  const getRebalancePre = async (amountA: string, amountB: string) => {
    console.log('🚀 ~ getRebalancePre ~ currentPosBaseInfo:', currentPosBaseInfo, curPosContractPoolInfo)
    if (!currentPosBaseInfo || !curPosContractPoolInfo) return
    setIsRebalancePreLoading(true)

    try {
      console.log('🚀 ~ getRebalancePre ~ currentPosBaseInfo:', amountA, amountB, currentPosBaseInfo?.tokenA)

      const uuid = v4()
      uuidRef.current = uuid
      console.log('🚀 ~ getRebalancePre ~ uuid:', uuid)
      const res = await rebalancePre(amountA, amountB, currentPosBaseInfo?.lowerTick, currentPosBaseInfo?.upperTick, uuid)
      console.log('🚀 ~ getRebalancePre ~ uuid:', res, uuidRef?.current, res && res?.uuid === uuidRef?.current)

      if (res && res?.uuid === uuidRef?.current) {
        setCompoundPreResult(res)
        let compoundValue = ''
        console.log('🚀 ~ getRebalancePre ~ res:', res)
        if (res?.displayUseAmountUsdA && res?.displayUseAmountUsdB) {
          compoundValue = d(res?.displayUseAmountUsdA).plus(res?.displayUseAmountUsdB).toString()
        }
        setCompoundValue(compoundValue)
      }
      setIsRebalancePreLoading(false)
    } catch (error) {
      setIsRebalancePreLoading(false)
      console.log('🚀 ~ getRebalancePre ~ error:', error)
    }
  }
  const debounceRebalancePre = useDebounceFunction(async (withoutMiningEqualFeeAmountA: string, withoutMiningEqualFeeAmountB: string) => {
    getRebalancePre(withoutMiningEqualFeeAmountA, withoutMiningEqualFeeAmountB)
  }, 500)

  const refreshRouteData = () => {
    if (needMerge) {
      reCalculateRouteData()
    } else {
      noMergeRebalancePre(compoundableRewards)
    }
  }

  const btnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Compound',
      disabled: false
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
      if (mergeSwapQuote.error.code === AggregatorServerErrorCode.NoRouter) {
        btnInfo.text = 'No Available Route'
        btnInfo.disabled = true
        return btnInfo
      }
    }

    if (!compoundPreResult) {
      btnInfo.disabled = true
      return btnInfo
    }
    if (!compoundableRewards?.length) {
      btnInfo.text = 'Insufficient Yield'
      btnInfo.disabled = true
      return btnInfo
    }
    if (compoundPreResult?.error) {
      btnInfo.text = 'No Available Route'
      btnInfo.disabled = true
      return btnInfo
    }
    return btnInfo
  }, [mergeSwapQuote, compoundPreResult, compoundableRewards])

  // 复投
  const toCompound = async () => {
    if (!compoundPreResult) return
    setIsCompoundLoading(true)
    try {
      const rewarderMiningCoinTypes = clmmRewardList?.length > 0 ? clmmRewardList?.map((r: PosReward) => fixCoinType(r.token.coin_type, false)) : []
      const notMergeCoins = notCompoundableRewards?.length > 0 ? notCompoundableRewards?.map((item: any) => item.token?.coin_type) : []

      const params: any = {
        rewarderCoinTypes: rewarderMiningCoinTypes,
        mergeRouters: mergeSwapQuote?.data,
        notMergeCoins,
        compoundPreResult: compoundPreResult?.origin
      }

      console.log('🚀 ~ toCompound ~ params:', params)
      const tx = await getCompoundRebalanceAddPayload(params)
      console.log('🚀 ~ toCompound ~ tx:', tx)

      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: status => {
            const info: CommonTypeInfo = {
              modalDescriptionText: '',
              toastTitleText: ''
            }
            console.log('🚀 ~ toCompound ~ status:', status)
            return info
          }
        },
        {
          useMev: mevProtect
        }
      )

      if (res) {
        setTimeout(() => {
          getCurrentPosBaseInfo(currentAccount?.address, position_nft_id, true)
          setIsOpenCompoundModal(false)
        }, 2000)
      }
      setIsCompoundLoading(false)
    } catch (error) {
      console.log('🚀 ~ toCompound ~ error:', error)
      setIsCompoundLoading(false)
    }
  }

  const allRoutes = useMemo(() => {
    console.log('🚀 ~ usePosRebalancePage ~ mergeSwapQuote:', mergeSwapQuote, compoundPreResult)
    const swapList = !fromTokenList?.length ? [] : mergeSwapQuote?.data?.allRoutes || []
    return swapList.concat(compoundPreResult?.allRoutes || [])
  }, [compoundPreResult?.allRoutes, mergeSwapQuote?.data, fromTokenList?.length])

  const isRouteError = useMemo(() => {
    return (needMerge && mergeSwapQuote?.error) || compoundPreResult?.error
  }, [needMerge, compoundPreResult?.error, mergeSwapQuote?.error])

  const firstInfo = useMemo(() => {
    if (rewardAndFeeList?.length > 0) {
      const claimText = rewardAndFeeList
        .filter((item: any) => +item?.amount > 0) // 过滤掉 0 奖励
        .map((item: any) => `${formatNumberWithDown(item.amount)} ${item?.token?.symbol}`)
        .reduce((acc, cur, index, arr) => {
          if (index === 0) return cur
          if (index === arr.length - 1) return `${acc}, and ${cur}`
          return `${acc}, ${cur}`
        }, '')

      return {
        title: 'Claim yield',
        info: `Claim ${claimText}`
      }
    }
    return undefined
  }, [rewardAndFeeList])

  const lastInfo = useMemo(() => {
    console.log('🚀 ~ usePosRebalancePage ~ compoundPreResult:', compoundPreResult)
    if (!currentPosBaseInfo) return
    const displayTokenA = currentPosBaseInfo?.displayTokenA
    const displayTokenB = currentPosBaseInfo?.displayTokenB
    const newLiquidityAmountA = compoundPreResult?.displayUseAmountA || '0'
    const newLiquidityAmountB = compoundPreResult?.displayUseAmountB || '0'
    return {
      title: 'Compound in the position ',
      info: `Deposit estimated ${[
        d(newLiquidityAmountA).gt(0) && `${formatNumberWithDown(newLiquidityAmountA)} ${displayTokenA?.symbol}`,
        d(newLiquidityAmountB).gt(0) && `${formatNumberWithDown(newLiquidityAmountB)} ${displayTokenB?.symbol}`
      ]
        .filter(Boolean)
        .join(' and ')}`
    }
  }, [compoundPreResult, currentPosBaseInfo])
  return {
    firstInfo,
    lastInfo,
    isRouteError,
    allRoutes,
    refreshRouteData,
    isRebalancePreLoading,
    isCompoundLoading,
    toCompound,
    btnInfo,
    compoundPreResult,
    needMerge,
    mergeSwapQuote,
    findRouterLoading,
    notCompoundableTotalYield,
    totalYield,
    currentPosLiquidityData
  }
}
