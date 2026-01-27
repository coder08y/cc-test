import { PoolsDropSelect, TooltipIcon } from '@cetus/design'
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

export const CreateSelectToken = ({
  title,
  value,
  onChange,
  whiteTokenList,
  disabled = false,
  wrapStyle = {},
  symbolStyle = {},
  tokenSize = '20px',
  tokenStyle = {},
  loading = false,
  tooltipCon = '',
  isWhiteTokenSort = true,
  isNeedSearchInput = true
}: any) => {
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
                <HStack gap="2px">
                  <Text fontSize="12px" fontWeight="500">
                    {title}
                  </Text>
                  {tooltipCon && <TooltipIcon tooltipCon={tooltipCon} iconSize="18px" />}
                </HStack>
                <HStack
                  h="42px"
                  w="100%"
                  justify="space-between"
                  p="0px 12px"
                  cursor="pointer"
                  onClick={onOpen}
                  borderRadius="8px"
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
                      <Text color="text_caption" fontSize="14px" fontWeight="600" whiteSpace="nowrap" {...symbolStyle}>
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
        <PopoverContent w={firstItemRef?.current?.clientWidth || '201px'} minW="201px">
          <PopoverBody p="0">
            <PoolsDropSelect
              fromSource="createPool"
              isWhiteTokenSort={isWhiteTokenSort}
              isNeedSearchInput={isNeedSearchInput}
              selectTokenList={value ? [value] : []}
              onClickToken={(token: Token) => {
                onChange(token)
                onClose()
              }}
              whiteTokenList={whiteTokenList}
              hideCheckbox
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  )
}
