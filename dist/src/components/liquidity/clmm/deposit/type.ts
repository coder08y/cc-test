import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { BalanceInfo } from '@cetus/types'

export interface ProvideLiquidityProps {
  btnText?: string
  btnDisabled: boolean
  handleChangeIsFarmRewardsRange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onReverseClick: (item?: Tab) => void
  leverage: string
  direct: boolean
  perText: string
  rangeTabList: Tab[]
  currentRangeTab?: string
  fromBalanceInfo: BalanceInfo | undefined
  toBalanceInfo: BalanceInfo | undefined
  fromAmountValue: string
  toAmountValue: string
  handleAmountChange: (value: string, _byAmountIn: boolean, _isTokenA?: boolean) => void
  handleAdd: () => void
  isFullRange?: boolean
  useZapIn: boolean
  handleChangeZapIn: () => void
  handleSubmit?: () => void
  liquidityChartTab?: string
  handleChangeLiquidityChartTab?: (item?: Tab) => void
  liquidityChartTabList: Tab[]
}
