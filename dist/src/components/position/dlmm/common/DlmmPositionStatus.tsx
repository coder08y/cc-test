import { Text } from '@chakra-ui/react'

type DlmmPositionDetailProps = {
  isActive: boolean
}
export default function DlmmPositionStatus(props: DlmmPositionDetailProps) {
  const { isActive } = props

  return (
    <Text
      position="absolute"
      right="0"
      top="0"
      bg="primary_opacity.10"
      p="8px 12px"
      color={isActive ? 'primary' : 'primary_gray'}
      borderRadius="0px 16px 0px 16px"
      fontSize="12px"
    >
      {isActive ? 'Active' : 'Inactive'}
    </Text>
  )
}
