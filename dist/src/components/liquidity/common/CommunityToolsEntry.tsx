import { Block } from '@cetus/design'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { HStack, Image, Stack, Text, VStack } from '@chakra-ui/react'

function CommunityToolsEntry() {
  const { isApp } = useWindowWidth()
  const { poolId, poolAddress } = useQueryParams()
  return (
    <VStack w="100%" p={{ base: '16px 12px 12px', lg: '0' }} bg="transparent" borderRadius="16px" align="start" gap="10px">
      <Text color="text_caption" fontSize="14px" display={{ base: 'block', lg: 'none' }} fontWeight="500">
        Community-Built Tools
      </Text>
      <Block
        w="100%"
        display="flex"
        flexDir={{ base: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', lg: 'center' }}
        p={{ base: '12px 8px', lg: '19px 20px' }}
        borderRadius={{ base: '8px', lg: '16px' }}
        bg={{ base: 'primary_opacity.10', lg: 'bg_secondary' }}
        borderColor={{ base: 'transparent', lg: 'border' }}
        gap={{ base: '8px', lg: '12px' }}
      >
        <Text color="text_caption" display={{ base: 'none', lg: 'block' }}>
          Community-Built Tools
        </Text>
        <Stack flexDir={{ base: 'column', lg: 'row' }} w={{ base: '100%', lg: 'auto' }} gap={{ base: '12px', lg: '20px' }}>
          <Tool imgUrl="/images/community-tools/cetus-box.png" title="Cetus Box" link="https://www.cetusbox.zone/" />
          <Tool imgUrl="/images/community-tools/noodles.png" title="Noodles" link={`https://noodles.fi/pools/${poolId || poolAddress}`} />
        </Stack>
      </Block>
    </VStack>
  )
}

type ToolProps = {
  imgUrl: string
  title: string
  link: string
}

const Tool = ({ imgUrl, title, link }: ToolProps) => {
  const { isApp } = useWindowWidth()
  return (
    <HStack
      p={{ base: '0px', lg: '10px 40px 10px 35px' }}
      w="auto"
      flexWrap="nowrap"
      bg={{ base: 'transparent', lg: 'background' }}
      borderRadius="8px"
      h={{ base: '20px', lg: '40px' }}
      cursor="pointer"
      _hover={{
        svg: {
          fill: 'text_caption'
        }
      }}
      onClick={() => window.open(link, '_blank')}
      justify="space-between"
    >
      <HStack>
        <Image src={imgUrl} w="20px" h="20px" />
        <Text fontSize={{ base: '12px', lg: '14px' }} color="text_caption">
          {title}
        </Text>
      </HStack>
      <HStack>
        {isApp && <Text fontSize="12px">Website</Text>}
        <Icon xlinkHref="#icon-icon_link3" fontSize="16px" />
      </HStack>
    </HStack>
  )
}

export default CommunityToolsEntry
