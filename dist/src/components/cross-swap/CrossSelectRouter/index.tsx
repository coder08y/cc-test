import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { HStack, Text, VStack } from '@chakra-ui/react'
import RouterList from './RouterList'

type CrossSelectRouterProps = {
  onClose: () => void
  isOpenSelectRouter: boolean
}
export default function CrossSelectRouter(props: CrossSelectRouterProps) {
  const { onClose, isOpenSelectRouter } = props
  const { isApp } = useWindowWidth()

  return (
    <VStack
      w={isApp ? '100%' : '460px'}
      bg="bg_secondary"
      borderRadius="16px"
      border="1px solid"
      borderColor="border"
      padding="16px"
      mt={isApp ? '0px' : '96px'}
    >
      <HStack w="100%" justifyContent="space-between">
        <Text fontSize="16px" color="text_caption" fontWeight="500">
          Select Router
        </Text>
        <Icon xlinkHref="#icon-icon_close" onClick={onClose} />
      </HStack>
      <RouterList isOpenSelectRouter={isOpenSelectRouter} />
    </VStack>
  )
}
