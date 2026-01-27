import { SelfMatchingOption } from '@/hooks/deepbook/margin/useMarginOrderActions'
import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { d } from '@cetus/utils'
import { Button } from '@chakra-ui/react'

interface MarginTradePlaceOrderButtonProps {
  tradeType: DeepBookPoolMarginTabs
  isPlacingOrder: boolean
  errorState: any
  currentDeepBookPool: any
  price: string
  amount: string
  leverageRatio: string
  orderType: 'Market' | 'Limit'
  postOnly: boolean
  timeInForce: 'GTC' | 'IOC' | 'FOK'
  payWithDeep: boolean
  borrowAmount: string
  maxFee: string
  setAmount: (value: string) => void
  placeMarginLimitOrder: (
    poolInfo: any,
    priceInput: string,
    quantityInput: string,
    isBid: boolean,
    payWithDeep: boolean,
    postOnly: boolean,
    timeInForce: 'GTC' | 'IOC' | 'FOK',
    selfMatchingOption: SelfMatchingOption,
    marginManagerId?: string,
    onSuccess?: () => void,
    borrowAmount?: string,
    leverage?: string,
    maxFee?: string
  ) => Promise<any>
  placeMarginMarketOrder: (
    poolInfo: any,
    quantityInput: string,
    isBid: boolean,
    payWithDeep: boolean,
    selfMatchingOption: SelfMatchingOption,
    marginManagerId?: string,
    onSuccess?: () => void,
    borrowAmount?: string,
    leverage?: string,
    price?: string,
    maxFee?: string
  ) => Promise<any>
}

export default function MarginTradePlaceOrderButton({
  tradeType,
  isPlacingOrder,
  errorState,
  currentDeepBookPool,
  price,
  amount,
  leverageRatio,
  orderType,
  postOnly,
  timeInForce,
  payWithDeep,
  borrowAmount,
  maxFee,
  setAmount,
  placeMarginLimitOrder,
  placeMarginMarketOrder
}: MarginTradePlaceOrderButtonProps) {
  return (
    <Button
      w="100%"
      h="38px"
      minH="38px"
      bg={tradeType === DeepBookPoolMarginTabs.Long ? 'primary_green' : 'primary_red'}
      _hover={{
        bg: tradeType === DeepBookPoolMarginTabs.Long ? 'primary_green_hover' : 'primary_red_hover',
        opacity: 0.9
      }}
      _disabled={{
        bg: 'primary_disabled',
        opacity: 1,
        color: 'text_paragraph',
        cursor: 'not-allowed'
      }}
      _active={{
        bg: tradeType === DeepBookPoolMarginTabs.Long ? 'primary_green_hover' : 'primary_red_hover',
        opacity: 0.9
      }}
      color="bg_secondary"
      borderRadius="6px"
      fontSize="14px"
      lineHeight="18px"
      fontWeight="500"
      isLoading={isPlacingOrder}
      onClick={async () => {
        // 如果没有池子信息或价格，不执行下单
        if (!currentDeepBookPool || !price || d(price).lte(0)) {
          return
        }

        // 验证 amount 是否有效
        if (!amount || d(amount).lte(0)) {
          return
        }

        try {
          const quantityInput = amount

          // 验证 quantityInput 是否有效
          const quantityDecimal = d(quantityInput)
          if (!quantityInput || quantityDecimal.isNaN() || quantityDecimal.lte(0)) {
            console.error('Invalid quantityInput:', quantityInput)
            return
          }

          // 判断是买单还是卖单
          const isBid = tradeType === DeepBookPoolMarginTabs.Long

          // 判断支付的 token 是否是 DEEP
          const isPayWithDeep = isBid ? currentDeepBookPool?.quoteAssets?.symbol === 'DEEP' : currentDeepBookPool?.baseAssets?.symbol === 'DEEP'

          const finalPayWithDeep = isPayWithDeep ? true : payWithDeep

          if (orderType === 'Limit') {
            await placeMarginLimitOrder(
              currentDeepBookPool,
              price,
              quantityInput,
              isBid,
              finalPayWithDeep,
              postOnly,
              timeInForce,
              SelfMatchingOption.SELF_MATCHING_ALLOWED,
              undefined,
              () => {
                setAmount('')
              },
              borrowAmount,
              leverageRatio,
              maxFee
            )
          } else {
            await placeMarginMarketOrder(
              currentDeepBookPool,
              quantityInput,
              isBid,
              finalPayWithDeep,
              SelfMatchingOption.SELF_MATCHING_ALLOWED,
              undefined,
              () => {
                setAmount('')
              },
              borrowAmount,
              leverageRatio,
              price,
              maxFee
            )
          }
        } catch (error) {
          console.error('Failed to place order:', error)
        }
      }}
      disabled={(() => {
        if (isPlacingOrder) {
          return true
        }

        if (errorState !== null) {
          return true
        }

        if (!amount || amount === '' || d(amount).lte(0)) {
          return true
        }

        // Limit 订单需要价格
        if (orderType === 'Limit' && (!price || d(price).lte(0))) {
          return true
        }

        return false
      })()}
    >
      {errorState?.type === 'insufficient_balance' ? 'Insufficient balance' : `Place ${tradeType.split('/')[1]} Order`}
    </Button>
  )
}
