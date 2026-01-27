import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { formatNumber } from '@cetus/utils'
import { HStack, Progress, Text } from '@chakra-ui/react'

export default function DcaProgressBlock({ orderInfo, isProfile }: { orderInfo: any; isProfile?: boolean }) {
  const { inCoin: sellCoin } = orderInfo
  const { isApp } = useWindowWidth()
  return (
    <HStack flexDirection={isProfile ? (isApp ? 'row' : 'column') : 'row'} align={isProfile ? 'flex-end' : 'center'} gap={isProfile ? '4px' : '8px'}>
      <HStack>
        <Text color="text_caption" fontSize={isProfile ? '13px' : '12px'} whiteSpace="nowrap">
          {formatNumber(orderInfo?.inDepositedOut)} {sellCoin?.symbol}
        </Text>
        <Text color={isProfile ? 'text_caption' : 'primary_gray'} fontSize={isProfile ? '13px' : '12px'} whiteSpace="nowrap">
          / {formatNumber(orderInfo?.inDeposited)} {sellCoin?.symbol}
        </Text>
      </HStack>
      <HStack>
        <Text color="primary_gray" fontSize="12px" whiteSpace="nowrap">
          ({orderInfo?.inBalanceRatio}%)
        </Text>
        {(!isProfile || !isApp) && (
          <Progress
            w={isProfile ? '40px' : '50px'}
            h="4px"
            value={orderInfo?.inBalanceRatio}
            bg="#282828"
            sx={{
              'div[role="progressbar"]': {
                bg: 'primary'
              }
            }}
          />
        )}
      </HStack>
    </HStack>
  )
}
