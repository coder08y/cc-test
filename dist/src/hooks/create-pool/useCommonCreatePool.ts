import { PoolType } from '@/components/pools/createPool/SelectPoolType'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import { isTrustedToken } from '@/utils'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType, Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { isSortedSymbols } from '@cetusprotocol/common-sdk'
import { normalizeSuiAddress } from '@mysten/sui/utils'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import useQuoteWhiteTokenList from './useQuoteWhiteTokenList'

export default function useCommonCreatePool() {
  const {
    displayBaseToken,
    setDisplayBaseToken,
    displayQuoteToken,
    setDisplayQuoteToken,
    baseToken,
    setBaseToken,
    quoteToken,
    setQuoteToken,
    poolType,
    setPoolType,
    resetCreatePoolState,
    currentStep
  } = useCreatePoolStore()
  const { base, quote, fee } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramsPoolType = searchParams.get('poolType')
  const { tokenInfo: navBaseToken } = useGetToken<CoinType>(base as CoinType)
  const { tokenInfo: navQuoteToken } = useGetToken<CoinType>(quote as CoinType)
  const { quoteWhiteTokenList } = useQuoteWhiteTokenList()
  const navigate = useNavigate()
  useEffect(() => {
    return () => {
      resetCreatePoolState()
    }
  }, [])

  // useEffect(() => {
  //   if (baseFactor) {
  //     setPoolType('dlmm')
  //   }
  // }, [])

  useEffect(() => {
    setPoolType(paramsPoolType === 'dlmm' ? 'dlmm' : 'clmm')
  }, [paramsPoolType])

  // 是否反向
  const isReverse = useMemo(() => {
    if (displayBaseToken && displayQuoteToken) {
      return isSortedSymbols(normalizeSuiAddress(displayBaseToken.coin_type), normalizeSuiAddress(displayQuoteToken.coin_type))
    }
    return false
  }, [displayBaseToken, displayQuoteToken])

  const onPoolTypeChange = (type: PoolType) => {
    setSearchParams({ poolType: type })
    // setPoolType(type)
  }

  /**
   * 处理切换Token
   * @param token
   * @param isBaseToken
   */
  const handleSelectTokenChange = (token?: Token, isBaseToken: boolean = true) => {
    if (isBaseToken) {
      setBaseToken(token)
      setDisplayBaseToken(token)
      setDisplayQuoteToken(quoteToken)
      if (token?.coin_type === quoteToken?.coin_type) {
        setQuoteToken(undefined)
        setDisplayQuoteToken(undefined)
      }
    } else {
      setQuoteToken(token)
      setDisplayQuoteToken(token)
      setDisplayBaseToken(baseToken)
      if (token?.coin_type === baseToken?.coin_type) {
        setBaseToken(undefined)
        setDisplayBaseToken(undefined)
      }
    }
  }

  /**
   * 初始化选择Token
   */

  useDeepCompareEffect(() => {
    if (navQuoteToken && !isTrustedToken(navQuoteToken, quoteWhiteTokenList)) {
      if (isTrustedToken(navBaseToken, quoteWhiteTokenList)) {
        setBaseToken(navQuoteToken)
        setDisplayBaseToken(navQuoteToken)
        setDisplayQuoteToken(navBaseToken || envConfigs.sui_coin)
        setQuoteToken(navBaseToken || envConfigs.sui_coin)
      } else {
        setBaseToken(undefined)
        setDisplayBaseToken(undefined)
        setDisplayQuoteToken(envConfigs.sui_coin)
        setQuoteToken(envConfigs.sui_coin)
      }
    } else {
      if (baseToken === undefined || navBaseToken) {
        setBaseToken(navBaseToken)
        setDisplayBaseToken(navBaseToken)
      }
      if (quoteToken === undefined || navQuoteToken) {
        setDisplayQuoteToken(navQuoteToken || envConfigs.sui_coin)
        setQuoteToken(navQuoteToken || envConfigs.sui_coin)
      }
    }
  }, [navBaseToken?.coin_type, navQuoteToken?.coin_type, quoteWhiteTokenList])

  return {
    poolType,
    onPoolTypeChange,
    isReverse,
    handleSelectTokenChange
  }
}
