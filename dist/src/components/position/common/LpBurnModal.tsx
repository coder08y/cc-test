import { PosBaseInfo } from '@/types'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VaulDrawer } from '@cetus/ui-kit'
import { Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import LpBurnNextContent from './LpBurnNextContent'
import LpBurnPrevContent from './LpBurnPrevContent'

interface PendingYieldModalProps {
  isOpen: boolean
  onClose: () => void
}
export default function LpBurnModal({ isOpen, onClose }: PendingYieldModalProps) {
  const [isConfirm, setIsConfirm] = useState(false)
  const [currentLockItem, setCurrentLockItem] = useState<PosBaseInfo>({})
  useEffect(() => {
    setCurrentLockItem({})
    setIsConfirm(false)
  }, [isOpen])

  const onClickCheckBox = (item: PosBaseInfo) => {
    if (item?.posId == currentLockItem?.posId) {
      setCurrentLockItem({})
    } else {
      setCurrentLockItem(item)
    }
  }
  const { isApp } = useWindowWidth()
  return isApp ? (
    <VaulDrawer isOpen={isOpen} onClose={onClose}>
      <VStack
        align="start"
        h="100%"
        gap="0"
        sx={{
          '@supports (height: 90dvh)': {
            maxH: 'calc(90dvh - 36px)'
          },
          '@supports not (height: 100dvh)': {
            maxH: 'calc(90vh - 36px)'
          }
        }}
      >
        <Heading fontWeight="500" fontSize="16px">
          Burn/Lock Liquidity
        </Heading>
        <VStack p="16px 16px 0" maxH="calc(100% - 32px)" overflow="auto">
          {!isConfirm && (
            <LpBurnPrevContent
              onClose={onClose}
              currentLockItem={currentLockItem}
              onClickCheckBox={(item: PosBaseInfo) => onClickCheckBox(item)}
              onClickLock={() => setIsConfirm(true)}
            />
          )}
          {isConfirm && <LpBurnNextContent onClose={onClose} currentLockItem={currentLockItem} />}
        </VStack>
      </VStack>
    </VaulDrawer>
  ) : (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minWidth={isApp ? '300px' : '482px'}>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Burn/Lock Liquidity
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p="16px 16px 0" textAlign="center">
          {!isConfirm && (
            <LpBurnPrevContent
              onClose={onClose}
              currentLockItem={currentLockItem}
              onClickCheckBox={(item: PosBaseInfo) => onClickCheckBox(item)}
              onClickLock={() => setIsConfirm(true)}
            />
          )}
          {isConfirm && <LpBurnNextContent onClose={onClose} currentLockItem={currentLockItem} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
