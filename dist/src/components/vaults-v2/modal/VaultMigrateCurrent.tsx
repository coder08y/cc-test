import { PoolShowInfo } from '@/components/common/CoinPairInfo'
import Slippage from '@/components/common/Slippage'
import { PositionSlider } from '@/components/position/details/RemoveBlock'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import { MigrateAmountResult, MigrateWithdrawResult } from '@/types/vaults-v2'
import { Block, CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, d, formatCurrency, formatCurrencyUSD, formatNumber, symbolDataDisplayProcessing } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import {
  Box,
  Center,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import VaultsChartTvlAndApy from '../detail/VaultsChartTvlAndApy'
import PriceRangeChartPageBlock from '../detail/chart/PriceRangeChartPageBlock'

type VaultMigrateCurrentProps = {
  currentVaultApiInfo: any
  currentVaultContractInfo: any
  removePercent: number
  preCalculateLoading: boolean
  handlePercentInputChange: (value: number) => void
  withdraw?: MigrateAmountResult
}
export function VaultMigrateCurrent(props: VaultMigrateCurrentProps) {
  const { currentVaultApiInfo, withdraw, removePercent, handlePercentInputChange, preCalculateLoading } = props
  const { lpTokenInfoObj } = useVaultsListV2Store()
  const estimatedRemoveValue = useMemo(() => {
    return d(withdraw?.amount_value_a || 0)
      .add(d(withdraw?.amount_value_b || 0))
      .toString()
  }, [withdraw?.amount_value_a, withdraw?.amount_value_b])

  return (
    <VStack w={{ base: '100%', lg: '382px' }} gap="12px" alignItems="start">
      <Text fontSize="14px" color="primary_gray">
        Current Vault
      </Text>
      <Block bg="rgba(180,216,240,0.06)" borderRadius="8px" p="16px" border="0px solid">
        <VStack w="100%" gap="12px" alignItems="start">
          <MigrateHeader
            version={currentVaultApiInfo?.version}
            category={currentVaultApiInfo?.category}
            tokenA={currentVaultApiInfo?.displayTokenA}
            tokenB={currentVaultApiInfo?.displayTokenB}
          />
          <Box mt="4px" w="100%" h="1px" bg="border" />
          <Text mt="4px" fontSize="12px" color="primary_gray">
            Withdraw Amount
          </Text>
          <PositionSlider
            textFontSize="20px"
            sliderTrackHeight="8px"
            sliderBg="bg_secondary"
            percentage={removePercent}
            onChange={(value: string | number) => {
              console.log('🚀🚀🚀 ~ VaultMigrateCurrent.tsx:47 ~ onChange ~ value:', value)
              handlePercentInputChange(Number(value.toString().replace('%', '')))
            }}
          />

          <Block borderRadius="8px" mt="4px" mb="4px" pl="12px" pr="12px" pt="12px" pb="12px" border="0px solid" bg="rgba(180,216,240,0.1)">
            <HStack w="100%" justifyContent="space-between">
              <Text fontSize="12px" color="primary_gray">
                Est. Remove
              </Text>
              <VStack gap="4px" alignItems="end">
                {preCalculateLoading ? (
                  <Skeleton w="50px" h="16px" />
                ) : (
                  <Text fontSize="12px" color="text_caption">
                    {formatCurrency(estimatedRemoveValue, 2)}
                  </Text>
                )}
                {preCalculateLoading ? (
                  <Skeleton w="100px" h="12px" />
                ) : (
                  <Text fontSize="12px" color="primary_gray">
                    {withdraw && +withdraw.ft_amount
                      ? addComma(fromDecimalsAmount(withdraw?.ft_amount || '0', lpTokenInfoObj[currentVaultApiInfo?.lpTokenType]?.decimals || 6))
                      : '0'}{' '}
                    {currentVaultApiInfo?.displayTokenA.symbol} - {currentVaultApiInfo?.displayTokenB.symbol}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Block>

          <VStack w="100%" gap="12px" flexDirection={currentVaultApiInfo?.isReverse ? 'column-reverse' : 'column'}>
            <WithdrawAmount
              token={currentVaultApiInfo?.tokenA}
              amount={withdraw?.amount_a_display || '0'}
              value={withdraw?.amount_value_a || '0'}
              preCalculateLoading={preCalculateLoading}
            />
            <WithdrawAmount
              token={currentVaultApiInfo?.tokenB}
              amount={withdraw?.amount_b_display || '0'}
              value={withdraw?.amount_value_b || '0'}
              preCalculateLoading={preCalculateLoading}
            />
          </VStack>
        </VStack>
      </Block>
    </VStack>
  )
}

type WithdrawAmountProps = {
  token: Token
  amount: string
  value: string
  preCalculateLoading: boolean
}
function WithdrawAmount(props: WithdrawAmountProps) {
  const { token, amount, value, preCalculateLoading } = props
  return (
    <HStack mt="2px" w="100%" justifyContent="space-between">
      <HStack gap="4px" justifyContent="center" alignItems="center">
        <SingleCoinImage imageUrl={token.logo_url} w="16px" h="16px" />
        <Text fontSize="12px" color="text_caption">
          {token.symbol}
        </Text>
      </HStack>
      <HStack gap="8px">
        {preCalculateLoading ? (
          <Skeleton w="50px" h="12px" />
        ) : (
          <Text fontSize="12px" color="text_caption">
            {addComma(amount)}
          </Text>
        )}
        {preCalculateLoading ? (
          <Skeleton w="30px" h="12px" />
        ) : (
          <Text fontSize="12px" color="primary_gray">
            ({formatCurrency(value, 2)})
          </Text>
        )}
      </HStack>
    </HStack>
  )
}

type MigrateHeaderProps = {
  tokenA: Token
  tokenB: Token
  category?: string
  version?: string
  handleJumpUrl?: () => void
}
export function MigrateHeader(props: MigrateHeaderProps) {
  const { tokenA, tokenB, handleJumpUrl, version, category } = props
  const { isApp } = useWindowWidth()

  return (
    <HStack gap="0px">
      <SingleCoinImage imageUrl={tokenA.logo_url} w="28px" h="28px" />
      <SingleCoinImage imageUrl={tokenB.logo_url} w="28px" h="28px" />
      <VStack ml="8px" gap="4px" alignItems="start">
        <HStack justifyContent="start">
          <Text fontSize="14px" color="text_caption">
            {tokenA.symbol}-{tokenB.symbol}
          </Text>
          {handleJumpUrl && <Icon xlinkHref="#icon-icon_link3" fontSize="16px" onClick={handleJumpUrl} />}
        </HStack>
        <Text fontSize="12px" color="primary_gray">
          {category === 'cetus' ? 'Cetus' : 'Haedal'} Liquidity Vault {version}
        </Text>
      </VStack>
    </HStack>
  )
}
