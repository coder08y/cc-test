import TvlChart from '@/components/chart/TvlChart'
import useGetVaultHistogram from '@/hooks/vault-v2/chart/useGetVaultHistogram'
import { Block, SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VAULT_FILTER } from '@cetus/types'
import { NoData } from '@cetus/ui-kit'
import { formatCurrency } from '@cetus/utils'
import { Box, BoxProps, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function TvlChartPageBlock({
  isRefresh,
  vaultsId,
  category,
  positionId,
  poolId,
  onTabChange,
  chartTypeList,
  vaultTvl,
  blockStyle
}: {
  vaultsId: string
  isRefresh: boolean
  category: string
  positionId?: string
  poolId?: string
  chartTypeList: Tab<string>[]
  onTabChange?: (tab: string) => void
  vaultTvl?: string
  blockStyle?: BoxProps
}) {
  const dateTypeList = [
    {
      label: '24H'
    },
    {
      label: '1W'
    },
    {
      label: '1M'
    }
  ]
  const [isLoading, setIsLoading] = useState(true)
  const [dateType, setDateType] = useState<'24H' | '1W' | '1M'>('24H')
  // 图表数据
  const { getVaultHistogram } = useGetVaultHistogram(category)
  const [pureTvlChartData, setPureTvlChartData] = useState([])
  const [pureTvlCurrentData, setPureTvlCurrentData] = useState()
  const [currentPureTvlCurrentData, setCurrentPureTvlCurrentDatC] = useState()
  const handleGetHistogramTvlData = async () => {
    setIsLoading(true)
    const now = Date.now()
    const oneDay = 86400 // 1 天的秒数
    const timeLimit = dateType == '24H' ? 1 * oneDay : dateType == '1W' ? 7 * oneDay : 30 * oneDay
    const beginTimestamp = !timeLimit ? 0 : String(Math.floor(now / 1000 - timeLimit))
    const tvl_res = await getVaultHistogram({
      dateType: dateType == '24H' ? 'day' : dateType == '1W' ? 'week' : 'month',
      vaultID: vaultsId,
      positionID: positionId || 'all',
      poolID: poolId || '',
      beginTimestamp,
      endTimestamp: String(Math.floor(now / 1000))
    })
    setCurrentPureTvlCurrentDatC(tvl_res[tvl_res.length - 1]?.num)
    setPureTvlCurrentData(tvl_res[tvl_res.length - 1]?.num)
    console.log('🚀 ~ file: TestData.tsx:78 ~ handleGetHistogramData ~ res:', tvl_res)
    setPureTvlChartData(tvl_res)
    setIsLoading(false)
  }

  const handleChangePureTvl = (data: any) => {
    console.log('🚀 ~ file: TestData.tsx:88 ~ handleChangePureTvl ~ data:', data)
    if (data) {
      setPureTvlCurrentData(data.num)
    } else {
      setPureTvlCurrentData(currentPureTvlCurrentData)
    }
  }

  useEffect(() => {
    if (category === 'haevault_v2') {
      if (vaultsId && positionId) {
        handleGetHistogramTvlData()
      }
    } else {
      if (vaultsId) {
        handleGetHistogramTvlData()
      }
    }
  }, [dateType, vaultsId, positionId])

  useEffect(() => {
    if (isRefresh) {
      handleGetHistogramTvlData()
    }
  }, [isRefresh])

  const { isApp } = useWindowWidth()

  return (
    <Block border="none" padding={isApp ? '12px' : '20px'} gap="16px" borderRadius="16px" {...blockStyle}>
      {chartTypeList.length > 0 ? (
        <>
          <HStack justify="space-between">
            {category !== 'cetus' ? (
              <SelectTab
                type="outlineTab"
                tabList={chartTypeList}
                currentTab={'TVL'}
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
            ) : (
              <VStack align="flex-start" gap="4px">
                <Text fontWeight="500" fontSize="14px">
                  Total Value Locked
                </Text>

                <Text fontSize="16px" color="text_caption" mt="8px">
                  {formatCurrency(vaultTvl, 2)}
                </Text>
              </VStack>
            )}
            <SelectTab
              type="outlineTab"
              tabList={dateTypeList as Tab}
              currentTab={dateType}
              handleChangeTab={tab => setDateType(tab.label as '24H' | '1W' | '1M')}
              wrapStyle={{
                w: '120px',
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
          {pureTvlCurrentData && category !== 'cetus' ? (
            <VStack align="flex-start" gap="4px" mt="16px">
              <Text fontWeight="500" fontSize="14px">
                Total Value Locked
              </Text>

              <Text fontSize="16px" color="text_caption" mt="8px">
                {formatCurrency(pureTvlCurrentData, 2)}
              </Text>
            </VStack>
          ) : (
            <VStack align="flex-start" gap="4px" mt="16px" />
          )}
        </>
      ) : (
        <HStack justify="space-between">
          <VStack align="flex-start" gap="4px">
            <Text fontWeight="500" fontSize="14px">
              Total Value Locked
            </Text>

            <Text fontSize="16px" color="text_caption" mt="8px">
              {formatCurrency(pureTvlCurrentData, 2)}
            </Text>
          </VStack>
          <SelectTab
            type="outlineTab"
            tabList={dateTypeList as Tab}
            currentTab={dateType}
            handleChangeTab={tab => setDateType(tab.label as '24H' | '1W' | '1M')}
            wrapStyle={{
              w: '120px',
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
      )}

      <Box w="100%" h="260px" mt="20px">
        <Box w="100%" h="260px" position="relative">
          {isLoading && (
            <Box position="absolute" top="38%" left="50%" transform="translate(-50%,-50%)">
              <Spinner />
            </Box>
          )}
          {pureTvlChartData.length > 0 && (
            <TvlChart data={pureTvlChartData} onChangeValue={handleChangePureTvl} isShowYAxis={true} toolTipsType="tvl" />
          )}
          {!isLoading && pureTvlChartData.length === 0 && <NoData type="nodata" />}
        </Box>
      </Box>
    </Block>
  )
}
