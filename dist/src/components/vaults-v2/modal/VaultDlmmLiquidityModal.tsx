import CurrentLiquidityChart from '@/components/chart/dlmmChart/CurrentLiquidityChart'
import { PoolShowInfo } from '@/components/common/CoinPairInfo'
import FunnelPrice from '@/components/common/FunnelPrice'
import ActionButton from '@/components/liquidity/common/ActionButton'
import { Legend } from '@/components/pools/createPool/depositAmount/DLMMDepositAmount'
import { getCombineBins } from '@/hooks/dlmm-position/useDlmmPosChart'
import useDlmmGetAllBinWithPool from '@/hooks/dlmm/useDlmmGetAllBinWithPool'
import useDlmmPoolLiquidityDistribution from '@/hooks/dlmm/useDlmmPoolLiquidityDistribution'
import useGetPythTokenPrice from '@/hooks/vault-v2/pyth-price/useGetPythTokenPrice'
import { ChartBinItem, MaxBinRangeChartData } from '@/types/dlmm'
import { getMaxBinRangeData } from '@/utils/dlmm'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { SingleCoinImage } from '@cetus/ui-kit'
import { d, formatCurrency, formatCurrencyUSD, formatNumber, formatPrice, isEmptyObj, symbolDataDisplayProcessing, textEllipses } from '@cetus/utils'
import { BinLiquidityInfo } from '@cetusprotocol/dlmm-sdk'
import {
  Box,
  Center,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useState } from 'react'
import VaultsChartTvlAndApy from '../detail/VaultsChartTvlAndApy'
import PriceRangeChartPageBlock from '../detail/chart/PriceRangeChartPageBlock'

type VaultAllocationProps = {
  isOpen: boolean
  apiVaultInfo?: any
  dlmmPoolInfo?: any
  bin_infos: BinLiquidityInfo
  onClose: () => void
}
function VaultDlmmLiquidityModal(props: VaultAllocationProps) {
  const { isOpen, apiVaultInfo, onClose, dlmmPoolInfo, bin_infos } = props
  const [maxBinsLength, setMaxBinsLength] = useState(251)
  const [loading, setLoading] = useState(false)
  const [maxBinRangeData, setMaxBinRangeData] = useState<MaxBinRangeChartData>()
  const { getTokenPriceByPyth } = useGetPythTokenPrice()

  const { windowWidth, isApp } = useWindowWidth()

  useEffect(() => {
    if (apiVaultInfo && dlmmPoolInfo) {
      setLoading(true)
      const res = getCombineBins(
        bin_infos.bins,
        [],
        apiVaultInfo?.tokenA,
        apiVaultInfo?.tokenB,
        'increase',
        dlmmPoolInfo?.bin_step,
        dlmmPoolInfo?.active_id,
        apiVaultInfo?.isReverse,
        true
      )
      setMaxBinRangeData(res)
      setLoading(false)
    }
  }, [apiVaultInfo?.id, dlmmPoolInfo?.active_id, bin_infos])

  const width = useMemo(() => {
    if (windowWidth < 810) {
      return windowWidth - 60
    }
    return 1118
  }, [windowWidth])

  const activeBin = useMemo(() => {
    return dlmmPoolInfo?.active_id
  }, [dlmmPoolInfo?.active_id])

  const allBinsLength = useMemo(() => {
    return maxBinRangeData?.list?.length || 0
  }, [maxBinRangeData?.list?.length])

  const handleAdd = () => {
    if (maxBinsLength <= 19) return
    const newLength = Math.max(Math.min(maxBinsLength, allBinsLength) - 8, 19)
    setMaxBinsLength(newLength)
  }

  const handleSub = () => {
    if (maxBinsLength >= allBinsLength) return
    const newLength = Math.min(maxBinsLength + 8, allBinsLength)
    setMaxBinsLength(newLength)
    setMaxBinsLength(pre => pre + 8)
  }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      <ModalOverlay />
      <ModalContent minWidth={{ base: '100%', lg: '90%' }} bg="bg_secondary" display="flex" flexDirection="column">
        <ModalHeader fontSize="16px" fontWeight="500" flexShrink={0}>
          Liquidity Distribution
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p="0 0 8px" overflowX="auto" flex="1" minH="0">
          <VStack w="100%" gap={{ base: '20px', lg: '40px' }} p={{ base: '8px', lg: '20px' }} borderRadius="16px">
            <VStack gap="20px" w="100%">
              {isApp ? (
                <>
                  <HStack w="100%" justify="space-between" />
                  <HStack gap="16px">
                    <Legend symbol={textEllipses(apiVaultInfo?.displayTokenA?.symbol || '', 8)} color="dlmm_blue" />
                    <Legend symbol={textEllipses(apiVaultInfo?.displayTokenB?.symbol || '', 8)} color="dlmm_green" />
                  </HStack>
                  <FunnelPrice
                    price={formatPrice(maxBinRangeData?.active?.price)}
                    perText={`${apiVaultInfo?.displayTokenB?.symbol}/${apiVaultInfo?.displayTokenA?.symbol}`}
                  />
                </>
              ) : (
                <HStack w="100%" justify="space-between">
                  <HStack gap="40px">
                    <HStack gap="16px">
                      <FunnelPrice
                        price={formatPrice(maxBinRangeData?.active?.price)}
                        perText={`${apiVaultInfo?.displayTokenB?.symbol}/${apiVaultInfo?.displayTokenA?.symbol}`}
                      />
                      <Legend symbol={textEllipses(apiVaultInfo?.displayTokenA?.symbol || '', 8)} color="dlmm_blue" />
                      <Legend symbol={textEllipses(apiVaultInfo?.displayTokenB?.symbol || '', 8)} color="dlmm_green" />
                    </HStack>
                  </HStack>
                </HStack>
              )}

              {activeBin !== undefined &&
                (loading && maxBinRangeData === undefined ? (
                  <Center h="160px">
                    <Spinner />
                  </Center>
                ) : (
                  <CurrentLiquidityChart
                    type="simulation"
                    data={maxBinRangeData}
                    activeBin={Number(activeBin)}
                    width={width}
                    height={160}
                    fromPosition={true}
                    noDataText="No Liquidity Data"
                    isReverse={apiVaultInfo?.isReverse || false}
                    tokenAPrice={getTokenPriceByPyth(apiVaultInfo?.tokenA?.coin_type)}
                    tokenBPrice={getTokenPriceByPyth(apiVaultInfo?.tokenB?.coin_type)}
                  />
                ))}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default VaultDlmmLiquidityModal
