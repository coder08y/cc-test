import { VaultList } from '@/apis/path'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import { useFetch } from '@cetus/hooks'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { VAULT_FILTER } from '@cetus/types/src/env'
import { formatCurrency } from '@cetus/utils'
import useFavoriteDlmmPool from '../pool/useFavoriteDlmmPool'
import useFavoritePool from '../pool/useFavoritePool'
import useWrapVaultsPoolData from './useWrapVaultsPoolData'

export default function useGetVaultPoolList() {
  const { fetchByApi } = useFetch()
  const { wrapVaultsPoolData } = useWrapVaultsPoolData()
  const { getFavoritePoolList } = useFavoritePool()
  const { getFavoritePoolList: getFavoriteDlmmPoolList } = useFavoriteDlmmPool()
  const { vaultsList, setVaultList, setVaultTotalTvlDisplay, setVaultListObj } = useVaultsListV2Store()

  const getPoolAddressList = (vaultsPool: any) => {
    const { clmm_pool, liquidity_pools } = vaultsPool
    const clmmPoolAddressList: Set<string> = new Set()
    const dlmmPoolAddressList: Set<string> = new Set()
    if (clmm_pool) {
      clmmPoolAddressList.add(clmm_pool)
    }
    if (liquidity_pools) {
      liquidity_pools.forEach((item: any) => {
        const { protocol, id } = item
        if (protocol === 'dlmm') {
          dlmmPoolAddressList.add(id)
        }
        if (protocol === 'clmm') {
          clmmPoolAddressList.add(id)
        }
      })
    }

    return {
      clmmPoolAddressList: Array.from(clmmPoolAddressList),
      dlmmPoolAddressList: Array.from(dlmmPoolAddressList)
    }
  }

  const getVaultPoolList = async () => {
    try {
      //  throw Error('testnet no data')
      const res = await fetchByApi(VaultList, 'GET')
      console.log('🚀🚀🚀 ~ useGetVaultPoolList.ts:20 ~ getVaultPoolList ~ res:', res)
      if ((!res?.list || res?.list?.length === 0) && envConfigs.env === 'testnet') {
        throw Error('testnet no data')
      }
      if (res.list) {
        const clmmPoolAddressSet: Set<string> = new Set()
        const dlmmPoolAddressSet: Set<string> = new Set()

        const filterVaultList = res.list.filter((item: any) => (VAULT_FILTER ? item.display : true))

        filterVaultList.forEach((item: any) => {
          const { clmmPoolAddressList, dlmmPoolAddressList } = getPoolAddressList(item)
          clmmPoolAddressList.forEach((clmmPoolAddress: string) => clmmPoolAddressSet.add(clmmPoolAddress))
          dlmmPoolAddressList.forEach((dlmmPoolAddress: string) => dlmmPoolAddressSet.add(dlmmPoolAddress))
        })

        const clmmPoolRes = await getFavoritePoolList({
          is_vaults: false,
          display_all_pools: false,
          has_mining: true,
          has_farming: true,
          no_incentives: true,
          order_by: '-vol',
          limit: 100,
          offset: 0,
          pools: Array.from(clmmPoolAddressSet)
        })

        const dlmmPoolRes = await getFavoriteDlmmPoolList({
          coinType: [],
          filter: 'all',
          limit: 100,
          offset: 0,
          pools: Array.from(dlmmPoolAddressSet)
        })

        if (clmmPoolRes?.list && dlmmPoolRes?.list) {
          const clmmPoolObj = Object.fromEntries(clmmPoolRes?.list.map((pool: any) => [pool.poolAddress, pool]))
          const dlmmPoolObj = Object.fromEntries(dlmmPoolRes?.list.map((pool: any) => [pool.poolAddress, pool]))
          const vaultsPoolList: any[] = []

          filterVaultList.forEach((vaultsPool: any) => {
            const { clmmPoolAddressList, dlmmPoolAddressList } = getPoolAddressList(vaultsPool)
            const clmmPoolList = clmmPoolAddressList.map((clmmPoolAddress: string) => clmmPoolObj[clmmPoolAddress])
            const dlmmPoolList = dlmmPoolAddressList.map((dlmmPoolAddress: string) => dlmmPoolObj[dlmmPoolAddress])
            if (clmmPoolList.length > 0 || dlmmPoolList.length > 0) {
              const pool = wrapVaultsPoolData(vaultsPool, clmmPoolList, dlmmPoolList)
              if (pool) {
                vaultsPoolList.push(pool)
              }
            } else {
              console.error("can't find pool", {
                vaultsPool,
                clmmPoolList,
                dlmmPoolList
              })
            }
          })

          console.log('🚀🚀🚀 ~ useGetVaultPoolList.ts:64 ~ poolList ~ poolList:', {
            vaultsPoolList
          })
          setVaultList(vaultsPoolList)
          const vaultListObj = vaultsPoolList.reduce((acc: any, curr: any) => {
            acc[curr.vaultId] = curr
            return acc
          }, {})
          setVaultListObj(vaultListObj)
          setVaultTotalTvlDisplay(formatCurrency(res?.total_tvl, 2))
          return { poolList: vaultsPoolList, vaultListObj }
        }
      }
    } catch (error) {
      console.log('🚀🚀🚀 ~ getVaultPoolList ~ error:', error)
      console.log('🚀🚀🚀 ~ useGetVaultPoolList.ts:48 ~ getVaultPoolList ~ vaultsList:', vaultsList)
      return getLocalVaultPoolList()
    }
  }

  // 接口报错走本地
  const getLocalVaultPoolList = async () => {
    const url = `/data/vault-pools${envConfigs.env == 'testnet' ? '-testnet' : ''}.json?timestamp=${new Date().getTime()}`
    console.log('🚀🚀🚀 ~ useGetVaultPoolList.ts:60 ~ getLocalVaultPoolList ~ url:', url)
    const list = await fetch(url).then(rsp => {
      return rsp.json()
    })
    console.log('🚀🚀🚀 ~ useGetVaultPoolList.ts:57 ~ list ~ list:', list)
    const poolList = list.map((vaultsPool: any) => {
      return wrapVaultsPoolData(vaultsPool, [], [], true)
    })
    console.log('🚀🚀🚀 ~ useGetVaultPoolList.ts:57 ~ poolList ~ poolList:', poolList)
    setVaultList(poolList)
    const vaultListObj = poolList.reduce((acc: any, curr: any) => {
      acc[curr.vaultId] = curr
      return acc
    }, {})
    setVaultListObj(vaultListObj)

    setVaultTotalTvlDisplay('--')
    return { poolList, vaultListObj }
  }

  return { getVaultPoolList, getLocalVaultPoolList }
}
