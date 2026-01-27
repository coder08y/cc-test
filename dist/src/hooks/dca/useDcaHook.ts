import { AggregatorDexMap } from '@/config/aggregator'
import useDcaStore from '@/store/dca'
import useProStore from '@/store/pro'
import { AggregatorServerErrorCode, SwapRouterData } from '@/types'
import { useDebounceFunction, useFetch } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { Decimal, bnToAmount, d, formatNumber, formatNumberWithDown, suiAddressShortToLong, timeFormatUTC } from '@cetus/utils'
import { extractStructTagFromType, fixCoinType, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useTokenRank from '../common/useTokenRank'
import { useFindBestRouting } from '../swap/useFindBestRouting'
import useDcaConfig from './useDcaConfig'
import useDcaGetQuote from './useGetDcaQuote'

export function useDcaHook() {
  const navigate = useNavigate()
  const {
    sellCoin,
    buyCoin,
    setSellCoin,
    setBuyCoin,
    sellAmount,
    buyAmount,
    setBuyAmount,
    setSellAmount,
    dcaConfig,
    setCurrentCoinKey,
    currentCoinKey,
    investNum,
    currentInvest,
    orderNum,
    dcaQuote,
    setInvestNum,
    setOrderNum,
    setCurrentInvest,
    setPageDirect,
    pageDirect,
    dcaMode,
    sellTotalAmount,
    setSellTotalAmount,
    setLowerPriceSize,
    setUpperPriceSize
  } = useDcaStore()
  const { from, to } = useParams()

  const { currentAccount } = useAccountStore()
  const { getDcaConfig } = useDcaConfig()
  const { getDcaQuote } = useDcaGetQuote()
  const { coinPriceObj } = useTokenPriceStore()
  const { fetchTokenPrices, getTokenAmountValue } = useTokenPrice()
  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useRef(uuid)
  const { fetchTokenInfo } = useGetToken()
  const { setCurrentProTab, currentProTab, currentProTabUpdateWith } = useProStore()

  useEffect(() => {
    uuidRef.current = uuid
  }, [uuid])

  // 处理导航Token
  useEffect(() => {
    const fetTokenInfo = async () => {
      console.log('dca hook0619 🚀 ~ fetTokenInfo ~ from:', from)
      console.log('dca hook0619 🚀 ~ fetTokenInfo ~ to:', to)
      if ((!from || from === 'undefined') && (!to || to === 'undefined')) {
        setSellCoin(envConfigs.clmm_swap.from_coin)
        setBuyCoin(envConfigs.clmm_swap.to_coin)
        return
      }

      if (from && from !== 'undefined') {
        fetchTokenInfo<string>(from)
          .then((token: Token | undefined) => {
            if (!token) {
              navigate(`/dca/${sellCoin?.coin_type}/${buyCoin?.coin_type}`)
            } else {
              if (token?.coin_type !== sellCoin?.coin_type) {
                setSellCoin(token)
              }
            }
          })
          .catch(() => {
            navigate(`/dca/${sellCoin?.coin_type}/${buyCoin?.coin_type}`)
          })
      } else {
        setSellCoin(undefined)
      }

      if (to && to !== 'undefined') {
        fetchTokenInfo<string>(to)
          .then((token: Token | undefined) => {
            if (!token) {
              navigate(`/dca/${sellCoin?.coin_type}/${buyCoin?.coin_type}`)
            } else {
              if (token?.coin_type !== buyCoin?.coin_type) {
                setBuyCoin(token)
              }
            }
          })
          .catch(() => {
            navigate(`/dca/${sellCoin?.coin_type}/${buyCoin?.coin_type}`)
          })
      } else {
        setBuyCoin(undefined)
      }
    }

    fetTokenInfo()
  }, [from, to])

  // 销毁时清空token的值
  useEffect(() => {
    return () => {
      setBuyCoin(undefined)
      setSellCoin(undefined)
    }
  }, [])

  // 获取dca的配置(单笔订单数量不能小于多少)
  const handleGetDcaConfig = async () => {
    const res = await getDcaConfig()
    console.log('🚀 ~ handleGetDcaConfig ~ res:', res)
  }

  // Initialization dca Token
  const initiaTokenSelect = () => {
    console.log('🚀 ~ initiaTokenSelect ~ setSellCoin:')
    setSellCoin(envConfigs.clmm_swap.from_coin)
    setBuyCoin(envConfigs.clmm_swap.to_coin)
  }

  useEffect(() => {
    setLowerPriceSize('0%')
    setUpperPriceSize('0%')
    // initiaTokenSelect()
    getDcaConfig()
    return () => {
      resetInputAmount()
    }
  }, [])

  // 订单价格最小值
  const [minPriceValue, setMinPriceValue] = useState<string>('')
  // 订单价格最大值
  const [maxPriceValue, setMaxPriceValue] = useState<string>('')
  // 余额
  const { balanceInfo: sellBalanceInfo } = useGetTokenBalance(sellCoin)
  const { balanceInfo: buyBalanceInfo } = useGetTokenBalance(buyCoin)

  // 价值
  const sellAmountValue = getTokenAmountValue(sellCoin?.coin_type, sellAmount)

  // 卖出数量变化
  const handleAmountChange = (amount: string) => {
    setCurrentCoinKey('sellCoin')
    setSellAmount(amount)
    fetchFindAvailableRouterDebounce()
  }
  useEffect(() => {
    if (+sellAmount && +orderNum) {
      if (dcaMode == 'total') {
        setSellTotalAmount(sellAmount)
      } else {
        setSellTotalAmount(d(sellAmount).mul(orderNum).toString())
      }
    } else {
      setSellTotalAmount('')
    }
  }, [sellAmount, dcaMode, orderNum])
  const handlePageToggleDirect = () => {
    const decimals = pageDirect ? sellCoin?.decimals : buyCoin?.decimals
    setPageDirect(!pageDirect)
    if (minPriceValue && maxPriceValue) {
      const value = minPriceValue
      const newMinVal = d(1).div(maxPriceValue).toString()
      const newMaxVal = d(1).div(value).toString()
      setMinPriceValue(formatNumberWithDown(newMinVal, decimals, true).toString())
      setMaxPriceValue(formatNumberWithDown(newMaxVal, decimals, true).toString())
    }
  }
  // token选择
  const handleSelectToken = (coin: Token, isSell: boolean = true) => {
    console.log('🚀🚀🚀 ~ useDcaHook.ts:143 ~ handleSelectToken ~ handleSelectToken:')

    setMinPriceValue('')
    setMaxPriceValue('')
    if (isSell) {
      if (fixCoinType(coin?.coin_type) === fixCoinType(buyCoin!.coin_type)) {
        onReverseClick()
        setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy')
      } else {
        // setSellCoin(coin)
        navigate(`/dca/${coin?.coin_type}/${buyCoin?.coin_type}`)
      }
      setCurrentCoinKey('sellCoin')
    } else {
      if (fixCoinType(coin?.coin_type) === fixCoinType(sellCoin!.coin_type)) {
        onReverseClick()
        setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy')
      } else {
        // setBuyCoin(coin)
        navigate(`/dca/${sellCoin?.coin_type}/${coin?.coin_type}`)
      }
      setCurrentCoinKey('buyCoin')
    }
  }
  // 清空输入框
  const resetInputAmount = () => {
    setSellAmount('')
    setMinPriceValue('')
    setMaxPriceValue('')
    setUuid('')
    setInvestNum('1')
    setOrderNum('2')
    setCurrentInvest('Hour')
  }
  // 交换token方向
  const onReverseClick = (isClickToggle?: boolean) => {
    if ((sellCoin?.coin_type && sellCoin?.coin_type === from) || (sellCoin?.coin_type && !from)) {
      navigate(`/dca/${buyCoin?.coin_type}/${sellCoin?.coin_type}`, { state: { preventScroll: true } })
    } else if (
      (sellCoin?.coin_type && sellCoin?.coin_type !== 'undefined' && (!buyCoin?.coin_type || buyCoin?.coin_type == 'undefined')) ||
      (buyCoin?.coin_type && buyCoin?.coin_type !== 'undefined' && (!sellCoin?.coin_type || sellCoin?.coin_type == 'undefined'))
    ) {
      // console.log('useDcaHook 🚀 ~ onReverseClick ~ buyCoin?.coin_type:', buyCoin?.coin_type)
      // console.log('useDcaHook 🚀 ~ onReverseClick ~ sellCoin?.coin_type:', sellCoin?.coin_type)

      navigate(`/dca/${buyCoin?.coin_type}/${sellCoin?.coin_type}`, { state: { preventScroll: true } })
    }
    if (isClickToggle) {
      setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy', 'toggleBtn')
    }
  }

  // dca白名单判断
  const isDcaSelect = useMemo(() => {
    const whitelistMode = dcaConfig?.whitelistMode
    console.log('🚀 ~ useDcaHook ~ whitelistMode:', whitelistMode)
    if (whitelistMode === 3) return true
    if (whitelistMode === 0) return false

    if (currentCoinKey === 'sellCoin') {
      return whitelistMode === 1
    } else if (currentCoinKey === 'buyCoin') {
      return whitelistMode === 2
    }
    return false
  }, [dcaConfig?.whitelistMode])

  // sellCoin的当前价格
  const sellCoinPrice = coinPriceObj[extractStructTagFromType(sellCoin?.coin_type).full_address]?.price || 0
  // 单笔订单的数量
  const sellPerOrder = useMemo(() => {
    if (sellTotalAmount && orderNum) {
      return d(sellTotalAmount).div(orderNum).toString()
    } else {
      return 0
    }
  }, [sellTotalAmount, orderNum])
  // 单笔订单的价值
  const sellPerOrderUSD = useMemo(() => {
    if (sellTotalAmount && orderNum && sellCoinPrice) {
      return d(sellTotalAmount).div(orderNum).mul(sellCoinPrice).toString() || 0
    } else {
      return 0
    }
  }, [sellTotalAmount, orderNum, sellCoinPrice])
  // 订单费率
  const platformFee = d(dcaQuote?.feeRate).div(Decimal.pow(10, 6)).mul(100).toString() + '%' || '0%'
  // 单比订单的数量限制
  const amountInLimit = useMemo(() => {
    if (dcaQuote?.amountInLimitPerCycle && sellCoin?.decimals) {
      return bnToAmount(dcaQuote?.amountInLimitPerCycle, sellCoin?.decimals)
    }
  }, [dcaQuote?.amountInLimitPerCycle])
  // 单比订单的数量错误
  const orderSizeError = useMemo(() => {
    console.log('🚀 ~ orderSizeError ~ sellPerOrder:', sellPerOrder, amountInLimit)
    if (dcaConfig?.minCycleAmountInUsd && orderNum && sellAmount && amountInLimit && Number(sellPerOrder) < Number(amountInLimit)) {
      return {
        status: true,
        tips: `Each order size should be higher than $${dcaConfig?.minCycleAmountInUsd}.`
      }
    }
    if (sellAmount && orderNum && Number(sellPerOrderUSD) > 10000) {
      return {
        status: true,
        tips: 'Each order size should be less than $10,000'
      }
    }
    return {
      status: false,
      tips: ''
    }
  }, [dcaMode, amountInLimit, orderNum, sellPerOrder, sellAmount, sellPerOrderUSD, dcaConfig?.minCycleAmountInUsd])
  // 订单数量输入错误
  const orderInputError = useMemo(() => {
    console.log('🚀 ~ orderInputError ~ orderNum:', orderNum, orderNum && Number(orderNum) < Number(dcaConfig?.minCycleCount))
    if (dcaConfig?.minCycleCount && orderNum && Number(orderNum) < Number(dcaConfig?.minCycleCount)) {
      return {
        status: true,
        tips: `Number of Orders cannot be lower than ${dcaConfig?.minCycleCount}.`
      }
    } else if (orderNum && Number(investNum) <= 0) {
      return {
        status: true,
        tips: 'Please enter an interval above 0'
      }
    } else if (orderNum && investNum && Number(investNum) > 10000) {
      return {
        status: true,
        tips: 'The maximum interval is 10,000.'
      }
    } else {
      return {
        status: false,
        tips: ''
      }
    }
  }, [orderNum, dcaConfig?.minCycleCount, investNum])

  // 最大最小价格错误
  const priceError = useMemo(() => {
    if ((minPriceValue && Number(minPriceValue) == 0) || (maxPriceValue && Number(maxPriceValue) == 0)) {
      return {
        status: true,
        tips: 'Please enter a price greater than 0.'
      }
    } else if (minPriceValue && maxPriceValue && Number(minPriceValue) >= Number(maxPriceValue)) {
      return {
        status: true,
        tips: 'The max price should be higher than min price.'
      }
    } else {
      return {
        status: false,
        tips: ''
      }
    }
  }, [minPriceValue, maxPriceValue])

  // 订单结束时间
  const [estEndDate, setEstEndDate] = useState('')
  // 订单时间错误
  const [orderTimeError, setOrderTimeError] = useState({
    status: false,
    tips: ''
  })
  const getEstEndDate = () => {
    const date = new Date().getTime()
    let investTime = 0
    console.log('🚀🚀🚀 ~ file: dca-detail.vue:34 ~ estEndDate ~ currentTime.value:', currentInvest)
    switch (currentInvest) {
      case 'Minute':
        // investTime = d(investNum).mul(60).mul(1000).mul(d(orderNum).sub(1)).plus(60000).toNumber()
        investTime = Number(investNum) * 60 * 1000 * (Number(orderNum) - 1) + 60000
        break
      case 'Hour':
        investTime = Number(investNum) * 60 * 60 * 1000 * (Number(orderNum) - 1) + 60000
        break
      case 'Day':
        investTime = Number(investNum) * 60 * 60 * 24 * 1000 * (Number(orderNum) - 1) + 60000
        break
      case 'Week':
        investTime = Number(investNum) * 60 * 60 * 24 * 7 * 1000 * (Number(orderNum) - 1) + 60000
        break
      case 'Month':
        investTime = Number(investNum) * 60 * 60 * 24 * 30 * 1000 * (Number(orderNum) - 1) + 60000
        break
    }
    console.log(
      '🚀🚀🚀 ~ file: dca-detail.vue:46 ~ estEndDate ~ date + investTime:',
      orderNum,
      date,
      investTime,
      investTime > 60 * 60 * 24 * 365 * 1000
    )
    const result = timeFormatUTC(date + investTime, 'YMDHM')
    console.log('🚀🚀🚀 ~ file: dca-data.ts:303 ~ getEstEndDate ~ result:', result)
    setEstEndDate(result!)
    if (result == 'NaN-NaN-NaN NaN:NaN') {
      setEstEndDate('--')
    }
    if (investTime > 60 * 60 * 24 * 365 * 1000) {
      setOrderTimeError({
        status: true,
        tips: 'The maximum execution period is 1 year'
      })
    } else {
      setOrderTimeError({
        status: false,
        tips: 'The maximum execution period is 1 year'
      })
    }
  }

  useEffect(() => {
    getEstEndDate()
  }, [sellAmount, investNum, orderNum, minPriceValue, maxPriceValue, currentInvest])

  const cycleFrequency = useMemo(() => {
    let investTime = 0
    switch (currentInvest) {
      case 'Minute':
        investTime = Number(investNum) * 60
        break
      case 'Hour':
        investTime = Number(investNum) * 60 * 60
        break
      case 'Day':
        investTime = Number(investNum) * 60 * 60 * 24
        break
      case 'Week':
        investTime = Number(investNum) * 60 * 60 * 24 * 7
        break
      case 'Month':
        investTime = Number(investNum) * 60 * 60 * 24 * 30
        break
    }
    console.log('🚀🚀🚀 ~ file: dca-data.ts:333 ~ cycleFrequency ~ investTime:', investTime)
    return investTime
  }, [currentInvest, investNum])

  useEffect(() => {
    if (sellCoin?.coin_type && cycleFrequency && orderNum) {
      queryDcaQuoteDebounce(sellCoin?.coin_type, cycleFrequency, orderNum, currentAccount?.address)
    }
  }, [sellCoin?.coin_type, cycleFrequency, orderNum, currentAccount?.address])

  const queryDcaQuote = async (coinAddress: string, freq: string | number, count: string | number, sender: string) => {
    const defaultWalletAddress = sender || '0x0000000000000000000000000000000000000000000000000000000000000000'
    try {
      const result = await getDcaQuote({ inCoin: coinAddress, freq, count, sender: defaultWalletAddress })
      console.log('🚀 ~ queryDcaQuote ~ result:', result)
      return result
    } catch (error) {
      console.log('🚀🚀🚀 ~ file: dca-data.ts:344 ~ queryDcaQuote ~ error:', error)
    }
  }

  const queryDcaQuoteDebounce = useDebounceFunction((coinAddress: string, freq: string | number, count: string | number, sender: string) => {
    queryDcaQuote(coinAddress, freq, count, sender)
  }, 500)

  const { findBestRouters } = useFindBestRouting()
  const [findRouterLoading, setFindRouterLoading] = useState<boolean>(false)
  const [routerData, setRouterData] = useState<SwapRouterData | undefined>(undefined)

  const { getTokenRank } = useTokenRank()
  const { fetchByApi } = useFetch()
  const [missingCoins, setMissingCoins] = useState<Token[]>([])

  useEffect(() => {
    getTokensPrice()
    const direct = getTokenRank(sellCoin!, buyCoin!)
    console.log('🚀 ~ useEffect ~ direct:', direct)
    setPageDirect(direct)
  }, [sellCoin?.coin_type, buyCoin?.coin_type])

  useEffect(() => {
    fetchFindAvailableRouterDebounce()
    if (sellCoin?.coin_type && buyCoin?.coin_type) {
      setMissingCoins([])
      checkPriceAvailability()
    }
  }, [sellPerOrder, sellCoin?.coin_type, buyCoin?.coin_type])

  const fetchFindAvailableRouterDebounce = () => {
    if (d(sellPerOrder).gt(0) && sellCoin?.coin_type && buyCoin?.coin_type) {
      setFindRouterLoading(true)
      console.log('🚀 ~ useDcaHook ~ sellAmountDebounce:', Number(sellPerOrder) > 0, sellPerOrder, sellCoin?.coin_type, buyCoin?.coin_type, orderNum)
      findAvailableRouterDebounce()
    }
  }

  const findAvailableRouterDebounce = useDebounceFunction(() => {
    findAvailableRouter()
  }, 500)

  // 判断该交易对，是否存在可用路由
  const findAvailableRouter = async () => {
    console.log('🚀 ~ findAvailableRouter ~ findAvailableRouter:', sellPerOrder)
    if (sellCoin && buyCoin) {
      const newUuid = `${sellCoin.coin_type}_${buyCoin.coin_type}`
      setUuid(newUuid)
      const providersKeys = Object.entries(AggregatorDexMap).map(([key, value]) => value.id)
      try {
        const result = await findBestRouters({
          fromToken: sellCoin,
          toToken: buyCoin,
          amount: toDecimalsAmount(sellPerOrder || 1, sellCoin?.decimals),
          providersKeys: providersKeys as string[],
          by_amount_in: true,
          uuid: newUuid
        })

        console.log('🚀 ~ findAvailableRouter ~ newUuid:', newUuid, uuid, result)
        if (newUuid === uuidRef.current && result?.routerData) {
          setRouterData(result)
          setBuyAmount(result?.toAmountUi || '')
          setFindRouterLoading(false)
        } else {
          setRouterData(result)
          setBuyAmount('0')
          setFindRouterLoading(false)
        }
      } catch (error) {
        console.log('🚀 ~ findAvailableRouter ~ error:', error)
      }
    }
  }

  // 获取当前的token价格
  const getTokensPrice = () => {
    const uniqueTokens = (sellCoin?.coin_type || buyCoin?.coin_type) && Array.from(new Set([sellCoin?.coin_type, buyCoin?.coin_type]))
    // fetchTokenPrices(uniqueTokens || [])
    if (uniqueTokens?.length > 0) {
      fetchTokenPrices(uniqueTokens)
    }
  }

  const btnStatus = useMemo(() => {
    console.log('🚀 ~ btnStatus ~ routerData:', routerData)
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Create DCA Order',
      disabled: false
    }
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }
    if (!sellCoin?.coin_type || !buyCoin?.coin_type) {
      btnInfo.disabled = true
      btnInfo.text = 'Select a token'
      return btnInfo
    }
    if (!sellAmount || Number(sellAmount) == 0) {
      btnInfo.disabled = true
      btnInfo.text = 'Enter an amount'
      return btnInfo
    }
    if (d(sellTotalAmount).gt(sellBalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${sellCoin?.symbol} balance`
      return btnInfo
    }
    if (d(dcaConfig?.minCycleCount).gt(orderNum || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Minimum ${dcaConfig?.minCycleCount} orders`
      return btnInfo
    }

    if (d(amountInLimit).gt(sellPerOrder || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Minimum $${dcaConfig?.minCycleAmountInUsd} per order`
      return btnInfo
    }

    if (
      orderSizeError.status ||
      orderInputError.status ||
      priceError.status ||
      orderTimeError.status ||
      !sellCoin?.coin_type ||
      !buyCoin?.coin_type ||
      !orderNum ||
      !investNum ||
      !minPriceValue ||
      !maxPriceValue
    ) {
      btnInfo.disabled = true
      btnInfo.text = 'Create DCA Order'
      return btnInfo
    }
    console.log('🚀 ~ btnStatus ~ routerData:', routerData)
    // errorCode
    if (routerData && routerData.errorCode) {
      if (
        routerData.errorCode === AggregatorServerErrorCode.NoRouter ||
        routerData.errorCode === AggregatorServerErrorCode.HoneyPot ||
        routerData.errorCode === AggregatorServerErrorCode.InsufficientLiquidity
      ) {
        btnInfo.text = 'No Available Route'
        btnInfo.disabled = true
        return btnInfo
      }
    }
    return btnInfo
  }, [
    currentAccount?.address,
    sellBalanceInfo,
    orderSizeError,
    orderInputError,
    priceError,
    orderTimeError,
    sellCoin?.coin_type,
    buyCoin?.coin_type,
    sellTotalAmount,
    investNum,
    orderNum,
    minPriceValue,
    maxPriceValue,
    routerData?.routerData?.routes?.length
  ])
  const warningTokenList = useMemo(() => {
    const list: Token[] = []
    if (buyCoin) {
      list.push(buyCoin)
    }

    if (sellCoin) {
      list.push(sellCoin)
    }

    return list
  }, [buyCoin, sellCoin])

  const currentPrice = useMemo(() => {
    if (pageDirect && buyAmount && sellPerOrder) {
      return formatNumber(d(buyAmount).div(sellPerOrder).toString(), buyCoin?.decimals, true)
    }
    if (!pageDirect && buyAmount && sellPerOrder) {
      return formatNumber(d(sellPerOrder).div(buyAmount).toString(), sellCoin?.decimals, true)
    }
    return ''
  }, [pageDirect, sellPerOrder, buyAmount])

  const minPriceValueDebounce = useDebounceFunction((val: string) => {
    setMinPriceValue(val)
  }, 500)

  const maxPriceValueDebounce = useDebounceFunction((val: string) => {
    setMaxPriceValue(val)
  }, 500)

  const handleMinInputChange = (val: string) => {
    console.log('🚀 ~ handleMinInputChange ~ val:', val)
    minPriceValueDebounce(val)
  }
  const handleMaxInputChange = (val: string) => {
    console.log('🚀 ~ handleMaxInputChange ~ val:', val)
    maxPriceValueDebounce(val)
  }

  useEffect(() => {
    changeLowerPriceSize(minPriceValue)
  }, [minPriceValue, currentPrice])

  useEffect(() => {
    changeUpperPriceSize(maxPriceValue)
  }, [maxPriceValue, currentPrice])

  const changeLowerPriceSize = (val: string) => {
    console.log('🚀 ~ changeLowerPriceSize ~ val:', val)
    if (currentPrice && val) {
      // 公式 lowerPriceSize = (lowerPrice/currentPrice - 1)*100
      const lowerPrice = d(val).div(currentPrice).sub(1).mul(100).toString()
      console.log('🚀 ~ handleMaxInputChange ~ upperPrice:', lowerPrice)
      setLowerPriceSize(d(lowerPrice).gt(10000) ? '>10,000%' : `${formatNumber(lowerPrice, 1, false, Decimal.ROUND_HALF_DOWN)}%`)
    }
  }
  const changeUpperPriceSize = (val: string) => {
    if (currentPrice && val) {
      // 公式 upperPriceSize = (upperPrice/currentPrice - 1)*100
      const upperPrice = d(val).div(currentPrice).sub(1).mul(100).toString()
      console.log('🚀 ~ handleMaxInputChange ~ upperPrice:', upperPrice)
      setUpperPriceSize(d(upperPrice).gt(10000) ? '>10,000%' : `${formatNumber(upperPrice, 1, false, Decimal.ROUND_HALF_DOWN)}%`)
    }
  }

  const checkPriceAvailability = async () => {
    const requestedCoinTypes = [suiAddressShortToLong(sellCoin?.coin_type), suiAddressShortToLong(buyCoin?.coin_type)].filter(Boolean)

    try {
      const priceResponse = await fetchByApi('/v2/sui/price', 'GET', {
        base_symbol_address_pair: requestedCoinTypes.join(',')
      })
      console.log('🚀🚀🚀 ~ useDcaHook.ts:478 ~ checkPriceAvailability ~ priceResponse:', priceResponse)

      if (priceResponse && priceResponse.prices) {
        // 获取API返回的币种符号
        const availableCoinTypes = priceResponse.prices.map((price: any) => price.base_symbol)

        // 找出没有返回价格的币种
        const unsupportedCoinTypes = requestedCoinTypes.filter(coinType => !availableCoinTypes.includes(coinType))

        console.log('🚀 ~ checkPriceAvailability ~ availableCoinTypes:', availableCoinTypes)
        console.log('🚀 ~ checkPriceAvailability ~ unsupportedCoinTypes:', unsupportedCoinTypes)
        console.log('🚀 ~ checkPriceAvailability ~ requestedCoinTypes:', requestedCoinTypes)

        if (unsupportedCoinTypes.length > 0) {
          console.log('🚀 ~ checkPriceAvailability ~ 缺失价格的币种:', unsupportedCoinTypes)
        }

        // 将币种地址转换为完整的币种信息
        const missingCoinInfos = unsupportedCoinTypes
          .map(coinType => {
            if (coinType === suiAddressShortToLong(sellCoin?.coin_type || '')) return sellCoin
            if (coinType === suiAddressShortToLong(buyCoin?.coin_type || '')) return buyCoin
            return null
          })
          .filter(Boolean) as Token[]

        setMissingCoins(missingCoinInfos)
        console.log('🚀 ~ checkPriceAvailability ~ priceResponse:', priceResponse)
      } else {
        // 没有返回数据，所有请求的币种都缺失价格
        const allRequestedCoins = [sellCoin, buyCoin].filter(Boolean) as Token[]
        console.log('🚀 ~ checkPriceAvailability ~ priceResponse:', priceResponse)
        setMissingCoins(allRequestedCoins)
      }
    } catch (error) {
      console.log('🚀 ~ checkPriceAvailability ~ error:', error)
      // 请求失败，所有请求的币种都缺失价格
      const allRequestedCoins = [sellCoin, buyCoin].filter(Boolean) as Token[]
      setMissingCoins(allRequestedCoins)
    }
  }
  return {
    currentPrice,
    handleMinInputChange,
    handleMaxInputChange,
    warningTokenList,
    resetInputAmount,
    cycleFrequency,
    btnStatus,
    fetchFindAvailableRouterDebounce,
    queryDcaQuote,
    findRouterLoading,
    platformFee,
    estEndDate,
    sellPerOrder,
    isDcaSelect,
    onReverseClick,
    sellBalanceInfo,
    buyBalanceInfo,
    sellAmountValue,
    handleAmountChange,
    handleSelectToken,
    minPriceValue,
    maxPriceValue,
    handlePageToggleDirect,
    orderSizeError,
    orderInputError,
    priceError,
    orderTimeError,
    missingCoins,
    checkPriceAvailability
  }
}
