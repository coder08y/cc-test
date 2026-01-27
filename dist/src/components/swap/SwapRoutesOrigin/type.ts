import { AggregatorProvider, SwapRouterFormat } from '@/types'
import { Token } from '@cetus/types'

export interface RoutesProps {
  fromToken?: Token
  toToken?: Token
  fromAmount?: string
  toAmount?: string
  loading?: boolean
  routes:
    | {
        paths: {
          fromToken: Token | undefined
          toToken: Token | undefined
          from_type: string
          to_type: string
          fee_rate: string
          provider: AggregatorProvider
          pool_address: string
        }[]
        percentage: string
      }[]
    | undefined
}

export interface RoutesModalProps {
  isOpen: boolean
  onClose: () => void
  data?: SwapRouterFormat
}
