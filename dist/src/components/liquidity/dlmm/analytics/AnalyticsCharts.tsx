import TvlChart from '@/components/chart/TvlChart'
import VolumeChart from '@/components/chart/VolumeChart'
import CoinPairInfo from '@/components/common/CoinPairInfo'
import useNavigateToLiquidity from '@/hooks/clmm/useNavigateToLiquidity'
import useDlmmAnalyticChart, { ChartsTabsEnum, ChartsTabsType, DateTabsEnum, DateTypes } from '@/hooks/dlmm/useDlmmAnalyticChart'
import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import { SelectTab } from '@cetus/design'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { d, formatPrice, isAvailableObject, removeComma } from '@cetus/utils'
import { Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
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
  } = useDlmmAnalyticChart(poolInfo)
  const { setBackUrl } = useGlobalStore()
  const { goDlmmLiquidity } = useNavigateToLiquidity()
  const { poolId: queryPoolId } = useQueryParams()
  const { dlmmApiPoolInfo: dlmmStorePoolInfo } = useDlmmLiquidityStore()

  const apiPoolInfo = useMemo(() => {
    return isAvailableObject(poolInfo) ? poolInfo : dlmmStorePoolInfo
  }, [dlmmStorePoolInfo, poolInfo])

  const isAnalyticsModal = useMemo(() => {
    return isAvailableObject(poolInfo)
  }, [poolInfo])

  const poolId = useMemo(() => {
    return isAvailableObject(poolInfo) ? poolInfo?.poolId : queryPoolId
  }, [poolInfo, queryPoolId])

  // 移动端使用简写标签
  const mobileChartsTabs = useMemo(() => {
    return chartsTabs.map(tab => {
      if (tab.label === ChartsTabsEnum.volume) {
        return { ...tab, label: 'VOL' as any, key: ChartsTabsEnum.volume }
      }
      if (tab.label === ChartsTabsEnum.fees) {
        return { ...tab, label: 'FEE' as any, key: ChartsTabsEnum.fees }
      }
      return { ...tab, key: ChartsTabsEnum.tvl } // TVL 已经是简写，但需要 key 来匹配
    }) as ChartsTabsType[]
  }, [chartsTabs])

  // 包装 handleChartTabChange，优先使用 key（移动端简写标签需要）
  const handleMobileChartTabChange = useCallback(
    (item: any) => {
      // 如果有 key，使用 key（原始枚举值），否则使用 label
      const tabValue = item.key || item.label
      handleChartTabChange({ ...item, label: tabValue })
    },
    [handleChartTabChange]
  )

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
      {isApp && (
        <Text fontWeight="500" fontSize="14px" color="text_caption" mb="12px">
          Pool Data
        </Text>
      )}
      <HStack w="100%" justify={{ base: 'flex-start', lg: 'space-between' }}>
        <SelectTab<ChartsTabsType, ChartsTabsEnum>
          type="outlineTab"
          tabList={isApp ? mobileChartsTabs : chartsTabs}
          currentTab={currentChartTab}
          handleChangeTab={isApp ? handleMobileChartTabChange : handleChartTabChange}
          wrapStyle={{
            h: '32px',
            p: '3px',
            borderRadius: '8px',
            flex: { base: '', lg: '0 0 308px' },
            ...(isApp && {
              w: '120px',
              border: 'none',
              bg: 'transparent'
            })
          }}
          itemStyle={{
            fontSize: '12px',
            flex: 1,
            borderRadius: '6px'
          }}
        />

        {!isApp && (
          <SelectTab<DateTypes, DateTabsEnum>
            type="outlineTab"
            tabList={dateTypes}
            currentTab={currentDateType}
            handleChangeTab={handleDateTabChange}
            wrapStyle={{
              h: '32px',
              p: '3px',
              borderRadius: '6px',
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
      {isApp && (
        <HStack w="100%" align="center" mt="12px">
          <VStack w="100%" align="flex-start" gap="4px">
            <Text color="text_caption" fontWeight="500" fontSize="14px">
              {hoverData?.num !== undefined && hoverData !== null
                ? d(removeComma(hoverData.num)).gte('0.01') || d(removeComma(hoverData.num)).equals('0')
                  ? `$${formatPrice(hoverData?.num, 2)}`
                  : '<$0.01'
                : defaultDisplay?.value}
            </Text>
            <Text fontSize="12px">{hoverData?.date ? time : defaultDisplay?.title}</Text>
          </VStack>
          <HStack w="100%" justify="flex-end">
            <SelectTab<DateTypes, DateTabsEnum>
              type="outlineTab"
              tabList={dateTypes}
              currentTab={currentDateType}
              handleChangeTab={handleDateTabChange}
              wrapStyle={{
                w: '92px',
                h: '22px',
                p: '2px',
                borderRadius: '6px',
                flex: '0 0 92px'
              }}
              itemStyle={{
                fontSize: '10px',
                flex: 1,
                borderRadius: '4px'
              }}
            />
          </HStack>
        </HStack>
      )}
      {isApp ? (
        <MobileAnalyticsCharts
          poolId={poolId || ''}
          apiPoolInfo={apiPoolInfo}
          isAnalyticsModal={isAnalyticsModal}
          currentChartTab={currentChartTab}
          currentDateType={currentDateType}
          handleDateTabChange={handleDateTabChange}
          hoverData={hoverData}
          setHoverData={setHoverData}
          chartLoading={chartLoading}
          analyticsData={analyticsData}
          time={time}
          defaultDisplay={defaultDisplay}
        />
      ) : (
        // PC端：根据tab显示对应图表
        <Box
          w="100%"
          h={isAnalyticsModal ? '240px' : '358px'}
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
        <Center cursor="pointer" w="100%" mt={isApp ? '12px' : '0'} mb={{ base: '12px', lg: '0' }}>
          <Text
            display="flex"
            align="center"
            lineHeight="18px"
            sx={{ _hover: { color: 'text_caption', svg: { fill: 'text_caption !important' } } }}
            fontWeight="500"
            borderRadius="8px"
            fontSize={isApp ? '12px' : '14px'}
            onClick={() => {
              setBackUrl('/pools?tab=dlmm_pools')
              goDlmmLiquidity(`/dlmm?tab=analytics&poolId=${poolInfo?.poolId}`, poolInfo)
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
