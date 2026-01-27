import AddLiquidityConfirmModal from '@/components/liquidity/clmm/AddLiquidityConfirmModal'
import useAddLiquidity from '@/hooks/clmm/useAddLiquidity'
import useAddLiquidityButton from '@/hooks/clmm/useAddLiquidityButton'
import useDeposit from '@/hooks/clmm/useDeposit'
import useLiquidityStore from '@/store/clmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { isAvailableObject } from '@cetus/utils'
import NFTModal from '../NFTModal'
import H5ProvideLiquidity from './H5'
import PCProvideLiquidity from './PC'

import useGetVaultsFarmingApiInfo from '@/hooks/vaults-farming/useGetVaultsFarmingApiInfo'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useZapStore from '@/store/zap/index'
import { useEffect } from 'react'

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

interface ProvideLiquidityProps<T extends RangeTab = RangeTab, K extends FeeTier = FeeTier> {
  rangeTabList: T[]
  currentFeeTier?: K
  getList: () => Promise<void>
  getPrice: () => Promise<void>
}

function ProvideLiquidity<T extends RangeTab, K extends FeeTier>({ rangeTabList, currentFeeTier, getList, getPrice }: ProvideLiquidityProps<T, K>) {
  const { apiPoolInfo } = useLiquidityStore()
  const { zapAmount, currentZapToken } = useZapStore()
  const {
    direct,
    perText,
    handleChangeIsFarmRewardsRange,
    onReverseClick,
    leverage,
    currentRangeTab,
    isFullRange,
    handleChangeLiquidityChartTab,
    liquidityChartTab,
    liquidityChartTabList
  } = useDeposit<T>({ rangeTabList })
  const {
    handleAmountChange,
    fromAmountValue,
    toAmountValue,
    fromBalanceInfo,
    toBalanceInfo,
    fromTokenLock,
    toTokenLock,
    relatedPosId,
    nftOpen,
    setNftOpen,
    handleAdd,
    handleSubmit,
    useZapIn,
    handleChangeZapIn,
    confirmModalOpen,
    setConfirmModalOpen
  } = useAddLiquidity(getList, direct)

  const { btnText, btnDisabled } = useAddLiquidityButton()

  const { isApp } = useWindowWidth()
  const props = {
    btnText,
    btnDisabled,
    handleChangeIsFarmRewardsRange,
    onReverseClick,
    leverage,
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
    isFullRange,
    useZapIn,
    handleChangeZapIn,
    handleSubmit,
    handleChangeLiquidityChartTab,
    liquidityChartTab,
    liquidityChartTabList
  }

  const { getHaedalFarmingList } = useGetVaultsFarmingApiInfo()
  const { vaultsFarmObj } = useVaultsFarmingStore()
  // 页面刷新重新获取
  useEffect(() => {
    if (!isAvailableObject(vaultsFarmObj)) {
      getHaedalFarmingList()
    }
  }, [vaultsFarmObj])
  return (
    <>
      {isApp ? <H5ProvideLiquidity {...props} /> : <PCProvideLiquidity {...props} />}
      {confirmModalOpen && (
        <AddLiquidityConfirmModal
          onClose={() => setConfirmModalOpen(false)}
          data={{ feeTier: currentFeeTier as any, zapData: useZapIn ? { amount: zapAmount, token: currentZapToken } : undefined }}
          onSubmit={handleSubmit}
        />
      )}
      {nftOpen && relatedPosId && isAvailableObject(apiPoolInfo) && (
        <NFTModal
          onClose={() => setNftOpen(false)}
          tokenA={apiPoolInfo?.displayTokenA as Token}
          tokenB={apiPoolInfo?.displayTokenB as Token}
          posId={relatedPosId}
          fee={apiPoolInfo?.feeDisplay as string}
          isReverse={apiPoolInfo?.isReverse as boolean}
        />
      )}
    </>
  )
}

export default ProvideLiquidity
