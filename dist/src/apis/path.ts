// Pool
export const StatsPoolsPath = '/v3/sui/clmm/stats_pools'
export const TicksPath = '/v2/sui/ticks'

// Liquidity
export const PriceRangePath = '/v3/sui/clmm/pool_price_range'
export const TransactionsHistory = '/v2/sui/pool/history'
export const PoolTickKlinePath = '/v3/sui/clmm/pool_tick_kline'

// Stats
export const HistogramAllPath = '/v2/sui/histogram/all'
export const HistogramPath = '/v2/sui/histogram'
export const StatisticsPath = '/v3/sui/statistics'
export const StatisticsV2Path = '/v3/sui/statisticsV2'
export const StatisticsPools = '/v2/sui/statistics_pools' // 弃用
export const StatisticsTokens = '/v3/sui/clmm/stats_coins'
export const TransactionTxPath = '/v3/sui/current_tx'
export const HistogramPathV3 = '/v3/sui/clmm/histogram'
export const HistogramPathTotalVolV3 = '/v3/sui/histogram'

// Dca
export const DcaConfigPath = '/dca/quote_config'
export const DcaQuotePath = '/dca/quote'
export const DcaOrderHistoryPath = '/v3/sui/dca/query_event_list'

// Limit Order
export const LimitOrderHistoryPath = '/v3/sui/limit_order'
export const aggregatorPath = '/router_v3'
export const aggregatorStatusPath = '/router_v3/status'

// Vault
export const VaultUnstableHistogram = '/v3/sui/vaults/unstable/tvl/histogram'
export const VaultStableHistogram = '/v3/sui/vaults/stable/tvl/histogram'
export const VaultUnStableLpFeeHistogram = '/v3/sui/vaults/unstable/LPFee/histogram'
export const VaultStableLpFeeHistogram = '/v3/sui/vaults/stable/LPFee/histogram'
export const VaultUnstablePriceRangeHistogram = '/v3/sui/vaults/unstable/pricerange/histogram'
export const VaultStablePriceRangeHistogram = '/v3/sui/vaults/stable/pricerange/histogram'
export const VaultList = '/v3/sui/vaults/pools'
export const VaultPerformanceHistogram = '/v3/sui/vaults/hodl/line'
export const VaultDailyYieldPerLp = '/v3/sui/vaults/daily_earning'

// vault v2
export const VaultV2PriceRangeHistogram = '/v3/sui/vaultv2/pricerange/histogram/muti'
export const VaultV2PerformanceHistogram = '/v3/sui/vaultv2/hodl/line'
export const VaultV2UnstableHistogram = '/v3/sui/vaultv2/tvl'
export const VaultV2UnstableHistogramV2 = '/v3/sui/vaultv2/tvl/v2'
export const VaultV2UnStableLpFeeHistogram = '/v3/sui/vaultv2/lpfeeandapy'
export const VaultV2UnStableLpFeeHistogramV2 = '/v3/sui/vaultv2/lpfeeandapy/v2'
export const VaultV2DailyYieldPerLp = '/v3/sui/vaultv2/daily_yield_per_lp'
export const VaultTotalEarned = '/v3/sui/vaults/total_yield'

// Token
export const VerifiedCoinsPath = '/v3/sui/clmm/verified_coins_info'
export const CoinsInfoPath = '/v3/sui/clmm/coins_info'

// pro
// export const ProCoinList = '/v3/sui/pro/coin_list'
// export const ProCoins = '/v3/sui/pro/coins'
export const ProCoinList = '/v3/sui/pro/v2/coin_list'
export const ProCoins = '/v3/sui/pro/v2/coins'

// Haedal Farming
export const HaedalFarmingPoolsPath = '/api/v1/farming/pools'

export const DLMMStatsPoolsPath = '/v3/sui/dlmm/stats_pools'
export const DLMMHistogramPath = '/v3/sui/dlmm/histogram'
export const DLMMStatisticsTokens = '/v3/sui/dlmm/stats_coins'
export const DLMMPoolsInfoPath = '/v3/sui/dlmm/pools_info'
export const DLMMPoolsIdRangePath = '/v3/sui/dlmm/pools_id_range'
export const DLMMBinsTradedPath = '/v3/sui/dlmm/bins_traded'
export const DLMMBinsRewardPath = '/v3/sui/dlmm/bins_reward'
export const DLMMStatsPairsPath = '/v3/sui/dlmm/stats_pairs'
export const DlmmStatsPoolsPath = '/v3/sui/dlmm/stats_pools'
export const DLMMStatsRewardPath = '/v3/sui/dlmm/add_reward_events'
export const AllTransactionTxPath = '/v3/sui/current_txs'

export const AllStatisticsTokens = '/v3/sui/stats_coins'

export const AllStatsPoolsPath = '/v3/sui/stats_pools'

export const AllStatsTvlPath = '/v3/sui/tvl_histogram'
// DeepBook
// export const DeepBookPoolsPath = '/v3/sui/deepbookv3_1/pools' // 获取池子列表
export const DeepBookPoolsPath = '/v3/sui/deepbookv3_3/pools' // 获取池子列表
export const DeepBookPoolsV2Path = '/v3/sui/deepbookv3_2/pools' // 模糊查询
// export const DeepBookTradeHistoryPath = '/v3/sui/deepbookv3/events' // 交易记录
export const DeepBookPoolInfoPath = 'v3/sui/deepbookv3_1/pool_info' // 获取池子信息
export const DeepBookMarginManagerPath = '/v3/sui/deepbookv3/margin_managers' // 获取marginManager账户列表
export const DeepBookMarginPoolsPath = '/v3/sui/deepbookv3/margin_pools' // 获取池子信息
export const DeepBookMarginLiquiditionHistoryPath = '/v3/sui/deepbookv3/liquidation' // 获取清算历史
export const DeepBookMarginPoolsHistoryPath = '/v3/sui/deepbookv3/operate_history' // margin pools历史记录查询
export const DeepBookMarginSupplyCap = '/v3/sui/deepbookv3/supply_cap' // margin cap查询

export const DeepBookOpenOrdersPath = '/v3/sui/deepbookv3/open/orders' // 获取未成交订单
export const DeepBookOrderHistoryPath = '/v3/sui/deepbookv3/order/history' // 获取订单历史
export const DeepBookTradeHistoryPath = '/v3/sui/deepbookv3/trade/history' // 获取交易历史列表
export const DeepBookMarginTradeHistoryPath = '/v3/sui/deepbookv3/margin/trade/history' // 获取 Margin 交易历史列表（allmarket）
export const DeepBookBalancePath = '/v3/sui/deepbookv3/balance' // 获取balanceManager账户列表
export const DeepBookCountPath = '/v3/sui/deepbookv3/count' // 获取订单数量
export const DeepBookCountAllPath = '/v3/sui/deepbookv3/all/count' // 获取订单数量（统一接口，支持 spot 和 margin）
export const DeepBookRecentTradesPath = '/v3/sui/deepbookv3/recent/trades' // 获取最近交易列表

// Position
export const ClmmPositionDailyEarningPath = '/v3/sui/clmm/position/daily_earning'
export const DlmmPositionDailyEarningPath = '/v3/sui/dlmm/position/daily_earning'
export const ClmmPositionHistoricalProfitPath = '/v3/sui/clmm/position/historical_profit'
export const DlmmPositionHistoricalProfitPath = '/v3/sui/dlmm/position/historical_profit'
export const ClmmPositionDailyEarningsPath = '/v3/sui/clmm/position/daily_earnings'
export const DlmmPositionDailyEarningsPath = '/v3/sui/dlmm/position/daily_earnings'
