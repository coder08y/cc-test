import useIncentiveStore from '@/store/incentive'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenBalanceStore from '@cetus/stores/src/tokenBalance'
import { Token } from '@cetus/types'
import { CheckBox, Icon } from '@cetus/ui-kit'
import { Decimal, bnToAmount, d, formatCurrency, formatNumber, isAvailableObject, removeComma } from '@cetus/utils'
import { extractStructTagFromType, fixCoinType } from '@cetusprotocol/common-sdk'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect, useInterval } from 'ahooks'
import dayjs from 'dayjs'
import { unionBy } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from './ConfirmModal'
import RewardContent from './RewardContent'

export default function RewardTokenAndDuration({ rewardList, changeRewardList }: { rewardList: any; changeRewardList: (item: any) => void }) {
  const { incentiveApiPoolInfo, setIncentiveApiPoolInfo, poolWhiteTokenList, globalConfig } = useIncentiveStore()
  const [isChecked, setIsChecked] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const { tokenBalanceObj } = useTokenBalanceStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const [addedRewards, setAddedRewards] = useState<any[]>([])

  // 结束时间 - 开始时间 要大于等于60分钟
  // const isAllowSelect = (startTime: number, endTime: number): boolean => {
  //   if (!startTime || !endTime) return true
  //   return d(endTime)
  //     .minus(startTime)
  //     .gte(60 * 60 * 1000)
  // }

  useEffect(() => {
    if (!hasInitialized && incentiveApiPoolInfo?.displayTokenA) {
      changeRewardList([
        {
          startTime: 0,
          endTime: 0,
          rewardCoin: incentiveApiPoolInfo.displayTokenA,
          rewardNum: '',
          inputNum: '',
          releaseRate: '',
          startIsNow: false,
          amountMode: 'total'
        }
      ])
      setHasInitialized(true)
    }
  }, [incentiveApiPoolInfo, hasInitialized])

  // 更新奖励内容 startIsNow奖励是否现在开始 以提交交易的时间戳为准
  const updateReward = (index: number, key: string, value: any, startIsNow = false) => {
    changeRewardList(prev =>
      prev.map((item, i) => {
        if (i !== index) return item
        let updatedItem = { ...item }

        if (key === 'rewardCoin') {
          updatedItem.rewardCoin = value
          updatedItem.rewardNum = ''
          updatedItem.inputNum = ''
          updatedItem.releaseRate = ''
        } else if (key === 'startTime') {
          updatedItem.startIsNow = startIsNow
          updatedItem.startTime = value
        } else {
          updatedItem[key] = value
        }
        if (updatedItem?.startTime && updatedItem?.endTime) {
          const duration = formatEpoch(updatedItem?.startTime, updatedItem?.endTime, 'seconds')
          if (updatedItem.amountMode === 'perDay' && duration && !!updatedItem.inputNum) {
            updatedItem.rewardNum = formatNumber(
              d(updatedItem.inputNum)
                .div(24 * 60 * 60)
                .mul(duration)
                .toString(),
              updatedItem?.rewardCoin?.decimals,
              true
            )
            updatedItem.releaseRate = updatedItem.inputNum
              ? d(updatedItem.inputNum || 0)
                  .div(24 * 60 * 60)
                  .toString()
              : '--'
          } else {
            updatedItem.rewardNum = updatedItem.inputNum
            updatedItem.releaseRate = duration
              ? d(updatedItem.rewardNum || 0)
                  .div(duration)
                  .toString()
              : '--'
          }
        }

        return updatedItem
      })
    )
  }

  useInterval(() => {
    changeRewardList(prev =>
      prev?.map(item => {
        let updatedItem = { ...item }
        if (updatedItem?.startIsNow && updatedItem?.startTime && updatedItem?.endTime) {
          const currentTime = new Date().getTime()
          updatedItem.startTime = currentTime
          const duration = formatEpoch(updatedItem?.startTime, updatedItem?.endTime, 'seconds')
          console.log('🚀 ~ prev.map ~ duration:', updatedItem.rewardNum, duration)
          if (updatedItem.amountMode === 'perDay' && duration && !!updatedItem.inputNum) {
            updatedItem.rewardNum = formatNumber(
              d(updatedItem.inputNum)
                .div(24 * 60 * 60)
                .mul(duration)
                .toString(),
              updatedItem?.rewardCoin?.decimals,
              true
            )
            updatedItem.releaseRate = updatedItem.inputNum
              ? d(updatedItem.inputNum || 0)
                  .div(24 * 60 * 60)
                  .toString()
              : '--'
          } else {
            updatedItem.rewardNum = updatedItem.inputNum
            updatedItem.releaseRate = duration
              ? d(updatedItem.rewardNum || 0)
                  .div(duration)
                  .toString()
              : '--'
          }
        }
        return updatedItem
      })
    )
  }, 60 * 1000)

  const defaultReward = () => ({
    startTime: '',
    endTime: '',
    rewardCoin: undefined,
    rewardNum: '',
    inputNum: '',
    releaseRate: '',
    startIsNow: false,
    amountMode: 'total'
  })

  // 添加奖励
  const addReward = () => {
    if (!incentiveApiPoolInfo?.displayTokenA) return
    changeRewardList((prev: any) => [...prev, defaultReward()])
  }
  // 删除奖励
  const deleteReward = (index: number) => {
    changeRewardList((prev: any) => {
      return prev.filter((_, i) => i !== index)
    })
  }
  // 判断余额
  const hasInsufficientBalance = useMemo(() => {
    if (!isAvailableObject(tokenBalanceObj)) return true

    const mergedMap: Record<string, { total: Decimal.Instance; decimals: number }> = {}

    for (const item of rewardList) {
      const { rewardCoin, rewardNum } = item
      if (!rewardCoin?.coin_type || !rewardNum) continue

      const tag = extractStructTagFromType(rewardCoin.coin_type).full_address
      if (!mergedMap[tag]) {
        mergedMap[tag] = { total: d(0), decimals: rewardCoin.decimals ?? 9 }
      }
      mergedMap[tag].total = mergedMap[tag].total.plus(rewardNum)
    }

    return Object.entries(mergedMap).some(([addr, { total, decimals }]) => {
      const balance = tokenBalanceObj[addr]
      if (!balance) return true
      return total.gt(bnToAmount(balance.totalBalance, decimals))
    })
  }, [rewardList, tokenBalanceObj])

  // 判断奖励内容是否完整
  const isRewardValid = useMemo(() => {
    return (
      rewardList.length > 0 &&
      rewardList.every(item => item?.startTime && item?.endTime && item?.rewardCoin && d(item?.rewardNum).gt(0) && item?.releaseRate !== 0)
    )
  }, [rewardList])

  const limitRewardsTokenNum = useMemo(() => {
    if (globalConfig && globalConfig?.non_manager_initialize_reward_cap && !isNaN(globalConfig?.non_manager_initialize_reward_cap)) {
      return globalConfig?.non_manager_initialize_reward_cap
    }
    return 4
  }, [globalConfig])

  // const [now, setNow] = useState(() => dayjs().unix())

  // 找出最早的非立即开始的 startTime（单位：秒）
  // const earliestStartTime = useMemo(() => {
  //   const validItems = rewardList.filter(item => item?.startTime)
  //   if (validItems.length === 0) return null
  //   return Math.min(...validItems.map(item => Number(item.startTime) / 1000))
  // }, [rewardList])

  // 仅当 earliestStartTime 存在时，才开始定时更新当前时间
  // useEffect(() => {
  //   if (!earliestStartTime) return
  //   console.log('🚀 ~ RewardTokenAndDuration ~ earliestStartTime:', earliestStartTime)
  //   const timer = setInterval(() => {
  //     setNow(dayjs().unix())
  //   }, 1000)
  //   return () => clearInterval(timer)
  // }, [earliestStartTime])

  // 时间是否有效（当前时间 ≤ 最早的 startTime + 60 秒）
  // const isTimeValid = useMemo(() => {
  //   if (!earliestStartTime) return true
  //   console.log('🚀 ~ RewardTokenAndDuration ~ now <= earliestStartTime + 60:', now - earliestStartTime, now <= earliestStartTime + 60)
  //   return now <= earliestStartTime + 60
  // }, [earliestStartTime, now])

  const { getTokenAmountValue, fetchTokenPrices } = useTokenPrice()

  const totalAmount = useMemo(() => {
    const sum = rewardList.reduce((acc, item) => {
      const amountVal = getTokenAmountValue(item?.rewardCoin?.coin_type, item?.rewardNum)
      return acc.plus(amountVal)
    }, d(0))
    return formatCurrency(sum.toString(), 2)
  }, [rewardList])

  useEffect(() => {
    const coinTypes = Array.from(new Set(rewardList.map(item => item?.rewardCoin?.coin_type).filter(Boolean)))
    fetchTokenPrices(coinTypes)
  }, [rewardList])

  const { getTokenInfo } = useGetToken()
  const [whiteTokenList, setWhiteTokenList] = useState<Token[]>([])

  const fetchToken = async (coinType?: string) => {
    if (!coinType) return null
    try {
      return await getTokenInfo(coinType)
    } catch (err) {
      console.error('Error fetching token info:', coinType, err)
      return null
    }
  }

  const getWhiteTokenList = async () => {
    try {
      const rewardsCoinTypes = incentiveApiPoolInfo?.miningRewardList?.map(item => item?.coinType)
      let rewardsTokenList: any[] = []
      if (rewardsCoinTypes && rewardsCoinTypes.length > 0) {
        rewardsTokenList = await Promise.all(rewardsCoinTypes?.map(fetchToken))
        if (rewardsTokenList && rewardsTokenList.length > 0) {
          setAddedRewards(rewardsTokenList?.map(added => fixCoinType(added?.coinType || added?.coin_type || '')))
        }
      }
      let merged: any[] = []
      if (d(incentiveApiPoolInfo?.miningRewardList?.length).gte(limitRewardsTokenNum)) {
        merged = rewardsTokenList
      }
      if (d(incentiveApiPoolInfo?.miningRewardList?.length).lt(limitRewardsTokenNum)) {
        const fetched = !poolWhiteTokenList || poolWhiteTokenList.length === 0 ? [] : await Promise.all(poolWhiteTokenList.map(fetchToken))
        merged = [incentiveApiPoolInfo?.displayTokenA, incentiveApiPoolInfo?.displayTokenB, ...fetched].filter(Boolean) as Token[]
        merged = unionBy(merged?.concat(rewardsTokenList), item => item?.coin_type)
      }

      const uniqueTokens = Array.from(new Map(merged.map(token => [token.coin_type, token])).values())
      console.log('🚀 uniqueTokens:', uniqueTokens)
      setWhiteTokenList(uniqueTokens)
    } catch (e) {
      console.error('Failed to fetch token list:', e)
    }
  }

  useDeepCompareEffect(() => {
    console.log('🚀 ~ RewardTokenAndDuration ~ poolWhiteTokenList:', incentiveApiPoolInfo, poolWhiteTokenList)
    if (isAvailableObject(incentiveApiPoolInfo)) {
      getWhiteTokenList()
    }
  }, [poolWhiteTokenList, incentiveApiPoolInfo, limitRewardsTokenNum])

  const someRewardTooLow = useMemo(() => {
    return rewardList?.some(
      rewardInfo =>
        rewardInfo?.startTime &&
        rewardInfo?.endTime &&
        rewardInfo?.rewardNum &&
        d(rewardInfo?.rewardNum).gt(0) &&
        isAvailableObject(rewardInfo?.rewardCoin) &&
        d(removeComma(rewardInfo?.releaseRate + '')).lt(d(1).div(d(10).pow(rewardInfo?.rewardCoin?.decimals)))
    )
  }, [rewardList])

  const { isApp } = useWindowWidth()

  const addRewardsAbleLength = useMemo(() => {
    return whiteTokenList?.length >= limitRewardsTokenNum + 1
      ? limitRewardsTokenNum + 1
      : whiteTokenList?.length >= limitRewardsTokenNum
        ? limitRewardsTokenNum
        : whiteTokenList?.length
  }, [limitRewardsTokenNum, whiteTokenList?.length])

  return (
    <VStack w="100%" align="flex-start" bg="#1B1D21" borderRadius="16px" p={{ base: '16px 8px', lg: '32px' }}>
      <HStack w="100%" justify="space-between">
        <VStack align="flex-start">
          <Text color="text_caption" fontSize="16px" fontWeight="500">
            Add Incentives
          </Text>
          <Text fontSize="12px" lineHeight="16px">
            Any users can allocate extra incentives to a DLMM pool
          </Text>
        </VStack>
        {!isApp && (
          <Button
            onClick={addReward}
            borderRadius="8px"
            p={{ base: '0 8px', lg: '0 12px' }}
            h="36px"
            fontWeight="500"
            variant="outline"
            bg="primary_opacity.10"
            fontSize="12px"
            borderColor="transparent"
            isDisabled={rewardList?.length >= addRewardsAbleLength}
          >
            <Icon
              svgW="20px"
              svgH="20px"
              w="20px"
              h="20px"
              xlinkHref="#icon-icon_add"
              svgFill={rewardList?.length >= addRewardsAbleLength ? 'primary_gray' : 'primary'}
              svgHover={rewardList?.length >= addRewardsAbleLength ? 'primary_gray' : 'primary'}
            />
            Add Reward
          </Button>
        )}
      </HStack>

      <VStack w="100%" align="flex-start" mt="8px" gap="16px">
        {rewardList?.map((item, index) => (
          <RewardContent
            key={item?.rewardCoin?.coin_type ?? index}
            index={index}
            isLast={index === rewardList?.length - 1}
            rewardListLength={rewardList?.length}
            rewardInfo={item}
            deleteReward={deleteReward}
            updateReward={updateReward}
            whiteTokenList={whiteTokenList?.map(white => ({
              ...white,
              isDisabled: rewardList
                ?.filter(r => r?.rewardCoin?.coinType || r?.rewardCoin?.coin_type)
                ?.some(
                  reward =>
                    fixCoinType(reward?.rewardCoin?.coinType || reward?.rewardCoin?.coin_type || '') ===
                      fixCoinType(white?.coinType || white?.coin_type || '') &&
                    fixCoinType(item?.rewardCoin?.coinType || item?.rewardCoin?.coin_type || '') !==
                      fixCoinType(white?.coinType || white?.coin_type || '')
                )
            }))}
          />
        ))}
        {isApp && (
          <Button
            w="100%"
            onClick={addReward}
            borderRadius="8px"
            p={{ base: '0 8px', lg: '0 12px' }}
            h="36px"
            fontWeight="500"
            variant="outline"
            bg="transparent"
            fontSize="12px"
            borderColor="primary_opacity.30 !important"
            border="1px dashed"
            isDisabled={rewardList?.length >= addRewardsAbleLength}
            mt={{ base: '-10px', lg: '-28px' }}
            mb="8px"
          >
            <Icon
              bg="primary_opacity.10"
              mr="4px"
              borderRadius="50%"
              svgW="20px"
              svgH="20px"
              w="20px"
              h="20px"
              xlinkHref="#icon-icon_add"
              svgFill={rewardList?.length >= addRewardsAbleLength ? 'primary_gray' : 'primary'}
              svgHover={rewardList?.length >= addRewardsAbleLength ? 'primary_gray' : 'primary'}
            />
            Add Reward
          </Button>
        )}
      </VStack>

      <HStack
        align="flex-start"
        bg="primary_opacity.10"
        borderRadius="8px"
        width="100%"
        p="12px"
        mb="4px"
        sx={{
          div: {
            svg: { fill: '#000 !important', width: '16px', height: '16px' }
          }
        }}
        cursor="pointer"
        onClick={() => setIsChecked(!isChecked)}
      >
        <CheckBox
          height="16px"
          width="16px"
          wrapStyle={{ border: '1px solid', borderColor: !isChecked ? 'primary' : 'transparent', bg: isChecked ? 'primary' : 'transparent' }}
          checked={isChecked}
          onClick={() => {}}
        />
        <Text userSelect="none" lineHeight="16px" w="calc(100% - 24px)" fontSize="12px" color="primary">
          I acknowledge that once incentives are added, they can NOT be withdrawn under any circumstances
        </Text>
      </HStack>

      <Button
        w="100%"
        fontWeight="500"
        height="48px"
        isDisabled={!currentAccount?.address ? false : !isRewardValid || !isChecked || hasInsufficientBalance || someRewardTooLow}
        onClick={
          !currentAccount?.address
            ? () => {
                onWalletModal(true)
              }
            : () => setIsOpenModal(true)
        }
      >
        {!currentAccount?.address ? 'Connect Wallet' : hasInsufficientBalance ? 'Insufficient Balance' : 'Incentivize'}
      </Button>

      <HStack w="100%" justify="space-between" mt="12px">
        <Text>Total Amount</Text>
        <Text>{totalAmount}</Text>
      </HStack>
      {isOpenModal && <ConfirmModal totalAmount={totalAmount} rewardList={rewardList} isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />}
    </VStack>
  )
}

// 格式化 Epoch 时间差
export function formatEpoch(startTime?: number, endTime?: number, returnType?: 'seconds' | 'hour' | 'day') {
  if (!startTime || !endTime) return returnType ? undefined : ''

  const start = dayjs(startTime)
  const end = dayjs(endTime)

  if (returnType) {
    console.log('🚀 ~ formatEpoch ~ end.diff(start, returnType, true).toFixed(4):', end.diff(start, returnType, true).toFixed(4))
    return end.diff(start, returnType, true).toFixed(4)
  }

  const diffHours = end.diff(start, 'hour')
  const days = Math.floor(diffHours / 24)
  const hours = diffHours % 24

  const dayStr = days > 0 ? `${days} day${days > 1 ? 's' : ''}` : ''
  const hourStr = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''

  return [dayStr, hourStr].filter(Boolean).join(' ')
}
