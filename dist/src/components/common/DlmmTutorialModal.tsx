import '@/assets/css/dlmm_tutorial_modal.scss'
import useGlobalStore from '@cetus/stores/src/global'
import { Icon } from '@cetus/ui-kit'
import { Box, Button, HStack, Image, Modal, ModalBody, ModalContent, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function DlmmTutorialModal() {
  const { dlmmTutorialStep, setDlmmTutorialStep } = useGlobalStore()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const isOpen = useMemo(() => {
    return dlmmTutorialStep === 0
  }, [dlmmTutorialStep])

  const onStart = useCallback(() => {
    if (pathname !== '/pools' || search !== '?tab=dlmm_pools') {
      navigate('/pools?tab=dlmm_pools')
    }
    setDlmmTutorialStep(1)
  }, [pathname, search])

  return (
    <Modal autoFocus={false} closeOnOverlayClick={false} returnFocusOnClose={false} isOpen={isOpen} onClose={() => {}} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p={{ base: '8px 12px !important', lg: '8px 12px !important' }}>
          <Box as="div" className="tutorial_modal tutorial_modal_an">
            <Box as="div" className="tutorial_sprite" />
          </Box>
          <VStack w="100%" align="flex-start" userSelect="none" p={{ base: '0', lg: '0 8px' }}>
            <HStack>
              <Text fontSize="20px" fontWeight="500" color="text_caption" margin="28px 0 8px">
                Welcome to Cetus DLMM
              </Text>
              <Image src="/images/icon_beta@2x.png" alt="beta" h="16px" />
            </HStack>

            <Text color="text_caption" as="div" lineHeight="17px">
              DLMM <Text as="span">(Dynamic Liquidity Market Maker)</Text> is now available on Cetus. Explore advanced strategies to earn more from
              your liquidity
            </Text>
            <HStack
              w="100%"
              align="center"
              onClick={() => {
                window.open('https://www.cetus.zone/terms', '_blank')
              }}
              gap="4px"
            >
              <Icon xlinkHref="#icon-icon_docs" svgFill="primary" svgHover="primary" svgH="16px" svgW="16px" />
              <Text cursor="pointer" fontSize={{ base: '12px', lg: '14px' }} lineHeight="1" color="primary" _hover={{ textDecoration: 'underline' }}>
                Learn more about Cetus DLMM
              </Text>
            </HStack>
            {/* disabled={!isPageTerm} */}
            <Button fontWeight="500" fontSize="16px" w="100%" mt="20px" mb="8px" cursor="pointer" onClick={onStart}>
              Get Started
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
