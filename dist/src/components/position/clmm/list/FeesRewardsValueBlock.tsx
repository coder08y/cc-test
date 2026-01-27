import usePositionStore from '@/store/position'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { cancelBubble, formatCurrency, formatNumber } from '@cetus/utils'
import { Box, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

const FeesRewardsValueBlock = ({ posInfo }: { posInfo: any }) => {
  const [isShowInfo, setIsShowInfo] = useState(false)
  const { posApiPoolData } = usePositionStore()
  const haveMining = posApiPoolData[posInfo?.clmmPool]?.haveMining
  const haveFarming = posApiPoolData[posInfo?.clmmPool]?.haveFarming
  return (
    <Box
      p={{ base: 0, lg: '12px 0' }}
      onClick={e => cancelBubble(e)}
      onMouseEnter={() => setIsShowInfo(true)}
      onMouseLeave={() => setIsShowInfo(false)}
    >
      <Popover isLazy isOpen={isShowInfo}>
        <PopoverTrigger>
          <Center as="button" cursor={Number(posInfo?.totalRewardUsd) == 0 ? 'text' : 'help'}>
            <Text
              color="primary"
              fontSize={{ base: '12px', lg: '14px' }}
              textDecoration={Number(posInfo?.totalRewardUsd) == 0 ? 'none' : 'underline dotted'}
              textUnderlineOffset="3px"
            >
              {formatCurrency(posInfo?.totalRewardUsd, 2)}
            </Text>
          </Center>
        </PopoverTrigger>
        {isShowInfo && Number(posInfo?.totalRewardUsd) !== 0 && (
          <Portal>
            <PopoverContent zIndex="2" w="fit-content">
              <PopoverBody>
                <VStack align="flex-start" minW="300px">
                  {posInfo?.pendingFeesList?.length > 0 && (
                    <VStack align="flex-start" minW="100%">
                      <HStack w="100%" justify="space-between" bg="bg_third" borderRadius="12px" p="16px">
                        <Text fontSize="12px">Fees</Text>
                        <Text color="primary"> {formatCurrency(posInfo?.feeOwedUsd, 2)}</Text>
                      </HStack>
                      {posInfo?.pendingFeesList?.map((item: any) => {
                        return (
                          <HStack w="100%" key={item?.coin_address} justify="space-between" p="0 16px 8px">
                            <SingleTokenInfo
                              token={item.token}
                              imgBoxStyle={{ w: '20px', h: '20px' }}
                              haveName={false}
                              symbolFontSize="12px"
                              warningIcon={{ iconW: '10px', iconH: '10px' }}
                            />
                            <VStack align="flex-end" gap="4px">
                              <Text fontSize="12px" color="text_caption">
                                {formatNumber(item?.amount, 6)}
                              </Text>
                              <Text fontSize="12px">{formatCurrency(item?.amountUSD, 2)}</Text>
                            </VStack>
                          </HStack>
                        )
                      })}
                    </VStack>
                  )}
                  {posInfo?.pendingRewarderList?.length > 0 && (
                    <VStack align="flex-start" minW="100%">
                      <HStack w="100%" justify="space-between" bg="bg_third" borderRadius="6px" p="16px">
                        <Text fontSize="12px">Mining rewards</Text>
                        <Text color="primary"> {formatCurrency(posInfo?.rewarderUsd, 2)}</Text>
                      </HStack>
                      {posInfo?.pendingRewarderList?.map((item: any) => {
                        return (
                          <HStack w="100%" key={item?.coin_address} justify="space-between" p="0 16px 8px">
                            <SingleTokenInfo
                              token={item.token}
                              imgBoxStyle={{ w: '20px', h: '20px' }}
                              haveName={false}
                              symbolFontSize="12px"
                              warningIcon={{ iconW: '10px', iconH: '10px' }}
                            />
                            <VStack align="flex-end" gap="4px">
                              <Text fontSize="12px" color="text_caption">
                                {formatNumber(item?.amount, 6)}
                              </Text>
                              <Text fontSize="12px">{formatCurrency(item?.amountUSD, 2)}</Text>
                            </VStack>
                          </HStack>
                        )
                      })}
                    </VStack>
                  )}
                  {posInfo?.pendingFarmsList?.length > 0 && (
                    <VStack align="flex-start" minW="100%">
                      <HStack w="100%" justify="space-between" bg="bg_third" borderRadius="6px" p="16px">
                        <Text fontSize="12px">Farming rewards</Text>
                        <Text color="primary"> {formatCurrency(posInfo?.farmsUsd, 2)}</Text>
                      </HStack>
                      {posInfo?.pendingFarmsList?.map((item: any) => {
                        return (
                          <HStack w="100%" key={item?.token?.coin_type} justify="space-between" p="0 16px 8px">
                            <SingleTokenInfo
                              token={item.token}
                              imgBoxStyle={{ w: '20px', h: '20px' }}
                              haveName={false}
                              symbolFontSize="12px"
                              warningIcon={{ iconW: '10px', iconH: '10px' }}
                            />
                            <VStack align="flex-end" gap="4px">
                              <Text fontSize="12px" color="text_caption">
                                {formatNumber(item?.amount, 6)}
                              </Text>
                              <Text fontSize="12px">{formatCurrency(item?.amountUSD, 2)}</Text>
                            </VStack>
                          </HStack>
                        )
                      })}
                    </VStack>
                  )}
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    </Box>
  )
}

export default FeesRewardsValueBlock
