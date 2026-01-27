import { LimitOrderInfo } from '@/types/limit'
import { Td, Tr } from '@chakra-ui/react'
import React from 'react'
import { CoinInfoBlock } from './OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from './OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from './OrderItemBlock/FilledSizeBlock'
import { OrderActionBlock } from './OrderItemBlock/OrderActionBlock'
import { PriceBlock } from './OrderItemBlock/PriceBlock'

type OrderTableItemProps = {
  orderInfo: LimitOrderInfo
}

export function OrderTableItem({ orderInfo }: OrderTableItemProps) {
  return (
    <React.Fragment key={orderInfo?.order_id}>
      <Tr
        cursor="pointer"
        sx={{
          td: {
            pb: '16px !important'
          }
        }}
      >
        <Td w="30%">
          <CoinInfoBlock info={orderInfo} />
        </Td>
        <Td w="20%" textAlign="right">
          <PriceBlock info={orderInfo} />
        </Td>
        <Td textAlign="right">
          <FilledSizeBlock info={orderInfo} />
        </Td>
        <Td textAlign="right">
          <ExpiryBlock info={orderInfo} />
        </Td>

        <Td textAlign="right">
          <OrderActionBlock orderInfo={orderInfo} />
        </Td>
      </Tr>
      <Tr h="16px" />
    </React.Fragment>
  )
}
