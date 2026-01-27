import { AllStatsPoolsPath, DlmmStatsPoolsPath, StatsPoolsPath } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import useWrapPoolData from '../pool/useWrapPoolData'

export type GetStatsPoolsParams = {
  order_by?: string
  limit?: number
  offset?: number
}

export default function useStatsPools() {
  const { fetchByApi } = useFetch()
  const { wrapPoolDataV2, wrapDLmmPoolData } = useWrapPoolData()

  const getClmmStatsPools = async (params: GetStatsPoolsParams) => {
    const { order_by, limit, offset } = params
    const wrapParams = {
      filter: 'verified',
      sortBy: '-vol',
      sortOrder: 'asc',
      limit,
      offset
    }
    if (order_by) {
      const orderBy = order_by.replace('-', '').toLowerCase()
      wrapParams.sortBy = orderBy == 'fees' ? 'fee' : orderBy == 'totalapr' ? 'totalApr' : orderBy
    }
    if (order_by && order_by?.indexOf('-') > -1) {
      wrapParams.sortOrder = 'desc'
    }
    const res = await fetchByApi(StatsPoolsPath, 'GET', wrapParams)
    if (res?.list) {
      const poolsData = res?.list?.map((item: any) => {
        return wrapPoolDataV2(item)
      })
      console.log('🚀 ~ file: useStatsPools.ts:13 ~ getStatsPools ~ poolsData:', poolsData)

      return {
        data: poolsData,
        total: res?.total
      }
    }

    return null
  }

  const getAllStatsPools = async (params: GetStatsPoolsParams) => {
    const { order_by, limit, offset } = params
    const wrapParams = {
      filter: 'verified',
      sortBy: '-vol',
      sortOrder: 'asc',
      limit,
      offset
    }
    if (order_by) {
      const orderBy = order_by.replace('-', '').toLowerCase()
      wrapParams.sortBy = orderBy == 'fees' ? 'fee' : orderBy == 'totalapr' ? 'totalApr' : orderBy
    }
    if (order_by && order_by?.indexOf('-') > -1) {
      wrapParams.sortOrder = 'desc'
    }
    const res = await fetchByApi(AllStatsPoolsPath, 'POST', wrapParams)
    console.log(res, 'AllStatsPoolsPath')
    if (res?.data && res?.data?.list && res?.data?.list?.length > 0) {
      const poolsData = res?.data?.list?.map((item: any) => {
        if (item?.poolType === 'clmm') {
          return wrapPoolDataV2(item)
        }
        if (item?.poolType === 'dlmm') {
          return wrapDLmmPoolData(item)
        }
      })
      console.log('🚀 ~ file: useStatsPools.ts:13 ~ getStatsPools ~ poolsData:', poolsData)

      return {
        data: poolsData,
        total: res?.data?.total
      }
    }

    return null
  }

  const getDlmmStatsPools = async (params: GetStatsPoolsParams) => {
    const { order_by, limit, offset } = params
    const wrapParams = {
      filter: 'verified',
      sortBy: '-vol',
      sortOrder: 'asc',
      limit,
      offset
    }
    if (order_by) {
      const orderBy = order_by.replace('-', '').toLowerCase()
      wrapParams.sortBy = orderBy == 'fees' ? 'fee' : orderBy == 'totalapr' ? 'totalApr' : orderBy
    }
    if (order_by && order_by?.indexOf('-') > -1) {
      wrapParams.sortOrder = 'desc'
    }
    const res = await fetchByApi(DlmmStatsPoolsPath, 'POST', wrapParams)
    console.log(res, 'AllStatsPoolsPath')
    if (res?.data && res?.data?.list && res?.data?.list?.length > 0) {
      const poolsData = res?.data?.list?.map((item: any) => {
        return wrapDLmmPoolData(item)
      })
      console.log('🚀 ~ file: useStatsPools.ts:13 ~ getStatsPools ~ poolsData:', poolsData)
      return {
        data: poolsData,
        total: res?.data?.total
      }
    }

    return null
  }

  return {
    getClmmStatsPools,
    getAllStatsPools,
    getDlmmStatsPools
  }
}
