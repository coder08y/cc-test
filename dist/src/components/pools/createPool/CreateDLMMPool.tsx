import SelectTokenAndFeeConfirm from '@/components/liquidity/common/SelectTokenAndFeeConfirm'
import Step from '@/components/pools/createPool/Step'
import SetInitPrice from '@/components/pools/createPool/initPrice'
import useCreateDLMMPool from '@/hooks/create-pool/useCreateDLMMPool'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { Icon, RefreshButton } from '@cetus/ui-kit'
import { Button, HStack, Stack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { cloneElement, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import { useSdk } from '@cetus/sdk-factory'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import CreateDlmmConfirmModal from './CreateDlmmConfirmModal'
import CreateDlmmSuccessModal from './CreateDlmmSuccessModal'
import SelectToken from './selectToken'

type CreateDLMMPoolProps = {
  children: React.ReactNode
  isReverse: boolean
  handleSelectTokenChange: (token?: Token, isBaseToken?: boolean) => void
}

function CreateDLMMPool({ children, isReverse, handleSelectTokenChange }: CreateDLMMPoolProps) {
  const navigate = useNavigate()
  const { currentStep, setCurrentStep, editStep, setEditStep, quoteWhiteTokenList } = useCreatePoolStore()
  const {
    baseToken,
    quoteToken,
    binStep,
    setBinStep,
    displayBaseToken,
    displayQuoteToken,
    initPrice,
    baseAmount,
    quoteAmount,
    handleAmountChange,
    getConfirmData,
    handleCreateAction,
    strategy,
    setStrategy,
    fixAmountA,
    setFixAmountA,
    isAutoFill,
    setIsAutoFill,
    handleStepClick,
    handleBinStepChange,
    handleInitPriceChange,
    handlePriceAction,
    minPriceData,
    maxPriceData,
    onPriceChange,
    onOk,
    updateBinStep,
    baseFee,
    binStepList,
    handleBaseFeeChange,
    getBinStepListLoading
  } = useCreateDLMMPool(isReverse, handleSelectTokenChange)
  const { currentAccount, onWalletModal } = useAccountStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const { isOpen: isCreateSuccessOpen, onOpen: onCreateSuccessOpen, onClose: onCreateSuccessClose } = useDisclosure()
  const { fetchAccountBalance } = useAccountBalance()
  const dlmmSdk = useSdk('dlmm')
  const [createBinStep, setCreateBinStep] = useState<typeof binStep | undefined>()

  const onConfirm = () => {
    if (baseToken && quoteToken && binStep) {
      navigate(`/dlmm?tab=deposit&poolId=${binStep?.poolAddress}`, { replace: true })
    }
  }

  const getCreateSuccessData = () => {
    return {
      baseToken: baseToken!,
      quoteToken: quoteToken!,
      binStep: createBinStep
    }
  }

  const handleRefresh = useCallback(() => {
    updateBinStep?.()
    fetchAccountBalance()
  }, [updateBinStep])

  const { setFromCoin, setToCoin, fromCoin, toCoin } = useSwapWidgetStore()

  useEffect(() => {
    setFromCoin(baseToken)
    setToCoin(quoteToken)
    return () => {
      setFromCoin(envConfigs.clmm_swap.from_coin)
      setToCoin(envConfigs.clmm_swap.to_coin)
    }
  }, [baseToken, quoteToken])

  const handleTokenChange = (token?: Token, isBaseToken?: boolean) => {
    handleSelectTokenChange(token, isBaseToken)
    handleBaseFeeChange(undefined)
  }

  return (
    <VStack w="814px" align="flex-start" gap="20px" mt="20px">
      <HStack w="100%" justifyContent="space-between">
        <Button variant="outline" h="32px" onClick={() => navigate('/pools?tab=dlmm_pools')} p="0 12px" borderRadius="8px" bg="background">
          <Icon xlinkHref="#icon-icon_descending" transform="rotate(90deg)" />
          <Text fontSize="12px">Back</Text>
        </Button>
        <RefreshButton handleRefresh={handleRefresh} w="32px" h="32px" borderRadius="8px" bg="background" innerStyle={{ bg: 'background' }} />
      </HStack>
      <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap="16px" align="flex-start">
        <Step currentStep={currentStep} handleStepClick={handleStepClick} totalStep={3} poolType="dlmm" />
        <VStack w="100%" gap="16px">
          {cloneElement(children as any, {
            onEdit: () => handleStepClick(1),
            onContinue: () => handleStepClick(2)
          })}
          <SelectToken
            poolType="dlmm"
            editStep={editStep}
            currentStep={currentStep}
            onEdit={() => {
              handleStepClick(2)
            }}
            onContinue={() => {
              if (binStep) {
                if (binStep?.poolAddress) {
                  onOpen()
                } else {
                  handleStepClick(3)
                }
              }
            }}
            baseToken={baseToken}
            onBaseTokenChange={token => handleTokenChange(token, true)}
            quoteToken={quoteToken}
            onQuoteTokenChange={token => handleTokenChange(token, false)}
            baseFee={baseFee}
            binStep={binStep}
            binStepList={binStepList}
            getBinStepListLoading={getBinStepListLoading}
            quoteWhiteTokenList={quoteWhiteTokenList}
            onBaseFeeChange={value => handleBaseFeeChange(value)}
            onBinStepChange={value => handleBinStepChange(value, baseToken?.coin_type, quoteToken?.coin_type)}
            fromSource="createPool"
            disabled={getBinStepListLoading}
          />
          <SetInitPrice
            poolType="dlmm"
            editStep={editStep}
            currentStep={currentStep}
            onEdit={() => handleStepClick(3)}
            onContinue={async () => {
              if (binStep) {
                if (binStep?.poolAddress) {
                  onOpen()
                } else {
                  if (baseToken?.coin_type && quoteToken?.coin_type) {
                    try {
                      const address = await dlmmSdk?.Pool?.getPoolAddress(
                        fixCoinType(baseToken?.coin_type, true),
                        fixCoinType(quoteToken?.coin_type, true),
                        binStep?.binStep,
                        binStep?.baseFactor
                      )

                      if (address) {
                        setBinStep({ ...binStep, poolAddress: address })
                        onOpen()
                      } else {
                        if (currentAccount) {
                          onConfirmOpen()
                        } else {
                          onWalletModal(true)
                        }
                      }
                    } catch (error) {
                      if (currentAccount) {
                        onConfirmOpen()
                      } else {
                        onWalletModal(true)
                      }
                    }
                  }
                }
              }
            }}
            baseToken={displayBaseToken}
            quoteToken={displayQuoteToken}
            initPrice={initPrice}
            onInitPriceChange={handleInitPriceChange}
          />
          {/* <DepositAmount
            poolType="dlmm"
            currentStep={currentStep}
            editStep={editStep}
            onCreate={() => {
              if (currentAccount) {
                onConfirmOpen()
              } else {
                onWalletModal(true)
              }
            }}
            strategy={strategy}
            setStrategy={setStrategy}
            fixAmountA={fixAmountA}
            setFixAmountA={setFixAmountA}
            isAutoFill={isAutoFill}
            setIsAutoFill={setIsAutoFill}
            binStep={binStep}
            initPrice={initPrice}
            baseToken={baseToken}
            quoteToken={quoteToken}
            baseAmount={baseAmount}
            quoteAmount={quoteAmount}
            onBaseAmountChange={amount => handleAmountChange(amount, true)}
            onQuoteAmountChange={amount => handleAmountChange(amount, false)}
            isReverse={isReverse}
            onPriceChange={onPriceChange}
            handlePriceAction={handlePriceAction}
            minPriceData={minPriceData!}
            maxPriceData={maxPriceData!}
          /> */}
        </VStack>
      </Stack>

      {isOpen && (
        <SelectTokenAndFeeConfirm
          title="This Pool already exists"
          subTitle="Do you want to provide liquidity?"
          btnText="Add liquidity"
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}

      {isConfirmOpen && (
        <CreateDlmmConfirmModal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          onSubmit={async () => {
            onConfirmClose()
            const _binStep = await handleCreateAction()
            if (_binStep) {
              setCreateBinStep(_binStep)
              onCreateSuccessOpen()
            }
          }}
        />
      )}

      {isCreateSuccessOpen && createBinStep && (
        <CreateDlmmSuccessModal<typeof binStep>
          isOpen={isCreateSuccessOpen}
          onClose={() => {
            onOk()
            onCreateSuccessClose()
          }}
          data={getCreateSuccessData()}
        />
      )}
    </VStack>
  )
}

export default CreateDLMMPool
