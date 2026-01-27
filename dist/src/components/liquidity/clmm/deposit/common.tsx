import CurrentPoolPriceLabel from '@/components/common/CurrentPoolPriceLabel'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Box, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Skeleton, Stack, StackProps, Text } from '@chakra-ui/react'

export const CurrentPrice = ({
  price,
  perText,
  wrapStyle,
  loading,
  horizontal = false
}: {
  price: string
  perText: string
  wrapStyle?: StackProps
  loading?: boolean
  horizontal?: boolean
}) => {
  const { isApp } = useWindowWidth()
  return (
    <Stack flexDir={horizontal ? 'row' : { base: 'column', lg: 'row' }} align="flex-start" {...wrapStyle}>
      <CurrentPoolPriceLabel />
      <HStack as="div" h="18px" gap={isApp ? '4px' : '8px'}>
        {loading || price === '--' ? (
          <Skeleton w="66px" h="14px" display="inline-block" />
        ) : (
          <Text fontSize={isApp ? '12px' : '14px'} as="span" color="text_caption" display="inline-block" h="14px" lineHeight="14px">
            {price}
          </Text>
        )}
        <Text fontSize={isApp ? '12px' : '14px'} as="span" display="inline-block" h="14px" lineHeight="14px">{` ${perText}`}</Text>
      </HStack>
    </Stack>
  )
}

export const Item = ({
  label,
  tooltip,
  children,
  wrapStyle = {}
}: {
  label: string
  tooltip: string
  children: React.ReactNode
  wrapStyle?: StackProps
}) => {
  const { isApp } = useWindowWidth()
  return (
    <HStack w="100%" justify="space-between" {...wrapStyle}>
      <HStack gap="4px">
        <Text>{label}</Text>
        <Popover isLazy trigger={isApp ? 'click' : 'hover'}>
          <PopoverTrigger>
            <Box>
              <Icon xlinkHref="#icon-icon_tips" />
            </Box>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody p="12px" fontSize="12px" lineHeight="20px">
              {tooltip}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
      {children}
    </HStack>
  )
}
