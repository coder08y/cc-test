import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import useClaimPosition from '@/hooks/position/useClaimPosition'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { d, formatCurrency, formatNumber } from '@cetus/utils'
import { Box, Button, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

export default function PendingYieldBlock({ positionInfo, hasRewards }: { positionInfo: PosBaseInfo | DlmmPosBaseInfo; hasRewards: boolean }) {
  const { getTokenAmountValue } = useTokenPrice()
  const {
    posRewardsData,
    posRewardsDataLoading,
    posApiPoolData,
    farmsPosRewardsData,
    farmsPosRewardsDataLoading,
    posFeeData,
    currentPosBaseInfoLoading,
    posFeeDataLoading,
    posPoolsOriginalData
  } = usePositionStore()
  const { dlmmPosPoolsRelatedData, dlmmPosPoolsOriginalData, dlmmPosFeeData, dlmmPosRewardsData, dlmmPosLiquidityData } = useDlmmPositionStore()

  const isDlmm = useMemo(() => positionInfo?.posType === 'dlmm', [positionInfo?.posType])
  const currentPosContractPoolInfo = useMemo(() => {
    return isDlmm ? dlmmPosPoolsOriginalData?.[positionInfo?.dlmmPool] : posPoolsOriginalData[positionInfo?.clmmPool]
  }, [posPoolsOriginalData, dlmmPosPoolsOriginalData, isDlmm, positionInfo?.clmmPool, positionInfo?.dlmmPool])

  // fee
  const currentPosFeeData = isDlmm ? dlmmPosFeeData[positionInfo?.id] : posFeeData[positionInfo?.posId]
  const amountValueA = getTokenAmountValue(positionInfo?.displayTokenA?.coin_type, currentPosFeeData?.displayFeeOwedA, '--')
  const amountValueB = getTokenAmountValue(positionInfo?.displayTokenB?.coin_type, currentPosFeeData?.displayFeeOwedB, '--')
  const amountValue = useMemo(() => {
    if (amountValueA !== '--' && amountValueB !== '--') {
      return formatCurrency(d(amountValueA).plus(amountValueB).toString(), 2)
    }
    return '$--'
  }, [amountValueA, amountValueB])

  // reward

  const { coinPriceObj } = useTokenPriceStore()
  const curentPosRewardsData = isDlmm ? dlmmPosRewardsData[positionInfo?.id] : posRewardsData[positionInfo?.posId]
  const rewardsMiningInfo = useMemo(() => {
    const list = curentPosRewardsData?.map((reward: any) => {
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
  }, [positionInfo, curentPosRewardsData, coinPriceObj])

  const currentPosFarmsData = isDlmm ? [] : farmsPosRewardsData[positionInfo?.id]

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
      return total == '--' ? '$--' : formatCurrency(total, 2)
    }
    return '$0'
  }, [rewardsMiningInfo, rewardsFarmsInfo])

  const pendingYieldUSD = useMemo(() => {
    let total = d(0)
    if (amountValueA !== '--') {
      total = total.add(amountValueA)
    }
    if (amountValueB !== '--') {
      total = total.add(amountValueB)
    }

    const arr = rewardsMiningInfo.concat(rewardsFarmsInfo)
    if (arr?.length > 0) {
      arr.forEach((ele: any) => {
        const eleUSD = ele?.amountUSD
        total = eleUSD !== '--' ? d(total).add(eleUSD) : total
      })
    }
    return `${formatCurrency(total.toString(), 2)}`
  }, [amountValueA, amountValueB, rewardsMiningInfo, rewardsFarmsInfo])

  const [totalYield, setTotalYield] = useState('--')
  const { calculatePendingYield } = useCalculatePendingYield()

  useEffect(() => {
    if (!posFeeDataLoading && !posRewardsDataLoading) {
      if (!isDlmm) {
        const { total } = calculatePendingYield([positionInfo as PosBaseInfo], posFeeData, posRewardsData, farmsPosRewardsData)
        setTotalYield(total)
      } else {
        const { total } = calculatePendingYield([positionInfo as PosBaseInfo], {}, {}, {}, dlmmPosFeeData, dlmmPosRewardsData)
        setTotalYield(total)
      }
    }
  }, [
    currentPosBaseInfoLoading,
    posFeeDataLoading,
    posRewardsDataLoading,
    posFeeData,
    posRewardsData,
    positionInfo,
    farmsPosRewardsData,
    isDlmm,
    dlmmPosFeeData,
    dlmmPosRewardsData
  ])

  const { toClaimPosition, isClaimLoading } = useClaimPosition()
  const toClaim = () => {
    toClaimPosition(positionInfo, currentPosContractPoolInfo, rewardsFarmsInfo?.length > 0)
  }

  const { isApp } = useWindowWidth()
  const { isOpen, onClose, onOpen } = useDisclosure()

  return pendingYieldUSD === '$0' ? (
    <HStack>
      {/* {haveMining && <MiningImage />}
      {haveFarming && <FarmingImage />} */}
      <Text color="text_caption" fontSize={isApp ? '12px' : '14px'}>
        {pendingYieldUSD}
      </Text>
    </HStack>
  ) : (
    <Popover
      isLazy
      trigger={isApp ? 'click' : 'hover'}
      isOpen={isOpen} // 只在移动端控制状态
      onClose={onClose}
      onOpen={isApp ? () => {} : onOpen}
      autoFocus={false}
      returnFocusOnClose={false}
      gutter={4}
      modifiers={[
        {
          name: 'preventOverflow',
          options: {
            padding: 8 // 页面边缘预留 8px
          }
        }
      ]}
    >
      <PopoverTrigger>
        <Box
          as="button"
          onClick={e => {
            // 只有在移动端且showTooltip为true时才触发
            if (isApp) {
              e.stopPropagation()
              onOpen()
            }
          }}
        >
          <HStack>
            <Text fontSize={isApp ? '12px' : '14px'} color="text_caption" borderBottom="1px dotted" borderColor="primary_gray">
              {pendingYieldUSD}
            </Text>
          </HStack>
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="fit-content" maxW="320px">
          <PopoverBody p="8px" fontSize="sm" w="fit-content">
            <VStack bg="bg_secondary" borderRadius="8px" minW="240px" p="16px 12px 12px">
              <VStack w="100%">
                <HStack w="100%" justify="space-between">
                  <Text>Claimable Fees</Text>
                  <Text color="text_caption">{amountValue}</Text>
                </HStack>
                <VStack w="100%" bg="card_bg" gap="0" borderRadius="8px">
                  <HStack w="100%" justify="space-between" p="12px 8px">
                    <SingleTokenInfo
                      token={positionInfo?.displayTokenA}
                      imgBoxStyle={{ w: '20px', h: '20px' }}
                      haveName={false}
                      symbolFontSize="12px"
                      warningIcon={{ iconW: '10px', iconH: '10px' }}
                    />
                    <VStack align="flex-end" gap="4px">
                      <Text fontSize="12px" color="text_caption">
                        {formatNumber(currentPosFeeData?.displayFeeOwedA)}
                      </Text>
                      <Text fontSize="12px">{formatCurrency(amountValueA, 2)}</Text>
                    </VStack>
                  </HStack>
                  <HStack w="100%" justify="space-between" p="0 8px 12px">
                    <SingleTokenInfo
                      token={positionInfo?.displayTokenB}
                      imgBoxStyle={{ w: '20px', h: '20px' }}
                      haveName={false}
                      symbolFontSize="12px"
                      warningIcon={{ iconW: '10px', iconH: '10px' }}
                    />
                    <VStack align="flex-end" gap="4px">
                      <Text fontSize="12px" color="text_caption">
                        {formatNumber(currentPosFeeData?.displayFeeOwedB)}
                      </Text>
                      <Text fontSize="12px">{formatCurrency(amountValueB, 2)}</Text>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
              {hasRewards && <Box w="100%" h="1px" bg="card_bg" m="4px 0" />}
              {hasRewards && (
                <VStack w="100%">
                  <HStack w="100%" justify="space-between">
                    <Text>Claimable Rewards</Text>
                    <Text color="text_caption">{totalUSD}</Text>
                  </HStack>
                  <VStack w="100%" align="flex-start" bg="card_bg" gap="12px" borderRadius="8px" p="12px 8px">
                    {rewardsMiningInfo?.map((item: any, index: number) => {
                      return (
                        <HStack w="100%" key={item?.token?.coin_type} justify="space-between">
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
                    {rewardsFarmsInfo?.map((item: any, index: number) => {
                      return (
                        <HStack key={item?.token?.coin_type} w="100%" justify="space-between">
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
                </VStack>
              )}
              <Button
                h="28px"
                w="100%"
                borderRadius="8px"
                mt="4px"
                fontSize="14px"
                fontWeight="500"
                isDisabled={Number(totalYield) === 0 || posFeeDataLoading || posRewardsDataLoading || isClaimLoading}
                isLoading={isClaimLoading || posFeeDataLoading || posRewardsDataLoading}
                onClick={e => {
                  e.stopPropagation()
                  toClaim()
                  onClose()
                }}
              >
                Claim All
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
