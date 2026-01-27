import { AggregatorServerErrorCode, SwapRouterData } from '@/types/swap'
import useClmmSDKStore from '@cetus/stores/src/useClmmSDKStore'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { Token } from '@cetus/types'
import { bnToAmount } from '@cetus/utils'
import { FindRouterParams, RouterData, SwapInPoolsParams } from '@cetusprotocol/aggregator-sdk'
import { toDecimalsAmount } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'
import { useGetSwapPoolAddressList } from './useSwapHelper'

export function useFindBestRouting() {
  const { aggregatorSDK } = useClmmSDKStore()
  const { getSwapPoolAddress } = useGetSwapPoolAddressList()
  const { deepbookV3Config, setDeepbookV3Config, providers } = useWebConfigStore()

  /**
   * 是否禁用降级
   * @param res
   * @returns
   */
  const isDisableDegrade = (res: RouterData | null) => {
    console.log('🚀 ~ isDisableDegrade ~ res:', res)
    if (res && res.error) {
      const code = res.error.code
      return (
        code === AggregatorServerErrorCode.InsufficientLiquidity ||
        code === AggregatorServerErrorCode.HoneyPot ||
        code === AggregatorServerErrorCode.NumberTooLarge
      )
    }

    return false
  }

  const checkProvidersKeys = async (providersKeys: string[]) => {
    console.log('🚀🚀🚀 ~ useFindBestRouting.ts:35 ~ checkProvidersKeys ~ providersKeys:', providersKeys)
    const tempProvidersKeys = providers.length > 0 ? providersKeys.filter(item => providers.includes(item)) : providersKeys
    if (providersKeys.includes('DEEPBOOKV3')) {
      let config = deepbookV3Config as any
      const nowTime = new Date().getTime() / 1000
      if (config === null || nowTime - (config?.last_update_time || 0) > 60) {
        try {
          config = await aggregatorSDK.getDeepBookV3Config()

          setDeepbookV3Config(config)
        } catch (error) {
          console.log('🚀 ~ checkProvidersKeys ~ error:', error)
        }
      }
      if (config && config.is_alternative_payment) {
        const { deep_fee_vault } = config
        if (deep_fee_vault < Number(toDecimalsAmount(20, 6))) {
          return tempProvidersKeys.filter(item => item !== 'DEEPBOOKV3')
        }
      }
    }

    return tempProvidersKeys
  }

  /**
   * 预计算
   */
  const findBestRouters = async (options: {
    fromToken: Token
    toToken: Token
    amount: string
    providersKeys: string[]
    by_amount_in: boolean
    uuid: string
    isAllProviders?: boolean
  }): Promise<SwapRouterData> => {
    const { fromToken, toToken, amount, providersKeys, by_amount_in, uuid } = options
    console.log('🚀 ~ useFindBestRouting ~ options:', options)

    let routerData: SwapRouterData = {
      uuid,
      byAmountIn: by_amount_in,
      isDegrade: false
    }

    try {
      // 如果providersKeys为空，则不进行路由计算
      if (providersKeys.length === 0) {
        routerData = handleRouterData(false, by_amount_in, uuid, fromToken, toToken, {
          error: {
            code: AggregatorServerErrorCode.InsufficientLiquidity,
            msg: ''
          },
          amountIn: new BN(amount),
          amountOut: new BN('0'),
          byAmountIn: by_amount_in,
          routes: [],
          insufficientLiquidity: true
        })
        return routerData
      }

      const routerParams: FindRouterParams = {
        from: fromToken.coin_type,
        target: toToken.coin_type,
        amount: new BN(amount),
        byAmountIn: by_amount_in,
        depth: 3,
        splitAlgorithm: undefined,
        splitFactor: undefined,
        splitCount: undefined
        // providers: providersKeys
      }

      if (!options?.isAllProviders) {
        routerParams['providers'] = providersKeys
      }

      console.log('🚀 ~ file: useFindBestRouting.ts:26 ~ findBestRouters ~ routerParams:', routerParams)

      const routerRes = await aggregatorSDK.findRouters(routerParams)

      console.log('🚀 ~ file: useFindBestRouting.ts:145 ~ findBestRouters ~ routerRes:', {
        routerRes
      })

      if (routerRes && isDisableDegrade(routerRes)) {
        // 流动性不足
        routerData = handleRouterData(false, by_amount_in, uuid, fromToken, toToken, routerRes)
      } else {
        if (!routerRes || routerRes?.paths?.length === 0) {
          throw Error('not find router')
        }
        routerData = handleRouterData(false, by_amount_in, uuid, fromToken, toToken, routerRes)
      }
    } catch (error) {
      //走降级
      try {
        console.log('🚀 ~ file: useFindBestRouting.ts:105 ~ findRouters ~ error:', error)

        const pools = await getSwapPoolAddress(fromToken, toToken)
        if (pools.length === 0) {
          const data: RouterData = {
            amountIn: new BN('0'),
            amountOut: new BN('0'),
            byAmountIn: by_amount_in,
            routes: [],
            insufficientLiquidity: true,
            error: {
              code: AggregatorServerErrorCode.NoRouter,
              msg: ''
            }
          }
          routerData = handleRouterData(true, by_amount_in, uuid, fromToken, toToken, data)
          return routerData
        }

        const routerParams: SwapInPoolsParams = {
          from: fromToken.coin_type,
          target: toToken.coin_type,
          amount: new BN(amount),
          byAmountIn: by_amount_in,
          pools
        }

        console.log('🚀 ~ file: useFindBestRouting.ts:115 ~ findRouters ~ routerParams:', routerParams)

        const res = await aggregatorSDK.swapInPools(routerParams)
        console.log('🚀 ~ findBestRouters ~ swapInPools res:', res)

        if (!res || !res.routeData) {
          routerData = handleRouterData(true, by_amount_in, uuid, fromToken, toToken)
        } else {
          if (by_amount_in) {
            res.routeData.amountIn = new BN(amount)
          } else {
            res.routeData.amountOut = new BN(amount)
          }
          return handleRouterData(true, by_amount_in, uuid, fromToken, toToken, res.routeData)
        }
      } catch (error) {
        console.log('🚀 ~ file: useFindBestRouting.ts:120 ~ swapInPools ~  error:', error)
        routerData = {
          uuid,
          byAmountIn: by_amount_in,
          isDegrade: true,
          errorCode: AggregatorServerErrorCode.NoRouter
        }
      }
    }

    return routerData
  }

  const handleRouterData = (isDegrade: boolean, by_amount_in: boolean, uuid: string, fromToken: Token, toToken: Token, res?: RouterData) => {
    console.log('🚀 ~ file: useSwap.ts:166 ~ handleRouterData ~ res:', {
      isDegrade,
      routerData: res
    })
    if (res) {
      const isError = res.error !== undefined

      const fromAmountUi = bnToAmount(res.amountIn.toString(), fromToken.decimals)
      const toAmountUi = bnToAmount(res.amountOut.toString(), toToken.decimals)

      const result: SwapRouterData = {
        routerData: isError ? undefined : res,
        fromAmountUi: isError ? (by_amount_in ? fromAmountUi : '') : fromAmountUi,
        toAmountUi: isError ? (by_amount_in ? '' : toAmountUi) : toAmountUi,
        uuid,
        byAmountIn: by_amount_in,
        isDegrade,
        errorCode: res.error?.code
      }

      return result
    } else {
      const result: SwapRouterData = {
        uuid,
        byAmountIn: by_amount_in,
        isDegrade
      }

      return result
    }
  }
  return {
    findBestRouters,
    checkProvidersKeys
  }
}
