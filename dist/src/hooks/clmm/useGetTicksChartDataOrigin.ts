import { TicksPath } from '@/apis/path'
import { TICK_SPACINGS } from '@/constant/pool'
import useDepthChartStore from '@/store/clmm/chart'
import { FeeRate, GetTickParams } from '@/types/clmm'
import computeSurroundingTicks from '@/utils/compute-surrounding-ticks'
import { getTickDataFromUrlData } from '@/utils/contract-helper'
import { useFetch } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'

interface ChartEntry {
  price: number
  depth: number
}

interface TickProcessed {
  tick: number
  liquidityActive: bigint
  liquidityNet: bigint
  price0: string
}

const PRICE_FIXED_DIGITS = 8

const MAX_TICK_INDEX = 443636

const MIN_TICK_INDEX = -443636

const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeRate | undefined) => {
  // return tickCurrent !== undefined && feeAmount ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount] : undefined
  return (tickCurrent || tickCurrent === 0) && feeAmount && TICK_SPACINGS[feeAmount]
    ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount]
    : undefined
}

export default function useGetTicksChartData() {
  const { fetchByApi } = useFetch()
  const clmmSdk = useSdk('clmm')
  const { setFormatPriceData, setFormatPriceDataIsLoading } = useDepthChartStore()

  // 获取ticks接口数据
  const getTicks = async (params: GetTickParams) => {
    const { poolAddress, tokenA, tokenB } = params
    try {
      const fetchParams = {
        address: poolAddress,
        orderBy: 'index',
        limit: 1000
      }
      const res = await fetchByApi(TicksPath, 'GET', fetchParams)
      const list = res?.list?.sort((a: any, b: any) => a.index - b.index)

      const tickList = list.map((tickItem: any) => {
        return {
          objectId: tickItem.object_id,
          index: tickItem.index,
          sqrtPrice: new BN(tickItem.sqrt_price),
          liquidityNet: new BN(tickItem.liquidity_net),
          liquidityGross: new BN(tickItem.liquidity_gross),
          feeGrowthOutsideA: new BN(tickItem.fee_growth_outside_a),
          feeGrowthOutsideB: new BN(tickItem.fee_growth_outside_b),
          rewardersGrowthOutside: tickItem.rewards_growth_outside
        }
      })

      // throw Error('error')

      return {
        list: tickList,
        address: res?.address
      }
    } catch (error) {
      console.log('🚀 ~ getTicks ~ error:', error)
      const res = await clmmSdk!.Pool.fetchTicks({
        pool_id: poolAddress,
        coin_type_a: tokenA.coin_type,
        coin_type_b: tokenB.coin_type
      })
      return {
        list: res,
        address: poolAddress
      }
    }
  }

  // api接口返回的ticks列表和合约拿到的当前tick和liquidity做了计算后可能由于数据同步差异，算出来都为负数
  // 为了避免以上情况, 根据当前tick和ticks列表自己计算出对应的liquidity再画图
  const getLiquidity = (pivot: number, ticks: any, currentIndexIsEqualWithTicksItem?: boolean) => {
    console.log('🚀 ~ getLiquidity ~ currentIndexIsEqualWithTicksItem:', currentIndexIsEqualWithTicksItem)
    console.log('🚀 ~ getLiquidity ~ ticks:', ticks)
    console.log('🚀 ~ getLiquidity ~ pivot:', pivot)
    const sum = ticks
      .slice(0, currentIndexIsEqualWithTicksItem ? pivot : pivot + 1) // 取出下标小于 current 的部分
      .reduce((acc: any, tick: any) => d(acc).add(tick.liquidityNet.toString()).toString(), 0)

    console.log('🚀 ~ getLiquidity ~ ticks.slice(0, pivot):', ticks.slice(0, currentIndexIsEqualWithTicksItem ? pivot : pivot + 1))
    console.log('🚀 ~ getLiquidity ~ sum:', sum)

    return sum
  }

  const getProcessedAsPrice = (params: GetTickParams & { ticks: any }) => {
    // const { poolAddress, tokenA, tokenB, tickSpacing, currentTickIndex, liquidity, feeRate, ticks } = params
    const { poolAddress, tokenA, tokenB, tickSpacing, currentTickIndex, feeRate, ticks } = params
    console.log('🚀 ~ getProcessedAsPrice ~ feeRate:', feeRate)
    console.log('🚀 ~ getProcessedAsPrice ~ tickSpacing:', tickSpacing)
    if (!feeRate || !tickSpacing) return

    console.log('🚀 ~ getProcessedAsPrice ~ currentTickIndex:', currentTickIndex)
    console.log('🚀 ~ getProcessedAsPrice ~ feeRate:', feeRate)
    const activeTick = getActiveTick(currentTickIndex, feeRate as FeeRate)
    console.log('🚀 ~ getProcessedAsPrice ~ activeTick:', activeTick)
    if (activeTick === undefined) return

    const minTick = TickMath.getInitializeTickIndex(MIN_TICK_INDEX, tickSpacing)

    const maxTick = TickMath.getInitializeTickIndex(MAX_TICK_INDEX, tickSpacing)

    const newTicks = JSON.parse(JSON.stringify(ticks)).sort((a: any, b: any) => a - b)
    console.log('🚀 ~ getProcessedAsPrice ~ newTicks:', newTicks)

    if (newTicks.length === 0) {
      return {
        activeTick,
        data: [
          {
            liquidityActive: BigInt(liquidity ?? 0),
            // liquidityActive: 0,
            tick: activeTick,
            liquidityNet: 0n,
            // price0: TickMath.tickIndexToPrice(activeTick, tokenA.decimals, tokenB.decimals).toFixed(PRICE_FIXED_DIGITS)
            price0: TickMath.tickIndexToPrice(activeTick, tokenA.decimals, tokenB.decimals).toString()
          }
        ]
      }
    }

    // const pivot = newTicks.findIndex(({ tick }: any) => Number(tick) > activeTick) - 1
    const pivot = ticks.findIndex(({ tick }: any) => tick && tick > activeTick) - 1
    const currentIndexPos = ticks.findIndex(({ tick }: any) => tick && tick >= activeTick)
    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ pivot:', pivot)

    // getLiquidity(pivot + 1, ticks)
    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ currentIndexPos:', currentIndexPos)
    const liquidity = getLiquidity(pivot, ticks, ticks?.[currentIndexPos].tick === currentTickIndex && pivot !== 0)
    // const liquidity = params.liquidity
    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ liquidity:', liquidity)
    if (pivot < 0) {
      const subsequentTicks = computeSurroundingTicks(
        tokenA,
        tokenB,
        {
          liquidityActive: BigInt(liquidity ?? 0),
          tick: activeTick,
          liquidityNet: 0n,
          // price0: TickMath.tickIndexToPrice(activeTick, tokenA.decimals, tokenB.decimals).toFixed(PRICE_FIXED_DIGITS)
          price0: TickMath.tickIndexToPrice(activeTick, tokenA.decimals, tokenB.decimals).toString()
        },
        newTicks,
        -1,
        true
      )

      return {
        activeTick,
        data: [
          ...subsequentTicks
          // {
          //   liquidityActive: BigInt(liquidity ?? 0),
          //   tick: activeTick,
          //   liquidityNet: 0n,
          //   price0: TickMath.tickIndexToPrice(activeTick, tokenA.decimals, tokenB.decimals).toFixed(PRICE_FIXED_DIGITS)
          // }
        ]
      }
    }

    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ params:', params)

    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ activeTick:', activeTick)
    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ ticks:', JSON.parse(JSON.stringify(ticks)))

    // const activeTickProcessed: TickProcessed = {
    //   liquidityActive: BigInt(liquidity ?? 0),
    //   tick: currentTickIndex,
    //   liquidityNet: BigInt(newTicks[pivot].liquidityNet),
    //   price0: TickMath.tickIndexToPrice(currentTickIndex, tokenA.decimals, tokenB.decimals).toString()
    // }
    const sdkPrice = TickMath.tickIndexToPrice(activeTick, tokenA.decimals, tokenB.decimals)
    const activeTickProcessed: any = {
      liquidityActive: BigInt(liquidity ?? 0),
      tick: activeTick,
      // tick: currentTickIndex,
      liquidityNet: Number(ticks[pivot]?.tick) === activeTick ? BigInt(ticks[pivot]?.liquidityNet ?? 0) : BigInt(0),
      // price0: sdkPrice.toFixed(PRICE_FIXED_DIGITS)
      price0: sdkPrice.toString()
    }

    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ activeTickProcessed:', activeTickProcessed)

    // 当前tick 之后
    const subsequentTicks = computeSurroundingTicks(tokenA, tokenB, activeTickProcessed, newTicks, pivot, true)

    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ subsequentTicks:', subsequentTicks)

    // 当前tick 之前
    const previousTicks = computeSurroundingTicks(tokenA, tokenB, activeTickProcessed, newTicks, pivot, false)

    // const previousTicks = []

    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ previousTicks:', previousTicks)
    // const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

    const activeTickProcessed2: any = {
      liquidityActive: BigInt(liquidity ?? 0),
      tick: currentTickIndex,
      liquidityNet: Number(ticks[pivot]?.tick) === activeTick ? BigInt(ticks[pivot]?.liquidityNet ?? 0) : BigInt(0),
      // price0: sdkPrice.toFixed(PRICE_FIXED_DIGITS)
      price0: TickMath.tickIndexToPrice(currentTickIndex, tokenA.decimals, tokenB.decimals).toString()
    }
    const ticksProcessed =
      Number(currentTickIndex) < Number(activeTick)
        ? previousTicks.concat(activeTickProcessed2).concat(activeTickProcessed).concat(subsequentTicks)
        : previousTicks.concat(activeTickProcessed).concat(activeTickProcessed2).concat(subsequentTicks)

    console.log('Test Depth Data###🚀 ~ getProcessedAsPrice ~ ticksProcessed:', ticksProcessed)

    return {
      activeTick,
      data: ticksProcessed
    }
  }

  const getFormattedPriceData = (data: any) => {
    if (!data || !data?.length) {
      return []
    }

    const newData: ChartEntry[] = []

    for (let i = 0; i < data.length; i++) {
      const t: TickProcessed = data[i]

      const chartEntry = {
        depth: parseFloat(t.liquidityActive.toString()),
        price: parseFloat(t.price0)
      }

      if (chartEntry.depth >= 0) {
        newData.push(chartEntry)
      }
    }

    return newData
  }

  const getFormattedData = async (params: GetTickParams) => {
    setFormatPriceDataIsLoading(true)
    try {
      console.log('Test Depth Data###🚀 ~ getFormattedData ~ params:', params)
      const ticks = await getTicks(params)

      console.log('Test Depth Data###🚀 ~ getFormattedData ~ ticks:', ticks)

      const result: any = []

      if (ticks && ticks?.list) {
        console.log('Test Depth Data###🚀 ~ getFormattedData ~ ticks?.list:', ticks?.list)
        const formateList = getTickDataFromUrlData(ticks?.list)

        formateList?.forEach((item: any) => {
          result.push({
            tick: Number(item.index),
            liquidityNet: d(item.liquidityNet.toString()).toString(),
            liquidityGross: item.liquidityGross.toString(),
            id: item.objectId
          })
        })
      }
      console.log('Test Depth Data###🚀 ~ getFormattedData ~ result:', result)

      const priceData = getProcessedAsPrice({
        ...params,
        ticks: result
      })

      console.log('Test Depth Data###🚀 ~ getFormattedData ~ priceData:', priceData)

      const formatPriceData = getFormattedPriceData(priceData?.data)

      console.log('Test Depth Data###🚀 ~ getFormattedData ~ formatPriceData:', formatPriceData)
      setFormatPriceData(formatPriceData)

      // getFormattedData2(params)
    } catch (error) {
      console.log('Test Depth Data###🚀 ~ getFormattedData ~ error:', error)
      setFormatPriceData([])
    }
  }

  return {
    getFormattedData
  }
}
