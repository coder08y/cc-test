import { DataItem, EventEnums } from '@/components/liquidity/clmm/recentTransactions/type'
import useTransactionHistory from '@/hooks/clmm/useTransactionHistory'
import useLiquidityStore from '@/store/clmm'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { bnToAmount } from '@cetus/utils'
import { PageQuery } from '@cetusprotocol/common-sdk'
import { useDebounceEffect } from 'ahooks'
import { useEffect, useState } from 'react'

function useRecentTransactions() {
  const pageSize = 10

  const { getTransactionsHistoryBySDK } = useTransactionHistory()
  const [isLoading, setIsLoading] = useState(true)
  const [list, setList] = useState<DataItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [hasNextPage, setHasNextPage] = useState(true)
  const { apiPoolInfo, manualRefresh, setManualRefresh } = useLiquidityStore()
  const { poolAddress } = useQueryParams()
  /**
   * 根据池子地址初始化第一页数据
   * Initialize the first page data based on the pool address
   */
  useEffect(() => {
    setList([])
    setCurrentPage(1)
    setNextCursor(undefined)
    setHasNextPage(true)
  }, [poolAddress])

  /**
   * 手动刷新，回到第一页，重新请求第一页数据
   * Manually refresh and request the first page data
   */
  useEffect(() => {
    if (manualRefresh) {
      setList([])
      setCurrentPage(1)
      setNextCursor(undefined)
      setHasNextPage(true)
      fetchData({
        cursor: undefined,
        limit: pageSize
      })
    }
  }, [poolAddress, manualRefresh])

  const fetchData = async (params: PageQuery) => {
    try {
      if (!hasNextPage) return
      if (poolAddress) {
        setIsLoading(true)
        console.log('🚀 ~ fetchData ~ params:', {
          poolAddress,
          params
        })
        const result: any = await getTransactionsHistoryBySDK(poolAddress, { ...params })
        console.log('🚀 ~ fetchData ~ result:', result)
        if (result) {
          const _data = result?.data?.map((item: any) => {
            const _parsedJson = item?.parsed_json
            const _firstToken = _parsedJson?.amount_a ? apiPoolInfo?.tokenA : _parsedJson?.atob ? apiPoolInfo?.tokenA : apiPoolInfo?.tokenB
            const _secondToken = _parsedJson?.amount_b ? apiPoolInfo?.tokenB : _parsedJson?.atob ? apiPoolInfo?.tokenB : apiPoolInfo?.tokenA
            return {
              ...item,
              type: item.type?.includes('Add') ? EventEnums.add : item.type?.includes('Remove') ? EventEnums.remove : EventEnums.swap,
              items: [
                {
                  amount: bnToAmount(_parsedJson?.amount_a ? _parsedJson?.amount_a : _parsedJson?.amount_in, _firstToken?.decimals).toString(),
                  address: _firstToken?.coin_type,
                  url: _firstToken?.logo_url,
                  symbol: _firstToken?.symbol
                },
                {
                  amount: bnToAmount(_parsedJson?.amount_b ? _parsedJson?.amount_b : _parsedJson?.amount_out, _secondToken?.decimals).toString(),
                  address: _secondToken?.coin_type,
                  url: _secondToken?.logo_url,
                  symbol: _secondToken?.symbol
                }
              ]
            }
          })

          console.log('🚀 ~ const_data=result?.data?.map ~ _data:', _data)
          if (params?.cursor) {
            setList(pre => [...pre, ...(_data || [])])
          } else {
            setList(_data || [])
          }

          setNextCursor(result?.next_cursor)
          setHasNextPage(result?.has_next_page)
          setIsLoading(false)
        } else {
          if (currentPage === 1) {
            setHasNextPage(false)
          }
        }
      }
    } catch (error) {
      console.log(error, 'getTransactionsHistoryBySDK-error')
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }
  /**
   * 监听页码和池子地址变化，重新请求数据
   * Listen for changes in page number and pool address, and request data again
   */
  useDebounceEffect(
    () => {
      const params: PageQuery = {
        cursor: nextCursor,
        limit: pageSize
      }
      fetchData(params)
    },
    [currentPage, poolAddress],
    {
      wait: 500,
      leading: true,
      trailing: false
    }
  )

  /**
   * 切换下一页
   * Switch to the next page
   */
  const onCurrentPageChange = () => {
    setCurrentPage(pre => pre + 1)
  }

  return {
    isLoading,
    list,
    apiPoolInfo,
    currentPage,
    onCurrentPageChange,
    hasNextPage
  }
}

export default useRecentTransactions
