import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import SelectTab, { Tab } from '@cetus/design/src/components/common/SelectTab'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { BackButton, VaulDrawer } from '@cetus/ui-kit'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { FarmingStake } from './FarmingStake'
import { FarmingUnstake } from './FarmingUnstake'
type FarmingModalProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setIsOpenPre: (isOpen: boolean) => void
  onClose: () => void
  farmingModalAction: string
  vaultsId: string
  isDetail: boolean
}

// vaults farming弹窗
export default function FarmingModal({ isOpen, onClose, setIsOpen, setIsOpenPre, farmingModalAction, vaultsId, isDetail }: FarmingModalProps) {
  const [currentActionTab, setCurrentActionTab] = useState(farmingModalAction || 'Stake')
  const { currentVaultPosition } = useVaultsPositionStore()
  const { currentVaultsFarm } = useCurrentVaultsFarm(vaultsId)

  const tabList: Tab[] = [
    {
      label: 'Stake',
      value: 'Stake'
    },
    {
      label: 'Unstake',
      value: 'Unstake'
    }
  ]

  const { isApp } = useWindowWidth()

  return isApp ? (
    <VaulDrawer isOpen={isOpen} onClose={onClose}>
      <VStack align="start" gap="0" w="100%">
        {isDetail && 'Haedal Farms'}
        {!isDetail && (
          <BackButton
            w="100%"
            border="none"
            bg="none"
            justifyContent="start"
            text={'Haedal Farms'}
            ml="-6px"
            customTextStyle={{
              color: 'text_caption'
            }}
            onClick={() => {
              setIsOpen(false)
              setIsOpenPre(true)
            }}
          />
        )}
        <VStack p="0 12px 8px" w="100%">
          <SelectTab
            type="borderTab"
            wrapStyle={{
              w: '100%',
              h: '38px',
              border: 'none',
              bg: 'none'
            }}
            itemStyle={{
              fontSize: '16px',
              mr: '28px',
              fontWeight: '500'
            }}
            tabList={tabList}
            currentTab={currentActionTab}
            handleChangeTab={(item: Tab) => {
              setCurrentActionTab(item.value)
            }}
          />
          <VStack gap="16px" mt="16px" pb="12px">
            {currentActionTab === 'Stake' && <FarmingStake currentVaultPosition={currentVaultPosition} currentVaultsFarming={currentVaultsFarm} />}
            {currentActionTab === 'Unstake' && (
              <FarmingUnstake currentVaultPosition={currentVaultPosition} currentVaultsFarming={currentVaultsFarm} />
            )}
          </VStack>
        </VStack>
      </VStack>
    </VaulDrawer>
  ) : (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
      }}
      blockScrollOnMount={false}
      portalProps={{ containerRef: undefined }}
    >
      <ModalOverlay
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1500,
          pointerEvents: 'auto'
        }}
      />
      <ModalContent
        width={{ base: '100%', lg: '420px' }}
        containerProps={{
          style: {
            zIndex: 1501,
            pointerEvents: 'auto'
          }
        }}
      >
        <ModalHeader>
          {isDetail && 'Haedal Farms'}
          {!isDetail && (
            <BackButton
              w="100%"
              border="none"
              bg="none"
              justifyContent="start"
              text={'Haedal Farms'}
              ml="-6px"
              customTextStyle={{
                color: 'text_caption'
              }}
              onClick={() => {
                setIsOpen(false)
                setIsOpenPre(true)
              }}
            />
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p="0 16px 8px">
          <SelectTab
            type="borderTab"
            wrapStyle={{
              w: '100%',
              h: '38px',
              border: 'none',
              bg: 'none'
            }}
            itemStyle={{
              fontSize: '16px',
              mr: '28px',
              fontWeight: '500'
            }}
            tabList={tabList}
            currentTab={currentActionTab}
            handleChangeTab={(item: Tab) => {
              setCurrentActionTab(item.value)
            }}
          />
          <VStack gap="16px" mt="16px" pb="8px">
            {currentActionTab === 'Stake' && <FarmingStake currentVaultPosition={currentVaultPosition} currentVaultsFarming={currentVaultsFarm} />}
            {currentActionTab === 'Unstake' && (
              <FarmingUnstake currentVaultPosition={currentVaultPosition} currentVaultsFarming={currentVaultsFarm} />
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
