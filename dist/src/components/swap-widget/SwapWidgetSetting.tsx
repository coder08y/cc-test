import { WidgetButtonImgs } from '@/config/swap-widget'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import { Block } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { Box, Center, HStack, Image, Text, VStack } from '@chakra-ui/react'
import SwapWidgetBack from './SwapWidgetBack'

type SwapWidgetSettingProps = {
  onClose: () => void
}

export default function SwapWidgetSetting(props: SwapWidgetSettingProps) {
  const { onClose } = props

  return (
    <VStack w="100%" gap="12px" pb="16px">
      <SwapWidgetBack title="Settings" onBackClick={onClose} />
      <ChangeImageBlock />
      {/* <ChangeDisplayPosition /> */}
    </VStack>
  )
}

function ChangeImageBlock() {
  const { currWidgetImg, swapWidgetDirection, saveCurrWidgetImg } = useSwapWidgetConfigStore()

  return (
    <Box w="100%" pl="16px" pr="16px">
      <Block borderRadius="12px" bg="swap_bg_secondary" pl="12px" pr="12px" pt="16px" pb="16px">
        <VStack w="100%" alignItems="start" gap="16px">
          <Text color="text_paragraph">Change image</Text>

          <HStack w="100%" wrap="wrap" justifyContent="space-between">
            {WidgetButtonImgs.map(url => {
              return (
                <Block
                  key={url}
                  w="44px"
                  h="44px"
                  borderRadius="50%"
                  p="6px"
                  borderColor={currWidgetImg === url ? 'circle_progress_color' : 'border'}
                >
                  <Center
                    w="100%"
                    h="100%"
                    cursor="pointer"
                    onClick={() => {
                      saveCurrWidgetImg(url)
                    }}
                  >
                    <Image src={url} w="36px" />
                  </Center>
                </Block>
              )
            })}
          </HStack>
        </VStack>
      </Block>
    </Box>
  )
}

function ChangeDisplayPosition() {
  const { swapWidgetDirection, saveSwapWidgetDirection } = useSwapWidgetConfigStore()

  return (
    <Box w="100%" pl="16px" pr="16px" mt="4px">
      <Block borderRadius="12px" bg="swap_bg_secondary" pl="12px" pr="12px" pt="16px" pb="16px">
        <VStack w="100%" alignItems="start" gap="16px">
          <Text color="text_paragraph">Default display position</Text>

          <Block borderRadius="8px" p="12px">
            <HStack w="100%" wrap="wrap" justifyContent="center" h="140px" pos="relative" p="36px">
              <Text textAlign="center" fontSize="12px" lineHeight="16px" color="text_paragraph">
                Click the arrow to modify the default display position of the widget
              </Text>

              {/* 左上 */}
              <Block
                w="32px"
                h="32px"
                borderRadius="12px"
                bg={swapWidgetDirection === 'left-top' ? 'card_bg' : 'transparent'}
                border={swapWidgetDirection === 'left-top' ? 'border' : 'transparent'}
                p="0px"
                pos="absolute"
                left="0px"
                top="0px"
              >
                <VStack w="100%" h="100%" justifyContent="center" cursor="pointer" onClick={() => saveSwapWidgetDirection('left-top')}>
                  <Icon xlinkHref="#icon-icon_left" fontSize="16px" transform="rotate(45deg)" />
                </VStack>
              </Block>

              {/* 右上 */}
              <Block
                w="32px"
                h="32px"
                borderRadius="12px"
                bg={swapWidgetDirection === 'right-top' ? 'card_bg' : 'transparent'}
                border={swapWidgetDirection === 'right-top' ? 'border' : 'transparent'}
                p="0px"
                pos="absolute"
                right="0px"
                top="0px"
              >
                <VStack w="100%" h="100%" justifyContent="center" cursor="pointer" onClick={() => saveSwapWidgetDirection('right-top')}>
                  <Icon xlinkHref="#icon-icon_left" fontSize="16px" transform="rotate(135deg)" />
                </VStack>
              </Block>

              {/* 左下 */}
              <Block
                w="32px"
                h="32px"
                borderRadius="12px"
                bg={swapWidgetDirection === 'left-bottom' ? 'card_bg' : 'transparent'}
                border={swapWidgetDirection === 'left-bottom' ? 'border' : 'transparent'}
                p="0px"
                pos="absolute"
                left="0px"
                bottom="0px"
              >
                <VStack w="100%" h="100%" justifyContent="center" cursor="pointer" onClick={() => saveSwapWidgetDirection('left-bottom')}>
                  <Icon xlinkHref="#icon-icon_left" fontSize="16px" transform="rotate(-45deg)" />
                </VStack>
              </Block>

              {/* 右下 */}
              <Block
                w="32px"
                h="32px"
                borderRadius="12px"
                bg={swapWidgetDirection === 'right-bottom' ? 'card_bg' : 'transparent'}
                border={swapWidgetDirection === 'right-bottom' ? 'border' : 'transparent'}
                p="0px"
                pos="absolute"
                right="0px"
                bottom="0px"
              >
                <VStack w="100%" h="100%" justifyContent="center" cursor="pointer" onClick={() => saveSwapWidgetDirection('right-bottom')}>
                  <Icon xlinkHref="#icon-icon_left" fontSize="16px" transform="rotate(-135deg)" />
                </VStack>
              </Block>
            </HStack>
          </Block>
        </VStack>
      </Block>
    </Box>
  )
}
