import useGetPriceRange from '@/hooks/clmm/useGetPriceRange'
import usePosHelper from '@/hooks/position/usePosHelper'
import useLiquidityStore from '@/store/clmm'
import usePriceRangeStore from '@/store/clmm/priceRange'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionCompoundStore from '@/store/position/compound'
import usePositionDetailStore from '@/store/position/detail'
import { AggregatorServerErrorCode, PosReward } from '@/types'
import { useDebounceFunction } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo, Token } from '@cetus/types'
import { formatNumberWithDown, formatTickPrice, isAvailableObject, parsePositionIdFromEvent, removeComma, textEllipses } from '@cetus/utils'
import { TickUtil, d, fixCoinType } from '@cetusprotocol/common-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import useGetLeverage from '../common/useGetLeverage'
import useTransaction from '../common/useTransaction'
import useCompoundCommon from '../position-compound/useCompoundCommon'
import { usePriceImpact } from '../swap/usePriceImpact'
import { usePosMergeToken } from './usePosMergeToken'

export default function usePosRebalancePage() {
  const navigate = useNavigate()
  const { currentAccount } = useAccountStore()
  const { mevProtect, transactionMode, maxCapForGas, customGasPrice, liquiditySlippage } = useGlobalStore()
  const { currentPosBaseInfo, posPoolsRelatedData, poolRangeObj, posLiquidityData } = usePositionStore()
  const { curPosContractPoolInfo, currentPosPoolInfo, isDirect, setCurrentPosDetailTab } = usePositionDetailStore()
  const {
    clmmFeeList,
    clmmRewardList,
    rewardAndFeeList,
    compoundableRewards,
    notCompoundableRewards: notCompoundableRewardsStore,
    setRoutePriceImpact
  } = usePositionCompoundStore()
  const { hasCompound, getCompoundableRewards } = usePosHelper()
  const { fetchPriceRange } = useGetPriceRange()
  const { lowerTickData, upperTickData, setLowerTickData, setUpperTickData } = usePriceRangeStore()
  const { setCurrentRange } = useLiquidityStore()
  const { getLeverage } = useGetLeverage()

  const { signAndExecuteTransaction, getTransactionStatus } = useTransaction()

  const { rebalancePre, mergeRewardsToTokenA, getAmountMergeWithFee, getMovePositionPayload, compoundableRewardsHasCurFee } = useCompoundCommon()

  const [compoundPreResult, setCompoundPreResult] = useState<any>(undefined)
  const [isCompoundPreLoading, setIsCompoundPreLoading] = useState<boolean>(true)

  const [isRebalanceLoading, setIsRebalanceLoading] = useState(false)

  // 原仓位挪仓的token A B 数量
  const [rebalanceAmountA, setRebalanceAmountA] = useState<string>('')
  const [rebalanceAmountB, setRebalanceAmountB] = useState<string>('')

  const [fromTokenList, setFromTokenList] = useState<any[]>([])
  const [fromAmountObj, setFromAmountObj] = useState<Record<string, string | number>>({})
  const [needMerge, setNeedMerge] = useState<boolean>(false)
  const [tab, setTab] = useState({ type: '30D', key: 'month' })

  // const toToken: any = currentPosBaseInfo?.tokenA

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

  const [currentRewardsAction, setCurrentRewardsAction] = useState('Compound')
  const [isStakeFarm, setIsStakeFarm] = useState(false)
  const changeRewardsAction = (value: string) => {
    setFromTokenList([])
    setFromAmountObj({})
    setCompoundPreResult(undefined)
    setCurrentRewardsAction(value)
  }
  const changeStakeFarm = (value: boolean) => {
    setIsStakeFarm(value)
  }

  // 奖励是否可以复投
  const canCompound = useMemo(() => {
    console.log('🚀 ~ DetailStatsInfo ~ rewardAndFeeList:', rewardAndFeeList)
    return rewardAndFeeList?.length > 0 && isAvailableObject(currentPosBaseInfo)
      ? rewardAndFeeList.find(
          (item: any) =>
            fixCoinType(item?.token?.coin_type) === fixCoinType(currentPosBaseInfo?.tokenA?.coin_type) ||
            fixCoinType(item?.token?.coin_type) === fixCoinType(currentPosBaseInfo?.tokenB?.coin_type)
        )
      : false
  }, [rewardAndFeeList])

  useDeepCompareEffect(() => {
    if (isAvailableObject(currentPosBaseInfo)) {
      console.log('🚀 ~ RebalanceBlock ~ currentPosBaseInfo:', currentPosBaseInfo)
      fetchPriceRange(currentPosBaseInfo?.clmmPool, currentPosBaseInfo?.tokenA, currentPosBaseInfo?.tokenB)
    }
  }, [currentPosBaseInfo])

  useEffect(() => {
    setCurrentRange('')
    setRoutePriceImpact(0, 0, 'move', true)
    return () => {
      setLowerTickData({})
      setUpperTickData({})
      setCurrentRange('')
      setRoutePriceImpact(0, 0, 'move', true)
    }
  }, [])

  const [showTokenALock, setShowTokenALock] = useState(false)
  const [showTokenBLock, setShowTokenBLock] = useState(false)

  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId as string]

  useEffect(() => {
    if (curPosContractPoolInfo?.current_tick_index !== undefined && isAvailableObject(lowerTickData) && isAvailableObject(upperTickData)) {
      if (d(lowerTickData?.tick).gte(d(upperTickData.tick))) {
        setShowTokenALock(true)
        setShowTokenBLock(true)
      } else {
        if (d(lowerTickData?.tick).gt(curPosContractPoolInfo?.current_tick_index)) {
          setShowTokenALock(!isDirect)
          setShowTokenBLock(!!isDirect)
        } else if (d(upperTickData.tick).lte(curPosContractPoolInfo?.current_tick_index)) {
          setShowTokenALock(!!isDirect)
          setShowTokenBLock(!isDirect)
        } else {
          setShowTokenALock(false)
          setShowTokenBLock(false)
        }
      }
    }
  }, [lowerTickData?.tick, upperTickData?.tick, curPosContractPoolInfo, isDirect])

  const isActive = useMemo(() => {
    console.log('🚀 ~ usePosRebalancePage ~ showTokenALock:', showTokenALock, showTokenBLock)
    return !showTokenALock && !showTokenBLock
  }, [showTokenALock, showTokenBLock])

  const ranges = useMemo(() => {
    if (isAvailableObject(currentPosPoolsRelatedData) && isAvailableObject(currentPosPoolInfo) && isAvailableObject(poolRangeObj)) {
      const currentRangeObj = poolRangeObj[currentPosBaseInfo?.clmmPool as string]
      if (currentRangeObj) {
        const ranges = currentRangeObj?.ranges.reduce((acc: any, item: any) => {
          acc[item.dateType] = item
          return acc
        }, {})
        return ranges
      }
    }
  }, [currentPosPoolsRelatedData, currentPosPoolInfo, currentPosBaseInfo, tab?.key, poolRangeObj])

  // 计算价格显示文本 Calculate price display text
  const perText = useMemo(() => {
    if (!currentPosBaseInfo?.tokenA || !currentPosBaseInfo?.tokenB) return ''
    return isDirect
      ? `${textEllipses(currentPosBaseInfo?.tokenB?.symbol, 10)}/${textEllipses(currentPosBaseInfo?.tokenA?.symbol, 10)}`
      : `${textEllipses(currentPosBaseInfo?.tokenA?.symbol, 10)}/${textEllipses(currentPosBaseInfo?.tokenB?.symbol, 10)}`
  }, [isDirect, currentPosBaseInfo?.tokenA as Token, currentPosBaseInfo?.tokenB as Token])

  // 计算杠杆率 Calculate leverage
  const leverage = useMemo(() => {
    console.log('🚀 ~ usePosRebalancePage ~ lowerTickData:', lowerTickData, upperTickData)
    const minPrice = lowerTickData?.price
    const maxPrice = upperTickData?.price
    return getLeverage(minPrice, maxPrice)
  }, [lowerTickData?.price, currentPosBaseInfo?.id, upperTickData?.price])

  const notCompoundableRewards = useMemo(() => {
    if (notCompoundableRewardsStore?.length > 0 && isAvailableObject(currentPosBaseInfo)) {
      return notCompoundableRewardsStore.filter(
        (item: any) =>
          fixCoinType(item?.token?.coin_type) !== fixCoinType(currentPosBaseInfo?.tokenA?.coin_type) &&
          fixCoinType(item?.token?.coin_type) !== fixCoinType(currentPosBaseInfo?.tokenB?.coin_type)
      )
    } else {
      return []
    }
  }, [notCompoundableRewardsStore, currentPosBaseInfo])

  const notCompoundableTotalYield = useMemo(() => {
    if (!notCompoundableRewards?.length) return 0
    const validValues = notCompoundableRewards.map(r => Number(r?.amountUSD)).filter(v => !isNaN(v))
    return validValues.length === 0 ? '--' : validValues.reduce((acc, v) => acc + v, 0)
  }, [notCompoundableRewards])

  // 不需要复投奖励 不用传入数量 直接用仓位原来的数量
  // 需要复投奖励  1.mining没有奖励 那么直接传入fee 的数量
  //             2.mining有奖励 a.奖励中的token跟fee token都一样 ===>compoundableRewardsHasCurFee拿到fee和mining总数量
  //                           b.奖励中存在与fee不同的token 先将与fee不同的奖励merge为tokenA 再跟fee相加
  const getRebalancePre = useCallback(
    async (action = 'Claim', miningWithFeeAmountA = '0', miningWithFeeAmountB = '0') => {
      if (!currentPosBaseInfo || !curPosContractPoolInfo || !isAvailableObject(lowerTickData) || !isAvailableObject(upperTickData)) return
      setIsCompoundPreLoading(true)
      try {
        let amountA = '0'
        let amountB = '0'
        console.log('🚀 ~ usePosRebalancePage ~ action:', action)
        if (action == 'Compound') {
          amountA = miningWithFeeAmountA
          amountB = miningWithFeeAmountB
        }

        const lowerTick = lowerTickData?.tick
        const upperTick = upperTickData?.tick

        const posAmountA = currentPosBaseInfo?.isReverse ? currentPosLiquidityData?.displayCoinAmountB : currentPosLiquidityData?.displayCoinAmountA
        const posAmountB = currentPosBaseInfo?.isReverse ? currentPosLiquidityData?.displayCoinAmountA : currentPosLiquidityData?.displayCoinAmountB

        const noSlippageAmountA = d(amountA).plus(posAmountA).toString()
        const noSlippageAmountB = d(amountB).plus(posAmountB).toString()

        amountA = d(amountA)
          .plus(d(posAmountA).mul(d(1).sub(liquiditySlippage)))
          .toString()
        amountB = d(amountB)
          .plus(d(posAmountB).mul(d(1).sub(liquiditySlippage)))
          .toString()

        setRebalanceAmountA(amountA)
        setRebalanceAmountB(amountB)

        const uuid = v4()
        uuidRef.current = uuid
        console.log(
          '🚀 ~ usePosRebalancePage ~ amountA, amountB, lowerTick, upperTick:',
          amountA,
          amountB,
          lowerTick,
          upperTick,
          noSlippageAmountA,
          noSlippageAmountB,
          currentPosBaseInfo?.isReverse
        )
        const res = await rebalancePre(amountA, amountB, lowerTick, upperTick, uuid, noSlippageAmountA, noSlippageAmountB)
        console.log('🚀 ~ usePosRebalancePage ~ res:', res)

        if (res && res?.uuid === uuidRef?.current) {
          setCompoundPreResult(res)
        }
      } catch (error) {
        console.log('🚀 ~ getRebalancePre ~ error:', error)
      } finally {
        setIsCompoundPreLoading(false)
      }
    },
    [liquiditySlippage, lowerTickData?.tick, upperTickData?.tick, currentPosBaseInfo, curPosContractPoolInfo, toToken, currentPosLiquidityData]
  )

  const debounceRebalancePre = useDebounceFunction(async (action: string, miningWithFeeAmountA = '0', miningWithFeeAmountB = '0') => {
    console.log('🚀 ~ usePosRebalancePage ~ miningWithFeeAmountA, miningWithFeeAmountB:', miningWithFeeAmountA, miningWithFeeAmountB)
    getRebalancePre(action, miningWithFeeAmountA, miningWithFeeAmountB)
  }, 500)

  const { mergeSwapQuote, findRouterLoading, totalOutValue, reCalculateRouteData } = usePosMergeToken(fromTokenList, toToken, fromAmountObj)

  useDeepCompareEffect(() => {
    if (
      !liquiditySlippage ||
      !curPosContractPoolInfo?.current_sqrt_price ||
      !currentPosBaseInfo ||
      !isAvailableObject(lowerTickData) ||
      !isAvailableObject(upperTickData)
    )
      return
    console.log('🚀 ~ usePosRebalancePage ~ Compound121212', currentRewardsAction, canCompound, mergeSwapQuote)

    // Compound 路径
    if (currentRewardsAction === 'Compound' && canCompound) {
      let isMerge = false
      if (compoundableRewards?.length > 0) {
        const { needMerge, fromTokenList, fromAmountObj }: any = mergeRewardsToTokenA(compoundableRewards, toToken)
        isMerge = needMerge
        setNeedMerge(needMerge)

        if (needMerge) {
          setFromTokenList(fromTokenList)
          setFromAmountObj(fromAmountObj)
        }
      }

      if (needMerge && !mergeSwapQuote?.error) {
        // Merge 路径
        if (totalOutValue && clmmFeeList?.length > 0) {
          const { mergeWithFeeAmountA, mergeWithFeeAmountB } = getAmountMergeWithFee(
            {
              value: mergeSwapQuote?.totalAmountOutDisplay,
              coin: mergeSwapQuote?.toToken
            },
            clmmFeeList,
            currentPosBaseInfo?.tokenA,
            rewardAndFeeList
          )
          debounceRebalancePre('Compound', mergeWithFeeAmountA, mergeWithFeeAmountB)
          return
        }
      } else {
        const coinInfoNeedReverse = fixCoinType(currentPosBaseInfo?.tokenA?.coin_type) !== fixCoinType(clmmFeeList[0]?.token?.coin_type)
        const displayFeeA = coinInfoNeedReverse ? clmmFeeList[1] : clmmFeeList[0]
        const displayFeeB = coinInfoNeedReverse ? clmmFeeList[0] : clmmFeeList[1]

        const feeAmountA = compoundableRewardsHasCurFee(rewardAndFeeList, displayFeeA?.token)
        const feeAmountB = compoundableRewardsHasCurFee(rewardAndFeeList, displayFeeB?.token)
        debounceRebalancePre('Compound', feeAmountA, feeAmountB)
      }
      return
    }

    // 默认 Rebalance
    debounceRebalancePre('Claim')
  }, [
    rewardAndFeeList,
    canCompound,
    liquiditySlippage,
    curPosContractPoolInfo,
    currentPosBaseInfo,
    lowerTickData?.tick,
    upperTickData?.tick,
    currentRewardsAction,
    compoundableRewards,
    clmmFeeList,
    totalOutValue,
    mergeSwapQuote?.error,
    toToken
  ])

  const currentPrice = useMemo(() => {
    if (currentPosPoolsRelatedData?.currentPrice || currentPosPoolsRelatedData?.currentPriceReverse) {
      return isDirect ? removeComma(currentPosPoolsRelatedData?.currentPrice) : removeComma(currentPosPoolsRelatedData?.currentPriceReverse)
    }
  }, [isDirect, currentPosPoolsRelatedData?.currentPrice])

  const { priceImpactBasedOnMarket } = usePriceImpact(
    currentPosBaseInfo?.displayTokenA,
    currentPosBaseInfo?.displayTokenB,
    isDirect ? '1' : (formatTickPrice(currentPrice || '') as string),
    isDirect ? (formatTickPrice(currentPrice || '') as string) : '1',
    true
  )

  const priceImpactBasedOnMarketDisplay = useMemo(() => {
    console.log('🚀 ~ usePosRebalancePage ~ priceImpactBasedOnMarket:', priceImpactBasedOnMarket)
    if (priceImpactBasedOnMarket !== undefined && d(priceImpactBasedOnMarket).abs().gte(30)) {
      if (d(priceImpactBasedOnMarket).gte(30)) {
        return `+${d(priceImpactBasedOnMarket).toFixed(0)}%`
      }
      return `${d(priceImpactBasedOnMarket).toFixed(0)}%`
    }
    return undefined
  }, [priceImpactBasedOnMarket])

  const isNewRangeSameOld = useMemo(() => {
    return lowerTickData?.tick == currentPosBaseInfo?.lowerTick && upperTickData?.tick == currentPosBaseInfo?.upperTick
  }, [lowerTickData?.tick, upperTickData?.tick, currentPosBaseInfo?.lowerTick, currentPosBaseInfo?.upperTick])

  const btnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Rebalance',
      disabled: false
    }
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // 区间与原仓位区间一致 按钮置灰
    if (isNewRangeSameOld) {
      btnInfo.text = 'Set a new range'
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
    if (compoundPreResult?.error) {
      btnInfo.text = 'No Available Route'
      btnInfo.disabled = true
      return btnInfo
    }

    if (showTokenALock && showTokenBLock) {
      btnInfo.disabled = true
      return btnInfo
    }

    return btnInfo
  }, [currentAccount?.address, showTokenALock, showTokenBLock, mergeSwapQuote, compoundPreResult, isNewRangeSameOld])

  const isFullRange = useMemo(() => {
    if (
      lowerTickData?.tick === TickUtil.getMinIndex(Number(curPosContractPoolInfo?.tickSpacing || 0)) &&
      upperTickData?.tick === TickUtil.getMaxIndex(Number(curPosContractPoolInfo?.tickSpacing || 0))
    ) {
      return true
    } else {
      return false
    }
  }, [lowerTickData?.tick, upperTickData?.tick])

  useEffect(() => {
    setCompoundPreResult(undefined)
  }, [lowerTickData?.tick, upperTickData?.tick])

  const toRebalance = async () => {
    if (!compoundPreResult) return
    console.log(
      '🚀 ~ toRebalance ~ compoundPreResult:',
      lowerTickData?.tick,
      upperTickData?.tick,
      rebalanceAmountA,
      rebalanceAmountB,
      compoundPreResult
    )
    setIsRebalanceLoading(true)
    try {
      const isVestingPos = !!currentPosBaseInfo?.vestData
      const rewarderMiningCoinTypes = clmmRewardList?.length > 0 ? clmmRewardList?.map((r: PosReward) => fixCoinType(r.token.coin_type, false)) : []
      const notMergeable = getCompoundableRewards(rewardAndFeeList, false)
      const notMergeCoins =
        currentRewardsAction == 'Claim'
          ? rewardAndFeeList?.map((item: any) => item.token?.coin_type) || []
          : notMergeable?.map((item: any) => item.token?.coin_type) || []

      // const amountA = d(rebalanceAmountA).mul(d(1).sub(liquiditySlippage)).toString()
      // const amountB = d(rebalanceAmountB).mul(d(1).sub(liquiditySlippage)).toString()

      const posAmountA = currentPosBaseInfo?.isReverse ? currentPosLiquidityData?.displayCoinAmountB : currentPosLiquidityData?.displayCoinAmountA
      const posAmountB = currentPosBaseInfo?.isReverse ? currentPosLiquidityData?.displayCoinAmountA : currentPosLiquidityData?.displayCoinAmountB

      const oldPosAmountAWithSlippage = d(posAmountA).mul(d(1).sub(liquiditySlippage)).toString()
      const oldPosAmountBWithSlippage = d(posAmountB).mul(d(1).sub(liquiditySlippage)).toString()

      const params: any = {
        rewarderCoinTypes: rewarderMiningCoinTypes,
        mergeRouters: mergeSwapQuote?.data,
        notMergeCoins,
        compoundPreResult: compoundPreResult?.origin,
        // oldPosAmountAWithSlippage: rebalanceAmountA,
        // oldPosAmountBWithSlippage: rebalanceAmountB,
        oldPosAmountAWithSlippage,
        oldPosAmountBWithSlippage,
        tickLower: lowerTickData?.tick,
        tickUpper: upperTickData?.tick,
        haveClaim: currentRewardsAction == 'Claim',
        isStakeFarm,
        farmsPoolAddress: currentPosPoolInfo?.farmsPoolAddress,
        notClose: isVestingPos
      }
      console.log('🚀 ~ toRebalance ~ params:', params)

      const tx = await getMovePositionPayload(params)
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
          useMev: mevProtect,
          useFastMode: transactionMode === 'Fast Mode',
          maxCapForGas,
          customGasPrice
        }
      )

      if (res) {
        console.log('🚀 ~ toRebalance ~ res:', res)
        setCompoundPreResult(undefined)
        let result: any = res
        if (res?.events?.length === 0) {
          result = await getTransactionStatus(res.digest)
          console.log('🚀 ~ toRebalance ~ result:', result)
        }
        const { posId, farmsPosId } = parsePositionIdFromEvent(result)
        console.log('🚀 ~ toRebalance ~ farmsPosId:', farmsPosId)
        console.log('🚀 ~ toRebalance ~ posId:', posId)
        if (posId) {
          setTimeout(() => {
            const id: any = isStakeFarm ? farmsPosId : posId
            console.log('🚀 ~ file: useAddLiquidity.ts:436 ~ handleSubmit ~ posId:', { posId, farmsPosId })
            navigate(`/position-detail/${id}`, { replace: true })
            // getCurrentPosBaseInfo(currentAccount?.address as string, id, true)
            setCurrentPosDetailTab('increase')
          }, 800)
        } else {
          navigate('/pools?tab=positions')
        }
      }
      setIsRebalanceLoading(false)
    } catch (error) {
      console.log('🚀 ~ toCompound ~ error:', error)
      setIsRebalanceLoading(false)
    }
  }

  const refreshRouteData = () => {
    console.log('🚀 ~ refreshRouteData ~ currentRewardsAction:', currentRewardsAction)
    if (currentRewardsAction === 'Claim') {
      getRebalancePre()
    } else {
      reCalculateRouteData()
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
    if (!currentPosBaseInfo) return
    const displayTokenA = currentPosBaseInfo?.displayTokenA
    const displayTokenB = currentPosBaseInfo?.displayTokenB
    const rewardAndFeeAmountA = !rewardAndFeeList?.length
      ? 0
      : rewardAndFeeList?.find((item: any) => fixCoinType(item?.token?.coin_type) === fixCoinType(displayTokenA?.coin_type))
    const rewardAndFeeAmountB = !rewardAndFeeList?.length
      ? 0
      : rewardAndFeeList?.find((item: any) => fixCoinType(item?.token?.coin_type) === fixCoinType(displayTokenB?.coin_type))
    const liquidityAmountA = currentPosLiquidityData?.displayCoinAmountA || '0'
    const liquidityAmountB = currentPosLiquidityData?.displayCoinAmountB || '0'

    const totalAmountA = d(liquidityAmountA)
      .plus(d(rewardAndFeeAmountA?.amount || '0'))
      .toString()
    const totalAmountB = d(liquidityAmountB)
      .plus(d(rewardAndFeeAmountB?.amount || '0'))
      .toString()

    return {
      title: 'Remove Liquidity and claim yield',
      info: `Withdraw ${[
        d(totalAmountA).gt(0) && `${formatNumberWithDown(totalAmountA)} ${displayTokenA?.symbol}`,
        d(totalAmountB).gt(0) && `${formatNumberWithDown(totalAmountB)} ${displayTokenB?.symbol}`
      ]
        .filter(Boolean)
        .join(' and ')}`
    }
  }, [currentPosLiquidityData, rewardAndFeeList, currentPosBaseInfo])

  const lastInfo = useMemo(() => {
    if (!currentPosBaseInfo) return
    console.log('🚀 ~ usePosRebalancePage ~ compoundPreResult:', compoundPreResult)
    const displayTokenA = currentPosBaseInfo?.displayTokenA
    const displayTokenB = currentPosBaseInfo?.displayTokenB
    const newLiquidityAmountA = compoundPreResult?.displayUseAmountA || '0'
    const newLiquidityAmountB = compoundPreResult?.displayUseAmountB || '0'
    return {
      title: 'Create a new position',
      info: `Deposit estimated ${[
        d(newLiquidityAmountA).gt(0) && `${formatNumberWithDown(newLiquidityAmountA)} ${displayTokenA?.symbol}`,
        d(newLiquidityAmountB).gt(0) && `${formatNumberWithDown(newLiquidityAmountB)} ${displayTokenB?.symbol}`
      ]
        .filter(Boolean)
        .join(' and ')}`
    }
  }, [compoundPreResult, currentPosBaseInfo])

  return {
    notCompoundableRewards,
    firstInfo,
    lastInfo,
    isRouteError,
    allRoutes,
    isNewRangeSameOld,
    notCompoundableTotalYield,
    priceImpactBasedOnMarketDisplay,
    refreshRouteData,
    isFullRange,
    showTokenALock,
    showTokenBLock,
    toRebalance,
    isRebalanceLoading,
    btnInfo,
    needMerge,
    mergeSwapQuote,
    findRouterLoading,
    canCompound,
    isCompoundPreLoading,
    currentRewardsAction,
    isStakeFarm,
    changeRewardsAction,
    changeStakeFarm,
    compoundPreResult,
    tab,
    setTab,
    isActive,
    ranges,
    leverage,
    perText
  }
}
