import { PoolApiInfo } from '@/types'
import { d, fixDown, fixRounding } from '@cetus/utils'

export const getFeeTierList = (list: Partial<PoolApiInfo>[]) => {
  if (list?.length) {
    const data = list?.map(item => ({
      feeDisplay: item?.feeDisplay,
      feeRate: item?.feeRate,
      poolAddress: item?.poolAddress,
      tickSpacing: item.tickSpacing,
      fee: item.fee,
      tvl: item?.tvl === '--' ? '0' : item?.tvl,
      liquidity: item?.object?.liquidity === '--' ? '0' : item?.object?.liquidity
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
      return getRates(data, rates)
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

    const liquidityTotal = data?.reduce((sum, current) => d(sum).plus((current?.liquidity || '0') as string), d(0)).toString()
    let rates = []
    if (d(liquidityTotal).gt(0)) {
      rates = data?.map(item => {
        const rate = d(item?.liquidity as string)
          .div(liquidityTotal)
          .mul(100)
          .toString()
        return rate
      })
      return getRates(data, rates)
    } else {
      rates = data?.map(item => {
        return 0
      })
      return getRates(data, rates)
    }
  } else {
    return []
  }
}

export const getRates = (data: any[], rates: any[], dealZero = true) => {
  const hasExtremelySmallNumber = rates?.some(item => d(item).lt(0.01) && d(item).gt(0))
  const zeroNum = rates?.filter(item => d(item).eq(0)).length
  let zeroCount = zeroNum
  if (hasExtremelySmallNumber) {
    rates = rates.map(rate => {
      if (d(rate).gte(0.01)) {
        return fixDown(rate, 2)
      } else {
        return rate
      }
    })
  } else {
    rates = rates.map(rate => {
      return fixRounding(rate, 2)
    })
  }
  if (zeroNum > 0 && dealZero) {
    rates = rates.map(rate => {
      if (d(rate).gte(0) && d(rate).lt(0.02)) {
        return rate
      } else {
        if (zeroCount > 0) {
          zeroCount--
          return d(rate).sub('0.01').toString()
        }
        return rate
      }
    })
  }
  return data?.map((item, index) => {
    const rate = rates[index]
    const rateValue = d(rate).gt(0) && d(rate).lt(0.01) ? '<0.01 % select' : rate + '% select'
    return {
      ...item,
      title: rateValue
    }
  })
}

export const getRangeChartGap = (brushDomain: any) => {
  const rangeGap = d(brushDomain[1]).minus(brushDomain[0]).abs()
  let brushDomainGap = rangeGap
  if (d(brushDomain[0]).lte('0')) return brushDomainGap.toString()
  while (d(brushDomain[0]).minus(brushDomainGap).lt('0')) {
    brushDomainGap = brushDomainGap.mul(0.8)
    if (brushDomainGap.lte(rangeGap.div(10))) break
  }

  return brushDomainGap.toString()
}
