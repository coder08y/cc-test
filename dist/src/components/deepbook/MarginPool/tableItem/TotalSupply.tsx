import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, Center, CircularProgress, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

export default function TotalSupply({ item }: { item: any }) {
  const [isShowInfo, setIsShowInfo] = useState(false)
  const { isApp } = useWindowWidth()

  return (
    <VStack
      gap="4px"
      align="flex-end"
      onClick={e => {
        e.stopPropagation()
        setIsShowInfo(!isShowInfo)
      }}
      onMouseEnter={() => setIsShowInfo(true)}
      onMouseLeave={() => setIsShowInfo(false)}
    >
      <Popover isLazy isOpen={isShowInfo} placement="bottom-end" gutter={2} closeDelay={500}>
        <PopoverTrigger>
          <Center as="button">
            <HStack>
              <VStack gap={{ base: '2px', lg: '4px' }} flexDirection={{ base: 'row', lg: 'column' }} align={{ base: 'center', lg: 'flex-end' }}>
                <Text color="text_caption" lineHeight="14px" fontSize={{ base: '12px', lg: '14px' }}>
                  {item?.displayTotalSupply} {item?.tokenInfo?.symbol}
                </Text>
                {isApp && (
                  <Text fontSize="12px" lineHeight="12px" color="primary_gray">
                    (
                  </Text>
                )}
                <Text fontSize="12px" lineHeight="12px" color="primary_gray">
                  {item?.displaySupplyValue}
                </Text>
                {isApp && (
                  <Text fontSize="12px" lineHeight="12px" color="primary_gray">
                    )
                  </Text>
                )}
              </VStack>
              <CircularProgress
                min={0}
                max={100}
                value={item?.supplyProgress}
                size={isApp ? '16px' : '20px'}
                thickness="12px"
                color="text_highlight"
                trackColor="circle_progress_track_color"
              />
            </HStack>
          </Center>
        </PopoverTrigger>
        {isShowInfo && (
          <Portal>
            <PopoverContent zIndex="2" w="fit-content" maxH="200px" overflow="auto" p="4px 0">
              <PopoverBody>
                <VStack gap="12px" align="flex-start" bg="bg_secondary">
                  <HStack w="100%" justify="space-between">
                    <HStack>
                      <Box w="8px" h="8px" borderRadius="50%" bg="primary" />
                      <Text fontSize="12px" lineHeight="12px" color="primary_gray">
                        Total Supplied
                      </Text>
                    </HStack>
                    <Text color="text_caption" fontSize="12px">
                      {item?.displayTotalSupply} {item?.tokenInfo?.symbol}
                    </Text>
                  </HStack>
                  <HStack w="100%" justify="space-between">
                    <HStack>
                      <Box w="8px" h="8px" borderRadius="50%" bg="#202020" />
                      <Text fontSize="12px" lineHeight="12px" color="primary_gray">
                        Available to Supply
                      </Text>
                    </HStack>
                    <Text color="text_caption" fontSize="12px">
                      {item?.displayAvailableSupply} {item?.tokenInfo?.symbol}
                    </Text>
                  </HStack>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    </VStack>
  )
}
