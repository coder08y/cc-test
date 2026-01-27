import { d, formatNumber } from '@cetus/utils'

function useGetLeverage() {
  const getLeverage = (minPrice?: string | number, maxPrice?: string | number) => {
    if (minPrice && maxPrice) {
      if (minPrice !== '0' && maxPrice !== '∞') {
        return formatNumber(1 / (1 - Number(d(minPrice).div(maxPrice).toNumber() ** 0.25)), 2) + 'x'
      } else {
        return '1x'
      }
    }

    return '1x'
  }
  return {
    getLeverage
  }
}

export default useGetLeverage
