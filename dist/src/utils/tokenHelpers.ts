import { fixCoinType } from '@cetusprotocol/common-sdk'

/**
 * Check if two tokens are the same by comparing their coin types
 */
export function isSameToken(tokenA: any, tokenB: any): boolean {
  if (!tokenA || !tokenB) return false
  return fixCoinType(tokenA.coin_type || '') === fixCoinType(tokenB.coin_type || '')
}

/**
 * Generate trading page route path
 */
export function generateTradingPath(page: 'swap' | 'limit' | 'dca', tokenA: string, tokenB: string): string {
  return `/${page}/${tokenA}/${tokenB}`
}

/**
 * Determine which token to set based on Pro mode tab and selected item
 * Returns: { shouldToggleDirect: boolean, targetToken: any, navigationPath?: string }
 */
export function determineTokenChange(params: {
  selectedItem: any
  currentTab: 'Buy' | 'Sell' | string
  tokenA: any
  tokenB: any
  page: 'swap' | 'limit' | 'dca'
}): {
  shouldToggleDirect: boolean
  targetToken: any
  navigationPath?: string
} {
  const { selectedItem, currentTab, tokenA, tokenB, page } = params

  if (currentTab === 'Buy') {
    // Buy mode: selecting tokenB (quote token)
    if (isSameToken(selectedItem, tokenA)) {
      // Selected item is same as tokenA, swap them
      return {
        shouldToggleDirect: true,
        targetToken: tokenB,
        navigationPath: generateTradingPath(page, tokenB?.coin_type, selectedItem?.coin_type)
      }
    } else if (isSameToken(selectedItem, tokenB)) {
      // Selected item is same as tokenB, no navigation needed
      return {
        shouldToggleDirect: false,
        targetToken: tokenA
      }
    } else {
      // New token selected
      return {
        shouldToggleDirect: false,
        targetToken: tokenA,
        navigationPath: generateTradingPath(page, tokenA?.coin_type, selectedItem?.coin_type)
      }
    }
  } else {
    // Sell mode: selecting tokenA (base token)
    if (isSameToken(selectedItem, tokenB)) {
      // Selected item is same as tokenB, swap them
      return {
        shouldToggleDirect: true,
        targetToken: tokenA,
        navigationPath: generateTradingPath(page, selectedItem?.coin_type, tokenA?.coin_type)
      }
    } else if (isSameToken(selectedItem, tokenA)) {
      // Selected item is same as tokenA, no navigation needed
      return {
        shouldToggleDirect: false,
        targetToken: tokenB
      }
    } else {
      // New token selected
      return {
        shouldToggleDirect: false,
        targetToken: tokenB,
        navigationPath: generateTradingPath(page, selectedItem?.coin_type, tokenB?.coin_type)
      }
    }
  }
}

/**
 * Determine which token should be toggled when direction changes
 */
export function determineToggleTokens(params: {
  showTokenInfo: any
  tokenA: any
  tokenB: any
}): {
  newShowToken: any
  newAnotherToken: any
} {
  const { showTokenInfo, tokenA, tokenB } = params

  if (showTokenInfo && isSameToken(showTokenInfo, tokenA)) {
    return {
      newShowToken: tokenB,
      newAnotherToken: tokenA
    }
  } else {
    return {
      newShowToken: tokenA,
      newAnotherToken: tokenB
    }
  }
}
