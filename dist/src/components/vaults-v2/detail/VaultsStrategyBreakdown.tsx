import CoinPairInfo, { PoolShowInfo } from '@/components/common/CoinPairInfo'
import MiningIcon from '@/components/common/MiningIcon'
import { useEasterEgg } from '@/hooks/common/useEasterEgg'
import { useVaultsStrategy } from '@/hooks/vault-v2/useVaultsStrategy'
import useVaultsPoolContract from '@/store/vaults-v2/useVaultsPoolContract'
import { Block, CetusTooltip, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Pagination, SingleCoinImage } from '@cetus/ui-kit'
import { Decimal, d, formatCurrency, formatCurrencyUSD, formatNumber, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, SkeletonCircle, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { useMemo, useState } from 'react'
import { VaultsMultiPoolTooltip } from '../common/VaultsMultiPoolTooltip'
import { VaultsAprTooltipContent } from '../list/common/VaultsAprBlock'
import VaultAllocationModal from '../modal/VaultAllocationModal'
import VaultDlmmLiquidityModal from '../modal/VaultDlmmLiquidityModal'
import LpBreakdownPieChart from './BreakdownPieChart'

const PAGE_SIZE = 5

export default function VaultsStrategyBreakdown({ currentVaultPool, apiVaultInfo }: { currentVaultPool: any; apiVaultInfo: any }) {
  const { vaultClmmPoolContractInfoObj, vaultDlmmPoolContractInfoObj } = useVaultsPoolContract()
  const [currentPositionBalance, setCurrentPositionBalance] = useState<any>()
  const [activePieChartIndex, setActivePieChartIndex] = useState<number | null>(null)
  const { isApp } = useWindowWidth()

  const { poolBalanceList } = useVaultsStrategy(currentVaultPool, apiVaultInfo)

  const [currentPage, setCurrentPage] = useState(1)

  const [isOpen, setIsOpen] = useState(false)
  const [eggPoolBalance, setEggPoolBalance] = useState<any>(null)

  // 彩蛋：连续点击5次触发（仅 dlmm 类型）
  const handleEasterEggClick = useEasterEgg({
    clickCount: 5,
    timeWindow: 2000,
    validator: (item: any) => item?.tag === 'dlmm',
    onTrigger: (item: any) => {
      console.log('🚀🚀🚀 ~ VaultsStrategyBreakdown.tsx:40 ~ onTrigger ~ item:', item)
      setEggPoolBalance(item)
    }
  })
  useDeepCompareEffect(() => {
    console.log('🚀🚀🚀 ~ VaultsStrategyBreakdown.tsx:16 ~ useEffect ~ vaultClmmPoolContractInfoObj:', {
      vaultClmmPoolContractInfoObj,
      vaultDlmmPoolContractInfoObj,
      currentVaultPool,
      apiVaultInfo,
      poolBalanceList
    })
  }, [vaultClmmPoolContractInfoObj, vaultDlmmPoolContractInfoObj, currentVaultPool, apiVaultInfo, poolBalanceList])

  const displayPositionBalanceList = useMemo(() => {
    return poolBalanceList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  }, [poolBalanceList, currentPage])

  const handlePieChartHover = (index: number | null) => {
    setActivePieChartIndex(index)
  }

  const handleOpenVaultAllocationModal = (item: any) => {
    setCurrentPositionBalance(item)
    setIsOpen(true)
  }

  return (
    <VStack gap="0px" w="100%" bg="bg_secondary" borderRadius="16px" p="16px 12px 0px 16px">
      <HStack w="100%" justify="space-between">
        <Text fontSize="16px" color="text_caption">
          Strategy Breakdown
        </Text>
      </HStack>

      {isApp ? (
        <VaultsStrategyBreakdownApp
          displayPositionBalanceList={displayPositionBalanceList}
          poolBalanceList={poolBalanceList}
          handlePieChartHover={handlePieChartHover}
          activePieChartIndex={activePieChartIndex}
          handleOpenVaultAllocationModal={handleOpenVaultAllocationModal}
          handleEasterEggClick={handleEasterEggClick}
        />
      ) : (
        <VaultsStrategyBreakdownPc
          displayPositionBalanceList={displayPositionBalanceList}
          poolBalanceList={poolBalanceList}
          handlePieChartHover={handlePieChartHover}
          activePieChartIndex={activePieChartIndex}
          handleOpenVaultAllocationModal={handleOpenVaultAllocationModal}
          handleEasterEggClick={handleEasterEggClick}
        />
      )}

      {isOpen && currentPositionBalance && (
        <VaultAllocationModal
          isOpen={isOpen}
          positionBalance={currentPositionBalance}
          apiVaultInfo={apiVaultInfo}
          chartRefresh={false}
          category={'haevault_v2'}
          currentVaultPool={currentVaultPool}
          vaultTvl={''}
          onClose={() => setIsOpen(false)}
        />
      )}

      {poolBalanceList.length > PAGE_SIZE && (
        <HStack w="100%" pb="28px" justifyContent="center">
          <Pagination
            showFirstLastJump={true}
            total={poolBalanceList.length}
            size={PAGE_SIZE}
            currentPage={currentPage}
            onChange={value => {
              setCurrentPage(value)
            }}
          />
        </HStack>
      )}

      {eggPoolBalance && (
        <VaultDlmmLiquidityModal
          isOpen={true}
          apiVaultInfo={apiVaultInfo}
          bin_infos={eggPoolBalance?.positions[0]?.bin_infos}
          dlmmPoolInfo={eggPoolBalance?.pool}
          onClose={() => setEggPoolBalance(null)}
        />
      )}
    </VStack>
  )
}

function VaultsStrategyBreakdownApp({
  displayPositionBalanceList,
  poolBalanceList,
  handlePieChartHover,
  activePieChartIndex,
  handleOpenVaultAllocationModal,
  handleEasterEggClick
}: VaultsStrategyBreakdownPcProps) {
  return poolBalanceList.length === 0 ? (
    <VaultsStrategyBreakdownSkeletonApp />
  ) : (
    <VStack w="100%" pt="12px" gap="16px" pb="12px">
      <LpBreakdownPieChart data={poolBalanceList} onHover={handlePieChartHover} />

      {displayPositionBalanceList.map((item, index) => {
        const isDlmm = item?.tag === 'dlmm'
        return (
          <Block
            bg="input_bg"
            borderRadius="8px"
            p="16px"
            borderColor="transparent"
            opacity={activePieChartIndex === null || activePieChartIndex === index ? 1 : 0.5}
            onClick={isDlmm ? () => handleEasterEggClick(item) : undefined}
          >
            <VStack alignItems="start" gap="12px">
              <HStack w="100%" justify="space-between">
                <HStack gap="6px">
                  <Box w="8px" h="8px" bg={item?.color} borderRadius="50%" />
                  <CoinPairInfo
                    type="row"
                    showSymbol={false}
                    poolType={item?.tag === 'buffer' ? 'clmm' : item?.tag}
                    poolInfo={{
                      displayTokenA: item?.displayTokenA,
                      displayTokenB: item?.displayTokenB,
                      feeDisplay: item?.feeDisplay,
                      binStep: item?.bin_step,
                      poolAddress: item?.certified_pool_id,
                      poolCount: 1
                    }}
                    tooltipComponent={
                      item?.tag === 'buffer' ? (
                        <Text fontSize="12px" lineHeight="16px" color="primary_gray">
                          Idle liquidity is held in the vault awaiting allocation to an active strategy.
                        </Text>
                      ) : (
                        <VaultsMultiPoolTooltip
                          poolInfo={{
                            displayTokenA: item?.displayTokenA,
                            displayTokenB: item?.displayTokenB,
                            feeDisplay: item?.feeDisplay,
                            binStep: item?.bin_step,
                            poolAddress: item?.certified_pool_id,
                            poolType: item?.tag === 'buffer' ? undefined : item?.tag
                          }}
                        />
                      )
                    }
                    imgStyle={{
                      w: '20px',
                      h: '20px'
                    }}
                    showPoolTypeTag={item?.tag !== 'buffer'}
                    showDisabledTag={item?.tag === 'buffer'}
                  />
                </HStack>
                {item?.tag !== 'buffer' && (
                  <Button
                    cursor="pointer"
                    w="48px"
                    h="24px"
                    fontSize="12px"
                    lineHeight="32px"
                    bg="rgba(144,156,164,0.1)"
                    _hover={{
                      bg: 'rgba(144,156,164,0.2)'
                    }}
                    borderRadius="8px"
                    textAlign="center"
                    color="text_paragraph"
                    onClick={() => {
                      console.log('item###🚀 ~ onClick ~ item:', item)
                      handleOpenVaultAllocationModal(item)
                    }}
                  >
                    Details
                  </Button>
                )}
              </HStack>

              <HStack w="100%" justify="space-between" alignItems="start">
                <Text fontSize="12px" color="primary_gray">
                  Vault Allocation
                </Text>
                <HStack gap="4px" justifyContent="end" alignItems="center">
                  <Text color="text_caption">{symbolDataDisplayProcessing(item?.tokenValue, '$', 2, true, true)}</Text>
                  <Text borderRadius="4px" p="2px 4px" bg={item?.bgColor} color={item?.color} fontSize="12px">
                    {item?.realPercent ? symbolDataDisplayProcessing(item?.realPercent, '%', 2, true, true) : ''}
                  </Text>
                </HStack>
              </HStack>
              <HStack w="100%" justify="space-between" alignItems="start">
                <Text fontSize="12px" color="primary_gray">
                  APY
                </Text>
                <HStack justifyContent="end" gap="0px">
                  {/* {item.hasMining && <MiningIcon tooltip='APY includes mining rewards from the underlying liquidity pool' size={14} />} */}
                  <CetusTooltip
                    tooltip={
                      <VaultsAprTooltipContent
                        vaultsApyDisplay={item?.apy && +item.apy ? symbolDataDisplayProcessing(item?.apy, '%', 2, true, true) : '-'}
                        vaultsAprDisplay={item?.apr && +item.apr ? symbolDataDisplayProcessing(item?.apr, '%', 2, true, true) : '-'}
                        vaultFarmingAprDisplay={''}
                        isVaultsFarming={false}
                      />
                    }
                    placement="bottom"
                  >
                    <Text ml="4px" fontSize="14px" color="text_caption">
                      {item?.apy && +item.apy ? symbolDataDisplayProcessing(item?.apy, '%', 2, true, true) : '-'}
                    </Text>
                  </CetusTooltip>
                </HStack>
              </HStack>
            </VStack>
          </Block>
        )
      })}
    </VStack>
  )
}
type VaultsStrategyBreakdownPcProps = {
  displayPositionBalanceList: any[]
  poolBalanceList: any[]
  handlePieChartHover: (index: number | null) => void
  activePieChartIndex: number | null
  handleOpenVaultAllocationModal: (item: any) => void
  handleEasterEggClick: (item: any) => void
}
function VaultsStrategyBreakdownPc({
  displayPositionBalanceList,
  poolBalanceList,
  handlePieChartHover,
  activePieChartIndex,
  handleOpenVaultAllocationModal,
  handleEasterEggClick
}: VaultsStrategyBreakdownPcProps) {
  return poolBalanceList.length === 0 ? (
    <VaultsStrategyBreakdownSkeletonPc />
  ) : (
    <HStack w="100%" justify="space-between" gap="0px">
      <HStack justifyContent="start" mt="40px" ml="-12px" mr="4px">
        <LpBreakdownPieChart data={poolBalanceList} onHover={handlePieChartHover} />
      </HStack>
      <Table variant="simple_list" w="100%" mt="8px">
        <Thead>
          <Tr>
            <Th fontSize={'12px'} color="primary_gray">
              Pool
            </Th>
            <Th fontSize={'12px'} textAlign="right" color="primary_gray" whiteSpace="nowrap">
              Vault Allocation
            </Th>
            <Th fontSize={'12px'} textAlign="right" color="primary_gray">
              APY
            </Th>
            <Th fontSize={'12px'} textAlign="right" />
          </Tr>
        </Thead>
        <Tbody>
          {displayPositionBalanceList.map((item, index) => {
            const isDlmm = item?.tag === 'dlmm'
            return (
              <>
                <Tr
                  key={item?.certified_pool_id}
                  h="60px"
                  opacity={activePieChartIndex === null || activePieChartIndex === index ? 1 : 0.5}
                  onClick={isDlmm ? () => handleEasterEggClick(item) : undefined}
                >
                  <Td bg="#141414 !important" border="none !important" p="10px 16px 10px 0px !important" w="35% !important">
                    <HStack gap="6px">
                      <Box ml="16px" w="8px" h="8px" bg={item?.color} borderRadius="50%" />
                      <CoinPairInfo
                        type="row"
                        showSymbol={false}
                        poolType={item?.tag === 'buffer' ? 'clmm' : item?.tag}
                        poolInfo={{
                          displayTokenA: item?.displayTokenA,
                          displayTokenB: item?.displayTokenB,
                          feeDisplay: item?.feeDisplay,
                          binStep: item?.bin_step,
                          poolAddress: item?.certified_pool_id,
                          poolCount: 1
                        }}
                        tooltipComponent={
                          item?.tag === 'buffer' ? (
                            <Text fontSize="12px" lineHeight="16px" color="primary_gray">
                              Idle liquidity is held in the vault awaiting allocation to an active strategy.
                            </Text>
                          ) : (
                            <VaultsMultiPoolTooltip
                              poolInfo={{
                                displayTokenA: item?.displayTokenA,
                                displayTokenB: item?.displayTokenB,
                                feeDisplay: item?.feeDisplay,
                                binStep: item?.bin_step,
                                poolAddress: item?.certified_pool_id,
                                poolType: item?.tag === 'buffer' ? undefined : item?.tag
                              }}
                            />
                          )
                        }
                        imgStyle={{
                          w: '20px',
                          h: '20px'
                        }}
                        showPoolTypeTag={item?.tag !== 'buffer'}
                        showDisabledTag={item?.tag === 'buffer'}
                      />
                    </HStack>
                  </Td>
                  <Td bg="#141414 !important" border="none !important" p="10px 10px 10px 0px !important" w="30% !important">
                    <VStack align="end" gap="2px">
                      <Text color="text_caption">{formatCurrency(item?.tokenValue, 2)}</Text>
                      <Text borderRadius="4px" p="1px 4px" bg={item?.bgColor} color={item?.color} fontSize="12px">
                        {item?.realPercent ? symbolDataDisplayProcessing(item?.realPercent, '%', 2, true, true) : ''}
                      </Text>
                    </VStack>
                  </Td>
                  <Td bg="#141414 !important" border="none !important" p="10px 2px 10px 0px !important" w="25% !important">
                    <HStack justifyContent="end" gap="0px">
                      {/* {item.hasMining && <MiningIcon tooltip='APY includes mining rewards from the underlying liquidity pool' size={14} />} */}
                      <CetusTooltip
                        tooltip={
                          <VaultsAprTooltipContent
                            vaultsApyDisplay={item?.apy && +item.apy ? symbolDataDisplayProcessing(item.apy, '%', 2, true, true) : '-'}
                            vaultsAprDisplay={item?.apr && +item.apr ? symbolDataDisplayProcessing(item?.apr, '%', 2, true, true) : '-'}
                            vaultFarmingAprDisplay={''}
                            isVaultsFarming={false}
                          />
                        }
                        placement="bottom"
                        showTooltip={item?.tag !== 'buffer'}
                      >
                        <Text ml="4px" fontSize="14px" color="text_caption">
                          {item?.apy && +item.apy ? symbolDataDisplayProcessing(item?.apy, '%', 2, true, true) : '-'}
                        </Text>
                      </CetusTooltip>
                    </HStack>
                  </Td>

                  <Td bg="#141414 !important" border="none !important" p="10px 10px 10px 0px !important" w="10% !important">
                    {item?.tag !== 'buffer' && (
                      <Button
                        ml="10px"
                        cursor="pointer"
                        w="48px"
                        h="24px"
                        fontSize="12px"
                        lineHeight="24px"
                        bg="rgba(144,156,164,0.1)"
                        _hover={{
                          bg: 'rgba(144,156,164,0.2)'
                        }}
                        borderRadius="8px"
                        textAlign="center"
                        color="text_paragraph"
                        onClick={() => {
                          console.log('item###🚀 ~ onClick ~ item:', item)
                          handleOpenVaultAllocationModal(item)
                        }}
                      >
                        Details
                      </Button>
                    )}
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

function VaultsStrategyBreakdownSkeletonApp() {
  return (
    <VStack w="100%" pt="12px" gap="16px" pb="12px">
      <SkeletonCircle w="100px" h="100px" alignSelf="center" />

      {[1, 2, 3].map(item => (
        <Block key={item} bg="input_bg" borderRadius="8px" p="16px" borderColor="transparent">
          <VStack alignItems="start" gap="12px">
            <HStack gap="6px">
              <SkeletonCircle w="8px" h="8px" />
              <VStack align="flex-start" gap="4px">
                <Skeleton w="120px" h="16px" />
                <Skeleton w="80px" h="12px" />
              </VStack>
            </HStack>
            <HStack w="100%" justify="space-between" alignItems="start">
              <Skeleton w="80px" h="12px" />
              <VStack gap="4px" alignItems="end">
                <Skeleton w="80px" h="14px" />
                <Skeleton w="50px" h="12px" borderRadius="4px" />
              </VStack>
            </HStack>
            <HStack w="100%" justify="space-between" alignItems="start">
              <Skeleton w="40px" h="12px" />
              <Skeleton w="50px" h="14px" />
            </HStack>
            <Skeleton w="100%" h="32px" borderRadius="8px" />
          </VStack>
        </Block>
      ))}
    </VStack>
  )
}

function VaultsStrategyBreakdownSkeletonPc() {
  return (
    <HStack w="100%" justify="space-between" align="center">
      <Box>
        <SkeletonCircle w="100px" h="100px" />
      </Box>
      <Table variant="simple_list" w="100%" mt="20px">
        <Thead>
          <Tr>
            <Th>Pool</Th>
            <Th textAlign="right">Vault Allocation</Th>
            <Th textAlign="right">APY</Th>
            <Th textAlign="right" />
          </Tr>
        </Thead>
        <Tbody>
          {[1, 2, 3].map(item => (
            <>
              <Tr key={item} h="60px">
                <Td bg="#141414 !important" border="none !important" p="10px 16px 10px 0px !important" w="40% !important">
                  <HStack gap="6px">
                    <SkeletonCircle ml="16px" w="8px" h="8px" />
                    <VStack align="flex-start" gap="4px">
                      <Skeleton w="120px" h="16px" />
                      <Skeleton w="80px" h="12px" />
                    </VStack>
                  </HStack>
                </Td>
                <Td bg="#141414 !important" border="none !important" p="10px 10px 10px 0px !important" w="30% !important">
                  <VStack align="flex-end" gap="4px">
                    <Skeleton w="80px" h="16px" />
                    <Skeleton w="50px" h="12px" />
                  </VStack>
                </Td>
                <Td bg="#141414 !important" border="none !important" p="10px 2px 10px 0px !important" w="30% !important">
                  <Skeleton w="40px" h="16px" ml="auto" />
                </Td>
                <Td bg="#141414 !important" border="none !important" p="10px 16px 10px 0px !important" w="30% !important">
                  <Skeleton w="48px" h="24px" borderRadius="8px" ml="auto" />
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
