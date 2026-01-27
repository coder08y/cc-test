import useDeepBookStore from '@/store/deepbook'
import { d, isAvailableObject } from '@cetus/utils'

import { DEEPBOOK_INDEXER_BASE_URL } from '@/constant/deepbook'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
export type OrderType = 'bid' | 'ask' | 'all'

export default function useGetDeepBookOrderBook() {
  const { currentDeepBookPool, setDeepBookAskList, setDeepBookBidList, setDeepBookOrderBookLoading } = useDeepBookStore()
  const { deepBookSDK } = usePeripherySDKStore()

  // 获取 deepbook pool 格式化结构
  const getRequestPool = (poolInfo: any, orderType?: 'spot' | 'margin') => {
    if (orderType === 'margin') {
      return {
        id: poolInfo?.address,
        baseCoin: {
          coinType: poolInfo?.baseAssets?.coin_type,
          decimals: poolInfo?.baseAssets?.decimals
        },
        quoteCoin: {
          coinType: poolInfo?.quoteAssets?.coin_type,
          decimals: poolInfo?.quoteAssets?.decimals
        }
      }
    } else {
      return {
        address: poolInfo?.address,
        baseCoin: {
          coinType: poolInfo?.baseAssets?.coin_type,
          decimals: poolInfo?.baseAssets?.decimals
        },
        quoteCoin: {
          coinType: poolInfo?.quoteAssets?.coin_type,
          decimals: poolInfo?.quoteAssets?.decimals
        }
      }
    }
  }

  // 构建池子名称，例如 DEEP_USDC
  const getPoolName = (poolInfo: any): string => {
    if (!poolInfo?.baseAssets?.symbol || !poolInfo?.quoteAssets?.symbol) {
      return ''
    }
    return `${poolInfo.baseAssets.symbol}_${poolInfo.quoteAssets.symbol}`
  }

  // 根据 tickSize 向上取整价格
  const roundPriceUp = (price: string, tickSize: string): string => {
    try {
      const priceDecimal = d(price)
      const tickSizeDecimal = d(tickSize)

      // 如果 tickSize 无效或为0，直接返回原价格
      if (tickSizeDecimal.isZero() || !tickSizeDecimal.isFinite()) {
        return priceDecimal.toString()
      }

      const remainder = priceDecimal.mod(tickSizeDecimal)

      // 如果余数为0，说明已经是tickSize的整数倍，直接返回
      if (remainder.isZero()) {
        return priceDecimal.toString()
      }
      // 向上取整：price + (tickSize - remainder)
      return priceDecimal.add(tickSizeDecimal.sub(remainder)).toString()
    } catch (error) {
      console.error('roundPriceUp error:', error, { price, tickSize })
      return price
    }
  }

  // 整合订单数据：根据 tickSize 合并相同价格级别的订单
  const aggregateOrdersByApi = (orders: string[][], tickSize: string): any[] => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return []
    }

    const mergeData: Record<string, { price: string; quantity: number }> = {}

    orders.forEach(order => {
      // 验证数据格式
      if (!Array.isArray(order) || order.length < 2) {
        return
      }

      const [priceStr, quantityStr] = order
      if (!priceStr || priceStr === '') {
        return
      }

      try {
        const rawPrice = String(priceStr)
        // 使用向上取整，避免极小价格被处理为0
        const roundedPrice = roundPriceUp(rawPrice, tickSize)

        // 如果向上取整后价格为0或无效，跳过这条数据
        if (d(roundedPrice).isZero() || !d(roundedPrice).isFinite()) {
          return
        }

        const quantity = parseFloat(String(quantityStr)) || 0
        if (quantity <= 0) {
          return
        }

        if (mergeData[roundedPrice]) {
          mergeData[roundedPrice].quantity += quantity
        } else {
          mergeData[roundedPrice] = {
            price: roundedPrice,
            quantity
          }
        }
      } catch (error) {
        console.error('aggregateOrders error processing order:', error, order)
      }
    })

    return Object.values(mergeData).map(item => ({
      price: item.price,
      quantity: item.quantity.toString(),
      total: d(item.price).mul(item.quantity).toString()
    }))
  }

  const getOrderBookByApi = async (orderType: OrderType, tickSize: string, isRefresh: boolean = false, length: number = 9) => {
    try {
      // todo: remove this

      // if (!currentDeepBookPool?.price) {
      //   return
      // }

      // 验证 tickSize
      if (!tickSize || tickSize === '' || d(tickSize).isZero() || !d(tickSize).isFinite()) {
        console.error('invalid tickSize:', tickSize)
        return
      }

      if (isRefresh) {
        setDeepBookOrderBookLoading(true)
      }

      // 构建池子名称
      const poolName = getPoolName(currentDeepBookPool)
      if (!poolName) {
        console.error('failed to build pool name', currentDeepBookPool)
        setDeepBookOrderBookLoading(false)
        return
      }

      // 从 indexer API 获取订单簿数据
      const url = `${DEEPBOOK_INDEXER_BASE_URL}/orderbook/${poolName}?level=2&depth=0`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`failed to get order book data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // console.log('🚀🚀🚀 ~ useGetDeepBookOrderBook.ts ~ getOrderBook ~ indexer data:', data)

      if (!data || typeof data !== 'object') {
        throw new Error('response data format error')
      }

      const rawBids = Array.isArray(data.bids) ? data.bids : []
      const rawAsks = Array.isArray(data.asks) ? data.asks : []

      // 根据 tickSize 整合数据（向上取整）
      let bidList: any[] = []
      let askList: any[] = []

      if (orderType === 'bid' || orderType === 'all') {
        bidList = aggregateOrdersByApi(rawBids, tickSize)
        // 按价格降序排列（最高价在前）
        bidList.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0
          const priceB = parseFloat(b.price) || 0
          return priceB - priceA
        })
      }

      if (orderType === 'ask' || orderType === 'all') {
        askList = aggregateOrdersByApi(rawAsks, tickSize)
        // 按价格升序排列（最低价在前）
        askList.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0
          const priceB = parseFloat(b.price) || 0
          return priceA - priceB
        })
      }

      // 更新状态
      // console.log('🚀🚀🚀 ~ useGetDeepBookOrderBook.ts:179 ~ getOrderBookByApi ~ askList:', { askList, bidList })
      if (orderType === 'ask' || orderType === 'all') {
        setDeepBookAskList(askList)
      }

      if (orderType === 'bid' || orderType === 'all') {
        setDeepBookBidList(bidList)
      }

      setDeepBookOrderBookLoading(false)
    } catch (error) {
      console.error('getOrderBook error:', error)
      getOrderBookBySdk(orderType, tickSize, isRefresh, length)
      // setDeepBookOrderBookLoading(false)
      // if (orderType === 'ask' || orderType === 'all') {
      //   setDeepBookAskList([])
      // }
      // if (orderType === 'bid' || orderType === 'all') {
      //   setDeepBookBidList([])
      // }
    }
  }

  // 临时降级方案 后续应该切到indexer服务上

  const aggregateOrdersBySdk = (orders: { price: string; quantity: string }[], tickSize: string): any[] => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return []
    }

    const mergeData: Record<string, { price: string; quantity: number }> = {}

    orders.forEach(order => {
      // 验证数据格式
      if (!isAvailableObject(order)) {
        return
      }

      const { price: priceStr, quantity: quantityStr } = order
      if (!priceStr || priceStr === '') {
        return
      }

      try {
        const rawPrice = String(priceStr)
        // 使用向上取整，避免极小价格被处理为0
        const roundedPrice = roundPriceUp(rawPrice, tickSize)

        // 如果向上取整后价格为0或无效，跳过这条数据
        if (d(roundedPrice).isZero() || !d(roundedPrice).isFinite()) {
          return
        }

        const quantity = parseFloat(String(quantityStr)) || 0
        if (quantity <= 0) {
          return
        }

        if (mergeData[roundedPrice]) {
          mergeData[roundedPrice].quantity += quantity
        } else {
          mergeData[roundedPrice] = {
            price: roundedPrice,
            quantity
          }
        }
      } catch (error) {
        console.error('aggregateOrders error processing order:', error, order)
      }
    })

    return Object.values(mergeData).map(item => ({
      price: item.price,
      quantity: item.quantity.toString(),
      total: d(item.price).mul(item.quantity).toString()
    }))
  }

  const getOrderBookBySdk = async (orderType: OrderType, tickSize: string, isRefresh: boolean = false, length: number = 9) => {
    try {
      // console.log('🚀🚀🚀 ~ useGetDeepBookOrderBook.ts:261 ~ getOrderBookBySdk ~ currentDeepBookPool:', currentDeepBookPool)
      // if (!currentDeepBookPool?.price) {
      //   return
      // }

      // 验证 tickSize
      if (!tickSize || tickSize === '' || d(tickSize).isZero() || !d(tickSize).isFinite()) {
        console.error('invalid tickSize:', tickSize)
        return
      }

      if (isRefresh) {
        setDeepBookOrderBookLoading(true)
      }
      const pool = getRequestPool(currentDeepBookPool)

      let unit = 5
      let lastTotalCount = 0
      let finalBid: any[] = []
      let finalAsk: any[] = []

      while (true) {
        const data = await deepBookSDK.DeepbookUtils.getOrderBook(pool, orderType, unit)

        const rawBids = Array.isArray(data.bid) ? data.bid : []
        const rawAsks = Array.isArray(data.ask) ? data.ask : []

        const totalCount = rawBids.length + rawAsks.length

        // console.log('📘 DeepBook OrderBook', { unit, bid: rawBids.length, ask: rawAsks.length })

        // 保存当前最新数据
        finalBid = rawBids
        finalAsk = rawAsks

        // ✅ 停止条件 1：条数已满足
        if (totalCount >= 40) {
          break
        }

        // ✅ 停止条件 2：条数不再增长
        if (totalCount === lastTotalCount) {
          break
        }

        lastTotalCount = totalCount
        unit += 1
      }

      /** ================== 聚合 + 排序 ================== */

      let bidList: any[] = []
      let askList: any[] = []

      if (orderType === 'bid' || orderType === 'all') {
        bidList = aggregateOrdersBySdk(finalBid, tickSize)
        bidList.sort((a, b) => Number(b.price) - Number(a.price))
      }

      if (orderType === 'ask' || orderType === 'all') {
        askList = aggregateOrdersBySdk(finalAsk, tickSize)
        askList.sort((a, b) => Number(a.price) - Number(b.price))
      }

      // console.log('✅ Final OrderBook', { bidList, askList })

      if (orderType === 'ask' || orderType === 'all') {
        setDeepBookAskList(askList)
      }

      if (orderType === 'bid' || orderType === 'all') {
        setDeepBookBidList(bidList)
      }
    } catch (error) {
      console.error('❌ getOrderBookBySdk error', error)
    } finally {
      setDeepBookOrderBookLoading(false)
    }
  }

  const getOrderBook = (orderType: OrderType, tickSize: string, isRefresh: boolean = false, length: number = 9, isUseApi: boolean = false) => {
    // if (isUseApi) {
    getOrderBookByApi(orderType, tickSize, isRefresh, length)
    // } else {
    //   getOrderBookBySdk(orderType, tickSize, isRefresh, length)
    // }
  }

  return { getOrderBook, getRequestPool }
}
