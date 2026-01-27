import { TickData } from '@/types'
import { Token } from '@cetus/types'
import { PoolType } from '../SelectPoolType'

export type InitPriceProps = CLMMInitPriceProps | DLMMInitPriceProps

export type CLMMInitPriceProps = {
  poolType: PoolType
  editStep: number
  currentStep: number
  onEdit: () => void
  onContinue: () => void
  displayBaseToken?: Token
  displayQuoteToken?: Token
  initPrice: string
  currTick?: number
  onInitPriceChange: (price: string) => void
  displayMinPrice: Partial<TickData>
  onMinPriceChange: (price: Partial<TickData>, inputValue: string) => void
  displayMaxPrice: Partial<TickData>
  onMaxPriceChange: (price: Partial<TickData>, inputValue: string) => void
  handleSwitchDirectionChange: () => void
  isFullRange: boolean
  isReverse: boolean
  handleRangeModeChange: (isFullRange: boolean) => void
  handlePriceAction: (action: 'Add' | 'Sub', tickData: Partial<TickData>) => void
}

export type DLMMInitPriceProps = {
  poolType: PoolType
  editStep: number
  currentStep: number
  onEdit: () => void
  onContinue: () => void
  baseToken?: Token
  quoteToken?: Token
  initPrice: string
  onInitPriceChange: (price: string) => void
}
