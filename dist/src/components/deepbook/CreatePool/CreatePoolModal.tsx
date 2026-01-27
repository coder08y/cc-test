import useDeepBookStore from '@/store/deepbook'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, VaulDrawer } from '@cetus/ui-kit'
import { HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import CreatePoolContent from './CreatePoolContent'

type CreatePoolModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function CreatePoolModal({ isOpen, onClose }: CreatePoolModalProps) {
  const { isApp } = useWindowWidth()
  const setManagePoolModalOpen = useDeepBookStore(state => state.setManagePoolModalOpen)
  const isCreatePoolSuccess = useDeepBookStore(state => state.isCreatePoolSuccess)

  return (
    <>
      {isApp ? (
        <VaulDrawer
          key={`drawer-bottom-${isApp ? 'mobile' : 'desktop'}`}
          isOpen={isOpen}
          onClose={onClose}
          placement="bottom"
          padding="12px"
          wrapStyle={{
            w: '100%',
            maxH: '90vh',
            bg: '#0F0F0F',
            overflow: 'scroll'
          }}
        >
          <>
            <HStack
              w="100%"
              gap="0px"
              h="18px"
              ml="-8px"
              mb="24px"
              onClick={() => {
                setManagePoolModalOpen(true)
                onClose()
              }}
            >
              <Icon xlinkHref="#icon-icon_ascending_nor" transform="rotate(-90deg)" />
              <Text color="text_caption">Create a new pool</Text>
            </HStack>
            <CreatePoolContent onClose={onClose} />
          </>
        </VaulDrawer>
      ) : (
        <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={() => onClose()} isCentered>
          <ModalOverlay />
          <ModalContent w={{ base: '100%', lg: '448px' }} overflow="hidden">
            <ModalHeader>{isCreatePoolSuccess ? '' : 'Create Pool'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody textAlign="center">
              <CreatePoolContent onClose={onClose} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
