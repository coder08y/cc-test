import { defaultBinsNum, getRelatedDisplayPrice } from '@/utils/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { d, formatPrice } from '@cetus/utils'
import { BinAmount, BinUtils, StrategyType } from '@cetusprotocol/dlmm-sdk'
import { PriceDataType } from '../create-pool/useCreateDLMMPool'

function useCreatePriceBin() {
  const dlmmSdk = useSdk('dlmm')

  const getQuickBinPriceRange = (bin_step: number, active_id: number, decimals_a: number, decimals_b: number, half: number) => {
    const lower_bin_id = active_id - half
    const upper_bin_id = active_id + half
    const lower_price = BinUtils.getPriceFromBinId(lower_bin_id, bin_step, decimals_a, decimals_b)
    const upper_price = BinUtils.getPriceFromBinId(upper_bin_id, bin_step, decimals_a, decimals_b)
    return {
      lower_bin_id,
      upper_bin_id,
      lower_price,
      upper_price
    }
  }

  const getDefaultBinPriceAndId = (bin_step: number, active_id: number, decimals_a: number, decimals_b: number) => {
    const half = d(defaultBinsNum).sub(2).div(2).toNumber()
    return getQuickBinPriceRange(bin_step, active_id, decimals_a, decimals_b, half)
  }

  const handleActionBinPrice = (price: PriceDataType, bin_step: number, decimals_a: number, decimals_b: number, action: 'Add' | 'Sub' = 'Add') => {
    const active_id = price?.binId

    if (action === 'Sub') {
      const bin_id = active_id - 1
      const price = BinUtils.getPriceFromBinId(bin_id, bin_step, decimals_a, decimals_b)
      return {
        bin_id,
        price
      }
    } else {
      const bin_id = active_id + 1
      const price = BinUtils.getPriceFromBinId(bin_id, bin_step, decimals_a, decimals_b)
      return {
        bin_id,
        price
      }
    }
  }

  const getBinInfosByAutoFill = async ({
    input_amount,
    bin_step,
    strategy_type,
    lower_bin_id,
    upper_bin_id,
    fix_amount_a,
    active_id,
    amount_in_active_bin,
    pool_id
  }: {
    input_amount: string
    bin_step: number
    active_id: number
    strategy_type: StrategyType
    lower_bin_id: number
    upper_bin_id: number
    fix_amount_a: boolean
    pool_id: string
    amount_in_active_bin?: BinAmount
  }) => {
    try {
      const bin_infos = await dlmmSdk?.Position.calculateAddLiquidityInfo({
        active_id,
        bin_step,
        lower_bin_id,
        upper_bin_id,
        // amount_a_in_active_bin: amount_in_active_bin?.amount_a || '0',
        // amount_b_in_active_bin: amount_in_active_bin?.amount_b || '0',
        active_bin_of_pool: amount_in_active_bin,
        strategy_type,
        coin_amount: input_amount,
        fix_amount_a,
        pool_id
      })
      return bin_infos
    } catch (error) {
      console.log('getBinInfosByAutoFill', error)
      throw error
    }
  }

  const getBinInfosByBothAmount = async ({
    amount_a,
    amount_b,
    bin_step,
    strategy_type,
    lower_bin_id,
    upper_bin_id,
    active_id,
    amount_in_active_bin,
    pool_id
  }: {
    amount_a: string
    amount_b: string
    bin_step: number
    active_id: number
    strategy_type: StrategyType
    lower_bin_id: number
    upper_bin_id: number
    pool_id: string
    amount_in_active_bin?: BinAmount
  }) => {
    console.log(
      {
        amount_a,
        amount_b,
        active_id,
        bin_step,
        lower_bin_id,
        upper_bin_id,
        amount_a_in_active_bin: amount_in_active_bin?.amount_a || '0',
        amount_b_in_active_bin: amount_in_active_bin?.amount_b || '0',
        strategy_type
      },
      'calculateAddLiquidityInfo'
    )
    try {
      const bin_infos = await dlmmSdk?.Position.calculateAddLiquidityInfo({
        amount_a,
        amount_b,
        active_id,
        bin_step,
        lower_bin_id,
        upper_bin_id,
        // amount_a_in_active_bin: amount_in_active_bin?.amount_a || '0',
        // amount_b_in_active_bin: amount_in_active_bin?.amount_b || '0',
        strategy_type,
        active_bin_of_pool: amount_in_active_bin,
        pool_id
      })
      console.log(bin_infos, 'calculateAddLiquidityInfo')
      return bin_infos
    } catch (error) {
      throw error
    }
  }

  const getNumBins = (lower_bin_id: number, upper_bin_id: number) => {
    const gap = upper_bin_id - lower_bin_id
    return d(gap).plus(1).toNumber()
  }

  const getPriceDataFromBinId = (binId: number, bin_step: number, decimals_a: number, decimals_b: number) => {
    const price = BinUtils.getPriceFromBinId(binId, bin_step, decimals_a, decimals_b)
    const price_format = formatPrice(price)
    const [displayPrice, reversePrice, displayReversePrice] = getRelatedDisplayPrice(price_format)
    return [displayPrice, reversePrice, displayReversePrice]
  }

  return {
    getQuickBinPriceRange,
    getDefaultBinPriceAndId,
    handleActionBinPrice,
    getBinInfosByAutoFill,
    getBinInfosByBothAmount,
    getNumBins,
    getPriceDataFromBinId
  }
}

export default useCreatePriceBin
