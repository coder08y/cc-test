import { CetusTooltip } from '@cetus/design'
import { cancelBubble } from '@cetus/utils'
import { Center, HStack, Image, Text } from '@chakra-ui/react'
import burn_lock from '/images/burn-lock.png'

const BurnLockIcon = () => {
  return (
    <HStack
      w="20px"
      h="20px"
      onClick={e => {
        cancelBubble(e)
      }}
    >
      <CetusTooltip placement="top" tooltip={<Text fontSize="12px">Liquidity that is permanently locked</Text>}>
        <Center>
          <Image w="100%" h="100%" src={burn_lock} />
        </Center>
      </CetusTooltip>
    </HStack>
  )
}

export default BurnLockIcon
