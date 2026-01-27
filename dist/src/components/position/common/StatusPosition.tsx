import { CetusTooltip } from '@cetus/design'
import { cancelBubble } from '@cetus/utils'
import { Center, Flex, HStack, HTMLChakraProps, Image, Skeleton, Text } from '@chakra-ui/react'
import icon_active from '/images/icon_active_new@2x.png'
interface StatusPositionProps extends HTMLChakraProps<'div'> {
  isActive: boolean
  isLoading?: boolean
  imgStyle?: {
    imgW?: string
    imgH?: string
  }
}
function StatusPosition({ isActive, isLoading, imgStyle = {}, ...rest }: StatusPositionProps) {
  const { imgW = '16px', imgH = '12px' } = imgStyle
  return (
    <>
      {!isLoading && (
        <CetusTooltip
          placement="top"
          tooltip={
            <Text fontSize="12px" lineHeight="20px" maxW="240px" textAlign="left">
              {isActive
                ? 'The price of this pool is currently within your position price range.'
                : 'The price of this pool is currently out of your position price range.'}
            </Text>
          }
        >
          <Flex
            minW={isActive ? '76px' : '62px'}
            borderRadius="8px"
            align="center"
            justifyContent="center"
            bg={'bg_secondary'}
            h="18px"
            p="0px 8px"
            {...rest}
          >
            <Center onClick={e => cancelBubble(e)}>
              <Skeleton w="100%" isLoaded={!isLoading}>
                <HStack align="center">
                  {isActive && <Image w={imgW} h={imgH} src={icon_active} />}
                  <Text fontSize="12px" color={isActive ? 'primary' : 'primary_gray'} fontWeight="500">
                    {isActive ? 'Active' : 'Inactive'}
                  </Text>
                </HStack>
              </Skeleton>
            </Center>
          </Flex>
        </CetusTooltip>
      )}
    </>
  )
}

export default StatusPosition
