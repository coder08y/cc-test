import useTradeCard from '@/hooks/deepbook/useTradeCard'
import useDeepBookStore from '@/store/deepbook'

import { useAccountStore } from '@cetus/stores'
import { HTextLabelBox } from '@cetus/ui-kit'
import { Decimal, abbreviateTokenName, d, formatNumber, formatNumberWithDown, formatNumberWithKMB } from '@cetus/utils'
import { Box, Button, HStack, Input, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

import InputBlockGroup, { LotSizeError, OrderVolumeError } from '../InputBlockGroup'

import FeeBlock from './FeeBlock'
import { OrderBlockTab } from './OrderBlockTab'
import PostOnlyBlock from './PostOnlyBlock'
import { TradeBlockTab } from './TradeBlockTab'

const tradeBlockTabList = [
  {
    label: 'Buy'
  },
  {
    label: 'Sell'
  }
]

const OrderInfoBlock = ({
  currentOrderType,
  isShowOrderVolumeError,
  estTotal,
  currentDeepBookPool,
  estTotalUsd,
  available,
  maxFee,
  takerFeeDisplay,
  makerFeeDisplay,
  feeType,
  maxFeeIsLoading,
  tradeType,
  total,
  isLoading,
  postOnly,
  setPostOnly,
  payWithDeep,
  setPayWithDeep,
  timeInForce,
  setTimeInForce,
  price,
  setAmount,
  minSizeUnit,
  askList,
  bidList
}: {
  currentOrderType: 'Market' | 'Limit'
  isShowOrderVolumeError: boolean
  estTotal: string
  currentDeepBookPool: any
  estTotalUsd: string
  available: string | undefined
  maxFee: string
  takerFeeDisplay: string
  makerFeeDisplay: string
  feeType: string
  maxFeeIsLoading: boolean
  tradeType: 'Buy' | 'Sell'
  total: string | undefined
  isLoading: boolean
  postOnly: boolean
  setPostOnly: (postOnly: boolean) => void
  payWithDeep: boolean
  setPayWithDeep: (payWithDeep: boolean) => void
  timeInForce: 'GTC' | 'IOC' | 'FOK'
  setTimeInForce: (tif: 'GTC' | 'IOC' | 'FOK') => void
  price: string
  setAmount: (amount: string) => void
  minSizeUnit: number | undefined
  askList: any[]
  bidList: any[]
}) => {
  // New Add: Est.Value 输入框（仅 Limit 模式）
  const [estValueInput, setEstValueInput] = useState('')
  const [isEditingEstValue, setIsEditingEstValue] = useState(false)

  // 当 priceStatus 为 false 时，不支持 DEEP 支付手续费，强制设置为 false
  useEffect(() => {
    if (currentDeepBookPool?.priceStatus === false) {
      setPayWithDeep(false)
    }
  }, [currentDeepBookPool?.priceStatus, setPayWithDeep])

  // 处理 Est.Value 输入变化
  const handleEstValueChange = (value: string) => {
    // 只允许数字和小数点
    if (value && !/^\d*\.?\d*$/.test(value)) {
      return
    }

    // 限制最多6位小数
    if (value.includes('.')) {
      const parts = value.split('.')
      if (parts[1] && parts[1].length > 6) {
        return // 超过6位小数，不处理
      }
    }

    // 去除前导0，但保留 "0." 开头的情况
    let cleanedValue = value
    if (value && value !== '0' && value !== '0.') {
      // 如果是纯数字开头（不是 0.xxx），去除前导0
      if (/^0+\d/.test(value)) {
        cleanedValue = value.replace(/^0+/, '')
      }
    }

    setEstValueInput(cleanedValue)

    // 如果有价格，根据 Est.Value 反向计算 amount
    // amount = estValue / price
    // 然后使用 formatNumberWithDown 向下取整到最近的精度值
    if (cleanedValue && price && d(price).gt(0) && d(cleanedValue).gt(0)) {
      try {
        const rawAmount = d(cleanedValue).div(d(price)).toString()
        // 按精度向下舍入（参考 InputBlockGroup 的处理方式）
        const amountDecimals = minSizeUnit
        console.log('🚀🚀🚀 ~ OrderInfoBlock.tsx:249 ~ handleEstValueChange ~ amountDecimals:', amountDecimals)
        const formattedAmount = formatNumberWithDown(rawAmount, amountDecimals, true)
        setAmount(formattedAmount)
      } catch (error) {
        console.error('Error calculating amount from est value:', error)
      }
    } else if (!cleanedValue) {
      setAmount('')
    }
  }

  // 格式化显示的 total 值，避免显示过长的小数
  const formattedTotal = useMemo(() => {
    if (!total || total === '--') return ''
    // 使用 formatNumber 格式化，默认最多显示6位小数
    return formatNumber(total, 6)
  }, [total])
  return (
    <VStack w="100%" p={'0px'} gap="12px">
      <Box w="100%" border="1px solid" borderColor="border" borderRadius="8px" p="12px">
        {/* Market 模式：只读显示 */}
        {currentOrderType === 'Market' && (
          <HTextLabelBox
            label={'Total'}
            value={
              total === '--' ? (
                <Text color="text_caption">--</Text>
              ) : (
                <HStack whiteSpace="nowrap" w="100%">
                  <Text fontSize={'14px'} color="text_caption">
                    {formatNumber(total)} {abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)}
                  </Text>
                  <Text fontSize={'14px'}>≈ ${formatNumberWithKMB(estTotalUsd)}</Text>
                </HStack>
              )
            }
            labelStyle={{ fontSize: '14px' }}
            valueStyle={{ fontSize: '14px', maxW: '100%' }}
            wrapStyle={{ h: '20px', lineHeight: '20px' }}
          />
        )}

        {/* Limit 模式：可输入的 Est.Value */}
        {currentOrderType === 'Limit' && (
          <HStack w="100%" h="20px" lineHeight="20px" justifyContent="space-between" alignItems="center">
            <Text fontSize="14px" color="text_paragraph">
              Total
            </Text>
            <HStack gap="4px" flex="1" justifyContent="flex-end" alignItems="center">
              <Input
                value={isEditingEstValue ? estValueInput : formattedTotal}
                onChange={e => handleEstValueChange(e.target.value)}
                onFocus={() => {
                  setIsEditingEstValue(true)
                  if (!estValueInput && formattedTotal) {
                    setEstValueInput(formattedTotal)
                  }
                }}
                onBlur={() => {
                  setIsEditingEstValue(false)
                  setEstValueInput('')
                }}
                placeholder="0.0"
                fontSize="14px"
                color="text_caption"
                textAlign="right"
                border="none"
                p="0"
                h="20px"
                minW="60px"
                maxW="120px"
                _focus={{
                  boxShadow: 'none',
                  border: 'none'
                }}
                _placeholder={{
                  color: 'text_caption'
                }}
              />
              <Text mr="4px" fontSize="14px" color="text_caption" whiteSpace="nowrap">
                {abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)}
              </Text>
              {total !== '--' && estTotalUsd && (
                <Text fontSize="14px" color="text_paragraph" whiteSpace="nowrap">
                  ≈ ${formatNumberWithKMB(estTotalUsd)}
                </Text>
              )}
            </HStack>
          </HStack>
        )}
      </Box>
      {currentOrderType === 'Limit' && (
        <PostOnlyBlock postOnly={postOnly} setPostOnly={setPostOnly} timeInForce={timeInForce} setTimeInForce={setTimeInForce} />
      )}
      <HTextLabelBox
        label={<Text fontSize={'12px'}>Available</Text>}
        value={
          isLoading ? (
            <Skeleton />
          ) : (
            <Text
              fontSize={'12px'}
              color={'text_caption'}
            >{`${formatNumber(available, undefined, undefined, Decimal.ROUND_DOWN)} ${tradeType === 'Buy' ? abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol) : abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)}`}</Text>
          )
        }
        labelStyle={{ fontSize: '14px' }}
        valueStyle={{ fontSize: '14px' }}
        wrapStyle={{ h: '14px', lineHeight: '14px' }}
      />
      <FeeBlock
        currentDeepBookPool={currentDeepBookPool}
        currentOrderType={currentOrderType}
        tradeType={tradeType}
        takerFeeDisplay={takerFeeDisplay}
        makerFeeDisplay={makerFeeDisplay}
        feeType={feeType}
        maxFeeIsLoading={maxFeeIsLoading}
        isLoading={isLoading}
        payWithDeep={payWithDeep}
        setPayWithDeep={setPayWithDeep}
        askList={askList}
        bidList={bidList}
      />
    </VStack>
  )
}

function TradeBlock() {
  const {
    setMaxFeeIsLoading,
    tradeType,
    setTradeType,
    orderType,
    setOrderType,
    price,
    setPrice,
    lockPrice,
    amount,
    setAmount,
    currentDeepBookPool,
    isShowOrderVolumeError,
    isShowLotSizeError,
    estTotal,
    estTotalUsd,
    available,
    maxFee,
    takerFeeDisplay,
    makerFeeDisplay,
    feeType,
    maxFeeIsLoading,
    btnInfo,
    placeMarketOrder,
    placeOrderLoading,
    placeLimitOrder,
    total,
    tickSizeUnit,
    minSizeUnit,
    postOnly,
    setPostOnly,
    payWithDeep,
    setPayWithDeep,
    timeInForce,
    setTimeInForce,
    insufficientDeep,
    showFOKOrderError
  } = useTradeCard()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { deepBookAskList, deepBookBidList } = useDeepBookStore()

  const isLoading = !currentDeepBookPool?.baseAssets?.symbol || !currentDeepBookPool?.quoteAssets?.symbol

  return (
    <VStack w="100%" bg="bg_secondary" p="12px" gap={'12px'} borderRadius="0 0 8px 8px">
      <TradeBlockTab currentTab={tradeType} setCurrentTab={(tab: string) => setTradeType(tab as 'Buy' | 'Sell')} tabList={tradeBlockTabList} />
      <OrderBlockTab currentTab={orderType} setCurrentTab={setOrderType} />
      <InputBlockGroup
        from={{
          title: 'Price',
          symbol: abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol),
          value: price,
          onChange: e => setPrice(e),
          decimals: tickSizeUnit,
          onUserInput: lockPrice
        }}
        to={{
          title: 'Amount',
          symbol: abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol),
          value: amount,
          onChange: e => {
            setAmount(e)
            if (e) {
              setMaxFeeIsLoading(true)
            }
          },
          decimals: minSizeUnit
        }}
        isShowOrderVolumeError={isShowOrderVolumeError}
        minSize={currentDeepBookPool?.minSize}
        isMarket={orderType == 'Market'}
        maxAvailable={available || '0'}
        tradeType={tradeType}
        price={price}
        maxFee={maxFee}
        tradeAssetCoinType={tradeType === 'Buy' ? currentDeepBookPool?.quoteAssets?.coin_type : currentDeepBookPool?.baseAssets?.coin_type}
      />
      <OrderInfoBlock
        askList={deepBookAskList}
        bidList={deepBookBidList}
        currentOrderType={orderType}
        isShowOrderVolumeError={isShowOrderVolumeError}
        estTotal={estTotal}
        currentDeepBookPool={currentDeepBookPool}
        estTotalUsd={estTotalUsd}
        available={available}
        maxFee={maxFee}
        takerFeeDisplay={takerFeeDisplay}
        makerFeeDisplay={makerFeeDisplay}
        feeType={feeType}
        maxFeeIsLoading={maxFeeIsLoading}
        tradeType={tradeType}
        total={total}
        isLoading={isLoading}
        postOnly={postOnly}
        setPostOnly={setPostOnly}
        payWithDeep={payWithDeep}
        setPayWithDeep={setPayWithDeep}
        timeInForce={timeInForce}
        setTimeInForce={setTimeInForce}
        price={price}
        setAmount={setAmount}
        minSizeUnit={minSizeUnit}
      />
      {isShowOrderVolumeError && (
        <OrderVolumeError
          minSize={currentDeepBookPool?.minSize as string}
          baseSymbol={abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)}
        />
      )}

      {!isShowOrderVolumeError && isShowLotSizeError && (
        <LotSizeError
          lotSize={currentDeepBookPool?.lotSize as string}
          baseSymbol={abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)}
          inputAmount={amount}
        />
      )}

      {insufficientDeep && (
        <VStack
          w="100%"
          px="6px"
          h={'28px'}
          lineHeight={'28px'}
          borderRadius="6px"
          bg="primary_yellow_opacity.10"
          justifyContent="flex-end"
          alignItems={'flex-start'}
        >
          <Text lineHeight={'28px'} h={'28px'} fontSize="12px" color="primary_yellow">
            Insufficient DEEP to cover the fee
          </Text>
        </VStack>
      )}
      {showFOKOrderError && (
        <VStack
          w="100%"
          px="6px"
          h={'28px'}
          lineHeight={'28px'}
          borderRadius="6px"
          bg="primary_yellow_opacity.10"
          justifyContent="flex-end"
          alignItems={'flex-start'}
        >
          <Text lineHeight={'28px'} h={'28px'} fontSize="12px" color="primary_yellow">
            The FOK order can't be filled immediately at your price
          </Text>
        </VStack>
      )}
      {currentAccount?.address ? (
        <Button
          w="100%"
          fontSize="14px"
          fontWeight="500"
          height={'38px'}
          borderRadius="6px"
          isDisabled={btnInfo?.disabled}
          onClick={orderType == 'Market' ? placeMarketOrder : placeLimitOrder}
          isLoading={placeOrderLoading || maxFeeIsLoading}
          variant={tradeType == 'Buy' ? 'solid-buy' : 'solid-sell'}
        >
          {btnInfo?.text || `Place ${tradeType} Order`}
        </Button>
      ) : (
        <Button w="100%" fontSize="16px" fontWeight="500" onClick={() => onWalletModal(true)}>
          Connect Wallet
        </Button>
      )}
    </VStack>
  )
}

export default TradeBlock
