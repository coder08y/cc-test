import useTransaction from '@/hooks/common/useTransaction'
import useGlobalStore from '@/store/common/global'
import useProListStore from '@/store/pro/list'
import { useGlobalToast } from '@cetus/design'
import { useAccountBalance } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useClmmSDKStore from '@cetus/stores/src/useClmmSDKStore'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import { addComma, amountToBN, bnToAmount, d, getBalanceChanges } from '@cetus/utils'
import { getAllProviders } from '@cetusprotocol/aggregator-sdk'
import { Transaction } from '@mysten/sui/transactions'

export default function useQuickBuy() {
  const { aggregatorSDK } = useClmmSDKStore()
  const { signAndExecuteTransaction, transactionConfirmation, handleError } = useTransaction()
  const { setQuickLoading, quickLoading, setQuickLoadingCoin, quickLoadingCoin } = useProListStore()
  const { slippage } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { getBalanceInfoFromCache } = useGetTokenBalance()
  const { failedTsToast } = useGlobalToast()

  const quickBuy = async ({ fromCoin, targetCoin, amount }: { fromCoin: Token; targetCoin: Token; amount: string }) => {
    try {
      setQuickLoadingCoin(targetCoin?.coin_type)
      setQuickLoading(true)

      const balanceInfo = getBalanceInfoFromCache(fromCoin)
      const amountBn = amountToBN(amount, fromCoin?.decimals)

      if (d(balanceInfo?.balance).lt(amountBn.toString())) {
        const info: ToastType = {
          linkLabel: '',
          getShowInfo: () => {
            const info: CommonTypeInfo = {
              toastTitleText: `Quick buy failed. \n Insufficient ${fromCoin?.symbol}. You have ${addComma(balanceInfo?.balanceFormat || '0')} ${fromCoin?.symbol}.`,
              showToolsDescription: false
            }
            return info
          }
        }
        failedTsToast(info)
        setQuickLoading(false)
        setQuickLoadingCoin('')
        return
      }

      const providers = getAllProviders()

      const router = await aggregatorSDK.findRouters({
        from: fromCoin?.coin_type,
        target: targetCoin?.coin_type,
        amount: amountBn,
        byAmountIn: true, // `true` means fix input amount, `false` means fix output amount
        providers
      })
      console.log('🚀 ~ quickBuy ~ routers:', router)
      if (!router) {
        throw new Error('No router found')
      }

      const txb = new Transaction()

      const buildTxCallback = async () => {
        await aggregatorSDK.fastRouterSwap({
          router,
          txb,
          slippage: Number(slippage),
          refreshAllCoins: true
        })
        return txb
      }

      const fromAmountUi = amount
      const toAmountUi = bnToAmount(router?.amountOut?.toString(), targetCoin?.decimals)

      const toastType: any = {
        actionType: 'swap',
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = `Swapping ${addComma(fromAmountUi as string)} ${fromCoin?.symbol} for ${addComma(toAmountUi as string)} ${targetCoin?.symbol}`
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            let payAmountF = fromAmountUi
            let receiveAmountF = toAmountUi

            if (balanceChanges) {
              payAmountF = getBalanceChanges(balanceChanges, fromCoin) || fromAmountUi
              receiveAmountF = getBalanceChanges(balanceChanges, targetCoin) || toAmountUi
            }
            const description = `Swapped ${addComma(payAmountF as string)} ${fromCoin?.symbol} for ${addComma(receiveAmountF as string)} ${targetCoin?.symbol}`

            info.toastDescriptionContent = description
            info.modalDescriptionText = description
            info.toastTitleText = 'Swap Successful'
          }

          if (status === 'rejected') {
            info.toastTitleText = description.replace('Swapping', 'Swap')
          }

          return info
        }
      }

      const res = await signAndExecuteTransaction(buildTxCallback, toastType, {})
      if (res) {
        fetchAccountBalance()
      }

      console.log('🚀 ~ quickBuy ~ res:', res)
      setQuickLoading(false)
      setQuickLoadingCoin('')
    } catch (error) {
      console.log('🚀 ~ quickBuy ~ error:', error)
      setQuickLoading(false)
      setQuickLoadingCoin('')
    }
  }

  return {
    quickBuy,
    quickLoading,
    quickLoadingCoin
  }
}
