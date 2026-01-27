import PoolTag from '@/components/common/PoolTag'
import SelectPool from '@/components/selectPool'
import { d } from '@cetus/utils'
import CompletedSelectToken from './CompletedSelectToken'
import { SelectCLMMTokenProps } from './type'

function SelectCLMMToken({
  onEdit,
  editStep,
  currentStep,
  onContinue,
  baseToken,
  quoteToken,
  onBaseTokenChange,
  onQuoteTokenChange,
  quoteWhiteTokenList,
  feeTier,
  feeTierList,
  onFeeTierChange,
  isFetchingOptions
}: SelectCLMMTokenProps) {
  if (currentStep < 2) return null
  return (
    <>
      {editStep === 2 || currentStep === 2 ? (
        <SelectPool
          poolType="clmm"
          title="Select pair"
          description="Select the token you want to create a liquidity pool for."
          onContinue={onContinue}
          baseToken={baseToken}
          onBaseTokenChange={onBaseTokenChange}
          quoteToken={quoteToken}
          onQuoteTokenChange={onQuoteTokenChange}
          quoteWhiteTokenList={quoteWhiteTokenList}
          feeTier={feeTier}
          feeTierList={feeTierList}
          onFeeTierChange={onFeeTierChange}
          wrapStyle={{ p: { base: '16px 8px', lg: '32px' } }}
          fromSource="createPool"
          disabled={isFetchingOptions}
        />
      ) : (
        <CompletedSelectToken onEdit={onEdit} baseToken={baseToken} quoteToken={quoteToken}>
          <PoolTag poolType="clmm" displayFee={typeof feeTier === 'string' ? `${d(feeTier).div(100).toString()}%` : feeTier?.feeDisplay} />
        </CompletedSelectToken>
      )}
    </>
  )
}

export default SelectCLMMToken
