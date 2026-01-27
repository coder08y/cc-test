import useDlmmLiquidityStore from '@/store/dlmm'
import useTvlInfoStore from '@/store/dlmm/dlmmTvl'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { d } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { useEffect } from 'react'

function useGetDlmmTvlInfo() {
  const {
    tokenAAmount,
    setTokenAAmount,
    tokenBAmount,
    setTokenBAmount,
    tokenAAmountUSD,
    setTokenAAmountUSD,
    tokenBAmountUSD,
    setTokenBAmountUSD,
    totalAmountUSD,
    setTotalAmountUSD,
    resetTvlInfo,
    tvlLoading,
    setTvlLoading
  } = useTvlInfoStore()
  const { dlmmApiPoolInfo, dlmmContractPoolInfo } = useDlmmLiquidityStore()

  const { getTokenAmountValue, fetchTokenPrices, priceLoading } = useTokenPrice()

  const { poolId } = useQueryParams()

  const handleRefresh = async () => {
    setTvlLoading(true)
    try {
      const coinTypeList: string[] = []
      if (dlmmApiPoolInfo?.tokenA?.coin_type) {
        coinTypeList.push(dlmmApiPoolInfo?.tokenA?.coin_type)
      }
      if (dlmmApiPoolInfo?.tokenB?.coin_type) {
        coinTypeList.push(dlmmApiPoolInfo?.tokenB?.coin_type)
      }

      if (dlmmApiPoolInfo?.miningRewardList) {
        dlmmApiPoolInfo?.miningRewardList?.forEach((item: any) => {
          if (item.emissionsEveryDay) {
            coinTypeList.push(item.coinType)
          }
        })
      }

      if (coinTypeList.length > 0) {
        fetchTokenPrices(Array.from(new Set(coinTypeList.filter(item => item && item !== 'undefined'))))
      }
    } catch (error) {
      console.log('🚀 ~ PoolInfo ~ handleRefresh:', error)
    } finally {
      setTvlLoading(false)
    }
  }

  useEffect(() => {
    resetTvlInfo()
  }, [poolId])

  useEffect(() => {
    return () => {
      resetTvlInfo()
    }
  }, [])

  useEffect(() => {
    handleRefresh()
  }, [dlmmApiPoolInfo?.tvl, dlmmApiPoolInfo?.tokenA?.coin_type, dlmmApiPoolInfo?.tokenB?.coin_type])

  useEffect(() => {
    if (dlmmContractPoolInfo?.balanceA) {
      setTokenAAmount(
        d(dlmmContractPoolInfo?.balanceA)
          .sub(dlmmContractPoolInfo?.protocolFeeA || '0')
          .toString()
      )
    }
  }, [dlmmContractPoolInfo?.balanceA, dlmmContractPoolInfo?.protocolFeeA, poolId])

  useEffect(() => {
    if (dlmmContractPoolInfo?.balanceB) {
      setTokenBAmount(
        d(dlmmContractPoolInfo?.balanceB)
          .sub(dlmmContractPoolInfo?.protocolFeeB || '0')
          .toString()
      )
    }
  }, [dlmmContractPoolInfo?.balanceB, dlmmContractPoolInfo?.protocolFeeB, poolId])

  useEffect(() => {
    if (tokenAAmount && dlmmApiPoolInfo?.tokenA?.decimals && !Number.isNaN(Number(dlmmApiPoolInfo?.tokenA.decimals))) {
      setTokenAAmountUSD(getTokenAmountValue(dlmmApiPoolInfo?.tokenA.coin_type, fromDecimalsAmount(tokenAAmount, dlmmApiPoolInfo?.tokenA.decimals)))
    }
  }, [tokenAAmount, priceLoading])

  useEffect(() => {
    if (tokenBAmount && dlmmApiPoolInfo?.tokenB?.decimals && !Number.isNaN(Number(dlmmApiPoolInfo?.tokenB.decimals))) {
      setTokenBAmountUSD(getTokenAmountValue(dlmmApiPoolInfo?.tokenB.coin_type, fromDecimalsAmount(tokenBAmount, dlmmApiPoolInfo?.tokenB.decimals)))
    }
  }, [tokenBAmount, priceLoading])

  useEffect(() => {
    if ((tokenAAmountUSD || tokenBAmountUSD) && tokenAAmountUSD !== '--' && tokenBAmountUSD !== '--') {
      setTotalAmountUSD(
        d(tokenAAmountUSD || 0)
          .plus(tokenBAmountUSD || 0)
          .toString()
      )
    } else {
      setTotalAmountUSD('--')
    }
  }, [tokenAAmountUSD, tokenBAmountUSD])
  return {
    tokenAAmount,
    tokenBAmount,
    tokenAAmountUSD,
    tokenBAmountUSD,
    totalAmountUSD,
    setTotalAmountUSD,
    tvlLoading
  }
}

export default useGetDlmmTvlInfo
