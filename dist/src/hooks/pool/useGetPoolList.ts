import { StatsPoolsPath } from '@/apis/path'
import { PoolApiInfo } from '@/types'
import { formatCoinTypesParams } from '@/utils/pool'
import { useFetch } from '@cetus/hooks'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { extractStructTagFromType, normalizeCoinType } from '@cetusprotocol/common-sdk'
import { GetPoolListParams } from './type'
import useWrapPoolData from './useWrapPoolData'
import { wrapGetPoolParams } from './utils'

export default function useGetPoolList() {
  const { fetchByApi } = useFetch()
  const { wrapPoolDataV2 } = useWrapPoolData()

  const getPoolList = async (
    params: GetPoolListParams
  ): Promise<{
    list: PoolApiInfo[]
    total: number
    isLocal?: boolean
  }> => {
    try {
      const apiParams = { ...params }
      const coinTypes = formatCoinTypesParams(params?.coin_type)
      if (coinTypes) {
        apiParams['coin_type'] = coinTypes
      }
      const wrapApiParams = wrapGetPoolParams(apiParams)

      const res = await fetchByApi(StatsPoolsPath, 'POST', wrapApiParams)
      if ((!res?.data?.list || res?.data?.list?.length === 0) && envConfigs.env === 'testnet') {
        throw Error('testnet no data')
      }

      if (res?.data?.list) {
        const poolList = res?.data?.list?.map((item: any) => {
          return wrapPoolDataV2(item)
        })
        console.log('🚀 ~ file: useGetPoolList.ts:42 ~ poolList ~ poolList:', poolList)

        return {
          list: poolList,
          total: res?.data?.total
        }
      }
    } catch (error) {
      console.log('🚀 ~ useGetPoolList ~ error:', error)

      return await getLocalJsonPoolList(params)
    }

    return {
      list: [],
      total: 0
    }
  }

  // 获取本地Json pool list数据
  const getLocalJsonPoolList = async (
    params: GetPoolListParams
  ): Promise<{
    list: PoolApiInfo[]
    total: number
    isLocal: boolean
  }> => {
    console.log('🚀🚀🚀 ~ useGetPoolList.ts:136 ~ useGetPoolList ~ params:', params)
    try {
      console.log('🚀 ~ useGetPoolList ~ envConfigs?.env:', envConfigs?.env)
      const url = envConfigs?.env === 'testnet' ? '/data/pools-testnet.json' : '/data/pools.json'

      const res = await fetch(url, { cache: 'no-cache' }).then(rsp => {
        return rsp.json()
      })
      console.log(res, 'getLocalJsonPoolList')
      if (res?.data?.list) {
        const originList = res?.data?.list
        let list = originList
        // 支持pool筛选
        if (params?.pools) {
          list = originList?.filter((item: any) => params?.pools && params?.pools[0]?.toLocaleLowerCase() == item?.pool.toLocaleLowerCase())
        }

        if (params?.pool) {
          list = originList?.filter((item: any) => params?.pool && params?.pool?.toLocaleLowerCase() == item?.pool.toLocaleLowerCase())
        }
        console.log('🚀🚀🚀 ~ useGetPoolList.ts:151 ~ useGetPoolList ~ list:', list)
        console.log('🚀🚀🚀 ~ useGetPoolList.ts:151 ~ useGetPoolList ~ originList:', originList)

        // 支持coin_type筛选
        if (params?.coin_type) {
          const coinArr = params?.coin_type?.split(',')?.map(item => extractStructTagFromType(item).source_address)
          list = originList?.filter((item: any) => {
            const coinTypeA = extractStructTagFromType(item?.coinA?.coinType).source_address
            const coinTypeB = extractStructTagFromType(item?.coinB?.coinType).source_address
            if (coinArr?.length > 1 && coinArr.includes(coinTypeA) && coinArr.includes(coinTypeB)) {
              return true
            } else if (coinArr?.length === 1 && (coinArr.includes(coinTypeA) || coinArr.includes(coinTypeB))) {
              return true
            } else {
              return false
            }
          })
        }

        // 支持vaults筛选
        if (params?.is_vaults) {
          list = originList?.filter((item: any) => item?.is_vaults)
        }

        // 支持farms筛选
        if (params?.has_farming && !params?.is_vaults && !params?.has_mining && !params?.no_incentives) {
          list = originList?.filter((item: any) => item?.farmingRewarder && item?.farmingRewarder?.clmmPool)
        }

        // 走本地数据时 页面只渲染40条数据
        const resultList = JSON.parse(JSON.stringify(list)).splice(0, 40)
        console.log('🚀 ~ useGetPoolList ~ resultList:', resultList)
        const poolList = resultList?.map((item: any) => {
          return wrapPoolDataV2(item, true)
        })

        console.log('getLocalJsonPoolList 🚀 ~ poolList ~ poolList:', poolList)

        return {
          list: poolList,
          total: list?.length || 0,
          isLocal: true
        }
      }
    } catch (error) {
      console.error('getLocalJsonPoolList Error:', error)
    }

    return {
      list: [],
      total: 0,
      isLocal: false
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
    getPoolList,
    getLocalJsonPoolList,
    getLocalJsonPoolAddress,
    wrapGetPoolParams
  }
}
