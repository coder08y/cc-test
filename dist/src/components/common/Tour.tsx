import '@/assets/css/dlmm_tutorial_step.scss'
import useGlobalStore from '@cetus/stores/src/global'
import { cancelBubble, d } from '@cetus/utils'
import { Box, Button, HStack, Portal, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useDebounceEffect, useMutationObserver, useSize } from 'ahooks'
import { MouseEvent, useState } from 'react'

export type TourStepType = {
  current: number
  total: number
  title: string
  description: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  target: string
}

type TourProps = {
  isOpen: boolean
  onExit?: () => void
  onNext?: () => void
  onPrev?: () => void
  step: TourStepType
  zIndex?: number
  poolsLength?: string | number
  isPoolLoading?: boolean
}

const modalStyleMap = {
  top: {
    top: '0',
    left: 'calc(50% - 160px)',
    transform: 'translateY(calc(-100% - 54px))'
  },
  bottom: {
    bottom: '0',
    left: 'calc(50% - 160px)',
    transform: 'translateY(calc(100% + 54px))'
  },
  left: {
    top: '50%',
    left: '0',
    transform: 'translate(calc(-100% - 54px), -50%)'
  },
  right: {
    top: '50%',
    right: '0',
    transform: 'translate(calc(100% + 54px), -50%)'
  }
}

const pointerStyleMap = {
  top: {
    top: '-54px',
    left: '50%',
    _before: {
      content: '""',
      pos: 'absolute',
      w: '13px',
      h: '13px',
      borderRadius: '50%',
      bg: 'primary_opacity.60',
      top: '34px',
      left: '-6px'
    },
    _after: {
      content: '""',
      pos: 'absolute',
      w: '9px',
      h: '9px',
      borderRadius: '50%',
      bg: 'primary',
      top: '36px',
      left: '-4px'
    }
  },
  bottom: {
    bottom: '-54px',
    left: '50%',
    _before: {
      content: '""',
      pos: 'absolute',
      w: '13px',
      h: '13px',
      borderRadius: '50%',
      bg: 'primary_opacity.60',
      bottom: '34px',
      left: '-6px'
    },
    _after: {
      content: '""',
      pos: 'absolute',
      w: '9px',
      h: '9px',
      borderRadius: '50%',
      bg: 'primary',
      bottom: '36px',
      left: '-4px'
    }
  },
  left: {
    left: '-54px',
    top: '50%',
    _before: {
      content: '""',
      pos: 'absolute',
      w: '13px',
      h: '13px',
      borderRadius: '50%',
      bg: 'primary_opacity.60',
      top: '-6px',
      right: '-13px'
    },
    _after: {
      content: '""',
      pos: 'absolute',
      w: '9px',
      h: '9px',
      borderRadius: '50%',
      bg: 'primary',
      top: '-4px',
      right: '-11px'
    }
  },
  right: {
    right: '-54px',
    top: '50%',
    _before: {
      content: '""',
      pos: 'absolute',
      w: '13px',
      h: '13px',
      borderRadius: '50%',
      bg: 'primary_opacity.60',
      top: '-6px',
      left: '-13px'
    },
    _after: {
      content: '""',
      pos: 'absolute',
      w: '9px',
      h: '9px',
      borderRadius: '50%',
      bg: 'primary',
      top: '-4px',
      left: '-11px'
    }
  }
}

const fadeIn = keyframes`
  0% { 
    opacity: 0;
    transform: translateY(10px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
`

function Tour({ isOpen, onExit, onNext, onPrev, step, zIndex = 1001, poolsLength, isPoolLoading }: TourProps) {
  const { current, total, title, description, placement, target } = step
  const { dlmmTutorialStep, setDlmmTutorialStep } = useGlobalStore()

  // 获取目标元素的位置和大小
  const [targetElement, setTargetElement] = useState<Element | undefined>()
  const [boxPosition, setBoxPosition] = useState<DOMRect | undefined>()
  const [poolInView, setPoolInView] = useState(false)
  useMutationObserver(
    list => {
      if (list?.length > 0) {
        if (list?.[0]?.target?.childNodes?.length > 0) {
          setPoolInView(true)
        }
      }
    },
    () => document.querySelector('.dlmm-tutorial-step-1'),
    { childList: true, subtree: true }
  )

  useDebounceEffect(
    () => {
      if (target && ((d(poolsLength).gt(0) && !isPoolLoading && dlmmTutorialStep > 1) || dlmmTutorialStep > 2)) {
        const _element = document.querySelector(target)
        if (_element) {
          setTargetElement(_element)
          setBoxPosition(_element?.getBoundingClientRect())
        }
      }
    },
    [target, poolsLength, isPoolLoading, dlmmTutorialStep, poolInView],
    { wait: 100 }
  )

  const size = useSize(targetElement)

  const handleExit = (e: MouseEvent) => {
    cancelBubble(e)
    onExit?.()
  }

  const handleNext = (e: MouseEvent) => {
    cancelBubble(e)
    onNext?.()
  }

  const handlePrevious = (e: MouseEvent) => {
    cancelBubble(e)
    onPrev?.()
  }

  return (
    ((d(poolsLength).gt(0) && !isPoolLoading && dlmmTutorialStep > 1) || dlmmTutorialStep > 2) && (
      <Portal>
        <VStack
          zIndex={zIndex}
          w="100vw"
          h="100vh"
          pos="absolute"
          top="0"
          key={`tour-trigger-${current}`}
          animation={`${fadeIn} 0.8s cubic-bezier(0.16, 1, 0.3, 1)`}
        >
          {size && boxPosition && (
            <Box
              w={`${size?.width + 4}px`}
              h={`${size?.height + 4}px`}
              border="1px dashed"
              borderColor="primary"
              borderRadius="20px"
              position="absolute"
              top={boxPosition?.top - 2}
              left={boxPosition?.left - 2}
              boxShadow="tour_box_shadow"
              p="1px"
              onClick={cancelBubble}
              transition="all 0.5s ease"
            >
              <>
                <Box
                  pos="absolute"
                  w={['top', 'bottom'].some(item => placement?.includes(item)) ? '1px' : '34px'}
                  h={['top', 'bottom'].some(item => placement?.includes(item)) ? '34px' : '1px'}
                  bg="primary"
                  transition="all 0.4s ease"
                  {...pointerStyleMap[placement]}
                />
                <VStack
                  gap="24px"
                  p="16px"
                  w="320px"
                  pos="absolute"
                  bg="background"
                  border="1px solid"
                  borderColor="border"
                  borderRadius="16px"
                  transition="all 0.5s ease"
                  {...modalStyleMap[placement]}
                >
                  <VStack align="flex-start">
                    <Box as="div" color="text_caption" fontSize="16px">
                      {`${current}. ${title} `}
                      <Box as="span" fontSize="12px" color="text_paragraph">
                        (
                        <Box as="span" color="text_caption" fontSize="12px">
                          {current}
                        </Box>
                        /{total})
                      </Box>
                    </Box>
                    <Text fontSize="14px" lineHeight="17px">
                      {description}
                    </Text>
                  </VStack>

                  {current < total ? (
                    <HStack justify="space-between" w="100%">
                      <Button variant="unstyled" fontSize="14px" color="primary" onClick={handleExit} p="0" h="26px">
                        Exit Tutorial
                      </Button>
                      <HStack>
                        <Button isDisabled={current < 2} onClick={handlePrevious} variant="outline" h="26px" borderRadius="6px" fontSize="12px">
                          Previous
                        </Button>
                        <Button onClick={handleNext} variant="solid" h="26px" borderRadius="6px" fontSize="12px">
                          Next
                        </Button>
                      </HStack>
                    </HStack>
                  ) : (
                    <HStack justify="space-between" w="100%">
                      <Button onClick={handlePrevious} variant="outline" h="26px" borderRadius="6px" fontSize="12px" flex="1">
                        Previous
                      </Button>
                      <Button onClick={handleExit} variant="solid" h="26px" borderRadius="6px" fontSize="12px" flex="1">
                        Finish
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </>
            </Box>
          )}
        </VStack>
      </Portal>
    )
  )
}

export default Tour
