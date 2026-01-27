import { GetRecommendRangesListParams, RecommendRange } from '@/types'
import { d, isAvailableObject } from '@cetus/utils'
import { TickUtil, getNearestTickByTick } from '@cetusprotocol/common-sdk'
import { useState } from 'react'

export default function useGetRecommendRanges() {
  const [poolType, setPoolType] = useState('')

  // 获取稳定区间
  const getStableRange = (farmsEffectTickLower: number, farmsEffectTickUpper: number) => ({
    default: {
      lower: farmsEffectTickLower,
      upper: farmsEffectTickUpper,
      sort: 3
    }
  })

  // 获取全范围区间
  const getFullRange = (tickSpacing: number) => ({
    'full range': {
      lower: TickUtil.getMinIndex(tickSpacing),
      upper: TickUtil.getMaxIndex(tickSpacing),
      sort: 2
    }
  })

  // 获取自定义区间
  const getCustomRange = (currentTick: number, type: string, tickSpacing: number) => {
    const addTick = d(tickSpacing)
      .mul(type === 'unstable' ? 2 : 3)
      .toNumber()
    const nearesCurrentTick = getNearestTickByTick(Number(currentTick), Number(tickSpacing))

    return {
      custom: {
        lower: d(nearesCurrentTick).sub(addTick).toNumber(),
        upper: d(nearesCurrentTick).add(addTick).toNumber(),
        sort: 1
      }
    }
  }

  // 获取推荐区间列表
  const getRecommendRangesList = async (params: GetRecommendRangesListParams): Promise<{ rangeList: RecommendRange[]; error: boolean }> => {
    try {
      const stableRange =
        params.farmsEffectTickLower && params.farmsEffectTickUpper ? getStableRange(params.farmsEffectTickLower, params.farmsEffectTickUpper) : null

      const recommendRangesResult =
        params.farmsEffectTickLower && params.farmsEffectTickUpper ? { ranges: {}, type: '' } : params?.recommendRangesInfo
      console.log(recommendRangesResult, 'recommendRangesResult')
      if (recommendRangesResult) {
        // 更新 poolType
        setPoolType(recommendRangesResult.type)
        const fullRange = getFullRange(params.tickSpacing)
        const customRange = getCustomRange(params.currentTick, recommendRangesResult.type, params.tickSpacing)

        const combinedRanges = {
          ...stableRange,
          ...recommendRangesResult.ranges,
          ...fullRange,
          ...customRange
        }
        const rangesList = Object.entries(combinedRanges)
          .map(([key, value]) => ({ key, ...value }))
          .sort((a, b) => b.sort - a.sort)

        if (isAvailableObject(recommendRangesResult.ranges) || isAvailableObject(stableRange)) {
          return {
            rangeList: rangesList,
            error: false
          }
        } else {
          return {
            rangeList: rangesList,
            error: true
          }
        }
      } else {
        return { rangeList: [], error: true }
      }
    } catch (error) {
      console.error('Error in getRecommendRangesList:', error)
      return { rangeList: [], error: true }
    }
  }

  return { getRecommendRangesList, poolType }
}
