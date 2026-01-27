import AddLiquidityConfirmModal from '@/components/liquidity/dlmm/AddLiquidityConfirmModal'
import useAddDlmmLiquidity from '@/hooks/dlmm/useAddDlmmLiquidity'
import useAddDlmmLiquidityButton from '@/hooks/dlmm/useAddDlmmLiquidityButton'
import useDlmmDeposit from '@/hooks/dlmm/useDlmmDeposit'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import NFTModal from '../NFTModal'
import H5Deposit from './H5'
import PCDeposit from './PC'

import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import useZapStore from '@/store/zap/index'

interface RangeTab {
  label: string
  key: string
  imgInfo: {
    src: string | undefined
    w: string
    h: string
    borderRadius: string
    fallbackSrc: string
  }
}

interface FeeTier {
  title: string
  feeDisplay: string
  feeRate: string
  poolAddress: string
  tvl: unknown
}

interface DLMMDepositProps<T extends RangeTab = RangeTab> {
  rangeTabList: T[]
  binStep?: number
  baseFeeDisplay: string
  getList: () => Promise<void>
  getPrice: () => Promise<void>
}

function DLMMDeposit<T extends RangeTab, K extends FeeTier>({ rangeTabList, binStep, baseFeeDisplay, getList, getPrice }: DLMMDepositProps<T>) {
  const { dlmmApiPoolInfo, dlmmContractPoolInfo } = useDlmmLiquidityStore()
  const { fromToken, toToken, setFromToken, setToToken, fromLoading, toLoading, preCalcError } = useAddDlmmLiquidityStore()
  const { zapAmount, currentZapToken } = useZapStore()
  const { direct, perText, debouncedOnReverseClick, currentRangeTab } = useDlmmDeposit<T>({
    rangeTabList
  })
  const {
    handleAmountChange,
    byAmountIn,
    setByAmountIn,
    fromAmount,
    fromAmountValue,
    setFromAmount,
    toAmount,
    toAmountValue,
    setToAmount,
    liquidityAmount,
    fromBalanceInfo,
    toBalanceInfo,
    totalAmount,
    fromTokenLock,
    toTokenLock,
    handleAdd,
    confirmModalOpen,
    setConfirmModalOpen,
    nftOpen,
    setNftOpen,
    relatedPosId,
    handleSubmit,
    submitLoading,
    positionCount,
    isReverse,
    preCalcLoading,
    zapProps,
    btnClickRef,
    knowsRisk,
    handleKnowsRisk,
    showRiskConfirm
  } = useAddDlmmLiquidity(getList, direct)

  const { btnText, btnDisabled } = useAddDlmmLiquidityButton(
    zapProps?.supportZap,
    zapProps?.zapAmount,
    zapProps?.availableAmount,
    zapProps?.zapCoin?.symbol,
    zapProps?.zapTipsError
  )

  const { isApp } = useWindowWidth()
  const props = {
    btnText,
    btnDisabled,
    onReverseClick: debouncedOnReverseClick,
    direct,
    perText,
    rangeTabList,
    currentRangeTab,
    fromBalanceInfo,
    toBalanceInfo,
    fromAmountValue,
    toAmountValue,
    handleAmountChange,
    handleAdd,
    handleSubmit,
    submitLoading,
    preCalcLoading,
    isReverse,
    zapProps,
    btnClickRef,
    knowsRisk,
    handleKnowsRisk,
    showRiskConfirm
  }
  // const { stepMap, showPoolTutorial, onTutorialExit, onTutorialNext, onTutorialPrevious, dlmmTutorialStep } = useTutorial()
  return (
    <>
      {isApp ? <H5Deposit {...props} /> : <PCDeposit {...props} />}
      {confirmModalOpen && (
        <AddLiquidityConfirmModal
          onClose={() => setConfirmModalOpen(false)}
          data={{ baseFeeDisplay: baseFeeDisplay as any }}
          onSubmit={() => {
            if (zapProps.preDepositResult) {
              zapProps.handleZapSubmit()
            } else {
              handleSubmit()
            }
          }}
          isReverse={isReverse}
          isDirect={direct}
          currentRangeTab={currentRangeTab}
          zapProps={zapProps.preDepositResult ? zapProps : undefined}
        />
      )}

      {nftOpen && relatedPosId && dlmmApiPoolInfo?.poolId && (
        <NFTModal
          onClose={() => setNftOpen(false)}
          tokenA={dlmmApiPoolInfo.displayTokenA as Token}
          tokenB={dlmmApiPoolInfo.displayTokenB as Token}
          poolId={dlmmApiPoolInfo?.poolId}
          posId={relatedPosId}
          fee={dlmmApiPoolInfo?.feeDisplay as string}
          binStep={dlmmContractPoolInfo?.binStep}
          isReverse={isReverse}
          direct={direct}
          positionCount={positionCount}
        />
      )}

      {/* {showPoolTutorial && (
        <Tour
          isOpen={showPoolTutorial}
          step={stepMap[dlmmTutorialStep]}
          onExit={onTutorialExit}
          onNext={onTutorialNext}
          onPrev={onTutorialPrevious}
        />
      )} */}
    </>
  )
}

export default DLMMDeposit
