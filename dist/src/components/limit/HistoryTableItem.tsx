import { LimitOrderInfo } from '@/types/limit'
import { Td, Tr } from '@chakra-ui/react'
import React, { useState } from 'react'
import { CoinInfoBlock } from './OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from './OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from './OrderItemBlock/FilledSizeBlock'
import { LimitExpendBlock } from './OrderItemBlock/LimitExpendBlock'
import { PriceBlock } from './OrderItemBlock/PriceBlock'
import { StatusBlock } from './OrderItemBlock/StatusBlock'

type HistoryTableItemProps = {
  historyInfo: LimitOrderInfo
}

export function HistoryTableItem({ historyInfo }: HistoryTableItemProps) {
  const [openExpendItemObj, setOpenExpendItemObj] = useState<Record<string, boolean>>({})
  return (
    <React.Fragment key={historyInfo?.order_id}>
      <Tr
        cursor="pointer"
        onClick={() => {
          if (openExpendItemObj[historyInfo?.order_id]) {
            openExpendItemObj[historyInfo?.order_id] = false
          } else {
            openExpendItemObj[historyInfo?.order_id] = true
          }
          setOpenExpendItemObj({ ...openExpendItemObj })
        }}
        sx={{
          td: {
            pb: openExpendItemObj[historyInfo?.order_id] ? '20px !important' : '16px !important'
          }
        }}
      >
        <Td w="30%">
          <CoinInfoBlock info={historyInfo} />
        </Td>
        <Td w="20%" textAlign="right">
          <PriceBlock info={historyInfo} />
        </Td>
        <Td textAlign="right">
          <ExpiryBlock info={historyInfo} />
        </Td>
        <Td textAlign="right">
          <FilledSizeBlock info={historyInfo} />
        </Td>

        <Td textAlign="right">
          <StatusBlock historyInfo={historyInfo} openExpendItemObj={openExpendItemObj} />
        </Td>
      </Tr>

      {!openExpendItemObj[historyInfo?.order_id] && <Tr h="16px" />}

      <Tr
        position="relative"
        top="-20px"
        left="0px"
        sx={{
          td: {
            p: '0 !important',
            bg: 'transparent !important',
            border: 'none !important',
            _first: {
              borderRadius: ' 16px !important'
            },
            _last: {
              borderRadius: '0 0 16px 0 !important'
            }
          },
          _hover: {
            bg: 'transparent !important',
            td: {
              bg: 'transparent !important'
            }
          }
        }}
      >
        {openExpendItemObj[historyInfo?.order_id] && (
          <Td colSpan={5}>
            <LimitExpendBlock historyInfo={historyInfo} />
          </Td>
        )}
      </Tr>
    </React.Fragment>
  )
}
