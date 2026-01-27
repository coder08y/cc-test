import SelectTokenAndFeeConfirm from '@/components/liquidity/common/SelectTokenAndFeeConfirm'
import CreateConfirmModal from '@/components/pools/createPool/CreateConfirmModal'
import CreateSuccessModal from '@/components/pools/createPool/CreateSuccessModal'
import Step from '@/components/pools/createPool/Step'
import DepositAmount from '@/components/pools/createPool/depositAmount'
import SetInitPrice from '@/components/pools/createPool/initPrice'
import useCreateCLMMPool from '@/hooks/create-pool/useCreateCLMMPool'
import useGlobalStore from '@/store/common/global'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { Icon, RefreshButton } from '@cetus/ui-kit'
import { Button, HStack, Stack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { cloneElement, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectToken from './selectToken'

type CreateCLMMPoolProps = {
  children: React.ReactNode
  isReverse: boolean
  handleSelectTokenChange: (token?: Token, isBaseToken?: boolean) => void
}

function CreateCLMMPool({ children, isReverse, handleSelectTokenChange }: CreateCLMMPoolProps) {
  const navigate = useNavigate()
  const { currentStep, setCurrentStep, editStep, setEditStep, quoteWhiteTokenList } = useCreatePoolStore()
  const {
    baseToken,
    quoteToken,
    feeTier,
    feeTierList,
    displayBaseToken,
    displayQuoteToken,
    handleSwitchDirectionChange,
    initPrice,
    handleInitPriceChange,
    isFullRange,
    handleRangeModeChange,
    handleTickPriceChange,
    handleFeeTierChange,
    handlePriceAction,
    baseAmount,
    quoteAmount,
    handleAmountChange,
    getConfirmData,
    handleCreateAction,
    percentMap,
    currTick,
    displayMinPrice,
    displayMaxPrice,
    handleStepClick,
    fetchFeeTierList,
    onOk,
    updateFeeTierList,
    isFetchingOptions
  } = useCreateCLMMPool(isReverse, handleSelectTokenChange)
  const { currentAccount, onWalletModal } = useAccountStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const { isOpen: isCreateSuccessOpen, onOpen: onCreateSuccessOpen, onClose: onCreateSuccessClose } = useDisclosure()
  const { fetchAccountBalance } = useAccountBalance()

  const [crateFeeDisplay, setCrateFeeDisplay] = useState<string | undefined>()
  const { setBackUrl } = useGlobalStore()
  const onConfirm = () => {
    if (baseToken && quoteToken && feeTier) {
      setBackUrl('/create-pool?poolType=clmm')
      navigate(`/clmm?tab=deposit&poolAddress=${feeTier?.poolAddress}`, { replace: true })
    }
  }

  const getCreateSuccessData = () => {
    return {
      baseToken: displayBaseToken!,
      quoteToken: displayQuoteToken!,
      feeDisplay: crateFeeDisplay
    }
  }

  const handleRefresh = useCallback(() => {
    updateFeeTierList?.()
    fetchAccountBalance()
  }, [updateFeeTierList])

  const { setFromCoin, setToCoin, fromCoin, toCoin } = useSwapWidgetStore()

  useEffect(() => {
    setFromCoin(baseToken)
    setToCoin(quoteToken)
    return () => {
      setFromCoin(envConfigs.clmm_swap.from_coin)
      setToCoin(envConfigs.clmm_swap.to_coin)
    }
  }, [baseToken, quoteToken])

  return (
    <VStack w="814px" align="flex-start" gap="20px" mt="20px">
      <HStack w="100%" justifyContent="space-between">
        <Button variant="outline" h="32px" onClick={() => navigate('/pools')} p="0 12px" borderRadius="8px" bg="background">
          <Icon xlinkHref="#icon-icon_descending" transform="rotate(90deg)" />
          <Text fontSize="12px">Back</Text>
        </Button>
        <RefreshButton handleRefresh={handleRefresh} w="32px" h="32px" borderRadius="8px" bg="background" innerStyle={{ bg: 'background' }} />
      </HStack>
      <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap="16px" align="flex-start">
        <Step currentStep={currentStep} totalStep={4} handleStepClick={handleStepClick} poolType="clmm" />
        <VStack w="100%" gap="16px">
          {cloneElement(children as any, { onEdit: () => handleStepClick(1), onContinue: () => handleStepClick(2) })}
          <SelectToken
            poolType="clmm"
            editStep={editStep}
            currentStep={currentStep}
            onEdit={() => {
              handleStepClick(2)
            }}
            onContinue={() => {
              if (feeTier) {
                if (feeTier.poolAddress) {
                  onOpen()
                } else {
                  handleStepClick(3)
                }
              }
            }}
            baseToken={baseToken}
            onBaseTokenChange={token => handleSelectTokenChange(token, true)}
            quoteToken={quoteToken}
            onQuoteTokenChange={token => handleSelectTokenChange(token, false)}
            feeTier={feeTier}
            feeTierList={feeTierList}
            quoteWhiteTokenList={quoteWhiteTokenList}
            onFeeTierChange={fee => handleFeeTierChange(fee)}
            isFetchingOptions={isFetchingOptions}
            fromSource="createPool"
          />
          <SetInitPrice
            poolType="clmm"
            editStep={editStep}
            currentStep={currentStep}
            onEdit={() => handleStepClick(3)}
            onContinue={() => {
              handleStepClick(4)
            }}
            displayBaseToken={displayBaseToken}
            displayQuoteToken={displayQuoteToken}
            initPrice={initPrice}
            currTick={currTick}
            isReverse={isReverse}
            onInitPriceChange={price => handleInitPriceChange(price)}
            handlePriceAction={handlePriceAction}
            displayMinPrice={displayMinPrice}
            onMinPriceChange={(data, inputData) => {
              handleTickPriceChange(data, inputData, true)
            }}
            displayMaxPrice={displayMaxPrice}
            onMaxPriceChange={(data, inputData) => {
              handleTickPriceChange(data, inputData, false)
            }}
            handleSwitchDirectionChange={handleSwitchDirectionChange}
            isFullRange={isFullRange}
            handleRangeModeChange={handleRangeModeChange}
          />
          <DepositAmount
            poolType="clmm"
            currentStep={currentStep}
            editStep={editStep}
            onCreate={() => {
              if (currentAccount) {
                onConfirmOpen()
              } else {
                onWalletModal(true)
              }
            }}
            percentMap={percentMap}
            baseToken={displayBaseToken}
            quoteToken={displayQuoteToken}
            baseAmount={baseAmount}
            quoteAmount={quoteAmount}
            onBaseAmountChange={amount => handleAmountChange(amount, true)}
            onQuoteAmountChange={amount => handleAmountChange(amount, false)}
            isReverse={isReverse}
          />
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
        <CreateConfirmModal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          onSubmit={async () => {
            onConfirmClose()
            const feeDisplay = await handleCreateAction()
            if (feeDisplay) {
              setCrateFeeDisplay(feeDisplay)
              onCreateSuccessOpen()
            }
          }}
          data={getConfirmData()}
        />
      )}

      {isCreateSuccessOpen && crateFeeDisplay && (
        <CreateSuccessModal
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

export default CreateCLMMPool
