import PerformanceChart from '@/components/chart/PerformanceChart'
import useGetPerformance, { PerformanceItem } from '@/hooks/vault-v2/chart/useGetPerformance'
import { Block, CetusTooltip, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon, NoData } from '@cetus/ui-kit'
import { formatTimestampToUTC } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Box, HStack, Spinner, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

const chartTypeList = [
  {
    label: 'TVL'
  },
  {
    label: 'Performance'
  }
]

export default function PerformanceChartPageBlock({
  isRefresh,
  poolId,
  displayCoinA,
  displayCoinB,
  category,
  status,
  isReverse,
  onTabChange,
  vaultId = '',
  sunsetTime
}: {
  poolId?: string
  vaultId?: string
  isRefresh?: boolean
  displayCoinA?: Token
  displayCoinB?: Token
  category: string
  isReverse?: boolean
  status?: string
  sunsetTime?: number
  onTabChange?: (tab: 'TVL' | 'Performance') => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { getGetPerformanceData } = useGetPerformance(category)
  const [holdLineUsdData, setHoldLineUsdData] = useState<PerformanceItem[]>([])
  const [holdLineQuoteData, setHoldLineQuoteData] = useState<PerformanceItem[]>([])

  const dateTypeList = useMemo(() => {
    return [
      {
        label: 'USD'
      },
      {
        label: 'SUI'
      }
    ]
  }, [])
  const [dateType, setDateType] = useState<string>('USD')
  const [isTabLoading, setIsTabLoading] = useState(false)

  const fetchPerformanceHistogram = async () => {
    const now = Date.now()
    const oneDay = 86400 // 1 天的秒数
    const beginTimestamp = String(Math.floor(now / 1000 - oneDay * 31))
    try {
      setIsLoading(true)
      const res = await getGetPerformanceData({
        vaultId,
        dateType: 'hour',
        beginTimestamp,
        endTimestamp: d(new Date().getTime() / 1000).toFixed(0)
      })
      setHoldLineQuoteData(res.hold_line_quote)
      setHoldLineUsdData(res.hold_line_usd)

      setIsTabLoading(false)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      setIsTabLoading(false)
      console.log('🚀🚀🚀 ~ PriceRangeChartPageBlock.tsx:40 ~ fetchPricerangeHistogram ~ error:', error)
    }
  }

  useEffect(() => {
    if (poolId && vaultId) {
      fetchPerformanceHistogram()
    }
  }, [poolId, vaultId])

  useEffect(() => {
    if (isRefresh) {
      fetchPerformanceHistogram()
    }
  }, [isRefresh])

  const { isApp } = useWindowWidth()

  const isNoData = useMemo(() => {
    if (dateType === 'USD') {
      return (!holdLineUsdData || (holdLineUsdData && holdLineUsdData.length === 0)) && !isLoading
    } else {
      return (!holdLineQuoteData || (holdLineQuoteData && holdLineQuoteData.length === 0)) && !isLoading
    }
  }, [holdLineUsdData, holdLineQuoteData, isLoading, dateType])

  return (
    <Block border="none" padding={isApp ? '12px' : '20px 8px 20px 20px'} borderRadius="16px">
      <HStack justify="space-between">
        <HStack pr="12px" w="100%" justify="space-between" gap="4px">
          <SelectTab
            type="outlineTab"
            tabList={chartTypeList}
            currentTab={'Performance'}
            handleChangeTab={tab => {
              // setIsTabLoading(true)
              onTabChange?.(tab.label as 'TVL' | 'Performance')
            }}
            wrapStyle={{
              w: '208px',
              h: '32px',
              p: '3px',
              borderRadius: '8px'
            }}
            itemStyle={{
              flex: '1',
              fontSize: '12px',
              margin: '0px'
            }}
          />
          <SelectTab
            type="outlineTab"
            tabList={dateTypeList}
            currentTab={dateType}
            handleChangeTab={tab => {
              // setIsTabLoading(true)
              setDateType(tab.label)
            }}
            wrapStyle={{
              w: '100px',
              h: '28px',
              p: '3px',
              borderRadius: '8px'
            }}
            itemStyle={{
              flex: '1',
              fontSize: '12px',
              margin: '0px'
            }}
          />
        </HStack>
      </HStack>

      <HStack mt="16px" gap="4px">
        <Text fontWeight="500" fontSize="14px">
          Performance vs {dateType}
        </Text>

        <CetusTooltip
          tooltip={
            status !== 'sunset' ? (
              <Text lineHeight="20px" fontSize="12px">
                Comparably indicating different strategies’ performances. The vault performance curve includes vault yields in fee earnings plus
                mining & farming rewards, and has taken performance fees deduction into account.
              </Text>
            ) : (
              <Text lineHeight="20px" fontSize="12px">
                Data frozen at vault sunset on {formatTimestampToUTC(sunsetTime || 0)} UTC. No new updates.
              </Text>
            )
          }
          placement="top"
        >
          <Icon xlinkHref="#icon-icon_tips" />
        </CetusTooltip>
      </HStack>

      <Box w="100%" h="290px" mt="20px">
        <Box w="100%" h="260px" position="relative">
          {isNoData ? (
            <NoData type="nodata" noBorder text="No Available Data" />
          ) : (
            <PerformanceChart
              vaultId={vaultId}
              dateType={dateType as 'sui' | 'usd'}
              displayCoinA={displayCoinA}
              displayCoinB={displayCoinB}
              data={dateType === 'USD' ? holdLineUsdData : holdLineQuoteData}
              isTabLoading={isTabLoading}
            />
          )}
          {isLoading && (
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)">
              <Spinner />
            </Box>
          )}
        </Box>
      </Box>
    </Block>
  )
}
