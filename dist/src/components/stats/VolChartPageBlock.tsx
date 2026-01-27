import { useChartTime } from '@/hooks/common/useChartTime'
import useGetHistogramData, { GetHistogramDataParams } from '@/hooks/stats/useGetHistogramData'
import { StatisticsSummary } from '@/types/clmm'
import { SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { symbolDataDisplayProcessing } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Box, HStack, Skeleton, Spinner, Text, VStack } from '@chakra-ui/react'
import { maxBy } from 'lodash-es'
import { useEffect, useState } from 'react'
import VolumeChart from '../chart/VolumeChart'

export default function VolChartPageBlock({
  statisticsData,
  pageFrom = 'stats',
  isRefresh,
  isAutoRefresh = false
}: {
  statisticsData?: StatisticsSummary
  pageFrom?: 'stats' | 'pools'
  isRefresh: boolean
  isAutoRefresh?: boolean // 标识是否为自动刷新
}) {
  const { isApp } = useWindowWidth()
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
  const [titleDate, setTitleDate] = useState('(24H)')
  const [isLoading, setIsLoading] = useState(true)
  const [volType, setVolType] = useState<'D' | 'W' | 'M'>('D')
  // 图表数据
  const { time, getHoverTime, getCurrentTime } = useChartTime()
  const { getHistogramData, getDlmmHistogramData } = useGetHistogramData()
  const [volChartData, setVolChartData] = useState<any[]>([])
  const [volCurrentData, setVolCurrentData] = useState(statisticsData?.summary?.vol24H)
  const [currentTime, setCurrentTime] = useState(time)

  const handleGetHistogramVolData = async (silent = false) => {
    if (!silent) {
      setIsLoading(true)
    }
    const params: GetHistogramDataParams = {
      type: 'vol',
      date_type: volType == 'D' ? 'day' : volType == 'W' ? 'wek' : 'mon'
    }
    // 选择D 默认为近期一个月 选择w，默认为近期1年 选择M 可展示近5年，无数据则不展示，当前时刻即展示历史全部数据
    // if (pageFrom !== 'stats') {
    params['limit'] = volType == 'D' ? 31 : volType == 'W' ? 52 : 60
    // }
    const clmm_vol_res = await getHistogramData(params)
    const dlmm_vol_res = await getDlmmHistogramData(params)
    const clmmArray = clmm_vol_res.map(item => {
      return {
        ...item,
        clmm: item?.num
      }
    })
    const dlmmArray = dlmm_vol_res.map(item => {
      return {
        ...item,
        dlmm: item?.num
      }
    })
    const maxLongArray = maxBy([clmmArray, dlmmArray], arr => arr.length)
    const minLongArray = maxLongArray?.some(item => item?.clmm !== undefined) ? dlmmArray : clmmArray
    const newArray = maxLongArray?.map(item => {
      const minItem = minLongArray?.find(minItem => minItem.date === item.date) ?? {}
      return {
        date: item?.date,
        xAxis: item?.xAxis,
        clmm: minItem?.num,
        dlmm: item?.num,
        num: d(item?.num || 0)
          .plus(minItem?.num || 0)
          .toNumber()
      }
    })
    setVolChartData(newArray || [])
    if (!silent) {
      setIsLoading(false)
    }
  }
  const handleChangeVol = (data: any) => {
    if (data) {
      getHoverTime(data.date, volType)
      setVolCurrentData(symbolDataDisplayProcessing(data.num, '$'))
      setTitleDate(volType == 'D' ? '(24H)' : volType == 'W' ? '(7D)' : '(30D)')
    } else {
      setTitleDate('(24H)')
      getCurrentTime()
      setVolCurrentData(statisticsData?.summary?.vol24H)
    }
  }
  useEffect(() => {
    if (isRefresh) {
      handleGetHistogramVolData(isAutoRefresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefresh])
  useEffect(() => {
    getCurrentTime()
  }, [])

  useEffect(() => {
    handleGetHistogramVolData()
  }, [volType])

  useEffect(() => {
    if (statisticsData) {
      setVolCurrentData(statisticsData?.summary?.vol24H)
    }
  }, [statisticsData])

  useEffect(() => {
    if (time) {
      setCurrentTime(time)
    }
  }, [time])

  return (
    <Box w={pageFrom == 'pools' ? '100%' : { base: '100%', lg: '50%' }}>
      <HStack w="100%" justify="space-between" align={pageFrom == 'pools' ? 'flex-start' : 'center'}>
        <VStack
          align="flex-start"
          gap={pageFrom == 'pools' ? { base: '4px', lg: '8px' } : '8px'}
          flexDirection={isApp && pageFrom == 'pools' ? 'column-reverse' : 'column'}
        >
          <Text
            fontSize={pageFrom == 'pools' ? { base: '12px', lg: '14px' } : '14px'}
            lineHeight={pageFrom == 'pools' ? { base: '16px', lg: '1' } : '1'}
            fontWeight={pageFrom == 'pools' ? { base: '400', lg: '600' } : '600'}
          >
            Trading Volume {titleDate}
          </Text>
          <Skeleton isLoaded={!!volCurrentData} h={isApp && pageFrom == 'pools' ? '18px' : '20px'}>
            <Text
              fontWeight={'500'}
              lineHeight={pageFrom == 'pools' ? { base: '18px', lg: '1' } : '1'}
              fontSize={isApp && pageFrom == 'pools' ? '14px' : '20px'}
              color="text_caption"
            >
              {volCurrentData}
            </Text>
          </Skeleton>
          {pageFrom == 'stats' && <Text fontWeight="500">{currentTime}</Text>}
        </VStack>
        <SelectTab
          type="outlineTab"
          tabList={chartTypeList}
          currentTab={volType}
          handleChangeTab={(tab: any) => setVolType(tab.label as 'D' | 'W' | 'M')}
          wrapStyle={{
            w: pageFrom == 'pools' ? { base: '92px', lg: '128px' } : '128px',
            h: pageFrom == 'pools' ? { base: '24px', lg: '32px' } : '32px',
            p: '3px',
            borderRadius: pageFrom == 'pools' ? { base: '6px', lg: '8px' } : '8px'
          }}
          itemStyle={{
            flex: '1',
            fontSize: pageFrom == 'pools' ? { base: '12px', lg: '14px' } : '14px',
            margin: '0px',
            sx: {
              '& p': {
                color: pageFrom == 'pools' ? { base: 'primary !important', lg: 'primary_gray' } : 'primary_gray'
              },
              '&[data-active="true"] p': {
                color: 'primary'
              }
            }
          }}
        />
      </HStack>

      <Box w="100%" h={pageFrom == 'pools' ? { base: '170px', lg: '270px' } : '260px'} position="relative" pt={{ base: '0', lg: '20px' }}>
        {isLoading && (
          <Box position="absolute" top="38%" left="50%" transform="translate(-50%,-50%)">
            <Spinner />
          </Box>
        )}

        <VolumeChart data={volChartData} onChangeValue={handleChangeVol} pageFrom={pageFrom} />
        {isApp && pageFrom == 'pools' && <Box h="12px" width={'100vw'} ml="-12px" bg="bg_secondary" mt="4px" />}
      </Box>
    </Box>
  )
}
