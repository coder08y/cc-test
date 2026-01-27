import { CetusTooltip } from '@cetus/design'
import { Center, CircularProgress, Text } from '@chakra-ui/react'

interface FreshProgress {
  value: number
  min: number
  max: number
  onClick: () => void
}

function FreshProgress({ value, min, max, onClick }: FreshProgress) {
  return (
    <CetusTooltip
      tooltip={
        <Text fontSize="12px" lineHeight="20px">
          Auto refresh in 20 seconds, you can click to update manually.
        </Text>
      }
    >
      <Center w="28px" h="28px" border="1px solid" borderColor="border" borderRadius="8px" bg="bg_secondary" cursor="pointer" onClick={onClick}>
        <CircularProgress min={min} max={max} value={value} size="18px" color="text_highlight" trackColor="circle_progress_track_color" />
      </Center>
    </CetusTooltip>
  )
}

export default FreshProgress
