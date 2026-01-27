import useDlmmLiquidityStore from '@/store/dlmm'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { d, formatPriceUseInDlmmAxis } from '@cetus/utils'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useChartTime } from '../common/useChartTime'
import useFetchBinsTradeData from './useFetchBinsTradeData'

export enum DateTabsEnum {
  d = 'D',
  w = 'W',
  m = 'M'
}

export enum DateTypeEnum {
  d = '24H',
  w = '7D',
  m = '30D'
}

export type DateTypes = { label: DateTabsEnum }

function useBinsTrade(direct: boolean) {
  const [currentDateType, setCurrentDateType] = useState<DateTabsEnum>(DateTabsEnum.d)
  const [binsTradeData, setBinsTradeData] = useState<any[]>([])
  const { dlmmApiPoolInfo, dlmmContractPoolInfo } = useDlmmLiquidityStore()
  const [chartLoading, setChartLoading] = useState(true)
  const [hoverData, setHoverData] = useState<any>(null)
  const { poolId } = useQueryParams()
  const { getHoverTime, time } = useChartTime()
  const { fetchBinsTradeData } = useFetchBinsTradeData()
  /**
   * 根据池子地址初始化数据
   * Initialize data based on pool address
   */
  useLayoutEffect(() => {
    setBinsTradeData([])
    setCurrentDateType(DateTabsEnum.d)
    setHoverData(null)
  }, [poolId])

  const getBinsTradeData = async () => {
    if (!poolId || dlmmContractPoolInfo?.binStep === undefined) return
    try {
      if (binsTradeData?.length === 0) {
        setChartLoading(true)
      }
      const result = await fetchBinsTradeData({
        dataType: 'vol',
        period: DateTypeEnum[currentDateType.toLowerCase() as keyof typeof DateTypeEnum],
        poolId
      })

      if (result && result.length) {
        const tradeData = result
          ?.map(item => {
            const price = BinUtils?.getPriceFromBinId(
              item?.binId,
              dlmmContractPoolInfo!.binStep,
              dlmmApiPoolInfo?.tokenA?.decimals,
              dlmmApiPoolInfo?.tokenB?.decimals
            )
            const displayPrice = direct === dlmmApiPoolInfo?.isReverse ? d(1).div(price).toString() : price
            return {
              price: formatPriceUseInDlmmAxis(displayPrice),
              originPrice: displayPrice,
              binId: item?.binId,
              value: Number(item?.value)
            }
          })
          .sort((a: any, b: any) => Number(a.originPrice) - Number(b.originPrice))
        setBinsTradeData(tradeData)
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
    getBinsTradeData()
  }, [poolId, currentDateType, dlmmContractPoolInfo?.id, dlmmApiPoolInfo?.id, direct])

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
   * 切换日期类型
   * Switch date type
   */
  const handleDateTabChange = (item: Tab<DateTypes>) => {
    setCurrentDateType(item.label)
    if (item.label !== currentDateType) {
      setBinsTradeData([])
    }
  }

  const dateTypes = Object.values(DateTabsEnum).map(value => ({
    label: value
  }))

  return {
    handleDateTabChange,
    dateTypes,
    chartLoading,
    binsTradeData,
    hoverData,
    setHoverData,
    currentDateType,
    currentDateTypeLabel: DateTypeEnum[currentDateType.toLowerCase() as keyof typeof DateTypeEnum],
    time
  }
}

export default useBinsTrade
