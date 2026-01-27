import { useSdk } from '@cetus/sdk-factory'
import { Token } from '@cetus/types'
import { Decimal, d } from '@cetus/utils'
import { toDecimalsAmount } from '@cetusprotocol/common-sdk'
import useDcaGetQuote from './useGetDcaQuote'
export type OpenDcaOrderParams = {
  in_coin: Token
  out_coin: Token
  in_coin_amount: number
  cycle_count: number
  min_price: number
  max_price: number
  freq: number
}
export default function () {
  const dcaSdk = useSdk('dca')
  const { getDcaQuote } = useDcaGetQuote()

  // Helper function: 计算单周期最大最小期望数量
  const calculateCycleAmounts = (
    inCoinAmount: number,
    cycleCount: number,
    inCoinDecimals: number,
    outCoinDecimals: number,
    minPrice: number,
    maxPrice: number
  ) => {
    const cycleCountAmount = d(toDecimalsAmount(inCoinAmount, inCoinDecimals)).div(cycleCount)

    const maxAmount = d(cycleCountAmount).div(d(minPrice))
    const minAmount = d(cycleCountAmount).div(d(maxPrice))

    let perCycleMinOutAmount: string, perCycleMaxOutAmount: string

    if (inCoinDecimals > outCoinDecimals) {
      const perCycleAmountDecimal = Decimal.pow(10, inCoinDecimals - outCoinDecimals)
      perCycleMinOutAmount = minAmount.div(perCycleAmountDecimal).ceil().toString()
      perCycleMaxOutAmount = maxAmount.div(perCycleAmountDecimal).ceil().toString()
    } else if (inCoinDecimals < outCoinDecimals) {
      const perCycleAmountDecimal = Decimal.pow(10, outCoinDecimals - inCoinDecimals)
      perCycleMinOutAmount = minAmount.mul(perCycleAmountDecimal).ceil().toString()
      perCycleMaxOutAmount = maxAmount.mul(perCycleAmountDecimal).ceil().toString()
    } else {
      perCycleMinOutAmount = minAmount.ceil().toString()
      perCycleMaxOutAmount = maxAmount.ceil().toString()
    }

    return { perCycleMinOutAmount, perCycleMaxOutAmount, cycleCountAmount }
  }

  // Helper function: 构造 DCA 参数
  const buildDcaOrderPayload = (params: OpenDcaOrderParams, quoteResult: any, perCycleMinOutAmount: string, perCycleMaxOutAmount: string) => {
    const { in_coin, in_coin_amount, freq, cycle_count, out_coin } = params

    return {
      in_coin_amount: String(toDecimalsAmount(in_coin_amount, in_coin.decimals)),
      in_coin_type: in_coin.coin_type,
      out_coin_type: out_coin.coin_type,
      cycle_frequency: freq,
      cycle_count,
      per_cycle_min_out_amount: perCycleMinOutAmount,
      per_cycle_max_out_amount: perCycleMaxOutAmount,
      per_cycle_in_amount_limit: quoteResult.amountInLimitPerCycle,
      fee_rate: quoteResult.feeRate,
      timestamp: quoteResult.timestamp,
      signature: quoteResult.signature
    }
  }

  // Main function
  const openDcaOrder = async (params: OpenDcaOrderParams) => {
    const { in_coin, out_coin, in_coin_amount, cycle_count, min_price, max_price, freq } = params

    // Step 1: 获取报价
    const sender = (await dcaSdk!.getSenderAddress()) || '0x0000000000000000000000000000000000000000000000000000000000000000'
    const quoteResult = await getDcaQuote({ inCoin: in_coin.coin_type, freq, count: cycle_count, sender })
    if (!quoteResult) {
      throw new Error('Request timed out')
    }

    // Step 2: 计算单周期金额
    const { perCycleMinOutAmount, perCycleMaxOutAmount } = calculateCycleAmounts(
      in_coin_amount,
      cycle_count,
      in_coin.decimals,
      out_coin.decimals,
      min_price,
      max_price
    )

    // Step 3: 构造 DCA 开单参数
    const dcaOpenOrderPayloadParams = buildDcaOrderPayload(params, quoteResult, perCycleMinOutAmount, perCycleMaxOutAmount)
    console.log('🚀🚀🚀 ~ file: useOpenDcaOrder.ts:91 ~ openDcaOrder ~ dcaOpenOrderPayloadParams:', dcaOpenOrderPayloadParams)

    // Step 4: 调用 SDK 提交订单
    const tx = await dcaSdk!.Dca.dcaOpenOrderPayload(dcaOpenOrderPayloadParams)
    console.log('🚀🚀🚀 ~ file: useOpenDcaOrder.ts:55 ~ openDcaOrder ~ tx:', tx)
    return tx
  }

  return { openDcaOrder }
}
