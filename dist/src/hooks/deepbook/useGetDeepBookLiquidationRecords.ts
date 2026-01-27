import { DeepBookMarginLiquiditionHistoryPath } from '@/apis/path'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useFetch } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import useMarginOrderUtils from './margin/useMarginOrderUtils'

export default function useGetDeepBookLiquidationRecords() {
  const { currentAccount } = useAccountStore()
  const { setDeepBookLiquidationRecordsLoading, setDeepBookLiquidationRecords } = useMarginStore()
  const { fetchByApi } = useFetch()
  const { currentDeepBookPool } = useDeepBookStore()
  const { getMarginManagerId } = useMarginOrderUtils()
  const getDeepBookLiquidationRecords = async (params?: {
    poolId?: string
    limit?: number
    eventCursor?: string
    isLoadMore?: boolean
  }) => {
    try {
      // 只有非加载更多时才设置全局 loading（显示骨架屏）
      if (!params?.isLoadMore) {
        setDeepBookLiquidationRecordsLoading(true)
      }

      // 检查是否有地址
      if (!currentAccount?.address) {
        if (!params?.isLoadMore) {
          setDeepBookLiquidationRecords([])
        }
        setDeepBookLiquidationRecordsLoading(false)
        return { list: [], cursor: null, hasMore: false }
      }

      // 构建 URL，添加 address 作为 query 参数
      // const url = new URL()
      // url.searchParams.append('address', currentAccount.address)

      const marginManagerId = getMarginManagerId()
      console.log('🚀🚀🚀 ~ useGetDeepBookLiquidationRecords ~ marginManagerId:', marginManagerId)

      // 发送 POST 请求，使用 application/x-www-form-urlencoded
      const response = await fetchByApi(DeepBookMarginLiquiditionHistoryPath, 'POST', {
        address: currentAccount.address,
        margin_manager_id: marginManagerId
      })

      const res = await response?.data

      const _list = res?.list || []

      if (!_list || _list.length === 0) {
        if (!params?.isLoadMore) {
          setDeepBookLiquidationRecords([])
        }
        setDeepBookLiquidationRecordsLoading(false)
        return { list: [], cursor: null, hasMore: false }
      }

      // 处理清算记录数据
      const list: any[] = []
      for (let i = 0; i < _list.length; i++) {
        const item = _list[i]
        const record = wrapDeepBookLiquidationRecord(item, item.content)
        if (record) {
          list.push(record)
        }
      }

      console.log('🚀🚀🚀 ~ useGetDeepBookLiquidationRecords ~ list:', list)

      // 暂时返回所有数据，不分页
      const hasMore = false
      const cursor = null

      // 如果是加载更多，不在这里设置数据，由组件处理
      if (!params?.isLoadMore) {
        setDeepBookLiquidationRecords(list)
      }
      setDeepBookLiquidationRecordsLoading(false)

      return { list, cursor, hasMore }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetDeepBookLiquidationRecords ~ error:', error)
      setDeepBookLiquidationRecordsLoading(false)
      return { list: [], cursor: null, hasMore: false }
    }
  }

  const wrapDeepBookLiquidationRecord = (record: any, content: any) => {
    try {
      // 状态映射：0=partial, 1=full, 2=bad debt
      const statusMap: Record<number, string> = {
        0: 'Partial',
        1: 'Full',
        2: 'Bad Debt'
      }
      const status = statusMap[record.state] || 'Partial'

      // 时间戳转换（time 是毫秒时间戳字符串）
      const timestamp = record.time ? parseInt(record.time) / 1000 : content.Timestamp ? parseInt(content.Timestamp) / 1000 : Date.now() / 1000

      // 获取代币元数据
      const coinMeta = record.coin_meta || {}
      const coinDecimals = coinMeta.decimals || 9
      const coinSymbol = coinMeta.symbol || 'SUI'

      // 使用当前池信息或默认值
      const marginPoolId = content.MarginPoolID || ''
      // 即使没有当前池信息，也返回记录，使用默认值
      const poolInfo = {
        baseAssets: currentDeepBookPool?.baseAssets || {
          symbol: coinSymbol,
          coin_type: coinMeta.coinType || '',
          decimals: coinDecimals,
          logo_url: coinMeta.iconUrl || ''
        },
        quoteAssets: currentDeepBookPool?.quoteAssets || {
          symbol: 'USDC',
          coin_type: '',
          decimals: 6,
          logo_url: ''
        },
        leverage: (currentDeepBookPool?.minBorrowRiskRatio / (currentDeepBookPool?.minBorrowRiskRatio - 1)).toFixed(1) || '-'
      }

      // 将 LiqudationAmount 转换为正确的数值（根据 decimals）
      // LiqudationAmount 是字符串格式的原始值，需要除以 10^decimals
      let liquidationAmount = '0'
      if (content.LiqudationAmount) {
        const rawAmount = BigInt(content.LiqudationAmount)
        const divisor = BigInt(10 ** coinDecimals)
        const amount = Number(rawAmount) / Number(divisor)
        liquidationAmount = amount.toString()
      }

      // debt_repaid 已经是格式化后的字符串
      const debtRepaid = record.debt_repaid || '0'

      // 计算清算价格
      // BasePythPrice 和 QuotePythPrice 都是 USD 价格（带小数位）
      // 清算价格表示：1 base token = X quote token
      // 计算公式：清算价格 = Base的USD价格 / Quote的USD价格
      // 例如：如果 SUI = 2 USD，USDC = 1 USD，那么 1 SUI = 2 USDC
      let liqPrice = '-'
      if (content.QuotePythPrice && content.BasePythPrice && d(content.QuotePythPrice).gt(0)) {
        const basePythDecimals = content.BasePythDecimals || 8
        const quotePythDecimals = content.QuotePythDecimals || 8

        // 转换为实际 USD 价格（考虑小数位）
        const basePriceUSD = d(content.BasePythPrice).div(d(10).pow(basePythDecimals))
        const quotePriceUSD = d(content.QuotePythPrice).div(d(10).pow(quotePythDecimals))

        // 计算清算价格：1 base = (basePriceUSD / quotePriceUSD) quote
        const liquidationPrice = basePriceUSD.div(quotePriceUSD)

        // 格式化显示，保留合理的小数位（通常 4-6 位）
        const formattedPrice = liquidationPrice.toFixed(6)
        const quoteSymbol = poolInfo.quoteAssets?.symbol
        // 单位：只显示 quote symbol，表示 1 base = X quote
        // 例如：如果显示 "2.5 USDC"，表示 1 base token = 2.5 USDC
        liqPrice = `${formattedPrice} ${quoteSymbol}`
      }

      return {
        poolId: marginPoolId || '',
        baseAssets: poolInfo.baseAssets,
        quoteAssets: poolInfo.quoteAssets,
        leverage: poolInfo.leverage,
        timestamp,
        status,
        liqPrice,
        debtRepaid: {
          amount: debtRepaid,
          symbol: coinSymbol
        },
        assetDecreased: {
          amount: liquidationAmount,
          symbol: coinSymbol
        },
        riskRatioBefore: record.risk_ratio || '0',
        riskRatioAfter: record.risk_ratio_after || '0',
        tx: record.tx || ''
      }
    } catch (error) {
      console.error('🚀🚀🚀 ~ wrapDeepBookLiquidationRecord ~ error:', error, record)
      return null
    }
  }

  return { getDeepBookLiquidationRecords }
}
