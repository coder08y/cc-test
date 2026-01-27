import { IconText } from '@/components/common/IconText'
import LimitDetailsModal from '@/components/profile/Orders/LimitDetailsModal'
import useLimitCancelAction from '@/hooks/limit/useLimitCancelAction'
import useLimitClaimAction from '@/hooks/limit/useLimitClaimAction'
import { LimitOrderInfo } from '@/types/limit'
import { CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Drawer, Icon } from '@cetus/ui-kit'
import { cancelBubble, d } from '@cetus/utils'
import { Button, Center, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'
import ClaimModal from '../ClaimModal'

export const OrderActionBlock = ({
  orderInfo,
  isProfile = false,
  isOpenOrder = true
}: {
  orderInfo: LimitOrderInfo
  isProfile?: boolean
  isOpenOrder?: boolean
}) => {
  const { handleCancelOrder, cancelOrderLoading } = useLimitCancelAction()
  const { handleClaimOrder, claimLoading, getLimitOrderClaimHistory, isClaimHistoryLoading } = useLimitClaimAction()

  const [isOpenClaimModal, setIsOpenClaimModal] = useState(false)
  const [isOpenTradeDetails, setIsOpenTradeDetails] = useState(false)

  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure()

  const canClaim = d(orderInfo?.obtained_amount).gt(0) || d(orderInfo.un_claimed_amount).gt(0)

  const handleClick = (e: any, type: 'claim' | 'cancel') => {
    cancelBubble(e)
    if (type === 'claim') setIsOpenClaimModal(true)
    if (type === 'cancel' && !cancelOrderLoading) handleCancelOrder([orderInfo])
  }

  const renderClaimButton = () => {
    const baseWidth = 'calc(50vw - 32px)'
    return canClaim ? (
      <Button
        isLoading={claimLoading}
        isDisabled={claimLoading}
        w={{ base: '50%', lg: 'unset' }}
        h="32px"
        p="0 8px"
        borderRadius="8px"
        fontSize="12px"
        fontWeight="500"
        onClick={e => handleClick(e, 'claim')}
      >
        Claim
      </Button>
    ) : (
      <CetusTooltip
        placement="top"
        tooltip={
          <Text fontSize="12px" lineHeight="20px" maxW="280px">
            For a partially filled order, you can manually claim the filled amount if you want. Or wait for the auto distribution.
          </Text>
        }
      >
        <Center w={{ base: baseWidth, lg: 'unset' }}>
          <Button w="100%" isDisabled h="32px" p="0 8px" borderRadius="8px" fontSize="12px">
            Claim
          </Button>
        </Center>
      </CetusTooltip>
    )
  }

  return (
    <HStack
      w={{ base: 'calc(100vw - 32px)', lg: 'unset' }}
      pl={{ base: isProfile && isApp ? '0px' : '8px', lg: '0px' }}
      pr={{ base: '8px', lg: '0px' }}
      justify={{ base: 'space-between', lg: 'flex-end' }}
      gap="8px"
    >
      {isOpenOrder && <HStack justify={isProfile && isApp ? 'space-between' : 'flex-end'}>{renderClaimButton()}</HStack>}

      {isOpenOrder && (
        <Button
          isLoading={cancelOrderLoading}
          isDisabled={cancelOrderLoading}
          w={{ base: '50%', lg: 'unset' }}
          h="32px"
          p="0 8px"
          variant="outline"
          borderRadius="8px"
          fontSize="12px"
          fontWeight="500"
          onClick={e => handleClick(e, 'cancel')}
        >
          Cancel
        </Button>
      )}

      {isProfile && (
        <HStack>
          {!isOpenOrder && (
            <Button
              w={{ base: 'calc(100vw - 84px)', lg: 'unset' }}
              h="32px"
              variant="outline"
              fontSize="12px"
              p="0 8px"
              borderRadius="8px"
              fontWeight="500"
              onClick={e => {
                cancelBubble(e)
                setIsOpenTradeDetails(true)
              }}
            >
              Details
            </Button>
          )}
          <CetusTooltip placement="bottom-end" showTooltip={!isApp} tooltip={<Text fontSize="12px">View on Explorer</Text>}>
            <Center>
              <Button
                onClick={e => {
                  cancelBubble(e)
                  window.open(getExplorerUrl(orderInfo.order_id, 'poolAddress'))
                }}
                w="32px"
                h="32px"
                p="0"
                fontSize="12px"
                borderRadius="8px"
                variant="outline"
                _hover={{ svg: { fill: 'primary' } }}
              >
                <Icon fontSize="16px" xlinkHref="#icon-icon_link3" />
              </Button>
            </Center>
          </CetusTooltip>
        </HStack>
      )}

      {isOpenClaimModal && (
        <ClaimModal
          orderInfo={orderInfo}
          claimLoading={claimLoading}
          isOpen={isOpenClaimModal}
          onClose={() => setIsOpenClaimModal(false)}
          handleClaim={value => handleClaimOrder(orderInfo, value)}
          getLimitOrderClaimHistory={() => getLimitOrderClaimHistory(orderInfo)}
          isClaimHistoryLoading={isClaimHistoryLoading}
        />
      )}

      {isOpenTradeDetails && <LimitDetailsModal isOpen={isOpenTradeDetails} onClose={() => setIsOpenTradeDetails(false)} historyInfo={orderInfo} />}

      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} placement="bottom">
        <VStack
          align="flex-start"
          sx={{
            '>div': {
              w: '100%',
              '>div': {
                justifyContent: 'center',
                background: 'none',
                p: { color: 'text_caption', fontSize: '16px' }
              }
            }
          }}
        >
          <ActionTooltipContent
            getExplorerUrl={getExplorerUrl}
            orderInfo={orderInfo}
            cancelOrderLoading={cancelOrderLoading}
            onCancel={() => handleCancelOrder([orderInfo])}
          />
        </VStack>
      </Drawer>
    </HStack>
  )
}

function ActionTooltipContent({
  getExplorerUrl,
  orderInfo,
  cancelOrderLoading,
  onCancel
}: {
  getExplorerUrl: (id: string, type: string) => string
  orderInfo: LimitOrderInfo
  cancelOrderLoading: boolean
  onCancel: () => void
}) {
  return (
    <VStack align="flex-start">
      <IconText text="View on Explorer" onClick={() => window.open(getExplorerUrl(orderInfo.order_id, 'poolAddress'))} />
      <IconText text="Cancel" onClick={!cancelOrderLoading ? onCancel : () => {}} />
    </VStack>
  )
}
