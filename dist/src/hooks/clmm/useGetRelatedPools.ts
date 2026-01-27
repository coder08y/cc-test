import useLiquidityStore from '@/store/clmm'
import { PoolApiInfo } from '@/types'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { Token } from '@cetus/types'
import { d, isAvailableObject } from '@cetus/utils'
import { maxBy } from 'lodash-es'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useGetPoolList from '../pool/useGetPoolList'

function useGetRelatedPools() {
  const { tab, poolAddress, from, to, fee } = useQueryParams()
  const { getPoolList } = useGetPoolList()
  const [relatedPoolList, setRelatedPoolList] = useState<Partial<PoolApiInfo>[]>([])
  const { apiPoolInfo, setApiPoolInfo, setApiPoolInfoLoading, setNetError } = useLiquidityStore()
  const navigate = useNavigate()
  const { fetchTokenInfo } = useGetToken()

  /**
   * 获取当前token对的相关池子列表
   * Get the related pool list of the current token pair
   * @param param0 poolAddress: 池子地址 / poolAddress: poolAddress
   * @param param1 from: 代币A coin_type / from: tokenA coin_type
   * @param param2 to: 代币B coin_type / to: tokenB coin_type
   */
  const getList = async ({ poolAddress, from, to }: { poolAddress?: string; from?: string; to?: string }) => {
    console.log('🚀🚀🚀 ~ useGetRelatedPools.ts:148 ~ getList ~ getList:')
    try {
      setApiPoolInfoLoading(true)
      let res, pool
      if (poolAddress && poolAddress !== 'undefined') {
        console.log('🚀🚀🚀 ~ useGetRelatedPools.ts:32 ~ getList ~ poolAddress:', poolAddress)
        const _res = await getPoolList({ pools: [poolAddress], display_all_pools: true })
        console.log('🚀🚀🚀 ~ useGetRelatedPools.ts:52 ~ getList ~ _res:', _res)
        if (_res && _res.list && _res.list.length) {
          pool = _res.list[0]
          res = await getPoolList({
            coin_type: `${pool?.displayTokenA?.coin_type},${pool?.displayTokenB?.coin_type}`,
            is_vaults: false,
            display_all_pools: true,
            has_mining: true,
            has_farming: true,
            no_incentives: true,
            order_by: '-vol',
            offset: 0
          })
        } else if (apiPoolInfo && isAvailableObject(apiPoolInfo)) {
          pool = apiPoolInfo
          res = { list: relatedPoolList }
        } else {
          pool = { poolAddress, displayTokenA: undefined, displayTokenB: undefined }
          res = { list: [] }
        }
        setApiPoolInfoLoading(false)
      } else if (from && to && from !== 'undefined' && to !== 'undefined' && from !== to) {
        const _res = await getPoolList({
          coin_type: `${from},${to}`,
          is_vaults: false,
          display_all_pools: true,
          has_mining: true,
          has_farming: true,
          no_incentives: true,
          order_by: '-vol',
          offset: 0
        })
        console.log(_res, 'res_getPoolList')
        if (_res && _res.list && _res.list.length) {
          if (fee && fee !== 'undefined') {
            const _pool = _res?.list?.find(item => d(item?.feeRate).eq(fee))
            if (_pool) {
              if (tab) {
                navigate(`/clmm?tab=${tab}&poolAddress=${_pool?.poolAddress}`)
              } else {
                navigate(`/clmm?poolAddress=${_pool?.poolAddress}`)
              }
            } else {
              const _pool = maxBy(_res?.list, item => Number(item?.tvl || '0'))
              if (tab) {
                navigate(`/clmm?tab=${tab}&poolAddress=${_pool?.poolAddress}`)
              } else {
                navigate(`/clmm?poolAddress=${_pool?.poolAddress}`)
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
            if (tab) {
              navigate(`/clmm?tab=${tab}&poolAddress=${_pool?.poolAddress}`)
            } else {
              navigate(`/clmm?poolAddress=${_pool?.poolAddress}`)
            }
          }
        } else {
          const tokenMap = await fetchTokenInfo([from, to].filter(Boolean))
          const _displayTokenA = (tokenMap as Map<string, Token>)?.get(from)
          const _displayTokenB = (tokenMap as Map<string, Token>)?.get(to)
          pool = { poolAddress: undefined, displayTokenA: _displayTokenA, displayTokenB: _displayTokenB }
          res = { list: [] }
          setApiPoolInfoLoading(false)
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
        setApiPoolInfoLoading(false)
      }
      if (res) {
        setNetError(false)
        setRelatedPoolList(res?.list)
        console.log(pool, 'setApiPoolInfo')
        if (pool) {
          if (pool?.poolAddress && poolAddress) {
            if (pool?.poolAddress === poolAddress) {
              setApiPoolInfo(pool as any)
            }
          } else {
            setApiPoolInfo(pool as any)
          }
        }
      }

      setApiPoolInfoLoading(false)
    } catch (error) {
      if ((error as any)?.list && (error as any)?.list?.length === 1) {
        setNetError(true)
        const _pool = (error as any)?.list[0]
        console.log((error as any)?.list, 'setApiPoolInfo')

        setApiPoolInfo(_pool)
        setRelatedPoolList([])
        setApiPoolInfoLoading(false)
      }
    }
  }
  useEffect(() => {
    if (poolAddress && poolAddress === 'undefined') return
    if (!poolAddress && poolAddress === undefined && !from && !to) return
    getList({ poolAddress, from, to })
  }, [poolAddress, from, to])
  return {
    getList,
    relatedPoolList
  }
}

export default useGetRelatedPools
