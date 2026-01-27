import useCustomizeRouting from '@/hooks/swap/useCustomizeRouting'
import { TooltipIcon } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { d } from '@cetusprotocol/common-sdk'
import {
  Button,
  Divider,
  Grid,
  GridItem,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'
import { isEqual } from 'lodash-es'
import { Suspense, lazy, memo, useState } from 'react'
import AggregatorSwitch from './AggregatorSwitch'
import ConfirmModal from './ConfirmModal'
import NumBox from './NumBox'
import RfqSwitch from './RfqSwitch'
const SourceGrid = lazy(() => import('./SourceGrid'))

interface AggregatorModeProps {
  isOpen: boolean
  showRfqSwitch: boolean
  onClose(): void
}

const AggregatorModeModal = ({ isOpen, onClose, showRfqSwitch }: AggregatorModeProps) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const {
    handleSelectAllProviderClick,
    handleSelectAllDexProviderClick,
    handleSelectAllOtherProviderClick,
    handleProviderClick,
    selectAllProviders,
    selectAllDexProviders,
    otherProviderList,
    selectAllOtherProviders,
    dexProviderList,
    currProvidersSwitchStates,
    providersSwitchStates,
    handleSaveClick,
    allSourceNum,
    dexSourceNumMap,
    otherSourceNumMap,
    isOpenRfq,
    setIsOpenRfq,
    hasRfqProvider
  } = useCustomizeRouting(showRfqSwitch)
  const handleClose = () => {
    if (isEqual(providersSwitchStates, currProvidersSwitchStates)) {
      onClose()
    } else {
      setConfirmModalOpen(true)
    }
  }
  return (
    <>
      <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="background" w={{ base: 'calc(100vw - 16px)', lg: '540px' }} maxW="unset">
          <ModalHeader>
            <HStack w="100%" justify="space-between">
              <Text fontSize="16px" fontWeight="500" color="text_caption">
                Aggregator Settings
              </Text>
              <Icon xlinkHref="#icon-icon_close" onClick={handleClose} />
            </HStack>
          </ModalHeader>

          <ModalBody>
            <VStack w="100%" gap="24px">
              <HStack w="100%" justify="space-between" align="flex-end">
                <VStack w="100%" gap="8px" align="flex-start">
                  <HStack gap="4px">
                    <Text fontSize="16px" color="text_caption" fontWeight="500">
                      Liquidity Sources
                    </Text>
                    <TooltipIcon tooltipCon="Your trade is routed through one or more of these liquidity sources." />
                  </HStack>
                  <Text lineHeight={{ base: '12px', lg: '14px' }} fontSize={{ base: '12px', lg: '14px' }}>
                    Disable/Enable Liquidity Sources
                  </Text>
                </VStack>

                <VStack align="flex-end" flex="0 0 108px">
                  <Text>Select all</Text>
                  <HStack justifyContent="flex-end" h="16px" gap="4px">
                    <NumBox
                      num={d(dexSourceNumMap?.checked || 0)
                        .plus(otherSourceNumMap?.checked || 0)
                        .plus(hasRfqProvider && isOpenRfq && showRfqSwitch ? 1 : 0)
                        .toNumber()}
                      total={allSourceNum}
                    />
                    <AggregatorSwitch
                      id="select-all"
                      isChecked={!!selectAllProviders}
                      onChange={() => handleSelectAllProviderClick(!selectAllProviders)}
                    />
                  </HStack>
                </VStack>
              </HStack>

              {hasRfqProvider && showRfqSwitch && (
                <RfqSwitch
                  id="rfq-switch"
                  isChecked={isOpenRfq}
                  onChange={() => {
                    setIsOpenRfq(!isOpenRfq)
                  }}
                />
              )}
              <Stack
                flexDir="column"
                w="100%"
                p="0"
                gap="20px"
                align="flex-start"
                maxH={{ base: 'calc(100vh - 280px)', lg: '600px' }}
                overflow="hidden"
              >
                <Suspense fallback={<ListSkeleton />}>
                  <SourceGrid
                    title="Dex"
                    isAllChecked={selectAllDexProviders}
                    onAllSelect={() => handleSelectAllDexProviderClick(!selectAllDexProviders)}
                    onItemSelect={handleProviderClick}
                    list={dexProviderList}
                    checkedMap={currProvidersSwitchStates}
                    totalNum={dexSourceNumMap?.total}
                    checkedNum={dexSourceNumMap?.checked}
                  />
                </Suspense>
                <Divider orientation="horizontal" />
                <Suspense fallback={<ListSkeleton />}>
                  <SourceGrid
                    title="Other"
                    isAllChecked={selectAllOtherProviders}
                    onAllSelect={() => handleSelectAllOtherProviderClick(!selectAllOtherProviders)}
                    onItemSelect={handleProviderClick}
                    list={otherProviderList}
                    checkedMap={currProvidersSwitchStates}
                    totalNum={otherSourceNumMap?.total}
                    checkedNum={otherSourceNumMap?.checked}
                  />
                </Suspense>
              </Stack>
            </VStack>
          </ModalBody>

          <ModalFooter gap="16px" p="8px 16px 16px">
            <Button flex="1" variant="outline" p="0 15px" onClick={onClose}>
              Cancel
            </Button>
            <Button
              flex="1"
              onClick={() => {
                handleSaveClick()
                onClose()
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {confirmModalOpen && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false)
            onClose()
          }}
          onOk={() => {
            handleSaveClick()
            setConfirmModalOpen(false)
            onClose()
          }}
        />
      )}
    </>
  )
}

function ListSkeleton() {
  return (
    <Grid
      w="100%"
      templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
      maxH={{ base: 'unset', lg: '152px' }}
      overflow="scroll"
      gap="8px"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9]?.map(item => (
        <GridItem key={item}>
          <Skeleton w="100%" h="36px" />
        </GridItem>
      ))}
    </Grid>
  )
}

export default memo(AggregatorModeModal)
