import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import { d } from '@cetusprotocol/common-sdk'
import { Chain, CrossSwapPlatform, CrossSwapRouter, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'

export function useCrossButtonStatus(
  platform: CrossSwapPlatform,
  confirmPriceDiff: boolean,
  showPriceImpactWarn: boolean,
  fromChain?: Chain,
  fromToken?: CrossSwapToken,
  fromChainAddress?: string,
  toChainAddress?: string,
  fromTokenBalance?: string,
  routers?: CrossSwapRouter
) {
  const { fromCoinAmount } = useCrossSwapStore()
  const chainId = useChainId()
  const btnStatus = useMemo(() => {
    const info: {
      btnText: string
      btnDisabled: boolean
      action: 'swap' | 'approve' | 'connect' | 'connect_from' | 'connect_to'
    } = {
      btnText: 'Swap',
      btnDisabled: true,
      action: 'swap'
    }

    // 源链钱包未连接
    if (!fromChainAddress) {
      info.btnText = 'Connect Source Wallet'
      info.action = 'connect_from'
      info.btnDisabled = false
      return info
    }

    // 目标链钱包未连接
    if (!toChainAddress) {
      info.btnText = 'Connect Destination Wallet'
      info.action = 'connect_to'
      info.btnDisabled = false
      return info
    }
    console.log('🚀🚀🚀 ~ btnStatus ~ fromCoinAmount:', fromCoinAmount)
    //用户没输入数量
    if (!+fromCoinAmount) {
      info.btnDisabled = true
      return info
    }

    // 判断余额
    if (!fromTokenBalance || !+fromTokenBalance || d(fromCoinAmount).gt(fromTokenBalance)) {
      info.btnText = `Insufficient ${fromToken?.symbol} Balance`
      info.btnDisabled = true
      return info
    }
    // 判断路由
    if (routers === undefined) {
      info.btnDisabled = true
      return info
    }
    // 判断路由是否存在
    if (routers.error || routers.quotes?.length === 0) {
      info.btnText = 'No Available Route'
      info.btnDisabled = true
      return info
    }

    // 判断当前链是否支持
    if (fromChain?.type === ChainType.EVM && chainId !== fromChain?.id) {
      info.btnText = 'Switch Network'
      info.action = 'connect_from'
      info.btnDisabled = false
      return info
    }

    // 判断价格差是否大于10%
    if (showPriceImpactWarn) {
      if (!confirmPriceDiff) {
        info.btnDisabled = true
        return info
      }
    }

    info.btnDisabled = false
    return info
  }, [
    confirmPriceDiff,
    showPriceImpactWarn,
    fromChainAddress,
    toChainAddress,
    chainId,
    fromCoinAmount,
    fromTokenBalance,
    fromToken,
    platform,
    routers
  ])

  return {
    btnText: btnStatus.btnText,
    btnDisabled: btnStatus.btnDisabled,
    action: btnStatus.action
  }
}
