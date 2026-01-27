import { SingleCoinImage } from '@cetus/ui-kit'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
type Props =
  | {
      title: string
      imgUrl?: string
    }
  | {
      title: string
      imgUrl?: string
      onClick: () => void
      btnTitle: string
    }
function Header(props: Props) {
  const { title, imgUrl } = props
  return (
    <HStack justify="space-between" align="flex-start" w="100%">
      <HStack>
        {imgUrl && (
          <SingleCoinImage
            imageUrl={imgUrl}
            p="4px"
            imgBoxStyle={{
              w: '20px',
              h: '20px',
              bg: 'block_color',
              borderColor: 'transparent',
              borderRadius: '20px'
            }}
          />
        )}
        <Text>{title}</Text>
      </HStack>
      {'btnTitle' in props && props.btnTitle ? (
        <Button h="32px" borderRadius="8px" p="8px" fontSize="12px" onClick={props.onClick} fontWeight="500">
          {props.btnTitle}
        </Button>
      ) : (
        <Box h="32px" />
      )}
    </HStack>
  )
}

export default Header
