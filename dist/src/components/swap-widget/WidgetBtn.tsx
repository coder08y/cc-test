import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { Icon } from '@cetus/ui-kit'
import { Box, HStack, Image, Stack, Text, VStack } from '@chakra-ui/react'

type WidgetBtnProps = {
  isOpen: boolean
  popoverPosition: string
  handleCloseTips: (e: any) => void
}

export function WidgetBtn(props: WidgetBtnProps) {
  const { isOpen, popoverPosition, handleCloseTips } = props
  const { currWidgetImg } = useSwapWidgetConfigStore()
  const { showSwapWidgetTips, setShowSwapWidgetTips } = useWebConfigStore()
  const { isApp } = useWindowWidth()

  return (
    <>
      <Box p="10px" display={isOpen ? 'block' : 'none'} pointerEvents="none">
        <Block w={{ base: '56px', lg: '52px' }} h={{ base: '56px', lg: '52px' }} borderRadius="50%" p="5px" bg="swap_bg_primary">
          <HStack w="100%" h="100%" justifyContent="center" alignItems="center" pt="5px" pr="1px">
            <Icon xlinkHref="#icon-icon_descending_nor" svgH="10px" svgFill="text_caption" svgHover="primary" />
          </HStack>
        </Block>
      </Box>

      <VStack alignItems={popoverPosition.includes('start') ? 'start' : 'end'}>
        {showSwapWidgetTips && !isOpen && (
          <Stack position="relative" mr="20px">
            <VStack
              gap="8px"
              p="12px"
              bg="card_bg"
              alignItems="start"
              backdropFilter="blur(10px)"
              borderRadius="8px"
              border="2px solid"
              borderColor="text_highlight_opacity.30"
            >
              <Text fontSize="12px" color="text_caption" textAlign="start">
                You can quickly call out swap widget from
              </Text>
              <Text fontSize="12px" color="text_caption" textAlign="start">
                here at any time. Display can be turned
              </Text>
              <Text fontSize="12px" color="text_caption" textAlign="start">
                off/on in settings.
              </Text>
            </VStack>
            <HStack
              w="20px"
              h="20px"
              justifyContent="center"
              alignItems="center"
              bg="card_bg"
              backdropFilter="blur(10px)"
              borderRadius="4px"
              border="1px solid"
              borderColor="text_highlight_opacity.30"
              position="absolute"
              top="-10px"
              right="-10px"
            >
              <Icon
                xlinkHref="#icon-icon_close"
                variant="gray"
                onTouchStart={(e: any) => {
                  handleCloseTips(e)
                  // setShowSwapWidgetTips(false)
                }}
                onClick={(e: any) => {
                  handleCloseTips(e)
                  // setShowSwapWidgetTips(false)
                }}
              />
            </HStack>
          </Stack>
        )}

        <Box
          _hover={{
            transform: 'scale(1.2)'
          }}
          display={isOpen ? 'none' : 'block'}
        >
          <Image
            draggable="false"
            src={currWidgetImg}
            fallbackSrc="/images/placeholder-token@2x.png"
            w={{ base: '60px', lg: '68px' }}
            h={{ base: '60px', lg: '68px' }}
            pointerEvents="none" // Prevent click events on the image
          />
        </Box>
      </VStack>
    </>
  )
}
