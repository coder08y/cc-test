import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { cancelBubble } from '@cetus/utils'
import { Center, HStack, Image, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const MiningIcon = () => {
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  return (
    <HStack
      w="20px"
      h="20px"
      onClick={e => {
        cancelBubble(e)
        isApp ? '' : navigate('/vaults')
      }}
    >
      <CetusTooltip placement="top" tooltip={<Text fontSize="12px">Vault available</Text>}>
        <Center>
          <Image w="100%" h="100%" src="/images/icon_vaults.png" />
        </Center>
      </CetusTooltip>
    </HStack>
  )
}

export default MiningIcon
