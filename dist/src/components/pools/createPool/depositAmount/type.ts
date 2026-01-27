import { PriceDataType } from '@/hooks/create-pool/useCreateDLMMPool'
import { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { PoolPercent } from '@/types'
import { Token } from '@cetus/types'
import { StrategyType } from '@cetusprotocol/dlmm-sdk'
import { PoolType } from '../SelectPoolType'
import { CLMMInitPriceProps } from '../initPrice/type'

export type DepositAmountProps = CLMMDepositAmountProps | DLMMDepositAmountProps

export type CLMMDepositAmountProps = {
  poolType?: PoolType
  currentStep: number
  editStep: number
  onCreate: () => void
  baseToken?: Token
  quoteToken?: Token
  baseAmount: string
  quoteAmount: string
  onBaseAmountChange: (value: string) => void
  onQuoteAmountChange: (value: string) => void
  isReverse: boolean
  percentMap?: PoolPercent
}

export type DLMMDepositAmountProps = {
  poolType?: PoolType
  currentStep: number
  editStep: number
  onCreate: () => void
  baseToken?: Token
  quoteToken?: Token
  baseAmount: string
  quoteAmount: string
  onBaseAmountChange: (value: string) => void
  onQuoteAmountChange: (value: string) => void
  isReverse: boolean
  binStep?: { bin_step: number; base_fee_rate: number }
  fixAmountA: boolean
  setFixAmountA: (value: boolean) => void
  strategy: StrategyType
  setStrategy: (value: StrategyType) => void
  isAutoFill: boolean
  setIsAutoFill: (value: boolean) => void
  onPriceChange: (currentPrice: RangePriceType, value: string, direct?: boolean) => void
  handlePriceAction: (type: 'Add' | 'Sub', price: PriceDataType, isMinPrice: boolean) => void
  minPriceData: Omit<RangePriceType, 'tokenA' | 'tokenB'>
  maxPriceData: Omit<RangePriceType, 'tokenA' | 'tokenB'>
} & Pick<
  CLMMInitPriceProps,
  'onMinPriceChange' | 'onMaxPriceChange' | 'handleSwitchDirectionChange' | 'displayBaseToken' | 'displayQuoteToken' | 'initPrice'
>
