import TvlChart from '@/components/chart/TvlChart'
import VolumeChart from '@/components/chart/VolumeChart'
import { ChartsTabsEnum, DateTabsEnum, DateTypes } from '@/hooks/dlmm/useDlmmAnalyticChart'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { d, formatPrice, removeComma } from '@cetus/utils'
import { Box, Spinner } from '@chakra-ui/react'

interface MobileAnalyticsChartsProps {
  poolId: string
  apiPoolInfo: any
  isAnalyticsModal?: boolean
  currentChartTab: ChartsTabsEnum
  currentDateType: DateTabsEnum
  handleDateTabChange: (item: Tab<DateTypes>) => void
  hoverData: any
  setHoverData: (data: any) => void
  chartLoading: boolean
  analyticsData: any[]
  time: string
  defaultDisplay?: { value?: string; title?: string }
}

function MobileAnalyticsCharts({
  poolId,
  apiPoolInfo,
  isAnalyticsModal = false,
  currentChartTab,
  currentDateType,
  handleDateTabChange,
  hoverData,
  setHoverData,
  chartLoading,
  analyticsData,
  time,
  defaultDisplay
}: MobileAnalyticsChartsProps) {
  const displayValue =
    hoverData?.num !== undefined && hoverData !== null
      ? d(removeComma(hoverData.num)).gte('0.01') || d(removeComma(hoverData.num)).equals('0')
        ? `$${formatPrice(hoverData?.num, 2)}`
        : '<$0.01'
      : defaultDisplay?.value || '-'

  const displayLabel = hoverData?.date ? time : defaultDisplay?.title || ''

  const ChartComponent = currentChartTab === ChartsTabsEnum.tvl ? TvlChart : VolumeChart
  const chartProps = currentChartTab === ChartsTabsEnum.tvl ? {} : { pageFrom: 'pools' as const }

  return (
    <Box
      w="100%"
      h={isAnalyticsModal ? '160px' : '158px'}
      p={isAnalyticsModal ? '8px' : '0px'}
      bg={isAnalyticsModal ? 'rgba(255,255,255,0.05)' : 'none'}
      borderRadius="8px"
    >
      <Box w="100%" h="100%" position="relative">
        {chartLoading ? (
          <Box position="absolute" top={isAnalyticsModal ? '50%' : '30%'} left="50%" transform="translate(-50%,-50%)">
            <Spinner />
          </Box>
        ) : (
          <ChartComponent data={analyticsData.length > 0 ? analyticsData : []} onChangeValue={setHoverData} {...chartProps} />
        )}
      </Box>
    </Box>
  )
}

export default MobileAnalyticsCharts
