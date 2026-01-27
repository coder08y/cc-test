import useVaultsRiskStore from '@/store/vaults-v2/useVaultsRisk'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { CheckBox } from '@cetus/ui-kit'
import { Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

type RiskModalProps = {
  isOpen: boolean
  setIsOpen: (status: boolean) => void
  continueFunc: () => void
}

// 通用带圆点文本组件
const RiskBulletText = ({ children }: { children: React.ReactNode }) => (
  <Text
    lineHeight="20px"
    color="text_caption"
    fontSize="12px"
    position="relative"
    pl="10px"
    _before={{
      content: '""',
      display: 'inline-block',
      w: '4px',
      h: '4px',
      borderRadius: '50%',
      bg: 'primary',
      position: 'absolute',
      left: '0',
      top: '8px'
    }}
  >
    {children}
  </Text>
)

// Vault风险确认弹窗
export default function RiskModal(props: RiskModalProps) {
  const { isOpen, setIsOpen, continueFunc } = props
  const [isCheckedAccept, setIsCheckedAccept] = useState(false)
  const [isCheckedDontRemind, setIsCheckedDontRemind] = useState(false)
  const { setIsCheckedAcceptWalletObj, setIsCheckedDontRemindWalletObj } = useVaultsRiskStore()
  const { currentAccount } = useAccountStore()

  const riskContinue = () => {
    if (currentAccount?.address) {
      const newIsCheckedAcceptWalletObj = {
        [currentAccount.address]: isCheckedAccept
      }
      setIsCheckedAcceptWalletObj(newIsCheckedAcceptWalletObj)
      const newIsCheckedDontRemindWalletObj = {
        [currentAccount.address]: isCheckedDontRemind
      }
      setIsCheckedDontRemindWalletObj(newIsCheckedDontRemindWalletObj)
    }
    continueFunc()
  }

  const { isApp } = useWindowWidth()

  return (
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
        width={{ base: '100%', lg: '480px' }}
        maxHeight="calc(100vh - 100px)"
        containerProps={{
          style: {
            zIndex: 1501,
            pointerEvents: 'auto'
          }
        }}
      >
        <ModalHeader>
          <Text fontSize={isApp ? '14px' : '16px'} fontWeight="500" color="caption" lineHeight={isApp ? '20px' : '40px'}>
            Risk Acknowledgement
          </Text>
        </ModalHeader>
        <ModalCloseButton m={isApp ? '' : '12px 2px 0 0'} />

        <ModalBody p="0 16px" overflowY="auto">
          <VStack bg="menu_item_bg" borderRadius="8px" border="1px solid" borderColor="border" p="16px 12px" gap={isApp ? '12px' : '16px'}>
            <Text w="100%" textAlign="left" fontSize="12px">
              Before you provide liquidity via this vault:
            </Text>
            <VStack gap={isApp ? '12px' : '16px'}>
              <RiskBulletText>
                You acknowledge that this vault strategy is provided by a third party. Cetus integrates it at the UI level for user convenience but
                does not operate this product or take responsibility for third-party risks.
              </RiskBulletText>
              <RiskBulletText>
                You acknowledge that the displayed APR and APY are based on historical data and not a guaranteed return.
              </RiskBulletText>
              <RiskBulletText>
                You understand that APR and APY figures reflect past trading fees and rewards only, excluding impermanent loss and price volatility.
              </RiskBulletText>
              <RiskBulletText>
                You recognize the risks associated with automated liquidity strategies, including market fluctuations and third-party operational
                risks.
              </RiskBulletText>
              <Text fontSize="12px" color="text_paragraph" lineHeight="20px">
                Please assess these risks carefully and proceed only if you fully understand and accept them.
              </Text>
            </VStack>
          </VStack>
          <VStack
            bg="menu_item_bg"
            borderRadius="8px"
            border="1px solid"
            borderColor="border"
            p={isApp ? '12px 16px' : '16px'}
            justifyContent="flex-start"
            alignItems="flex-start"
            m="16px 0"
            userSelect="none"
            gap={isApp ? '8px' : '12px'}
          >
            <HStack>
              <CheckBox checked={isCheckedAccept} onClick={() => setIsCheckedAccept(!isCheckedAccept)} />
              <Text fontWeight="500" color="text_caption">
                I acknowledge and accept all the risks.
              </Text>
            </HStack>
            <HStack>
              <CheckBox checked={isCheckedDontRemind} onClick={() => setIsCheckedDontRemind(!isCheckedDontRemind)} />
              <Text fontSize="12px" color="text_paragraph">
                Don't remind me again.
              </Text>
            </HStack>
          </VStack>
          <Button
            w="calc(100% + 32px)"
            h="52px"
            bg="primary"
            borderRadius="12px"
            fontWeight="600"
            ml="-16px"
            isDisabled={!isCheckedAccept}
            onClick={riskContinue}
          >
            Continue
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
