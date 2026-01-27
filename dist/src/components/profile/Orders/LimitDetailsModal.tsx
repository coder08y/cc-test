import { getEventInfo } from '@/components/limit/OrderItemBlock/LimitExpendBlock'
import { LimitOrderInfo } from '@/types/limit'
import { Block } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Drawer, Icon } from '@cetus/ui-kit'
import { cancelBubble, utcTimeFormatted } from '@cetus/utils'
import { Box, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

export default function LimitDetailsModal({ isOpen, onClose, historyInfo }: { isOpen: boolean; onClose: () => void; historyInfo: LimitOrderInfo }) {
  const { isApp } = useWindowWidth()
  const expendList = useMemo(() => {
    return historyInfo?.events || []
  }, [historyInfo])
  const { getExplorerUrl } = useExplorer()
  const renderTabs = (
    <Heading h="44px" lineHeight="24px" fontWeight="500" fontSize="16px" borderBottom="1px solid" borderColor="border" pb="0px">
      Trade Details
    </Heading>
  )

  const renderContent = (
    <HStack h="100%" gap="12px" mt="8px">
      <VStack align="flex-start" w="100%" gap="32px" ml="4px" p="0 0 16px 16px" borderLeft="1px dashed" borderColor="border">
        {expendList.map((item: any) => {
          const { tokenInfo, text, icon, color, num } = getEventInfo(item, historyInfo)
          return (
            <VStack align="flex-start" w="100%" key={item?.tx} mt="-8px">
              <HStack w="100%" gap="16px" justifyContent="space-between" position="relative">
                <Text h="20px" lineHeight="20px">
                  {utcTimeFormatted(item.block_time)} (UTC)
                </Text>
                <Text color={color}>{text}</Text>
                <HStack justify="center" h="12px" w="12px" bg="primary_opacity.20" position="absolute" left="-23px" top="4px" borderRadius="50%">
                  <Box h="6px" w="6px" bg="primary" borderRadius="50%" />
                </HStack>
              </HStack>
              <Block p="16px" borderRadius="12px">
                <HStack w="100%" gap="4px" justify="space-between">
                  <Text whiteSpace="nowrap" color="text_caption" h="20px" lineHeight="20px">
                    {num}&nbsp;{tokenInfo?.symbol}
                  </Text>
                  <Icon
                    fontSize="16px"
                    xlinkHref="#icon-icon_link3"
                    onClick={e => {
                      cancelBubble(e)
                      window.open(getExplorerUrl(item.tx, 'tx'))
                    }}
                  />
                </HStack>
              </Block>
            </VStack>
          )
        })}
      </VStack>
    </HStack>
  )

  return isApp ? (
    <DetailDrawer isOpen={isOpen} onClose={onClose} renderTabs={renderTabs} renderContent={renderContent} />
  ) : (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minWidth="482px">
        <ModalHeader>{renderTabs}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p="0 16px 0px" textAlign="center">
          {renderContent}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

interface DetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  renderTabs: React.ReactNode
  renderContent: React.ReactNode
}

function DetailDrawer({ isOpen, onClose, renderTabs, renderContent }: DetailDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom" haveCloseButton={true}>
      {renderTabs}
      <Box h="20px" />
      {renderContent}
    </Drawer>
  )
}
