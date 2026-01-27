import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import { getDefaultChainOptions } from '@/utils/cross-swap'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useSdk } from '@cetus/sdk-factory/src/useSdk'
import { Chain, CrossSwapPlatform, CrossSwapToken, isEqualTokenAddress } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isSuiChain, useGetCrossSwapOptions, useGetSupportedChainList } from './useCrossHelper'
import { useCrossToken } from './useCrossToken'

export default function useCrossSwapUrlSync(platform: CrossSwapPlatform) {
  const crossSwapSdk = useSdk('crossSwap')
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = useQueryParams()
  const fromChainParams = queryParams.fromChain
  const toChainParams = queryParams.toChain
  const fromTokenParams = queryParams.fromToken
  const toTokenParams = queryParams.toToken

  const { getCrossToken } = useCrossToken()
  const { setCrossSwapOptions } = useCrossSwapStore()
  const { chainList } = useGetSupportedChainList(platform)

  const { fromChain, toChain, fromToken, toToken } = useGetCrossSwapOptions(platform)

  const handleNavToken = (
    isFrom: boolean,
    navChain: Chain,
    defaultToken: CrossSwapToken,
    currentToken?: CrossSwapToken,
    navTokenAddress?: string
  ) => {
    if (navTokenAddress) {
      let findToken: CrossSwapToken | undefined
      // 如果存在当前token
      if (currentToken) {
        // 判断是否和当前保持token一致
        if (
          navChain.id === currentToken.chain_id &&
          isEqualTokenAddress(navTokenAddress, currentToken.address, currentToken?.type === ChainType.MVM)
        ) {
          findToken = { ...currentToken }
        } else {
          if (
            defaultToken.chain_id === navChain.id &&
            isEqualTokenAddress(defaultToken.address, navTokenAddress, defaultToken.type === ChainType.MVM)
          ) {
            findToken = { ...defaultToken }
          }
        }
      } else {
        // 如果当前不存在token，则判断是否和默认token一致
        if (
          defaultToken.chain_id === navChain.id &&
          isEqualTokenAddress(defaultToken.address, navTokenAddress, defaultToken.type === ChainType.MVM)
        ) {
          findToken = { ...defaultToken }
        }
      }
      if (findToken) {
        isFrom
          ? setCrossSwapOptions(platform, { fromChain: { ...navChain }, fromToken: findToken })
          : setCrossSwapOptions(platform, { toChain: { ...navChain }, toToken: findToken })
      } else {
        // 如果找不到token，则获取token
        getCrossToken(platform, navChain.id, fromTokenParams).then(token => {
          isFrom
            ? setCrossSwapOptions(platform, { fromChain: { ...navChain }, fromToken: token })
            : setCrossSwapOptions(platform, { toChain: { ...navChain }, toToken: token })
        })
      }
    } else {
      isFrom
        ? setCrossSwapOptions(platform, { fromChain: { ...navChain }, fromToken: undefined })
        : setCrossSwapOptions(platform, { toChain: { ...navChain }, toToken: undefined })
    }
  }

  /**
   * 根据url参数，设置当前选择的链和token相关基础信息
   */
  useEffect(() => {
    if (crossSwapSdk === null || !chainList || chainList.length === 0 || !fromChainParams || !toChainParams) return

    const defaultOptions = getDefaultChainOptions(platform)
    const defaultFromToken = defaultOptions.fromToken!
    const defaultToToken = defaultOptions.toToken!
    const defaultToChain = defaultOptions.toChain!

    let navFromChain = chainList?.find(chain => chain.id.toString() === fromChainParams)
    let navTavToChain = chainList?.find(chain => chain.id.toString() === toChainParams)

    if (navFromChain) {
      handleNavToken(true, navFromChain, defaultFromToken, fromToken, fromTokenParams)
    }

    if (navTavToChain) {
      handleNavToken(false, navTavToChain, defaultToToken, toToken, toTokenParams)
    }

    if (navFromChain && navTavToChain) {
      const isFromChainSui = isSuiChain(navFromChain)
      const isToChainSui = isSuiChain(navTavToChain)

      // 如果两边都不是 SUI 链，则修改 to 方向为 SUI 链
      if (!isFromChainSui && !isToChainSui) {
        setCrossSwapOptions(platform, { toChain: { ...defaultToChain }, toToken: { ...defaultToToken } })
      }
    }
  }, [fromChainParams, toChainParams, fromTokenParams, toTokenParams])

  /**
   * 监听fromChain，toChain，fromToken，toToken值的改变，然后重新更新游览器的url
   */
  useEffect(() => {
    const currentSearchParams = new URLSearchParams(location.search)
    const newSearchParams = new URLSearchParams()

    // 保留现有的其他参数
    currentSearchParams.forEach((value, key) => {
      if (!['fromChain', 'toChain', 'fromToken', 'toToken'].includes(key)) {
        newSearchParams.set(key, value)
      }
    })

    // 更新链和token参数
    if (fromChain) {
      newSearchParams.set('fromChain', fromChain.id.toString())
    }
    if (toChain) {
      newSearchParams.set('toChain', toChain.id.toString())
    }
    if (fromToken) {
      newSearchParams.set('fromToken', fromToken.address)
    }
    if (toToken) {
      newSearchParams.set('toToken', toToken.address)
    }

    const newSearch = newSearchParams.toString()
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`

    const currentParams = new URLSearchParams(location.search)

    // 检查关键参数是否真的发生了变化
    const hasChanged =
      currentParams.get('fromChain') !== (fromChain?.id.toString() || null) ||
      currentParams.get('toChain') !== (toChain?.id.toString() || null) ||
      currentParams.get('fromToken') !== (fromToken?.address || null) ||
      currentParams.get('toToken') !== (toToken?.address || null)

    // 只有当关键参数确实发生变化时才更新URL
    console.log('🚀 ~ useEffect ~ hasChanged:', hasChanged, newUrl)

    if (hasChanged) {
      navigate(newUrl)
    }
  }, [fromChain?.id, toChain?.id, fromToken?.address, toToken?.address])
}
