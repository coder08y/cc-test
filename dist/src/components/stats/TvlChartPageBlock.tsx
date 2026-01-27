import { useChartTime } from '@/hooks/common/useChartTime'
import useGetHistogramData from '@/hooks/stats/useGetHistogramData'
import { StatisticsSummary } from '@/types/clmm'
import { SelectTab } from '@cetus/design'
import { d, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, HStack, Skeleton, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import AllTvlChart from '../chart/AllTvlChart'

export default function TvlChartPageBlock({ statisticsData, isRefresh }: { statisticsData?: StatisticsSummary; isRefresh: boolean }) {
  const chartTypeList = [
    {
      label: 'D'
    },
    {
      label: 'W'
    },
    {
      label: 'M'
    }
  ]
  const [isLoading, setIsLoading] = useState(true)
  const [pureTvlType, setPureTvlType] = useState<'D' | 'W' | 'M'>('D')
  // 图表数据
  const { time, getHoverTime, getCurrentTime } = useChartTime()
  const { getAllTvData } = useGetHistogramData()
  const [pureTvlChartData, setPureTvlChartData] = useState<any[]>([])
  const [pureTvlCurrentData, setPureTvlCurrentData] = useState(statisticsData?.summary?.totalTvl)
  const [currentTime, setCurrentTime] = useState(time)

  const handleGetHistogramTvlData = async () => {
    setIsLoading(true)
    const tvl_res = await getAllTvData({
      limit: pureTvlType == 'D' ? 31 : pureTvlType == 'W' ? 52 : 60,
      date_type: pureTvlType == 'D' ? 'day' : pureTvlType == 'W' ? 'wek' : 'mon'
    })
    console.log('🚀 ~ file: TestData.tsx:78 ~ handleGetHistogramData ~ res:', tvl_res)
    setPureTvlChartData(tvl_res)
    setIsLoading(false)
  }

  const handleChangePureTvl = (data: any) => {
    console.log('🚀 ~ file: TestData.tsx:88 ~ handleChangePureTvl ~ data:', data)
    if (data) {
      getHoverTime(data.date, pureTvlType)
      setPureTvlCurrentData(
        symbolDataDisplayProcessing(
          d(data?.clmm || 0)
            .plus(data?.dlmm || 0)
            .toNumber(),
          '$'
        )
      )
    } else {
      getCurrentTime()
      setPureTvlCurrentData(statisticsData?.summary?.totalTvl)
    }
  }
  useEffect(() => {
    if (isRefresh) {
      handleGetHistogramTvlData()
    }
  }, [isRefresh])
  useEffect(() => {
    getCurrentTime()
  }, [])

  useEffect(() => {
    handleGetHistogramTvlData()
  }, [pureTvlType])

  useEffect(() => {
    if (statisticsData) {
      setPureTvlCurrentData(statisticsData?.summary?.totalTvl)
    }
  }, [statisticsData])

  useEffect(() => {
    if (time) {
      setCurrentTime(time)
    }
  }, [time])

  return (
    <Box w={{ base: '100%', lg: '50%' }}>
      <HStack justify="space-between">
        <VStack align="flex-start" gap="8px">
          <Text fontWeight="500">Total Value Locked</Text>
          <Skeleton isLoaded={!!pureTvlCurrentData} h="20px">
            <Text fontWeight="500" fontSize="20px" color="text_caption">
              {pureTvlCurrentData}
            </Text>
          </Skeleton>

          <Text fontWeight="500">{currentTime}</Text>
        </VStack>
        <SelectTab
          type="outlineTab"
          tabList={chartTypeList}
          currentTab={pureTvlType}
          handleChangeTab={tab => setPureTvlType(tab.label)}
          wrapStyle={{
            w: '128px',
            h: '32px',
            p: '3px',
            borderRadius: '8px'
          }}
          itemStyle={{
            flex: '1',
            fontSize: '14px',
            margin: '0px'
          }}
        />
      </HStack>
      <Box w="100%" h="260px">
        <Box w="100%" h="260px" position="relative">
          {isLoading && (
            <Box position="absolute" top="38%" left="50%" transform="translate(-50%,-50%)">
              <Spinner />
            </Box>
          )}
          <AllTvlChart data={pureTvlChartData} onChangeValue={handleChangePureTvl} toolTipsType="tvl" currentTime={currentTime} />
        </Box>
      </Box>
    </Box>
  )
}
