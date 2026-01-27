import useZapStore from '@/store/zap/index'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'

import useGlobalStore from '@/store/common/global'
// import { useDebounceValue } from '@cetus/hooks'
import { Token } from '@cetus/types'
// import { d, fixDown } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'
import { useEffect, useState } from 'react'

export default function useZap(
  action: 'Deposit' | 'Withdraw',
  apiPoolInfo: any,
  currentSqrtPrice: string,
  lowerTick?: any,
  upperTick?: any,
  onlyAmountA?: string,
  onlyAmountB?: string,
  liquidity?: string,
  slideValue?: string,
  currentPosLiquidityData?: any
) {
  const {
    currentTokens,
    setCurrentTokens,
    zapAmount,
    setZapAmount,
    currentZapToken,
    setCurrentZapToken,
    zapAmountRate,
    setZapAmountRate,
    setZapTokenBalance,
    zapTokenBalance,
    setPreDepositeData,
    setIsPreLoading,
    setZapApiPool,
    lower,
    upper,
    setLower,
    setUpper,
    setZapCurrPriceData,
    resetZapData,
    setLiquidity,
    setZapSlideValue,
    setPosOriginAmounts
  } = useZapStore()
  const { liquiditySlippage } = useGlobalStore()
  const { balanceInfo } = useGetTokenBalance(currentZapToken)
  const { getTokenAmountValue } = useTokenPrice()
  const [uuid, setUuid] = useState<string>('')

  useEffect(() => {
    setLower(lowerTick)
  }, [lowerTick])

  useEffect(() => {
    setUpper(upperTick)
  }, [upperTick])

  useEffect(() => {
    setLiquidity(liquidity || '')
  }, [liquidity])

  useEffect(() => {
    setZapSlideValue(slideValue || 0)
  }, [slideValue])

  useEffect(() => {
    setPosOriginAmounts({
      coinAmountA: currentPosLiquidityData?.coinAmountA,
      coinAmountB: currentPosLiquidityData?.coinAmountB
    })
  }, [currentPosLiquidityData])

  useEffect(() => {
    if (apiPoolInfo?.poolAddress && currentSqrtPrice) {
      const decimalsA = apiPoolInfo?.tokenA?.decimals
      const decimalsB = apiPoolInfo?.tokenB?.decimals
      const currentPrice = TickMath.sqrtPriceX64ToPrice(new BN(currentSqrtPrice), decimalsA, decimalsB).toString()
      setZapCurrPriceData({
        currentPrice,
        currentSqrtPrice
      })
    }
  }, [currentSqrtPrice, apiPoolInfo?.poolAddress])

  useEffect(() => {
    let arr: Token[] = []
    if (apiPoolInfo?.poolAddress) {
      arr = [apiPoolInfo?.displayTokenA, apiPoolInfo?.displayTokenB]
      setCurrentZapToken(apiPoolInfo?.displayTokenA)
    }
    setCurrentTokens(arr)
    setZapApiPool(apiPoolInfo)
  }, [apiPoolInfo?.poolAddress])

  const handleChangeAmount = (value: string) => {
    setZapAmount(value)
  }

  const handleChangeZapToken = (value: any) => {
    setCurrentZapToken(value)
    setZapAmount('')
  }

  useEffect(() => {
    let rate
    if (zapAmount && currentZapToken?.coin_type) {
      rate = getTokenAmountValue(currentZapToken?.coin_type, zapAmount)
    }
    setZapAmountRate(rate || '')
  }, [zapAmount, currentZapToken?.coin_type])

  useEffect(() => {
    if (action === 'Deposit') {
      setZapTokenBalance(balanceInfo)
    } else {
      const isCoinA = currentZapToken?.coin_type === apiPoolInfo?.tokenA?.coin_type
      if (isCoinA) {
        setZapTokenBalance({ balanceFormat: onlyAmountA })
      } else {
        setZapTokenBalance({ balanceFormat: onlyAmountB })
      }
    }
  }, [action, balanceInfo, onlyAmountA, onlyAmountB, currentZapToken?.coin_type, apiPoolInfo?.poolAddress])

  useEffect(() => {
    return () => {
      resetZapData()
    }
  }, [])

  return {
    currentTokens,
    zapAmount,
    zapAmountRate,
    handleChangeAmount,
    currentZapToken,
    handleChangeZapToken,
    zapTokenBalance,
    liquiditySlippage
    // zapProgressRef,
    // handleResetZapProgress
  }
}
