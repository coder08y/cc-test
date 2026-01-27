import usePreModeDcaItemActions from '@/hooks/dca/usePreModeDcaItemActions'
import { CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { DrawerPreMode, Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { Button, Center, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'
import { IconText } from '../../../IconText'
import DcaModal from './DcaModal'

type DcaTableActionProps = {
  orderInfo: any
  isActiveOrder?: boolean
  refresh?: (value: string) => void
}

export default function DcaTableAction({ orderInfo, isActiveOrder = true, refresh }: DcaTableActionProps) {
  const { isApp } = useWindowWidth()
  const [isOpenDetails, setIsOpenDetails] = useState(false)
  const { getExplorerUrl } = useExplorer()
  const { isClaimLoading, toClaim, closeOrderAction, isCloseLoading } = usePreModeDcaItemActions()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleOpenDetail = () => setIsOpenDetails(true)

  const handleCloseOrderAction = () => {
    if (!isCloseLoading) {
      closeOrderAction(orderInfo)
    }
  }

  const claimDisabled = orderInfo?.outBalance <= 0 || isClaimLoading

  const handleClaim = (orderInfo: any) => {
    toClaim(orderInfo, refresh)
  }

  return (
    <>
      <HStack justify="flex-end">
        {isActiveOrder ? (
          <>
            <Button
              isLoading={isClaimLoading}
              onClick={() => handleClaim(orderInfo)}
              isDisabled={claimDisabled}
              h="32px"
              fontSize="12px"
              borderRadius="8px"
              fontWeight="500"
              p="0 8px"
              w={{ base: 'calc(100vw - 84px)', lg: 'unset' }}
            >
              Claim
            </Button>
            <CetusTooltip
              placement="bottom-end"
              showTooltip={!isApp}
              tooltip={
                <OpenMoreContent
                  getExplorerUrl={getExplorerUrl}
                  orderInfo={orderInfo}
                  closeOrderAction={handleCloseOrderAction}
                  handleOpenDetail={handleOpenDetail}
                />
              }
            >
              <Center>
                <Button
                  variant="outline"
                  w="32px"
                  h="32px"
                  p="0"
                  borderRadius="8px"
                  onClick={isApp ? onOpen : undefined}
                  sx={{
                    _hover: {
                      svg: {
                        fill: 'primary'
                      }
                    }
                  }}
                >
                  <Icon svgFill={isApp ? 'primary' : 'text_paragraph'} xlinkHref="#icon-icon_more" svgW="16px" svgH="16px" />
                </Button>
              </Center>
            </CetusTooltip>
          </>
        ) : (
          <>
            <Button
              w={{ base: 'calc(100vw - 84px)', lg: 'unset' }}
              onClick={handleOpenDetail}
              h="32px"
              fontSize="12px"
              variant="outline"
              borderRadius="8px"
              fontWeight="500"
              p="0 8px"
            >
              Details
            </Button>
            <CetusTooltip placement="bottom-end" showTooltip={!isApp} tooltip={<Text fontSize="12px">View on Explorer</Text>}>
              <Center>
                <Button
                  onClick={e => {
                    cancelBubble(e)
                    window.open(getExplorerUrl(orderInfo.orderID, 'poolAddress'))
                  }}
                  w="32px"
                  p="0"
                  h="32px"
                  fontSize="12px"
                  borderRadius="8px"
                  variant="outline"
                  _hover={{
                    svg: {
                      fill: 'primary'
                    }
                  }}
                >
                  <Icon fontSize="16px" xlinkHref="#icon-icon_link3" />
                </Button>
              </Center>
            </CetusTooltip>
          </>
        )}
      </HStack>

      {isOpenDetails && (
        <DcaModal
          isOpen={isOpenDetails}
          onClose={() => setIsOpenDetails(false)}
          orderInfo={orderInfo}
          isActiveOrder={isActiveOrder}
          isClaimLoading={isClaimLoading}
          toClaim={handleClaim}
        />
      )}

      <DcaDrawer
        isOpen={isOpen}
        onClose={onClose}
        getExplorerUrl={getExplorerUrl}
        orderInfo={orderInfo}
        closeOrderAction={handleCloseOrderAction}
        handleOpenDetail={handleOpenDetail}
      />
    </>
  )
}

function OpenMoreContent({
  getExplorerUrl,
  orderInfo,
  closeOrderAction,
  handleOpenDetail
}: {
  getExplorerUrl: any
  orderInfo: any
  closeOrderAction: () => void
  handleOpenDetail: () => void
}) {
  return (
    <VStack align="flex-start">
      <IconText text="View Details" onClick={handleOpenDetail} />
      <IconText
        text="View on Explorer"
        onClick={() => {
          window.open(getExplorerUrl(orderInfo.orderID, 'poolAddress'))
        }}
      />
      <IconText text={orderInfo?.outBalance <= 0 ? 'Close' : 'Close and Withdraw'} onClick={closeOrderAction} />
    </VStack>
  )
}

function DcaDrawer({
  isOpen,
  onClose,
  getExplorerUrl,
  orderInfo,
  closeOrderAction,
  handleOpenDetail
}: {
  isOpen: boolean
  onClose: () => void
  getExplorerUrl: any
  orderInfo: any
  closeOrderAction: () => void
  handleOpenDetail: () => void
}) {
  return (
    <DrawerPreMode isOpen={isOpen} onClose={onClose} placement="bottom">
      <VStack
        align="flex-start"
        sx={{
          '>div': {
            w: '100%',
            '>div': {
              justifyContent: 'center',
              background: 'none',
              p: {
                color: 'text_caption',
                fontSize: '16px'
              }
            }
          }
        }}
      >
        <OpenMoreContent
          getExplorerUrl={getExplorerUrl}
          orderInfo={orderInfo}
          closeOrderAction={closeOrderAction}
          handleOpenDetail={handleOpenDetail}
        />
      </VStack>
    </DrawerPreMode>
  )
}
