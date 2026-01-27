import useWalletHoldingsStore from '@/store/profile/walletHoldings'
import { CoinHolding, CoinHoldingFilter } from '@/types/profile'
import { useAccountBalance } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { CoinType } from '@cetus/types'
import { d, formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import Decimal from 'decimal.js'
import { useEffect, useRef } from 'react'
import { useRefreshCoinPriceInfo } from './useProfileHelper'
export function useWalletHoldings() {
  const { currentAccount } = useAccountStore()
  const { fetchAccountBalance } = useAccountBalance()
  const {
    coinHoldingList,
    setCoinHoldingList,
    setIsCoinHoldingLoading,
    setIsCoinPriceLoading,
    setHoldingsTotalUsd,
    isCoinPriceLoading,
    setUnknownCoinCount,
    setFilterUnknownCoinCount
  } = useWalletHoldingsStore()
  const { getTokenListInfo } = useGetToken<CoinType>()
  const { getTokenPrice, fetchTokenPrices } = useTokenPrice()
  const { refreshCoinPriceInfo } = useRefreshCoinPriceInfo()

  const currentAccountRef = useRef(currentAccount?.address)
  useEffect(() => {
    currentAccountRef.current = currentAccount?.address
  }, [currentAccount?.address])

  /**
   * 获取币种列表
   */
  const fetchCoinHoldingList = async () => {
    const owner = currentAccountRef.current
    if (owner) {
      setIsCoinHoldingLoading(true)
      const res = await fetchAccountBalance(owner, true)
      if (res) {
        const tokenMap = await getTokenListInfo(res.filter(item => d(item.totalBalance).gt(0)).map(item => item.coinType) as CoinType[])
        if (!tokenMap) {
          setIsCoinHoldingLoading(false)
          setCoinHoldingList([])
          throw new Error('get token list info error')
        }
        const list: CoinHolding[] = []
        let unknownCoinCount = 0
        res.forEach(info => {
          const token = tokenMap.get(info.coinType as CoinType)
          if (token) {
            const totalBalance = info.totalBalance
            const balanceFormat = fromDecimalsAmountFix(totalBalance, token.decimals).toString()
            const balanceDisplay = formatNumber(balanceFormat, undefined, undefined, Decimal.ROUND_DOWN).toString()
            const coinHolding: CoinHolding = {
              balance: totalBalance,
              balance_format: balanceFormat,
              balance_display: balanceDisplay,
              balance_usd: undefined,
              coin: token,
              coin_type: token?.coin_type,
              price: '',
              price_diff_24: ''
            }
            list.push(coinHolding)

            if (!token.is_verified) {
              unknownCoinCount++
            }
          }
        })
        updateCoinPriceInfo(list)
        console.log('🚀 ~ fetchCoinHoldingList ~ owner:', owner)
        console.log('🚀 ~ fetchCoinHoldingList ~ currentAccountRef.current:', currentAccountRef.current)
        if (owner === currentAccountRef.current) {
          setCoinHoldingList(list)
          setUnknownCoinCount(unknownCoinCount)

          //异步更新价格
          fetchCoinPriceInfo([...list])
        }

        setIsCoinHoldingLoading(false)

        return list
      }
    } else {
      setIsCoinHoldingLoading(false)
      setCoinHoldingList([])
    }
    return []
  }

  const fetchCoinPriceInfo = async (list: CoinHolding[]) => {
    setIsCoinPriceLoading(true)
    try {
      await refreshCoinPriceInfo(
        list.map(item => item.coin.coin_type),
        true
      )
    } catch (error) {
      console.error('fetch coin price info error', error)
    } finally {
      setIsCoinPriceLoading(false)
    }
  }

  const updateCoinPriceInfo = (list: CoinHolding[]) => {
    list.map(item => {
      const { coin } = item
      const price = getTokenPrice(coin.coin_type)

      if (price) {
        item.price = price.price
        item.price_diff_24 = price.price_change || ''
        item.balance_usd = d(item.balance_format).mul(price.price).toString()
      }
    })
  }

  /**
   * 获取过滤币种列表
   */
  const getFilterCoinHoldingList = async (filter: CoinHoldingFilter) => {
    console.log('🚀 ~ getFilterCoinHoldingList ~ filter:', {
      filter,
      coinHoldingList,
      currentAccount
    })

    if (currentAccount) {
      const { search, current_sort, current_sort_order, is_show_unknown = false, is_hide_small_balance = true } = filter
      let tempList: CoinHolding[] = []
      // 过滤未知币种
      if (is_show_unknown) {
        tempList.push(...coinHoldingList)
      } else {
        tempList = coinHoldingList.filter(item => item.coin.is_verified)
      }

      // 搜索
      if (search) {
        const searchLower = search.toLowerCase()
        tempList = tempList.filter(item => {
          return (
            item.coin.coin_type.toLowerCase().includes(searchLower) ||
            item.coin.symbol.toLowerCase().includes(searchLower) ||
            item.coin.name.toLowerCase().includes(searchLower)
          )
        })
      }

      // 更新价格
      updateCoinPriceInfo(tempList)
      // 过滤小余额
      if (is_hide_small_balance && !isCoinPriceLoading) {
        // item.balance_usd === undefined ||
        tempList = tempList.filter(item => d(item.balance_usd).gt(0.01))
      }

      // 多条件排序
      tempList.sort((a, b) => {
        // 按优先级顺序处理排序条件

        if (current_sort === 'balance') {
          const balanceCompare = d(a.balance_format).cmp(d(b.balance_format))
          if (balanceCompare !== 0) return current_sort_order === 'desc' ? -balanceCompare : balanceCompare
        }

        if (current_sort === 'value') {
          const valueCompare = d(a.balance_usd).cmp(d(b.balance_usd))
          if (valueCompare !== 0) return current_sort_order === 'desc' ? -valueCompare : valueCompare
          // 当value相等时，按balance降序排序
          return d(b.balance_format).cmp(d(a.balance_format))
        }

        if (current_sort === 'price') {
          const priceCompare = d(a.price || '0').cmp(d(b.price || '0'))
          if (priceCompare !== 0) return current_sort_order === 'desc' ? -priceCompare : priceCompare
          // 当price相等时，按balance降序排序
          return d(b.balance_format).cmp(d(a.balance_format))
        }

        return 0
      })

      console.log('🚀 ~ getFilterCoinHoldingList ~ tempList:', tempList)
      const filterUnknownCoinCountList = tempList.filter((item: any) => !item.coin.is_verified)
      setFilterUnknownCoinCount(filterUnknownCoinCountList?.length)
      return tempList
    }
    return []
  }

  useEffect(() => {
    updateCoinPriceInfo(coinHoldingList)

    const totalUsd = coinHoldingList.reduce((acc, item) => {
      return acc + Number(item.balance_usd || 0)
    }, 0)

    setHoldingsTotalUsd(totalUsd.toString())
  }, [coinHoldingList, isCoinPriceLoading])

  /**
   * 重置用户数据
   */
  const resetUserData = () => {
    setCoinHoldingList([])
    setHoldingsTotalUsd('0')
    setUnknownCoinCount(0)
  }

  return {
    getFilterCoinHoldingList,
    fetchCoinHoldingList,
    resetUserData
  }
}
