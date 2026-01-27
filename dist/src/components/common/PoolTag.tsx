import { Box, BoxProps, FlexboxProps, HStack, StackProps, Text } from '@chakra-ui/react'
import { PoolType } from '../pools/createPool/SelectPoolType'

const tagStyleMap: Record<PoolType, { title: string; tagStyle: BoxProps; flex: FlexboxProps['flex'] }> = {
  dlmm: {
    title: 'DLMM',
    flex: '0 0 46px',
    tagStyle: {
      bg: 'primary_green_opacity.10',
      color: 'primary_green',
      borderColor: 'primary_green_opacity.20'
    }
  },
  clmm: {
    title: 'CLMM',
    flex: '0 0 46px',
    tagStyle: {
      bg: 'primary_opacity.10',
      color: 'primary',
      borderColor: 'primary_opacity.20'
    }
  }
}

function PoolTag({
  poolType,
  type,
  displayFee,
  onMouseEnter,
  onMouseLeave,
  binStep,
  showFee = true,
  wrapStyle
}: {
  poolType: PoolType
  type?: 'position' | 'stats'
  showFee?: boolean
  displayFee: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  binStep?: number
  wrapStyle?: StackProps
}) {
  const { title, tagStyle, flex } = tagStyleMap[poolType]
  return (
    <HStack
      bg="bg_secondary"
      borderRadius="10px"
      border="1px solid"
      borderColor="border"
      gap="0"
      h="18px"
      w="auto"
      display="inline-flex"
      align="center"
      {...wrapStyle}
    >
      <Text fontWeight="500" fontSize="10px !important" color={tagStyle?.color} textAlign="center" whiteSpace="nowrap" px="8px">
        {title}
      </Text>

      {showFee && (
        <HStack
          h="16px"
          fontWeight="500"
          borderRadius="8px"
          border="none"
          justify="center"
          {...tagStyle}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          cursor="pointer"
          gap="4px"
          p="0 6px"
          w="auto"
          display="inline-flex"
          align="center"
        >
          <Text fontSize="10px !important" lineHeight="16px" color="text_caption" whiteSpace="nowrap">
            {displayFee}
          </Text>

          {poolType === 'dlmm' && (
            <>
              <Box w="1px" h="10px" bg="text_caption" opacity="0.3" />
              <Text fontSize="10px !important" lineHeight="16px" color="text_caption" whiteSpace="nowrap">
                {binStep} bps
              </Text>
            </>
          )}
        </HStack>
      )}
    </HStack>
  )
}

export default PoolTag
