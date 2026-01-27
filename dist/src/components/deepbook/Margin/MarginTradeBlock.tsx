import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
// import MarginTradeCollateralUsed from './MarginTradeCollateralUsed';
import FeeBlock from '../Trade/FeeBlock'
import { OrderBlockTab } from '../Trade/OrderBlockTab'
import PostOnlyBlock from '../Trade/PostOnlyBlock'
import { TradeBlockTab } from '../Trade/TradeBlockTab'
import MarginTradePlaceOrderButton from './MarginTradePlaceOrderButton'
import MarginTradeReduceOnlyBlock from './MarginTradeReduceOnlyBlock'
import MarginTradeReduceOnlyPlaceOrderButton from './MarginTradeReduceOnlyPlaceOrderButton'

import usePlaceMarginOrder from '@/hooks/deepbook/margin/useMarginOrderActions'
import useMarginReduceOnlyActions from '@/hooks/deepbook/margin/useMarginReduceOnlyActions'
import useMarginReduceOnlyTrade from '@/hooks/deepbook/margin/useMarginReduceOnlyTrade'
import useMarginTrade from '@/hooks/deepbook/margin/useMarginTrade'
import { getDecimalPlaces } from '@/hooks/deepbook/useTradeCard'

import useDeepbookMarginDebt from '@/hooks/deepbook/margin/useDeepbookMarginDebt'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { CetusTooltip } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { Icon } from '@cetus/ui-kit'
import { d, formatNumber, formatNumberWithKMB, formatPercentage } from '@cetus/utils'
import { MarginHealthRiskBlock } from './MarginHealthBlock'
import MarginLeverage from './MarginLeverage'
import MarginLeverageAndHealthFactor from './MarginLeverageAndHealthFactor'
import MarginTradeAmountBlock from './MarginTradeAmountBlock'

const marginTradeBlockTabList = [
  {
    label: DeepBookPoolMarginTabs.Long
  },
  {
    label: DeepBookPoolMarginTabs.Short
  }
]

// Reduce-only模式的tooltip内容
const reduceOnlyTooltipContent = (
  <>
    <Text fontSize="12px" lineHeight="16px" color="text_caption">
      Reduce-only Mode
    </Text>
    <Text fontSize="12px" lineHeight="16px" mt="8px">
      During this mode, you can only place orders that reduce your existing position. Any filled reduce-only order will be used to repaying the
      corresponding debt. You can also cancel existing open orders and withdraw assets.
    </Text>
  </>
)

export default function MarginTradeBlock() {
  const { currentAccount, onWalletModal } = useAccountStore()

  const {
    tradeType,
    setTradeType,
    orderType,
    setOrderType,
    price,
    setPrice,
    tickSizeUnit,
    lockPrice,

    healthFactorValue,
    healthFactorStatus,
    healthFactorOriginal,
    healthFactorOriginalStatus,
    errorState,
    // collateralUsed,
    payWithDeep,
    setPayWithDeep,
    maxFee,
    maxFeeIsLoading,
    takerFeeDisplay,
    makerFeeDisplay,
    feeType,
    borrowTokenSymbol,
    borrowTokenPrice,
    amount,
    setAmount,
    handleAmountChange,
    handlePriceChange,
    handleEstValueChange,
    available,
    availableSymbol,
    availableUSD,
    total,
    estTotalUsd,
    estValue,
    setEstValue,
    isEditingEstValue,
    setIsEditingEstValue,
    maxAmount,
    calculatedBorrowAmount
  } = useMarginTrade()

  const { currentDeepBookPool, deepBookAskList, deepBookBidList, openAssetsActionModal } = useDeepBookStore()

  // const { basePrice, quotePrice } = useDeepBookMarginPrices()

  // const [isOpenModal, setIsOpenModal] = useState(false)

  const { marginManagerByAccount } = useMarginStore()
  const poolAddress = currentDeepBookPool?.address || ''
  // 使用 selector 订阅杠杆率变化，确保组件能响应 store 更新
  const leverageRatio = useMarginStore(state => (poolAddress ? state.marginLeverageRatioByPool[poolAddress] || '1.1' : '1.1'))
  const deepBookMarginPools = useDeepBookMarginPoolStore(state => state.deepBookMarginPools)

  // const { riskRatio: currentHealthFactor } = useCalculateRiskRatio()

  // 根据交易方向确定借出的 token coinType
  // Long 借 quote token, Short 借 base token
  const borrowToken = useMemo(() => {
    if (tradeType === DeepBookPoolMarginTabs.Long) {
      return currentDeepBookPool?.quoteAssets || ''
    } else if (tradeType === DeepBookPoolMarginTabs.Short) {
      return currentDeepBookPool?.baseAssets || ''
    }
    return ''
  }, [tradeType, currentDeepBookPool])

  // 从 deepBookMarginPools 中查找对应的 Borrow APR
  const borrowAPRData = useMemo(() => {
    if (!borrowToken || !deepBookMarginPools || deepBookMarginPools.length === 0) {
      return null
    }

    const marginPool = deepBookMarginPools.find((pool: any) => pool.coinType === borrowToken.coin_type) as any

    if (!marginPool || !marginPool.borrowApr) {
      return null
    }

    // borrowApr 是小数形式，需要乘以 100 转换为百分比
    const borrowApr = d(marginPool.borrowApr || '0').times(100)
    return {
      borrowApr: borrowApr,
      borrowAprDisplay: formatPercentage(borrowApr.toString(), 2)
    }
  }, [borrowToken, deepBookMarginPools])

  // 计算每日利率：borrowApr / 365
  const dailyInterest = useMemo(() => {
    if (!borrowAPRData) {
      return null
    }

    // 每日利率 = APR / 365（APR 已经是百分比形式）
    const daily = borrowAPRData.borrowApr.div(365)
    return daily
  }, [borrowAPRData])

  // 格式化 Borrow APR 显示（橙色，如果是负值取绝对值用绿色）
  const borrowAPRDisplay = useMemo(() => {
    if (!borrowAPRData) {
      return { value: '--', color: 'text_caption' }
    }

    const aprValue = borrowAPRData.borrowApr
    const isNegative = aprValue.lt(0)
    const absValue = aprValue.abs()

    return {
      value: formatPercentage(absValue.toString(), 2),
      color: isNegative ? 'primary_green' : '#ff9968'
    }
  }, [borrowAPRData])

  const isLoading = !currentDeepBookPool?.baseAssets?.symbol || !currentDeepBookPool?.quoteAssets?.symbol

  // 获取下单方法（非 reduce-only 模式）
  const { placeMarginLimitOrder, placeMarginMarketOrder, isLoading: isPlacingOrder } = usePlaceMarginOrder()

  // 获取 reduce-only 下单方法
  const { placeReduceOnlyLimitOrder, placeReduceOnlyMarketOrder, isLoading: isPlacingReduceOnlyOrder } = useMarginReduceOnlyActions()

  const { baseDebt, quoteDebt } = useDeepbookMarginDebt()
  // 获取用户原仓位方向（临时状态，实际应从margin账户数据中获取）
  const [userPositionSide, setUserPositionSide] = useState<DeepBookPoolMarginTabs | null>(null)
  useEffect(() => {
    if (d(baseDebt || '0').gt(0)) {
      setUserPositionSide(DeepBookPoolMarginTabs.Short)
    } else if (d(quoteDebt || '0').gt(0)) {
      setUserPositionSide(DeepBookPoolMarginTabs.Long)
    } else {
      setUserPositionSide(null)
    }
  }, [baseDebt, quoteDebt])

  // 在reduce-only模式下，锁定交易方向为反向
  const allowedTradeType = useMemo(() => {
    if (!currentDeepBookPool?.reduceOnly || !userPositionSide) return null
    // 如果用户原仓位是Buy/Long，只能下Sell/Short单
    // 如果用户原仓位是Sell/Short，只能下Buy/Long单
    return userPositionSide === DeepBookPoolMarginTabs.Long ? DeepBookPoolMarginTabs.Short : DeepBookPoolMarginTabs.Long
  }, [currentDeepBookPool?.reduceOnly, userPositionSide])

  // 当进入reduce-only模式时，自动设置交易方向为反向
  useEffect(() => {
    if (currentDeepBookPool?.reduceOnly && allowedTradeType && tradeType !== allowedTradeType) {
      setTradeType(allowedTradeType as DeepBookPoolMarginTabs)
    }
  }, [currentDeepBookPool?.reduceOnly, allowedTradeType, tradeType, setTradeType])

  // 当获取到用户原仓位方向时，自动设置交易方向（非reduce-only模式：设置为相同方向；reduce-only模式：设置为相反方向，由上面的useEffect处理）
  useEffect(() => {
    if (!currentDeepBookPool?.reduceOnly && userPositionSide && tradeType !== userPositionSide) {
      setTradeType(userPositionSide)
    }
  }, [userPositionSide, currentDeepBookPool?.reduceOnly, tradeType, setTradeType])

  // 使用专门用于 reduce-only 模式的 hook（区别于现货交易）
  const reduceOnlyTradeData = useMarginReduceOnlyTrade(tradeType)

  // 在reduce-only模式下，使用 reduce-only 交易的数据
  const {
    amount: reduceOnlyAmount,
    setAmount: setReduceOnlyAmount,
    estTotalUsd: reduceOnlyEstTotalUsd,
    total: reduceOnlyTotal,
    available: reduceOnlyAvailable,
    maxFee: reduceOnlyMaxFee,
    takerFeeDisplay: reduceOnlyTakerFeeDisplay,
    makerFeeDisplay: reduceOnlyMakerFeeDisplay,
    feeType: reduceOnlyFeeType,
    maxFeeIsLoading: reduceOnlyMaxFeeIsLoading,
    isShowOrderVolumeError: reduceOnlyIsShowOrderVolumeError,
    tickSizeUnit: reduceOnlyTickSizeUnit,
    minSizeUnit: reduceOnlyMinSizeUnit,
    postOnly: reduceOnlyPostOnly,
    setPostOnly: setReduceOnlyPostOnly,
    payWithDeep: reduceOnlyPayWithDeep,
    setPayWithDeep: setReduceOnlyPayWithDeep,
    timeInForce: reduceOnlyTimeInForce,
    setTimeInForce: setReduceOnlyTimeInForce,
    price: reduceOnlyPrice // reduce-only 模式下的 limit price
  } = reduceOnlyTradeData

  // Post Only 和 Time In Force 状态
  const [postOnly, setPostOnly] = useState(false)
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC')

  // 在reduce-only模式下，同步spot交易的状态
  useEffect(() => {
    if (currentDeepBookPool?.reduceOnly) {
      setPostOnly(reduceOnlyPostOnly)
      setPayWithDeep(reduceOnlyPayWithDeep)
      setTimeInForce(reduceOnlyTimeInForce)
    }
  }, [currentDeepBookPool?.reduceOnly, reduceOnlyPostOnly, reduceOnlyPayWithDeep, reduceOnlyTimeInForce, setPayWithDeep])

  // 在reduce-only模式下，使用 reduce-only 的手续费信息
  const finalTakerFeeDisplay = currentDeepBookPool?.reduceOnly ? reduceOnlyTakerFeeDisplay : takerFeeDisplay
  const finalMakerFeeDisplay = currentDeepBookPool?.reduceOnly ? reduceOnlyMakerFeeDisplay : makerFeeDisplay
  const finalFeeType = currentDeepBookPool?.reduceOnly ? reduceOnlyFeeType : feeType
  const finalMaxFeeIsLoading = currentDeepBookPool?.reduceOnly ? reduceOnlyMaxFeeIsLoading : maxFeeIsLoading

  const from = useMemo(() => {
    return {
      title: 'Price',
      symbol: currentDeepBookPool?.quoteAssets?.symbol,
      value: price,
      onChange: (e: any) => handlePriceChange(e),
      decimals: tickSizeUnit,
      onUserInput: lockPrice
    }
  }, [price, currentDeepBookPool?.quoteAssets?.symbol, tickSizeUnit, lockPrice, handlePriceChange])

  // 计算 minSizeUnit（用于 Amount 输入精度）
  const minSizeUnit = useMemo(() => {
    if (currentDeepBookPool?.lotSize) {
      return getDecimalPlaces(Number(currentDeepBookPool.lotSize))
    }
    return currentDeepBookPool?.baseAssets?.decimals || 9
  }, [currentDeepBookPool?.lotSize, currentDeepBookPool?.baseAssets?.decimals])

  // Amount 输入配置
  const to = useMemo(() => {
    return {
      title: 'Amount',
      symbol: currentDeepBookPool?.baseAssets?.symbol,
      value: amount,
      onChange: (e: any) => handleAmountChange(e),
      decimals: minSizeUnit
    }
  }, [amount, handleAmountChange, currentDeepBookPool?.baseAssets?.symbol, minSizeUnit])

  // 单向开仓模式的tooltip内容
  const oneWayPositionTooltipContent = useMemo(() => {
    return (
      <>
        <Text fontSize="12px" lineHeight="16px" color="text_caption">
          One-way exposure enabled
        </Text>
        <Text fontSize="12px" lineHeight="16px" mt="8px">
          You can only hold one direction (buy or sell) for this pair. To place an order in the opposite direction, please repay your current debt
          first.
          <Text
            onClick={() => {
              openAssetsActionModal('Repay', borrowToken)
            }}
            as="span"
            cursor="pointer"
            fontSize="12px"
            lineHeight="16px"
            color="primary"
            ml="4px"
          >
            Repay &gt;
          </Text>
        </Text>
      </>
    )
  }, [borrowToken, openAssetsActionModal])

  // 准备tabList，根据用户仓位方向和模式设置disabled和tooltip
  const marginTabList = useMemo(() => {
    if (!userPositionSide) {
      return marginTradeBlockTabList
    }

    return marginTradeBlockTabList.map(tab => {
      // 单向开仓逻辑：如果用户持有buy方向仓位，禁用sell tab；如果持有sell方向仓位，禁用buy tab
      const isDisabledByOneWay =
        tab.label === (userPositionSide === DeepBookPoolMarginTabs.Long ? DeepBookPoolMarginTabs.Short : DeepBookPoolMarginTabs.Long)

      // Reduce-only模式逻辑：如果用户原仓位是Buy/Long，禁用Buy/Long tab；如果原仓位是Sell/Short，禁用Sell/Short tab
      // 在reduce-only模式下，用户只能下反向单来减少仓位
      const isDisabledByReduceOnly = currentDeepBookPool?.reduceOnly && tab.label === userPositionSide

      // 确定禁用状态和tooltip
      let isDisabled = false
      let tooltipContent = null

      if (currentDeepBookPool?.reduceOnly) {
        // 在reduce-only模式下，只应用reduce-only逻辑，不应用单向开仓逻辑
        // 用户原仓位方向的tab被禁用，显示reduce-only tooltip
        isDisabled = isDisabledByReduceOnly
        if (isDisabled) {
          tooltipContent = reduceOnlyTooltipContent
        }
      } else {
        // 在非reduce-only模式下，只应用单向开仓逻辑
        isDisabled = isDisabledByOneWay
        if (isDisabled) {
          tooltipContent = oneWayPositionTooltipContent
        }
      }

      return {
        ...tab,
        disabled: isDisabled,
        ...(tooltipContent
          ? {
              tooltip: tooltipContent,
              tooltipPlacement: 'top' as const
            }
          : {})
      }
    })
  }, [currentDeepBookPool?.reduceOnly, userPositionSide, oneWayPositionTooltipContent])

  // 在reduce-only模式下，准备reduceOnly交易的from/to配置
  const reduceOnlyFrom = useMemo(() => {
    if (!currentDeepBookPool?.reduceOnly) return null
    return {
      title: 'Price',
      symbol: currentDeepBookPool?.quoteAssets?.symbol,
      value: reduceOnlyPrice,
      onChange: (e: any) => setPrice(e),
      decimals: reduceOnlyTickSizeUnit,
      onUserInput: lockPrice
    }
  }, [currentDeepBookPool?.reduceOnly, currentDeepBookPool, price, reduceOnlyTickSizeUnit, lockPrice])

  const reduceOnlyTo = useMemo(() => {
    if (!currentDeepBookPool?.reduceOnly) return null
    return {
      title: 'Amount',
      symbol: currentDeepBookPool?.baseAssets?.symbol,
      value: reduceOnlyAmount,
      onChange: (e: any) => setReduceOnlyAmount(e),
      decimals: reduceOnlyMinSizeUnit
    }
  }, [currentDeepBookPool?.reduceOnly, currentDeepBookPool, reduceOnlyAmount, setReduceOnlyAmount, reduceOnlyMinSizeUnit])

  return (
    <VStack
      // maxH={{lg: '562px'}}
      overflowY="auto"
      w="100%"
      bg="bg_secondary"
      p="12px"
      pr="8px"
      gap={'12px'}
      borderRadius={{ base: 0, lg: '0 0 8px 8px' }}
      overflowX="hidden"
      css={{
        scrollbarGutter: 'stable',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none'
      }}
    >
      <TradeBlockTab
        currentTab={tradeType}
        setCurrentTab={(tab: string) => {
          // 在reduce-only模式下，阻止切换到不允许的方向
          if (currentDeepBookPool?.reduceOnly && allowedTradeType && tab !== allowedTradeType) {
            return
          }
          // 在非reduce-only模式下，如果用户持有仓位，阻止切换到相反方向
          if (!currentDeepBookPool?.reduceOnly && userPositionSide) {
            const oppositeTab = userPositionSide === DeepBookPoolMarginTabs.Long ? DeepBookPoolMarginTabs.Short : DeepBookPoolMarginTabs.Long
            if (tab === oppositeTab) {
              return
            }
          }
          setTradeType(tab as DeepBookPoolMarginTabs)
        }}
        tabList={marginTabList}
      />
      <MarginLeverage />

      <OrderBlockTab currentTab={orderType} setCurrentTab={setOrderType} reduceOnly={currentDeepBookPool?.reduceOnly} />

      {currentDeepBookPool?.reduceOnly ? (
        // Reduce-only模式：使用类似spot交易的布局
        <MarginTradeReduceOnlyBlock
          reduceOnlyFrom={reduceOnlyFrom!}
          reduceOnlyTo={reduceOnlyTo!}
          isShowOrderVolumeError={reduceOnlyIsShowOrderVolumeError}
          currentDeepBookPool={currentDeepBookPool}
          orderType={orderType}
          reduceOnlyAvailable={reduceOnlyAvailable || '0'}
          tradeType={tradeType}
          price={price}
          reduceOnlyMaxFee={reduceOnlyMaxFee}
          reduceOnlyTotal={reduceOnlyTotal}
          reduceOnlyEstTotalUsd={reduceOnlyEstTotalUsd}
          reduceOnlyPostOnly={reduceOnlyPostOnly}
          setReduceOnlyPostOnly={setReduceOnlyPostOnly}
          reduceOnlyTimeInForce={reduceOnlyTimeInForce}
          setReduceOnlyTimeInForce={setReduceOnlyTimeInForce}
          reduceOnlyTakerFeeDisplay={reduceOnlyTakerFeeDisplay}
          reduceOnlyMakerFeeDisplay={reduceOnlyMakerFeeDisplay}
          reduceOnlyFeeType={reduceOnlyFeeType}
          reduceOnlyMaxFeeIsLoading={reduceOnlyMaxFeeIsLoading}
          reduceOnlyPayWithDeep={reduceOnlyPayWithDeep}
          setReduceOnlyPayWithDeep={setReduceOnlyPayWithDeep}
        />
      ) : (
        // 正常模式：使用margin交易的布局
        <>
          <MarginTradeAmountBlock
            from={from}
            to={to}
            isShowOrderVolumeError={d(amount || '0').gt('0') && d(amount).lt(currentDeepBookPool?.minSize || '0')}
            currentDeepBookPool={currentDeepBookPool}
            orderType={orderType}
            available={available || '0'}
            availableSymbol={availableSymbol}
            availableUSD={availableUSD}
            tradeType={tradeType}
            price={price}
            maxFee={maxFee}
            maxAmount={maxAmount}
            total={total}
            estTotalUsd={estTotalUsd}
            estValue={estValue}
            setEstValue={setEstValue}
            handleEstValueChange={handleEstValueChange}
            isEditingEstValue={isEditingEstValue}
            setIsEditingEstValue={setIsEditingEstValue}
          />
        </>
      )}

      {!currentDeepBookPool?.reduceOnly && (
        <>
          {orderType === 'Limit' && (
            <PostOnlyBlock postOnly={postOnly} setPostOnly={setPostOnly} timeInForce={timeInForce} setTimeInForce={setTimeInForce} />
          )}
          {errorState && errorState.type !== 'insufficient_balance' && <MarginHealthRiskBlock text={errorState.text} variant={errorState.variant} />}
        </>
      )}
      {!currentAccount?.address ? (
        <Button
          w="100%"
          h="38px"
          minH="38px"
          fontWeight="500"
          borderRadius="6px"
          fontSize="14px"
          lineHeight="18px"
          onClick={() => onWalletModal(true)}
        >
          Connect Wallet
        </Button>
      ) : currentDeepBookPool?.reduceOnly ? (
        // Reduce-only 模式：使用专门的 reduce-only 按钮
        <MarginTradeReduceOnlyPlaceOrderButton
          tradeType={tradeType}
          isPlacingOrder={isPlacingReduceOnlyOrder}
          currentDeepBookPool={currentDeepBookPool}
          price={reduceOnlyPrice}
          amount={reduceOnlyAmount}
          orderType={orderType}
          postOnly={reduceOnlyPostOnly}
          timeInForce={reduceOnlyTimeInForce}
          payWithDeep={reduceOnlyPayWithDeep}
          placeReduceOnlyLimitOrder={placeReduceOnlyLimitOrder}
          placeReduceOnlyMarketOrder={placeReduceOnlyMarketOrder}
          marginManagerByAccount={marginManagerByAccount}
        />
      ) : (
        // 非 reduce-only 模式：使用原有的按钮
        <MarginTradePlaceOrderButton
          tradeType={tradeType}
          isPlacingOrder={isPlacingOrder}
          errorState={errorState}
          currentDeepBookPool={currentDeepBookPool}
          price={price}
          amount={amount}
          leverageRatio={leverageRatio}
          orderType={orderType}
          postOnly={postOnly}
          timeInForce={timeInForce}
          payWithDeep={payWithDeep}
          borrowAmount={calculatedBorrowAmount}
          maxFee={maxFee}
          setAmount={setAmount}
          placeMarginLimitOrder={placeMarginLimitOrder}
          placeMarginMarketOrder={placeMarginMarketOrder}
        />
      )}

      {!currentDeepBookPool?.reduceOnly && amount !== '' && amount !== '0' && errorState?.type !== 'insufficient_balance' && (
        <>
          <HStack w="100%" justifyContent="space-between">
            <HStack gap="4px">
              <Text fontSize="12px" lineHeight="16px">
                Est. Borrow Amount
              </Text>
              <CetusTooltip
                tooltip={
                  <Text fontSize="12px" lineHeight="16px">
                    The estimated amount you will borrow when this order is placed. Interest starts accruing immediately, regardless of whether the
                    order is filled.
                  </Text>
                }
              >
                <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
              </CetusTooltip>
            </HStack>
            <HStack gap="4px">
              <Text fontSize="12px" lineHeight="16px" color="text_caption">
                {formatNumber(calculatedBorrowAmount.toString())} {borrowTokenSymbol}
              </Text>
              <Text fontSize="12px" lineHeight="16px">
                ($
                {formatNumberWithKMB(d(calculatedBorrowAmount).mul(borrowTokenPrice).toString())})
              </Text>
            </HStack>
          </HStack>

          {/* <HStack w="100%" justifyContent="space-between">
            <HStack gap="4px">
              <Text fontSize="12px" lineHeight="16px">
                Est. Borrow APR
              </Text>
              <CetusTooltip
                tooltip={
                  <Text fontSize="12px" lineHeight="16px">
                    The current borrow rate of margin pool. Interest accrues continuously and the rate may change over time based on its utilization.
                    The rate shown in red indicates borrowing costs, while the rate in green indicates potential earnings.
                  </Text>
                }
              >
                <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
              </CetusTooltip>
            </HStack>
            <CetusTooltip
              placement="top"
              tooltip={
                <VStack>
                  {[
                    {
                      label: `${borrowTokenSymbol} Borrow APR`,
                      value: borrowAPRData ? borrowAPRData.borrowAprDisplay : '--'
                    },
                    {
                      label: 'Est. Hourly Interest',
                      value: dailyInterest ? formatPercentage(dailyInterest.toString(), 2) : '--'
                    }
                  ].map(item => (
                    <HStack key={item.label} justifyContent="space-between" w="100%" gap="24px">
                      <Text fontSize="12px" lineHeight="16px">
                        {item.label}
                      </Text>
                      <Text fontSize="12px" lineHeight="16px" color={borrowAPRDisplay.color}>
                        {item.value}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              }
            >
              <Text fontSize="12px" lineHeight="16px" color={borrowAPRDisplay.color} textDecoration={'underline dotted'}>
                {borrowAPRDisplay.value}
              </Text>
            </CetusTooltip>
          </HStack> */}
          <MarginLeverageAndHealthFactor
            healthFactorValue={healthFactorValue as number | '∞' | null}
            healthFactorStatus={healthFactorStatus}
            healthFactorOriginal={healthFactorOriginal}
            healthFactorOriginalStatus={healthFactorOriginalStatus}
          />
          <FeeBlock
            currentDeepBookPool={currentDeepBookPool}
            tradeType={tradeType}
            takerFeeDisplay={finalTakerFeeDisplay}
            makerFeeDisplay={finalMakerFeeDisplay}
            feeType={finalFeeType}
            maxFeeIsLoading={finalMaxFeeIsLoading}
            isLoading={isLoading}
            payWithDeep={payWithDeep}
            setPayWithDeep={setPayWithDeep}
            askList={deepBookAskList}
            bidList={deepBookBidList}
            currentOrderType={orderType}
          />
        </>
      )}
    </VStack>
  )
}
