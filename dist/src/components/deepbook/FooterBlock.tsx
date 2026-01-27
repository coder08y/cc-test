import { Block } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { HStack, Image, Text } from '@chakra-ui/react'

function FooterBlock() {
  return (
    <Block
      minWidth={{ base: '100%', lg: '1160px' }}
      borderRadius="8px"
      border="none"
      minH={{ base: '68px', lg: '40px' }}
      p="0"
      gap="0"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <HStack
        h="100%"
        w="100%"
        justify="center"
        gap={{ base: '12px', lg: '40px' }}
        flexDirection={{ base: 'row', lg: 'row' }}
        p={{ base: '12px', lg: '0' }}
        justifyContent={{ base: 'center', lg: 'center' }}
      >
        <HStack gap="4px">
          <Text fontSize="12px">Settlement Venue:</Text>
          <Image w="75px" h="12px" src="/images/deepbook/logo_deepbook@2x.png" />
        </HStack>
        <HStack gap="4px">
          {/* <Text fontSize="12px">Switch to</Text> */}
          <HStack
            _hover={{ textDecoration: 'underline', color: 'text_caption' }}
            sx={{
              _hover: {
                '&>p': {
                  textDecoration: 'underline',
                  color: 'text_caption'
                },
                '&>div>svg': {
                  fill: 'text_caption'
                }
              }
            }}
          >
            <Text
              cursor="pointer"
              onClick={() => {
                window.open('https://deepbook.cetus.zone/v2', '_blank')
              }}
              fontSize="12px"
            >
              DeepBook V2
            </Text>
            <Icon xlinkHref="#icon-icon_link3" fontSize="14px" />
          </HStack>
        </HStack>
      </HStack>
    </Block>
  )
}

export default FooterBlock
