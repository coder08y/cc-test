import { PosBaseInfo } from '@/types'
import envConfigs, { burnConfig, clmmConfig, dlmmConfig, farmsConfig } from '@cetus/types/src/config/envConfigs'
import { d, isAvailableObject } from '@cetus/utils'
import { TickMath, fixCoinType } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'

export default function usePosHelper() {
  const getClmmPosName = (posIndex: number, position_index: string | number) => {
    if (position_index || position_index == 0) {
      return `Cetus LP | Pool${position_index}-${posIndex}`
    }
    return undefined
  }

  const buildPositionType = useMemo(() => {
    return `${clmmConfig.clmm_pool.package_id}::position::Position`
  }, [envConfigs])

  const buildDlmmPositionType = useMemo(() => {
    return `${dlmmConfig.dlmm_pool.package_id}::position::Position`
  }, [envConfigs])

  const buildFarmsPositionType = useMemo(() => {
    return `${farmsConfig.farms.package_id}::pool::WrappedPositionNFT`
  }, [envConfigs])

  const buildBurnPositionType = useMemo(() => {
    return `${burnConfig.burn.package_id}::lp_burn::CetusLPBurnProof`
  }, [envConfigs])

  const getTokenALock = (currentPosBaseInfo: PosBaseInfo, currentSqrtPrice: any) => {
    if (isAvailableObject(currentPosBaseInfo) && currentSqrtPrice) {
      const { lowerTick, upperTick } = currentPosBaseInfo
      if (currentSqrtPrice !== undefined && lowerTick !== undefined && upperTick !== undefined) {
        const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(lowerTick).toString()
        const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(upperTick).toString()
        if (d(currentSqrtPrice).gt(lowerSqrtPrice) && d(currentSqrtPrice).lt(upperSqrtPrice)) {
          return false
        } else if (d(currentSqrtPrice).gte(upperSqrtPrice)) {
          return true
        } else if (d(currentSqrtPrice).lte(lowerSqrtPrice)) {
          return false
        } else {
          return true
        }
      }
    }
    return false
  }

  const getTokenBLock = (currentPosBaseInfo: PosBaseInfo, currentSqrtPrice: any) => {
    if (isAvailableObject(currentPosBaseInfo) && currentSqrtPrice) {
      const { lowerTick, upperTick } = currentPosBaseInfo

      if (currentSqrtPrice !== undefined && lowerTick !== undefined && upperTick !== undefined) {
        const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(lowerTick).toString()
        const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(upperTick).toString()

        if (d(currentSqrtPrice).gt(lowerSqrtPrice) && d(currentSqrtPrice).lt(upperSqrtPrice)) {
          return false
        } else if (d(currentSqrtPrice).gte(upperSqrtPrice)) {
          return false
        } else if (d(currentSqrtPrice).lte(lowerSqrtPrice)) {
          return true
        } else {
          return true
        }
      }
    }
    return false
  }

  const getPosIsActive = (currentPosBaseInfo: PosBaseInfo, currentSqrtPrice: any) => {
    if (isAvailableObject(currentPosBaseInfo) && currentSqrtPrice) {
      const tokenALock = getTokenALock(currentPosBaseInfo, currentSqrtPrice)
      const tokenBLock = getTokenBLock(currentPosBaseInfo, currentSqrtPrice)
      if (!tokenALock && !tokenBLock) {
        return true
      } else {
        return false
      }
    }
    return false
  }

  const MIN_USD = 0.01

  /**
   *  判断单个奖励 是否可以复投 或者 merge
   * （核心共用逻辑，供复投和 merge 共用）
   */
  function isRewardAboveThreshold(reward: any): boolean {
    if (!reward) return false

    const amount = reward?.amount
    const decimals = reward?.token?.decimals
    const amountUSD = reward?.amountUSD

    if (amountUSD !== undefined && amountUSD !== '--') {
      // 有美元价值时：至少 $0.01
      return d(amountUSD).gt(MIN_USD)
    }

    // 无美元价值时：按 token 精度判断（保留两位有效数字）
    const minTokenThreshold = 10 ** -(decimals - 2)
    return d(amount).gt(minTokenThreshold)
  }

  // 多个 token 判断是否可以复投
  const hasCompound = (allRewards: any[]): boolean => {
    if (!allRewards?.length) return false
    return allRewards.some(reward => isRewardAboveThreshold(reward))
  }

  // 多个 token 判断是否可以merge
  const hasMerged = (allRewards: any[]): boolean => {
    if (!allRewards?.length) return false
    return allRewards.some(reward => isRewardAboveThreshold(reward))
  }

  // 获取复投相关奖励列表
  const getCompoundableRewards = (allRewards: any[], isCompoundable: boolean): any[] => {
    if (!allRewards?.length) return []
    return allRewards.filter(reward => isRewardAboveThreshold(reward) === isCompoundable)
  }

  // 获取合并相关奖励列表
  const getMergeableRewards = (allRewards: any[], isMergeable: boolean): any[] => {
    if (!allRewards?.length) return []
    return allRewards.filter(reward => isRewardAboveThreshold(reward) === isMergeable)
  }

  // 通用工具方法
  const getMergedTokenValue = ({
    rewardAndFeeList,
    toToken,
    totalValue,
    type
  }: {
    rewardAndFeeList: any[]
    toToken: any
    totalValue: string | number
    type: 'amount' | 'amountUSD'
  }) => {
    console.log('🚀 ~ getMergedTokenValue ~  mergeableRewards ', rewardAndFeeList, toToken, totalValue, type)
    if (rewardAndFeeList?.length <= 0 || !toToken?.coin_type) return totalValue

    const reward = rewardAndFeeList.find(r => fixCoinType(r?.token?.coin_type) === fixCoinType(toToken?.coin_type))

    console.log('🚀 ~ getMergedTokenValue ~ reward23232:', reward)
    if (!reward) return totalValue

    const value = reward?.[type]
    if (value === '--' || value == null) return '0'

    return d(totalValue)
      .plus(value || 0)
      .toString()
  }

  return {
    getMergedTokenValue,
    hasCompound,
    hasMerged,
    getCompoundableRewards,
    getMergeableRewards,
    isRewardAboveThreshold,
    getClmmPosName,
    buildPositionType,
    buildDlmmPositionType,
    buildFarmsPositionType,
    buildBurnPositionType,
    getTokenALock,
    getTokenBLock,
    getPosIsActive
  }
}
