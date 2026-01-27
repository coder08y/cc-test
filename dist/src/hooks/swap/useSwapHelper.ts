import useSwapConfigStore from '@/store/swap/swapConfig'
import { AggregatorProvider, SwapRfqData, SwapRouterData, SwapRouterFormat } from '@/types/swap'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType, Token } from '@cetus/types'
import { d, extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo, useState } from 'react'
import { useGetPoolListByCoinType } from '../common/useGetPoolListByCoinType'

/**
 * 获取展示PriceAccept RouterData
 * @param originData
 * @returns
 */
export function useGetPriceAcceptRouterData(originData?: SwapRouterData, newData?: SwapRouterData) {
  const priceAcceptRouterData = useMemo(() => {
    if (newData && originData) {
      if (originData.byAmountIn) {
        if (!d(originData.toAmountUi).eq(newData.toAmountUi || '0')) {
          return newData
        }
      } else {
        if (!d(originData.fromAmountUi).eq(newData.fromAmountUi || '0')) {
          return newData
        }
      }

      return undefined
    }
    return undefined
  }, [newData, originData])

  return { priceAcceptRouterData }
}

/**
 * 计算交易的amountLimit
 * @param slippage
 * @param routerData
 * @returns
 */
export function useGetAmountLimit(slippage: string | number, routerData?: SwapRouterData) {
  const amountLimit = useMemo(() => {
    if (routerData && routerData.routerData) {
      const { byAmountIn, fromAmountUi, toAmountUi } = routerData
      if (byAmountIn) {
        return d(toAmountUi)
          .mul(d(1).sub(d(slippage)))
          .toString()
      } else {
        return d(fromAmountUi)
          .mul(d(1).add(d(slippage)))
          .toString()
      }
    }

    return undefined
  }, [slippage, routerData])

  return { amountLimit }
}

/**
 * 对RouterData 进行格式化处理
 * @returns
 */

// 20250812 hmmv2和hmm不需要在ui上做区分
const pathProviderMap: any = {
  [AggregatorProvider.HAEDALHMMV2]: AggregatorProvider.HAEDALPMM
}
export function useFormatSwapRouter(routerData?: SwapRouterData) {
  const { fetchTokenInfo } = useGetToken()
  const [formatSwapRouter, setFormatSwapRouter] = useState<any>({})
  const toFormatSwapRouter = async () => {
    if (routerData && routerData.routerData) {
      const providers: string[] = []
      const totalAmount = routerData.byAmountIn ? routerData.routerData.amountIn.toString() : routerData.routerData.amountOut.toString()
      const routers: any[] = []
      const notFoundList: string[] = []
      let totalPercentage = d(0)
      // routerData.routerData.routes.forEach((route, index) => {
      const list = routerData?.routerData?.routes || []
      for (let index = 0; index < list.length; index++) {
        const route = list[index]
        const routeF: any = {}
        const amount = routerData.byAmountIn ? route.amountIn.toString() : route.amountOut.toString()
        if (index === routerData!.routerData!.routes.length - 1) {
          routeF.percentage = d(1).sub(totalPercentage).toFixed(2)
        } else {
          routeF.percentage = d(amount).div(totalAmount).toFixed(2)
        }
        totalPercentage = d(totalPercentage).add(routeF.percentage)
        const pathsF: any[] = []
        // route.path.forEach(path => {
        for (let j = 0; j < route?.path?.length; j++) {
          const path = route?.path?.[j]
          const provider = pathProviderMap[path.provider as AggregatorProvider] || path.provider
          if (!providers.includes(provider)) {
            providers.push(provider)
          }
          const from_type = extractStructTagFromType(path.from).full_address
          const to_type = extractStructTagFromType(path.target).full_address
          const tokenMap = await fetchTokenInfo<string[]>([from_type, to_type])
          const fromCoinInfo = tokenMap?.get(from_type)
          const toCoinInfo = tokenMap?.get(to_type)
          if (!fromCoinInfo) {
            if (notFoundList.includes(from_type)) {
              notFoundList.push(from_type)
            }
          }
          if (!toCoinInfo) {
            if (notFoundList.includes(to_type)) {
              notFoundList.push(to_type)
            }
          }
          const notShowPoolAddress =
            path.provider === AggregatorProvider.SCALLOP || path.provider === AggregatorProvider.FLOWX || path.provider === AggregatorProvider.FLOWXV3
          pathsF.push({
            from_type,
            to_type,
            pool_address: notShowPoolAddress ? '' : path.id,
            fee_rate: path.feeRate,
            provider: path.provider as AggregatorProvider
          })
        }
        routeF.paths = pathsF
        routers.push(routeF)
      }
      if (notFoundList.length > 0) {
        const coinTypeList = notFoundList?.map(item => item)
        await fetchTokenInfo<CoinType[]>(coinTypeList as CoinType[])
      }
      const info: SwapRouterFormat = {
        // router_summery: `${routerData.routerData.routes.length} Streams`,
        router_summery: '',
        providers: providers as AggregatorProvider[],
        routers
      }
      setFormatSwapRouter(info)
      return
    }

    setFormatSwapRouter(undefined)
  }

  useEffect(() => {
    toFormatSwapRouter()
  }, [routerData])
  // const formatSwapRouter = useMemo(() => {
  //   if (routerData && routerData.routerData) {
  //     const providers: string[] = []
  //     const totalAmount = routerData.byAmountIn ? routerData.routerData.amountIn.toString() : routerData.routerData.amountOut.toString()
  //     const routers: any[] = []

  //     const notFoundList: string[] = []

  //     let totalPercentage = d(0)
  //     routerData.routerData.routes.forEach((route, index) => {
  //       const routeF: any = {}
  //       const amount = routerData.byAmountIn ? route.amountIn.toString() : route.amountOut.toString()

  //       if (index === routerData!.routerData!.routes.length - 1) {
  //         routeF.percentage = d(1).sub(totalPercentage).toFixed(2)
  //       } else {
  //         routeF.percentage = d(amount).div(totalAmount).toFixed(2)
  //       }

  //       totalPercentage = d(totalPercentage).add(routeF.percentage)

  //       const pathsF: any[] = []

  //       route.path.forEach(path => {
  //         if (!providers.includes(path.provider)) {
  //           providers.push(path.provider)
  //         }

  //         const from_type = extractStructTagFromType(path.from).full_address
  //         const to_type = extractStructTagFromType(path.target).full_address

  //         const fromCoinInfo = getTokenInfo(from_type)
  //         const toCoinInfo = getTokenInfo(to_type)

  //         if (!fromCoinInfo) {
  //           if (notFoundList.includes(from_type)) {
  //             notFoundList.push(from_type)
  //           }
  //         }

  //         if (!toCoinInfo) {
  //           if (notFoundList.includes(to_type)) {
  //             notFoundList.push(to_type)
  //           }
  //         }

  //         const notShowPoolAddress =
  //           path.provider === AggregatorProvider.SCALLOP || path.provider === AggregatorProvider.FLOWX || path.provider === AggregatorProvider.FLOWXV3

  //         pathsF.push({
  //           from_type,
  //           to_type,
  //           pool_address: notShowPoolAddress ? '' : path.id,
  //           fee_rate: path.feeRate,
  //           provider: path.provider as AggregatorProvider
  //         })
  //       })

  //       routeF.paths = pathsF
  //       routers.push(routeF)
  //     })

  //     if (notFoundList.length > 0) {
  //       for (const info in notFoundList) {
  //         fetchTokenInfo(info)
  //       }
  //     }

  //     const info: SwapRouterFormat = {
  //       router_summery: `${routerData.routerData.routes.length} Streams`,
  //       providers: providers as AggregatorProvider[],
  //       routers
  //     }

  //     return info
  //   }
  //   return undefined
  // }, [routerData])

  return { formatSwapRouter }
}

/**
 * 得到 swap 降级 池子地址列表
 * @returns
 */
export function useGetSwapPoolAddressList() {
  const { getPoolAddressByCoinType } = useGetPoolListByCoinType(true)

  const getSwapPoolAddress = async (from?: Token, to?: Token) => {
    if (from && to) {
      const list = await getPoolAddressByCoinType(from.coin_type, to.coin_type)
      console.log('🚀 ~ getSwapPoolAddress ~ list:', list)

      return list
    }

    return []
  }

  return {
    getSwapPoolAddress
  }
}

/**
 * 计算swap 价格ß
 * @param fromAmount
 * @param toAmount
 */
export function useGetSwapPrice(fromAmount?: string, toAmount?: string) {
  return useMemo(() => {
    if (fromAmount && toAmount && +fromAmount && +toAmount) {
      return d(toAmount).div(fromAmount).toString()
    }
    return '0'
  }, [fromAmount, toAmount])
}

export function useGetRfqData(rfqData?: SwapRfqData, swapData?: SwapRouterData) {
  const { isOpenRfqSwitch } = useSwapConfigStore()

  return useMemo(() => {
    if (!isOpenRfqSwitch) {
      return undefined
    }

    if (rfqData && swapData && rfqData.uuid === swapData.uuid) {
      return d(rfqData.toAmountUi || 0).gt(swapData.toAmountUi || 0) ? rfqData : undefined
    }
    return undefined
  }, [rfqData, swapData])
}
