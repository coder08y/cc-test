import useLiquidityStore from '@/store/clmm'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { isAvailableObject } from '@cetus/utils'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useChartTime } from '../common/useChartTime'
import useGetHistogramData from '../stats/useGetHistogramData'

export enum ChartsTabsEnum {
  volume = 'Volume',
  tvl = 'TVL',
  fees = 'Fees'
}
export enum ChartsTypeEnum {
  volume = 'vol',
  tvl = 'tvl',
  fees = 'fee'
}

export enum DateTabsEnum {
  d = 'D',
  w = 'W',
  m = 'M'
}

export enum DateTypeEnum {
  d = 'day',
  w = 'wek',
  m = 'mon'
}

export type ChartsTabsType = { label: ChartsTabsEnum }

export type DateTypes = { label: DateTabsEnum }

export const LimitMap: Record<DateTabsEnum, number> = {
  [DateTabsEnum.d]: 40,
  [DateTabsEnum.w]: 30,
  [DateTabsEnum.m]: 20
}
function useAnalyticChart(poolInfo: any) {
  const [currentChartTab, setCurrentChartTab] = useState<ChartsTabsEnum>(ChartsTabsEnum.volume)
  const [currentDateType, setCurrentDateType] = useState<DateTabsEnum>(DateTabsEnum.d)
  const [analyticsData, setAnalyticsData] = useState([])
  const { apiPoolInfo: liquidityStorePoolInfo } = useLiquidityStore()
  const [chartLoading, setChartLoading] = useState(true)
  const [hoverData, setHoverData] = useState<any>(null)
  const { getHistogramData } = useGetHistogramData()
  const { poolAddress: queryPoolAddress } = useQueryParams()
  const { getHoverTime, time } = useChartTime()

  const poolAddress = useMemo(() => {
    return isAvailableObject(poolInfo) ? poolInfo?.poolAddress : queryPoolAddress
  }, [queryPoolAddress, poolInfo])

  const apiPoolInfo = useMemo(() => {
    return isAvailableObject(poolInfo) ? poolInfo : liquidityStorePoolInfo
  }, [liquidityStorePoolInfo, poolInfo])

  /**
   * 根据池子地址初始化数据
   * Initialize data based on pool address
   */
  useLayoutEffect(() => {
    setAnalyticsData([])
    setCurrentChartTab(ChartsTabsEnum.volume)
    setCurrentDateType(DateTabsEnum.d)
    setHoverData(null)
  }, [poolAddress])

  const fetchAnalyticsData = async () => {
    if (!poolAddress) return
    try {
      setChartLoading(true)
      const result = await getHistogramData({
        date_type: DateTypeEnum[currentDateType.toLowerCase() as keyof typeof DateTypeEnum],
        type: ChartsTypeEnum[currentChartTab.toLowerCase() as keyof typeof ChartsTypeEnum],
        limit: LimitMap[currentDateType],
        address: poolAddress
      })

      if (result && result.length) {
        setAnalyticsData(result)
      }
    } catch (error) {
      console.error(error, 'res-fetchAnalyticsData')
      throw error
    } finally {
      setChartLoading(false)
    }
  }

  /**
   * 切换图表类型或日期类型时，重新获取数据
   * Re-get data when switching chart type or date type
   */
  useEffect(() => {
    fetchAnalyticsData()
  }, [poolAddress, currentChartTab, currentDateType])

  /**
   * 鼠标移动到图表上时，获取时间
   * Get time when mouse moves over chart
   */
  useEffect(() => {
    if (hoverData?.date) {
      getHoverTime(hoverData?.date, currentDateType)
    }
  }, [hoverData?.date, currentDateType])

  /**
   * 切换图表类型
   * Switch chart type
   */
  const handleChartTabChange = (item: Tab<ChartsTabsType>) => {
    setCurrentChartTab(item.label)
    if (item.label !== currentChartTab) {
      setAnalyticsData([])
    }
  }
  /**
   * 切换日期类型
   * Switch date type
   */
  const handleDateTabChange = (item: Tab<DateTypes>) => {
    setCurrentDateType(item.label)
    if (item.label !== currentDateType) {
      setAnalyticsData([])
    }
  }
  /**
   * 默认展示数据
   * Default display data
   */
  const defaultDisplay = useMemo(() => {
    if (currentChartTab === ChartsTabsEnum.volume) {
      return { value: apiPoolInfo?.volume24Display, title: 'Volume (24H)' }
    } else if (currentChartTab === ChartsTabsEnum.tvl) {
      return { value: apiPoolInfo?.tvlDisplay, title: 'TVL' }
    } else if (currentChartTab === ChartsTabsEnum.fees) {
      return { value: apiPoolInfo?.fees24Display, title: 'Fees (24H)' }
    }
  }, [currentChartTab, apiPoolInfo?.volume24Display, apiPoolInfo?.tvlDisplay, apiPoolInfo?.fees24Display])

  const chartsTabs = Object.values(ChartsTabsEnum).map(value => ({
    label: value
  }))
  const dateTypes = Object.values(DateTabsEnum).map(value => ({
    label: value
  }))

  return {
    handleChartTabChange,
    handleDateTabChange,
    defaultDisplay,
    chartsTabs,
    dateTypes,
    chartLoading,
    analyticsData,
    hoverData,
    setHoverData,
    currentChartTab,
    currentDateType,
    time
  }
}

export default useAnalyticChart
