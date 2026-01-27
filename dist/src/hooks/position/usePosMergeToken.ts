import { FreshProgressRef } from '@/components/swap/FreshProgressV2'
import useSwapConfigStore from '@/store/swap/swapConfig'
import { useTokenSelect } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenStore from '@cetus/stores/src/token'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import useDebounceEffect from 'ahooks/lib/useDebounceEffect'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import { useFindMergeRouter } from '../merge-swap/useFindMergeRouter'
import { useMergeSwapPrice } from '../merge-swap/useMergeSwapHelper'

export function usePosMergeToken(fromTokenList: any, toToken: Token, fromAmountObj: any) {
  const { currentAccount } = useAccountStore()
  const { providersSwitchStates } = useSwapConfigStore()
  const { findRouter: findMergeRouter } = useFindMergeRouter()
  const [toAmount, setToAmount] = useState('')
  const [mergeSwapQuote, setMergeSwapQuote] = useState<any>(undefined)
  const [findRouterLoading, setFindRouterLoading] = useState(true)
  const { sortWithTokenList } = useTokenSelect()

  const uuidRef = useRef<string>('')
  const { getTokenAmountValue, fetchTokenPrices } = useTokenPrice()
  const progressRef = useRef<FreshProgressRef>(null)
  const { verifiedTokenMap } = useTokenStore(state => ({ verifiedTokenMap: state.verifiedTokenMap }))
  const { handleTokenPrices } = useMergeSwapPrice(fromTokenList, toToken)

  const handleReset = () => {
    progressRef.current?.reset()
  }

  useEffect(() => {
    fetchTokenPrices([envConfigs.sui_coin.coin_type])
  }, [])

  const targetTokenList = useMemo(() => {
    const list = [...Array.from(verifiedTokenMap.values()).filter(token => token.is_merge_target && Number(token.is_merge_target) > 0)]
    return sortWithTokenList(list, '')
  }, [verifiedTokenMap])
  /**
   * 获取交易路由
   */
  const findRouter = async (fromTokenList: Token[], toToken: Token, fromAmountObj: Record<string, string>, uuid: string) => {
    if (!fromTokenList?.length) {
      setMergeSwapQuote(undefined)
      return
    }
    setFindRouterLoading(true)
    handleReset()

    if (uuidRef.current === uuid) {
      try {
        const quote = await findMergeRouter(fromTokenList, toToken, fromAmountObj, uuid)
        console.log('🚀 ~ findRouter ~ quote:', fromTokenList, fromAmountObj, quote)
        if (uuidRef.current === uuid) {
          setMergeSwapQuote(quote)
        }
      } catch (error) {
        console.log('findRouter error', error)
        setMergeSwapQuote(undefined)
      } finally {
        setFindRouterLoading(false)
      }
    }
  }

  const resetData = () => {
    uuidRef.current = ''
    setToAmount('')
    setFindRouterLoading(false)
    setMergeSwapQuote(undefined)
  }

  /**
   * 输入数量监听
   */
  useDebounceEffect(
    () => {
      if (toToken && currentAccount) {
        const uuid = v4()
        uuidRef.current = uuid
        findRouter(fromTokenList, toToken, fromAmountObj, uuid)
      } else {
        resetData()
      }
    },
    [fromTokenList, fromAmountObj, toToken, currentAccount, providersSwitchStates],
    { wait: 300 }
  )

  const reCalculateRouteData = () => {
    if (toToken) {
      const uuid = v4()
      uuidRef.current = uuid
      findRouter(fromTokenList, toToken, fromAmountObj, uuid)
    } else {
      resetData()
    }
  }

  // 输出总价值
  const totalOutValue = useMemo(() => {
    console.log('🚀 ~ usePosMergeToken ~ mergeSwapQuote:', mergeSwapQuote)
    if (mergeSwapQuote?.totalAmountOut) {
      return getTokenAmountValue(mergeSwapQuote.toToken.coin_type, mergeSwapQuote.totalAmountOutDisplay)
    }
    return ''
  }, [mergeSwapQuote])

  // 刷新
  const handleRefresh = () => {
    reCalculateRouteData()
    handleTokenPrices(fromTokenList, toToken)
  }

  return {
    resetData,
    toAmount,
    mergeSwapQuote,
    findRouterLoading,
    totalOutValue,
    reCalculateRouteData,
    handleRefresh,
    progressRef,
    targetTokenList
  }
}
