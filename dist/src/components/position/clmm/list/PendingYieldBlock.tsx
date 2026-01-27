import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import useClaimPosition from '@/hooks/position/useClaimPosition'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { CetusTooltip } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { d, formatCurrency, formatNumber } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

export default function PendingYieldBlock({ positionInfo, hasRewards }: { positionInfo: PosBaseInfo; hasRewards: boolean }) {
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

  const currentPosContractPoolInfo = useMemo(() => {
    return posPoolsOriginalData[positionInfo?.clmmPool]
  }, [posPoolsOriginalData, positionInfo?.clmmPool])

  // fee
  const currentPosFeeData = posFeeData[positionInfo?.posId]
  const amountValueA = getTokenAmountValue(positionInfo?.displayTokenA?.coin_type, currentPosFeeData?.displayFeeOwedA, '--')
  const amountValueB = getTokenAmountValue(positionInfo?.displayTokenB?.coin_type, currentPosFeeData?.displayFeeOwedB, '--')
  const amountValue = useMemo(() => {
    if (amountValueA !== '--' && amountValueB !== '--') {
      return formatCurrency(d(amountValueA).plus(amountValueB).toString(), 2)
    }
    return '$--'
  }, [amountValueA, amountValueB])

  // reward
  const haveMining = posApiPoolData[positionInfo?.clmmPool]?.haveMining
  const haveFarming = posApiPoolData[positionInfo?.clmmPool]?.haveFarming
  const { coinPriceObj } = useTokenPriceStore()
  const curentPosRewardsData = posRewardsData[positionInfo?.posId]
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

  const currentPosFarmsData = farmsPosRewardsData[positionInfo?.id]

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
      const { total } = calculatePendingYield([positionInfo as PosBaseInfo], posFeeData, posRewardsData, farmsPosRewardsData)
      setTotalYield(total)
    }
  }, [currentPosBaseInfoLoading, posFeeDataLoading, posRewardsDataLoading, posFeeData, posRewardsData, positionInfo, farmsPosRewardsData])

  const { toClaimPosition, isClaimLoading } = useClaimPosition()
  const toClaim = () => {
    toClaimPosition(positionInfo, currentPosContractPoolInfo)
  }

  return pendingYieldUSD === '$0' ? (
    <HStack>
      {/* {haveMining && <MiningImage />}
      {haveFarming && <FarmingImage />} */}
      <Text color="text_caption">{pendingYieldUSD}</Text>
    </HStack>
  ) : (
    <CetusTooltip
      needPortal={false}
      tooltip={
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
              <VStack w="100%" align="flex-start" bg="card_bg" gap="0" borderRadius="8px">
                {rewardsMiningInfo?.map((item: any, index: number) => {
                  return (
                    <HStack w="100%" key={item?.token?.coin_type} justify="space-between" p={index % 2 === 0 ? '12px 8px' : '0 8px 12px'}>
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
                    <HStack key={item?.token?.coin_type} w="100%" justify="space-between" p={index % 2 === 0 ? '12px 8px' : '0 8px 12px'}>
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
            isLoading={isClaimLoading}
            onClick={e => {
              e.stopPropagation()
              toClaim()
            }}
          >
            Claim All
          </Button>
        </VStack>
      }
      bodyPadding="0"
      children={
        <HStack>
          {/* {haveMining && <MiningImage />}
          {haveFarming && <FarmingImage />} */}
          <Text color="text_caption" borderBottom="1px dotted" borderColor="primary_gray">
            {pendingYieldUSD}
          </Text>
        </HStack>
      }
    />
  )
}
