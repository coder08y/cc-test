import { LimitOrderInfo } from '@/types/limit'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { formatNumber, formatPercentage } from '@cetus/utils'
import { HStack, Progress, Text, VStack } from '@chakra-ui/react'

export const FilledSizeBlock = ({ info, isProfile = false }: { info: LimitOrderInfo; isProfile?: boolean }) => {
  const { pay_coin, total_pay_amount, deal_amount, deal_rate } = info
  const { isApp } = useWindowWidth()
  return (
    <VStack align="flex-end" gap={isProfile ? '4px' : '8px'}>
      <HStack justifyContent="end" gap="2px">
        <Text color="text_caption">{formatNumber(deal_amount)}</Text>
        <HStack justifyContent="end" gap="2px">
          <Text color="text_caption" whiteSpace="nowrap">
            /{formatNumber(total_pay_amount)} {pay_coin?.symbol}
          </Text>
          {(!isProfile || isApp) && (
            <Text color="primary_gray" whiteSpace="nowrap">
              ({formatPercentage(Number(deal_rate) * 100)})
            </Text>
          )}
        </HStack>
      </HStack>
      {isProfile && !isApp && (
        <HStack w="100%" justify="flex-end" gap="2px">
          <Text color="primary_gray" fontSize="12px" whiteSpace="nowrap">
            {formatPercentage(Number(deal_rate) * 100)}
          </Text>
          <Progress
            h="4px"
            w="40px"
            value={Number(deal_rate) * 100}
            bg="primary_opacity.10"
            sx={{
              'div[role="progressbar"]': {
                bg: 'primary'
              }
            }}
          />
        </HStack>
      )}
    </VStack>
  )
}
