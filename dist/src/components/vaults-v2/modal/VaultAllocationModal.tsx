import { PoolShowInfo } from '@/components/common/CoinPairInfo'
import { Block } from '@cetus/design'
import { SingleCoinImage } from '@cetus/ui-kit'
import { d, formatCurrency, formatNumber, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import VaultsChartTvlAndApy from '../detail/VaultsChartTvlAndApy'
import PriceRangeChartPageBlock from '../detail/chart/PriceRangeChartPageBlock'

type VaultAllocationProps = {
  isOpen: boolean
  apiVaultInfo?: any
  chartRefresh: boolean
  currentVaultPool?: any
  category: string
  vaultTvl: string
  positionBalance: any
  onClose: () => void
}
function VaultAllocationModal(props: VaultAllocationProps) {
  const { isOpen, apiVaultInfo, chartRefresh, category, currentVaultPool, vaultTvl, onClose, positionBalance } = props

  const assetsList = useMemo(() => {
    console.log('🚀 ~ assetsList ~ positionBalance:', {
      positionBalance,
      apiVaultInfo
    })
    const assetsList: any[] = []
    const { tokenValue, tokenAValue, tokenBValue, displayTokenA, displayTokenB, tokenAmountA, tokenAmountB } = positionBalance
    const percentA = d(tokenAValue).div(d(tokenValue)).mul(100).toFixed(2)
    const percentB = d(100).sub(d(percentA)).toFixed(2)
    const isReverse = apiVaultInfo?.isReverse
    assetsList.push({
      tokenAmount: isReverse ? tokenAmountB : tokenAmountA,
      tokenValue: isReverse ? tokenBValue : tokenAValue,
      percent: isReverse ? percentB : percentA,
      token: displayTokenA,
      color: '#75C8FF'
    })
    assetsList.push({
      tokenAmount: isReverse ? tokenAmountA : tokenAmountB,
      tokenValue: isReverse ? tokenAValue : tokenBValue,
      percent: isReverse ? percentA : percentB,
      token: displayTokenB,
      color: '#52FFD2'
    })
    return assetsList
  }, [positionBalance, apiVaultInfo?.isReverse])

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      <ModalOverlay />
      <ModalContent minWidth={{ base: '100%', lg: '600px' }} bg="bg_secondary" maxHeight="calc(100vh - 80px)" display="flex" flexDirection="column">
        <ModalHeader fontSize="16px" fontWeight="500" flexShrink={0}>
          Details
        </ModalHeader>
        <ModalCloseButton />
        <Box flexShrink={0} pt="0" pb="8px">
          <HStack
            pl="16px"
            pr="16px"
            w="100%"
            justifyContent="space-between"
            align={{ base: 'start', lg: 'center' }}
            flexDir={{ base: 'column', lg: 'row' }}
            gap={{ base: '4px', lg: '8px' }}
          >
            <PoolShowInfo
              type="row"
              poolType={positionBalance?.tag}
              showBottomPoolAddress={true}
              poolInfo={{
                displayTokenA: positionBalance?.displayTokenA,
                displayTokenB: positionBalance?.displayTokenB,
                feeDisplay: positionBalance?.feeDisplay,
                binStep: positionBalance?.bin_step,
                poolAddress: positionBalance?.certified_pool_id
              }}
              imgStyle={{
                w: '32px',
                h: '32px'
              }}
              showPoolTypeTag={true}
            />
            <VStack
              alignItems={{ base: 'start', lg: 'end' }}
              justify={{ base: 'space-between', lg: 'center' }}
              gap="0px"
              flexDir={{ base: 'row', lg: 'column' }}
              w={{ base: '100%', lg: 'auto' }}
            >
              <Text fontSize="12px" color="primary_gray" whiteSpace="nowrap" mt={{ base: '8px', lg: '0' }}>
                Vault Allocation
              </Text>
              <VStack alignItems="end" gap="0px">
                <Text mt="8px" color="text_caption" fontSize="16px" fontWeight="500">
                  {formatCurrency(positionBalance?.tokenValue, 2)}
                </Text>
                <Text mt="2px" borderRadius="4px" p="2px 4px" bg={positionBalance?.bgColor} color={positionBalance?.color} fontSize="12px">
                  {positionBalance?.realPercent ? symbolDataDisplayProcessing(positionBalance?.realPercent, '%') : ''}
                </Text>
              </VStack>
            </VStack>
          </HStack>
          <Box w="calc(100% - 32px)" h="1px" bg="border_secondary" mr="16px" ml="16px" mt="20px" />
        </Box>
        <ModalBody p="0 0 8px" overflowY="auto" flex="1" minH="0">
          <VStack w="100%" p="0px" gap={{ base: '0px', lg: '0px' }} align="flex-start">
            <Text ml="16px" mt="12px" fontSize="14px" color="text_caption">
              Position Assets Distribution
            </Text>

            <HStack w="100%" pl="16px" pr="16px" gap={{ base: '8px', lg: '20px' }} pb="12px" mt="12px" flexDir={{ base: 'column', lg: 'row' }}>
              {assetsList.map(item => {
                return (
                  <Block key={item.token?.coin_type} borderRadius="8px" border="0px solid" bg="bg_seven" p="12px">
                    <HStack w="100%" justifyContent="space-between">
                      <HStack gap="4px">
                        <SingleCoinImage imageUrl={item.token?.logo_url} w="16px" h="16px" />
                        <Text fontSize="12px" color="primary_gray">
                          {item.token?.symbol}
                        </Text>
                        <Text ml="4px" borderRadius="4px" p="2px 4px" bg="rgba(144,156,164,0.1)" color={item?.color} fontSize="12px">
                          {item?.percent ? symbolDataDisplayProcessing(item?.percent, '%') : ''}
                        </Text>
                      </HStack>
                      <VStack alignItems="end" gap="4px">
                        <Text fontSize="12px" color="text_caption">
                          {formatNumber(item?.tokenAmount)}
                        </Text>
                        <Text color="primary_gray" fontSize="12px">
                          {formatCurrency(item?.tokenValue, 2)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Block>
                )
              })}
            </HStack>

            <PriceRangeChartPageBlock
              isRefresh={chartRefresh}
              vaultsId={apiVaultInfo?.vaultId}
              posId={'all'}
              poolId={positionBalance?.certified_pool_id}
              isReverse={apiVaultInfo?.isReverse}
              category={apiVaultInfo?.category}
              tokenA={apiVaultInfo?.displayTokenA}
              tokenB={apiVaultInfo?.displayTokenB}
            />

            <Box w="calc(100% - 32px)" h="1px" bg="border_secondary" mx="16px" />

            <VaultsChartTvlAndApy
              apiVaultInfo={apiVaultInfo}
              chartRefresh={chartRefresh}
              category={category}
              positionId={positionBalance.positions?.[0]?.position_id}
              poolId={positionBalance?.certified_pool_id}
              currentVaultPool={currentVaultPool}
              vaultTvl={vaultTvl}
              blockStyle={{
                pt: '18px'
              }}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default VaultAllocationModal
