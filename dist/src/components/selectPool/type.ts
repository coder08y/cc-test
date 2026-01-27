import { DlmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import { Token } from '@cetus/types'
import { CenterProps, StackProps, TextProps } from '@chakra-ui/react'
import { PoolType } from '../pools/createPool/SelectPoolType'

export type FromSource = 'createPool' | 'addLiquidity'

export type FeeTier = {
  title: string
  fee: string
  tickSpacing: string
  feeDisplay: string
  feeRate: string
  poolAddress?: string
  description?: string
  liquidity?: string
  tvl?: string
  disabled?: boolean
}

export type SelectPoolProps = {
  fromSource: FromSource
  baseToken?: Token
  quoteToken?: Token
  onBaseTokenChange: (token?: Token) => void
  onQuoteTokenChange: (token?: Token) => void
  poolType: PoolType
  title: string
  quoteWhiteTokenList?: Token[]
  description: string
  onContinue: () => void
  wrapStyle?: StackProps
} & Partial<CLMMSelectFeeProps> &
  Partial<DLMMSelectFeeAndBinStepProps>

export interface SelectTokenProps {
  title?: string
  value?: Token
  isWhiteSelect: boolean
  whiteTokenList?: Token[]
  onChange: (token: Token) => void | Promise<void>
  disabled?: boolean
  tokenStyle?: CenterProps
  tokenSize?: string
  symbolStyle?: TextProps
  wrapStyle?: StackProps
  loading?: boolean
  fromSource?: FromSource
}

export type CLMMSelectFeeProps = {
  feeTier?: FeeTier
  feeTierList: FeeTier[]
  onFeeTierChange: (fee: FeeTier) => void
  isFetchingOptions?: boolean
}

export type DLMMSelectFeeAndBinStepProps = {
  baseFee: Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'>
  onBaseFeeChange: (fee: DlmmSelectFeeType) => void
  binStep: any
  binStepList: any[]
  getBinStepListLoading: boolean
  onBinStepChange: (value: any) => void
  children?: React.ReactNode
  disabled?: boolean
}
