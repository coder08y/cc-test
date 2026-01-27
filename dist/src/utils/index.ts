import { Token } from '@cetus/types'
import { addComma, d } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
export const isMenuActive = (
  menu: { path: string; children?: { [key: string]: string; path: string }[]; [key: string]: any },
  pathname: string
): boolean => {
  return pathname.startsWith(menu.path) || (!!menu.children && menu.children.some(child => isMenuActive(child, pathname)))
}

export const getPercentage = (value: string | number) => {
  return `${d(value).mul(100).toString()}%`
}

export const isTrustedToken = (token?: Token, whiteTokenList?: Token[]) => {
  if (!token) return false
  if (token && !whiteTokenList) {
    return !!(token?.is_verified === undefined ? token?.is_trusted : token?.is_verified)
  }
  return !!whiteTokenList?.find(
    item => extractStructTagFromType(item?.coin_type)?.full_address === extractStructTagFromType(token?.coin_type || '')?.full_address
  )
}

export const formatDescription = (amount: string, tokenSymbol?: string) => {
  return d(amount).gt(0) ? `${addComma(amount)} ${tokenSymbol}` : ''
}

export const isDecimalWithZeros = (value: string): boolean => {
  return value === '0.' || !value.match(/^[0-20]*\.0*$/)
}
