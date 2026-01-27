import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { cancelBubble, d, formatCurrency, formatNumber } from '@cetus/utils'
import { Box, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
const PendingRewardsBlock = ({ positionInfo, onRewardsChange }: { positionInfo: PosBaseInfo; onRewardsChange: (value: any) => void }) => {
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  const { posRewardsData, posRewardsDataLoading, posApiPoolData, farmsPosRewardsData, farmsPosRewardsDataLoading } = usePositionStore()

  const haveMining = posApiPoolData[positionInfo?.clmmPool]?.haveMining
  const haveFarming = posApiPoolData[positionInfo?.clmmPool]?.haveFarming

  const currentPosData = posRewardsData[positionInfo?.posId]
  const currentPosFarmsData = farmsPosRewardsData[positionInfo?.id]

  const rewardsMiningInfo = useMemo(() => {
    const list = currentPosData?.map((reward: any) => {
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

  const rewardsFarmsInfo = useMemo(() => {
    const list = currentPosFarmsData?.map((reward: any) => {
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
  }, [positionInfo, currentPosFarmsData, coinPriceObj])

  const totalUSD = useMemo(() => {
    let total: any
    const arr = rewardsMiningInfo.concat(rewardsFarmsInfo)
    if (arr?.length > 0) {
      arr.forEach((ele: any) => {
        const eleUSD = ele?.amountUSD
        total = eleUSD == '--' || total == '--' ? '--' : d(total).plus(eleUSD).toString()
      })
      // return total == '--' ? '$--' : formatCurrency(total, 2)
      return total == '--' ? '$--' : formatCurrency(total, 2)
    }
    return '$0'
  }, [rewardsMiningInfo, rewardsFarmsInfo])

  const { isApp } = useWindowWidth()

  useEffect(() => {
    onRewardsChange?.(totalUSD) // 调用回调将数据传回父组件
  }, [totalUSD])
  return (
    <>
      {/* {(rewardsMiningInfo?.length > 0 || haveMining || positionInfo?.posType == 'farms') && ( */}
      <VStack
        w={{ base: 'auto', lg: 'unset' }}
        justify={{ base: 'flex-end', lg: 'unset' }}
        align={{ base: 'flex-start', lg: 'flex-end' }}
        flexDirection={{ base: 'row', lg: 'column' }}
      >
        <PendingRewards
          totalUSD={totalUSD}
          haveMining={haveMining}
          haveFarming={haveFarming}
          posRewardsDataLoading={posRewardsDataLoading}
          farmsPosRewardsDataLoading={farmsPosRewardsDataLoading}
          rewardsMiningInfo={rewardsMiningInfo}
          rewardsFarmsInfo={rewardsFarmsInfo}
        />
      </VStack>
      {/* )} */}
    </>
  )
}

type PendingRewardsProps = {
  totalUSD: string
  haveMining: boolean
  haveFarming: boolean
  posRewardsDataLoading: boolean
  farmsPosRewardsDataLoading: boolean
  rewardsMiningInfo: any[]
  rewardsFarmsInfo: any[]
}
const PendingRewards = ({
  totalUSD,
  haveFarming,
  haveMining,
  posRewardsDataLoading,
  farmsPosRewardsDataLoading,
  rewardsMiningInfo,
  rewardsFarmsInfo
}: PendingRewardsProps) => {
  const { isApp } = useWindowWidth()
  return (
    <Box p="12px 0" onClick={e => cancelBubble(e)}>
      <Popover isLazy trigger={isApp ? 'click' : 'hover'} placement="top-start">
        <PopoverTrigger>
          <Center as="button" cursor={totalUSD == '$0' ? 'text' : 'help'}>
            <Skeleton isLoaded={!!totalUSD && !posRewardsDataLoading && !farmsPosRewardsDataLoading}>
              <Text color="text_caption">{totalUSD}</Text>
            </Skeleton>
          </Center>
        </PopoverTrigger>
        {totalUSD !== '$0' && (
          <Portal>
            <PopoverContent zIndex="2" w="fit-content" p="4px">
              <PopoverBody borderRadius="12px" p="8px">
                <VStack align="flex-start">
                  {haveMining && (
                    <Text fontSize="12px" color="text_caption">
                      Mining Rewards
                    </Text>
                  )}
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
                  {haveFarming && (
                    <Text fontSize="12px" color="text_caption">
                      Farming Rewards
                    </Text>
                  )}
                  {rewardsFarmsInfo?.map((item: any) => {
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
  )
}

export default PendingRewardsBlock
