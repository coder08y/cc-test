/**
 * 获取仓位相关的池子信息s
 */

import { CorrectedPool, FrozenPools } from '@/constant/pool'
import usePositionStore from '@/store/position'
import { PoolContractInfo, PosPoolsRelated } from '@/types'
import { PosBaseInfo } from '@/types/position'
import { checkIsMinOrMaxIndex } from '@/utils/pool'
import { useSdk } from '@cetus/sdk-factory'
import { d, formatNumberWithDown } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'

export default function useGetPosPools() {
  const clmmSdk = useSdk('clmm')
  const { setPosPoolOriginalData, setPosPoolsRelatedData, setPosPoolsRelatedDataLoading, setFullRangePosBaseList, setFullRangePosBaseListLoading } =
    usePositionStore()

  const getPosPoolsOriginalObj = async (posBaseList: PosBaseInfo[]): Promise<Record<string, PoolContractInfo>> => {
    const pools = posBaseList?.map(item => item?.clmmPool)

    const poolIds = [...new Set([...pools])]
    console.log('🚀🚀🚀 ~ useGetPosPools.ts:24 ~ getPosPoolsOriginalObj ~ poolIds:', poolIds)

    let posPoolsOriginalObj: Record<string, PoolContractInfo> = {}

    if (poolIds && poolIds.length > 0) {
      const posAllPools = await clmmSdk!.Pool.getAssignPools(poolIds)
      console.log('🚀🚀🚀 ~ getPosPoolsOriginalObj ~ posAllPools:', posAllPools)
      posPoolsOriginalObj = Object.fromEntries(
        posAllPools?.map(item => {
          const info: PosBaseInfo = posBaseList.find(pos => pos.clmmPool === item?.id)!
          const decimalsA = info.tokenA.decimals
          const decimalsB = info.tokenB.decimals
          // const currentPrice = TickMath.sqrtPriceX64ToPrice(new BN(item?.current_sqrt_price), decimalsA, decimalsB).toString()
          const currentPrice = TickMath.tickIndexToPrice(item?.current_tick_index, decimalsA, decimalsB).toString()
          const currentPriceReverse = d(1).div(currentPrice).toString()

          return [
            item?.id,
            {
              ...item,
              currentPrice,
              currentPriceReverse,
              coinAmountA: String(item.coin_amount_a),
              coinAmountB: String(item.coin_amount_b),
              coinTypeA: item.coin_type_a,
              coinTypeB: item.coin_type_b,
              poolAddress: item.id,
              poolType: item.pool_type,
              tickSpacing: Number(item.tick_spacing),
              current_sqrt_price: String(item.current_sqrt_price),
              fee_growth_global_a: String(item.fee_growth_global_a),
              fee_growth_global_b: String(item.fee_growth_global_b),
              fee_protocol_coin_a: String(item.fee_protocol_coin_a),
              fee_protocol_coin_b: String(item.fee_protocol_coin_b),
              fee_rate: CorrectedPool?.[item!.id] || String(item.fee_rate),
              liquidity: String(item.liquidity),
              rewarder_infos: item.rewarder_infos.map(r => {
                return {
                  coinAddress: r.coin_type,
                  emissionsEveryDay: r.emissions_per_second,
                  emissions_per_second: String(r.emissions_per_second),
                  growth_global: String(r.growth_global)
                }
              }),
              isFrozen: FrozenPools.includes(item.id)
            }
          ]
        })
      )
    }

    setPosPoolOriginalData(posPoolsOriginalObj)
    return posPoolsOriginalObj
  }

  // 仓位中和池子信息相关联的数据
  const getPosPoolsRelatedData = (posBaseList: PosBaseInfo[], posPoolOriginalObjs: Record<string, PoolContractInfo>) => {
    setPosPoolsRelatedDataLoading(true)
    setFullRangePosBaseListLoading(true)

    const posPoolsRelatedData: Record<string, PosPoolsRelated> = {}
    const fullRangePosBaseList: any = []

    posBaseList.forEach((item: any) => {
      const poolInfo = posPoolOriginalObjs[item?.clmmPool]
      // console.log('🚀 ~ getPosPoolsRelatedData ~ poolInfo:', poolInfo)
      // current_tick_index
      const decimalsA = item?.tokenA?.decimals
      const decimalsB = item?.tokenB?.decimals
      // const currentPrice = TickMath.sqrtPriceX64ToPrice(new BN(poolInfo?.current_sqrt_price), decimalsA, decimalsB).toString()
      const currentPrice = TickMath.tickIndexToPrice(poolInfo?.current_tick_index, decimalsA, decimalsB).toString()
      console.log('🚀 ~ getPosPoolsRelatedData ~ currentPrice:', currentPrice)
      const currentPriceReverse = d(1).div(currentPrice).toString()
      console.log('🚀 ~ getPosPoolsRelatedData ~ currentPriceReverse:', currentPriceReverse)

      let minPrice = '0'
      let maxPrice = '0'
      if (checkIsMinOrMaxIndex(item?.lowerTick, 'min')) {
        minPrice = '0'
      } else {
        minPrice = TickMath.tickIndexToPrice(Number(item?.lowerTick), decimalsA, decimalsB).toString()
      }

      if (checkIsMinOrMaxIndex(item?.upperTick, 'max')) {
        maxPrice = '∞'
      } else {
        maxPrice = TickMath.tickIndexToPrice(Number(item?.upperTick), decimalsA, decimalsB).toString()
      }

      let minPriceResever, maxPriceResever
      if (maxPrice !== '∞') {
        maxPriceResever = d(1).div(d(maxPrice)).toString()
      } else {
        maxPriceResever = '0'
      }
      if (minPrice !== '0') {
        minPriceResever = d(1).div(d(minPrice)).toString()
      } else {
        minPriceResever = '∞'
      }

      // console.log('🚀 ~ posBaseList.forEach 120 ~ currentPrice:', currentPrice)
      // console.log('🚀 ~ posBaseList.forEach 120 ~ minPrice:', minPrice)
      // console.log('🚀 ~ posBaseList.forEach 120~ maxPrice:', maxPrice)
      // console.log('🚀 ~ posBaseList.forEach 120~ poolInfo?.is_pause:', poolInfo?.is_pause)

      let currentStatus = ''

      // toDo: 后面需要补closed状态UI
      // if (poolInfo?.is_pause) {
      //   currentStatus = 'Closed'
      // } else
      if (Number(currentPrice) >= Number(minPrice) && (maxPrice === '∞' || Number(currentPrice) <= Number(maxPrice))) {
        currentStatus = 'Active'
      } else if (Number(currentPrice) > Number(maxPrice)) {
        currentStatus = 'Inactive'
      } else if (Number(currentPrice) < Number(minPrice)) {
        currentStatus = 'Inactive'
      }

      if (((minPrice === '0' && maxPrice === '∞') || (minPriceResever === '0' && maxPriceResever === '∞')) && item.posType === 'clmm') {
        fullRangePosBaseList.push(item)
      }

      const isReverse = item?.isReverse

      posPoolsRelatedData[item.posId] = {
        currentPrice: !poolInfo ? '' : formatNumberWithDown(!isReverse ? currentPrice : currentPriceReverse).toString(),
        currentPriceReverse: !poolInfo ? '' : formatNumberWithDown(!isReverse ? currentPriceReverse : currentPrice).toString(),
        contractCurrentPrice: currentPrice,
        contractCurrentPriceReverse: currentPriceReverse,
        contractMinPrice: minPrice,
        contractMinPriceReverse: maxPriceResever,
        contractMaxPrice: maxPrice,
        contractMaxPriceReverse: minPriceResever,
        minPrice: formatNumberWithDown(!isReverse ? minPrice : maxPriceResever).toString(),
        minPriceResever: formatNumberWithDown(!isReverse ? maxPriceResever : minPrice).toString(),
        maxPrice: formatNumberWithDown(!isReverse ? maxPrice : minPriceResever).toString(),
        maxPriceResever: formatNumberWithDown(!isReverse ? minPriceResever : maxPrice).toString(),
        minPriceOrigin: !poolInfo ? '' : !isReverse ? minPrice : maxPriceResever, //用于Leverage值的计算
        maxPriceOrigin: !poolInfo ? '' : !isReverse ? maxPrice : minPriceResever, //用于Leverage值的计算
        minPriceRaw: formatNumberWithDown(!isReverse ? minPrice : maxPriceResever, undefined, true).toString(),
        maxPriceRaw: formatNumberWithDown(!isReverse ? maxPrice : minPriceResever, undefined, true).toString(),
        currentPriceOrigin: !poolInfo ? '' : !isReverse ? currentPrice : currentPriceReverse, //用于Leverage值的计算
        currentStatus: !poolInfo ? '' : currentStatus,
        fee: poolInfo?.fee_rate,
        displayFee: d(poolInfo?.fee_rate).div(Math.pow(10, 6)).mul(100).toString(),
        tickSpacing: poolInfo?.tickSpacing,
        currentTickIndex: poolInfo?.current_tick_index,
        curSqrtPrice: poolInfo?.current_sqrt_price,
        liquidity: poolInfo?.liquidity,
        lowerTick: item.lowerTick,
        upperTick: item.upperTick
      }
    })

    setPosPoolsRelatedData(posPoolsRelatedData)
    setFullRangePosBaseList(fullRangePosBaseList)
  }

  return {
    getPosPoolsOriginalObj,
    getPosPoolsRelatedData
  }
}
