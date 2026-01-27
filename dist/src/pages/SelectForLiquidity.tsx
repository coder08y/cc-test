import SelectTokenAndFeeConfirm from '@/components/liquidity/common/SelectTokenAndFeeConfirm'
import SelectPoolType from '@/components/pools/createPool/SelectPoolType'
import SelectPool from '@/components/selectPool'
import useSelectPool from '@/hooks/create-pool/useSelectPool'
import { Token } from '@cetus/types'
import { BackButton } from '@cetus/ui-kit'
import { VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
function SelectForLiquidity() {
  const navigate = useNavigate()
  const {
    poolType,
    onContinue,
    baseToken,
    quoteToken,
    setBaseToken,
    setQuoteToken,
    feeTier,
    setFeeTier,
    feeTierList,
    onPoolTypeChange,
    isOpen,
    onClose,
    onConfirm,
    binStep,
    feeOptions,
    handleBinStepChange,
    baseFee,
    handleBaseFeeChange,
    getBinStepListLoading
  } = useSelectPool()

  const onBack = () => {
    if (poolType === 'dlmm') {
      navigate('/pools?tab=dlmm_pools')
    } else {
      navigate('/pools')
    }
  }

  const onBaseTokenChange = (token: Token | undefined) => {
    if ((poolType === 'dlmm' && token?.coin_type !== baseToken?.coin_type) || token?.coin_type !== quoteToken?.coin_type) {
      handleBaseFeeChange?.(undefined)
    }
    setBaseToken(token)
  }

  const onQuoteTokenChange = (token: Token | undefined) => {
    if ((poolType === 'dlmm' && token?.coin_type !== quoteToken?.coin_type) || token?.coin_type !== baseToken?.coin_type) {
      handleBaseFeeChange?.(undefined)
    }
    setQuoteToken(token)
  }

  return (
    <>
      <VStack w="524px" align="flex-start" gap="20px" mt="20px">
        <BackButton text="Pools" onClick={onBack} />
        <SelectPool
          poolType={poolType}
          title="Select pair"
          description="Select the token you want to provide liquidity for."
          onContinue={onContinue}
          baseToken={baseToken}
          onBaseTokenChange={onBaseTokenChange}
          quoteToken={quoteToken}
          onQuoteTokenChange={onQuoteTokenChange}
          feeTier={feeTier}
          onFeeTierChange={fee => setFeeTier(fee)}
          baseFee={baseFee}
          onBaseFeeChange={handleBaseFeeChange}
          binStep={binStep}
          binStepList={feeOptions}
          getBinStepListLoading={getBinStepListLoading}
          onBinStepChange={value => handleBinStepChange(value, baseToken?.coin_type, quoteToken?.coin_type)}
          fromSource="addLiquidity"
          feeTierList={feeTierList}
        >
          <SelectPoolType type={poolType} onChange={onPoolTypeChange} currentStep={1} wrapStyle={{ p: '0' }} fromSource="addLiquidity" />
        </SelectPool>
      </VStack>
      {isOpen && (
        <SelectTokenAndFeeConfirm
          title="This Pool has not been initialized"
          subTitle="Do you want to initialize it?"
          btnText="Initialized Pool"
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </>
  )
}

export default SelectForLiquidity
