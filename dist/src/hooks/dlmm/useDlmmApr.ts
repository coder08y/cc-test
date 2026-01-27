import { BinsRewardItem, RewardCoinItem } from '@/types/dlmm'
import { PoolApiInfo } from '@/types/pool'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinAmount } from '@cetusprotocol/dlmm-sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetchBinsTradeData from './useFetchBinsTradeData'

type WarpBinItem = {
  bin_id: number
  user_amount_a: string
  user_amount_b: string
  total_amount_a: string
  total_amount_b: string
  total_fee_value: string
  total_rewards_amounts: string[]
}

/**
 * 计算用户在指定周期内的apr
 * https://m8bj5905cd.sg.larksuite.com/docx/NQOkdPWIBoi86vx0Cdru6yT0sCe
 * @param allBinList 所有仓位
 * @param user_bins 用户仓位
 * @param period 周期
 * @param dlmmApiPoolInfo 池子信息
 * @returns 用户在指定周期内的apr
 */
export function useDlmmApr(
  allBinList: BinAmount[],
  user_bins: BinAmount[],
  period: '24H' | '7D' | '30D',
  active_id?: number,
  dlmmApiPoolInfo?: PoolApiInfo
) {
  const [loading, setIsLoading] = useState<boolean>(false)
  const [feeDataObj, setFeeDataObj] = useState<Record<string, string>>({})
  const [rewardDataObj, setRewardDataObj] = useState<Record<string, BinsRewardItem>>({})
  const [rewardCoinList, setRewardCoinList] = useState<RewardCoinItem[]>([])
  const { getTokenAmountValue, getTokenPrice } = useTokenPrice()

  const { fetchBinsTradeData, fetchBinsRewardData } = useFetchBinsTradeData()

  const getPeriodDays = useCallback((period: '24H' | '7D' | '30D') => {
    if (period === '24H') return 1
    if (period === '7D') return 7
    if (period === '30D') return 30
    return 1
  }, [])

  /**
   * 获取指定周期的费用数据和奖励数据
   */
  useEffect(() => {
    if (dlmmApiPoolInfo?.poolAddress) {
      setIsLoading(true)
      //  setRewardCoinList(dlmmApiPoolInfo?.rewardCoin || [])

      // 并发获取费用数据和奖励数据
      Promise.all([
        fetchBinsTradeData({
          dataType: 'fee',
          period,
          poolId: dlmmApiPoolInfo.poolAddress
        }),
        fetchBinsRewardData({
          period,
          poolId: dlmmApiPoolInfo.poolAddress
        })
      ])
        .then(([feeRes, rewardRes]) => {
          // 处理费用数据
          const _feeDataObj: Record<string, string> = {}
          feeRes.forEach(item => {
            _feeDataObj[`${item.binId}-${period}`] = item.value
          })
          setFeeDataObj({ ...feeDataObj, ..._feeDataObj })

          // 处理奖励数据
          const _rewardDataObj: Record<string, BinsRewardItem> = {}
          rewardRes?.bins.forEach(item => {
            _rewardDataObj[`${item.binId}-${period}`] = item
          })
          setRewardDataObj(_rewardDataObj)
          setRewardCoinList(rewardRes?.rewardCoin || [])
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [dlmmApiPoolInfo?.poolAddress, period])

  /**
   * 将用户仓位转换为warpBinList
   */
  const parseWarpUserBinList = useCallback(
    (user_bins: BinAmount[]) => {
      const warpBinList: WarpBinItem[] = []
      let total_user_amount_a = d(0)
      let total_user_amount_b = d(0)
      if (!dlmmApiPoolInfo) {
        return {
          validBinList: warpBinList,
          total_user_amount_a: total_user_amount_a.toString(),
          total_user_amount_b: total_user_amount_b.toString()
        }
      }

      for (const bin of user_bins) {
        const binId = bin.bin_id
        const binInfo = allBinList.find(item => item.bin_id === binId)
        const total_fee_value = feeDataObj[`${bin.bin_id}-${period}`]
        const total_rewards_amounts = rewardDataObj[`${bin.bin_id}-${period}`]
        const user_amount_a = fromDecimalsAmount(bin.amount_a, dlmmApiPoolInfo.tokenA.decimals)
        const user_amount_b = fromDecimalsAmount(bin.amount_b, dlmmApiPoolInfo.tokenB.decimals)
        total_user_amount_a = total_user_amount_a.add(user_amount_a)
        total_user_amount_b = total_user_amount_b.add(user_amount_b)
        if (binInfo) {
          warpBinList.push({
            bin_id: binId,
            user_amount_a: fromDecimalsAmount(bin.amount_a, dlmmApiPoolInfo.tokenA.decimals),
            user_amount_b: fromDecimalsAmount(bin.amount_b, dlmmApiPoolInfo.tokenB.decimals),
            total_amount_a: fromDecimalsAmount(binInfo.amount_a, dlmmApiPoolInfo.tokenA.decimals),
            total_amount_b: fromDecimalsAmount(binInfo.amount_b, dlmmApiPoolInfo.tokenB.decimals),
            total_fee_value: total_fee_value || '0',
            total_rewards_amounts: total_rewards_amounts?.value || []
          })
        }
      }
      return {
        validBinList: warpBinList,
        total_user_amount_a: total_user_amount_a.toString(),
        total_user_amount_b: total_user_amount_b.toString()
      }
    },
    [allBinList, period, feeDataObj, rewardDataObj]
  )

  const getTotalRewardsValue = useCallback(
    (coinType: string, index: number) => {
      if (!rewardDataObj) {
        return '0'
      }
      let total_rewards = d(0)
      Object.values(rewardDataObj).forEach(item => {
        const reward_value = getTokenAmountValue(coinType, item.value[index])
        total_rewards = d(total_rewards).add(reward_value)
      })
      return total_rewards.toString()
    },
    [rewardDataObj, rewardCoinList]
  )

  /**
   * 计算用户在指定周期内的费用
   * @param periodFee 费用
   * @param user_bins 用户仓位
   * @returns 用户在指定周期内的费用
   */
  const estimatedFeeAndRewards = useCallback(
    (user_bins: BinAmount[]) => {
      const { validBinList, total_user_amount_a, total_user_amount_b } = parseWarpUserBinList(user_bins)
      const total_user_amount_a_value = getTokenAmountValue(dlmmApiPoolInfo?.tokenA?.coin_type, total_user_amount_a)
      const total_user_amount_b_value = getTokenAmountValue(dlmmApiPoolInfo?.tokenB?.coin_type, total_user_amount_b)
      const total_user_value = d(total_user_amount_a_value).add(d(total_user_amount_b_value))
      let total_fee = d(0)
      const reward_list: { coinType: string; total_reward: string }[] = []

      // fee计算
      for (const bin of validBinList) {
        const amount_value_a = getTokenAmountValue(dlmmApiPoolInfo?.tokenA?.coin_type, bin.total_amount_a)
        const amount_value_b = getTokenAmountValue(dlmmApiPoolInfo?.tokenB?.coin_type, bin.total_amount_b)
        const total_amount_value = d(amount_value_a).add(d(amount_value_b))

        const user_amount_value_a = getTokenAmountValue(dlmmApiPoolInfo?.tokenA?.coin_type, bin.user_amount_a)
        const user_amount_value_b = getTokenAmountValue(dlmmApiPoolInfo?.tokenB?.coin_type, bin.user_amount_b)
        const user_amount_value = d(user_amount_value_a).add(d(user_amount_value_b))

        const fee_rate = user_amount_value.gt(0) ? d(user_amount_value).div(total_amount_value.add(user_amount_value)) : d(0)
        const fee = fee_rate.mul(bin.total_fee_value)
        total_fee = d(total_fee).add(fee)

        console.log('🚀 ~ file: useDlmmApr.ts:123 ~ estimatedFee ~ info1:', {
          bin_id: bin,
          total_amount_value: total_amount_value.toString(),
          user_amount_value: user_amount_value.toString(),
          total_fee_value: bin.total_fee_value,
          fee: fee.toString(),
          fee_rate: fee_rate.toString()
        })
      }

      // rewards计算
      rewardCoinList.forEach((item, index) => {
        let l_user_total_value = d(0)
        let l_range_total_value = d(0)
        const total_rewards_value = getTotalRewardsValue(item.coinType, index)
        let total_user_range_rewards_value = d(0)
        for (const bin of validBinList) {
          const reward_amount = bin.total_rewards_amounts[index]
          if (d(reward_amount).gt(0)) {
            const reward_value = getTokenAmountValue(item.coinType, reward_amount)
            total_user_range_rewards_value = d(total_user_range_rewards_value).add(d(reward_value))

            const amount_value_a = getTokenAmountValue(dlmmApiPoolInfo?.tokenA?.coin_type, bin.total_amount_a)
            const amount_value_b = getTokenAmountValue(dlmmApiPoolInfo?.tokenB?.coin_type, bin.total_amount_b)
            l_range_total_value = d(l_range_total_value).add(d(amount_value_a)).add(d(amount_value_b))

            const user_amount_value_a = getTokenAmountValue(dlmmApiPoolInfo?.tokenA?.coin_type, bin.user_amount_a)
            const user_amount_value_b = getTokenAmountValue(dlmmApiPoolInfo?.tokenB?.coin_type, bin.user_amount_b)
            l_user_total_value = d(l_user_total_value).add(d(user_amount_value_a)).add(d(user_amount_value_b))
          }
        }

        const reward_rate = d(total_rewards_value).gt(0) ? d(total_user_range_rewards_value).div(total_rewards_value) : d(0)
        const reward_release_value = getTokenAmountValue(item.coinType, item.currentEmissionPerSecond)
        const est_rewards = d(reward_release_value).mul(reward_rate)
        const liquidity_rate = l_range_total_value.gt(0) ? l_user_total_value.div(l_user_total_value.add(l_range_total_value)) : d(0)

        const total_reward = d(est_rewards).mul(liquidity_rate)

        console.log('🚀 ~ file: useDlmmApr.ts:123 ~ estimatedRewards ~ info1:', {
          coinType: item,
          reward_release_value,
          est_rewards: est_rewards.toString(),
          total_rewards_value: total_rewards_value.toString(),
          total_user_range_rewards_value: total_user_range_rewards_value.toString(),
          reward_rate: reward_rate.toString(),
          l_user_total_value: l_user_total_value.toString(),
          l_range_total_value: l_range_total_value.toString(),
          total_user_value: total_user_value.toString(),
          liquidity_rate: liquidity_rate.toString(),
          total_reward: total_reward.toString(),
          validBinList,
          rewardDataObj
        })

        if (d(total_reward).gt(0)) {
          reward_list.push({
            coinType: item.coinType,
            total_reward: total_reward.toString()
          })
        }
      })

      const info = {
        total_fee: total_fee.toString(),
        total_user_value: total_user_value.toString(),
        show_fee_apr: validBinList.length > 0,
        reward_list
      }

      return info
    },
    [allBinList, feeDataObj, rewardCoinList, rewardDataObj, period]
  )

  /**
   * 计算用户在指定周期内的apr
   */
  const estimateApr = useMemo(() => {
    const active_bin = user_bins.find(item => item.liquidity && item.bin_id === active_id)

    if (!dlmmApiPoolInfo?.tokenA) {
      return {
        fee_apr: undefined,
        miningAprList: []
      }
    }
    // 如果是单边仓位，则不显示
    if (!active_bin) {
      return {
        fee_apr: 0,
        miningAprList: []
      }
    }

    const { total_fee, total_user_value, show_fee_apr, reward_list } = estimatedFeeAndRewards(user_bins)
    let preTotalFee = total_fee
    let effectivePeriodDays = getPeriodDays(period)

    if (dlmmApiPoolInfo?.createTimestamp) {
      const now = Date.now() / 1000
      const poolAgeMs = now - Number(dlmmApiPoolInfo.createTimestamp)
      const poolAgeDays = poolAgeMs / (60 * 60 * 24) // 转换为天数
      console.log('🚀 ~ file: useDlmmApr.ts:198 ~ poolAgeDays:', poolAgeDays)
      if (poolAgeDays < 1) {
        preTotalFee = d(preTotalFee).div(poolAgeDays).mul(effectivePeriodDays).toString()
        // 不足24H: 7d/30d值计算一致，都使用24H数据
        if (period === '7D' || period === '30D') {
          effectivePeriodDays = 1
        }
      } else if (poolAgeDays < 7) {
        preTotalFee = d(preTotalFee).div(poolAgeDays).mul(effectivePeriodDays).toString()
        // 不足7day: 30d值计算一致，使用7D数据
        if (period === '30D') {
          effectivePeriodDays = 7
        }
      } else if (poolAgeDays < 30) {
        if (period === '30D') {
          preTotalFee = d(preTotalFee).div(poolAgeDays).mul(effectivePeriodDays).toString()
        }
      }
      // 大于30day: 24h/7d/30d分别计算，保持原有逻辑
    }

    const day_rate = d(365).div(effectivePeriodDays)
    const fee_apr = d(preTotalFee).div(total_user_value).mul(day_rate).toString()

    const miningAprList: { coinType: string; apr: string }[] = []
    for (const item of reward_list) {
      const reward_apr = d(item.total_reward).mul(3153600).div(total_user_value).toString()
      miningAprList.push({
        coinType: item.coinType,
        apr: reward_apr.toString()
      })
    }

    console.log('🚀 ~ file: useDlmmApr.ts:123 ~ estimatedFee ~ info2:', {
      total_fee,
      preTotalFee,
      total_user_value,
      show_fee_apr,
      user_bins,
      active_bin,
      allBinList,
      fee_apr,
      period,
      feeDataObj,
      miningAprList
    })
    return {
      fee_apr,
      miningAprList
    }
  }, [period, user_bins, allBinList, feeDataObj, active_id, dlmmApiPoolInfo, rewardCoinList, rewardDataObj])

  return {
    estimateApr,
    loading
  }
}
