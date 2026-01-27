import useSwapConfigStore from '@/store/swap/swapConfig'
import useClmmSDKStore from '@cetus/stores/src/useClmmSDKStore'
import { Token } from '@cetus/types'
import { BuildFastMergeSwapParams, MergeSwapParams, MergeSwapRouterData } from '@cetusprotocol/aggregator-sdk'
import { toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import BN from 'bn.js'
import { aggregatorPartner } from '../swap/useSwap'
import { handleMergeSwapQuote } from './useMergeSwapHelper'

export function useFindMergeRouter() {
  const { aggregatorSDK } = useClmmSDKStore()
  const { providersSwitchStates } = useSwapConfigStore()

  /**
   * 获取交易路由
   */
  const findRouter = async (fromTokenList: Token[], toToken: Token, fromAmountObj: Record<string, string>, uuid: string) => {
    console.log('🚀 ~ findRouter ~ fromAmountObj:', fromAmountObj)
    const mergeSwapParams: MergeSwapParams = {
      target: toToken.coin_type, // USDC
      byAmountIn: true,
      depth: 3,
      providers: Object.entries(providersSwitchStates)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key),
      froms: fromTokenList.map(token => ({
        coinType: token.coin_type,
        amount: new BN(toDecimalsAmount(fromAmountObj[token.coin_type], token.decimals))
      }))
    }

    try {
      console.log('findRouter params', mergeSwapParams)
      const routerResult = await aggregatorSDK.findMergeSwapRouters(mergeSwapParams)

      const quote = handleMergeSwapQuote(uuid, toToken, fromTokenList, fromAmountObj, routerResult)
      console.log('findRouter result', {
        routerResult,
        quote,
        uuid
      })
      return quote
    } catch (error) {
      console.log('findRouter error', error)
      return handleMergeSwapQuote(uuid, toToken, fromTokenList, fromAmountObj, null)
    }
  }

  /**
   * 构建快速合并交易
   * @param quote 交易路由
   * @param mergeSwapSlippage 合并交易滑点
   * @returns 交易
   */
  const buildFastMergeSwapTxb = (quote: MergeSwapRouterData, mergeSwapSlippage: number) => {
    const tx = new Transaction()
    const sdkParams: BuildFastMergeSwapParams = {
      router: quote!,
      slippage: Number(mergeSwapSlippage),
      txb: tx,
      partner: aggregatorPartner
    }

    const txb = async () => {
      await aggregatorSDK!.fastMergeSwap(sdkParams)
      return tx
    }

    return txb
  }

  return {
    findRouter,
    buildFastMergeSwapTxb
  }
}
