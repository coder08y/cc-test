import useGlobalStore from '@/store/common/global'
import { MsafeTransactionSubType, PrePosAddRes } from '@/types'
import { useSdk } from '@cetus/sdk-factory'
import { Token } from '@cetus/types'
import { bnToAmount, d } from '@cetus/utils'
import { ClmmPoolUtil } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

type GetAddTsPayload = {
  poolAddress: string
  coinTypeA: string
  coinTypeB: string
  amountA: string
  amountB: string
  fixAmountA: boolean
  lowerTick: number
  upperTick: number
  currentSqrtPrice: string
  posType: 'clmm' | 'farms'
  rewarderCoinTypes: any
  isAutoClaim: boolean
  posIndex?: string
  posId?: string
  farmsPoolId?: string
}

export default function usePosAdd() {
  const clmmSdk = useSdk('clmm')
  const farmsSdk = useSdk('farms')

  const { liquiditySlippage } = useGlobalStore()
  const [currentSlippage, setCurrentSlippage] = useState(liquiditySlippage)

  const { pathname } = useLocation()

  const firstPathPart = pathname.split('/').filter(Boolean)[0]
  useEffect(() => {
    setCurrentSlippage(liquiditySlippage)
  }, [liquiditySlippage])

  /**
   * 与计算
   * @param
   * isTokenA: 输入的token === tokenA 为true
   * roundUp都传true就行
   * @returns
   */
  const preAdd = (params: {
    amount: string | BN
    tokenA: Token
    tokenB: Token
    isTokenA: boolean
    lowerTick: number
    upperTick: number
    curSqrtPrice: string
    isReverse: boolean
    roundUp: boolean
  }): PrePosAddRes => {
    console.log('🚀 ~ usePosAdd ~ params:', params)
    const { amount, tokenA, tokenB, isTokenA, lowerTick, upperTick, curSqrtPrice, isReverse, roundUp } = params

    const coinAmount = new BN(amount)
    console.log('🚀 ~ usePosAdd ~ coinAmount:', currentSlippage, curSqrtPrice, coinAmount.toString())
    const { coin_amount_a, coin_amount_b, coin_amount_limit_a, coin_amount_limit_b, liquidity_amount } =
      ClmmPoolUtil.estLiquidityAndCoinAmountFromOneAmounts(
        lowerTick,
        upperTick,
        coinAmount,
        isTokenA,
        roundUp,
        d(currentSlippage).toNumber(),
        new BN(curSqrtPrice)
      )
    console.log('🚀 ~ usePosAdd ~ coinAmountA:', coin_amount_a.toString())
    console.log('🚀 ~ usePosAdd ~ coinAmountB:', coin_amount_b.toString())

    const decimalsA = tokenA.decimals
    const decimalsB = tokenB.decimals

    return {
      coinAmountAOrigin: coin_amount_a.toString(),
      coinAmountBOrigin: coin_amount_b.toString(),
      displayCoinAmountA: !isReverse ? bnToAmount(coin_amount_a.toString(), decimalsA) : bnToAmount(coin_amount_b.toString(), decimalsB),
      displayCoinAmountB: !isReverse ? bnToAmount(coin_amount_b.toString(), decimalsB) : bnToAmount(coin_amount_a.toString(), decimalsA),
      coinAmountA: bnToAmount(coin_amount_a.toString(), decimalsA),
      coinAmountB: bnToAmount(coin_amount_b.toString(), decimalsB),
      tokenMaxA: coin_amount_limit_a.toString(),
      tokenMaxB: coin_amount_limit_b.toString(),
      liquidityAmount: liquidity_amount.toString()
    }
  }
  const getClmmCreateAddData = async (params: GetAddTsPayload) => {
    console.log('🚀🚀🚀 ~ usePosAdd.ts:83 ~ getClmmCreateAddData ~ getClmmCreateAddData:', getClmmCreateAddData)
    const {
      poolAddress,
      coinTypeA,
      coinTypeB,
      fixAmountA,
      amountA,
      amountB,
      lowerTick,
      upperTick,
      currentSqrtPrice,
      posType,
      rewarderCoinTypes,
      posIndex,
      posId,
      farmsPoolId,
      isAutoClaim
    } = params

    const createAddParams = {
      coin_type_a: coinTypeA,
      coin_type_b: coinTypeB,
      amount_a: amountA,
      amount_b: amountB,
      pool_id: poolAddress,
      fix_amount_a: fixAmountA,
      slippage: d(currentSlippage).toNumber(),
      is_open: !posIndex,
      tick_lower: lowerTick,
      tick_upper: upperTick,
      collect_fee: isAutoClaim ? (!posIndex ? false : true) : false,
      rewarder_coin_types: isAutoClaim ? rewarderCoinTypes : [],
      pos_id: posId || ''
    }

    const gasEstimateArg = {
      slippage: d(currentSlippage).toNumber(),
      cur_sqrt_price: new BN(currentSqrtPrice)
    }

    const tx = await clmmSdk!.Position.createAddLiquidityFixTokenPayload(createAddParams, gasEstimateArg)
    console.log('🚀🚀🚀 ~ usePosAdd.ts:123 ~ getClmmCreateAddData ~ tx:', tx)

    const msafeParams = {
      action: !posIndex ? MsafeTransactionSubType.OpenAndAddLiquidity : MsafeTransactionSubType.IncreaseLiquidity,
      txbParams: {
        parameter: createAddParams,
        gasEstimateArg
      }
    }
    console.log('🚀 ~ getClmmCreateAddData ~ msafeParams:', msafeParams, tx)

    return {
      tx,
      msafeParams
    }
  }

  const getFarmsCreateAddData = async (params: GetAddTsPayload) => {
    const {
      poolAddress,
      coinTypeA,
      coinTypeB,
      fixAmountA,
      amountA,
      amountB,
      lowerTick,
      upperTick,
      currentSqrtPrice,
      posType,
      rewarderCoinTypes,
      posIndex,
      posId,
      farmsPoolId,
      isAutoClaim
    } = params

    let tx: any
    let msafeParams: any
    if (posId) {
      const parameter = {
        pool_id: farmsPoolId || '',
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        position_nft_id: posId,
        clmm_pool_id: poolAddress,
        amount_a: amountA,
        amount_b: amountB,
        collect_fee: isAutoClaim,
        collect_rewarder: false,
        fix_amount_a: fixAmountA,
        clmm_rewarder_types: isAutoClaim ? rewarderCoinTypes : []
      }

      console.log('🚀 ~ getFarmsCreateAddData ~ parameter:', parameter)
      tx = await farmsSdk!.Farms.addLiquidityFixCoinPayload(parameter)

      msafeParams = {
        action: MsafeTransactionSubType.FarmingIncreaseLiquidity,
        txbParams: parameter
      }
    } else {
      const parameter = {
        pool_id: farmsPoolId || '',
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        clmm_pool_id: poolAddress,
        amount_a: amountA,
        amount_b: amountB,
        fix_amount_a: fixAmountA,
        tick_lower: lowerTick,
        tick_upper: upperTick
      }
      console.log('🚀 ~ getFarmsCreateAddData ~ parameter else:', parameter)

      tx = await farmsSdk!.Farms.openPositionAddLiquidityStakePayload(parameter)
      console.log('🚀 ~ getFarmsCreateAddData ~ tx:', tx)

      msafeParams = {
        action: MsafeTransactionSubType.FarmingOpenAndAddLiquidity,
        txbParams: parameter
      }
    }

    console.log('🚀 ~ getFarmsCreateAddData ~ msafeParams:', msafeParams, tx)

    return {
      tx,
      msafeParams
    }
  }

  // 获取创建添加，追加tx(clmm, farms)
  const getAddTsPayload = (params: GetAddTsPayload) => {
    console.log('🚀 ~ getAddTsPayload ~ params:', params)
    const { posType } = params

    if (posType === 'clmm') {
      return getClmmCreateAddData(params)
    } else {
      return getFarmsCreateAddData(params)
    }
  }

  return {
    preAdd,
    getAddTsPayload,
    getClmmCreateAddData,
    getFarmsCreateAddData
  }
}
