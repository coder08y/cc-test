import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { calcCoinProportion } from '@/utils/pool'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { Token } from '@cetus/types'
import { Decimal, amountToBN, bnToAmount, fixDown } from '@cetus/utils'
import { TickUtil, d, fixCoinType } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import useQuoteWhiteTokenList from '../create-pool/useQuoteWhiteTokenList'
import usePosAdd from '../position/usePosAdd'

export default function useCompoundCommon() {
  const zapSdk = useSdk('zap')
  const { getTokenAmountValue } = useTokenPrice()
  const { preAdd } = usePosAdd()
  const { isWhiteQuoteToken } = useQuoteWhiteTokenList()
  const { liquiditySlippage } = useGlobalStore()
  const { currentPosBaseInfo } = usePositionStore()
  const { curPosContractPoolInfo } = usePositionDetailStore()

  interface getClaimMergePayloadPrams {
    rewarderCoinTypes: any
    targetCoinType: string
    mergeRouters: any
    notMergeCoins: any
  }
  const getClaimMergePayload = async ({ rewarderCoinTypes, targetCoinType, mergeRouters, notMergeCoins }: getClaimMergePayloadPrams) => {
    try {
      let params: any = {
        pool_id: currentPosBaseInfo?.clmmPool,
        pos_id: currentPosBaseInfo?.id,
        coin_type_a: currentPosBaseInfo?.coinTypeA,
        coin_type_b: currentPosBaseInfo?.coinTypeB,
        rewarder_coin_types: rewarderCoinTypes,
        target_coin_type: targetCoinType,
        slippage: liquiditySlippage,
        merge_routers: mergeRouters, // merge swap 预计算的结果
        not_merge_coins: notMergeCoins
      }

      if (currentPosBaseInfo?.posType == 'farms') {
        params['farms_pool_id'] = currentPosBaseInfo?.farmsPool
      }

      console.log('🚀 ~ toClaimMerge ~ params:', currentPosBaseInfo?.isReverse, params)
      const tx = await zapSdk!.Compound.createClaimMergePayload(params)
      console.log('🚀 ~ getClaimMergePayload ~ tx:', tx)
      return tx
    } catch (error) {
      console.log('🚀 ~ getClaimMergePayload ~ error:', error)
    }
  }

  const getCompoundRebalanceAddPayload = async ({
    rewarderCoinTypes,
    mergeRouters,
    notMergeCoins,
    compoundPreResult
  }: getClaimMergePayloadPrams & { compoundPreResult: any }) => {
    try {
      let baseParams: any = {
        pool_id: currentPosBaseInfo?.clmmPool,
        pos_id: currentPosBaseInfo?.id,
        coin_type_a: currentPosBaseInfo?.tokenA?.coin_type,
        coin_type_b: currentPosBaseInfo?.tokenB?.coin_type,
        rewarder_coin_types: rewarderCoinTypes
      }

      if (currentPosBaseInfo?.posType == 'farms') {
        baseParams['farms_pool_id'] = currentPosBaseInfo?.farmsPool
      }

      const rewarderMergeOption: any = {
        merge_routers: mergeRouters?.error ? undefined : mergeRouters,
        slippage: liquiditySlippage,
        not_merge_coins: notMergeCoins
      }
      console.log('🚀 ~ getCompoundRebalanceAddPayload ~ baseParams:', currentPosBaseInfo, baseParams)
      console.log('🚀 ~ getCompoundRebalanceAddPayload ~ compoundPreResult:', compoundPreResult)
      console.log('🚀 ~ getCompoundRebalanceAddPayload ~ rewarderMergeOption:', rewarderMergeOption)

      let tx: any = new Transaction()
      tx = await zapSdk!.Compound.createCompoundRebalanceAddPayload({ baseParams, rebalancePre: compoundPreResult, rewarderMergeOption, tx })
      console.log('🚀 ~ getCompoundRebalanceAddPayload ~ tx:', tx)
      return tx
    } catch (error) {
      console.log('🚀 ~ getCompoundRebalanceAddPayload ~ error:', error)
    }
  }

  const getMovePositionPayload = async (
    params: getClaimMergePayloadPrams & {
      oldPosAmountAWithSlippage: any
      oldPosAmountBWithSlippage: any
      compoundPreResult: any
      tickLower: number
      tickUpper: number
      haveClaim: boolean
      isStakeFarm: boolean
      notClose: boolean
      farmsPoolAddress?: string
    }
  ) => {
    const {
      rewarderCoinTypes,
      mergeRouters,
      notMergeCoins,
      compoundPreResult,
      oldPosAmountAWithSlippage,
      oldPosAmountBWithSlippage,
      tickLower,
      tickUpper,
      haveClaim,
      isStakeFarm,
      notClose,
      farmsPoolAddress
    } = params

    const decimalA = currentPosBaseInfo?.tokenA?.decimals
    const decimalB = currentPosBaseInfo?.tokenB?.decimals

    const min_amount_a = fixDown(d(oldPosAmountAWithSlippage).mul(Decimal.pow(10, decimalA)).toString(), 0)
    const min_amount_b = fixDown(d(oldPosAmountBWithSlippage).mul(Decimal.pow(10, decimalB)).toString(), 0)

    try {
      let tx: any = new Transaction()
      let oldPos: any = {
        pool_id: currentPosBaseInfo!.clmmPool,
        pos_id: currentPosBaseInfo!.id,
        coin_type_a: currentPosBaseInfo!.tokenA!.coin_type,
        coin_type_b: currentPosBaseInfo!.tokenB!.coin_type,
        rewarder_coin_types: rewarderCoinTypes,
        liquidity: currentPosBaseInfo!.liquidity,
        min_amount_a, // 原仓位的amount_a， 考虑滑点
        min_amount_b, // 原仓位的amount_b, 考虑滑点
        not_close: notClose
      }

      const newPos = {
        // 新仓位的区间
        tick_lower: tickLower,
        tick_upper: tickUpper
      }

      if (currentPosBaseInfo?.posType == 'farms') {
        oldPos['farms_pool_id'] = currentPosBaseInfo?.farmsPool
      }

      if (isStakeFarm) {
        newPos['farms_pool_id'] = farmsPoolAddress
      }
      const rewarderMergeOption: any = {
        merge_routers: mergeRouters,
        slippage: liquiditySlippage,
        not_merge_coins: notMergeCoins
      }

      console.log('createMovePositionPayload params: ', {
        oldPos,
        newPos,
        rebalancePre: compoundPreResult,
        slippage: Number(liquiditySlippage),
        rewarderMergeOption,
        have_claim: haveClaim
      })
      tx = await zapSdk!.Compound.createMovePositionPayload(
        {
          oldPos,
          newPos,
          rebalancePre: compoundPreResult,
          slippage: Number(liquiditySlippage),
          rewarderMergeOption,
          have_claim: haveClaim
        },
        tx
      )
      console.log('🚀 ~ getMovePositionPayload ~ tx:', tx)
      return tx
    } catch (error) {
      console.log('🚀 ~ getCompoundRebalanceAddPayload ~ error:', error)
    }
  }

  const rebalancePre = async (
    coin_amount_a: string,
    coin_amount_b: string,
    lowerTick: number,
    upperTick: number,
    uuid: string,
    noSlippageAmountA?: string,
    noSlippageAmountB?: string
  ) => {
    if (lowerTick == null || upperTick == null) return
    console.log('🚀 ~ rebalancePre ~ coin_amount_b:', coin_amount_b)
    console.log('🚀 ~ rebalancePre ~ coin_amount_a:', coin_amount_a)

    console.log('🚀 ~ rebalancePre ~ currentPosBaseInfo:', currentPosBaseInfo)
    console.log('🚀 ~ rebalancePre ~ curPosContractPoolInfo:', curPosContractPoolInfo)

    const decimalA = currentPosBaseInfo!.tokenA!.decimals
    const decimalB = currentPosBaseInfo!.tokenB!.decimals
    try {
      const amount_a = fixDown(d(coin_amount_a).mul(Decimal.pow(10, decimalA)).toString(), 0)
      const amount_b = fixDown(d(coin_amount_b).mul(Decimal.pow(10, decimalB)).toString(), 0)

      let originAmountA = ''
      let originAmountB = ''
      if (noSlippageAmountA && noSlippageAmountB) {
        originAmountA = fixDown(d(noSlippageAmountA).mul(Decimal.pow(10, decimalA)).toString(), 0)
        originAmountB = fixDown(d(noSlippageAmountB).mul(Decimal.pow(10, decimalB)).toString(), 0)
      }

      const params = {
        pool_id: currentPosBaseInfo!.clmmPool,
        pos_id: currentPosBaseInfo!.id,
        coin_type_a: currentPosBaseInfo!.tokenA!.coin_type,
        coin_type_b: currentPosBaseInfo!.tokenB!.coin_type,
        coin_decimal_a: decimalA,
        coin_decimal_b: decimalB,
        old_pos_origin_amount_a: originAmountA,
        old_pos_origin_amount_b: originAmountB,
        amount_a,
        amount_b,
        tick_lower: lowerTick,
        tick_upper: upperTick,
        current_sqrt_price: curPosContractPoolInfo!.current_sqrt_price.toString(),
        slippage: Number(liquiditySlippage),
        max_remain_rate: 0.01,
        mark_price: '',
        verify_price_loop: 0
      }
      console.log('🚀 ~ rebalancePre ~ params:', params)

      const res = await zapSdk!.Compound.calculateRebalance(params)
      console.log('🚀 ~ rebalancePre ~ result:', res)

      if (res) {
        console.log('🚀 ~ rebalancePre ~ currentPosBaseInfo:', curPosContractPoolInfo, currentPosBaseInfo)

        const amountA = currentPosBaseInfo?.isReverse ? bnToAmount(res?.use_amount_b, decimalB) : bnToAmount(res?.use_amount_a, decimalA)
        const amountB = currentPosBaseInfo?.isReverse ? bnToAmount(res?.use_amount_a, decimalA) : bnToAmount(res?.use_amount_b, decimalB)

        let isFullRange
        if (
          lowerTick === TickUtil.getMinIndex(Number(curPosContractPoolInfo?.tickSpacing || 0)) &&
          upperTick === TickUtil.getMaxIndex(Number(curPosContractPoolInfo?.tickSpacing || 0))
        ) {
          isFullRange = true
        } else {
          isFullRange = false
        }
        let percentA = '0'
        let percentB = '0'
        const currentPrice = currentPosBaseInfo?.isReverse ? curPosContractPoolInfo?.currentPriceReverse : curPosContractPoolInfo?.currentPrice
        if (Number(amountA) !== 0 || Number(amountB) !== 0) {
          const { percentA: A, percentB: B } = calcCoinProportion(amountA, amountB, currentPrice, isFullRange)
          percentA = A
          percentB = B
        } else {
          const { percentA: A, percentB: B }: any = getTokenPercent(isFullRange, currentPrice, lowerTick, upperTick)
          percentA = A
          percentB = B
        }

        console.log('🚀 ~ rebalancePre ~ amountA && amountB:', Number(amountA) !== 0 && Number(amountB) !== 0, amountA, amountB, percentA, percentB)
        const remainAmount = res?.fix_amount_a ? bnToAmount(res?.remain_amount, decimalB) : bnToAmount(res?.remain_amount, decimalA)
        const remainToken = res?.fix_amount_a ? currentPosBaseInfo!.tokenB : currentPosBaseInfo!.tokenA

        const result = {
          origin: { ...res },
          error: res?.error,
          displayUseAmountA: amountA,
          displayUseAmountB: amountB,
          displayUseAmountUsdA: getTokenAmountValue(currentPosBaseInfo?.displayTokenA?.coin_type, amountA),
          displayUseAmountUsdB: getTokenAmountValue(currentPosBaseInfo?.displayTokenB?.coin_type, amountB),
          displayPercentA: percentA,
          displayPercentB: percentB,
          remainAmountInfo: {
            token: remainToken,
            amount: remainAmount,
            amountUSD: getTokenAmountValue(remainToken?.coin_type, remainAmount)
          },
          allRoutes: res?.swap_result?.route_obj ? [{ ...res?.swap_result?.route_obj, displaySwapAmountIn: res?.display_swap_amount_in }] : [],
          routeErrorInfo: res?.error
            ? {
                swap_amount_in: res?.swap_amount_in,
                swap_in_coin_type: res?.swap_in_coin_type
              }
            : undefined,
          uuid
        }
        console.log('🚀 ~ rebalancePre ~ result:', result)
        return result
      }
    } catch (error) {
      console.log('🚀 ~ rebalancePre ~ error:', error)
      return {
        origin: undefined,
        error: 'no router',
        routeErrorInfo: undefined,
        remainAmountInfo: undefined,
        displayUseAmountA: '',
        displayUseAmountB: '',
        displayUseAmountUsdA: '',
        displayUseAmountUsdB: '',
        displayPercentA: '',
        displayPercentB: '',
        allRoutes: [],
        uuid
      }
    }
  }

  const getTokenPercent = (isFullRange: boolean, currentPrice: string, lowerTick: number, upperTick: number) => {
    if (isFullRange) {
      return { percentA: '50', percentB: '50' }
    }
    if (!currentPosBaseInfo || !curPosContractPoolInfo) return { percentA: '--', percentB: '--' }

    if (
      currentPosBaseInfo &&
      currentPosBaseInfo?.tokenA &&
      currentPosBaseInfo?.tokenB &&
      curPosContractPoolInfo!.current_tick_index &&
      curPosContractPoolInfo!.current_sqrt_price &&
      lowerTick !== undefined &&
      upperTick !== undefined
    ) {
      if (d(lowerTick).lte(curPosContractPoolInfo.current_tick_index) && d(upperTick).gt(curPosContractPoolInfo.current_tick_index)) {
        const baseToken = isWhiteQuoteToken(currentPosBaseInfo.tokenA.coin_type) ? currentPosBaseInfo.tokenA : currentPosBaseInfo.tokenB
        const isTokenA = baseToken.coin_type === currentPosBaseInfo.tokenA.coin_type

        const res = preAdd({
          amount: amountToBN('1', baseToken.decimals).toString(),
          tokenA: currentPosBaseInfo?.tokenA,
          tokenB: currentPosBaseInfo?.tokenB,
          isTokenA,
          lowerTick,
          upperTick,
          curSqrtPrice: curPosContractPoolInfo.current_sqrt_price,
          isReverse: currentPosBaseInfo?.isReverse,
          roundUp: true
        })
        const rateMap = calcCoinProportion(res.coinAmountA, res.coinAmountB, currentPrice, isFullRange)
        return rateMap
      }

      if (d(lowerTick).gt(curPosContractPoolInfo.current_tick_index)) {
        return { percentA: '100', percentB: '0' }
      }

      if (d(upperTick).lte(curPosContractPoolInfo.current_tick_index)) {
        return { percentA: '0', percentB: '100' }
      }
    }
    return { percentA: '--', percentB: '--' }
  }

  const getMergeData = (needMergeRewards: any, mergeToken: Token) => {
    //  构建 fromTokenList
    const newFromTokenList = needMergeRewards
      .map((r: any) => r?.token)
      .filter(Boolean)
      .map((token: any) => ({
        ...token,
        coin_type: fixCoinType(token?.coin_type, false)
      }))
      .filter((token: any) => token.coin_type !== fixCoinType(mergeToken?.coin_type, false))

    // 构建 fromAmountObj
    const newFromAmountObj = newFromTokenList.reduce(
      (acc: any, token: any) => {
        const coinType = fixCoinType(token.coin_type, false)
        const reward = needMergeRewards.find((r: any) => fixCoinType(r?.token?.coin_type, false) === coinType)
        if (coinType && reward?.amount != null) {
          acc[coinType] = reward.amount
        }
        return acc
      },
      {} as Record<string, string | number>
    )

    //  更新状态
    return {
      newFromTokenList,
      newFromAmountObj
    }
  }

  const mergeRewardsToTokenA = (compoundableRewards: any, toToken: Token) => {
    if (!compoundableRewards?.length || !currentPosBaseInfo) return
    const { tokenA, tokenB } = currentPosBaseInfo

    let needMerge: boolean = false
    let fromTokenList: any = []
    let fromAmountObj: any = {}

    //  筛出  rewards 不属于 tokenA/B 的奖励（需要被 merge 的）
    const needMergeRewards = compoundableRewards.filter(
      (r: any) =>
        fixCoinType(r?.token?.coin_type) !== fixCoinType(tokenA?.coin_type) && fixCoinType(r?.token?.coin_type) !== fixCoinType(tokenB?.coin_type)
    )

    //  构造新的合并结果：把其他 token merge 成 tokenA
    if (needMergeRewards.length > 0) {
      needMerge = true
      const { newFromTokenList, newFromAmountObj } = getMergeData(needMergeRewards, toToken)
      //  更新状态
      fromTokenList = newFromTokenList
      fromAmountObj = newFromAmountObj
      console.log('🚀 ~ mergeRewardsToTokenA ~ newFromTokenList:', newFromTokenList, newFromAmountObj)
    } else {
      needMerge = false
    }
    return {
      needMerge,
      fromTokenList,
      fromAmountObj
    }
  }

  // merge后的token和fee数量相加
  const getAmountMergeWithFee = (totalOut: { value: string; coin: Token }, clmmFeeList: any, tokenA: Token, compoundableRewards: any) => {
    const totalOutValueWithSlippage = d(totalOut.value).mul(d(1).sub(liquiditySlippage).toString()).toString()

    const coinInfoA = clmmFeeList[0]
    const coinInfoB = clmmFeeList[1]

    let mergeWithFeeAmountA = compoundableRewardsHasCurFee(compoundableRewards, coinInfoA?.token)
    let mergeWithFeeAmountB = compoundableRewardsHasCurFee(compoundableRewards, coinInfoB?.token)

    if (fixCoinType(totalOut?.coin?.coin_type) === fixCoinType(clmmFeeList?.[0]?.token?.coin_type)) {
      mergeWithFeeAmountA = d(mergeWithFeeAmountA).add(totalOutValueWithSlippage).toString()
    } else {
      mergeWithFeeAmountB = d(mergeWithFeeAmountB).add(totalOutValueWithSlippage).toString()
    }

    const coinInfoNeedReverse = fixCoinType(tokenA?.coin_type) !== fixCoinType(coinInfoA?.token?.coin_type)
    return {
      mergeWithFeeAmountA: coinInfoNeedReverse ? mergeWithFeeAmountB : mergeWithFeeAmountA,
      mergeWithFeeAmountB: coinInfoNeedReverse ? mergeWithFeeAmountA : mergeWithFeeAmountB
    }
  }

  const compoundableRewardsHasCurFee = (compoundableRewards: any, feeToken: Token) => {
    if (!compoundableRewards?.length || !feeToken?.coin_type) return
    const matched = compoundableRewards.find((item: any) => fixCoinType(item?.token?.coin_type) === fixCoinType(feeToken?.coin_type))

    return matched?.amount ?? 0
  }

  return {
    getClaimMergePayload,
    getCompoundRebalanceAddPayload,
    getMovePositionPayload,
    rebalancePre,
    getMergeData,
    mergeRewardsToTokenA,
    getAmountMergeWithFee,
    compoundableRewardsHasCurFee
  }
}
