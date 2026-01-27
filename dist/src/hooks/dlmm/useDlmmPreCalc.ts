import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { Token } from '@cetus/types'
import { bnToAmount, d } from '@cetus/utils'
import { StrategyType } from '@cetusprotocol/dlmm-sdk'
import useCreatePriceBin from './useCreatePriceBin'

type AutoPreAddType = {
  amount: string
  tokenA: Token
  tokenB: Token
  activeId: number
  currentBinStep: number
  lowerBinId: number
  upperBinId: number
  strategy: StrategyType
  isReverse: boolean
  fixAmountA: boolean
  pool?: any
  uuid: string
}

type NotAutoPreAddType = {
  coinAmountA: string
  coinAmountB: string
  activeId: number
  currentBinStep: number
  lowerBinId: number
  upperBinId: number
  strategyType: StrategyType
  tokenA: Token
  tokenB: Token
  isReverse: boolean
  pool?: any
  uuid: string
}

function useDlmmPreCalc() {
  const { getBinInfosByAutoFill, getBinInfosByBothAmount } = useCreatePriceBin()
  const { getTokenAmountValue } = useTokenPrice()
  const dlmmSdk = useSdk('dlmm')
  const { setPreCalcParams } = useAddDlmmLiquidityStore()
  const { activeBin } = useDlmmLiquidityStore()
  const handleAutoFillPreAdd = async ({
    amount,
    tokenA,
    tokenB,
    currentBinStep,
    strategy,
    isReverse,
    fixAmountA,
    lowerBinId,
    upperBinId,
    activeId,
    pool,
    uuid
  }: AutoPreAddType) => {
    const decimalsA = tokenA.decimals
    const decimalsB = tokenB.decimals
    let amount_in_active_bin

    if (pool) {
      amount_in_active_bin =
        activeBin ||
        (await dlmmSdk?.Position?.getActiveBinIfInRange(pool?.bin_manager.bin_manager_handle, lowerBinId, upperBinId, activeId, currentBinStep, true))
    }

    const params = {
      input_amount: amount,
      bin_step: currentBinStep,
      strategy_type: strategy,
      lower_bin_id: lowerBinId,
      upper_bin_id: upperBinId,
      fix_amount_a: fixAmountA,
      active_id: activeId,
      amount_in_active_bin,
      pool_id: pool?.id
    }

    const binInfos = await getBinInfosByAutoFill(params)
    setPreCalcParams({
      autoFill: params
    })

    if (binInfos) {
      const { bins, amount_a, amount_b } = binInfos
      console.log(tokenA, tokenB, 'tokenA, tokenB')
      const coinAmountA = bnToAmount(amount_a.toString(), decimalsA)
      const coinAmountB = bnToAmount(amount_b.toString(), decimalsB)
      const _AmountAValue = getTokenAmountValue(tokenA?.coin_type, coinAmountA)
      const _AmountBValue = getTokenAmountValue(tokenB?.coin_type, coinAmountB)
      const _totalAmountValue = d(_AmountAValue).plus(_AmountBValue).toString()
      return {
        uuid,
        coinAmountAOrigin: amount_a.toString(),
        coinAmountBOrigin: amount_b.toString(),
        displayCoinAmountA: !isReverse ? bnToAmount(amount_a.toString(), decimalsA) : bnToAmount(amount_b.toString(), decimalsB),
        displayCoinAmountB: !isReverse ? bnToAmount(amount_b.toString(), decimalsB) : bnToAmount(amount_a.toString(), decimalsA),
        coinAmountA,
        coinAmountB,
        totalAmount: _totalAmountValue,
        binInfos
      }
    }
  }

  const handleNotAutoFillPreAdd = async ({
    coinAmountA,
    coinAmountB,
    currentBinStep,
    tokenA,
    tokenB,
    lowerBinId,
    upperBinId,
    strategyType,
    activeId,
    isReverse,
    pool,
    uuid
  }: NotAutoPreAddType) => {
    const decimalsA = tokenA?.decimals
    const decimalsB = tokenB?.decimals
    let amount_in_active_bin
    if (pool) {
      amount_in_active_bin =
        activeBin ||
        (await dlmmSdk?.Position?.getActiveBinIfInRange(pool?.bin_manager.bin_manager_handle, lowerBinId, upperBinId, activeId, currentBinStep, true))
    }

    const params = {
      amount_a: coinAmountA,
      amount_b: coinAmountB,
      bin_step: currentBinStep,
      active_id: activeId,
      strategy_type: strategyType,
      lower_bin_id: lowerBinId,
      upper_bin_id: upperBinId,
      amount_in_active_bin,
      pool_id: pool?.id
    }

    const binInfos = await getBinInfosByBothAmount(params)

    setPreCalcParams({
      notAutoFill: params
    })

    if (binInfos) {
      const { bins, amount_a, amount_b } = binInfos
      const _AmountAValue = getTokenAmountValue(tokenA?.coin_type, bnToAmount(amount_a.toString(), decimalsA))
      const _AmountBValue = getTokenAmountValue(tokenB?.coin_type, bnToAmount(amount_b.toString(), decimalsB))
      const _totalAmountValue = d(_AmountAValue).plus(_AmountBValue).toString()
      return {
        uuid,
        coinAmountAOrigin: amount_a.toString(),
        coinAmountBOrigin: amount_b.toString(),
        displayCoinAmountA: !isReverse ? bnToAmount(amount_a.toString(), decimalsA) : bnToAmount(amount_b.toString(), decimalsB),
        displayCoinAmountB: !isReverse ? bnToAmount(amount_b.toString(), decimalsB) : bnToAmount(amount_a.toString(), decimalsA),
        coinAmountA: bnToAmount(amount_a.toString(), decimalsA),
        coinAmountB: bnToAmount(amount_b.toString(), decimalsB),
        totalAmount: _totalAmountValue,
        binInfos
      }
    }
  }

  return { handleAutoFillPreAdd, handleNotAutoFillPreAdd }
}

export default useDlmmPreCalc
