import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import {
  Box,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverContentProps,
  PopoverTrigger,
  SpaceProps,
  StackProps,
  Text
} from '@chakra-ui/react'
import React from 'react'

function WithTooltipInfo({
  label,
  tooltip,
  children,
  wrapStyle = {},
  w,
  p = '12px'
}: {
  label: string
  tooltip: string
  children?: React.ReactNode
  wrapStyle?: StackProps
  w?: PopoverContentProps['w']
  p?: SpaceProps['p']
}) {
  const { isApp } = useWindowWidth()

  return (
    <HStack w="100%" justify="space-between" {...wrapStyle}>
      <HStack gap="4px">
        <Text fontSize={{ base: '12px', lg: '14px' }} color="text_paragraph">
          {label}
        </Text>
        <Popover isLazy trigger={isApp ? 'click' : 'hover'}>
          <PopoverTrigger>
            <Box>
              <Icon fontSize={isApp ? '16px' : '20px'} xlinkHref="#icon-icon_tips" />
            </Box>
          </PopoverTrigger>
          <PopoverContent w={w}>
            <PopoverBody p={p} fontSize="12px" lineHeight="20px">
              {tooltip}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
      {children}
    </HStack>
  )
}

export default WithTooltipInfo
