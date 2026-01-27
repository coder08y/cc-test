import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, Flex, HStack, Image, Text } from '@chakra-ui/react'

export function VaultsProvider({ category, version }: { category: string; version?: string }) {
  const { isApp } = useWindowWidth()
  return (
    <CetusTooltip
      tooltip={<Text fontSize="12px">{category === 'cetus' ? 'Cetus Protocol' : 'Haedal Protocol'}</Text>}
      children={
        <HStack justifyContent="flex-end" gap="4px">
          <Box position="relative">
            <Image decoding="async" src={category === 'cetus' ? '/images/cetus-logo@2x.png' : '/images/haedal-logo@2x.png'} w="24px" h="24px" />
            {category !== 'cetus' && (
              <Flex
                position="absolute"
                bottom="-1px"
                left="10px"
                fontWeight="600"
                w="20px"
                h="12px"
                lineHeight="12px"
                borderRadius="6px"
                bg="bg_secondary"
                border="1px solid"
                borderColor="border_secondary"
                align="center"
                justify="center"
              >
                <Text color="#F9E0BC" fontSize="10px">
                  {version === 'V1' ? 'v1' : 'v2'}
                </Text>
              </Flex>
            )}
          </Box>

          {isApp && (
            <Text fontSize="14px" color="text_caption">
              {category === 'cetus' ? 'Cetus' : 'Haedal'}
            </Text>
          )}
        </HStack>
      }
    />
  )
}
