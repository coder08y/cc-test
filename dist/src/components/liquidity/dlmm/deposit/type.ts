import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { BalanceInfo, Token } from '@cetus/types'
import { CalculationDepositResult, CalculationWithdrawResult } from '@cetusprotocol/dlmm-zap-sdk'

export interface DLMMDepositProps<T> {
  btnText: string | undefined
  btnDisabled: boolean
  onReverseClick: (item?: Tab) => void
  direct: boolean
  perText: string
  rangeTabList: T[]
  preCalcLoading: boolean
  currentRangeTab: string | undefined
  fromBalanceInfo: BalanceInfo | undefined
  toBalanceInfo: BalanceInfo | undefined
  fromAmountValue: string
  toAmountValue: string
  handleAmountChange: (value: string, _byAmountIn: boolean, _isTokenA?: boolean) => void
  handleAdd: () => void
  handleSubmit: () => Promise<void>
  submitLoading: boolean
  isReverse?: boolean
  btnClickRef: any

  zapProps: DLMMZapProps
  knowsRisk: boolean
  handleKnowsRisk: (value: boolean) => void
  showRiskConfirm: boolean
}

export interface DLMMZapProps {
  action: 'Deposit' | 'Withdraw'
  supportZap: boolean
  zapCoin: Token | undefined
  zapCoinList: Token[]
  handleChangeZapCoin: (coin: Token) => void
  zapAmount: string
  availableAmount: string
  calculateAvailableLoading: boolean
  handleChangeZapAmount: (value: string, isClickMax?: boolean, isHalfClickMax?: boolean) => void
  zapPreCalcLoading: boolean
  zapSubmitLoading: boolean
  coinA: Token | undefined
  coinB: Token | undefined
  preDepositResult?: CalculationDepositResult
  preWithdrawResult?: CalculationWithdrawResult
  current_price?: string
  reCalculateZapData: () => void
  handleZapSubmit: () => Promise<void>
  handleChangeSlideValue?: (value: string) => void
  zapTipsError?: string
}
