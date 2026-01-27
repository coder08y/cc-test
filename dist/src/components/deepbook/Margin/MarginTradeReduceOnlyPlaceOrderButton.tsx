import { SelfMatchingOption } from '@/hooks/deepbook/margin/useMarginReduceOnlyActions'
import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { d } from '@cetus/utils'
import { Button } from '@chakra-ui/react'

interface MarginTradeReduceOnlyPlaceOrderButtonProps {
  tradeType: DeepBookPoolMarginTabs
  isPlacingOrder: boolean
  currentDeepBookPool: any
  price: string
  amount: string
  orderType: 'Market' | 'Limit'
  postOnly: boolean
  timeInForce: 'GTC' | 'IOC' | 'FOK'
  payWithDeep: boolean
  placeReduceOnlyLimitOrder: (
    poolInfo: any,
    priceInput: string,
    quantityInput: string,
    isBid: boolean,
    payWithDeep: boolean,
    postOnly: boolean,
    timeInForce: 'GTC' | 'IOC' | 'FOK',
    selfMatchingOption: SelfMatchingOption,
    marginManagerId?: string,
    onSuccess?: () => void
  ) => Promise<any>
  placeReduceOnlyMarketOrder: (
    poolInfo: any,
    quantityInput: string,
    isBid: boolean,
    payWithDeep: boolean,
    selfMatchingOption: SelfMatchingOption,
    marginManagerId?: string,
    onSuccess?: () => void
  ) => Promise<any>
  marginManagerByAccount: any[]
}

export default function MarginTradeReduceOnlyPlaceOrderButton({
  tradeType,
  isPlacingOrder,
  currentDeepBookPool,
  price,
  amount,
  orderType,
  postOnly,
  timeInForce,
  payWithDeep,
  placeReduceOnlyLimitOrder,
  placeReduceOnlyMarketOrder,
  marginManagerByAccount
}: MarginTradeReduceOnlyPlaceOrderButtonProps) {
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
      color="bg_secondary"
      borderRadius="6px"
      fontSize="14px"
      lineHeight="18px"
      fontWeight="500"
      isLoading={isPlacingOrder}
      onClick={async () => {
        // 如果没有池子信息，不执行下单
        if (!currentDeepBookPool) {
          return
        }
        // Limit 订单需要价格
        if (orderType === 'Limit' && (!price || d(price).lte(0))) {
          return
        }
        // 如果没有输入数量，不执行下单
        if (!amount || d(amount).lte(0)) {
          return
        }
        try {
          // 判断是买单还是卖单
          // Long = Buy = Bid
          const isBid = tradeType === DeepBookPoolMarginTabs.Long

          // 判断支付的 token 是否是 DEEP
          // Long 订单：买入 base token，手续费用 quote token 支付
          // Short 订单：卖出 base token，手续费用 base token 支付
          const isPayWithDeep = isBid ? currentDeepBookPool?.quoteAssets?.symbol === 'DEEP' : currentDeepBookPool?.baseAssets?.symbol === 'DEEP'

          // 如果支付的 token 是 DEEP，使用 isPayWithDeep，否则使用用户设置的 payWithDeep
          const finalPayWithDeep = isPayWithDeep ? true : payWithDeep

          // 获取 margin manager ID（如果已初始化）
          const marginManager = marginManagerByAccount?.find((m: any) => m?.deepbook_pool_id === currentDeepBookPool?.address)
          const marginManagerId = marginManager?.margin_manager_id

          if (orderType === 'Limit') {
            await placeReduceOnlyLimitOrder(
              currentDeepBookPool,
              price,
              amount,
              isBid,
              finalPayWithDeep,
              postOnly,
              timeInForce,
              SelfMatchingOption.SELF_MATCHING_ALLOWED,
              marginManagerId,
              () => {
                // 下单成功后的回调
                console.log('Reduce-only limit order placed successfully')
              }
            )
          } else {
            // Market order
            await placeReduceOnlyMarketOrder(
              currentDeepBookPool,
              amount,
              isBid,
              finalPayWithDeep,
              SelfMatchingOption.SELF_MATCHING_ALLOWED,
              marginManagerId,
              () => {
                // 下单成功后的回调
                console.log('Reduce-only market order placed successfully')
              }
            )
          }
        } catch (error) {
          console.error('Failed to place reduce-only order:', error)
        }
      }}
      disabled={(() => {
        // 如果正在下单，禁用
        if (isPlacingOrder) {
          return true
        }

        // 如果没有池子信息，禁用
        if (!currentDeepBookPool) {
          return true
        }

        // Limit 订单需要价格
        if (orderType === 'Limit' && (!price || d(price).lte(0))) {
          return true
        }

        // 如果没有输入数量，禁用
        if (!amount || d(amount).lte(0)) {
          return true
        }

        return false
      })()}
    >
      {`Place ${tradeType.split('/')[1]} Order`}
    </Button>
  )
}
