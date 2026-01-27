import PriceRangeChart from '@/components/chart/PriceRangeChart'
import useGetPriceRangeData from '@/hooks/vault-v2/chart/useGetVaultPriceRange'
import { Block, SelectTab, TooltipIcon } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d } from '@cetus/utils'
import { Box, HStack, Spinner, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

export default function PriceRangeChartPageBlock({
  isRefresh,
  vaultsId,
  isReverse,
  category,
  posId,
  poolId,
  tokenA,
  tokenB
}: {
  vaultsId?: string
  poolId?: string
  posId?: string
  isRefresh?: boolean
  isReverse?: boolean
  category: string
  tokenA?: any
  tokenB?: any
}) {
  const [isLoading, setIsLoading] = useState(true)
  const { getPriceRangeData } = useGetPriceRangeData(category)
  const [priceRangeData, setPriceRangeDate] = useState()
  // 用于跟踪当前请求的标识，防止竞态条件
  const currentRequestIdRef = useRef<string>('')

  const chartTypeList = [
    {
      label: '24H'
    },
    {
      label: '1W'
    }
  ]
  const [dateType, setDateType] = useState<'24H' | '1W'>('1W')
  const [isTabLoading, setIsTabLoading] = useState(false)

  const fetchPricerangeHistogram = async (type: string, showLoading: boolean = true) => {
    const now = Date.now()
    const oneDay = 86400 // 1 天的秒数
    const oneWeek = 604800 // 1 周的秒数
    const beginTimestamp = String(Math.floor(now / 1000 - (type == '24H' ? oneDay : oneWeek)))

    // 生成当前请求的唯一标识
    const requestId = `${vaultsId}-${posId}-${type}`
    currentRequestIdRef.current = requestId

    try {
      setIsLoading(showLoading)
      const res = await getPriceRangeData({
        vaultID: vaultsId,
        posId,
        poolId,
        dateType: type == '24H' ? 'min' : 'hour',
        beginTimestamp,
        endTimestamp: d(new Date().getTime()).div(1000).toFixed(0)
      })

      // 检查响应返回时，请求标识是否仍然匹配（防止竞态条件）
      if (currentRequestIdRef.current !== requestId) {
        console.log('🚀🚀🚀 ~ PriceRangeChartPageBlock.tsx: 请求已过期，忽略响应', {
          currentRequestId: currentRequestIdRef.current,
          responseRequestId: requestId
        })
        return
      }

      console.log('🚀🚀🚀 ~ PriceRangeChartPageBlock.tsx:53 ~ fetchPricerangeHistogram ~ res:', {
        res,
        isReverse
      })
      const result = res.map((item: any) => {
        const lower = category === 'haevault_v2' ? item.lower : isReverse ? d(1).div(d(item.upper)).toString() : item.lower
        const upper = category === 'haevault_v2' ? item.upper : isReverse ? d(1).div(d(item.lower)).toString() : item.upper
        const real = category === 'haevault_v2' ? item.real : isReverse ? d(1).div(item.real).toString() : item.real
        return {
          ...item,
          lower,
          upper,
          real
        }
      })

      setPriceRangeDate(result)
      setIsTabLoading(false)
      setIsLoading(false)
    } catch (error) {
      // 检查错误时也要验证请求标识
      if (currentRequestIdRef.current !== requestId) {
        console.log('🚀🚀🚀 ~ PriceRangeChartPageBlock.tsx: Request expired, ignore error', {
          currentRequestId: currentRequestIdRef.current,
          errorRequestId: requestId
        })
        return
      }
      setIsLoading(false)
      setIsTabLoading(false)
      console.log('🚀🚀🚀 ~ PriceRangeChartPageBlock.tsx:40 ~ fetchPricerangeHistogram ~ error:', error)
    }
  }

  useEffect(() => {
    if (vaultsId) {
      if (category === 'haevault_v2') {
        if (posId && poolId) {
          fetchPricerangeHistogram(dateType, true)
        }
      } else {
        fetchPricerangeHistogram(dateType, true)
      }
    }
  }, [vaultsId, dateType, category, poolId, posId])

  useEffect(() => {
    if (isRefresh) {
      fetchPricerangeHistogram(dateType, false)
    }
  }, [isRefresh])

  const { isApp } = useWindowWidth()

  return (
    <Block border="none" padding={isApp ? '12px' : '20px 8px 20px 20px'} borderRadius="16px">
      <HStack justify="space-between">
        <HStack pr="12px" w="100%" justify="space-between" gap="4px">
          <HStack gap="4px">
            <Text fontWeight="500" fontSize="16px" color="text_caption">
              Historical Ranges
            </Text>
            {/* <TooltipIcon tooltipCon='Historical data shown until vault discontinuation.' /> */}
          </HStack>

          <SelectTab
            type="outlineTab"
            tabList={chartTypeList}
            currentTab={dateType}
            handleChangeTab={tab => {
              setIsTabLoading(true)
              setDateType(tab.label)
            }}
            wrapStyle={{
              w: '80px',
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
      <Box w="100%" h="260px" mt="20px">
        <Box w="100%" h="260px" position="relative">
          {isLoading && (
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)">
              <Spinner />
            </Box>
          )}
          <PriceRangeChart
            data={priceRangeData}
            dateType={dateType}
            isTabLoading={isTabLoading}
            category={category}
            vaultId={vaultsId}
            tokenA={tokenA}
            tokenB={tokenB}
          />
        </Box>
      </Box>
    </Block>
  )
}
