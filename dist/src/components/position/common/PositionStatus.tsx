// import icon_active from '@/assets/images/icon_active@2x.png'
// import img_inactive from '@/assets/images/img_inactive@2x.png'
import { CetusTooltip } from '@cetus/design'
import { cancelBubble } from '@cetus/utils'
import { Box, Center, Flex, HTMLChakraProps, Image, Skeleton, Text, VStack } from '@chakra-ui/react'
import { default as icon_active, default as img_inactive } from '/images/icon_active_new@2x.png'
interface PositionStatusProps extends HTMLChakraProps<'div'> {
  isActive: boolean
  isRow?: boolean
  isLoading?: boolean
  imgStyle?: {
    imgW?: string
    imgH?: string
  }
}
function PositionStatus({ isActive, isRow, isLoading, imgStyle = {}, ...rest }: PositionStatusProps) {
  const { imgW = '36px', imgH = '20px' } = imgStyle
  return (
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
        borderRadius={{ base: '10px', lg: '12px' }}
        align="center"
        justifyContent="center"
        w="80px"
        h="60px"
        bg={isActive ? 'primary_opacity.10' : 'white_color_opacity.10'}
        {...rest}
      >
        <Box>
          <Center onClick={e => cancelBubble(e)}>
            <VStack gap={isRow ? '8px' : '4px'} flexDirection={isRow ? 'row' : 'column'}>
              {isActive && <Image w={imgW} h={imgH} src={isActive ? icon_active : img_inactive} />}
              <Skeleton w="100%" isLoaded={!isLoading}>
                <Text color={isActive ? 'primary' : 'primary_gray'} fontWeight="500" fontSize={{ base: '10px', lg: '14px' }}>
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </Skeleton>
            </VStack>
          </Center>
        </Box>
      </Flex>
    </CetusTooltip>
  )
}

export default PositionStatus
