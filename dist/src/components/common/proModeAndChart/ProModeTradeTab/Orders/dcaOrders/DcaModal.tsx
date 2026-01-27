import useTokenRank from '@/hooks/common/useTokenRank'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Drawer } from '@cetus/ui-kit'
import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import ProfileMenus from '../ProfileMenus'
import DcaOrders from './DcaOrders'
import DcaOverview from './DcaOverview'

interface DcaModalProps {
  isOpen: boolean
  onClose: () => void
  orderInfo: any
  isActiveOrder?: boolean
  isClaimLoading?: boolean
  toClaim?: (orderInfo: any) => void
}

export default function DcaModal({ isOpen, onClose, orderInfo, isActiveOrder, isClaimLoading = false, toClaim }: DcaModalProps) {
  const { isApp } = useWindowWidth()
  const [currentTab, setCurrentTab] = useState<'overview' | 'orders'>('overview')
  const { inCoin: sellCoin, outCoin: buyCoin } = orderInfo || {}

  const tabList = [
    { label: 'Overview', value: 'overview' },
    { label: 'Orders', value: 'orders' }
  ]

  const [pageDirect, setPageDirect] = useState(false)
  const { getTokenRank } = useTokenRank()

  useEffect(() => {
    if (sellCoin?.coin_type && buyCoin?.coin_type) {
      const direct = getTokenRank(sellCoin, buyCoin)
      console.log('🚀 ~ TokenRank:', buyCoin, sellCoin, direct)
      setPageDirect(!direct)
    }
  }, [sellCoin?.coin_type, buyCoin?.coin_type])

  const renderTabs = (
    <Box w="100%" borderBottom="1px solid" borderColor="border">
      <ProfileMenus
        type="tab"
        currentTab={currentTab}
        tabs={tabList}
        onTabChange={tab => setCurrentTab(tab.value as 'overview' | 'orders')}
        textStyle={{ fontSize: '16px' }}
        wrapStyle={{ bg: 'none', mt: '-12px', mb: '-4px' }}
      />
    </Box>
  )

  const renderContent = (
    <>
      {currentTab === 'overview' && (
        <DcaOverview orderInfo={orderInfo} isActiveOrder={isActiveOrder} pageDirect={pageDirect} isClaimLoading={isClaimLoading} toClaim={toClaim} />
      )}
      {currentTab === 'orders' && <DcaOrders orderInfo={orderInfo} isActiveOrder={isActiveOrder} pageDirect={pageDirect} />}
    </>
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
