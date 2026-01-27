import { Chain, CrossSwapFee, CrossSwapPlatform, CrossSwapToken, CrossSwapTokenBalance } from '@cetusprotocol/cross-swap-sdk'
import { BoxProps, ButtonProps, CenterProps, StackProps, TextProps } from '@chakra-ui/react'

export interface ChainAddressType {
  // 链地址
  chain_address?: string
  // 手动输入地址
  manual_address?: string
}
export interface ChainAddresses {
  evmAddress: ChainAddressType
  svmAddress: ChainAddressType
  mvmAddress: ChainAddressType
  utxoAddress: ChainAddressType
}

export type SelectCrossSwapOptions = {
  fromChain?: Chain
  toChain?: Chain
  fromToken?: CrossSwapToken
  toToken?: CrossSwapToken
}
export type CurrentChainOptions = {
  platform: CrossSwapPlatform
} & SelectCrossSwapOptions

export type CrossTradeInputProps = {
  title: string
  currentCoin?: CrossSwapToken
  inputAllowed?: boolean // 是否允许输入
  wrapStyle?: BoxProps
  loading?: boolean
  value: string
  balance: string
  placeholder: string
  walletAddress?: string
  onChange: (value: string, isClickMax?: boolean, isHalfClickMax?: boolean) => void
  onFocusChange?: (focus: boolean) => void
  openSelectChainAndTokenModal: () => void
  onConnectWallet?: () => void
  amountValue: string
  half?: boolean
  max?: boolean
  calculateAvailableLoading?: boolean
  balanceLabel?: string
  currentChain?: Chain
  platform: CrossSwapPlatform
}

export type CrossTradeInputGroupProps = {
  from: CrossTradeInputProps
  to: CrossTradeInputProps
  wrapStyle: StackProps
  onClick: () => void
}

export interface ChainCoinSelectProps {
  value?: CrossSwapToken
  loading?: boolean
  whiteTokenList?: CrossSwapToken[]
  currentCoinKey?: string
  platform: CrossSwapPlatform
  tokenStyle?: CenterProps
  tokenSize?: string
  symbolStyle?: TextProps
  wrapStyle?: ButtonProps
  isShowLabelTab?: boolean
  isShowTokenListTab?: boolean
  isShowCollectListBox?: boolean
  disabled?: boolean
  currentChain?: Chain
  selectModalCallback?: (isOpen: boolean) => void
  openSelectChainAndTokenModal?: () => void
}

export type RouteStatus = 'PENDING' | 'DONE' | 'FAILED' | 'PARTIAL' | 'REFUNDED' | 'ACTION_REQUIRED'

export type CrossSwapHistoryItem = {
  status: 'PENDING' | 'DONE' | 'FAILED' | 'NOT_FOUND' | 'INVALID' | 'REFUNDED'
  feeCosts: CrossSwapFee[]
  gasCosts: CrossSwapFee[]
  fromChain: Chain
  toChain: Chain
  fromToken: CrossSwapToken
  toToken: CrossSwapToken
  amountIn: string
  amountOut: string
  source_address: string
  destination_address: string
  tx_link: string
  send_time: number
}

export type CrossWalletModalData = {
  address: string
  isManualAddress: boolean
  isFrom: boolean
  chain: Chain
}

export type SettingToAddressModalData = {
  chain: Chain
}

export type WarpTokenBalance = {
  balance?: CrossSwapTokenBalance
} & CrossSwapToken
