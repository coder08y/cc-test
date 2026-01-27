import RiskConfirm from '@/components/common/RiskConfirm'
import useCalculateVaultFarmingApr from '@/hooks/vaults-farming/useCalculateVaultFarmingApr'
import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import useGlobalStore from '@/store/common/global'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import { MigrateAmountResult, MigrateSwapResult } from '@/types/vaults-v2'
import { Block, CetusTooltip, TooltipIcon } from '@cetus/design'
import { Token } from '@cetus/types'
import { addComma, d, formatCurrency, formatCurrencyUSD, formatNumber, symbolDataDisplayProcessing } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Box, Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import VaultsMigrateRoute from '../detail/VaultsMigrateRoute'
import { RewardItem } from '../farming/FarmingIncentives'
import { MigrateHeader } from './VaultMigrateCurrent'

type VaultMigrateTargetProps = {
  currentVaultApiInfo: any
  currentVaultContractInfo: any
  deposit?: MigrateAmountResult
  swap_results?: MigrateSwapResult[]
  preCalculateLoading: boolean
  migrateSubmitLoading: boolean
  vaultFarmingRewardAmountUSD: string
  vaultsFarmingRewards: any[]
  isVaultsFarming: boolean
  isSameTokenPair: boolean
  handleJumpUrl?: () => void
  preCalculateMigrate: () => void
  handleMigrate: () => void
}
export function VaultMigrateTarget(props: VaultMigrateTargetProps) {
  const {
    currentVaultApiInfo,
    deposit,
    swap_results = [],
    preCalculateLoading,
    handleJumpUrl,
    preCalculateMigrate,
    handleMigrate,
    isSameTokenPair,
    migrateSubmitLoading,
    vaultFarmingRewardAmountUSD,
    vaultsFarmingRewards,
    isVaultsFarming
  } = props
  const { liquiditySlippage } = useGlobalStore()

  const { lpTokenInfoObj } = useVaultsListV2Store()

  const { currentVaultsFarm } = useCurrentVaultsFarm(currentVaultApiInfo?.vaultId)
  const { vaultFarmingAprDisplay } = useCalculateVaultFarmingApr(currentVaultsFarm)

  console.log('🚀🚀🚀 ~ VaultMigrateTarget ~ swap_results:', {
    currentVaultsFarm,
    vaultFarmingAprDisplay
  })

  const estimatedDepositValue = useMemo(() => {
    return d(deposit?.amount_value_a || 0)
      .add(d(deposit?.amount_value_b || 0))
      .toString()
  }, [deposit?.amount_value_a, deposit?.amount_value_b])

  const migrateAmountGtError = useMemo(() => {
    return !isSameTokenPair && d(estimatedDepositValue).gt(d(50000))
  }, [estimatedDepositValue, isSameTokenPair])

  const showRiskConfirm = useMemo(() => {
    if (!deposit) return false

    return d(estimatedDepositValue || 0).gte(import.meta.env.VITE_LIMIT_RISK_AMOUNT) && d(liquiditySlippage).gt(0.02)
  }, [liquiditySlippage, estimatedDepositValue])

  const [knowsRisk, setKnowsRisk] = useState<boolean>(false)

  const minLtAmount = useMemo(() => {
    const decimals = lpTokenInfoObj[currentVaultApiInfo?.lpTokenType]?.decimals || 6
    return fromDecimalsAmount(
      d(deposit?.ft_amount || 0)
        .mul(1 - Number(liquiditySlippage))
        .toFixed(decimals),
      decimals
    )
  }, [deposit?.ft_amount, currentVaultApiInfo?.lpTokenType, lpTokenInfoObj, liquiditySlippage])

  const handleKnowsRisk = (value: boolean) => {
    setKnowsRisk(value)
  }

  const btnDisabled = useMemo(() => {
    return preCalculateLoading || migrateSubmitLoading || !deposit || migrateAmountGtError
  }, [preCalculateLoading, migrateSubmitLoading, deposit, migrateAmountGtError])

  const displayApy = useMemo(() => {
    if (currentVaultApiInfo?.category == 'cetus') {
      return currentVaultApiInfo?.vaultsTotalApyDisplay ? currentVaultApiInfo?.vaultsTotalApyDisplay : '-'
    } else {
      return currentVaultApiInfo?.vaultsApyDisplay ? currentVaultApiInfo?.vaultsApyDisplay : '-'
    }
  }, [currentVaultApiInfo])

  return (
    <VStack w={{ base: '100%', lg: '382px' }} gap="12px" alignItems="start">
      <Text fontSize="14px" color="primary_gray">
        Target Vault
      </Text>
      <Block bg="rgba(180,216,240,0.06)" borderRadius="8px" p="16px" border="0px solid">
        <VStack w="100%" gap="12px" alignItems="start">
          <HStack w="100%" justifyContent="space-between">
            <MigrateHeader
              version={currentVaultApiInfo?.version}
              category={currentVaultApiInfo?.category}
              tokenA={currentVaultApiInfo?.displayTokenA}
              tokenB={currentVaultApiInfo?.displayTokenB}
              handleJumpUrl={handleJumpUrl}
            />
            <VStack gap="2px" alignItems="end">
              <Text fontSize="12px" color="primary_gray">
                Est. APY
              </Text>
              <HStack gap="2px">
                <Text fontSize="14px" color="text_highlight">
                  {displayApy}
                </Text>
                {vaultFarmingAprDisplay && (
                  <Text p="2px 4px" fontSize="12px" color="#FFB200" borderRadius="4px" background="rgba(252, 176, 0, 0.1)">
                    {vaultFarmingAprDisplay}
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>
          <Box mt="4px" w="100%" h="1px" bg="border" />

          <VStack gap="4px" mt="8px" w="100%">
            {preCalculateLoading ? (
              <Skeleton w="100px" h="20px" />
            ) : (
              <Text fontSize="20px" color="text_caption">
                {formatCurrency(estimatedDepositValue, 2)}
              </Text>
            )}
            <Text fontSize="12px" color="primary_gray">
              Migrate Amount
            </Text>
          </VStack>
          <Block borderRadius="8px" mt="8px" pl="8px" pr="8px" pt="12px" pb="12px" border="0px solid" bg="rgba(180,216,240,0.1)">
            <HStack w="100%" justifyContent="space-between">
              <Text fontSize="12px" color="primary_gray">
                Est. Receive LP
              </Text>
              <VStack gap="4px" alignItems="end">
                {preCalculateLoading ? (
                  <Skeleton w="50px" h="12px" />
                ) : (
                  <Text fontSize="12px" color="text_caption">
                    {formatCurrency(estimatedDepositValue, 2)}
                  </Text>
                )}
                {preCalculateLoading ? (
                  <Skeleton w="100px" h="12px" />
                ) : (
                  <Text fontSize="12px" color="primary_gray">
                    {deposit && +deposit.ft_amount ? addComma(minLtAmount) : '0'} {currentVaultApiInfo?.displayTokenA.symbol} -{' '}
                    {currentVaultApiInfo?.displayTokenB.symbol}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Block>

          {vaultsFarmingRewards && isVaultsFarming && (
            <Block borderRadius="8px" mt="-4px" pl="8px" pr="8px" pt="12px" pb="12px" border="0px solid" bg="rgba(180,216,240,0.1)">
              <HStack w="100%" justifyContent="space-between">
                <HStack gap="4px">
                  <Text fontSize="12px" color="primary_gray">
                    Auto Claim
                  </Text>
                  <TooltipIcon
                    showTooltipIcon={true}
                    tooltipCon="Pending rewards that'll be automatically claimed to your wallet during the migration."
                  />
                </HStack>
                {preCalculateLoading ? (
                  <Skeleton w="50px" h="12px" />
                ) : (
                  <CetusTooltip
                    tooltip={
                      <VStack>
                        {vaultsFarmingRewards?.map(rewardInfo =>
                          !Number(rewardInfo?.rate) && !Number(rewardInfo?.rewardAmount) ? (
                            <></>
                          ) : (
                            <RewardItem key={rewardInfo.rewardCoinType} rewardInfo={rewardInfo} />
                          )
                        )}
                      </VStack>
                    }
                  >
                    <Text textDecoration="underline dotted" textDecorationColor="text_paragraph" fontSize="12px" color="text_caption">
                      {symbolDataDisplayProcessing(vaultFarmingRewardAmountUSD)}
                    </Text>
                  </CetusTooltip>
                )}
              </HStack>
            </Block>
          )}

          <Button
            isLoading={preCalculateLoading || migrateSubmitLoading}
            isDisabled={migrateSubmitLoading || preCalculateLoading || !deposit || migrateAmountGtError}
            w="100%"
            borderRadius="12px"
            h="48px"
            fontSize="18px"
            fontWeight="500"
            onClick={handleMigrate}
          >
            Migrate
          </Button>

          {migrateAmountGtError && (
            <VStack w="100%" alignItems="start" gap="20px">
              <Text
                color="primary_yellow"
                fontSize="12px"
                textAlign="left"
                w="100%"
                bg="primary_yellow_opacity.10"
                p="12px"
                borderRadius="8px"
                lineHeight="20px"
              >
                The maximum amount per migration transaction cannot exceed $50,000.
              </Text>
            </VStack>
          )}

          {deposit && swap_results.length > 0 && (
            <VaultsMigrateRoute
              warpStyle={{ p: '0px' }}
              migrateRouteProps={{
                coinA: currentVaultApiInfo?.tokenA,
                coinB: currentVaultApiInfo?.tokenB,
                isReverse: currentVaultApiInfo?.isReverse,
                category: currentVaultApiInfo?.category,
                swap_results,
                deposit
              }}
              migratePreCalcLoading={preCalculateLoading}
              reCalculateZapData={() => {
                preCalculateMigrate()
              }}
              zapProgressRef={undefined}
            >
              {showRiskConfirm && !btnDisabled && (
                <RiskConfirm
                  checked={knowsRisk}
                  onChange={handleKnowsRisk}
                  slippage={d(liquiditySlippage).mul(100).toNumber()}
                  tipType={d(liquiditySlippage).gte(0.1) ? 'error' : 'warning'}
                />
              )}
            </VaultsMigrateRoute>
          )}
        </VStack>
      </Block>
    </VStack>
  )
}
