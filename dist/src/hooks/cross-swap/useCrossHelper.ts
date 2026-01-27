import { mayanChainConfig } from '@/config/cross-swap/chain'
import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { ChainAddresses, CrossSwapHistoryItem, RouteStatus } from '@/types/cross_swap'
import { useSdk } from '@cetus/sdk-factory'
import { Token } from '@cetus/types'
import { placeholderImg } from '@cetus/ui-kit/src/components/SingleCoinImage'
import { formatNumber, isSuiCoin } from '@cetus/utils'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import {
  Chain,
  ChainId,
  CrossSwapFee,
  CrossSwapPlatform,
  CrossSwapQuote,
  CrossSwapToken,
  getAccumulatedLifiFeeCostsFromArrays,
  parseCrossTokenFromLiFi,
  wChainId
} from '@cetusprotocol/cross-swap-sdk'
import { ChainType, ExtendedTransactionInfo, FullStatusData, ProcessStatus, RouteExtended, Step } from '@lifi/sdk'
import { useMemo, useRef } from 'react'

/**
 * 获取跨链交易选项
 * @param platform 平台
 * @returns 跨链交易选项
 */
export const useGetCrossSwapOptions = (platform: CrossSwapPlatform) => {
  const { crossSwapOptions } = useCrossSwapStore()

  // 使用 useRef 来缓存 token 引用，避免不必要的重新计算
  const fromTokenRef = useRef<CrossSwapToken | undefined>()
  const toTokenRef = useRef<CrossSwapToken | undefined>()
  const fromChainRef = useRef<Chain | undefined>()
  const toChainRef = useRef<Chain | undefined>()

  const currentOptions = crossSwapOptions[platform]

  // 只有当 token 的关键属性真正变化时才更新引用
  if (currentOptions.fromToken) {
    if (
      !fromTokenRef.current ||
      fromTokenRef.current.address !== currentOptions.fromToken.address ||
      fromTokenRef.current.chain_id !== currentOptions.fromToken.chain_id ||
      fromTokenRef.current.symbol !== currentOptions.fromToken.symbol
    ) {
      fromTokenRef.current = currentOptions.fromToken
    }
  } else {
    fromTokenRef.current = undefined
  }

  if (currentOptions.toToken) {
    if (
      !toTokenRef.current ||
      toTokenRef.current.address !== currentOptions.toToken.address ||
      toTokenRef.current.chain_id !== currentOptions.toToken.chain_id ||
      toTokenRef.current.symbol !== currentOptions.toToken.symbol
    ) {
      toTokenRef.current = currentOptions.toToken
    }
  } else {
    toTokenRef.current = undefined
  }

  // 对于 chain，比较 id
  if (currentOptions.fromChain) {
    if (!fromChainRef.current || fromChainRef.current.id !== currentOptions.fromChain.id) {
      fromChainRef.current = currentOptions.fromChain
    }
  } else {
    fromChainRef.current = undefined
  }

  if (currentOptions.toChain) {
    if (!toChainRef.current || toChainRef.current.id !== currentOptions.toChain.id) {
      toChainRef.current = currentOptions.toChain
    }
  } else {
    toChainRef.current = undefined
  }

  return {
    fromChain: fromChainRef.current,
    toChain: toChainRef.current,
    fromToken: fromTokenRef.current,
    toToken: toTokenRef.current
  }
}

/**
 * 获取跨链交易错误提示
 * @param routers 交易路由数据
 * @param platform 平台
 * @param fromToken 源链代币
 * @param quote 交易报价
 * @param fromTokenBalance 源链代币余额
 * @returns 错误提示
 */
export const useGetCrossSwapErrorTips = (
  routers: any,
  platform: CrossSwapPlatform,
  fromToken?: CrossSwapToken,
  quote?: CrossSwapQuote,
  fromTokenBalance?: string
) => {
  const showErrorTips = useMemo(() => {
    if (routers) {
      if (platform === CrossSwapPlatform.LI_FI) {
        if (routers.error) {
          return 'Reasons for no route could be: low liquidity, small amount, high gas cost, or no available route.'
        }
      } else if (platform === CrossSwapPlatform.MAYAN) {
        // console.log('showErrorTips routers', routers)
        // if (routers.error && routers.error.code === 'AMOUNT_TOO_SMALL') {
        //   return `Amount too low. Minimum accepted : ${routers.error.data.data?.minAmountIn} ${fromToken?.symbol}`
        // }
        if (routers.error && routers.error.message) {
          return routers.error?.message
        }
      }
      if (quote && quote.from_chain.native_token.address === fromToken?.address && fromToken && fromToken.price_usd && fromTokenBalance) {
        const gas_amount = d(quote.gas_cost_usd).div(fromToken.price_usd).toString()
        // 如果用户余额减去交易金额小于gas费用，则提示用户需要添加足够的gas费用
        if (d(fromTokenBalance).sub(quote.amount_in_formatted).lt(gas_amount)) {
          return `You don't have enough gas to complete the transaction. You need to add at least: ${formatNumber(gas_amount)} ${fromToken?.symbol} on ${quote?.from_chain.chain_name}`
        }
      }
    }

    return undefined
  }, [routers, platform, fromToken?.symbol, quote, fromTokenBalance])

  return {
    showErrorTips
  }
}

/**
 * 获取链地址
 * @param chain 链
 * @param isFrom 是否是源链
 * @param fallbackToOther 是否允许回退到另一方
 * @returns 链地址
 */
export function useGetChainAddress(chain?: Chain, isFrom = true, fallbackToOther = false) {
  const { fromAddressObj, toAddressObj } = useCrossSwapWalletStore()

  const chainAddress = useMemo(() => {
    if (!chain) return undefined

    const getAddressByChainType = (addressObj: ChainAddresses) => {
      switch (chain.type) {
        case ChainType.EVM:
          return addressObj.evmAddress
        case ChainType.SVM:
          return addressObj.svmAddress
        case ChainType.MVM:
          return addressObj.mvmAddress
        case ChainType.UTXO:
          return addressObj.utxoAddress
        default:
          return undefined
      }
    }

    const addressObj = isFrom ? fromAddressObj : toAddressObj
    let address = getAddressByChainType(addressObj)

    // 如果当前方向没有地址且允许回退到另一方
    if (!address && fallbackToOther) {
      const fallbackAddressObj = isFrom ? toAddressObj : fromAddressObj
      address = getAddressByChainType(fallbackAddressObj)
    }

    return address
  }, [chain?.type, chain?.id, isFrom, fallbackToOther, fromAddressObj, toAddressObj])

  return {
    // 优先返回手动输入地址，否则返回链地址
    address: chainAddress?.manual_address || chainAddress?.chain_address,
    isManualAddress: chainAddress?.manual_address !== undefined
  }
}

/**
 * 获取历史交易费用
 * @param item 历史交易数据
 * @returns 历史交易费用
 */
export function useGetHistoryFee(item: CrossSwapHistoryItem) {
  const fee = useMemo(() => {
    return getAccumulatedLifiFeeCostsFromArrays(item.feeCosts, item.gasCosts)
  }, [item])

  return {
    fee
  }
}

/**
 * 获取交易标签
 * @param tags 交易标签
 * @returns 交易标签
 */
export function useGetQuoteTag(tags: string[]) {
  const tag = useMemo(() => {
    if (tags?.includes('RECOMMENDED')) {
      return 'Best Return'
    }
    if (tags?.includes('FASTEST')) {
      return 'Fastest'
    }
    if (tags?.includes('CHEAPEST')) {
      return 'Gasless'
    }
    return undefined
  }, [tags])

  return {
    tag
  }
}

/**
 * 获取交易步骤标签
 * @param step 交易步骤
 * @param fromChain 源链
 * @param toChain 目标链
 * @returns 交易步骤标签
 */
export function useGetStepTypeLabel(step: Step, fromChain: Chain, toChain: Chain) {
  const label = useMemo(() => {
    const { toolDetails, type } = step
    if (type === 'cross') {
      return `Bridge from ${fromChain.chain_name} to ${toChain.chain_name} via ${toolDetails.name}`
    }
    return `Swap on ${fromChain.chain_name} via ${toolDetails.name}`
  }, [step.type, fromChain.chain_name, toChain.chain_name])

  return {
    label
  }
}

/**
 * 获取最新交易报价
 * @param originData 原始交易报价
 * @param newData 新交易报价
 * @returns 交易报价
 */
export function useGetPriceAcceptQuote(originData?: CrossSwapQuote, newData?: CrossSwapQuote) {
  const priceAcceptRouterData = useMemo(() => {
    if (newData && originData) {
      if (!d(originData.amount_out).eq(newData.amount_out || '0')) {
        return newData
      }

      return undefined
    }
    return undefined
  }, [newData, originData])

  return { priceAcceptRouterData }
}

/**
 * 获取交易显示时长
 * @param execution_duration 交易执行时长
 * @returns 交易显示时长
 */
export function useGetQuoteShowDuration(execution_duration?: number) {
  const quoteShowDuration = useMemo(() => {
    if (execution_duration) {
      return getQuoteShowDuration(execution_duration)
    }
    return ''
  }, [execution_duration])

  return { quoteShowDuration }
}

/**
 * 获取交易显示时长
 * @param execution_duration 交易执行时长
 * @returns 交易显示时长
 */
export const getQuoteShowDuration = (execution_duration: number) => {
  if (execution_duration < 60) {
    return `${Math.floor(execution_duration)}s`
  } else {
    return `${Math.floor(execution_duration / 60)}m`
  }
}

/**
 * 获取交易状态
 * @param route 交易路由
 * @returns 交易状态
 */
export const getRouteStatus = (route: RouteExtended): RouteStatus => {
  const isRouteDone = route.steps.every(step => step.execution?.status === 'DONE')
  if (isRouteDone) {
    return 'DONE'
  }
  const isRoutePartiallyDone = route.steps.some(step => step.execution?.process.some(process => process.substatus === 'PARTIAL'))
  if (isRoutePartiallyDone) {
    return 'PARTIAL'
  }
  const isRouteRefunded = route.steps.some(step => step.execution?.process.some(process => process.substatus === 'REFUNDED'))
  if (isRouteRefunded) {
    return 'REFUNDED'
  }
  const isRouteFailed = route.steps.some(step => step.execution?.status === 'FAILED')
  if (isRouteFailed) {
    return 'FAILED'
  }

  const isActionRequired = route.steps.some(step => step.execution?.status === 'ACTION_REQUIRED')
  if (isActionRequired) {
    return 'ACTION_REQUIRED'
  }

  return 'PENDING'
}

/**
 * 获取交易代币授权状态
 * @param route 交易路由
 * @returns 交易代币授权状态
 */
export const getTokenAllowanceStatus = (route: RouteExtended): ProcessStatus | undefined => {
  return route.steps
    .find(step => step.execution?.process.some(process => process.type === 'TOKEN_ALLOWANCE'))
    ?.execution?.process.find(process => process.type === 'TOKEN_ALLOWANCE')?.status
  return undefined
}

/**
 * 获取交易链接
 * @param tx 交易哈希
 * @param platform 平台
 * @returns 交易链接
 */
export const getRouteLink = (tx: string, platform: CrossSwapPlatform) => {
  if (platform === CrossSwapPlatform.LI_FI) {
    return `https://scan.li.fi/tx/${tx}`
  }
  return `https://explorer.mayan.finance/tx/${tx}`
}

/**
 * 获取交易源交易哈希
 * @param route 交易路由
 * @returns 交易源交易哈希
 */
export const getSourceTxHash = (route?: RouteExtended) => {
  return route?.steps[0].execution?.process.filter(process => process.type !== 'TOKEN_ALLOWANCE').find(process => process.txHash)?.txHash
}

/**
 * 从交易历史中构建交易路由
 * @param tx 交易历史
 * @param getChain 获取链
 * @returns 交易路由
 */
export const buildLifiRouteFromTxHistory = (tx: FullStatusData, getChain: (chainId: number) => Chain): CrossSwapHistoryItem => {
  const sending = tx.sending as ExtendedTransactionInfo
  const receiving = tx.receiving as ExtendedTransactionInfo

  if (!sending.token?.chainId || !receiving.token?.chainId) {
    throw new Error('Invalid transaction')
  }

  const sendingValue = sending.value ? BigInt(sending.value) : 0n
  const sendingFeeAmount = sending.gasToken.address === sending.token.address && sending.amount ? sendingValue - BigInt(sending.amount) : sendingValue
  const sendingFeeAmountFormatted = fromDecimalsAmount(sendingFeeAmount.toString(), sending.gasToken.decimals)

  const sendingFeeAmountUsd =
    sending.gasToken.priceUSD && sendingFeeAmount ? d(sendingFeeAmountFormatted).mul(sending.gasToken.priceUSD).toString() : '0'

  const fromChain = getChain(sending.chainId)
  const toChain = getChain(receiving.chainId)
  const gasChain = getChain(sending.gasToken.chainId)
  const gasToken: CrossSwapToken = parseCrossTokenFromLiFi(sending.gasToken, gasChain)
  // const feeCosts: CrossSwapFee[] | undefined = sendingFeeAmount
  //   ? [
  //       {
  //         amount: sendingFeeAmount.toString(),
  //         amount_formatted: sendingFeeAmountUsd,
  //         amountUSD: sendingFeeAmountUsd,
  //         token: gasToken
  //       }
  //     ]
  //   : []

  const fromToken: CrossSwapToken = parseCrossTokenFromLiFi(sending.token, fromChain)
  const toToken: CrossSwapToken = parseCrossTokenFromLiFi(receiving.token, toChain)

  if (isSuiCoin(fromToken.address)) {
    fromToken.logo_url = 'https://archive.cetus.zone/assets/image/sui/sui.png'
  }
  if (isSuiCoin(toToken.address)) {
    toToken.logo_url = 'https://archive.cetus.zone/assets/image/sui/sui.png'
  }

  const gasCosts: CrossSwapFee[] = [
    {
      amount: sending.gasAmount,
      amountUSD: sending.gasAmountUSD,
      token: gasToken,
      amount_formatted: fromDecimalsAmount(sending.gasAmount, gasToken.decimals).toString()
    }
  ]

  const info: CrossSwapHistoryItem = {
    status: tx.status,
    feeCosts: [],
    gasCosts,
    fromChain,
    toChain,
    fromToken,
    toToken,
    amountIn: sending.amount ? fromDecimalsAmount(sending.amount, fromToken.decimals).toString() : '0',
    amountOut: receiving.amount ? fromDecimalsAmount(receiving.amount, toToken.decimals).toString() : '0',
    source_address: (tx as FullStatusData).fromAddress,
    destination_address: (tx as FullStatusData).toAddress,
    tx_link: sending.txHash,
    send_time: sending.timestamp || 0
  }

  return info
}

/**
 * 从交易历史中构建交易路由
 * @param data 交易历史
 * @param getChain 获取链
 * @param getToken 获取代币
 * @returns 交易路由
 */
export const buildMayanRouteFromTxHistory = async (
  data: any,
  getChain: (chainId: number) => Chain,
  getToken: (chainId: ChainId, tokenAddress: string) => Promise<CrossSwapToken | undefined>
): Promise<CrossSwapHistoryItem> => {
  const fromChain = getChain(wChainId[data.fromTokenChain])
  const toChain = getChain(wChainId[data.toTokenChain])

  let fromToken: CrossSwapToken | undefined = await getToken(fromChain.id, data.fromTokenAddress)
  let toToken: CrossSwapToken | undefined = await getToken(toChain.id, data.toTokenAddress)

  if (toToken === undefined) {
    toToken = {
      address: data.toTokenAddress,
      chain_id: toChain.id,
      decimals: 0,
      symbol: data.toTokenSymbol,
      name: data.toTokenSymbol,
      type: fromChain.type,
      logo_url: data.toTokenLogoUri || placeholderImg
    }
  }
  if (fromToken === undefined) {
    fromToken = {
      address: data.fromTokenAddress,
      chain_id: fromChain.id,
      decimals: 0,
      symbol: data.fromTokenSymbol,
      name: data.fromTokenSymbol,
      type: fromChain.type,
      logo_url: data.fromTokenLogoUri || placeholderImg
    }
  }
  console.log('🚀🚀🚀 ~ buildMayanRouteFromTxHistory ~ toToken:', toToken)
  const gasCosts: CrossSwapFee[] = [
    {
      amount: data.clientRelayerFeeSuccess ? data.clientRelayerFeeSuccess : '0',
      amountUSD: data.clientRelayerFeeSuccess ? data.clientRelayerFeeSuccess : '0',
      token: {} as CrossSwapToken,
      amount_formatted: data.clientRelayerFeeSuccess ? data.clientRelayerFeeSuccess : '0'
    }
  ]

  const info: CrossSwapHistoryItem = {
    status: data.clientStatus === 'COMPLETED' ? 'DONE' : data.clientStatus === 'REFUNDED' ? 'REFUNDED' : 'PENDING',
    feeCosts: [],
    gasCosts,
    fromChain,
    toChain,
    fromToken,
    toToken,
    amountIn: data.fromAmount,
    amountOut: data.toAmount,
    source_address: data.trader,
    destination_address: data.destAddress,
    tx_link: data.orderId,
    send_time: data.initiatedAt ? Math.floor(new Date(data.initiatedAt).getTime() / 1000) : 0
  }
  return info
}

/**
 * 获取链链接
 * @param id 链ID
 * @param platform 平台
 * @param chainId 链ID
 * @param type 链接类型
 * @returns 链链接
 */
export const useGetChainLink = (id: string, platform: CrossSwapPlatform, chainId: ChainId, type: 'address' | 'tx' | 'coin') => {
  const sdk = useSdk('crossSwap')
  const chainLink = useMemo(() => {
    const chainInfo = sdk?.getChain(platform, chainId)
    if (!chainInfo) return ''
    return getChainLink(id, chainInfo, type)
  }, [id, platform, chainId, type])
  return {
    chainLink
  }
}

/**
 * 获取链链接
 * @param id 链ID
 * @param chain 链
 * @param type 链接类型
 * @returns 链链接
 */
export const getChainLink = (id: string, chain: Chain, type: 'address' | 'tx' | 'coin') => {
  if (type === 'address' || type === 'coin') {
    if (chain.type === ChainType.SVM) {
      if (id === '0x0000000000000000000000000000000000000000') {
        return `${chain.block_explorer}/address/11111111111111111111111111111111`
      }
      return `${chain.block_explorer}/address/${id}`
    }
    if (chain.type === ChainType.MVM) {
      if (type === 'coin') {
        return `${chain.block_explorer}coin/${id}`
      }
      return `${chain.block_explorer}account/${id}`
    }
    if (chain.type === ChainType.EVM) {
      return `${chain.block_explorer}/address/${id}`
    }
    if (chain.type === ChainType.UTXO) {
      return `${chain.block_explorer}/address/${id}`
    }
  } else if (type === 'tx') {
    if (chain.type === ChainType.SVM) {
      return `${chain.block_explorer}/tx/${id}`
    }
    if (chain.type === ChainType.MVM) {
      return `${chain.block_explorer}/txblock/${id}`
    }
    if (chain.type === ChainType.EVM) {
      return `${chain.block_explorer}/tx/${id}`
    }
    if (chain.type === ChainType.UTXO) {
      return `${chain.block_explorer}/tx/${id}`
    }
  }

  return ''
}

/**
 * 获取支持的链列表
 * @param platform 平台
 * @returns 支持的链列表
 */
export const useGetSupportedChainList = (platform: CrossSwapPlatform) => {
  const crossSwapSdk = useSdk('crossSwap')
  const chainList = useMemo(() => {
    if (crossSwapSdk) {
      const chainList = crossSwapSdk.getSupportedChains(platform)
      if (platform === CrossSwapPlatform.MAYAN) {
        chainList.forEach(chain => {
          chain.logo_url = mayanChainConfig[chain.id]?.logo_url || chain.logo_url
        })
      }
      return chainList
    }
    return []
  }, [platform, crossSwapSdk])
  return {
    chainList
  }
}

/**
 * 判断是否是SUI链
 * @param chain 链
 * @returns 是否是SUI链
 */
export const isSuiChain = (chain: Chain): boolean => {
  return chain.id === ChainId.SUI_LI_FI || chain.id === ChainId.SUI_MAYAN
}

export const parseFromMayanWithSui = (crossToken: CrossSwapToken, token?: Token) => {
  if (!token) {
    return crossToken
  }
  console.log('🚀🚀🚀 ~ parseFromMayanWithSui ~ token:', {
    token,
    crossToken
  })
  crossToken.logo_url = token.logo_url || crossToken.logo_url
  crossToken.name = token.name || crossToken.name
  crossToken.symbol = token.symbol || crossToken.symbol
  crossToken.decimals = token.decimals || crossToken.decimals
  crossToken.address = token.address || crossToken.address
  return crossToken
}
