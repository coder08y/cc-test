import { PoolApiInfo, PosPoolsRelated } from '@/types'
import { aprProcessing } from '@/utils/api-data-utils'
import { formatNumberWithDown, isAvailableObject, symbolDataDisplayProcessing } from '@cetus/utils'
import { TickMath, d } from '@cetusprotocol/common-sdk'

export default function usePositionApr() {
  const estPositionAPRWithMultiMethod = (lowerUserPrice: number, upperUserPrice: number, lowerHistPrice: number, upperHistPrice: number) => {
    // 交集部分最小价格
    const retroLower = Math.max(lowerUserPrice, lowerHistPrice) // 0.00499241
    // 交集部分最大价格
    const retroUpper = Math.min(upperUserPrice, upperHistPrice) // 0.00630856
    // 交集
    const retroRange = retroUpper - retroLower
    // 用户交集
    const userRange = upperUserPrice - lowerUserPrice
    // 历史交集
    const histRange = upperHistPrice - lowerHistPrice

    const retroRangeD = d(retroRange.toString())
    console.log('🚀🚀🚀 ~ usePositionApr.ts:27 ~ estPositionAPRWithMultiMethod ~ retroRange.toString():', retroRange.toString())
    const userRangeD = d(userRange.toString())
    const histRangeD = d(histRange.toString())
    console.log('🚀🚀🚀 ~ usePositionApr.ts:30 ~ estPositionAPRWithMultiMethod ~ histRange.toString():', histRange.toString())
    console.log('🚀🚀🚀 ~ usePositionApr.ts:8 ~ estPositionAPRWithMultiMethod ~ lowerUserPrice:', {
      lowerUserPrice,
      upperUserPrice,
      lowerHistPrice,
      upperHistPrice,
      retroRange,
      userRange,
      histRange
    })
    if (retroRange <= 0) return d(0)
    // 若用户区间在交集区间内或者等于交集区间 , 则m=历史交易区间/交集区间
    if (userRange <= retroRange) return histRangeD.div(retroRangeD)
    // 若有效区间=交集区间, 则m=交集部分/用户选择部分
    if (retroRange === histRange) return retroRangeD.div(userRangeD)
    //若用户选择区间一部分存在交集，另一部分在历史交易区间外，则 m=（交集部分/历史交易区间）*（交集部分/用户选择部分）
    return retroRangeD.div(histRangeD).mul(retroRangeD.div(userRangeD))
  }

  const getPositionApr = (
    posPoolInfo: PoolApiInfo,
    posRangeInfo: PosPoolsRelated,
    dateType: 'day' | 'week' | 'month',
    range: any,
    isFarmsPos?: boolean,
    positionTvl?: string
  ) => {
    console.log('🚀 ~ usePositionApr ~ posRangeInfo?.currentStatus:', posRangeInfo?.currentStatus)
    if (!isAvailableObject(posPoolInfo) || !isAvailableObject(posRangeInfo) || !isAvailableObject(range)) return
    console.log('🚀🚀🚀 ~ usePositionApr.ts:52 ~ usePositionApr ~ posRangeInfo:', posRangeInfo)
    if (posRangeInfo?.currentStatus == 'Closed' || posRangeInfo?.currentStatus == 'Inactive') {
      return {
        aprPercentageTotal: 0,
        displayAprPercentageTotal: '0%',
        aprByFee: 0,
        aprByFeeDisplay: '0%',
        farmingAprDisplay: '0%',
        posMiningReward: []
      }
    }
    console.log('🚀🚀🚀 ~ usePositionApr.ts:42 ~ getPositionApr ~ posPoolInfo:', posPoolInfo)
    console.log('🚀🚀🚀 ~ usePositionApr.ts:91 ~ usePositionApr ~ posRangeInfo:', posRangeInfo)
    const { minPriceRaw, maxPriceRaw } = posRangeInfo
    console.log('🚀 ~ usePositionApr ~  minPriceRaw, maxPriceRaw:', minPriceRaw, maxPriceRaw)
    const {
      tokenA,
      tokenB,
      miningAprList,
      feeApr,
      feeApr7d,
      feeApr30d,
      isReverse,
      farmsEffectiveTickLower,
      farmsEffectiveTickUpper,
      farmsStatedTvl,
      farmsApr
    } = posPoolInfo
    const decimalA = tokenA?.decimals
    const decimalB = tokenB?.decimals
    const isFullRange = minPriceRaw == '0' && maxPriceRaw == '∞'
    const lowerUserPrice = minPriceRaw
    const upperUserPrice = isFullRange ? 2 ** 50 : maxPriceRaw

    const { lower, upper } = range
    const beforeContractPriceLowest = TickMath.tickIndexToPrice(lower, decimalA, decimalB).toNumber()
    const beforeContractPriceHighest = TickMath.tickIndexToPrice(upper, decimalA, decimalB).toNumber()

    const hisLowerPrice = isReverse
      ? formatNumberWithDown(d(1).div(beforeContractPriceHighest).toString(), undefined, true)
      : formatNumberWithDown(beforeContractPriceLowest, undefined, true)
    const hisUpperPrice = isReverse
      ? formatNumberWithDown(d(1).div(beforeContractPriceLowest).toString(), undefined, true)
      : formatNumberWithDown(beforeContractPriceHighest, undefined, true)

    const positionMulti = estPositionAPRWithMultiMethod(lowerUserPrice, upperUserPrice, hisLowerPrice, hisUpperPrice)
    console.log('🚀🚀🚀 ~ usePositionApr.ts:71 ~ getPositionApr ~ ', {
      positionMulti系数: positionMulti.toString(),
      feeApr,
      feeApr7d,
      feeApr30d,
      dateType
    })

    const aprByFee = d(
      (() => {
        const map: Record<string, any> = {
          day: feeApr,
          month: feeApr30d,
          week: feeApr7d
        }
        const value = map[dateType] ?? feeApr7d
        return value && value !== '--' ? value : '0'
      })()
    )
      .mul(positionMulti)
      .toString()

    const posMiningReward: any = []
    let aprPercentageTotal = d(aprByFee)
    miningAprList?.forEach(reward => {
      const posMiningRewardApr = d(positionMulti).mul(reward.apr).toString()
      const posMiningRewardAprDisplay = aprProcessing(posMiningRewardApr, true)
      posMiningReward.push({ ...reward, posMiningRewardApr, posMiningRewardAprDisplay })
      aprPercentageTotal = aprPercentageTotal.add(posMiningRewardApr)
    })

    let farmingApr = '0'
    if (isFarmsPos) {
      const farmsLower = TickMath.tickIndexToPrice(farmsEffectiveTickLower, decimalA, decimalB).toNumber()
      const farmsUpper = TickMath.tickIndexToPrice(farmsEffectiveTickUpper, decimalA, decimalB).toNumber()
      const farmsPositionMulti = estPositionAPRWithMultiMethod(lowerUserPrice, upperUserPrice, farmsLower, farmsUpper)
      // farmingApr = farmsPositionMulti.gt(0) ? d(positionTvl).div(farmsStatedTvl).mul(farmsApr).mul(100).toString() : '0'
      console.log('🚀🚀🚀 ~ usePositionApr.ts:123 ~ usePositionApr ~ farmsApr:', farmsApr)
      farmingApr = farmsPositionMulti.gt(0) ? d(farmsApr).toString() : '0'
      // aprPercentageTotal = aprPercentageTotal.add(farmingApr)
    }

    return {
      aprPercentageTotal: aprPercentageTotal.toString(),
      displayAprPercentageTotal: symbolDataDisplayProcessing(aprPercentageTotal.mul(100).toString(), '%', 2, true),
      aprByFee,
      aprByFeeDisplay: aprProcessing(aprByFee, true),
      posMiningReward,
      farmingAprDisplay: symbolDataDisplayProcessing(d(farmingApr).mul(100).toString(), '%', 2, true)
    }
  }

  const getPositionAprV2 = (posPoolInfo: PoolApiInfo, posRangeInfo: PosPoolsRelated, dateType: 'day' | 'week' | 'month', range: any) => {
    console.log('🚀🚀🚀 ~ usePositionApr.ts:136 ~ getPositionAprV2 ~ posPoolInfo:', posPoolInfo)
    // 用户选择价格区间
    const { minPriceRaw, maxPriceRaw } = posRangeInfo
    console.log('🚀 ~ usePositionApr ~  minPriceRaw, maxPriceRaw:', minPriceRaw, maxPriceRaw)
    const {
      tokenA,
      tokenB,
      miningAprList,
      feeApr,
      feeApr7d,
      feeApr30d,
      isReverse,
      farmsEffectiveTickLower,
      farmsEffectiveTickUpper,
      farmsStatedTvl,
      farmsApr
    } = posPoolInfo
    const decimalA = tokenA?.decimals
    const decimalB = tokenB?.decimals
    const isFullRange = minPriceRaw == '0' && maxPriceRaw == '∞'
    const lowerUserPrice = minPriceRaw
    const upperUserPrice = isFullRange ? 2 ** 50 : maxPriceRaw
    // 历史价格区间
    const { lower, upper } = range
    const beforeContractPriceLowest = TickMath.tickIndexToPrice(lower, decimalA, decimalB).toNumber()
    const beforeContractPriceHighest = TickMath.tickIndexToPrice(upper, decimalA, decimalB).toNumber()

    const hisLowerPrice = isReverse
      ? formatNumberWithDown(d(1).div(beforeContractPriceHighest).toString(), undefined, true)
      : formatNumberWithDown(beforeContractPriceLowest, undefined, true)
    const hisUpperPrice = isReverse
      ? formatNumberWithDown(d(1).div(beforeContractPriceLowest).toString(), undefined, true)
      : formatNumberWithDown(beforeContractPriceHighest, undefined, true)
    // 计算系数
    const positionMulti = estPositionAPRWithMultiMethod(lowerUserPrice, upperUserPrice, hisLowerPrice, hisUpperPrice)
  }

  return { getPositionApr }
}
