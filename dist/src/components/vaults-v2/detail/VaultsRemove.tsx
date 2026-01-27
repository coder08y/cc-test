import RiskConfirm from '@/components/common/RiskConfirm'
import { PositionSlider } from '@/components/position/clmm/details/RemoveBlock'
import useVaultsButtonStatus from '@/hooks/vault-v2/useVaultsButtonStatus'
import { useCalculateSlippageAmount } from '@/hooks/vault-v2/useVaultsHelper'
import useVaultsRemove from '@/hooks/vault-v2/useVaultsRemove'
import useGlobalStore from '@/store/common/global'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { Block, TradeInputGroup } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { HTextLabelBox } from '@cetus/ui-kit'
import { d, formatCurrency, formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import { Box, Button, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef } from 'react'
import { SwitchAssetTab } from '../common/SwitchAssetTab'
import VaultsZapRoute from './VaultsZapRoute'
type VaultsRemoveProps = {
  category: string
  isReverse: boolean
  vaultId: string
  currentActionTab: string
  lpTokenInfo: Token
  isModal?: boolean
  isAutoRefresh?: boolean
  autoStakeBlockUI?: any
}
export default function VaultsRemove(props: VaultsRemoveProps) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { fromToken, toToken, calculateResult } = useVaultsActionStore()
  const { liquiditySlippage } = useGlobalStore()
  const { currentVaultPosition } = useVaultsPositionStore()
  const { assetAction, setAssetAction, isCheckedZAP, setIsCheckedZAP, vaultsZapProps } = useVaultsActionStore()
  const { category, isReverse, vaultId, currentActionTab, lpTokenInfo, isModal, isAutoRefresh, autoStakeBlockUI } = props
  const { vaultsFarmingStaked } = useVaultsFarmingStore()
  const currentVaultsFarmingStaked: any = useMemo(() => {
    return vaultsFarmingStaked[vaultId]
  }, [vaultsFarmingStaked, vaultId])
  const currentPosition = useMemo(() => {
    return currentVaultPosition
  }, [currentVaultPosition])
  const {
    amountInputA,
    amountInputB,
    amountValueA,
    amountValueB,
    calculateAvailableLoading,
    availableAmountA,
    availableAmountB,
    zapNumGtError,
    zapNumLtError,
    handleAmountInputChange,
    removePercent,
    handlePercentInputChange,
    doRemoveAction,
    showOnlySideTips,
    preCalculateLoading,
    inputTotalValue,
    setIsSlider,
    resetInputAmount,
    isSlider,
    fixAmountA,
    reCalculateResult,
    uuidRef,
    setUuid,
    setAmountInputA,
    setAmountInputB,
    knowsRisk,
    handleKnowsRisk,
    showRiskConfirm
  } = useVaultsRemove(vaultId, category, fromToken, toToken, isReverse, assetAction, isCheckedZAP, currentPosition, currentVaultsFarmingStaked)

  const { btnText, btnDisabled } = useVaultsButtonStatus(
    amountInputA,
    amountInputB,
    availableAmountA || '',
    availableAmountB || '',
    fromToken,
    toToken,
    assetAction,
    false,
    zapNumGtError,
    zapNumLtError,
    category,
    isCheckedZAP
  )

  // 最小可接收
  const { amountLimit } = useCalculateSlippageAmount(0, calculateResult?.burn_ft_amount, false)

  const LPBurnAmount = useMemo(() => {
    return formatNumber(fromDecimalsAmountFix(amountLimit || '0', lpTokenInfo?.decimals), lpTokenInfo?.decimals)
  }, [amountLimit, lpTokenInfo])

  useEffect(() => {
    resetInputAmount()
  }, [isCheckedZAP, assetAction])

  const showTokenALoading = useMemo(() => {
    if (preCalculateLoading) {
      if (isSlider) {
        return true
      }
      if (isReverse) {
        return fixAmountA
      }
      return !fixAmountA
    }
    return false
  }, [preCalculateLoading, isSlider])

  const showTokenBLoading = useMemo(() => {
    if (preCalculateLoading) {
      if (isSlider) {
        return true
      }
      if (isReverse) {
        return !fixAmountA
      }
      return fixAmountA
    }
    return false
  }, [preCalculateLoading, isSlider])

  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
  }, [])

  // useEffect(() => {
  //   if (isMounted.current) {
  //     reCalculateResult()
  //   }
  // }, [isAutoRefresh])

  useEffect(() => {
    return () => {
      uuidRef.current = ''
      setUuid('')
      setAmountInputA('')
      setAmountInputB('')
    }
  }, [])

  const { currentVaultPositionLoading } = useVaultsPositionStore()

  return (
    <VStack gap={{ base: '0px', lg: isModal ? '8px' : '12px' }} w="100%" align="flex-start">
      {/* <Block bg="bg_six" borderColor="border_secondary" borderRadius="12px" p={{ base: '16px 8px 8px', lg: '16px' }} w="100%"> */}
      <Block bg={isModal ? 'transparent' : 'none'} border="none" borderRadius="12px" p={{ base: '0', lg: isModal ? '0' : '0px' }} w="100%">
        <SwitchAssetTab
          label="Remove Amounts"
          displayTokenA={fromToken}
          displayTokenB={toToken}
          onSelectAssetTab={assetAction => {
            setAssetAction(assetAction)
          }}
          isCheckedZAP={isCheckedZAP}
          setIsCheckedZAP={setIsCheckedZAP}
          assetAction={assetAction}
          setAssetAction={setAssetAction}
          currentActionTab={currentActionTab}
          category={category}
        />
        <Box w="100%" position="relative" mt={isModal ? '8px' : '12px'}>
          <TradeInputGroup
            borderRadius="12px"
            from={{
              wrapStyle: {
                borderRadius: '16px',
                h: '111px',
                p: '20px 16px'
              },
              calculateAvailableLoading,
              hideSelf: assetAction !== 'both' && assetAction !== fromToken?.coin_type,
              balance: availableAmountA || '',
              value: amountInputA,
              amountValue: amountValueA && !showTokenALoading ? amountValueA : '',
              loading: showTokenALoading || currentVaultPositionLoading,
              onChange: (value: string, isClickMax?: boolean, isClickHalf?: boolean) => {
                if (currentAccount?.address && !calculateAvailableLoading) {
                  setIsSlider(false)
                  handleAmountInputChange(value, true, isClickMax, isClickHalf)
                }
              },
              needRemainBalance: false,
              selectable: false,
              placeholder: '0.0',
              token: fromToken,
              balanceLabel: 'Available'
            }}
            to={{
              wrapStyle: {
                borderRadius: '16px',
                h: '111px',
                p: '20px 16px'
              },
              balanceLabel: 'Available',
              calculateAvailableLoading,
              needRemainBalance: false,
              hideSelf: assetAction !== 'both' && assetAction !== toToken?.coin_type,
              balance: availableAmountB || '',
              value: amountInputB,
              amountValue: amountValueB && !showTokenBLoading ? amountValueB : '',
              loading: showTokenBLoading || currentVaultPositionLoading,
              onChange: (value: string, isClickMax?: boolean, isClickHalf?: boolean) => {
                if (currentAccount?.address && !calculateAvailableLoading) {
                  setIsSlider(false)
                  handleAmountInputChange(value, false, isClickMax, isClickHalf)
                }
              },
              selectable: false,
              placeholder: '0.0',
              token: toToken
            }}
            iconParams={{
              xlinkHref: '#icon-icon_add',
              svgFill: 'text_caption',
              iconCursor: 'default'
            }}
            iconHover={false}
          />
        </Box>
      </Block>
      {!isModal && (
        <Block bg="none" border="none" borderRadius="12px" p={{ base: '16px 0px', lg: '0px' }}>
          {/* <Text color="primary_gray" mb="10px">
            Amount
          </Text> */}
          <PositionSlider
            textFontSize="20px"
            sliderTrackHeight="8px"
            sliderBg="bg_secondary"
            percentage={removePercent}
            onChange={(value: string | number) => {
              if (!calculateAvailableLoading) {
                console.log('🚀🚀🚀 ~ VaultsRemove.tsx:213 ~ VaultsRemove ~ assetAction:', assetAction)
                console.log('🚀🚀🚀 ~ VaultsRemove.tsx:214 ~ VaultsRemove ~ fromToken.address:', fromToken.address)
                handlePercentInputChange(Number(value.toString().replace('%', '')), assetAction == 'both' ? true : assetAction == fromToken.coin_type)
              }
            }}
          />
        </Block>
      )}

      <VStack w="100%" gap="12px" mt={{ base: '12px', lg: '0px' }}>
        <Button
          m="-1px"
          isLoading={preCalculateLoading}
          w="100%"
          borderRadius={{ base: '8px', lg: '12px' }}
          h={{ base: '42px', lg: '52px' }}
          fontSize={{ base: '14px', lg: '18px' }}
          fontWeight="500"
          isDisabled={btnDisabled || preCalculateLoading || (showRiskConfirm && !knowsRisk)}
          onClick={() => {
            if (currentAccount) {
              doRemoveAction()
            } else {
              onWalletModal(true)
            }
          }}
        >
          {btnText || (isCheckedZAP ? 'Zap Out' : 'Withdraw')}
        </Button>
        {autoStakeBlockUI && autoStakeBlockUI}

        {zapNumGtError && (
          <VStack w="100%" alignItems="start">
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
              Single-asset withdraw can't be higher than $50,000 at a time.
            </Text>
          </VStack>
        )}

        {/* 展示计算结果 */}
        {calculateResult && !zapNumGtError && (amountInputA || amountInputB) && (
          <VStack w="100%" gap="0px" mt={assetAction !== 'both' && showOnlySideTips ? '0px' : '6px'}>
            {!isCheckedZAP && assetAction !== 'both' && showOnlySideTips && (
              <Text color="text_paragraph" width="100%" fontSize="12px" lineHeight="1.8" pb="20px">
                {showOnlySideTips}
              </Text>
            )}
            <VStack w="100%" gap="20px">
              {!isCheckedZAP && !vaultsZapProps && (
                <HTextLabelBox
                  label="Total Withdraw"
                  labelStyle={{
                    fontSize: '14px',
                    color: 'primary_gray'
                  }}
                  value={formatCurrency(inputTotalValue, 2)}
                  valueStyle={{
                    fontSize: '14px'
                  }}
                  skeletonStyle={{
                    valueH: '14px'
                  }}
                  isLoading={preCalculateLoading}
                />
              )}
              <HTextLabelBox
                label="LP Burn Amount"
                value={`${LPBurnAmount} ${`${fromToken?.symbol} - ${toToken?.symbol}`}`}
                labelStyle={{
                  fontSize: '14px',
                  color: 'primary_gray'
                }}
                valueStyle={{
                  fontSize: '14px'
                }}
                skeletonStyle={{
                  valueH: '14px'
                }}
                isLoading={preCalculateLoading}
              />
              {vaultsZapProps && (
                <VaultsZapRoute
                  warpStyle={{ p: '0px' }}
                  zapProgressRef={undefined}
                  zapProps={vaultsZapProps}
                  zapPreCalcLoading={preCalculateLoading}
                  reCalculateZapData={() => {
                    reCalculateResult()
                  }}
                >
                  {showRiskConfirm && !(btnDisabled || preCalculateLoading) && (
                    <RiskConfirm
                      checked={knowsRisk}
                      onChange={handleKnowsRisk}
                      slippage={d(liquiditySlippage).mul(100).toNumber()}
                      tipType={d(liquiditySlippage).gte(0.1) ? 'error' : 'warning'}
                    />
                  )}
                </VaultsZapRoute>
              )}
            </VStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}
