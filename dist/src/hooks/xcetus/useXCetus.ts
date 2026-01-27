import useXCetusStore from '@/store/xcetus/useXCetus'
import { useAccountBalance } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { formatPercentage } from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo } from 'react'
import { useRefreshCoinPriceInfo } from '../profile/useProfileHelper'
import { useGetCurrPeriod, useGetOwnerVeNFT, useGetUserRewards, useGetVeNFTDividendInfo, useGetXCetusApr } from './useXCetusHelper'

export function useXCetus(isProfile: boolean = false) {
  const xCetusSdk = useSdk('xcetus')
  const { currentAccount } = useAccountStore()
  const { fetchAccountBalance, isLoading: isBalanceLoading } = useAccountBalance()
  const { refreshCoinPriceInfo } = useRefreshCoinPriceInfo()

  const {
    lockCetusList,
    veNFTLoading,
    lockCetusListLoading,
    clearData,
    owner,
    veNFT,
    XCetusManager,
    setXCetusManager,
    setDividendManager,
    setPhaseDividendInfoMap,
    phaseDividendInfoMap,
    availableXCetusAmount,
    availableXCetusAmountLoading
  } = useXCetusStore()

  // 当前期数
  const { nextStartTime, currentPeriod, calculateCurrPeriod } = useGetCurrPeriod()
  // 用户奖励信息
  const { summaryRewardList, rewardList, totalRewardValue } = useGetUserRewards(currentPeriod)

  const { fetchVeNFTDividendInfo } = useGetVeNFTDividendInfo()

  const fetchXCetusManager = async (forceRefresh?: boolean) => {
    try {
      const manager = await xCetusSdk!.XCetusModule.getXcetusManager(forceRefresh)
      if (manager) {
        setXCetusManager(manager)
      }
    } catch (error) {
      console.log('🚀 ~ fetchXCetusManager ~ error:', error)
    }
  }

  /**
   * 获取分红信息，如果当前期数没有获取到，则获取上一期分红信息, 最多获取5次
   * @param phase 期数
   * @param maxFetchTimes 最大获取次数
   * @returns 分红信息
   */
  const fetchPhaseDividendInfo = async (phase: number, maxFetchTimes = 5) => {
    try {
      const info = await xCetusSdk!.XCetusModule.getPhaseDividendInfo(phase.toString())
      console.log('🚀 ~ fetchPhaseDividendInfo ~ info:', {
        info,
        phase,
        maxFetchTimes
      })

      if (info) {
        setPhaseDividendInfoMap(info)
        return info
      }

      if (maxFetchTimes > 0 && phase > 0) {
        return fetchPhaseDividendInfo(phase - 1, maxFetchTimes - 1)
      }
    } catch (error) {
      if (maxFetchTimes > 0 && phase > 0) {
        return fetchPhaseDividendInfo(phase - 1, maxFetchTimes - 1)
      }
    }
  }

  const fetchDividendManager = async (forceRefresh?: boolean) => {
    try {
      const manager = await xCetusSdk!.XCetusModule.getDividendManager(forceRefresh)
      if (manager) {
        setDividendManager(manager)
      }
    } catch (error) {
      console.log('🚀 ~ fetchXCetusManager ~ error:', error)
    }
  }

  const { fetchOwnerVeNFT } = useGetOwnerVeNFT()

  // 正在赎回中的 xcetus 数量
  const redeemingXCetusAmount = useMemo(() => {
    if (veNFT && !availableXCetusAmountLoading) {
      const amount = d(veNFT.xcetus_balance).sub(availableXCetusAmount)
      if (amount.gte(0)) {
        return amount.toFixed(0)
      }
    }
    return '0'
  }, [veNFT?.xcetus_balance, availableXCetusAmount, availableXCetusAmountLoading])

  // 用户持仓份额
  const myShare = useMemo(() => {
    if (XCetusManager && veNFT) {
      const rate = d(veNFT.xcetus_balance).div(XCetusManager.treasury).mul(100)
      return d(rate).lt(0.01) ? '<0.01%' : formatPercentage(rate.toString(), 3)
    }

    return currentAccount?.address ? '0%' : '--'
  }, [XCetusManager?.treasury, veNFT?.xcetus_balance, currentAccount?.address])

  // 当期分红信息
  const phaseDividendInfo = useMemo(() => {
    if (currentPeriod) {
      let info = phaseDividendInfoMap[currentPeriod.toString()]
      if (info === undefined) {
        const allInfos = Object.values(phaseDividendInfoMap)
        if (allInfos.length > 0) {
          // 获取最大期数
          info = allInfos.reduce((max, current) => (Number(current.phase) > Number(max.phase) ? current : max))
        }
      }
      return info
    }
    return undefined
  }, [phaseDividendInfoMap, currentPeriod])

  // apr
  const { cetusApr } = useGetXCetusApr(phaseDividendInfo, XCetusManager?.treasury)

  // 获取分红coin 价格
  useEffect(() => {
    if (phaseDividendInfo) {
      const list = phaseDividendInfo.bonus_types.map(item => fixCoinType(item, false))
      if (list) {
        // TODO 老的奖励 在当前期数读取不到，这里暂时写死wUSDC
        list.push('0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN')
        refreshCoinPriceInfo(list)
      }
    }
  }, [phaseDividendInfo?.id])

  useEffect(() => {
    if (currentPeriod && currentPeriod > 0) {
      fetchPhaseDividendInfo(currentPeriod)
    }
  }, [currentPeriod])

  // 获取奖励分红
  useEffect(() => {
    if (veNFT && !isProfile) {
      fetchVeNFTDividendInfo(veNFT.id)
    }
  }, [veNFT?.id])

  return {
    fetchOwnerVeNFT,
    fetchAccountBalance,
    fetchXCetusManager,
    fetchDividendManager,
    fetchVeNFTDividendInfo,
    veNFTLoading,
    lockCetusListLoading,
    redeemingXCetusAmount,
    availableXCetusAmount,
    veNFT,
    myShare,
    nextStartTime,
    cetusApr,
    summaryRewardList,
    rewardList,
    totalRewardValue,
    lockCetusList,
    calculateCurrPeriod
  }
}
