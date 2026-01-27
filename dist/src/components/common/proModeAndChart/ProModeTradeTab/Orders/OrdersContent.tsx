import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box } from '@chakra-ui/react'
import { useState } from 'react'
import Dca from './dcaOrders/dca'
import Limit from './limitOrders/limit'

function OrdersContent({ maxHeight }: { maxHeight: any }) {
  const orderTabList = [
    {
      label: 'Limit Orders',
      value: 'limitOrders'
    },
    {
      label: 'DCA',
      value: 'dca'
    }
  ]
  const [currentOrderTab, setCurrentOrderTab] = useState('Limit Orders')
  const { isApp } = useWindowWidth()
  return (
    <Block
      w="100%"
      borderRadius="16px"
      p={{ base: '0', lg: '0px 0px 16px' }}
      bg={{ base: 'none', lg: 'none' }}
      backdropFilter={{ base: 'none', lg: 'blur(20px)' }}
      border="none"
      mt={{ base: '16px', lg: '-6px' }}
    >
      <Box w="100%">
        {currentOrderTab === 'Limit Orders' && (
          <Limit maxHeight={maxHeight} currentOrderTab={currentOrderTab} orderTabList={orderTabList} setCurrentOrderTab={setCurrentOrderTab} />
        )}
        {currentOrderTab === 'DCA' && (
          <Dca maxHeight={maxHeight} currentOrderTab={currentOrderTab} orderTabList={orderTabList} setCurrentOrderTab={setCurrentOrderTab} />
        )}
      </Box>
    </Block>
  )
}

export default OrdersContent
