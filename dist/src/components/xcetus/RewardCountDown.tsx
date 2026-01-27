import { Block } from '@cetus/design'
import useCountdown from '@cetus/hooks/src/useCountdown'
import { Center, HStack, Text, VStack } from '@chakra-ui/react'

export function RewardCountDown({ nextStartTime, refresh }: { nextStartTime: number; refresh: () => void }) {
  const { days, hours, minutes, seconds } = useCountdown(nextStartTime * 1000, refresh)
  return (
    <VStack
      w="100%"
      gap="16px"
      borderRadius="16px"
      m="-1px"
      p={{ base: '24px 12px', lg: '24px' }}
      sx={{
        backgroundImage: "url('/images/img_xcetus@2x.png')",
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <Text fontSize="16px" color="text_caption">
        Convert CETUS to xCETUS to start earning
      </Text>
      <Text>Reward distribution in </Text>
      {/* 奖励倒计时 */}
      <HStack>
        {/* 天 */}
        <Block borderRadius="4px" p="0px" bg="block_color" borderColor="transparent">
          <Center w="40px" h="40px" textAlign="center">
            <Text fontSize="16px" textColor="text_caption">
              {days}d
            </Text>
          </Center>
        </Block>
        <Text fontSize="16px" textColor="text_caption">
          :
        </Text>

        {/* 时 */}
        <Block borderRadius="4px" w="40px" h="40px" p="0px" bg="block_color" borderColor="transparent">
          <Center w="40px" h="40px" textAlign="center">
            <Text fontSize="16px" textColor="text_caption">
              {hours}h
            </Text>
          </Center>
        </Block>
        <Text fontSize="16px" textColor="text_caption">
          :
        </Text>

        {/* 分 */}
        <Block borderRadius="4px" w="40px" h="40px" p="0px" bg="block_color" borderColor="transparent">
          <Center w="40px" h="40px" textAlign="center">
            <Text fontSize="16px" textColor="text_caption">
              {minutes}m
            </Text>
          </Center>
        </Block>
        <Text fontSize="16px" textColor="text_caption">
          :
        </Text>

        {/* 秒 */}
        <Block borderRadius="4px" w="40px" h="40px" p="0px" bg="block_color" borderColor="transparent">
          <Center w="40px" h="40px" textAlign="center">
            <Text fontSize="16px" textColor="text_caption">
              {seconds}s
            </Text>
          </Center>
        </Block>
      </HStack>
    </VStack>
  )
}
