import useDlmmLiquidityStore from '@/store/dlmm'
import { DLMMPoolApiInfo, PoolApiInfo } from '@/types'
import { useFetch } from '@cetus/hooks'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { Token } from '@cetus/types'
import { d, isAvailableObject } from '@cetus/utils'
import { maxBy } from 'lodash-es'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useGetDlmmPools from '../pool/useGetDlmmPools'
import useGetDlmmContractPoolInfo from './useGetDlmmContractPoolInfo'

function useGetDlmmRelatedPools() {
  const { tab, poolId, from, to, fee, type } = useQueryParams()
  const [relatedPoolList, setRelatedPoolList] = useState<Partial<PoolApiInfo>[]>([])
  const { dlmmApiPoolInfo, setDlmmApiPoolInfo, setDlmmApiPoolInfoLoading, setNetError } = useDlmmLiquidityStore()
  const navigate = useNavigate()
  const { fetchTokenInfo } = useGetToken()
  const { getDlmmPools } = useGetDlmmPools()
  const { fetchByApi } = useFetch()
  const { getDlmmContractPoolInfo } = useGetDlmmContractPoolInfo()

  /**
   * 获取当前token对的相关池子列表
   * Get the related pool list of the current token pair
   * @param param0 poolAddress: 池子地址 / poolAddress: poolAddress
   * @param param1 from: 代币A coin_type / from: tokenA coin_type
   * @param param2 to: 代币B coin_type / to: tokenB coin_type
   */
  const getList = async ({ poolId, from, to }: { poolId?: string; from?: string; to?: string }) => {
    console.log('🚀🚀🚀 ~ useGetRelatedPools.ts:148 ~ getList ~ getList:')
    try {
      setDlmmApiPoolInfoLoading(true)
      let res, pool: DLMMPoolApiInfo | undefined
      if (poolId && poolId !== 'undefined') {
        console.log('🚀🚀🚀 ~ useGetRelatedPools.ts:32 ~ getList ~ poolId:', poolId)
        const _res = await getDlmmPools({ pools: [poolId], display_all_pools: true })
        console.log('🚀🚀🚀 ~ useGetRelatedPools.ts:52 ~ getList ~ _res:', _res)
        if (_res && _res.list && _res.list.length) {
          pool = _res.list[0]
          res = await getDlmmPools({
            coin_type: `${pool?.displayTokenA?.coin_type},${pool?.displayTokenB?.coin_type}`,
            is_vaults: false,
            display_all_pools: true,
            has_mining: true,
            has_farming: true,
            no_incentives: true,
            order_by: '-vol',
            offset: 0,
            limit: 100
          })
        } else if (dlmmApiPoolInfo && isAvailableObject(dlmmApiPoolInfo)) {
          pool = dlmmApiPoolInfo
          res = { list: relatedPoolList }
        } else {
          pool = { poolId, displayTokenA: undefined, displayTokenB: undefined }
          res = { list: [] }
        }
        setDlmmApiPoolInfoLoading(false)
      } else if (from && to && from !== 'undefined' && to !== 'undefined' && from !== to) {
        const _res = await getDlmmPools({
          coin_type: `${from},${to}`,
          is_vaults: false,
          display_all_pools: true,
          has_mining: true,
          has_farming: true,
          no_incentives: true,
          order_by: '-vol',
          offset: 0,
          limit: 100
        })
        console.log(res, pool, 'setDlmmApiPoolInfoLoading')
        if (_res && _res.list && _res.list.length) {
          if (fee && fee !== 'undefined') {
            const _pool = _res?.list?.find(item => d(item?.feeRate).eq(fee))
            if (!type || type !== 'create') {
              if (_pool) {
                if (tab) {
                  navigate(`/dlmm?tab=${tab}&poolId=${_pool?.poolAddress}`)
                } else {
                  navigate(`/dlmm?poolId=${_pool?.poolAddress}`)
                }
              } else {
                const _pool = maxBy(_res?.list, item => Number(item?.tvl || '0'))
                if (tab) {
                  navigate(`/dlmm?tab=${tab}&poolId=${_pool?.poolId}`)
                } else {
                  navigate(`/dlmm?poolId=${_pool?.poolId}`)
                }
              }
            }
          } else {
            let _pool = maxBy(_res?.list, item => Number(item?.tvl || '0'))

            if (!_pool) {
              _pool = maxBy(_res?.list, item => Number(item?.object?.liquidity || '0'))
              if (!_pool) {
                _pool = _res?.list[0]
              }
            }
            if (!type || type !== 'create') {
              if (tab) {
                navigate(`/dlmm?tab=${tab}&poolId=${_pool?.poolId}`)
              } else {
                navigate(`/dlmm?poolId=${_pool?.poolId}`)
              }
            }
          }
        } else {
          const tokenMap = await fetchTokenInfo([from, to].filter(Boolean))
          const _displayTokenA = (tokenMap as Map<string, Token>)?.get(from)
          const _displayTokenB = (tokenMap as Map<string, Token>)?.get(to)
          pool = { poolAddress: undefined, displayTokenA: _displayTokenA, displayTokenB: _displayTokenB }
          res = { list: [] }
          setDlmmApiPoolInfoLoading(false)
        }
      } else {
        if ((!from || from === 'undefined') && to && to !== 'undefined') {
          const _displayTokenB = await fetchTokenInfo(to)
          pool = { poolAddress: undefined, displayTokenA: undefined, displayTokenB: _displayTokenB as Token }
        }
        if ((!to || to === 'undefined') && from && from !== 'undefined') {
          const _displayTokenA = await fetchTokenInfo(from)
          pool = { poolAddress: undefined, displayTokenA: _displayTokenA as Token, displayTokenB: undefined }
        }

        res = { list: [] }
        setDlmmApiPoolInfoLoading(false)
      }
      if (res) {
        console.log(res, pool, 'res, pool')
        setNetError(false)
        setRelatedPoolList(res?.list)
        if (pool) {
          if (pool?.poolAddress && poolId) {
            if (pool?.poolAddress === poolId) {
              setDlmmApiPoolInfo(pool as any)
            }
          } else {
            if (poolId) {
              await getDlmmContractPoolInfo(poolId)
            } else {
              setDlmmApiPoolInfo(pool as any)
            }
          }
        }
      }

      setDlmmApiPoolInfoLoading(false)
    } catch (error) {
      if ((error as any)?.list && (error as any)?.list?.length === 1) {
        setNetError(true)
        const _pool = (error as any)?.list[0]
        console.log((error as any)?.list, 'setApiPoolInfo')

        setDlmmApiPoolInfo(_pool)

        setRelatedPoolList([])
      }
    } finally {
      setDlmmApiPoolInfoLoading(false)
    }
  }

  useEffect(() => {
    if (poolId && poolId === 'undefined') return
    if (!poolId && poolId === undefined && !from && !to) return

    getList({ poolId, from, to })
    // getDlmmContractPoolInfo(poolId)
  }, [poolId, from, to, type])

  return {
    getList,
    relatedPoolList
  }
}

export default useGetDlmmRelatedPools
