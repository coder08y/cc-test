// import { TicksPath } from '@/apis/path'
import { TICK_SPACINGS } from '@/constant/pool'
import useDepthChartStore from '@/store/clmm/chart'
import { FeeRate, GetTickParams } from '@/types/clmm'
import { computeSurroundingTicksNew } from '@/utils/compute-surrounding-ticks'
import { getTickDataFromUrlData } from '@/utils/contract-helper'
import { useFetch } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'

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

// toDo: Filter out abnormal data
const filterTicksData = (list: any) => {
  const suspicious_tickIndexs = [300200, 300060]
  const filterData = list.filter((item: any) => {
    if (item?.tick === 300000 && d(item?.liquidityNet).abs().gt('14673429775904769391107872693404')) {
      return false
    }
    if (suspicious_tickIndexs.includes(item?.tick) && d(item?.liquidityNet).abs().gt('14673429775904769391107872693404')) {
      return false
    }
    return true
  })

  return filterData
}

export default function useGetTicksChartData() {
  const { fetchByApi } = useFetch()
  const clmmSdk = useSdk('clmm')
  const { setFormatPriceData, setFormatPriceDataIsLoading, setTicksPool } = useDepthChartStore()

  // 获取ticks接口数据
  const getTicks = async (params: GetTickParams) => {
    console.log('🚀 ~ getTicks ~ params:', params)

    const { poolAddress, tokenA, tokenB, tickSpacing } = params
    try {
      const fetchParams = {
        address: poolAddress,
        orderBy: 'index',
        limit: 1000
      }
      // const res = await fetchByApi(TicksPath, 'GET', fetchParams)
      const res = await fetchByApi('/router_v3/ticks', 'GET', fetchParams)
      console.log('🚀 ~ getTicks11111 ~ res:', res)
      const list = res?.list?.sort((a: any, b: any) => a.index - b.index)
      console.log('🚀 ~ getTicks11111 ~ list:', list)

      const tickList = list.map((tickItem: any) => {
        return {
          // objectId: tickItem.object_id,
          tick: tickItem.index,
          sqrtPrice: tickItem.sqrt_price,
          liquidityNet: tickItem.liquidity_net,
          liquidityGross: tickItem.liquidity_gross
          // feeGrowthOutsideA: new BN(tickItem.fee_growth_outside_a),
          // feeGrowthOutsideB: new BN(tickItem.fee_growth_outside_b),
          // rewardersGrowthOutside: tickItem.rewards_growth_outside
        }
      })
      console.log('🚀 ~ getTicks11111 ~ tickList:', tickList)

      // throw Error('error')

      const filterData = filterTicksData(tickList)
      console.log('🚀 ~ getTicks ~ filterData:', filterData)

      return {
        // ticks: tickList,
        ticks: filterData,
        address: res?.address,
        ticksPoolInfo: res?.pool
      }
    } catch (error) {
      console.log('🚀 ~ getTicks ~ error:', error)
      const list = await clmmSdk!.Pool.fetchTicks({
        pool_id: poolAddress,
        coin_type_a: tokenA.coin_type,
        coin_type_b: tokenB.coin_type
      })
      console.log('🚀 ~ getTicks ~ error list:', list)

      const result: any = []
      if (list && list?.length > 0) {
        const formateList = getTickDataFromUrlData(list)

        formateList?.forEach((item: any) => {
          result.push({
            tick: Number(item.index),
            liquidityNet: d(item.liquidityNet.toString()).toString(),
            liquidityGross: item.liquidityGross.toString(),
            id: item.objectId
          })
        })
      }

      console.log('🚀 ~ getTicks ~ error result:', result)
      const filterData = filterTicksData(result)
      console.log('🚀 ~ getTicks ~ error filterData:', filterData)
      return {
        // ticks: result,
        ticks: filterData,
        address: poolAddress
      }
    }
  }

  const getProcessedAsPrice = (params: GetTickParams & { ticks: any; ticksPool?: any }) => {
    const { poolAddress, tokenA, tokenB, tickSpacing, currentTickIndex, feeRate, ticks, ticksPool } = params
    if (!feeRate || !tickSpacing) return
    const currTick = ticksPool?.current_tick_index || currentTickIndex
    const activeTick = getActiveTick(currTick, feeRate as FeeRate)
    const newTicks = JSON.parse(JSON.stringify(ticks)).sort((a: any, b: any) => a - b)
    const ticksProcessed = computeSurroundingTicksNew(newTicks, tokenA, tokenB)
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
    const { tokenA, tokenB } = params
    try {
      const ticks = await getTicks(params)

      const priceData = getProcessedAsPrice({
        ...params,
        ticks: ticks?.ticks || [],
        ticksPool: ticks?.ticksPoolInfo
      })

      const formatPriceData = getFormattedPriceData(priceData?.data)
      const tiksPoolData = ticks?.ticksPoolInfo
        ? ticks?.ticksPoolInfo
        : {
            current_sqrt_price: '',
            current_tick_index: params.currentTickIndex,
            id: params.poolAddress,
            liquidity: params.liquidity
          }

      const ticksPoolPrice = TickMath.tickIndexToPrice(tiksPoolData.current_tick_index, tokenA.decimals, tokenB.decimals).toString()
      tiksPoolData['price'] = ticksPoolPrice
      tiksPoolData['reversePrice'] = d(1).div(ticksPoolPrice).toString()

      // setTicksPool({ ...tiksPoolData })
      // setFormatPriceData(formatPriceData)
      return {
        tiksPoolData,
        formatPriceData
      }

      // getFormattedData2(params)
    } catch (error) {
      console.log('Test Depth Data###🚀 ~ getFormattedData ~ error:', error)
      // setTicksPool({})
      // setFormatPriceData([])
      return {
        tiksPoolData: {},
        formatPriceData: []
      }
    }
  }

  // useEffect(() => {
  //   return () => {
  //     setFormatPriceDataIsLoading(true)
  //     setFormatPriceData([])
  //   }
  // }, [])

  return {
    getFormattedData
  }
}
