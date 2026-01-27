import { PoolsDropSelect } from '@cetus/design'
import { Token } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import {
  Box,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { useRef } from 'react'
import { SelectTokenProps } from './type'

export const SelectToken = ({
  title,
  value,
  onChange,
  whiteTokenList,
  isWhiteSelect,
  disabled = false,
  wrapStyle = {},
  symbolStyle = {},
  tokenSize = '28px',
  tokenStyle = {},
  loading = false,
  fromSource
}: SelectTokenProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const firstItemRef = useRef(null)

  return (
    <>
      <Popover
        modifiers={[
          {
            name: 'flip',
            enabled: false // Disable automatic flip
          },
          {
            name: 'shift',
            enabled: false // Disable automatic shift
          }
        ]}
        initialFocusRef={firstItemRef}
        isLazy
        isOpen={isOpen}
        trigger="click"
        onClose={onClose}
        onOpen={onOpen}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <Box w="100%" as="button" ref={firstItemRef} disabled={disabled}>
            {loading ? (
              <HStack>
                <SkeletonCircle w={tokenSize} h={tokenSize} />
                <Skeleton h={symbolStyle.fontSize || '16px'} />
              </HStack>
            ) : (
              <VStack flex="1" gap="8px" align="flex-start">
                {title && (
                  <Text fontSize="12px" fontWeight="500">
                    {title}
                  </Text>
                )}
                <HStack
                  h="48px"
                  w="100%"
                  justify="space-between"
                  p="9px 16px"
                  cursor="pointer"
                  onClick={onOpen}
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="border"
                  bg="bg_secondary"
                  _hover={{
                    svg: {
                      fill: 'text_caption'
                    }
                  }}
                  {...wrapStyle}
                >
                  {value ? (
                    <HStack>
                      <SingleCoinImage imageUrl={value?.logo_url} w={tokenSize} h={tokenSize} coinType={value?.coin_type} {...tokenStyle} />
                      <Text color="text_caption" fontSize="16px" fontWeight="600" whiteSpace="nowrap" {...symbolStyle}>
                        {textEllipses(value?.symbol)}
                      </Text>
                    </HStack>
                  ) : (
                    <Text color="text_caption" fontSize="14px" fontWeight="500" whiteSpace="nowrap">
                      Select token
                    </Text>
                  )}
                  <Icon
                    xlinkHref="#icon-icon_arrow"
                    fontSize="12px"
                    transition="transform 0.5s"
                    transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                  />
                </HStack>
              </VStack>
            )}
          </Box>
        </PopoverTrigger>
        <PopoverContent w={firstItemRef?.current?.clientWidth || '224px'} minW="224px">
          <PopoverBody p="0">
            <PoolsDropSelect
              selectTokenList={value ? [value] : []}
              onClickToken={(token: Token) => {
                onChange(token)
                onClose()
              }}
              whiteTokenList={whiteTokenList}
              hideCheckbox
              fromSource={fromSource}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  )
}
