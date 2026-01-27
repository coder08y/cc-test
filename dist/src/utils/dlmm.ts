import { ChartBinItem, DlmmPosBaseInfo } from '@/types/dlmm'
import { Token } from '@cetus/types'
import { bnToAmount, d, formatPrice, formatTickPrice, removeComma } from '@cetus/utils'
import { BinAmount, BinLiquidityInfo, BinUtils } from '@cetusprotocol/dlmm-sdk'
import { getRates } from './clmm'
import { getReversePrice } from './pool'

export const defaultBinsNum = 50
export const getRelatedDisplayPrice = (price: string) => {
  const displayPrice = price === '∞' ? '∞' : formatTickPrice(removeComma(price), 6) + ''
  const reversePrice = getReversePrice(removeComma(price)) + ''
  const displayReversePrice = reversePrice === '∞' ? '∞' : formatTickPrice(reversePrice, 6) + ''
  return [displayPrice, reversePrice, displayReversePrice]
}

/**
 *  和useDlmmPosChart 中 计算保持一致
 * @param price
 * @returns
 */
export const getRelatedDisplayChartPrice = (price: string) => {
  const displayPrice = price === '∞' ? '∞' : formatPrice(removeComma(price)) + ''
  const reversePrice = getReversePrice(removeComma(price)) + ''
  const displayReversePrice = reversePrice === '∞' ? '∞' : formatPrice(reversePrice) + ''
  return [displayPrice, reversePrice, displayReversePrice]
}

export const formatBinPriceFromLamport = (priceLamport: string, baseDecimal: number, quoteDecimal: number) => {
  return String(BinUtils.getPriceFromLamport(baseDecimal, quoteDecimal, priceLamport))
}

export const formatPriceFromBin = (bin: number, binStep: number, baseDecimal: number, quoteDecimal: number) => {
  return String(BinUtils.getPriceFromBinId(bin, binStep, baseDecimal, quoteDecimal))
}

export const formatBinList = (
  bins: BinAmount[],
  baseToken: Token,
  quoteToken: Token,
  direct = true,
  activeBin?: number,
  binStep?: number
): {
  list: ChartBinItem[]
  max: number
} => {
  let max = 0
  const noRadius = bins?.length > 150
  const baseDecimal = baseToken?.decimals
  const quoteDecimal = quoteToken?.decimals
  const res = bins?.map((item: BinAmount) => {
    const liquidity = d(item?.liquidity)?.div(Math.pow(10, 10)).toNumber()
    const price = removeComma(formatBinPriceFromLamport(item.price_per_lamport, baseDecimal, quoteDecimal))
    const baseAmount = bnToAmount(item?.amount_a, baseDecimal)
    const quoteAmount = bnToAmount(item?.amount_b, quoteDecimal)
    let quantityA
    let quantityB
    if (item?.bin_id === activeBin) {
      const total = d(baseAmount || 0)
        .mul(price || 0)
        .add(quoteAmount || 0)
      quantityA = d(baseAmount || 0)
        .mul(price || 0)
        .div(total)
        .toString()
      quantityB = d(quoteAmount || 0)
        .div(total)
        .toString()
    }

    max = Math.max(max, liquidity)

    return {
      ...item,
      liquidity,
      price: direct || direct === undefined ? price : d(1).div(price).toString(),
      priceOrigin: direct || direct === undefined ? Number(price) : Number(d(1).div(price).toString()),
      baseSymbol: baseToken?.symbol,
      quoteSymbol: quoteToken?.symbol,
      baseAmount,
      quoteAmount,
      quantityA,
      quantityB,
      noRadius
    }
  })

  if (activeBin !== undefined && binStep !== undefined && res?.[0]?.bin_id > activeBin) {
    const price = formatPriceFromBin(activeBin, binStep, baseDecimal, quoteDecimal)
    res.unshift({
      // ...sortList?.[0],
      bin_id: activeBin,
      price: direct || direct === undefined ? price : d(1).div(price).toString(),
      priceOrigin: direct || direct === undefined ? Number(price) : Number(d(1).div(price).toString()),
      liquidity: undefined
    })
  }

  if (activeBin !== undefined && binStep !== undefined && res?.[res?.length - 1]?.bin_id < activeBin) {
    const price = formatPriceFromBin(activeBin, binStep, baseDecimal, quoteDecimal)
    res.push({
      // ...sortList?.[sortList?.length - 1],
      bin_id: activeBin,
      price: direct || direct === undefined ? price : d(1).div(price).toString(),
      priceOrigin: direct || direct === undefined ? Number(price) : Number(d(1).div(price).toString()),
      liquidity: undefined
    })
  }

  const sortList = res.sort((a, b) => a?.priceOrigin - b?.priceOrigin)
  return {
    list: [...sortList],
    max: d(max).toNumber()
  }
}

// export const getMaxBinRangeData = ({
//   activeBin,
//   allBins,
//   binStep,
//   baseToken,
//   quoteToken,
//   maxBinsLength = 69,
//   direct = true,
//   maxBin,
//   minBin
// }: {
//   activeBin: number
//   allBins: Record<string, ChartBinItem>
//   binStep: number
//   baseToken: Token
//   quoteToken: Token
//   maxBinsLength?: number
//   direct?: boolean
//   maxBin?: number,
//   minBin?: number
// }) => {
//   let i = activeBin
//   const list: ChartBinItem[] = []
//   const half = d(maxBinsLength).sub(1).div(2).toNumber()
//   const minBinNum = minBin !== undefined && activeBin - minBin > half ? minBin : activeBin - half
//   let max1 = 0
//   while (i >= minBinNum) {
//     const item = allBins?.[String(i)]
//     const price = formatPriceFromBin(i, binStep, baseToken?.decimals, quoteToken?.decimals)
//     const liquidity = d(item?.liquidity || '0')
//       .div(Math.pow(10, 10))
//       .toNumber()
//     list.push({
//       amount_a: item?.amount_a || '0',
//       amount_b: item?.amount_b || '0',
//       bin_id: i,
//       liquidity,
//       price: formatNumberWithDown(direct ? price : d(1).div(price).toString(), 6),
//       price_per_lamport: item?.price_per_lamport || '',
//       baseSymbol: baseToken?.symbol,
//       quoteSymbol: quoteToken?.symbol,
//       baseAmount: bnToAmount(item?.amount_a, baseToken?.decimals),
//       quoteAmount: bnToAmount(item?.amount_b, quoteToken?.decimals)
//     })
//     max1 = Math.max(max1, liquidity)
//     i--
//   }

//   let j = activeBin
//   const maxBinNum = maxBin !== undefined && maxBin - activeBin > half ? maxBin : activeBin + half
//   let max2 = 0
//   while (j < maxBinNum) {
//     j++
//     const item = allBins?.[String(j)]
//     const price = formatPriceFromBin(j, binStep, baseToken?.decimals, quoteToken?.decimals)
//     const liquidity = d(item?.liquidity || '0')
//       .div(Math.pow(10, 10))
//       .toNumber()
//     list.push({
//       amount_a: item?.amount_a || '0',
//       amount_b: item?.amount_b || '0',
//       bin_id: j,
//       liquidity,
//       price: formatNumberWithDown(direct ? price : d(1).div(price).toString(), 6),
//       price_per_lamport: item?.price_per_lamport || '',
//       baseSymbol: baseToken?.symbol,
//       quoteSymbol: quoteToken?.symbol,
//       baseAmount: bnToAmount(item?.amount_a, baseToken?.decimals),
//       quoteAmount: bnToAmount(item?.amount_b, quoteToken?.decimals)
//     })
//     max2 = Math.max(max2, liquidity)
//   }

//   const sortList = list.sort((a: ChartBinItem, b: ChartBinItem) => a.price - b.price)

//   return {
//     list: sortList,
//     max: Math.max(max1, max2)
//   }
// }

export const getMaxBinRangeData = ({
  activeBin,
  allBins,
  binStep,
  baseToken,
  quoteToken,
  maxBinsLength = 49,
  direct = true,
  maxBin,
  minBin
}: {
  activeBin: number
  allBins: Record<string, ChartBinItem>
  binStep: number
  baseToken: Token
  quoteToken: Token
  maxBinsLength?: number
  direct?: boolean
  maxBin?: number
  minBin?: number
}) => {
  const half = d(maxBinsLength).sub(1).div(2).toNumber()
  const minBinNum = minBin !== undefined && activeBin - minBin > half ? minBin : activeBin - half
  const maxBinNum = maxBin !== undefined && maxBin - activeBin > half ? maxBin : activeBin + half

  const createBinItem = (binId: number): ChartBinItem => {
    const item = allBins?.[String(binId)]
    const price = removeComma(formatPriceFromBin(binId, binStep, baseToken?.decimals, quoteToken?.decimals))
    console.log('🚀 ~ createBinItem ~ item:', item)
    const liquidity = item?.liquidity && d(item?.liquidity).gt('0') ? d(item?.liquidity).div(Math.pow(10, 10)).toNumber() : 0

    const baseAmount = bnToAmount(item?.amount_a, baseToken?.decimals)
    const quoteAmount = bnToAmount(item?.amount_b, quoteToken?.decimals)

    let quantityA
    let quantityB
    if (item?.bin_id === activeBin) {
      const total = d(baseAmount || 0)
        .mul(price || 0)
        .add(quoteAmount || 0)
      quantityA = d(baseAmount || 0)
        .mul(price || 0)
        .div(total)
        .toString()
      quantityB = d(quoteAmount || 0)
        .div(total)
        .toString()
    }
    return {
      amount_a: item?.amount_a || '0',
      amount_b: item?.amount_b || '0',
      bin_id: binId,
      liquidity,
      // price: formatNumberWithDown(direct ? price : d(1).div(price).toString(), 6),
      price: direct ? price : d(1).div(price).toString(),
      priceOrigin: direct ? Number(price) : Number(d(1).div(price).toString()),
      price_per_lamport: item?.price_per_lamport || '',
      baseSymbol: baseToken?.symbol,
      quoteSymbol: quoteToken?.symbol,
      baseLogo: baseToken?.logo_url,
      quoteLogo: quoteToken?.logo_url,
      baseAmount,
      quoteAmount,
      quantityA,
      quantityB
    }
  }

  // Process bins below activeBin
  let i = activeBin
  let active
  let max1 = 0
  const lowerBins: ChartBinItem[] = []
  while (i >= minBinNum) {
    const binItem = createBinItem(i)
    if (i === activeBin) {
      active = binItem
    }
    lowerBins.push(binItem)
    max1 = binItem?.liquidity ? Math.max(max1, Number(binItem.liquidity)) : max1
    i--
  }

  // Process bins above activeBin
  let j = activeBin
  let max2 = 0
  const upperBins: ChartBinItem[] = []
  while (j < maxBinNum) {
    j++
    const binItem = createBinItem(j)
    if (j === activeBin) {
      active = binItem
    }
    upperBins.push(binItem)
    max2 = Math.max(max2, binItem.liquidity)
  }

  const combinedList = [...lowerBins, ...upperBins]
  const sortList = combinedList.sort((a, b) => Number(a.priceOrigin) - Number(b.priceOrigin))
  return {
    list: sortList,
    max: Math.max(max1, max2),
    active
  }
}

export const getBaseFeeList = (list: any[]) => {
  if (list?.length > 0) {
    const data = list?.map(item => ({
      binStep: item?.binStep,
      feeDisplay: item?.feeDisplay,
      feeRate: item?.feeRate,
      poolAddress: item?.poolAddress,
      tvl: item?.tvl === '--' ? '0' : item?.tvl,
      fee: item.fee
    }))
    const total = data?.reduce((sum, current) => d(sum).plus(current.tvl as string), d(0)).toString()
    if (d(total).gt(0)) {
      let rates = []
      rates = data?.map(item => {
        const rate = d(item?.tvl as string)
          .div(total)
          .mul(100)
          .toString()
        return rate
      })
      return getRates(data, rates, false)
    }
    if (d(total).eq(0)) {
      return data?.map((item, index) => {
        const rateValue = '0% select'
        return {
          ...item,
          title: rateValue
        }
      })
    }
    if (data.length === 1) {
      return data?.map((item, index) => {
        const rateValue = '100% select'
        return {
          ...item,
          title: rateValue
        }
      })
    }
  }
  return []
}

export function spitClaimDlmmPosList(positionBaseList: DlmmPosBaseInfo[], maxBinCount: number) {
  const batches: DlmmPosBaseInfo[][] = []
  let currentBatch: DlmmPosBaseInfo[] = []
  let currentBatchBinCount = 0

  positionBaseList.forEach(position => {
    const positionBinCount = position.liquidityShares?.length || 0

    // 如果当前仓位加入后会超过900，先保存当前批次，然后开始新批次
    if (currentBatchBinCount + positionBinCount > maxBinCount && currentBatch.length > 0) {
      console.log('🚀 ~ getDlmmPosFeeAndReward ~ currentBatchBinCount 1:', {
        currentBatchBinCount,
        currentBatch
      })
      batches.push([...currentBatch])
      currentBatch = []
      currentBatchBinCount = 0
    }

    // 添加当前仓位到批次中
    currentBatch.push(position)

    currentBatchBinCount += positionBinCount
  })

  // 添加最后一个批次
  if (currentBatch.length > 0) {
    console.log('🚀 ~ getDlmmPosFeeAndReward ~ currentBatchBinCount 2:', {
      currentBatchBinCount,
      currentBatch
    })
    batches.push(currentBatch)
  }

  console.log('🚀 ~ getDlmmPosFeeAndReward ~ batches:', batches, 'totalBatches:', batches.length)

  return batches
}

export function getBatchBinInfo(bins: BinAmount[], index: number, batchSize: number) {
  const startIndex = index * batchSize
  const endIndex = Math.min(startIndex + batchSize, bins.length)
  const batchBins = bins.slice(startIndex, endIndex)

  const batchBinInfo: BinLiquidityInfo = {
    bins: batchBins,
    amount_a: batchBins.reduce((sum, bin) => d(sum).add(d(bin.amount_a)).toFixed(0), '0'),
    amount_b: batchBins.reduce((sum, bin) => d(sum).add(d(bin.amount_b)).toFixed(0), '0')
  }
  return batchBinInfo
}

export function getDlmmZapTipsError(zapAmountValue: string) {
  if (d(zapAmountValue).gt(50000)) {
    return 'In Zap mode, each request should be within $50,000.'
  }
  if (d(zapAmountValue).lt(0.0001)) {
    return 'The input is too small. Zap mode is not available.'
  }
  return undefined
}
