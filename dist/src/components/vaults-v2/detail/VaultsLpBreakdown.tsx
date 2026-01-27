import { Block, SelectTab } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { SingleCoinImage } from '@cetus/ui-kit'
import { d, formatNumber, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, HStack, Skeleton, SkeletonCircle, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import LpBreakdownPieChart from './BreakdownPieChart'

const colorList = ['#75C8FF', '#00D8B6']

export default function VaultsLpBreakdown({
  currentVaultPool,
  apiVaultInfo,
  vaultsCoinAValue,
  vaultsCoinBValue,
  lpTokenInfo
}: {
  currentVaultPool: any
  apiVaultInfo: any
  vaultsCoinAValue: string
  vaultsCoinBValue: string
  lpTokenInfo: any
}) {
  const { displayAmountA, displayAmountB, displayPercentA, displayPercentB, totalSupply } = currentVaultPool || {}
  const { displayTokenA, displayTokenB } = apiVaultInfo || {}
  const [activePieChartIndex, setActivePieChartIndex] = useState<number | null>(null)
  const { isApp } = useWindowWidth()

  const handlePieChartHover = (index: number | null) => {
    setActivePieChartIndex(index)
  }

  const tabList = [
    {
      label: 'Total',
      value: 'total',
      key: 'total'
    },
    {
      label: '1 LP',
      value: '1lp',
      key: '1lp'
    }
  ]
  const [currentTab, setCurrentTab] = useState('total')

  const isLoading = useMemo(() => {
    return !currentVaultPool || !apiVaultInfo || !lpTokenInfo || !displayTokenA || !displayTokenB
  }, [currentVaultPool, apiVaultInfo, lpTokenInfo, displayTokenA, displayTokenB])

  useEffect(() => {
    setCurrentTab('total')
  }, [apiVaultInfo?.vaultId])

  const data = useMemo(() => {
    if (isLoading) return []
    const displayTotalSupply = d(+totalSupply ? totalSupply : '0')
      .div(10 ** lpTokenInfo?.decimals)
      .toString()
    const totalAmountUSD = d(+vaultsCoinAValue || '0')
      .add(d(+vaultsCoinBValue || '0'))
      .toString()
    return [
      {
        token: displayTokenA,
        amount: currentTab === 'total' ? displayAmountA : d(displayAmountA).div(d(displayTotalSupply).toString()).toString(),
        percent: displayPercentA,
        amountUSD: currentTab === 'total' ? vaultsCoinAValue : d(vaultsCoinAValue).div(d(displayTotalSupply).toString()).toString(),
        color: colorList[0]
      },
      {
        token: displayTokenB,
        amount: currentTab === 'total' ? displayAmountB : d(displayAmountB).div(d(displayTotalSupply).toString()).toString(),
        percent: displayPercentB,
        amountUSD: currentTab === 'total' ? vaultsCoinBValue : d(vaultsCoinBValue).div(d(displayTotalSupply).toString()).toString(),
        color: colorList[1]
      },
      {
        token: {
          ...lpTokenInfo,
          symbol: 'Vault LP'
        },
        amount: currentTab === 'total' ? displayTotalSupply : '1',
        percent: '',
        color: '',
        amountUSD: currentTab === 'total' ? totalAmountUSD : d(totalAmountUSD).div(d(displayTotalSupply).toString()).toString()
      }
    ]
  }, [
    currentVaultPool,
    lpTokenInfo,
    apiVaultInfo,
    currentTab,
    isLoading,
    totalSupply,
    displayAmountA,
    displayAmountB,
    displayPercentA,
    displayPercentB,
    vaultsCoinAValue,
    vaultsCoinBValue
  ])

  const hasPercentBeenCalc = useMemo(() => {
    return data.length >= 2 && data.slice(0, 2).every(item => Number(item?.percent) > 0)
  }, [data])

  return (
    <VStack gap="0px" w="100%" bg="bg_secondary" borderRadius="16px" p="16px 12px 0px 16px">
      <HStack w="100%" justify="space-between">
        <Text fontSize="16px" color="text_caption">
          LP Breakdown
        </Text>
        <SelectTab<any, any>
          type="outlineTab"
          tabList={tabList}
          currentTab={currentTab}
          handleChangeTab={tab => setCurrentTab(tab?.value)}
          wrapStyle={{
            w: '160px',
            h: '28px',
            p: '3px',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: '8px',
            gap: '4px',
            zIndex: '99'
          }}
          itemStyle={{
            w: '100px',
            h: '20px',
            p: '2px 8px',
            borderRadius: '4px',
            gap: '4px',
            fontSize: '12px'
          }}
        />
      </HStack>
      {isApp ? (
        <VaultsLpBreakdownApp
          data={data}
          handlePieChartHover={handlePieChartHover}
          activePieChartIndex={activePieChartIndex}
          isLoading={isLoading || !hasPercentBeenCalc}
          currentTab={currentTab}
        />
      ) : (
        <VaultsLpBreakdownPc
          data={data}
          handlePieChartHover={handlePieChartHover}
          activePieChartIndex={activePieChartIndex}
          isLoading={isLoading || !hasPercentBeenCalc}
          currentTab={currentTab}
        />
      )}
    </VStack>
  )
}

type VaultsLpBreakdownPcProps = {
  data: any[]
  isLoading: boolean
  handlePieChartHover: (index: number | null) => void
  activePieChartIndex: number | null
  currentTab: string
}

function VaultsLpBreakdownPc({ data, handlePieChartHover, activePieChartIndex, isLoading, currentTab }: VaultsLpBreakdownPcProps) {
  return isLoading ? (
    <VaultsLpBreakdownSkeletonPc />
  ) : (
    <HStack w="100%" justify="space-between" gap="0px">
      <HStack justifyContent="start" mt="40px" ml="-12px" mr="4px">
        <LpBreakdownPieChart data={data?.slice(0, 2)} onHover={handlePieChartHover} />
      </HStack>
      <Table variant="simple_list" w="100%" mt="4px">
        <Thead>
          <Tr>
            <Th fontSize={'12px'} color="primary_gray">
              Assets
            </Th>
            <Th fontSize={'12px'} textAlign="right" pr="20px" color="primary_gray">
              Token Amount
            </Th>
            <Th fontSize={'12px'} textAlign="right" color="primary_gray">
              Value
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, index) => {
            return (
              <>
                <Tr key={item?.token?.symbol} h="60px" opacity={activePieChartIndex === null || activePieChartIndex === index ? 1 : 0.5}>
                  <Td bg="#141414 !important" border="none !important" p="10px 16px 10px 0px !important" w="40% !important">
                    <HStack gap="6px">
                      <Box ml="16px" w="8px" h="8px" bg={item?.color} borderRadius="50%" />
                      <SingleTokenInfo
                        warningIcon={{ isNeedShow: false }}
                        token={item?.token}
                        haveName={false}
                        imgBoxStyle={{ w: '20px', h: '20px' }}
                        haveTooltip={true}
                      />
                    </HStack>
                  </Td>
                  <Td bg="#141414 !important" border="none !important" p="10px 20px 10px 0px !important" w="30% !important">
                    <Text color="text_caption">{formatNumber(item?.amount, 6)}</Text>
                  </Td>
                  <Td bg="#141414 !important" border="none !important" p="10px 16px 10px 0px !important" w="30% !important">
                    <VStack gap="2px" alignItems="end">
                      <Text color="text_caption">{symbolDataDisplayProcessing(item?.amountUSD, '$', currentTab === 'total' ? undefined : 4)}</Text>
                      {item?.percent && (
                        <Text borderRadius="4px" p="1px 4px" bg="rgba(144,156,164,0.1)" color={item?.color} fontSize="12px">
                          {item?.percent ? symbolDataDisplayProcessing(item?.percent, '%') : ''}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                </Tr>
                <Tr h="12px" />
              </>
            )
          })}
        </Tbody>
      </Table>
    </HStack>
  )
}

function VaultsLpBreakdownApp({ data, handlePieChartHover, activePieChartIndex, isLoading, currentTab }: VaultsLpBreakdownPcProps) {
  return isLoading ? (
    <VaultsLpBreakdownSkeletonApp />
  ) : (
    <VStack w="100%" pt="12px" pb="12px" gap="16px">
      <LpBreakdownPieChart data={data?.slice(0, 2)} onHover={handlePieChartHover} />

      {data.map((item, index) => {
        return (
          <Block
            bg="input_bg"
            borderRadius="8px"
            p="16px"
            borderColor="transparent"
            opacity={activePieChartIndex === null || activePieChartIndex === index ? 1 : 0.5}
          >
            <VStack alignItems="start" gap="12px">
              <HStack gap="6px">
                {index !== 2 && <Box w="8px" h="8px" bg={item?.color} borderRadius="50%" />}
                <SingleTokenInfo
                  warningIcon={{ isNeedShow: false }}
                  token={item?.token}
                  haveName={false}
                  imgBoxStyle={{ w: '20px', h: '20px' }}
                  haveTooltip={true}
                />
              </HStack>
              <HStack w="100%" justify="space-between" alignItems="start">
                <Text fontSize="12px" color="primary_gray">
                  Vault Allocation
                </Text>
                <HStack gap="4px" justifyContent="end" alignItems="center">
                  <Text color="text_caption">{symbolDataDisplayProcessing(item?.amountUSD, '$', currentTab === 'total' ? undefined : 4)}</Text>
                  {index !== 2 && (
                    <Text borderRadius="4px" p="2px 4px" bg="rgba(144,156,164,0.1)" color={item?.color} fontSize="12px">
                      {item?.percent ? symbolDataDisplayProcessing(item?.percent, '%') : ''}
                    </Text>
                  )}
                </HStack>
              </HStack>
              <HStack w="100%" justify="space-between" alignItems="start">
                <Text fontSize="12px" color="primary_gray">
                  Token Amount
                </Text>
                <Text color="text_caption">{formatNumber(item?.amount, 6)}</Text>
              </HStack>
            </VStack>
          </Block>
        )
      })}
    </VStack>
  )
}

function VaultsLpBreakdownSkeletonApp() {
  return (
    <VStack w="100%" pt="12px" gap="16px">
      <SkeletonCircle w="120px" h="120px" />

      {[1, 2, 3].map((item, index) => (
        <Block key={item} bg="input_bg" borderRadius="8px" p="16px" borderColor="transparent">
          <VStack alignItems="start" gap="12px">
            <HStack gap="6px">
              <SkeletonCircle w="8px" h="8px" />
              <SkeletonCircle w="20px" h="20px" />
              <Skeleton w="80px" h="16px" />
            </HStack>
            <HStack w="100%" justify="space-between" alignItems="start">
              <Skeleton w="100px" h="12px" />
              <VStack alignItems="end" gap="4px">
                <Skeleton w="80px" h="16px" />
                {index !== 2 && <Skeleton w="50px" h="12px" />}
              </VStack>
            </HStack>
            <HStack w="100%" justify="space-between" alignItems="start">
              <Skeleton w="90px" h="12px" />
              <Skeleton w="100px" h="16px" />
            </HStack>
          </VStack>
        </Block>
      ))}
    </VStack>
  )
}

function VaultsLpBreakdownSkeletonPc() {
  return (
    <HStack w="100%" justify="space-between" align="center">
      <Box>
        <SkeletonCircle w="100px" h="100px" />
      </Box>
      <Table variant="simple_list" w="100%" mt="4px">
        <Thead>
          <Tr>
            <Th color="primary_gray">Assets</Th>
            <Th textAlign="right" color="primary_gray">
              Token Amount
            </Th>
            <Th textAlign="right" color="primary_gray">
              Value
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {[1, 2, 3].map(item => (
            <>
              <Tr key={item} h="60px">
                <Td bg="#141414 !important" border="none !important" p="10px 16px 10px 0px !important" w="40% !important">
                  <HStack gap="6px">
                    <SkeletonCircle ml="16px" w="8px" h="8px" />
                    <SkeletonCircle w="20px" h="20px" />
                    <Skeleton w="80px" h="16px" />
                  </HStack>
                </Td>
                <Td bg="#141414 !important" border="none !important" p="10px 10px 10px 0px !important" w="30% !important">
                  <VStack align="flex-end" gap="4px">
                    <Skeleton w="80px" h="16px" />
                    <Skeleton w="50px" h="12px" />
                  </VStack>
                </Td>
                <Td bg="#141414 !important" border="none !important" p="10px 16px 10px 0px !important" w="30% !important">
                  <Skeleton w="60px" h="16px" ml="auto" />
                </Td>
              </Tr>
              <Tr h="12px" />
            </>
          ))}
        </Tbody>
      </Table>
    </HStack>
  )
}
