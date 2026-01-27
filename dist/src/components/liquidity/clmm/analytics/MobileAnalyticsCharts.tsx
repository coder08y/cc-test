import TvlChart from '@/components/chart/TvlChart'
import VolumeChart from '@/components/chart/VolumeChart'
import { ChartsTypeEnum, DateTabsEnum, DateTypeEnum, DateTypes, LimitMap } from '@/hooks/clmm/useAnalyticChart'
import { useChartTime } from '@/hooks/common/useChartTime'
import useGetHistogramData from '@/hooks/stats/useGetHistogramData'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { d, formatPrice, removeComma } from '@cetus/utils'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

interface MobileAnalyticsChartsProps {
  poolAddress: string
  apiPoolInfo: any
  isAnalyticsModal?: boolean
}

function useChartData(poolAddress: string, chartType: ChartsTypeEnum) {
  const { getHistogramData } = useGetHistogramData()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hoverData, setHoverData] = useState<any>(null)
  const [dateType, setDateType] = useState<DateTabsEnum>(DateTabsEnum.d)
  const { getHoverTime, time } = useChartTime()

  useEffect(() => {
    if (!poolAddress) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getHistogramData({
          date_type: DateTypeEnum[dateType.toLowerCase() as keyof typeof DateTypeEnum],
          type: chartType,
          limit: LimitMap[dateType],
          address: poolAddress
        })
        if (result && result.length) {
          setData(result)
        }
      } catch (error) {
        console.error(error, `res-fetch${chartType}Data`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [poolAddress, dateType, chartType])

  const handleDateTabChange = (item: Tab<DateTypes>) => {
    setDateType(item.label)
  }

  const handleChartHover = (data: any) => {
    setHoverData(data)
    if (data?.date) {
      getHoverTime(data.date, dateType)
    }
  }

  return {
    data,
    loading,
    hoverData,
    dateType,
    time,
    handleDateTabChange,
    handleChartHover
  }
}

// 图表配置类型
interface ChartConfig {
  key: string
  title: string
  chartType: ChartsTypeEnum
  defaultLabel: string
  defaultValue: string
  ChartComponent: React.ComponentType<any>
  chartProps?: any
}

// 图表项组件
interface ChartItemProps {
  config: ChartConfig
  chartData: ReturnType<typeof useChartData>
  isAnalyticsModal: boolean
  dateTypes: Array<{ label: DateTabsEnum }>
}

function ChartItem({ config, chartData, isAnalyticsModal, dateTypes }: ChartItemProps) {
  const { data, loading, hoverData, dateType, time, handleDateTabChange, handleChartHover } = chartData

  const displayValue =
    hoverData?.num !== undefined && hoverData !== null
      ? d(removeComma(hoverData.num)).gte('0.01') || d(removeComma(hoverData.num)).equals('0')
        ? `$${formatPrice(hoverData?.num, 2)}`
        : '<$0.01'
      : config.defaultValue || '-'

  const displayLabel = hoverData?.date ? time : config.defaultLabel

  return (
    <VStack w="100%" align="flex-start" gap="12px" mb="28px">
      <Text fontWeight="500" fontSize="14px" color="text_caption">
        {config.title}
      </Text>
      <HStack w="100%" align="flex-start" gap="4px">
        <VStack w="100%" align="flex-start" gap="4px">
          <Text color="text_caption" fontWeight="500" fontSize="14px">
            {displayValue}
          </Text>
          <Text fontSize="12px">{displayLabel}</Text>
        </VStack>
        <SelectTab<DateTypes, DateTabsEnum>
          type="outlineTab"
          tabList={dateTypes}
          currentTab={dateType}
          handleChangeTab={handleDateTabChange}
          wrapStyle={{
            h: '22px',
            p: '2px',
            borderRadius: '6px',
            w: '92px',
            flex: { base: '0 0 92px' }
          }}
          itemStyle={{
            fontSize: { base: '10px', lg: '12px' },
            flex: 1,
            borderRadius: '4px'
          }}
        />
      </HStack>
      <Box
        w="100%"
        h={{ base: '158px', lg: isAnalyticsModal ? '160px' : '120px' }}
        p={isAnalyticsModal ? '8px' : '0px'}
        bg={isAnalyticsModal ? 'rgba(255,255,255,0.05)' : 'none'}
        borderRadius="8px"
      >
        <Box w="100%" h="100%" position="relative">
          {loading ? (
            <Box position="absolute" top={isAnalyticsModal ? '50%' : '30%'} left="50%" transform="translate(-50%,-50%)">
              <Spinner />
            </Box>
          ) : (
            <config.ChartComponent data={data.length > 0 ? data : []} onChangeValue={handleChartHover} {...config.chartProps} />
          )}
        </Box>
      </Box>
    </VStack>
  )
}

function MobileAnalyticsCharts({ poolAddress, apiPoolInfo, isAnalyticsModal = false }: MobileAnalyticsChartsProps) {
  const dateTypes = Object.values(DateTabsEnum).map(value => ({
    label: value
  }))

  const volumeChart = useChartData(poolAddress, ChartsTypeEnum.volume)
  const tvlChart = useChartData(poolAddress, ChartsTypeEnum.tvl)
  const feesChart = useChartData(poolAddress, ChartsTypeEnum.fees)

  const chartConfigs: ChartConfig[] = [
    {
      key: 'volume',
      title: 'VOL',
      chartType: ChartsTypeEnum.volume,
      defaultLabel: 'Volume (24H)',
      defaultValue: apiPoolInfo?.volume24Display,
      ChartComponent: VolumeChart,
      chartProps: { pageFrom: 'pools' }
    },
    {
      key: 'tvl',
      title: 'TVL',
      chartType: ChartsTypeEnum.tvl,
      defaultLabel: 'TVL',
      defaultValue: apiPoolInfo?.tvlDisplay,
      ChartComponent: TvlChart
    },
    {
      key: 'fees',
      title: 'Fee',
      chartType: ChartsTypeEnum.fees,
      defaultLabel: 'Fees (24H)',
      defaultValue: apiPoolInfo?.fees24Display,
      ChartComponent: VolumeChart,
      chartProps: { pageFrom: 'pools' }
    }
  ]

  const chartDataMap = {
    volume: volumeChart,
    tvl: tvlChart,
    fees: feesChart
  }

  return (
    <VStack w="100%" gap="12px">
      {chartConfigs.map((config, index) => (
        <ChartItem
          key={config.key}
          config={config}
          chartData={chartDataMap[config.key as keyof typeof chartDataMap]}
          isAnalyticsModal={isAnalyticsModal}
          dateTypes={dateTypes}
        />
      ))}
    </VStack>
  )
}

export default MobileAnalyticsCharts
