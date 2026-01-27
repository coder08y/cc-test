import { DLMMStatsPairsPath } from '@/apis/path'
import { DLMMPoolApiInfo } from '@/types/pool'
import { formatCoinTypesParams } from '@/utils/pool'
import { useFetch } from '@cetus/hooks'
import { useSdk, useSdkStore } from '@cetus/sdk-factory'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useCallback } from 'react'
import useWrapDlmmPoolData from './useWrapDlmmPoolData'
import useWrapPoolData from './useWrapPoolData'
import { wrapGetDlmmPoolParams } from './utils'

export default function useGetDlmmPoolList() {
  const dlmmSdk = useSdk('dlmm')
  const { isInitialized } = useSdkStore()
  const { fetchByApi } = useFetch()
  const { wrapDlmmGroupedPoolData } = useWrapDlmmPoolData()
  const { wrapDLmmPoolData } = useWrapPoolData()

  const getDlmmPoolListFromApi = async (params: any) => {
    try {
      const apiParams = { ...params }
      const coinTypes = formatCoinTypesParams(params?.coin_type)
      if (coinTypes) {
        apiParams['coin_type'] = coinTypes
      }
      const wrapApiParams = wrapGetDlmmPoolParams(apiParams)
      const res = await fetchByApi(DLMMStatsPairsPath, 'POST', wrapApiParams)

      console.log('🚀 ~ getDlmmPoolListFromApi ~ res:', res)
      // if ((!res?.data?.list || res?.data?.list?.length === 0) && envConfigs.env === 'testnet') {
      //   throw Error('testnet no data')
      // }
      if (res?.data?.list) {
        const poolList = wrapDlmmGroupedPoolData(res?.data?.list)
        console.log('🚀 ~ file: useGetDlmmPoolList.ts:22 ~ poolList ~ poolList:', poolList)

        return {
          list: poolList,
          total: res?.data?.pool_num,
          isLocal: false
        }
      }
    } catch (error) {
      console.log('🚀 ~ getLocalJsonPoolList ~ error:', error)
      return await getLocalJsonPoolList(params, true)
    }

    return {
      list: [],
      total: 0
    }
  }

  const getLocalJsonPoolList = async (
    params: any,
    isGetGroupData: boolean = true
  ): Promise<{
    list: DLMMPoolApiInfo[]
    total: number
    isLocal: boolean
  }> => {
    console.log('🚀🚀🚀 ~ useGetPoolList.ts:136 ~ useGetPoolList ~ params:', params)
    try {
      console.log('🚀 ~ useGetPoolList ~ envConfigs?.env:', envConfigs?.env)
      const url = envConfigs?.env === 'testnet' ? '/data/dlmm-pools-testnet.json' : '/data/dlmm-pools.json'

      const res = await fetch(url, { cache: 'no-cache' }).then(rsp => {
        return rsp.json()
      })
      console.log(res, 'getLocalJsonPoolList')
      if (res?.data?.list) {
        const originList = res?.data?.list
        let list = originList

        // 支持pool筛选
        if (params?.pools) {
          const lowerCaseParamsPools = params?.pools?.map((p: string) => p?.toLowerCase())
          list = originList?.filter((item: any) => {
            // 检查是否有匹配的池子
            const hasMatchingPool = item?.pools?.some((pool: any) => lowerCaseParamsPools?.includes(pool?.pool?.toLowerCase()))
            if (hasMatchingPool) {
              // 如果有匹配的池子，过滤掉不属于params.pools的池子
              item.pools = item.pools?.filter((pool: any) => lowerCaseParamsPools?.includes(pool?.pool?.toLowerCase()))
            }
            return hasMatchingPool
          })
        }

        if (params?.pool) {
          const lowerCaseParamsPool = params?.pool?.toLowerCase()
          list = originList?.filter((item: any) => {
            // 检查是否有匹配的池子
            const hasMatchingPool = item?.pools?.some((pool: any) => pool?.pool?.toLowerCase() === lowerCaseParamsPool)
            if (hasMatchingPool) {
              // 如果有匹配的池子，过滤掉不属于params.pool的池子
              item.pools = item.pools?.filter((pool: any) => pool?.pool?.toLowerCase() === lowerCaseParamsPool)
            }
            return hasMatchingPool
          })
        }
        console.log('🚀🚀🚀 ~ useGetPoolList.ts:151 ~ useGetPoolList ~ originList:', params, originList)

        // 支持coin_type筛选
        if ((params?.coinTypes && params?.coinTypes?.length > 0) || (params?.coin_type && params?.coin_type?.length > 0)) {
          const coinArr = params?.coinTypes || params?.coin_type
          console.log(coinArr, originList, 'coinArr, originList')
          list = originList?.filter((item: any) => {
            const coinTypeA = fixCoinType(item?.coinA?.coinType, false)
            const coinTypeB = fixCoinType(item?.coinB?.coinType, false)
            if (
              coinArr?.length > 1 &&
              ((coinArr.includes(coinTypeA) && coinArr.includes(coinTypeB)) || (coinArr.includes(coinTypeB) && coinArr.includes(coinTypeA)))
            ) {
              return true
            } else if (coinArr?.length === 1 && (coinArr.includes(coinTypeA) || coinArr.includes(coinTypeB))) {
              return true
            } else {
              return false
            }
          })
        }

        if (isGetGroupData) {
          const poolList = wrapDlmmGroupedPoolData(list, true)

          console.log('getLocalJsonPoolList 🚀 ~ poolList ~ poolList:', poolList)

          return {
            list: poolList,
            total: list?.length || 0,
            isLocal: true
          }
        }
        const newList: any = []
        const poolList = list?.map((item: any) => {
          item.pools?.forEach((pool: any) => {
            newList.push(wrapDLmmPoolData({ ...pool, ...item }, true))
          })
        })
        console.log('getLocalJsonPoolList 🚀 ~ poolList ~ poolList:', poolList)

        return {
          list: newList,
          total: newList?.length || 0,
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

  const getDlmmPoolList = useCallback(
    (params: any) => {
      if (isInitialized) {
        // return getDlmmPoolListFromSdk(params).then(res => {
        //   return res
        // })
        return getDlmmPoolListFromApi(params).then(res => {
          return res
        })
      } else {
        setTimeout(() => {
          getDlmmPoolList(params)
        }, 1000)
      }
    },
    [isInitialized]
  )

  return {
    getDlmmPoolList,
    getLocalJsonPoolList
  }
}
