import { Token } from '@cetus/types/src/common-types'
import { RouterData } from '@cetusprotocol/aggregator-sdk'

export enum AggregatorProvider {
  CETUS = 'CETUS',
  // DEEPBOOK = 'DEEPBOOK',
  KRIYA = 'KRIYA',
  KRIYAV3 = 'KRIYAV3',
  FLOWX = 'FLOWX',
  FLOWXV3 = 'FLOWXV3',
  AFTERMATH = 'AFTERMATH',
  METASTABLE = 'METASTABLE',
  HAEDAL = 'HAEDAL',
  VOLO = 'VOLO',
  AFSUI = 'AFSUI',
  DEEPBOOKV3 = 'DEEPBOOKV3',
  SCALLOP = 'SCALLOP',
  BLUEMOVE = 'BLUEMOVE',
  TURBOS = 'TURBOS',
  SPRINGSUI = 'SPRINGSUI',
  BLUEFIN = 'BLUEFIN',
  HAEDALPMM = 'HAEDALPMM',
  ALPHAFI = 'ALPHAFI',
  STEAMM = 'STEAMM',
  STEAMM_OMM_V2 = 'STEAMM_OMM_V2',
  OBRIC = 'OBRIC',
  HAWAL = 'HAWAL',
  MOMENTUM = 'MOMENTUM',
  MAGMA = 'MAGMA',
  SEVENK = 'SEVENK',
  HAEDALHMMV2 = 'HAEDALHMMV2',
  FULLSAIL = 'FULLSAIL',
  CETUSDLMM = 'CETUSDLMM',
  FERRACLMM = 'FERRACLMM',
  FERRADLMM = 'FERRADLMM'
}

export type AggregatorDex = {
  name: string
  id: AggregatorProvider | string
  logo: string
  type: string
  sort: number
  groupId?: string
  subItems?: AggregatorDex[]
}

export type SwapRouterData = {
  routerData?: RouterData
  fromAmountUi?: string
  toAmountUi?: string
  byAmountIn: boolean
  isDegrade: boolean //是否是降级
  uuid: string
  errorCode?: AggregatorServerErrorCode
}

export type SwapRfqData = {
  rfqQuote: RfqQuote
  fromAmountUi: string
  toAmountUi: string
  uuid: string
  price: string
}

export type SwapRouterFormat = {
  router_summery: string
  providers: AggregatorProvider[]
  routers: {
    percentage: string
    paths: {
      from_type: string
      to_type: string
      fee_rate: string
      pool_address: string
      provider: AggregatorProvider
    }[]
  }[]
}

export enum AggregatorServerErrorCode {
  CalculateError = 1000,
  NumberTooLarge = 1001,
  NoRouter = 1005,
  InsufficientLiquidity = 1002,
  HoneyPot = 1003
}

export enum SwapWidgetStep {
  TradeInputPage = 'TradeInput',
  TradeStatus = 'TradeStatus',
  SelectTokenPage = 'SelectToken',
  TradeConfirmPage = 'TradeConfirm',
  RoutePage = 'Route',
  TradeSetting = 'TradeSetting',
  SlippageSetting = 'SlippageSetting'
}

export type TransactionMode = 'Default' | 'Fast Mode'

export interface RfqQuoteWidgetProps {
  rfqData?: SwapRfqData
  toCoin?: Token
  fromCoin?: Token
  isShowRfqWidget: boolean
  findRouterLoading: boolean
  rftCountdownFlagRef: React.MutableRefObject<number | undefined>
  onTrade: (data: SwapRfqData) => void
}

export type RfqQuote = {
  id: string
  from: string
  target: string
  mm: string
  amount_in: string
  amount_out: string
  fee_amount: string
  expired_at: string
  total_countdown: number
}

export type QuoteMode = 'rfq' | 'router'

export type RfqConfigs = {
  enable: boolean
  quote_limit: {
    min: string
    max: string
  }
  allow_paths: {
    from: string
    target: string
  }[]
}
