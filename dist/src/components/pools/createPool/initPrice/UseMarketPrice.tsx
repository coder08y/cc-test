import { CetusTooltip } from '@cetus/design'
import { Box, Text } from '@chakra-ui/react'

function UseMarketPrice({ onClick }: { onClick: () => void }) {
  return (
    <CetusTooltip
      placement="top-end"
      maxW="248px"
      tooltip={
        <Text fontSize="12px" lineHeight="20px">
          The market price is an estimation value. Please verify before using it
        </Text>
      }
    >
      <Box
        fontSize="12px"
        cursor="pointer"
        onClick={onClick}
        display={{ base: 'none', lg: 'flex' }}
        color="text_paragraph"
        _hover={{ color: 'text_caption' }}
      >
        Use Market Price
      </Box>
    </CetusTooltip>
  )
}

export default UseMarketPrice
