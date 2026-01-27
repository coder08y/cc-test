import TvlChart from '@/components/chart/TvlChart'
import VolumeChart from '@/components/chart/VolumeChart'
import CoinPairInfo from '@/components/common/CoinPairInfo'
import useAnalyticChart, { ChartsTabsEnum, ChartsTabsType, DateTabsEnum, DateTypes } from '@/hooks/clmm/useAnalyticChart'
import useNavigateToLiquidity from '@/hooks/clmm/useNavigateToLiquidity'
import useLiquidityStore from '@/store/clmm'
import useGlobalStore from '@/store/common/global'
import { SelectTab } from '@cetus/design'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { d, formatPrice, isAvailableObject, removeComma } from '@cetus/utils'
import { Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import MobileAnalyticsCharts from './MobileAnalyticsCharts'
// pools列表新增AnalyticsModal需要传poolInfo 添加流动性有poolInfo不需要传
function AnalyticsCharts({ poolInfo }: { poolInfo?: any }) {
  const { isApp } = useWindowWidth()
  const {
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
  } = useAnalyticChart(poolInfo)
  const { setBackUrl } = useGlobalStore()
  const { goLiquidity } = useNavigateToLiquidity()
  const { poolAddress: queryPoolAddress } = useQueryParams()
  const { apiPoolInfo: liquidityStorePoolInfo } = useLiquidityStore()

  const apiPoolInfo = useMemo(() => {
    return isAvailableObject(poolInfo) ? poolInfo : liquidityStorePoolInfo
  }, [liquidityStorePoolInfo, poolInfo])

  const isAnalyticsModal = useMemo(() => {
    return isAvailableObject(poolInfo)
  }, [poolInfo])

  // console.log('isAnalyticsModal', isAnalyticsModal)

  const poolAddress = useMemo(() => {
    return isAvailableObject(poolInfo) ? poolInfo?.poolAddress : queryPoolAddress
  }, [poolInfo, queryPoolAddress])
  return (
    <VStack
      w="100%"
      align="flex-start"
      flex="1"
      border="1px solid"
      borderColor={isApp ? 'transparent' : 'border'}
      borderRadius={isApp ? '0px' : '16px'}
      p={{ base: '0px 12px', lg: '20px' }}
      bg={isApp ? 'transparent' : 'bg_secondary'}
      gap={isApp ? '0px' : '20px'}
    >
      {isAnalyticsModal && (
        <Box m={{ base: '0 0 -12px 0', lg: '-12px 0' }}>
          <CoinPairInfo poolInfo={poolInfo} symbolFontSize="16px" />
        </Box>
      )}
      <HStack w="100%" justify={{ base: 'center', lg: 'space-between' }}>
        {!isApp && (
          <SelectTab<ChartsTabsType, ChartsTabsEnum>
            type="outlineTab"
            tabList={chartsTabs}
            currentTab={currentChartTab}
            handleChangeTab={handleChartTabChange}
            wrapStyle={{
              h: '32px',
              p: '3px',
              borderRadius: '8px',
              flex: { base: '1', lg: '0 0 308px' }
            }}
            itemStyle={{
              fontSize: '12px',
              flex: 1,
              borderRadius: '6px'
            }}
          />
        )}

        {!isApp && (
          <SelectTab<DateTypes, DateTabsEnum>
            type="outlineTab"
            tabList={dateTypes}
            currentTab={currentDateType}
            handleChangeTab={handleDateTabChange}
            wrapStyle={{
              h: '32px',
              p: '3px',
              borderRadius: '8px',
              flex: '0 0 128px'
            }}
            itemStyle={{
              fontSize: '12px',
              flex: 1,
              borderRadius: '6px'
            }}
          />
        )}
      </HStack>
      {!isApp && (
        <VStack w="100%" align="flex-start">
          <Text color="text_caption" fontWeight={isAnalyticsModal ? '500' : '400'} fontSize={isAnalyticsModal ? '20px' : '24px'}>
            {hoverData?.num !== undefined && hoverData !== null
              ? d(removeComma(hoverData.num)).gte('0.01') || d(removeComma(hoverData.num)).equals('0')
                ? `$${formatPrice(hoverData?.num, 2)}`
                : '<$0.01'
              : defaultDisplay?.value}
          </Text>
          <Text>{hoverData?.date ? time : defaultDisplay?.title}</Text>
        </VStack>
      )}
      {isApp ? (
        <MobileAnalyticsCharts poolAddress={poolAddress || ''} apiPoolInfo={apiPoolInfo} isAnalyticsModal={isAnalyticsModal} />
      ) : (
        // PC端：根据tab显示对应图表
        <Box
          w="100%"
          h={isAnalyticsModal ? '240px' : '258px'}
          mt={isAnalyticsModal ? '0px' : '20px'}
          p={isAnalyticsModal ? '8px' : '0px'}
          bg={isAnalyticsModal ? 'rgba(255,255,255,0.05)' : 'none'}
          borderRadius="8px"
        >
          <Box w="100%" h="100%" position="relative">
            {chartLoading ? (
              <Box position="absolute" top={isAnalyticsModal ? '50%' : '30%'} left="50%" transform="translate(-50%,-50%)">
                <Spinner />
              </Box>
            ) : currentChartTab === ChartsTabsEnum.tvl ? (
              <TvlChart data={analyticsData} onChangeValue={data => setHoverData(data)} />
            ) : (
              <VolumeChart data={analyticsData} onChangeValue={data => setHoverData(data)} pageFrom="pools" />
            )}
          </Box>
        </Box>
      )}
      {isAnalyticsModal && (
        <Center cursor="pointer" w="100%" mt={{ base: '12px', lg: '0' }} mb={{ base: '12px', lg: '0' }}>
          <Text
            display="flex"
            align="center"
            lineHeight="18px"
            sx={{ _hover: { color: 'text_caption', svg: { fill: 'text_caption !important' } } }}
            fontWeight="500"
            borderRadius="8px"
            fontSize={{ base: '12px', lg: '14px' }}
            onClick={() => {
              setBackUrl('/pools')
              goLiquidity(`/clmm?tab=analytics&poolAddress=${poolInfo?.poolAddress}`, poolInfo)
            }}
          >
            More details
            <Icon xlinkHref="#icon-icon_ascending_nor" transform="rotate(90deg)" />
          </Text>
        </Center>
      )}
    </VStack>
  )
}

export default AnalyticsCharts
