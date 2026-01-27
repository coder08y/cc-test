import useDlmmPositionStore from '@/store/dlmm-position'
import { DlmmPoolData, DlmmPosBaseInfo, DlmmPosPoolsRelated } from '@/types/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { formatPrice } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { BinAmount, BinUtils, FEE_PRECISION } from '@cetusprotocol/dlmm-sdk'

export default function useGetDlmmPosPool() {
  const dlmmSdk = useSdk('dlmm')
  const { setDlmmPosPoolOriginalData, setDlmmPosPoolsRelatedDataLoading, setDlmmPosPoolsRelatedData } = useDlmmPositionStore()
  const getDlmmPosPoolsOriginalObj = async (posBaseList: DlmmPosBaseInfo[]): Promise<Record<string, DlmmPoolData>> => {
    const pools = posBaseList?.map(item => item.dlmmPool)

    const poolIds = [...new Set([...pools])]

    let dlmmPosPoolsOriginalObj: Record<string, DlmmPoolData> = {}
    console.log(new Date().getTime(), poolIds.length, 'getDlmmPosPoolsOriginalObj start')
    if (poolIds && poolIds.length > 0) {
      const posAllPools = await dlmmSdk!.Pool.getAssignPoolList(poolIds)

      console.log(
        posAllPools,
        posAllPools,
        JSON.stringify(
          posAllPools?.map(item => ({
            bin_manager_handle: item?.bin_manager?.bin_manager_handle,
            bin_id: item?.active_id,
            bin_step: item?.bin_step
          }))
        ),
        'posAllPools'
      )
      const binInfoList = await dlmmSdk!.Pool.getBinInfoList(
        posAllPools?.map(item => ({
          bin_manager_handle: item?.bin_manager?.bin_manager_handle,
          bin_id: item?.active_id,
          bin_step: item?.bin_step
        }))
      )
      console.log(binInfoList, 'binInfoList')
      const activeBinObj: Record<string, BinAmount> = {}
      for (let i = 0; i < posAllPools.length; i++) {
        const { pool_type, bin_step, active_id, bin_manager } = posAllPools[i]
        const active_bin = binInfoList?.find(item => item?.bin_id === active_id && item?.bin_manager_handle === bin_manager?.bin_manager_handle)
        activeBinObj[pool_type] = active_bin as BinAmount
      }
      console.log('🚀🚀🚀 ~ getPosPoolsOriginalObj ~ posAllPools:', posAllPools)
      dlmmPosPoolsOriginalObj = Object.fromEntries(
        posAllPools?.map(item => {
          const info: DlmmPosBaseInfo = posBaseList.find(pos => pos.dlmmPool === item?.id)!
          const decimalsA = info.tokenA.decimals
          const decimalsB = info.tokenB.decimals
          const binStep = item.bin_step
          const currentPrice = BinUtils.getPriceFromBinId(item?.active_id ?? 0, binStep, decimalsA, decimalsB)
          const currentPriceReverse = d(1).div(currentPrice).toString()
          const active_bin = activeBinObj[item.pool_type]
          return [
            item?.id,
            {
              ...item,
              currentPrice,
              currentPriceReverse,
              coinAmountA: String(item.balance_a),
              coinAmountB: String(item.balance_b),
              coinTypeA: item.coin_type_a,
              coinTypeB: item.coin_type_b,
              poolAddress: item.id,
              poolType: item.pool_type,
              binStep,
              fee_protocol_coin_a: String(item.protocol_fee_a),
              fee_protocol_coin_b: String(item.protocol_fee_b),
              fee_rate: String(item.base_fee_rate),
              active_bin
            }
          ]
        })
      )
    }
    console.log(new Date().getTime(), poolIds.length, 'getDlmmPosPoolsOriginalObj end')
    // console.log('🚀🚀🚀 ~ useGetDlmmPosPool.ts:54 ~ getPosPoolsOriginalObj ~ dlmmPosPoolsOriginalObj:', JSON.stringify(dlmmPosPoolsOriginalObj))
    setDlmmPosPoolOriginalData(dlmmPosPoolsOriginalObj)
    return dlmmPosPoolsOriginalObj
  }

  // 仓位中和池子信息相关联的数据
  const getDlmmPosPoolsRelatedData = (posBaseList: DlmmPosBaseInfo[], posPoolOriginalObjs: Record<string, DlmmPool>) => {
    console.log('🚀🚀🚀 ~ useGetDlmmPosPool.ts:58 ~ getPosPoolsRelatedData ~ posBaseList:', posBaseList)
    setDlmmPosPoolsRelatedDataLoading(true)

    const posPoolsRelatedData: Record<string, DlmmPosPoolsRelated> = {}
    const fullRangePosBaseList: any = []

    posBaseList.forEach((item: any) => {
      try {
        const poolInfo = posPoolOriginalObjs[item.dlmmPool]
        const decimalsA = item.tokenA.decimals
        const decimalsB = item.tokenB.decimals
        const binStep = poolInfo.bin_step
        const currentPrice = BinUtils.getPriceFromBinId(poolInfo?.active_id ?? 0, binStep, decimalsA, decimalsB)
        const currentPriceReverse = d(1).div(currentPrice).toString()
        let minPrice = '0'
        let maxPrice = '0'
        minPrice = BinUtils.getPriceFromBinId(item.lowerBinId, binStep, decimalsA, decimalsB)
        maxPrice = BinUtils.getPriceFromBinId(item.upperBinId, binStep, decimalsA, decimalsB)
        const minPriceResever = d(1).div(minPrice).toString()
        const maxPriceResever = d(1).div(maxPrice).toString()
        const isReverse = item.isReverse
        let currentStatus = ''
        if (poolInfo?.is_pause) {
          currentStatus = 'Closed'
        } else if (Number(poolInfo?.active_id) >= Number(item.lowerBinId) && Number(poolInfo?.active_id) <= Number(item.upperBinId)) {
          currentStatus = 'Active'
        } else if (Number(poolInfo?.active_id) > Number(item.upperBinId)) {
          currentStatus = 'Inactive'
        } else if (Number(poolInfo?.active_id) < Number(item.lowerBinId)) {
          currentStatus = 'Inactive'
        }
        console.log('🚀🚀🚀 ~ useGetDlmmPosPool.ts:95 ~ posBaseList.forEach ~ poolInfo:', {
          poolInfo,
          currentPrice,
          minPrice,
          item
        })
        posPoolsRelatedData[item.id] = {
          currentPrice: !poolInfo ? '' : formatPrice(!isReverse ? currentPrice : currentPriceReverse).toString(),
          currentPriceReverse: !poolInfo ? '' : formatPrice(!isReverse ? currentPriceReverse : currentPrice).toString(),
          minPrice: formatPrice(!isReverse ? minPrice : maxPriceResever).toString(),
          minPriceResever: formatPrice(!isReverse ? maxPriceResever : minPrice).toString(),
          maxPrice: formatPrice(!isReverse ? maxPrice : minPriceResever).toString(),
          maxPriceResever: formatPrice(!isReverse ? minPriceResever : maxPrice).toString(),
          minPriceOrigin: !poolInfo ? '' : !isReverse ? minPrice : maxPriceResever, //用于Leverage值的计算
          maxPriceOrigin: !poolInfo ? '' : !isReverse ? maxPrice : minPriceResever, //用于Leverage值的计算
          fee: poolInfo?.base_fee_rate,
          displayFee: d(poolInfo?.base_fee_rate).div(FEE_PRECISION).mul(100).toString(),
          binStep,
          currentTickIndex: poolInfo?.active_id,
          currentStatus,
          minPriceBinId: item.lowerBinId,
          maxPriceBinId: item.upperBinId,
          haveZap: poolInfo?.haveZap || false,
          active_bin: poolInfo?.active_bin
        }
      } catch (error) {
        console.error('🚀🚀🚀 ~ useGetDlmmPosPool.ts:75 ~ posBaseList.forEach ~ error:', error)
      }
    })

    setDlmmPosPoolsRelatedData(posPoolsRelatedData)
  }
  return { getDlmmPosPoolsOriginalObj, getDlmmPosPoolsRelatedData }
}
