import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { DlmmPosBaseInfo, GetPositionBaseListOptions } from '@/types/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { clmmConfig } from '@cetus/types/src/config/envConfigs'
import { d } from '@cetus/utils'
import { DataPage } from '@cetusprotocol/common-sdk'
import useGetPriceRange from '../clmm/useGetPriceRange'
import useGetDlmmPosFeeAndReward from '../dlmm-position/useGetDlmmPosFeeAndReward'
import useGetDlmmPosLiquiditys from '../dlmm-position/useGetDlmmPosLiquiditys'
import useGetDlmmPosPool from '../dlmm-position/useGetDlmmPosPool'
import useGetFarmsPosRewards from './useGetFarmsPosRewards'
import useGetPosApiPoolData from './useGetPosApiPoolData'
import useGetPosInfoList from './useGetPosInfoList'
import useGetPosLiquiditys from './useGetPosLiquiditys'
import useGetPosPools from './useGetPosPools'
import useGetPosRewards from './useGetPosRewards'
import useGetPositionVesting from './useGetPosVesting'
import useGetPosfees from './useGetPosfees'
import usePosHelper from './usePosHelper'
import useWrapPosData from './useWrapPosData'

export class RpcNodeError extends Error {
  code: string
  constructor(message: string) {
    super(message)
    this.code = 'RPC_NODE_ERROR'
    this.name = 'RpcNodeError'
  }
}

export default function usePositionList() {
  const clmmSdk = useSdk('clmm')
  const { setDlmmPosBaseListLoading, setDlmmPosBaseList } = useDlmmPositionStore()
  const { buildPositionType, buildFarmsPositionType, buildBurnPositionType, buildDlmmPositionType } = usePosHelper()
  const { buildPosBaseInfo } = useWrapPosData()
  const { setPosBaseList, setFullRangePosBaseList, setPosBaseListLoading, setPosLiquidityDataLoading, setPosRewardsDataLoading } = usePositionStore()
  const { getPosPoolsOriginalObj, getPosPoolsRelatedData } = useGetPosPools()
  const { getPosLiquidityData } = useGetPosLiquiditys()
  const { getPosFeeData } = useGetPosfees()
  const { getPosApiPoolData } = useGetPosApiPoolData()
  const { getPosRewardsData } = useGetPosRewards()
  const { getFarmsRewardsData } = useGetFarmsPosRewards()
  const { fetchPriceRanges } = useGetPriceRange()
  const { getVestingList } = useGetPositionVesting()
  const { getPositionInfoList } = useGetPosInfoList()
  const { getDlmmPosPoolsOriginalObj, getDlmmPosPoolsRelatedData } = useGetDlmmPosPool()
  const { getDlmmPosLiquidityData } = useGetDlmmPosLiquiditys()
  const { getDlmmPosFeeAndReward } = useGetDlmmPosFeeAndReward()

  const getPositionBaseList = async (
    account: string,
    options?: GetPositionBaseListOptions
  ): Promise<{ clmmPosBaseList: PosBaseInfo[]; dlmmPosBaseList: DlmmPosBaseInfo[] }> => {
    const { clmmPool, useInVest, fetchType = 'all', isFarmsPage = false } = options || {}
    console.log('🚀 ~ getPositionBaseList ~ clmmPool:', clmmPool)
    setPosBaseListLoading(true)
    try {
      const posFilter = []

      if (fetchType === 'all' || fetchType === 'clmm') {
        posFilter.push(
          {
            Package: clmmConfig.clmm_pool.package_id
          },
          {
            StructType: buildFarmsPositionType
          },
          {
            StructType: buildBurnPositionType
          }
        )
      }

      if (fetchType === 'all' || fetchType === 'dlmm') {
        setDlmmPosBaseListLoading(true)
        posFilter.push({
          StructType: buildDlmmPositionType
        })
      }
      console.log('🚀🚀🚀 ~ usePositionList.ts:81 ~ usePositionList ~ posFilter:', posFilter)

      const ownerRes = await clmmSdk!.FullClient.getOwnedObjectsByPage(account, {
        options: { showType: true, showContent: true, showOwner: true },
        filter: {
          MatchAny: posFilter
        }
      })

      console.log('🚀 ~ file: usePositionList.ts:25 ~ getPositionList ~ ownerRes:', ownerRes)

      let posBaseList: PosBaseInfo[] = []
      let dlmmPosBaseList: DlmmPosBaseInfo[] = []

      for (const item of ownerRes.data as any[]) {
        const info = await buildPosBaseInfo(item)
        if (info && info?.displayTokenA && info?.displayTokenB) {
          const posType = info?.posType
          if (posType === 'dlmm') {
            dlmmPosBaseList.push(info)
          } else {
            if (!useInVest && d(info?.liquidity).lte(0)) continue
            posBaseList.push(info)
          }
        }
      }

      console.log('🚀 ~ file: usePositionList.ts:33 ~ getPositionList ~ posBaseList:', posBaseList, dlmmPosBaseList)

      // 获取受损仓位列表, 通过获取positionInfo矫正受损仓位的liquidity
      const vestingList = await getVestingList(posBaseList)
      console.log('🚀 ~ getPositionBaseList ~ vestingList:', vestingList)
      if (vestingList?.length > 0) {
        posBaseList = await getPositionInfoList(posBaseList, vestingList)
        console.log('🚀 ~ getPositionBaseList ~ posBaseList:', posBaseList)
      }

      // 排序
      const sortBaseList = posBaseList.sort((a: any, b: any) => b.version - a.version)
      const sortDlmmList = dlmmPosBaseList.sort((a: any, b: any) => b.version - a.version)

      let filterPosBaseList: PosBaseInfo[] = []
      let filterDlmmPosBaseList: DlmmPosBaseInfo[] = []
      if (!clmmPool) {
        filterPosBaseList = sortBaseList
        filterDlmmPosBaseList = sortDlmmList
      } else {
        filterPosBaseList = sortBaseList?.filter((item: PosBaseInfo) => item.clmmPool === clmmPool)
        filterDlmmPosBaseList = sortDlmmList?.filter((item: DlmmPosBaseInfo) => item.dlmmPool === clmmPool)
      }
      console.log(localStorage.getItem('useAccountStore'), useAccountStore.getState().currentAccount, 'useAccountStore')
      const currentAddress = useAccountStore.getState().currentAccount?.address
      if (account === currentAddress) {
        setPosBaseList(filterPosBaseList)
        setDlmmPosBaseList(filterDlmmPosBaseList)
        if (filterPosBaseList?.length == 0) {
          setFullRangePosBaseList([])
          setPosLiquidityDataLoading(false)
        }

        // 异步加载数据
        getPosRelatedData(filterPosBaseList, isFarmsPage)
        getPosDlmmRelatedData(filterDlmmPosBaseList)
        setDlmmPosBaseListLoading(false)
        setPosBaseListLoading(false)
        return {
          clmmPosBaseList: filterPosBaseList,
          dlmmPosBaseList: filterDlmmPosBaseList
        }
      } else {
        return {
          clmmPosBaseList: [],
          dlmmPosBaseList: []
        }
      }
    } catch (error) {
      console.error('🚀 ~ getPositionBaseList ~ 79 ~ error:', error)
      setDlmmPosBaseListLoading(false)
      setPosBaseListLoading(false)
      if (error instanceof TypeError) {
        setPosBaseList([])
        setDlmmPosBaseList([])
        throw new RpcNodeError('Something went wrong, please change the rpc node and try again')
      }

      throw error
    } finally {
    }
  }

  const getPosDlmmRelatedData = async (posBaseList: DlmmPosBaseInfo[], refreshLiquidity: boolean = true) => {
    if (posBaseList.length === 0) {
      return
    }
    try {
      console.log('🚀 ~ getPosRelatedData ~ posPoolsOriginalData:', 'getPosDlmmRelatedData')
      const posPoolsOriginalData = await getDlmmPosPoolsOriginalObj(posBaseList)
      console.log('🚀 ~ getPosRelatedData ~ posPoolsOriginalData:', posPoolsOriginalData)
      getDlmmPosPoolsRelatedData(posBaseList, posPoolsOriginalData) //hook里面关于posPoolsOriginalData数据已经处理
      console.log(Object.keys(posPoolsOriginalData)?.length > 0 && refreshLiquidity, 'getPosRelatedData ~ posPoolsOriginalData:')
      if (Object.keys(posPoolsOriginalData)?.length > 0 && refreshLiquidity) {
        getDlmmPosLiquidityData(posBaseList, posPoolsOriginalData)
        getDlmmPosFeeAndReward(posBaseList, posPoolsOriginalData)
      }
    } catch (error) {
      console.error('🚀 ~ getPosRelatedData ~ error: 96', error)
    }
  }

  const formatPosBaseList = async (ownerRes: DataPage<any>, clmmPool?: string, useInVest?: boolean) => {
    let posBaseList: any = []

    for (const item of ownerRes.data as any[]) {
      const info = await buildPosBaseInfo(item)
      // console.log('🚀 ~ file: usePositionList.ts:37 ~ getPositionList ~ info:', info)
      if (!useInVest && d(info?.liquidity).lte(0)) continue
      if (!info?.displayTokenA || !info?.displayTokenB) continue
      if (info) {
        posBaseList.push(info)
      }
    }

    console.log('🚀 ~ file: usePositionList.ts:33 ~ getPositionList ~ posBaseList:', posBaseList)

    // 获取受损仓位列表, 通过获取positionInfo矫正受损仓位的liquidity
    const vestingList = await getVestingList(posBaseList)
    console.log('🚀 ~ getPositionBaseList ~ vestingList:', vestingList)
    if (vestingList?.length > 0) {
      posBaseList = await getPositionInfoList(posBaseList, vestingList)
      console.log('🚀 ~ getPositionBaseList ~ posBaseList:', posBaseList)
    }

    // 排序
    const sortBaseList = posBaseList.sort((a: any, b: any) => b.version - a.version)

    let result: PosBaseInfo[] = []
    if (!clmmPool) {
      result = sortBaseList
    } else {
      result = sortBaseList?.filter((item: PosBaseInfo) => item.clmmPool === clmmPool)
    }

    return result
  }

  const getPosRelatedData = async (posBaseList: PosBaseInfo[], isFarms: boolean = false) => {
    console.log('🚀 ~ getPosRelatedData ~ posBaseList:', isFarms, posBaseList)
    getFarmsRewardsData(posBaseList)
    if (!isFarms) {
      console.log('🚀 ~ getPosRelatedData ~ isFarms:', posBaseList)
      getPosApiPoolData(posBaseList)
      getPosFeeData(posBaseList)
    }

    if (posBaseList?.length > 0) {
      // 提取 clmmPoolAddress 并去重
      const clmmPoolAddressList = Array.from(new Set(posBaseList.map(item => item.clmmPool).filter(Boolean)))
      fetchPriceRanges(clmmPoolAddressList)
    }

    try {
      const posPoolsOriginalData = await getPosPoolsOriginalObj(posBaseList)
      console.log('🚀 ~ getPosRelatedData ~ posPoolsOriginalData:', posPoolsOriginalData)
      getPosPoolsRelatedData(posBaseList, posPoolsOriginalData) //hook里面关于posPoolsOriginalData数据已经处理
      if (Object.keys(posPoolsOriginalData)?.length > 0) {
        getPosLiquidityData(posBaseList, posPoolsOriginalData)
        if (!isFarms) {
          getPosRewardsData(posBaseList, posPoolsOriginalData)
        }
      } else {
        setPosLiquidityDataLoading(false)
        setPosRewardsDataLoading(false)
      }
    } catch (error) {
      console.error('🚀 ~ getPosRelatedData ~ error: 96', error)
    }
  }

  return {
    formatPosBaseList,
    getPositionBaseList,
    getPosRelatedData,
    getPosDlmmRelatedData
  }
}
