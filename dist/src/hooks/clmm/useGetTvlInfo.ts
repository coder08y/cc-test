import useLiquidityStore from '@/store/clmm'
import useTvlInfoStore from '@/store/clmm/liquidityTvl'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { d, fetchGet, isAvailableObject } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { useCallback, useEffect, useMemo } from 'react'

const getTokenUSD = (amount: string | undefined, price: string | undefined, decimals: string | number | undefined) => {
  if (amount && price && decimals) {
    return d(amount).mul(price).div(d(10).pow(decimals)).toString()
  }
  return '--'
}

function useGetTvlInfo() {
  const { poolAddress } = useQueryParams()

  const {
    tokenAPrice,
    setTokenAPrice,
    tokenBPrice,
    setTokenBPrice,
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
  const { apiPoolInfo, contractPoolInfo } = useLiquidityStore()

  const getTokenPrice = async (coinType: string) => {
    try {
      const fullAddress = extractStructTagFromType(coinType)?.full_address
      const normalizeCoinType =
        fullAddress == '0x2::sui::SUI' ? '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI' : fullAddress

      const { prices } = await fetchGet(`${envConfigs?.cetus_api}/v3/sui/market_price?base_symbol_address=${normalizeCoinType}`)
      const rate = prices?.[0]
      return rate
    } catch (error) {
      console.log('🚀🚀🚀 ~ file: useRate.ts:31 ~ getAmountPrice ~ error:', error)
      return '--'
    }
  }

  const handleRefresh = useCallback(async () => {
    if (!apiPoolInfo) return

    setTvlLoading(true)
    try {
      const [priceA, priceB] = await Promise.all([
        apiPoolInfo?.tokenA?.coin_type ? getTokenPrice(apiPoolInfo.tokenA.coin_type) : null,
        apiPoolInfo?.tokenB?.coin_type ? getTokenPrice(apiPoolInfo.tokenB.coin_type) : null
      ])

      if (priceA) setTokenAPrice(priceA)
      if (priceB) setTokenBPrice(priceB)
    } finally {
      setTvlLoading(false)
    }
  }, [apiPoolInfo])

  useEffect(() => {
    resetTvlInfo()
  }, [poolAddress])

  useEffect(() => {
    setTvlLoading(true)
    if (isAvailableObject(apiPoolInfo) && isAvailableObject(contractPoolInfo)) {
      handleRefresh()
    }
  }, [handleRefresh, apiPoolInfo?.tokenA?.coin_type, apiPoolInfo?.tokenB?.coin_type, apiPoolInfo?.tvl, contractPoolInfo])

  const calcTokenAAmount = useMemo(() => {
    if (!contractPoolInfo?.coinAmountA) return ''
    return d(contractPoolInfo.coinAmountA)
      .sub(contractPoolInfo?.fee_protocol_coin_a || '0')
      .toString()
  }, [contractPoolInfo?.coinAmountA, contractPoolInfo?.fee_protocol_coin_a])

  const calcTokenBAmount = useMemo(() => {
    if (!contractPoolInfo?.coinAmountB) return ''
    return d(contractPoolInfo.coinAmountB)
      .sub(contractPoolInfo?.fee_protocol_coin_b || '0')
      .toString()
  }, [contractPoolInfo?.coinAmountB, contractPoolInfo?.fee_protocol_coin_b])

  const calcTokenAUsd = useMemo(() => {
    if (tvlLoading || !calcTokenAAmount || !tokenAPrice?.price || Number.isNaN(Number(apiPoolInfo?.tokenA?.decimals))) {
      return '--'
    }

    return getTokenUSD(calcTokenAAmount, tokenAPrice.price, apiPoolInfo?.tokenA.decimals)
  }, [tvlLoading, calcTokenAAmount, tokenAPrice, apiPoolInfo?.tokenA?.decimals])

  const calcTokenBUsd = useMemo(() => {
    if (tvlLoading || !calcTokenBAmount || !tokenBPrice?.price || Number.isNaN(Number(apiPoolInfo?.tokenB?.decimals))) {
      return '--'
    }

    return getTokenUSD(calcTokenBAmount, tokenBPrice.price, apiPoolInfo?.tokenB.decimals)
  }, [tvlLoading, calcTokenBAmount, tokenBPrice, apiPoolInfo?.tokenB?.decimals])

  const calcTotalUsd = useMemo(() => {
    if (tvlLoading || calcTokenAUsd === '--' || calcTokenBUsd === '--') {
      return '--'
    }

    return d(calcTokenAUsd || 0)
      .add(calcTokenBUsd || 0)
      .toString()
  }, [tvlLoading, calcTokenAUsd, calcTokenBUsd])

  useEffect(() => {
    if (tvlLoading) return

    setTokenAAmount(calcTokenAAmount)
    setTokenBAmount(calcTokenBAmount)
    setTokenAAmountUSD(calcTokenAUsd)
    setTokenBAmountUSD(calcTokenBUsd)
    setTotalAmountUSD(calcTotalUsd)
  }, [tvlLoading, calcTokenAAmount, calcTokenBAmount, calcTokenAUsd, calcTokenBUsd, calcTotalUsd])

  return {
    tokenAPrice,
    tokenBPrice,
    tokenAAmount,
    tokenBAmount,
    tokenAAmountUSD,
    tokenBAmountUSD,
    totalAmountUSD,
    setTotalAmountUSD,
    tvlLoading
  }
}

export default useGetTvlInfo
