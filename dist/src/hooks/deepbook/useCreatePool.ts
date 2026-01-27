import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import { useGlobalToast } from '@cetus/design'
import { useAccountBalance, useDebounceValue } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { Decimal, isAvailableObject } from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo, useState } from 'react'
import { useGetCoin } from '../common/useCoin'
import useTransaction from '../common/useTransaction'

export const CREATEFEE = 500

export default function useCreatePool() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { currentAccount } = useAccountStore()
  const { failedTsToast } = useGlobalToast()
  const { transactionConfirmation, transactionRejected } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()

  const usdcCoin = useGetCoin('0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC')
  const deepCoin = useGetCoin('0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP')
  const quoteWhiteTokenList = useMemo(() => {
    if (usdcCoin && deepCoin && envConfigs?.sui_coin) {
      return [usdcCoin, envConfigs?.sui_coin, deepCoin]
    }
    return []
  }, [usdcCoin, deepCoin, envConfigs?.sui_coin])

  const { balanceInfo: deepCoinBalance } = useGetTokenBalance(deepCoin)

  const [baseToken, setBaseToken] = useState<any>(undefined)
  const [quoteToken, setQuoteToken] = useState<any>(undefined)
  const [priceSizeInput, setPriceSizeInput] = useState('')
  const [lotSizeInput, setLotSizeInput] = useState('')
  const [minSizeInput, setMinSizeInput] = useState('')
  const [pricePlaceholder, setPricePlaceholder] = useState('0.01')
  const [lotPlaceholder, setLotPlaceholder] = useState('0.1')
  const [minPlaceholder, setMinPlaceholder] = useState('1')

  const setIsCreatePoolSuccess = useDeepBookStore(state => state.setIsCreatePoolSuccess)

  useEffect(() => {
    if (isAvailableObject(usdcCoin)) {
      setQuoteToken(usdcCoin)
    }
  }, [usdcCoin])

  const changePriceInput = (val: string) => {
    setPriceSizeInput(val)
  }

  const changeLotSizeInput = (val: string) => {
    setLotSizeInput(val)
    setMinSizeInput('')
  }

  const changeMinSizeInput = (val: string) => {
    setMinSizeInput(val)
  }

  const calcRecommendPlaceholder = (base?: any, quote?: any) => {
    if (!base || !quote) {
      return {
        price: '0.01',
        lot: '0.1',
        min: '1'
      }
    }

    const baseDecimals = base.decimals
    const quoteDecimals = quote.decimals

    // price step size
    const priceStepExponent = Math.max(4, quoteDecimals - baseDecimals + 4)
    const price = new Decimal(10).pow(-priceStepExponent).toString()

    // lot size = 10^(7 - baseDecimals)
    const lot = new Decimal(10).pow(6 - baseDecimals).toString()

    // min size = lot * 10
    const min = new Decimal(lot).mul(10).toString()

    setPricePlaceholder(price)
    setLotPlaceholder(lot)
    setMinPlaceholder(min)
  }

  const changeBaseToken = (token: any) => {
    if (quoteToken && fixCoinType(token?.coin_type) === fixCoinType(quoteToken?.coin_type)) {
      setQuoteToken(baseToken)
      calcRecommendPlaceholder(token, baseToken)
    } else {
      calcRecommendPlaceholder(token, quoteToken)
    }

    setBaseToken(token)
    setPriceSizeInput('')
    setLotSizeInput('')
    setMinSizeInput('')
  }

  const changeQuoteToken = (token: any) => {
    if (baseToken && fixCoinType(token?.coin_type) === fixCoinType(baseToken?.coin_type)) {
      setBaseToken(quoteToken)
      calcRecommendPlaceholder(quoteToken, token)
    } else {
      calcRecommendPlaceholder(baseToken, token)
    }

    setQuoteToken(token)
    setPriceSizeInput('')
    setLotSizeInput('')
    setMinSizeInput('')
  }

  const [createLoading, setCreateLoading] = useState(false)
  const debounceLotSizeValue = useDebounceValue(lotSizeInput, 300)
  const btnInfo = useMemo(() => {
    const info: {
      text?: string
      disabled: boolean
    } = {
      text: 'Create Pool',
      disabled: false
    }
    // 判断钱包
    if (!currentAccount?.address) {
      info.text = 'Connect Wallet'
      info.disabled = false
      return info
    }
    // token 选择判断
    if (!baseToken || !quoteToken) {
      info.text = 'Select a token'
      info.disabled = true
      return info
    }
    // 判断输入
    if (!+priceSizeInput || !+debounceLotSizeValue || !+minSizeInput) {
      // info.text = 'Enter an amount'
      info.disabled = true
      return info
    }
    //判断余额
    if (d(deepCoinBalance?.balanceFormat).lt(CREATEFEE)) {
      info.disabled = true
      info.text = `Insufficient DEEP Balance`
      return info
    }
    return info
  }, [priceSizeInput, debounceLotSizeValue, minSizeInput, baseToken, quoteToken, currentAccount?.address, deepCoinBalance])

  const toCreate = async () => {
    try {
      setCreateLoading(true)
      setIsCreatePoolSuccess(false)
      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = `Create Pool`
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = ''
            info.modalDescriptionText = ''
            info.toastTitleText = `Create successful`
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)

      const params = {
        tickSize: d(priceSizeInput).mul(Math.pow(10, quoteToken?.decimals)).toString(),
        lotSize: d(lotSizeInput).mul(Math.pow(10, baseToken?.decimals)).toString(),
        minSize: d(minSizeInput).mul(Math.pow(10, baseToken?.decimals)).toString(),
        baseCoinType: fixCoinType(baseToken?.coin_type, false),
        quoteCoinType: fixCoinType(quoteToken?.coin_type, false)
      }
      console.log('🚀 ~ toCreate ~ params:', params)
      const tx = await deepBookSDK.DeepbookUtils.createPermissionlessPool(params)
      console.log('🚀 ~ toCreate ~ tx:', tx)
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      console.log('🚀 ~ toCreate ~ res:', res)
      if (res) {
        // 重新拿数据
        setIsCreatePoolSuccess(true)
        setTimeout(() => {
          fetchAccountBalance()
          setCreateLoading(false)
        }, 2000)
      }
    } catch (error) {
      console.log('🚀 ~ toCreate ~ error:', error)
      setIsCreatePoolSuccess(false)
      setCreateLoading(false)
      if (error == 'Error: Pool already exists') {
        let toastInfo = {
          getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
            const description = `Pool already exists`
            const info: CommonTypeInfo = {
              modalDescriptionText: description,
              toastTitleText: `Create failed`,
              toastDescriptionContent: description
            }
            return info
          }
        }
        transactionConfirmation(toastInfo)
        transactionRejected(toastInfo)
        failedTsToast(toastInfo)
      }
    } finally {
      setCreateLoading(false)
    }
  }

  return {
    pricePlaceholder,
    lotPlaceholder,
    minPlaceholder,
    deepCoinBalance,
    btnInfo,
    createLoading,
    baseToken,
    quoteToken,
    priceSizeInput,
    lotSizeInput,
    minSizeInput,
    quoteWhiteTokenList,
    changePriceInput,
    changeLotSizeInput,
    changeMinSizeInput,
    changeBaseToken,
    changeQuoteToken,
    toCreate
  }
}
