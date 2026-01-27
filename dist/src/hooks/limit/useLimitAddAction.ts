import { AggregatorDexMap } from '@/config/aggregator'
import useTransaction from '@/hooks/common/useTransaction'
import useLimitActionStore from '@/store/limit/useLimitAction'
import useProStore from '@/store/pro'
import { AggregatorServerErrorCode, SwapRouterData } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import useTokenStore from '@cetus/stores/src/token'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { d, formatNumber, removeComma } from '@cetus/utils'
import { fixCoinType, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { PlaceLimitOrderParams } from '@cetusprotocol/limit-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetPairPrice } from '../common/useGetPairPrice'
import useInsufficientBalanceToast from '../common/useInsufficientBalanceToast'
import { useFindBestRouting } from '../swap/useFindBestRouting'
import useGetMyLimitOrder from './useGetMyLimitOrder'
import useRefreshCoinMarketPrice from './useRefreshCoinMarketPrice'

export default function useLimitAddAction() {
  const { refreshCoinMarketPrice } = useRefreshCoinMarketPrice()
  const { fetchAccountBalance } = useAccountBalance()
  const { fetchMyLimitOrder } = useGetMyLimitOrder()
  const { signAndExecuteTransaction } = useTransaction()
  const limitSdk = useSdk('limit')
  const { findBestRouters } = useFindBestRouting()
  const { fetchTokenPrices, getTokenAmountValue } = useTokenPrice()
  const navigate = useNavigate()
  const { pay, target } = useParams()
  const { getTokenListInfo } = useGetToken()
  const { fetchTokenInfo } = useGetToken()
  const { setCurrentProTab, currentProTab } = useProStore()

  const {
    payCoin,
    targetCoin,
    quoteToken,
    expiresIn,
    setPayCoin,
    setTargetCoin,
    setQuoteToken,
    customExpiresVal,
    setExpiresIn,
    // 计算市场价loading
    setRefreshPriceLoading
  } = useLimitActionStore()

  // 支付数量
  const [payAmount, setPayAmount] = useState<string>('')
  // 目标数量
  const [targetAmount, setTargetAmount] = useState<string>('')
  // 固定输入方向
  const [fixPayCoin, setFixPayCoin] = useState<boolean>(true)

  // 是否使用市场价格
  const [useMarketPrice, setUseMarketPrice] = useState<boolean>(true)

  // 当前输入的价格
  const [inputPrice, setInputPrice] = useState<string>('')

  // 市场价格
  const { displayPrice: marketPrice } = useGetPairPrice(
    quoteToken?.coin_type === payCoin?.coin_type ? targetCoin?.coin_type : payCoin?.coin_type,
    quoteToken?.coin_type
  )

  // 余额
  const { balanceInfo: payBalanceInfo } = useGetTokenBalance(payCoin)
  const { balanceInfo: targetBalanceInfo } = useGetTokenBalance(targetCoin)

  // 价值
  const payAmountValue = getTokenAmountValue(payCoin?.coin_type, payAmount)
  const targetAmountValue = getTokenAmountValue(targetCoin?.coin_type, targetAmount)

  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useRef(uuid)

  useEffect(() => {
    uuidRef.current = uuid
  }, [uuid])

  const [routerData, setRouterData] = useState<SwapRouterData | undefined>(undefined)

  // 价差
  const [priceImpact, setPriceImpact] = useState<string>('')

  const payAmountRef = useRef<string>(payAmount)
  const targetAmountRef = useRef<string>(targetAmount)

  useEffect(() => {
    payAmountRef.current = payAmount
  }, [payAmount])

  useEffect(() => {
    targetAmountRef.current = targetAmount
  }, [targetAmount])

  // 处理导航Token
  useEffect(() => {
    const fetTokenInfo = async () => {
      console.log('0630🚀 ~ fetTokenInfo ~ pay:', pay)
      console.log('0630🚀 ~ fetTokenInfo ~ target:', target)
      if ((!pay || pay === 'undefined') && (!target || target === 'undefined')) {
        setPayCoin(envConfigs.clmm_swap.from_coin)
        setTargetCoin(envConfigs.clmm_swap.to_coin)
        return
      }

      if (pay && pay !== 'undefined') {
        fetchTokenInfo<string>(pay)
          .then((token: Token | undefined) => {
            if (!token) {
              navigate(`/limit/${payCoin?.coin_type}/${targetCoin?.coin_type}`)
            } else {
              if (token?.coin_type !== payCoin?.coin_type) {
                setPayCoin(token)
              }
            }
          })
          .catch(() => {
            navigate(`/limit/${payCoin?.coin_type}/${targetCoin?.coin_type}`)
          })
      } else {
        setPayCoin(undefined)
      }

      if (target && target !== 'undefined') {
        fetchTokenInfo<string>(target)
          .then((token: Token | undefined) => {
            if (!token) {
              navigate(`/limit/${payCoin?.coin_type}/${targetCoin?.coin_type}`)
            } else {
              if (token?.coin_type !== targetCoin?.coin_type) {
                setTargetCoin(token)
              }
            }
          })
          .catch(() => {
            navigate(`/limit/${payCoin?.coin_type}/${targetCoin?.coin_type}`)
          })
      } else {
        setTargetCoin(undefined)
      }
    }

    fetTokenInfo()
  }, [pay, target])

  // 销毁时清空token的值
  useEffect(() => {
    return () => {
      setPayCoin(undefined)
      setQuoteToken(undefined)
      setTargetCoin(undefined)
    }
  }, [])

  // 监听token 变更 计算市场价  和   路由路径
  useEffect(() => {
    setRouterData(undefined)
    refreshCoinMarketPrice()
    findAvailableRouter()

    // 设置默认的baseToken
    if (payCoin && targetCoin) {
      const payCoinRank = payCoin.extensions ? payCoin.extensions['rank'] || '0' : '0'
      const targetCoinRank = targetCoin.extensions ? targetCoin.extensions['rank'] || '0' : '0'
      console.log('🚀 ~ useEffect ~ payCoinRank:', payCoin, targetCoin)
      if (d(payCoinRank).gte(targetCoinRank)) {
        setQuoteToken({ ...payCoin })
      } else {
        setQuoteToken({ ...targetCoin })
      }
    }
  }, [payCoin?.coin_type, targetCoin?.coin_type])

  // 判断该交易对，是否存在可用路由
  const findAvailableRouter = async () => {
    if (payCoin && targetCoin) {
      const newUuid = `${payCoin.coin_type}_${targetCoin.coin_type}`
      setUuid(newUuid)
      const providersKeys = Object.entries(AggregatorDexMap).map(([key, value]) => value.id)
      const result = await findBestRouters({
        fromToken: payCoin,
        toToken: targetCoin,
        amount: toDecimalsAmount(1, payCoin.decimals),
        providersKeys: providersKeys as string[],
        by_amount_in: true,
        uuid: newUuid
      })

      if (newUuid === uuidRef.current) {
        setRouterData(result)
      }
    }
  }

  // 市场价格变化，更新价格输入框
  useEffect(() => {
    if (useMarketPrice) {
      setInputPrice(marketPrice || '')
    } else {
      calculatePriceImpact()
    }
  }, [marketPrice])

  // quote 变化 重新计算价格
  useEffect(() => {
    if (quoteToken && !useMarketPrice && +inputPrice) {
      setInputPrice(formatNumber(d(1).div(inputPrice).toFixed(quoteToken.decimals)).toString())
    }
  }, [quoteToken?.coin_type])

  // 监听 输入价格  更新输入框内容
  useEffect(() => {
    handleAmountChange(fixPayCoin ? payAmount : targetAmount, fixPayCoin)
    calculatePriceImpact()
  }, [inputPrice])

  const [priceImpactInfo, setPriceImpactInfo] = useState({ tooltip: '', color: '', text: '', bg: '' })
  const [priceImpactInfoLoading, setPriceImpactInfoLoading] = useState(false)
  // 计算价差
  const calculatePriceImpact = () => {
    if (!useMarketPrice && marketPrice && inputPrice) {
      setPriceImpactInfoLoading(true)
      const cleanInputPrice = removeComma(inputPrice)
      const cleanMarketPrice = removeComma(marketPrice)
      const impact = d(cleanInputPrice).sub(cleanMarketPrice).div(cleanMarketPrice).mul(100).toFixed(2)
      setPriceImpact(impact)

      const isGtZero = d(impact).gt(0)
      const ratioAbs = isGtZero ? impact : impact.split('-')[1]
      const impactInfo: any = { tooltip: '', color: '', text: '', bg: '' }
      impactInfo['tooltip'] = `Limit order price is ${ratioAbs}% ${isGtZero ? 'higher' : 'lower'} than the market.`
      if (quoteToken?.coin_type?.toLowerCase() == targetCoin?.coin_type?.toLowerCase()) {
        if (Number(cleanInputPrice) > Number(cleanMarketPrice)) {
          impactInfo['text'] = ''
          impactInfo['color'] = '#68FFD8'
        } else if (Number(cleanMarketPrice) > Number(cleanInputPrice)) {
          impactInfo['text'] = `Your limit order price is ${ratioAbs}% ${
            isGtZero ? 'higher' : 'lower'
          } than market. You are selling at a much ${isGtZero ? 'higher' : 'lower'} rate. We recommend you to use`
          impactInfo['color'] = '#ffb62d'
          impactInfo['bg'] = 'rgba(255,202,104,0.1)'
        }
      } else {
        if (Number(cleanInputPrice) > Number(cleanMarketPrice)) {
          impactInfo['text'] = `Your limit order price is ${ratioAbs}% ${
            isGtZero ? 'higher' : 'lower'
          } than market. You are buying at a much ${isGtZero ? 'higher' : 'lower'} rate. We recommend you to use`
          impactInfo['color'] = '#ffb62d'
          impactInfo['bg'] = 'rgba(255,202,104,0.1)'
        } else if (Number(cleanMarketPrice) > Number(cleanInputPrice)) {
          impactInfo['text'] = ''
          impactInfo['color'] = '#68FFD8'
        }
      }
      setPriceImpactInfo(impactInfo)
      setPriceImpactInfoLoading(false)
      return
    }
    setPriceImpact('')
  }

  // 点击市场价格
  const handleMarketPriceClick = (isUse: boolean = true) => {
    console.log('🚀 ~ handleMarketPriceClick ~ marketPrice:', marketPrice)
    setUseMarketPrice(isUse)
    if (isUse) {
      setInputPrice(marketPrice || '')
      refreshCoinMarketPrice()
    }
  }
  // 处理数量输入
  const handleAmountChange = (amount: string, fixPayCoin: boolean) => {
    setFixPayCoin(fixPayCoin)
    if (fixPayCoin) {
      setPayAmount(amount)
    } else {
      setTargetAmount(amount)
    }
    if (quoteToken && payCoin && targetCoin && +inputPrice && +amount) {
      if (fixPayCoin) {
        if (quoteToken.coin_type === payCoin.coin_type) {
          setTargetAmount(d(amount).div(inputPrice).toString().toString())
        } else {
          setTargetAmount(d(amount).mul(inputPrice).toString().toString())
        }
        return
      } else {
        if (quoteToken.coin_type === targetCoin.coin_type) {
          setPayAmount(d(amount).div(inputPrice).toString().toString())
        } else {
          setPayAmount(d(amount).mul(inputPrice).toString().toString())
        }
        return
      }
    }

    if (fixPayCoin) {
      setTargetAmount('')
    } else {
      setPayAmount('')
    }
  }

  // 处理token选择
  const handleSelectToken = (token: Token, isPay: boolean) => {
    resetInputAmount()
    setFixPayCoin(isPay)
    setUseMarketPrice(true)
    if (isPay) {
      // 如果选择token 和 对象token重复，  则交换顺序
      if (fixCoinType(token?.coin_type) === fixCoinType(targetCoin!.coin_type)) {
        navigate(`/limit/${token?.coin_type}/${payCoin?.coin_type}`)
        setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy')
      } else {
        navigate(`/limit/${token?.coin_type}/${targetCoin?.coin_type}`)
      }
    } else {
      if (fixCoinType(token?.coin_type) === fixCoinType(payCoin!.coin_type)) {
        navigate(`/limit/${targetCoin?.coin_type}/${token?.coin_type}`)
        setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy')
      } else {
        navigate(`/limit/${payCoin?.coin_type}/${token?.coin_type}`)
      }
    }
  }

  const { getPrice } = useGetPairPrice()

  const onReverseClick = (isClickToggle?: boolean) => {
    const price = getPrice(targetCoin?.coin_type, payCoin?.coin_type)
    setInputPrice(price || '')
    if ((payCoin?.coin_type && fixCoinType(payCoin?.coin_type || '') === fixCoinType(pay || '')) || (payCoin?.coin_type && !pay)) {
      navigate(`/limit/${targetCoin?.coin_type}/${payCoin?.coin_type}`, { state: { preventScroll: true } })
    } else if (
      (payCoin?.coin_type && payCoin?.coin_type !== 'undefined' && (!targetCoin?.coin_type || targetCoin?.coin_type == 'undefined')) ||
      (targetCoin?.coin_type && targetCoin?.coin_type !== 'undefined' && (!payCoin?.coin_type || payCoin?.coin_type == 'undefined'))
    ) {
      // console.log('useLimitAddAction 🚀 ~ onReverseClick ~ targetCoin?.coin_type:', targetCoin?.coin_type)
      // console.log('useLimitAddAction 🚀 ~ onReverseClick ~ payCoin?.coin_type:', payCoin?.coin_type)

      navigate(`/limit/${targetCoin?.coin_type}/${payCoin?.coin_type}`, { state: { preventScroll: true } })
    }
    if (isClickToggle) {
      setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy', 'toggleBtn')
    }
  }

  // 清空输入
  const resetInputAmount = () => {
    setPayAmount('')
    setTargetAmount('')
  }

  useEffect(() => {
    return () => {
      setExpiresIn('7 Days')
    }
  }, [])

  const [submitOrderLoading, setSubmitOrderLoading] = useState<boolean>(false)
  const getExpiresTime = (time: string) => {
    switch (time) {
      case '5 Minutes':
        return 300000
      case '10 Minutes':
        return 600000
      case '30 Minutes':
        return 1800000
      case '1 Hour':
        return 3600000
      case '1 Day':
        return 86400000
      case '3 Days':
        return 259200000
      case '7 Days':
        return 604800000
      case '1 Month':
        return 2592000000
      default:
        return 0
    }
  }
  const { showInsufficientBalanceToast } = useInsufficientBalanceToast()
  const { transactionConfirmation } = useTransaction()
  const clmmSdk = useSdk('clmm')
  const { addToken } = useTokenStore()
  // 提交现价单
  const handleSubmitOrder = async () => {
    // 构建 交易提示
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = `Creating order`

        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }

        if (status === 'success') {
          info.toastDescriptionContent = ''
          info.modalDescriptionText = 'Created order successfully'
          info.toastTitleText = 'Created order successfully'
        }
        if (status === 'rejected') {
          info.toastTitleText = 'Create order'
        }

        return info
      }
    }
    transactionConfirmation(toastInfo)
    const expired_ts = Date.parse(new Date().toString()) + (getExpiresTime(expiresIn!) || customExpiresVal)
    console.log(' ~ handleSubmitOrder ~ expired_ts:', expired_ts)
    setSubmitOrderLoading(true)
    const coinsInfo = await clmmSdk!.CetusConfig.getTokenListByCoinTypes([payCoin!.coin_type, targetCoin!.coin_type])
    const payCoinLocalDecimals = payCoin!.decimals
    const targetCoinLocalDecimals = targetCoin!.decimals
    const payCoinChainDecimals = coinsInfo[payCoin!.coin_type]!.decimals
    const targetCoinChainDecimals = coinsInfo[targetCoin!.coin_type]!.decimals

    if (payCoin && payCoinLocalDecimals !== payCoinChainDecimals) {
      addToken({ ...payCoin, decimals: payCoinChainDecimals })
    }
    if (targetCoin && targetCoinLocalDecimals !== targetCoinChainDecimals) {
      addToken({ ...targetCoin, decimals: targetCoinChainDecimals })
    }
    let price

    if (quoteToken?.coin_type === targetCoin?.coin_type) {
      price = inputPrice
    } else {
      // price = d(1).div(inputPrice).toFixed(targetCoinChainDecimals)
      price = d(1).div(inputPrice).toString()
    }

    try {
      const params: PlaceLimitOrderParams = {
        pay_coin_type: payCoin!.coin_type,
        target_coin_type: targetCoin!.coin_type,
        expired_ts,
        target_decimal: targetCoinChainDecimals,
        pay_decimal: payCoinChainDecimals,
        price: Number(price),
        pay_coin_amount: String(toDecimalsAmount(payAmount, payCoinChainDecimals)) as any
      }

      const txb = await limitSdk!.LimitOrder.placeLimitOrder(params)

      const res = await signAndExecuteTransaction(txb, toastInfo)
      setSubmitOrderLoading(false)

      if (res) {
        // 刷新余额
        fetchAccountBalance()
        // 刷新订单
        fetchMyLimitOrder()
        resetInputAmount()
      }
    } catch (error) {
      showInsufficientBalanceToast(String(error))
      setSubmitOrderLoading(false)
    }
  }
  const { currentAccount } = useAccountStore()

  const minOrderAmount = useMemo(() => {
    const amountUsd = getTokenAmountValue(payCoin?.coin_type, payAmount)
    if (Number(amountUsd) == 0 && Number(payAmount) > 0) {
      return false
    } else {
      if (Number(amountUsd) < 5) {
        return true
      }
    }
    return false
  }, [payCoin, payAmount])

  const buttonTextStatus = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Place Limit Order',
      disabled: false
    }
    if (!currentAccount?.address) {
      btnInfo.disabled = false
      btnInfo.text = 'Connect Wallet'
      return btnInfo
    }
    if (!payCoin || !targetCoin) {
      btnInfo.disabled = true
      btnInfo.text = ' Select a token'
      return btnInfo
    }
    if (!Number(payAmount) || !Number(targetAmount)) {
      btnInfo.disabled = true
      btnInfo.text = 'Enter an amount'
      return btnInfo
    }
    if (minOrderAmount) {
      btnInfo.disabled = true
      btnInfo.text = 'Order size should be higher than $5'
      return btnInfo
    }
    if (Number(payAmount) > Number(payBalanceInfo?.balanceFormat) || !payBalanceInfo?.balanceFormat) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${payCoin?.symbol} balance`
      return btnInfo
    }
    if (routerData && routerData.errorCode) {
      if (routerData.errorCode === AggregatorServerErrorCode.NoRouter || routerData.errorCode === AggregatorServerErrorCode.HoneyPot) {
        btnInfo.text = 'No Available Route'
        btnInfo.disabled = true
        return btnInfo
      }
    }
    console.log('🚀 ~ buttonTextStatus ~ priceImpact:', 12, priceImpactInfo.color, priceImpactInfo, priceImpact)
    if (priceImpactInfo.color.toLowerCase() == '#ffb62d' && (Number(priceImpact) < -10 || Number(priceImpact) > 10)) {
      btnInfo.disabled = true
      return btnInfo
    }
    return btnInfo
  }, [
    currentAccount?.address,
    payCoin,
    targetCoin,
    routerData,
    payAmount,
    targetAmount,
    minOrderAmount,
    payBalanceInfo,
    JSON.stringify(priceImpactInfo),
    priceImpact
  ])

  return {
    priceImpactInfoLoading,
    priceImpactInfo,
    fixPayCoin,
    onReverseClick,
    handleSelectToken,
    marketPrice,
    payCoin,
    targetCoin,
    handleAmountChange,
    payAmount,
    targetAmount,
    payBalanceInfo,
    targetBalanceInfo,
    payAmountValue,
    targetAmountValue,
    useMarketPrice,
    handleMarketPriceClick,
    inputPrice,
    setInputPrice,
    priceImpact,
    quoteToken,
    setQuoteToken,
    handleSubmitOrder,
    submitOrderLoading,
    buttonTextStatus
  }
}
