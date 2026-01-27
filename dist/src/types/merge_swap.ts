import { Token } from '@cetus/types'
import { MergeSwapRouterData } from '@cetusprotocol/aggregator-sdk'

export const MergeSwapMaxOutValue = 10000

export type MergeSwapQuote = {
  data?: MergeSwapRouterData
  uuid: string
  totalAmountOut: string
  totalAmountOutDisplay: string
  fromTokenList: Token[]
  toToken: Token
  fromAmountObj: Record<string, string>
  error?: {
    code: number
    msg: string
    coin?: Token
  }
}
