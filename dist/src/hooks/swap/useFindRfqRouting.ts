import useSwapConfigStore from '@/store/swap/swapConfig'
import { RfqConfigs, SwapRfqData } from '@/types/swap'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { d, fetchGet, fromDecimalsAmountFix } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { normalizeSuiAddress } from '@mysten/sui/utils'
import { useCallback, useMemo } from 'react'
import { useChainTime } from '../common/useChainTime'

export function useFindRfqRouting() {
  const { currentAccount } = useAccountStore()
  const { isOpenRfqSwitch, rfqConfigs, setRfqConfigs } = useSwapConfigStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { getBalanceInfoFromCache } = useGetTokenBalance()
  const { getCountDown } = useChainTime()
  const rfq_version: string = 'v1'
  const rfqPath = useMemo(() => {
    if (rfq_version === 'v2') {
      return 'rfq_v2'
    }
    return 'rfq'
  }, [rfq_version])
  /**
   * 获取rfq报价
   * @param options
   */
  const fetchRfqQuote = async (options: { fromToken: Token; toToken: Token; amount: string; uuid: string }): Promise<SwapRfqData | undefined> => {
    const { fromToken, toToken, amount, uuid } = options

    try {
      const res = await fetchGet(`${envConfigs.rfq_api}/${rfqPath}/quote`, {
        from: fixCoinType(fromToken.coin_type, false),
        target: fixCoinType(toToken.coin_type, false),
        amount_in: amount,
        sender: currentAccount?.address || normalizeSuiAddress('0x0')
      })
      console.log('🚀 ~ fetchRfqQuote ~ res:', res)
      const fromAmountUi = fromDecimalsAmountFix(res.amount_in.toString(), fromToken.decimals).toString()
      const toAmountUi = fromDecimalsAmountFix(res.amount_out.toString(), toToken.decimals).toString()
      const swapRfqData: SwapRfqData = {
        rfqQuote: res,
        uuid,
        fromAmountUi,
        toAmountUi,
        price: d(toAmountUi).div(fromAmountUi).toString()
      }
      swapRfqData.rfqQuote.total_countdown = await getCountDown(res.expired_at)
      console.log('🚀 ~ fetchRfqQuote ~ swapRfqData:', swapRfqData)
      return swapRfqData
    } catch (error) {
      console.log('🚀 ~ fetchRfqQuote ~ error:', error)
      return undefined
    }
  }

  /**
   * 获取rfq交易
   * @param id
   */
  const fetchRfqTransactions = async (id: string): Promise<string> => {
    try {
      const res = await fetchGet(`${envConfigs.rfq_api}/${rfqPath}/confirm`, {
        id
      })
      return res.transactions
    } catch (error) {
      console.log('🚀 ~ handleRfqQuote ~ error:', error)
      throw new Error('Failed to fetch rfq transactions')
    }
  }

  /**
   * 获取rfq配置
   */
  const fetchRfqConfigs = async (): Promise<RfqConfigs | undefined> => {
    try {
      const res = await fetchGet(`${envConfigs.rfq_api}/${rfqPath}/status`)
      if (res) {
        setRfqConfigs(res)
      }
      return res
    } catch (error) {
      console.log('🚀 ~ fetchRfqConfigs ~ error:', error)
      return undefined
    }
  }

  /**
   * 校验rfq是否可用
   */
  const verifyRfqAvailable = useCallback(
    (fromToken: Token, toToken: Token, amount: string) => {
      // 1. 检查钱包连接
      if (!currentAccount?.address) {
        return false
      }

      // 2. 检查RFQ配置和开关
      if (!rfqConfigs?.enable || !isOpenRfqSwitch) {
        return false
      }

      // 3. 检查交易金额是否在有效范围内
      const amountValue = getTokenAmountValue(fromToken.coin_type, amount)
      if (!d(amountValue).gte(rfqConfigs.quote_limit.min) || !d(amountValue).lte(rfqConfigs.quote_limit.max)) {
        return false
      }

      // 4. 检查余额是否足够
      const fromBalanceInfo = getBalanceInfoFromCache(fromToken)
      if (!fromBalanceInfo?.balanceFormat || d(fromBalanceInfo.balanceFormat).lt(amount)) {
        return false
      }

      // 5. 检查交易对是否在白名单内
      return (
        rfqConfigs.allow_paths?.some(
          path =>
            fixCoinType(fromToken.coin_type, false) === fixCoinType(path.from, false) &&
            fixCoinType(toToken.coin_type, false) === fixCoinType(path.target, false)
        ) ?? false
      )
    },
    [rfqConfigs, isOpenRfqSwitch, currentAccount?.address, getTokenAmountValue, getBalanceInfoFromCache]
  )

  return {
    fetchRfqQuote,
    fetchRfqTransactions,
    fetchRfqConfigs,
    verifyRfqAvailable
  }
}
