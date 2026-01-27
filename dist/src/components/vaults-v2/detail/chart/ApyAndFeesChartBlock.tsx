import ApyAndFeesChart from '@/components/chart/ApyAndFeesChart'
import useGetVaultApyAndFeesHistogram from '@/hooks/vault-v2/chart/useGetVaultApyAndFeesHistogram'
import { Block, CetusTooltip } from '@cetus/design'
import SelectTab, { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinType } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { formatTimestampToUTC } from '@cetus/utils'
import { Box, BoxProps, HStack, Spinner, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { is } from 'valibot'

export default function ApyAndFeesChartBlock({
  isRefresh,
  vaultsId,
  category,
  positionId,
  vaultId,
  sunsetTime,
  poolId,
  chartTypeList = [],
  onTabChange,
  blockStyle
}: {
  vaultsId?: string
  isRefresh?: boolean
  category: string
  poolId?: string
  positionId?: string
  vaultId?: string
  sunsetTime?: number
  chartTypeList?: Tab<string>[]
  onTabChange?: (tab: string) => void
  blockStyle?: BoxProps
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartDate] = useState()
  const [quoteCoin, setQuoteCoin] = useState()
  const { isApp } = useWindowWidth()

  const { getTokenInfo } = useGetToken()
  const fetchToken = async (coinType: string) => {
    if (!coinType) return
    try {
      const coinInfo = await getTokenInfo(coinType as CoinType)
      console.log('🚀 ~ fetchToken ~ coinInfo:', coinType, coinInfo)
      if (coinInfo) {
        setQuoteCoin(coinInfo)
      }
    } catch (error) {
      console.error('Error fetching token info:', error)
    }
  }

  // 图表数据
  const { getVaultApyAndFeesHistogram } = useGetVaultApyAndFeesHistogram(category)

  const fetchPricerangeHistogram = async () => {
    setIsLoading(true)
    const now = Date.now()
    const oneDay = 86400 // 1 天的秒数
    const timeLimit = isApp ? 2 * oneDay : 7 * oneDay
    const beginTimestamp = !timeLimit ? 0 : String(Math.floor(now / 1000 - timeLimit))

    const { list, quote_type } = await getVaultApyAndFeesHistogram({
      vaultID: vaultsId as string,
      beginTimestamp,
      positionID: positionId || 'all',
      poolID: poolId,
      endTimestamp: String(Math.floor(now / 1000))
    })
    fetchToken(quote_type)
    setChartDate(list)
    console.log('🚀 ~ fetchPricerangeHistogram ~ tvl_res:', quote_type, list)
    setIsLoading(false)
  }

  useEffect(() => {
    if (vaultsId) {
      fetchPricerangeHistogram()
    }
  }, [vaultsId])

  useEffect(() => {
    if (isRefresh) {
      fetchPricerangeHistogram()
    }
  }, [isRefresh])

  return (
    <Block border="none" padding={isApp ? '12px' : '20px 8px 20px 20px'} borderRadius="16px" {...blockStyle}>
      {chartTypeList.length > 0 && (
        <SelectTab
          type="outlineTab"
          tabList={chartTypeList}
          currentTab={'APY'}
          handleChangeTab={tab => {
            // setIsTabLoading(true)
            onTabChange?.(tab.label as string)
          }}
          wrapStyle={{
            w: '208px',
            h: '32px',
            p: '3px',
            mb: '20px',
            borderRadius: '8px'
          }}
          itemStyle={{
            flex: '1',
            fontSize: '12px',
            margin: '0px'
          }}
        />
      )}
      <HStack justify="space-between">
        <HStack pr="12px" w="100%" justify="space-between" gap="4px">
          <HStack position="relative" zIndex={1000}>
            <Text fontWeight="500" fontSize="16px" color="text_caption">
              APY & Yields
            </Text>
            {sunsetTime && (
              <CetusTooltip
                tooltip={
                  <Text lineHeight="20px" fontSize="12px">
                    Data frozen at vault sunset on {formatTimestampToUTC(sunsetTime || 0)} UTC. No new updates.
                  </Text>
                }
                placement="top"
              >
                <Icon xlinkHref="#icon-icon_tips" />
              </CetusTooltip>
            )}
          </HStack>
        </HStack>
      </HStack>
      <Box w="100%" h="260px" mt="20px">
        <Box w="100%" h="260px" position="relative">
          {isLoading && (
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)">
              <Spinner />
            </Box>
          )}

          {!isLoading && !chartData && (
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)">
              <Text fontSize="14px" p="0 16px" textAlign="right">
                No available data
              </Text>
            </Box>
          )}

          {chartData && <ApyAndFeesChart data={chartData} dateType="" quoteCoin={quoteCoin} category={category} vaultId={vaultId} />}
        </Box>
      </Box>
    </Block>
  )
}
