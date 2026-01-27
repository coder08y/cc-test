import { useFindBestRouting } from '@/hooks/swap/useFindBestRouting'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import useSwapConfigStore from '@/store/swap/swapConfig'
import { useTokenSelect } from '@cetus/design'
import { useDebounceFunction } from '@cetus/hooks'
import useTokenStore from '@cetus/stores/src/token'
import { amountToBN } from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'

export default function useMarginPoolsSwap(marginPool: any) {
  const { verifiedTokenMap } = useTokenStore()
  const { sortWithTokenList } = useTokenSelect()

  const isAutoSwap = useDeepBookMarginPoolStore(state => state.isAutoSwap)
  const inputValue = useDeepBookMarginPoolStore(state => state.inputValue)
  const setRouterData = useDeepBookMarginPoolStore(state => state.setRouterData)
  const toToken = useDeepBookMarginPoolStore(state => state.toToken)
  const userInfo = useDeepBookMarginPoolStore(state => state.userInfo)

  const { providersSwitchStates } = useSwapConfigStore()
  const { findBestRouters, checkProvidersKeys } = useFindBestRouting()
  const [findRouterLoading, setFindRouterLoading] = useState<boolean>(false)
  const [uuid, setUuid] = useState<string>('')

  const currentPoolInfo = userInfo[marginPool?.objectId]

  const balance = useMemo(() => {
    return currentPoolInfo?.userSupplied
  }, [currentPoolInfo?.userSupplied])

  const uuidRef = useRef<string>('')
  useEffect(() => {
    uuidRef.current = uuid
  }, [uuid])

  useEffect(() => {
    request(isAutoSwap, inputValue, toToken)
  }, [balance, inputValue, isAutoSwap, inputValue, toToken])

  const request = (isAutoSwap: boolean, inputValue: any, toToken: any) => {
    console.log('🚀 ~ request ~ isAutoSwap:', toToken, inputValue, isAutoSwap)
    if (!isAutoSwap || !toToken || !+inputValue || !balance || d(balance).lt(inputValue)) {
      setFindRouterLoading(false)
      setRouterData(undefined)
      setUuid('')
      return
    }
    setFindRouterLoading(true)
    const uuid = v4()
    setUuid(uuid)
    debouncedFindRouters(inputValue, toToken, uuid)
  }

  const canAutoRefresh = isAutoSwap && !!inputValue && Number(inputValue) > 0 && !!toToken && !!marginPool?.tokenInfo

  useEffect(() => {
    if (!canAutoRefresh) return

    const interval = setInterval(() => {
      request(isAutoSwap, inputValue, toToken)
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [isAutoSwap, inputValue, toToken, marginPool?.tokenInfo])

  const findRouters = async (amount: string, toToken: any, uuid: string) => {
    const fromToken = marginPool?.tokenInfo

    const formatAmount = amountToBN(amount, fromToken.decimals)

    const providersKeys = Object.entries(providersSwitchStates)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key)

    const checkProvidersKeysRes = await checkProvidersKeys(providersKeys as string[])

    const result = await findBestRouters({
      fromToken: fromToken,
      toToken,
      amount: formatAmount.toString(),
      providersKeys: checkProvidersKeysRes,
      by_amount_in: true,
      uuid,
      isAllProviders: false
    })

    setFindRouterLoading(false)

    if (uuidRef.current === uuid) {
      console.log('🚀 ~ findRouters ~ result:', result)
      setRouterData(result)
    }
  }
  const debouncedFindRouters = useDebounceFunction(findRouters, 500)

  const targetTokenList = useMemo(() => {
    const list = [...Array.from(verifiedTokenMap.values()).filter(token => token.is_merge_target && Number(token.is_merge_target) > 0)]
    return sortWithTokenList(list, '')
  }, [verifiedTokenMap])

  const whiteTokenList = useMemo(() => {
    return targetTokenList
  }, [targetTokenList])

  const tokenList = useMemo(() => {
    if (whiteTokenList && whiteTokenList.length > 0) {
      return sortWithTokenList(whiteTokenList, '').filter(item => fixCoinType(item?.coin_type) !== fixCoinType(marginPool?.tokenInfo?.coin_type))
    } else {
      return sortWithTokenList(Array.from(verifiedTokenMap?.values()), '').filter(
        item => fixCoinType(item?.coin_type) !== fixCoinType(marginPool?.tokenInfo?.coin_type)
      )
    }
  }, [whiteTokenList, verifiedTokenMap])

  const reCalculateRouteData = () => {}

  return {
    tokenList,
    reCalculateRouteData,
    findRouterLoading
  }
}
