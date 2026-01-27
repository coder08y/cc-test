import { OrderType } from '@/hooks/deepbook/useGetDeepBookOrderBook'
import { placeholderImg } from '@cetus/ui-kit/src/components/SingleCoinImage'
import { HStack, Image } from '@chakra-ui/react'

const activeStyle = {
  background: 'rgba(118,200,255,0.1)'
  // border: '1px solid rgba(118,200,255,0.2)'
}

const OrderBookTab = ({ orderBookTab, setOrderBookTab }: { orderBookTab: OrderType; setOrderBookTab: (tab: OrderType) => void }) => {
  const OrderBookTabList = [
    {
      key: 'all',
      image: '/images/deepbook/icon_greenredprice@2x.png'
    },
    {
      key: 'bid',
      image: '/images/deepbook/icon_greenprice@2x.png'
    },
    {
      key: 'ask',
      image: '/images/deepbook/icon_redprice@2x.png'
    }
  ]
  return (
    <>
      {OrderBookTabList.map(item => (
        <HStack
          key={item.key}
          cursor="pointer"
          borderRadius="4px"
          p="2px"
          // border="1px solid transparent"
          {...(orderBookTab === item.key && activeStyle)}
          _hover={
            orderBookTab !== item.key
              ? {
                  ...activeStyle
                  // border: '1px solid transparent'
                }
              : {}
          }
        >
          <Image w="16px" h="16px" src={item.image} fallbackSrc={placeholderImg} onClick={() => setOrderBookTab(item.key)} />
        </HStack>
      ))}
    </>
  )
}

export default OrderBookTab
