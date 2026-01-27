import { useChainTime } from '@/hooks/common/useChainTime'
import useCompensationStore from '@/store/compensation'
import { PosBaseInfo } from '@/types'
import { ClmmCompensationItem, VestingPosition } from '@/types/vest'
import { d, isAvailableObject } from '@cetus/utils'
import useGetPosPools from '../position/useGetPosPools'
import usePositionList from '../position/usePositionList'
import useGetClmmVestInfo from './useGetClmmVestInfo'

export default function useCompensationPositionPage() {
  const { getPositionBaseList } = usePositionList()
  const {
    setPosBaseListGroupByPool,
    posBaseListLoading,
    setPosbaseListLoading,
    setPosTotalCetusCompensation,
    setPosTotalAvailableClaim,
    setPosBaseList,
    setRedeemAllLoading
  } = useCompensationStore()

  const { getPosPoolsOriginalObj, getPosPoolsRelatedData } = useGetPosPools()
  const { getClmmVestInfo } = useGetClmmVestInfo()
  const { getAccurateTime } = useChainTime()

  /**
   * 分组：将仓位按池子地址聚合
   */
  const groupPositionsByPool = (positions: PosBaseInfo[]) => {
    return positions.reduce(
      (grouped, pos) => {
        const key = pos.clmmPool
        if (!grouped[key]) {
          grouped[key] = {
            list: [],
            clmmPoolAddress: key,
            tokenA: pos.tokenA,
            tokenB: pos.tokenB,
            isReverse: pos.isReverse,
            displayTokenA: pos.displayTokenA,
            displayTokenB: pos.displayTokenB,
            vestData: pos.vestData
          }
        }
        grouped[key].list.push(pos)
        return grouped
      },
      {} as Record<string, any>
    )
  }

  /**
   * 获取并组装补偿数据
   */
  const handleGetPositionList = async (walletAddress: string, isSetLoading = true) => {
    if (!walletAddress) return
    try {
      if (isSetLoading) {
        setPosbaseListLoading(true)
      }

      const [clmmVestInfo, rawList] = await Promise.all([getClmmVestInfo(), getPositionBaseList(walletAddress, { useInVest: true })])
      console.log('🚀🚀🚀 ~ useCompensationPositionPage.ts:60 ~ handleGetPositionList ~ rawList:', rawList)
      console.log('🚀🚀🚀 ~ useCompensationPositionPage.ts:60 ~ handleGetPositionList ~ clmmVestInfo:', JSON.stringify(clmmVestInfo))

      const compensationList: ClmmCompensationList = await buildCompensationList(rawList.clmmPosBaseList as PosBaseInfo[], clmmVestInfo)
      console.log('🚀🚀🚀 ~ useCompensationPositionPage.ts:64 ~ handleGetPositionList ~ compensationList:', JSON.stringify(compensationList[0]))
      const sortedList = compensationList.sort((a, b) => d(b.vestData.cetusAmount).comparedTo(a.vestData.cetusAmount))

      setPosBaseList(sortedList)

      const { totalAvailableClaim, totalCetusCompensation } = computeTotals(sortedList)
      setPosTotalAvailableClaim(totalAvailableClaim)
      setPosTotalCetusCompensation(totalCetusCompensation)

      const groupedResult = groupPositionsByPool(sortedList)
      setPosBaseListGroupByPool(groupedResult)

      const posPoolsOriginalData = await getPosPoolsOriginalObj(sortedList)
      getPosPoolsRelatedData(sortedList, posPoolsOriginalData)
    } catch (err) {
      console.error('handleGetPositionList error:', err)
    } finally {
      setPosbaseListLoading(false)
      setRedeemAllLoading(false)
    }
  }

  /**
   * 构建仓位的补偿数据结构
   */
  const buildCompensationList = async (positions: PosBaseInfo[], clmmVestInfo: any): Promise<ClmmCompensationItem[]> => {
    const now = (await getAccurateTime()) / 1000

    return positions.reduce<ClmmCompensationItem[]>((acc, item) => {
      if (!isAvailableObject(item?.vestData)) return acc
      const { isReverse, tokenA, tokenB } = item
      const vestData: VestingPosition = item.vestData

      const impairedA = d(vestData.impairedA || 0)
        .div(10 ** tokenA.decimals)
        .toString()
      const impairedB = d(vestData.impairedB || 0)
        .div(10 ** tokenB.decimals)
        .toString()

      const periodDetails = vestData.periodDetails.map((detail, index) => {
        const releaseTime = clmmVestInfo?.global_vesting_periods?.[index]?.release_time || 0
        const rawAmount = d(detail.cetusAmount || 0)
        const normalizedAmount = rawAmount.div(10 ** 9)
        const canClaim = d(now).gte(releaseTime) && !detail.isRedeemed

        return {
          ...detail,
          cetusAmount: normalizedAmount.toString(),
          releaseTime,
          canClaim,
          status: detail.isRedeemed ? 'Claimed' : canClaim ? 'Pending Claim' : 'Locked'
        }
      })

      let releasedAmount = d(0)
      let availableAmount = d(0)
      for (const detail of periodDetails) {
        const amt = d(detail.cetusAmount || 0)
        if (d(now).gte(detail.releaseTime)) {
          releasedAmount = releasedAmount.add(amt)
          if (!detail.isRedeemed) {
            availableAmount = availableAmount.add(amt)
          }
        }
      }

      const cetusAmount = d(vestData.cetusAmount || 0).div(10 ** 9)
      vestData.periodDetails = periodDetails
      vestData.cetusAmount = cetusAmount.toString()
      vestData.releasedAmount = releasedAmount.toString()
      vestData.availableAmount = availableAmount.toString()
      vestData.releasedAmountRatio = Math.ceil(cetusAmount.gt(0) ? releasedAmount.div(cetusAmount).mul(100).toNumber() : 0)
      vestData.impairedA = isReverse ? impairedB : impairedA
      vestData.impairedB = isReverse ? impairedA : impairedB

      acc.push(item as ClmmCompensationItem)
      return acc
    }, [])
  }

  /**
   * 计算合计金额
   */
  const computeTotals = (list: ClmmCompensationItem[]) => {
    let totalAvailable = d(0)
    let totalCetus = d(0)

    for (const { vestData } of list) {
      totalAvailable = totalAvailable.add(vestData?.availableAmount || 0)
      totalCetus = totalCetus.add(vestData?.cetusAmount || 0)
    }

    return {
      totalAvailableClaim: totalAvailable.toString(),
      totalCetusCompensation: totalCetus.toString()
    }
  }

  return {
    handleGetPositionList,
    posBaseListLoading,
    buildCompensationList,
    groupPositionsByPool
  }
}
