import RiskConfirm from '@/components/common/RiskConfirm'
import VaultsAddConfirmModel from '@/components/modal/VaultsAddConfirmModel'
import useVaultAvaiableCapacity from '@/hooks/vault-v2/useVaultAvaiableCapacity'
import useVaultsAdd from '@/hooks/vault-v2/useVaultsAdd'
import useVaultsButtonStatus from '@/hooks/vault-v2/useVaultsButtonStatus'
import { useCalculateChangeLpRate, useCalculateSlippageAmount } from '@/hooks/vault-v2/useVaultsHelper'
import useGlobalStore from '@/store/common/global'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsPoolStore from '@/store/vaults-v2/useVaultsPool'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import useVaultsPythPriceStore from '@/store/vaults-v2/useVaultsPythPrice'
import useVaultsRiskStore from '@/store/vaults-v2/useVaultsRisk'
import { VaultsAddModelData } from '@/types'
import { Block, TradeInputGroup } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { d, isAvailableObject } from '@cetus/utils'
import { Button, Text, VStack } from '@chakra-ui/react'
import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import { SwitchAssetTab } from '../common/SwitchAssetTab'
import RiskModal from '../risk-modal'
import AvailableCapacity from './AvailableCapacity'
import { VaultsAddResult } from './VaultsAddResult'
import VaultsZapRoute from './VaultsZapRoute'

type VaultsAddProps = {
  category: string
  isReverse: boolean
  vaultId: string
  currentActionTab: string
  totalSupply: string
  lpTokenInfo: any
  feeTier: string
  isModal?: boolean
  isAutoRefresh?: boolean
  currentVaultsFarm?: any
  vaultsFarmingStaked?: any
  binStep?: string
  autoStakeBlockUI?: any
  showPoolTag?: boolean
}

// Vault添加
export default function VaultsAdd(props: VaultsAddProps) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { assetAction, setAssetAction, isCheckedZAP, setIsCheckedZAP } = useVaultsActionStore()
  const { currentVaultPositionLoading } = useVaultsPositionStore()
  // const [assetAction, setAssetAction] = useState('both')
  // const [isCheckedZAP, setIsCheckedZAP] = useState(false)
  const {
    category,
    isReverse,
    vaultId,
    currentActionTab,
    totalSupply,
    lpTokenInfo,
    feeTier,
    isModal,
    isAutoRefresh,
    currentVaultsFarm,
    vaultsFarmingStaked,
    binStep,
    autoStakeBlockUI,
    showPoolTag
  } = props
  const { fromToken, toToken, calculateResult, vaultsZapProps } = useVaultsActionStore()
  const { vaultsPoolObj } = useVaultsPoolStore()

  const currentVaultPool = useMemo(() => {
    return vaultsPoolObj[vaultId as string]
  }, [vaultsPoolObj, vaultId])

  const avaiableCapacityInfo = useVaultAvaiableCapacity(currentVaultPool)
  const {
    balanceInfoA,
    balanceInfoB,
    amountValueA,
    amountValueB,
    handleAmountInputChange,
    amountInputA,
    amountInputB,
    resetInputAmount,
    preCalculateLoading,
    zapNumGtError,
    zapNumLtError,
    calculateLpLoading,
    inputTotalValue,
    showOnlySideTips,
    doAddAction,
    reCalculateResult,
    percentage,
    setPercentage,
    setIsSlider,
    preCalcError,
    handlePercentInputChange,
    isQuoteCoin,
    setUuid,
    uuidRef,
    isSlider,
    knowsRisk,
    handleKnowsRisk,
    showRiskConfirm
  } = useVaultsAdd(
    vaultId,
    category,
    fromToken,
    toToken,
    isReverse,
    assetAction,
    isCheckedZAP,
    avaiableCapacityInfo?.quoteCoin,
    avaiableCapacityInfo?.availableCapacityUSD,
    avaiableCapacityInfo?.availableCapacityWithQuoteCoin,
    currentVaultsFarm,
    vaultsFarmingStaked
  )

  // 切换ZAP或者资产类型，清空输入框
  useEffect(() => {
    resetInputAmount()
  }, [isCheckedZAP, assetAction, vaultId])

  const [isOpenAddModel, setIsOpenAddModel] = useState(false)

  const { isApp } = useWindowWidth()

  const { btnText, btnDisabled } = useVaultsButtonStatus(
    amountInputA,
    amountInputB,
    balanceInfoA?.balanceFormat || '',
    balanceInfoB?.balanceFormat || '',
    fromToken,
    toToken,
    assetAction,
    true,
    zapNumGtError,
    zapNumLtError,
    category,
    isCheckedZAP,
    preCalcError,
    preCalculateLoading
  )

  const { liquiditySlippage } = useGlobalStore()

  // 占比
  const { lpRate } = useCalculateChangeLpRate(calculateResult?.ft_amount, totalSupply)
  // 最小可接收
  const { amountLimit } = useCalculateSlippageAmount(Number(liquiditySlippage), calculateResult?.ft_amount, false)
  const [secondModelData, setSecondModelData] = useState<VaultsAddModelData | null>(null)

  const getSecondModelData = () => {
    const data: VaultsAddModelData = {
      feeTier: feeTier || '',
      displayTokenA: fromToken!,
      displayTokenB: toToken!,
      displayAmountA: amountInputA,
      displayAmountB: amountInputB,
      totalAmountValue: inputTotalValue,
      sharePool: lpRate,
      lpAmountLimit: amountLimit || '0',
      lpDecimals: lpTokenInfo?.decimals,
      category,
      binStep,
      isDlmm: currentVaultPool?.dlmmPoolAddress?.length > 0
    }

    return data
  }

  const { pythPriceMap } = useVaultsPythPriceStore()
  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
  }, [])

  // useEffect(() => {
  //   if (isMounted.current) {
  //     reCalculateResult()
  //   }
  // }, [isAutoRefresh])

  const { isCheckedDontRemindWalletObj } = useVaultsRiskStore()
  const [isOpenRiskModal, setIsOpenRiskModal] = useState(false)
  const isShowRiskModal = useMemo(() => {
    return !isCheckedDontRemindWalletObj[currentAccount?.address]
  }, [isCheckedDontRemindWalletObj, currentAccount?.address])

  useEffect(() => {
    return () => {
      uuidRef.current = ''
    }
  }, [])

  return (
    <VStack gap={isModal ? '12px' : '12px'} w="100%" align="flex-start">
      <Block bg={isModal ? 'transparent' : 'none'} border="none" borderRadius="12px" p={{ base: '0px 0px 0', lg: isModal ? '0' : '0px' }} w="100%">
        <SwitchAssetTab
          displayTokenA={fromToken}
          displayTokenB={toToken}
          onSelectAssetTab={assetAction => {
            setAssetAction(assetAction)
          }}
          setIsCheckedZAP={() => setIsCheckedZAP(!isCheckedZAP)}
          setAssetAction={setAssetAction}
          assetAction={assetAction}
          isCheckedZAP={isCheckedZAP}
          category={category}
          currentActionTab={currentActionTab}
          handleRefreshClick={() => {
            reCalculateResult()
          }}
        />

        <VStack mt={isModal ? '8px' : '12px'} position="relative">
          <TradeInputGroup
            from={{
              wrapStyle: {
                borderRadius: '16px',
                h: '111px',
                p: '20px 16px'
              },
              hideSelf: assetAction !== 'both' && assetAction !== fromToken?.coin_type,
              balance: balanceInfoA?.balanceFormat || '',
              value: amountInputA,
              amountValue: amountInputA && amountValueA,
              loading: currentVaultPositionLoading || !isAvailableObject(fromToken),
              onChange: value => {
                if (category !== 'cetus') {
                  setIsSlider(false)
                }
                handleAmountInputChange(value, true, amountInputB)
              },
              selectable: false,
              placeholder: '0.0',
              token: fromToken
            }}
            to={{
              wrapStyle: {
                borderRadius: '16px',
                h: '111px',
                p: '20px 16px'
              },
              hideSelf: assetAction !== 'both' && assetAction !== toToken?.coin_type,
              balance: balanceInfoB?.balanceFormat || '',
              value: amountInputB,
              amountValue: amountInputB && amountValueB,
              loading: currentVaultPositionLoading || !isAvailableObject(toToken),
              onChange: value => {
                if (category !== 'cetus') {
                  setIsSlider(false)
                }
                handleAmountInputChange(value, false, amountInputA)
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
        </VStack>
      </Block>
      {(category == 'haedal' || category == 'haevault_v2') && isAvailableObject(pythPriceMap) && avaiableCapacityInfo && (
        <Block bg="primary_opacity.10" border="none" borderRadius={{ base: '8px', lg: '16px' }} p={{ base: '12px', lg: '16px' }} key={vaultId}>
          <AvailableCapacity
            depositRatio={avaiableCapacityInfo.depositRatio || ''}
            percentage={percentage}
            hardCapUSD={avaiableCapacityInfo.hardCapUSD || ''}
            vaultTvl={avaiableCapacityInfo.vaultTvl || ''}
            availableCapacityUSD={avaiableCapacityInfo.availableCapacityUSD || ''}
            quoteCoin={avaiableCapacityInfo.quoteCoin}
            maxCapNum={avaiableCapacityInfo.hardCap || ''}
            availableCapacityWithQuoteCoin={avaiableCapacityInfo.availableCapacityWithQuoteCoin || ''}
            onChange={(value: string | number) => {
              setIsSlider(true)
              setPercentage(value as SetStateAction<number>)
              const uuid = v4()
              setUuid(uuid)
              handlePercentInputChange(
                value as number,
                isQuoteCoin
                  ? (avaiableCapacityInfo?.availableCapacityWithQuoteCoin as string)
                  : (avaiableCapacityInfo?.availableCapacityWithBaseCoin as string),
                isQuoteCoin ? avaiableCapacityInfo.quoteCoin : avaiableCapacityInfo.baseCoin,
                uuid
              )
            }}
          />
        </Block>
      )}

      <VStack w="100%" gap={{ base: '12px', lg: '16px' }}>
        <Button
          m="-1px"
          isLoading={calculateLpLoading || isOpenAddModel}
          w="100%"
          borderRadius={{ base: '8px', lg: '12px' }}
          h={{ base: '42px', lg: '52px' }}
          fontSize={{ base: '14px', lg: '18px' }}
          fontWeight="500"
          isDisabled={btnDisabled || isOpenAddModel || calculateLpLoading || (showRiskConfirm && !knowsRisk)}
          onClick={() => {
            if (currentAccount) {
              if (isShowRiskModal && category !== 'cetus') {
                setIsOpenRiskModal(true)
              } else {
                setIsOpenAddModel(true)
                setSecondModelData(getSecondModelData())
              }
            } else {
              onWalletModal(true)
            }
          }}
        >
          {btnText || (isCheckedZAP ? 'Zap In' : 'Deposit')}
        </Button>
        {autoStakeBlockUI && autoStakeBlockUI}

        {/* {preCalcError && !preCalculateLoading && category == 'haevault_v2' && (
          <ErrorTips tips={'Amount too small to allocate across bins. Please increase the amount.'} type="warning" />
        )} */}

        {zapNumGtError && (amountInputA || amountInputB) && (
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
              Single-asset deposit can't be higher than $50,000 at a time.
            </Text>
          </VStack>
        )}

        {zapNumLtError && (amountInputA || amountInputB) && (
          <VStack w="100%" alignItems="start">
            <Text
              color="primary_red"
              fontSize="12px"
              textAlign="left"
              w="100%"
              bg="primary_red_opacity.10"
              p="12px"
              borderRadius="8px"
              lineHeight="20px"
            >
              The input is too small. Zap mode is not available.
            </Text>
          </VStack>
        )}

        {/* 展示计算结果 */}
        {(calculateResult || showOnlySideTips) && (amountInputA || amountInputB) && (
          <VStack w="100%" alignItems="start" gap="0" mb={isModal ? '12px' : '0px'}>
            {/* {assetAction !== 'both' && showOnlySideTips && (
              <Text color="text_paragraph" fontSize="12px" lineHeight="1.8" pb={calculateResult ? '20px' : '0'}>
                {showOnlySideTips}
              </Text>
            )} */}
            {calculateResult && amountLimit && Number(amountLimit) > 0 && (
              <VaultsAddResult
                amountLimit={amountLimit}
                inputTotalValue={inputTotalValue}
                preCalculateLoading={preCalculateLoading}
                calculateLpLoading={calculateLpLoading}
                lpRate={lpRate}
                showTotalAmount={!vaultsZapProps}
                lpDecimals={lpTokenInfo?.decimals}
                poolName={`${fromToken?.symbol} - ${toToken?.symbol}`}
                labelColor="primary_gray"
              />
            )}
            {vaultsZapProps && (
              <VaultsZapRoute
                warpStyle={{ pb: '0px' }}
                zapProgressRef={undefined}
                zapProps={vaultsZapProps}
                zapPreCalcLoading={preCalculateLoading}
                reCalculateZapData={() => {
                  reCalculateResult()
                }}
              >
                {showRiskConfirm && !(btnDisabled || isOpenAddModel || calculateLpLoading) && (
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
        )}
      </VStack>
      {isOpenRiskModal && (
        <RiskModal
          isOpen={isOpenRiskModal}
          setIsOpen={setIsOpenRiskModal}
          continueFunc={() => {
            setIsOpenRiskModal(false)
            setSecondModelData(getSecondModelData())
            setIsOpenAddModel(true)
          }}
        />
      )}
      {isOpenAddModel && secondModelData && (
        <VaultsAddConfirmModel
          showPoolTag={showPoolTag}
          data={secondModelData}
          isOpen={isOpenAddModel}
          onClose={() => {
            setIsOpenAddModel(false)
          }}
          vaultsZapProps={vaultsZapProps}
          calculateLpLoading={preCalculateLoading}
          reCalculateZapData={() => {
            reCalculateResult()
          }}
          onSubmitClick={() => {
            setIsOpenAddModel(false)
            doAddAction()
          }}
        />
      )}
    </VStack>
  )
}
