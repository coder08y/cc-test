import { Icon } from '@cetus/ui-kit'
import { Box, HStack, HTMLChakraProps, Text, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface DcaVLabelProps extends HTMLChakraProps<'div'> {
  label: string
  value: string | ReactNode
  direct?: boolean
  showDirectIcon?: boolean
  textAlign?: 'left' | 'right'
  onChangeDirect?: () => void
}
export default function DcaVLabel({ label, value, direct, onChangeDirect, textAlign = 'left', showDirectIcon = true, ...rest }: DcaVLabelProps) {
  return (
    <VStack
      align="flex-start"
      flexDirection={{ base: 'row', lg: 'column' }}
      w={{ base: '100%', lg: 'unset' }}
      justify={{ base: 'space-between', lg: 'unset' }}
      {...rest}
    >
      {label !== '' && (
        <HStack h="12px">
          <Text fontSize="12px">{label}</Text>
          {onChangeDirect && showDirectIcon && <Icon xlinkHref="#icon-icon_swap1" svgW="14px" svgH="14px" ml="-6px" onClick={onChangeDirect} />}
        </HStack>
      )}
      {value !== '' && (
        <Box fontSize="12px" color="text_caption" textAlign={textAlign}>
          {value}
        </Box>
      )}
    </VStack>
  )
}
