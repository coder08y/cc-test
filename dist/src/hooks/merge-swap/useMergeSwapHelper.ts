import { MergeSwapQuote } from '@/types/merge_swap'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { AggregatorServerErrorCode, MergeSwapRouterData, Path } from '@cetusprotocol/aggregator-sdk'
import { d, fixCoinType, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { useDebounceEffect, useDeepCompareEffect } from 'ahooks'
import { useCallback, useMemo, useState } from 'react'
import useCheckTokenScamsAlert from '../common/useCheckTokenScamsAlert'

export const usePriceAcceptSwapQuote = (originData?: MergeSwapQuote, newData?: MergeSwapQuote) => {
  return useMemo(() => {
    if (originData?.data && newData?.data) {
      const originOutput: Record<string, string> = {}
      originData.data.allRoutes.forEach(route => {
        originOutput[route.paths[0].from] = d(route.amountOut.toString()).div(route.amountIn.toString()).toString()
      })

      const diffItem = newData.data.allRoutes.find(route => {
        const newPrice = d(route.amountOut.toString()).div(route.amountIn.toString()).toString()
        const price = originOutput[route.paths[0].from]
        if (price) {
          return !d(newPrice).eq(d(price))
        }
        return false
      })

      return diffItem ? newData : undefined
    }
  }, [originData, newData])
}

export const useGetMinReceivedAmount = (slippage: string, totalAmountOutDisplay?: string) => {
  return useMemo(() => {
    if (totalAmountOutDisplay) {
      return d(totalAmountOutDisplay)
        .mul(d(1).sub(d(slippage)))
        .toString()
    }
  }, [totalAmountOutDisplay, slippage])
}

export function useGetRouterProviders(paths: Path[]) {
  const [routeProviders, setRouteProviders] = useState<string[]>([])

  useDebounceEffect(() => {
    const providers = new Set<string>()
    paths.forEach((path: any) => {
      if (path.provider) {
        providers.add(path.provider)
      }
    })
    setRouteProviders(Array.from(providers))
  }, [paths])

  return {
    routeProviders
  }
}

export function useMergeSwapPrice(fromTokenList: Token[], toToken?: Token) {
  const { getTokenPrice, fetchTokenPrices } = useTokenPrice()

  const handleTokenPrices = (fromTokenList: Token[], toToken?: Token, skipVerify: boolean = false) => {
    const tokenList = toToken ? [...fromTokenList, toToken] : [...fromTokenList]
    const coinTypeList: string[] = []
    tokenList.forEach(token => {
      const verifyPriceTime = 30 * 1000
      const price = getTokenPrice(token.coin_type, skipVerify ? undefined : verifyPriceTime)
      if (!price) {
        coinTypeList.push(token.coin_type)
      }
    })
    if (coinTypeList.length > 0) {
      fetchTokenPrices(coinTypeList)
    }
  }

  /**
   * 获取路由token的价格
   */
  useDebounceEffect(() => {
    handleTokenPrices(fromTokenList, toToken)
  }, [fromTokenList, toToken])

  return {
    handleTokenPrices
  }
}

export function useFormatMergeSwapRoute(quote?: MergeSwapQuote) {
  const { getTokenPrice, coinPriceObj } = useTokenPrice()
  const [hasHighPriceDiff, setHasHighPriceDiff] = useState(false)

  const allProviders = useMemo(() => {
    if (quote && quote.data?.allRoutes) {
      const providers = new Set<string>()
      quote.data.allRoutes.forEach(route => {
        route.paths.forEach(path => {
          if (path.provider) {
            providers.add(path.provider)
          }
        })
      })
      return Array.from(providers)
    }
  }, [quote?.data?.allRoutes])

  // useDebounceEffect(() => {
  //   if (quote && quote.data?.allRoutes) {
  //     quote.data.allRoutes.forEach(route => {
  //       const from = route.paths[0].from
  //       const target = route.paths[route.paths.length - 1].target
  //       const fromToken = quote.fromTokenList.find(token => fixCoinType(token.coin_type, false) === fixCoinType(from, false))
  //       const targetToken = quote.toToken
  //       const fromPrice = getTokenPrice(from)
  //       const targetPrice = getTokenPrice(target)

  //       if (fromPrice && targetPrice && fromToken) {
  //         const marketPrice = d(fromPrice.price).div(targetPrice.price).toString()
  //         const swapPrice = d(fromDecimalsAmount(route.amountOut.toString(), targetToken.decimals))
  //           .div(fromDecimalsAmount(route.amountIn.toString(), fromToken.decimals))
  //           .toString()
  //         const priceImpact = d(swapPrice).sub(marketPrice).div(marketPrice).mul(100)
  //         console.log('🚀 ~ useDebounceEffect ~ priceImpact:', {
  //           priceImpact: priceImpact.toString(),
  //           swapPrice,
  //           marketPrice
  //         })
  //         if (d(priceImpact).lte(-30)) {
  //           setHasHighPriceDiff(true)
  //         }
  //       }
  //     })
  //   } else {
  //     setHasHighPriceDiff(false)
  //   }
  // }, [quote?.data?.allRoutes, coinPriceObj])

  return {
    allProviders,
    hasHighPriceDiff
  }
}

export function useMergeTotalInputValue(fromTokenList: Token[], fromAmountObj: Record<string, string>) {
  const { getTokenAmountValue, coinPriceObj } = useTokenPrice()
  const [totalInputValue, setTotalInputValue] = useState('')
  useDebounceEffect(() => {
    let totalValue = d(0)
    let hasCoinPrice = true
    fromTokenList.forEach(token => {
      const amount = fromAmountObj[token.coin_type]

      if (+amount) {
        const tokenValue = getTokenAmountValue(token.coin_type, amount)
        if (+tokenValue) {
          totalValue = totalValue.add(d(tokenValue))
        } else {
          hasCoinPrice = false
        }
      }
    })
    if (hasCoinPrice) {
      setTotalInputValue(totalValue.toString())
    } else {
      setTotalInputValue('Incalculable')
    }
  }, [fromAmountObj, coinPriceObj])

  return {
    totalInputValue
  }
}

export function useVerifySwapInput(fromTokenList: Token[], fromAmountObj: Record<string, string>) {
  const { currentAccount } = useAccountStore(state => ({ currentAccount: state.currentAccount }))
  const { getBalanceInfoFromCache, tokenBalanceObj } = useGetTokenBalance()
  const [isAllBalanceEnough, setIsAllBalanceEnough] = useState(false)
  const [isAllInputValid, setIsAllInputValid] = useState(false)
  const [hasAnyInput, setHasAnyInput] = useState(false)

  const verifySwapInput = useCallback(
    (fromTokenList: Token[], fromAmountObj: Record<string, string>) => {
      let allInputValid = fromTokenList.length > 0
      let allBalanceEnough = false
      let hasAnyInput = false

      fromTokenList.forEach(token => {
        const amount = fromAmountObj[token.coin_type]
        const isValid = +amount

        if (!isValid) {
          allInputValid = false
        } else {
          hasAnyInput = true
        }
      })
      if (currentAccount && allInputValid) {
        allBalanceEnough = fromTokenList.every(token => {
          const balanceInfo = getBalanceInfoFromCache(token)
          const amount = fromAmountObj[token.coin_type]
          if (balanceInfo && +amount) {
            return d(balanceInfo.balanceFormat).gte(amount)
          }
          return false
        })
      } else {
        allBalanceEnough = false
      }

      return {
        isAllBalanceEnough: allBalanceEnough,
        //isAllBalanceEnough: true, // todo: 暂时不判断余额, 后期上线前在放开 isAllBalanceEnough
        isAllInputValid: allInputValid,
        hasAnyInput
      }
    },
    [currentAccount, tokenBalanceObj, fromTokenList, fromAmountObj]
  )

  useDebounceEffect(() => {
    const { isAllBalanceEnough, isAllInputValid, hasAnyInput } = verifySwapInput(fromTokenList, fromAmountObj)

    setIsAllInputValid(isAllInputValid)
    setIsAllBalanceEnough(isAllBalanceEnough)
    setHasAnyInput(hasAnyInput)
  }, [fromAmountObj, fromTokenList, currentAccount, tokenBalanceObj])

  return {
    isAllBalanceEnough,
    isAllInputValid,
    verifySwapInput,
    hasAnyInput
  }
}

export function handleMergeSwapQuote(
  uuid: string,
  toToken: Token,
  fromTokenList: Token[],
  fromAmountObj: Record<string, string>,
  routerResult: MergeSwapRouterData | null
): MergeSwapQuote {
  const quote: MergeSwapQuote = {
    uuid,
    fromTokenList,
    toToken,
    fromAmountObj,
    totalAmountOut: '',
    totalAmountOutDisplay: ''
  }
  if (routerResult) {
    const totalAmountOut = routerResult.totalAmountOut.toString()
    quote.data = routerResult

    if (routerResult.error) {
      quote.error = routerResult.error
      if (quote.error.code === AggregatorServerErrorCode.BadRequest && quote.error.msg) {
        const errorMsg = quote.error.msg
        const regex = /0x[a-fA-F0-9]{64}::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+/
        const match = errorMsg.match(regex)
        if (match) {
          const coin = match[0]
          const errorCoin = fromTokenList.find(token => token.coin_type === coin)
          if (errorCoin) {
            quote.error.coin = errorCoin
            quote.error.code = AggregatorServerErrorCode.InsufficientLiquidity
          }
        }
      }
    } else {
      if (routerResult.allRoutes.length === 0) {
        quote.error = {
          code: AggregatorServerErrorCode.BadRequest,
          msg: 'no router'
        }
      } else {
        quote.totalAmountOut = totalAmountOut
        quote.totalAmountOutDisplay = fromDecimalsAmount(totalAmountOut, toToken.decimals)
      }
    }
  } else {
    quote.error = {
      code: AggregatorServerErrorCode.BadRequest,
      msg: 'no router'
    }
  }
  return quote
}

export function useMergeSwapScamsText(fromTokenList: Token[]) {
  const { scamsCoinList } = useCheckTokenScamsAlert(fromTokenList)
  const [scamsText, setScamsText] = useState('')
  useDeepCompareEffect(() => {
    if (scamsCoinList.length === 0) {
      setScamsText('')
      return
    }
    const scamsTokenList: Token[] = []
    scamsCoinList.forEach(coin => {
      const token = fromTokenList.find(token => fixCoinType(token.coin_type, false) === fixCoinType(coin.coin_type, false))
      if (token) {
        scamsTokenList.push(token)
      }
    })

    if (scamsTokenList.length === 0) {
      setScamsText('')
      return
    }

    setScamsText(scamsTokenList.map(token => token.symbol).join(', '))

    if (scamsTokenList.length === 1) {
      setScamsText(`${scamsTokenList[0].symbol} token is `)
    } else if (scamsTokenList.length === 2) {
      setScamsText(`${scamsTokenList[0].symbol} and ${scamsTokenList[1].symbol} are `)
    } else {
      setScamsText(`${scamsTokenList.map(token => token.symbol).join(', ')} are `)
    }
  }, [scamsCoinList, fromTokenList])

  return {
    scamsText
  }
}
