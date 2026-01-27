import '@/assets/css/dlmm_tutorial_modal.scss'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useGlobalStore from '@cetus/stores/src/global'
import { Icon } from '@cetus/ui-kit'
import { Box, Button, HStack, Image, Modal, ModalBody, ModalContent, ModalOverlay, Stack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import step1Poster from '/images/step1.png'
import step2Poster from '/images/step2.png'
import step1Video from '/videos/tutorials/step1.mp4'
import step2Video from '/videos/tutorials/step2.mp4'

export default function DlmmTutorial() {
  const { dlmmTutorialStep, setDlmmTutorialStep } = useGlobalStore()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { isApp } = useWindowWidth()
  const handleClose = () => {
    setDlmmTutorialStep(2)
    onClose()
  }

  useEffect(() => {
    if (dlmmTutorialStep < 2) {
      onOpen()
    }
  }, [dlmmTutorialStep])

  const onPrevious = () => {
    setDlmmTutorialStep(dlmmTutorialStep - 1)
  }

  const onNext = () => {
    setDlmmTutorialStep(dlmmTutorialStep + 1)
    if (dlmmTutorialStep === 1) {
      if (pathname !== '/pools' || search !== '?tab=dlmm_pools') {
        navigate('/pools?tab=dlmm_pools')
      }
    }
  }

  return (
    <Modal autoFocus={false} closeOnOverlayClick={false} returnFocusOnClose={false} isOpen={isOpen} onClose={() => {}} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p={{ base: '12px 8px 12px !important', lg: '28px !important' }} bg="#0d0d0d" borderRadius="20px">
          <HStack justify="space-between" mb={{ base: '8px', lg: '12px' }}>
            <HStack>
              <Text fontSize={{ base: '16px', lg: '24px' }} fontWeight="500" color="text_caption">
                Welcome to Cetus DLMM
              </Text>
              <Image src="/images/icon_beta@2x.png" alt="beta" h="16px" />
            </HStack>

            <Icon xlinkHref="#icon-icon_close" fontSize="24px" onClick={handleClose} />
          </HStack>
          <VStack w="100%" gap={{ base: '16px', lg: '40px' }}>
            <VStack w="100%" align="flex-start" gap="4px">
              <Text color="primary_gray" lineHeight="20px">
                DLMM is now live! Explore to provide liquidity with flexible strategies, <br />
                dynamic fees and precise liquidity concentration.
              </Text>
            </VStack>
            <Stack flexDir={{ base: 'column', lg: 'row' }} align="flex-start" justify="space-between" gap={{ base: '16px', lg: '20px' }}>
              <VStack h={{ base: 'auto', lg: '350px' }} justify="space-between">
                <VStack align="flex-start" gap={{ base: '16px', lg: '32px' }}>
                  {dlmmTutorialStep === 0 && (
                    <>
                      <StepItem {...stepConfig[1]} />
                      <StepItem {...stepConfig[2]} />
                    </>
                  )}
                  {dlmmTutorialStep === 1 && (
                    <>
                      <StepItem {...stepConfig[3]} />
                      <StepItem {...stepConfig[4]} />
                      <StepItem {...stepConfig[5]} />
                    </>
                  )}
                </VStack>
                {!isApp && (
                  <HStack gap="12px" w="100%">
                    <Button
                      flex="1"
                      visibility={dlmmTutorialStep === 0 ? 'hidden' : 'visible'}
                      borderRadius="6px"
                      variant="outline"
                      bg="checked_bg"
                      border="none"
                      fontWeight="400"
                      size="sm"
                      onClick={onPrevious}
                      isDisabled={dlmmTutorialStep === 0}
                    >
                      Previous
                    </Button>
                    <Button borderRadius="6px" flex="1" size="sm" fontWeight="500" onClick={onNext}>
                      {dlmmTutorialStep === 0 ? 'Next' : 'Get Started'}
                    </Button>
                  </HStack>
                )}
              </VStack>

              <Box borderRadius="12px" flex={{ base: '1', lg: '0 0 460px' }} h={{ base: 'auto', lg: '350px' }} bg="video_bg">
                <video
                  controls={false}
                  width="460"
                  // height="350"
                  preload="auto"
                  autoPlay
                  muted
                  loop
                  poster={step1Poster}
                  style={{ borderRadius: '12px' }}
                  hidden={dlmmTutorialStep !== 0}
                >
                  <source src={step1Video} />
                </video>
                <video
                  controls={false}
                  width="460"
                  // height="350"
                  preload="auto"
                  autoPlay
                  muted
                  loop
                  poster={step2Poster}
                  style={{ borderRadius: '12px' }}
                  hidden={dlmmTutorialStep !== 1}
                >
                  <source src={step2Video} />
                </video>
              </Box>
              {isApp && (
                <HStack gap="12px" w="100%">
                  <Button
                    flex="1"
                    visibility={dlmmTutorialStep === 0 ? 'hidden' : 'visible'}
                    borderRadius="6px"
                    variant="outline"
                    bg="checked_bg"
                    border="none"
                    fontWeight="400"
                    size="sm"
                    onClick={onPrevious}
                    isDisabled={dlmmTutorialStep === 0}
                  >
                    Previous
                  </Button>
                  <Button borderRadius="6px" flex="1" size="sm" fontWeight="500" onClick={onNext}>
                    {dlmmTutorialStep === 0 ? 'Next' : 'Get Started'}
                  </Button>
                </HStack>
              )}
            </Stack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
const stepConfig: Record<number | string, { title: string; content: string }> = {
  1: {
    title: 'Select Token Pair',
    content: 'Choose the token pair you prefer. '
  },
  2: {
    title: 'Select a Pool',
    content: 'Choose the pool with the different base fee to earn. '
  },
  3: {
    title: 'Select Strategy',
    content: 'Choose how your liquidity will be distributed. Select from different strategies such as Spot, Curve or Bid-Ask.'
  },
  4: {
    title: 'Set Price Range',
    content: 'Define the price range your liquidity will participate in.'
  },
  5: {
    title: 'Provide Liquidity',
    content: 'Enter the amount you want to provide. The chart shows how your liquidity will be distributed across the DLMM pool.'
  }
}

const StepItem = ({ title, content }: { title: string; content: string }) => {
  return (
    <VStack align="flex-start">
      <Text fontWeight="500" color="text_caption">
        {title}
      </Text>
      <Text fontSize="12px" color="primary_gray" lineHeight="18px">
        {content}
      </Text>
    </VStack>
  )
}
