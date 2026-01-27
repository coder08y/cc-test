import { CoinInfoBlock } from '@/components/limit/OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from '@/components/limit/OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from '@/components/limit/OrderItemBlock/FilledSizeBlock'
import { LimitExpendBlock } from '@/components/limit/OrderItemBlock/LimitExpendBlock'
import { PriceBlock } from '@/components/limit/OrderItemBlock/PriceBlock'
import { StatusBlock } from '@/components/limit/OrderItemBlock/StatusBlock'
import { LimitOrderInfo } from '@/types/limit'
import { Td, Tr } from '@chakra-ui/react'
import React, { useState } from 'react'

type HistoryTableItemProps = {
  historyInfo: LimitOrderInfo
}

export function HistoryTableItem({ historyInfo }: HistoryTableItemProps) {
  const [openExpendItemObj, setOpenExpendItemObj] = useState<Record<string, boolean>>({})
  return (
    <React.Fragment key={historyInfo?.order_id}>
      <Tr
        cursor="pointer"
        userSelect="none"
        onClick={() => {
          if (openExpendItemObj[historyInfo?.order_id]) {
            openExpendItemObj[historyInfo?.order_id] = false
          } else {
            openExpendItemObj[historyInfo?.order_id] = true
          }
          setOpenExpendItemObj({ ...openExpendItemObj })
        }}
        sx={{
          w: '100%',
          td: {
            bg: 'transparent !important',
            border: 'none !important',
            p: {
              fontSize: '13px'
            },
            button: {
              fontSize: '13px'
            }
          }
        }}
      >
        <Td w="20%" minW="unset">
          <CoinInfoBlock imgSize={'20px'} info={historyInfo} />
        </Td>
        <Td w="20%" minW="unset" textAlign="right">
          <PriceBlock info={historyInfo} />
        </Td>
        <Td
          w="25%"
          minW="unset"
          textAlign="right"
          sx={{
            '>div': {
              p: {
                whiteSpace: 'nowrap',
                m: '0 12px'
              }
            }
          }}
        >
          <ExpiryBlock info={historyInfo} />
        </Td>
        <Td w="15%" minW="unset" textAlign="right">
          <FilledSizeBlock info={historyInfo} isProfile={true} />
        </Td>

        <Td w="20%" minW="unset" textAlign="right" sx={{ '>div': { ml: '12px' } }}>
          <StatusBlock historyInfo={historyInfo} openExpendItemObj={openExpendItemObj} />
        </Td>
      </Tr>

      {!openExpendItemObj[historyInfo?.order_id] && <Tr h="16px" />}

      <Tr
        position="relative"
        top={'0px'}
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
            },
            '>div': {
              bg: 'transparent !important',
              border: 'none !important',
              borderColor: 'border',
              borderTop: 'none',
              p: '8px 0 16px'
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
          <Td
            colSpan={5}
            sx={{
              p: {
                fontSize: '13px'
              },
              button: {
                fontSize: '13px'
              }
            }}
          >
            <LimitExpendBlock historyInfo={historyInfo} />
          </Td>
        )}
      </Tr>
    </React.Fragment>
  )
}
