import { HStack, StackProps, Text, VStack } from '@chakra-ui/react'
import React from 'react'

interface DivisionBlockProps {
  children: React.ReactNode | React.ReactNode[]
  title: string | React.ReactNode
  wrapStyle?: StackProps
  divider?: boolean
  titleStyle?: StackProps
}

function DivisionBlock({ children, title, wrapStyle = {}, divider = false, titleStyle = {} }: DivisionBlockProps) {
  const isMultiChild = Array.isArray(children)
  return (
    <VStack gap="8px" p={divider ? '0 16px 16px' : '10px 16px 16px'} borderRadius="16px" bg="card_bg" {...wrapStyle}>
      <HStack
        w="100%"
        justify="space-between"
        h={divider ? '52px' : '32px'}
        borderBottom={divider ? '1px solid' : 'none'}
        borderColor="border"
        p={divider ? '10px 0' : '0'}
        {...titleStyle}
      >
        {typeof title === 'string' ? (
          <Text fontSize="16px" fontWeight="500" color="text_caption">
            {title}
          </Text>
        ) : (
          title
        )}

        {isMultiChild ? children?.[0] : children}
      </HStack>
      {isMultiChild && children?.[1]}
    </VStack>
  )
}

export default DivisionBlock
