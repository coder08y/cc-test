import { DLMMStatsPoolsPath } from '@/apis/path'
import { DLMMPoolApiInfo } from '@/types'
import { formatCoinTypesParams } from '@/utils/pool'
import { useFetch } from '@cetus/hooks'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { normalizeCoinType } from '@cetusprotocol/common-sdk'
import { GetPoolListParams } from './type'
import useGetDlmmPoolList from './useGetDlmmPoolList'
import useWrapPoolData from './useWrapPoolData'
import { wrapGetPoolParams } from './utils'

export default function useGetDlmmPools() {
  const { fetchByApi } = useFetch()
  const { wrapDLmmPoolData } = useWrapPoolData()
  const { getLocalJsonPoolList } = useGetDlmmPoolList()

  const getDlmmPools = async (
    params: GetPoolListParams
  ): Promise<{
    list: DLMMPoolApiInfo[]
    total: number
    isLocal?: boolean
  }> => {
    const apiParams = { ...params }
    const coinTypes = formatCoinTypesParams(params?.coin_type)
    if (coinTypes) {
      apiParams['coin_type'] = coinTypes
    }
    const wrapApiParams = wrapGetPoolParams(apiParams)
    try {
      console.log('🚀🚀🚀 ~ getDlmmPools.ts:89 ~ getDlmmPools ~ warapApiParams:', wrapApiParams)

      const res = await fetchByApi(DLMMStatsPoolsPath, 'POST', wrapApiParams)
      console.log('🚀🚀🚀 ~ getDlmmPools.ts:41 ~ getDlmmPools ~ res:', res)
      // if ((!res?.data?.list || res?.data?.list?.length === 0) && envConfigs.env === 'testnet') {
      //   throw Error('testnet no data')
      // }

      if (res?.data?.list) {
        const poolList = res?.data?.list?.map((item: any) => {
          return wrapDLmmPoolData(item)
        })
        console.log('🚀 ~ file: getDlmmPools.ts:42 ~ poolList ~ poolList:', poolList)

        return {
          list: poolList,
          total: res?.data?.total
        }
      }
    } catch (error) {
      console.log('🚀 ~ useGetPoolList ~ error:', error)

      const res = await getLocalJsonPoolList(wrapApiParams, false)
      console.log('🚀 ~ useGetDlmmPools ~ res:', res)
      return res
    }

    return {
      list: [],
      total: 0
    }
  }

  const formatCoinAddress = (address: string) => {
    return normalizeCoinType(address) === '0x2::sui::SUI'
      ? '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
      : normalizeCoinType(address)
  }

  const getLocalJsonPoolAddress = async (from_type: string, to_type: string): Promise<string[]> => {
    try {
      const from = formatCoinAddress(from_type)
      const to = formatCoinAddress(to_type)

      const url = envConfigs.env === 'testnet' ? '/data/all-pools-testnet.json' : '/data/all-pools.json'
      const res = await fetch(url).then(rsp => {
        return rsp.json()
      })
      if (res) {
        const poolList = res[`${from.toLocaleLowerCase()}-${to.toLocaleLowerCase()}`] || res[`${to.toLocaleLowerCase()}-${from.toLocaleLowerCase()}`]

        console.log('🚀 --------------------------------------------------🚀')
        console.log(
          '🚀 ~ getLocalJsonPoolAddress ~ poolList:',
          poolList,
          `${from.toLocaleLowerCase()}-${to.toLocaleLowerCase()}`,
          `${to.toLocaleLowerCase()}-${from.toLocaleLowerCase()}`
        )
        console.log('🚀 --------------------------------------------------🚀')
        return poolList as string[]
      }
    } catch (error) {
      console.error('getLocalJsonPoolAddress Error:', error)
    }

    return []
  }

  return {
    getDlmmPools,
    getLocalJsonPoolList,
    getLocalJsonPoolAddress
  }
}
