import { DataItem, EventEnums } from '@/components/liquidity/clmm/recentTransactions/type'
import useDlmmLiquidityStore from '@/store/dlmm'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { bnToAmount } from '@cetus/utils'
import { PageQuery, fixCoinType } from '@cetusprotocol/common-sdk'
import { useDebounceEffect } from 'ahooks'
import { useEffect, useState } from 'react'
import useDlmmTransactionHistory from './useDlmmTransactionHIstory'

function useDlmmRecentTransactions() {
  const pageSize = 10

  const { getTransactionsHistoryBySDK } = useDlmmTransactionHistory()
  const [isLoading, setIsLoading] = useState(true)
  const [list, setList] = useState<DataItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [hasNextPage, setHasNextPage] = useState(true)
  const { dlmmApiPoolInfo, manualRefresh, setManualRefresh } = useDlmmLiquidityStore()
  const { poolId } = useQueryParams()
  /**
   * 根据池子地址初始化第一页数据
   * Initialize the first page data based on the pool address
   */
  useEffect(() => {
    setList([])
    setCurrentPage(1)
    setNextCursor(undefined)
    setHasNextPage(true)
  }, [poolId])

  /**
   * 手动刷新，回到第一页，重新请求第一页数据
   * Manually refresh and request the first page data
   */
  useEffect(() => {
    if (manualRefresh) {
      setList([])
      setCurrentPage(1)
      setNextCursor(undefined)
      setHasNextPage(false)
      fetchData({
        cursor: undefined,
        limit: pageSize
      })
    }
  }, [poolId, manualRefresh])

  const fetchData = async (params: PageQuery) => {
    try {
      if (!hasNextPage) return
      if (poolId) {
        setIsLoading(true)
        const result: any = await getTransactionsHistoryBySDK(poolId, { ...params })
        if (result) {
          const _data = result?.data?.map((item: any) => {
            const _parsedJson = item?.parsed_json
            const _firstToken = _parsedJson?.from
              ? fixCoinType(_parsedJson?.from?.name, false) === dlmmApiPoolInfo?.tokenA?.coinType
                ? dlmmApiPoolInfo?.tokenA
                : dlmmApiPoolInfo?.tokenB
              : dlmmApiPoolInfo?.tokenA

            const _secondToken = _parsedJson?.target
              ? fixCoinType(_parsedJson?.target?.name, false) === dlmmApiPoolInfo?.tokenB?.coinType
                ? dlmmApiPoolInfo?.tokenB
                : dlmmApiPoolInfo?.tokenA
              : dlmmApiPoolInfo?.tokenB
            return {
              ...item,
              type: ['Add', 'Open'].some(p => item.type?.includes(p))
                ? EventEnums.add
                : item.type?.includes('Remove') || item.type?.includes('Close')
                  ? EventEnums.remove
                  : EventEnums.swap,
              items: [
                {
                  amount: bnToAmount(
                    _parsedJson?.total_amount_a ? _parsedJson?.total_amount_a : _parsedJson?.amount_in,
                    _firstToken?.decimals
                  ).toString(),
                  address: _firstToken?.coin_type,
                  url: _firstToken?.logo_url,
                  symbol: _firstToken?.symbol
                },
                {
                  amount: bnToAmount(
                    _parsedJson?.total_amount_b ? _parsedJson?.total_amount_b : _parsedJson?.amount_out,
                    _secondToken?.decimals
                  ).toString(),
                  address: _secondToken?.coin_type,
                  url: _secondToken?.logo_url,
                  symbol: _secondToken?.symbol
                }
              ]
            }
          })

          if (params?.cursor) {
            setList(pre => [...pre, ...(_data || [])])
          } else {
            setList(_data || [])
          }

          setNextCursor(result?.next_cursor)
          setHasNextPage(result?.has_next_page)
          setIsLoading(false)
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
    [currentPage, poolId],
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
    dlmmApiPoolInfo,
    currentPage,
    onCurrentPageChange,
    hasNextPage
  }
}

export default useDlmmRecentTransactions
