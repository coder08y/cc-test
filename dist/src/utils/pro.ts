import { suiPriorityConfigs } from '@/constant/sui-priority'
import { Token } from '@cetus/types'
import { formatNumber } from '@cetus/utils'

export function getHighWeightToken(tokenA: Token, tokenB: Token): Token {
  const coinAWeight = suiPriorityConfigs[tokenA!.coin_type]
  const coinBWeight = suiPriorityConfigs[tokenB!.coin_type]

  if (coinAWeight === undefined && coinBWeight === undefined) {
    return tokenB
  }

  if (coinAWeight !== undefined && coinBWeight === undefined) {
    return tokenB
  }

  if (coinAWeight === undefined && coinBWeight !== undefined) {
    return tokenA
  }

  // 权重越小，越靠前
  if (coinAWeight < coinBWeight) {
    return tokenA
  }

  return tokenB
}

// 获取trades amount的符号，正号或者负号
export const getTradesAmountSymbol = (type: string, value: string, index: number, decimals: number) => {
  if (type === 'buy' || type === 'sell') {
    if (index === 0) {
      return Number(value) ? `-${formatNumber(value)}` : `-<${decimals > 9 ? Math.pow(10, -decimals) : '0.000001'}`
    } else {
      return Number(value) ? `+${formatNumber(value)}` : `+<${decimals > 9 ? Math.pow(10, -decimals) : '0.000001'}`
    }
  }
  return Number(value) ? `${formatNumber(value)}` : `<${decimals > 9 ? Math.pow(10, -decimals) : '0.000001'}`
}
