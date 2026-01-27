import useGlobalStore from '@/store/common/global'
import { useSdk } from '@cetus/sdk-factory'
import { Chain, CrossSwapPlatform, CrossSwapRouter, CrossSwapToken, EstimateQuoteOptions } from '@cetusprotocol/cross-swap-sdk'

/**
 * 获取跨链交易路由
 * @param platform 平台
 * @returns 交易路由数据
 */
export const useCrossFindRouter = (platform: CrossSwapPlatform) => {
  const crossSwapSdk = useSdk('crossSwap')
  const { crossSwapSlippage } = useGlobalStore()

  /**
   * 获取跨链交易路由
   * @param fromAmount 源链数量
   * @param fromChain 源链
   * @param fromToken 源链代币
   * @param toChain 目标链
   * @param toToken 目标链代币
   * @param from_address 源链地址
   * @param to_address 目标链地址
   * @returns 交易路由数据
   */
  const findRouter = async (
    fromAmount: string,
    fromChain: Chain,
    fromToken: CrossSwapToken,
    toChain: Chain,
    toToken: CrossSwapToken,
    from_address?: string,
    to_address?: string
  ): Promise<CrossSwapRouter> => {
    const options: EstimateQuoteOptions = {
      amount: fromAmount,
      from_token: fromToken.address,
      to_token: toToken.address,
      from_chain_id: fromChain!.id,
      to_chain_id: toChain!.id,
      slippage: Number(crossSwapSlippage)
    }

    if (platform === CrossSwapPlatform.LI_FI) {
      options.lifi_configs = {
        from_address,
        to_address
      }
    }

    const res = await crossSwapSdk!.estimateQuote(platform, options)
    console.log('🚀🚀🚀 ~ findRouter ~ res:', res)
    return res
  }

  return {
    findRouter
  }
}
