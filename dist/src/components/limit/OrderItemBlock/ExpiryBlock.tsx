import { LimitOrderInfo } from '@/types/limit'
import { timeFormatUTC, utcTimeFormatted } from '@cetus/utils'
import { HStack, Text } from '@chakra-ui/react'

export const ExpiryBlock = ({ info, isProfile = false }: { info: LimitOrderInfo; isProfile?: boolean }) => {
  return (
    <HStack justifyContent="end" gap="2px">
      {isProfile ? (
        <Text color="text_caption" whiteSpace="nowrap">
          {utcTimeFormatted(info?.expire_ts)}
        </Text>
      ) : (
        <Text color="text_caption" whiteSpace="nowrap">
          {timeFormatUTC(info?.expire_ts, '')} (UTC)
        </Text>
      )}
    </HStack>
  )
}
