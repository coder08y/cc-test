import PoolTag from '@/components/common/PoolTag'
import SelectPool from '@/components/selectPool'
import CompletedSelectToken from './CompletedSelectToken'
import { SelectDLMMTokenProps } from './type'

function SelectDLMMToken({
  onEdit,
  editStep,
  currentStep,
  onContinue,
  baseToken,
  quoteToken,
  onBaseTokenChange,
  onQuoteTokenChange,
  quoteWhiteTokenList,
  binStep,
  binStepList = [],
  onBinStepChange = () => {},
  baseFee,
  onBaseFeeChange = () => {},
  getBinStepListLoading,
  disabled
}: SelectDLMMTokenProps) {
  if (currentStep < 2) return null
  return (
    <>
      {editStep === 2 || currentStep === 2 ? (
        <SelectPool
          poolType="dlmm"
          title="Select pair"
          description="Select the token you want to create a liquidity pool for."
          onContinue={onContinue}
          baseToken={baseToken}
          onBaseTokenChange={onBaseTokenChange}
          quoteToken={quoteToken}
          onQuoteTokenChange={onQuoteTokenChange}
          quoteWhiteTokenList={quoteWhiteTokenList}
          wrapStyle={{ p: { base: '16px 8px', lg: '32px' } }}
          fromSource="createPool"
          binStep={binStep}
          baseFee={baseFee}
          onBaseFeeChange={onBaseFeeChange}
          binStepList={binStepList}
          onBinStepChange={onBinStepChange}
          getBinStepListLoading={getBinStepListLoading}
          disabled={disabled}
        />
      ) : (
        <CompletedSelectToken onEdit={onEdit} baseToken={baseToken} quoteToken={quoteToken}>
          <PoolTag poolType="dlmm" displayFee={binStep?.feeDisplay || '--'} binStep={binStep?.binStep} />
        </CompletedSelectToken>
      )}
    </>
  )
}

export default SelectDLMMToken
