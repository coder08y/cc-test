import useDlmmPositionStore from '@/store/dlmm-position'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { cancelBubble, d, formatCurrency, formatNumber } from '@cetus/utils'
import { Box, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
const DLMMPendingRewardsBlock = ({ positionInfo, onRewardsChange }: { positionInfo: DlmmPosBaseInfo; onRewardsChange: (value: any) => void }) => {
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  const { dlmmPosRewardsData, dlmmPosRewardsDataLoading } = useDlmmPositionStore()

  const currentPosData = dlmmPosRewardsData[positionInfo?.id]

  const rewardsMiningInfo = useMemo(() => {
    const list = currentPosData?.map((reward: any) => {
      console.log('🚀 ~ list ~ reward:', reward)
      const amountUSD = getTokenAmountValue(reward?.token?.coin_type, reward?.display_amount_owed, '--')
      return {
        ...reward,
        amountUSD
      }
    })
    if (list && list.length > 0) {
      return list.filter((ele: any) => d(ele.display_amount_owed).gt(0))
    }
    return []
  }, [positionInfo, currentPosData, coinPriceObj])

  const totalUSD = useMemo(() => {
    let total: any
    if (rewardsMiningInfo?.length > 0) {
      rewardsMiningInfo.forEach((ele: any) => {
        const eleUSD = ele?.amountUSD
        total = eleUSD == '--' || total == '--' ? '--' : d(total).plus(eleUSD).toString()
      })
      return total == '--' ? '$--' : formatCurrency(total, 2)
    }
    return '$0'
  }, [rewardsMiningInfo])

  const { isApp } = useWindowWidth()

  useEffect(() => {
    onRewardsChange?.(totalUSD) // 调用回调将数据传回父组件
  }, [totalUSD])
  return (
    <>
      {/* {(rewardsMiningInfo?.length > 0 || haveMining || positionInfo?.posType == 'farms') && ( */}
      <VStack
        w={{ base: 'unset', lg: 'unset' }}
        justify={{ base: 'space-between', lg: 'unset' }}
        align={{ base: 'flex-end', lg: 'flex-end' }}
        flexDirection={{ base: 'row', lg: 'column' }}
      >
        <Box p="12px 0" onClick={e => cancelBubble(e)}>
          <Popover isLazy trigger={isApp ? 'click' : 'hover'} placement="top-start">
            <PopoverTrigger>
              <Center as="button" cursor={totalUSD == '$0' ? 'text' : 'help'}>
                <Skeleton h="14px" isLoaded={!!totalUSD && !dlmmPosRewardsDataLoading}>
                  <Text
                    color="text_caption"
                    // textDecoration={totalUSD == '$0' ? 'none' : 'underline dotted'} textUnderlineOffset="3px"
                  >
                    {totalUSD}
                  </Text>
                </Skeleton>
              </Center>
            </PopoverTrigger>
            {totalUSD !== '$0' && (
              <Portal>
                <PopoverContent zIndex="2" w="fit-content" p="4px">
                  <PopoverBody borderRadius="12px" p="8px">
                    <VStack align="flex-start">
                      {
                        <Text fontSize="12px" color="text_caption">
                          Mining Rewards
                        </Text>
                      }
                      {rewardsMiningInfo?.map((item: any) => {
                        return (
                          <HStack
                            key={item?.token?.coin_type}
                            minW="200px"
                            justify="space-between"
                            borderBottom="1px solid"
                            borderColor="border"
                            pb="8px"
                            sx={{
                              _last: {
                                borderBottom: 'none',
                                pb: '0px'
                              }
                            }}
                          >
                            <SingleTokenInfo
                              token={item?.token}
                              imgBoxStyle={{ w: '20px', h: '20px' }}
                              haveName={false}
                              symbolFontSize="12px"
                              warningIcon={{ iconW: '10px', iconH: '10px' }}
                            />
                            <VStack align="flex-end" gap="4px">
                              <Text fontSize="12px" color="text_caption">
                                {formatNumber(item?.display_amount_owed)}
                              </Text>
                              <Text fontSize="12px"> {formatCurrency(item?.amountUSD, 2)}</Text>
                            </VStack>
                          </HStack>
                        )
                      })}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            )}
          </Popover>
        </Box>
      </VStack>
      {/* )} */}
    </>
  )
}

export default DLMMPendingRewardsBlock
