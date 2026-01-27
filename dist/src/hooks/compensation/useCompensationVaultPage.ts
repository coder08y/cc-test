import useCompensationStore from '@/store/compensation'
import { d } from '@cetus/utils'
import { useChainTime } from '../common/useChainTime'
import useGetPosInfoList from '../position/useGetPosInfoList'
import useGetVaultVestInfo from './useGetVaultVestInfo'
import useGetVaultVestList from './useGetVaultVestList'

export default function useCompensationVaultPage() {
  const { getVaultVestList } = useGetVaultVestList()
  const { parseObjectKeysToCamelCase } = useGetPosInfoList()
  const {
    setVaultPosGroupByPool,
    setVltTotalCetusCompensation,
    setVltTotalAvailableClaim,
    setVaultPositionList,
    setRedeemAllLoading,
    setVaultPositionLoading
  } = useCompensationStore()
  const { getVaultsVestInfoList } = useGetVaultVestInfo()
  const { getAccurateTime } = useChainTime()

  const handleGetVaultList = async (account: string, isSetLoading = true) => {
    if (!account) return
    if (isSetLoading) {
      setVaultPositionLoading(true)
    }

    const vestList = await getVaultVestList(account, isSetLoading)
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:18 ~ handleGetVaultList ~ vestList:', vestList)

    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:18 ~ handleGetVaultList ~ vestList:', vestList)
    const cetusVaultIdList = [...new Set(vestList.filter(item => item.category === 'cetus').map(item => item.vaultId))]

    const haedalVaultIdList = [...new Set(vestList.filter(item => item.category === 'haedal').map(item => item.vaultId))]

    const vestInfoMap = await getVaultsVestInfoList(cetusVaultIdList, haedalVaultIdList)

    const { processedList, totalAvailableClaim, totalCetusCompensation } = await processVaultVestList(vestList, vestInfoMap)
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:39 ~ handleGetVaultList ~ processedList:', processedList)
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:40 ~ handleGetVaultList ~ totalAvailableClaim:', totalAvailableClaim.toString())

    const sortedProcessedList = processedList.sort((a, b) => d(b.vestData.cetusAmount).comparedTo(a.vestData.cetusAmount))
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:38 ~ handleGetVaultList ~ sortedProcessedList:', sortedProcessedList)

    setVaultPositionList(sortedProcessedList)
    setVltTotalAvailableClaim(totalAvailableClaim.toString())
    setVltTotalCetusCompensation(totalCetusCompensation.toString())
    setVaultPosGroupByPool(groupVaultPositionsByPool(sortedProcessedList))
    setRedeemAllLoading(false)
    setVaultPositionLoading(false)
  }

  const processVaultVestList = async (vestList: any[], vestInfoMap: Record<string, any>) => {
    const now = (await getAccurateTime()) / 1000

    let totalAvailable = d(0)
    let totalCetus = d(0)

    const processedList = vestList.map(item => {
      const parsed = parseVaultItem(item, vestInfoMap, now)
      totalAvailable = totalAvailable.add(parsed.vestData.availableAmount)
      totalCetus = totalCetus.add(parsed.vestData.cetusAmount)
      return parsed
    })

    return {
      processedList,
      totalAvailableClaim: totalAvailable,
      totalCetusCompensation: totalCetus
    }
  }

  const parseVaultItem = (item: any, vestInfoMap: Record<string, any>, now: number) => {
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:58 ~ parseVaultItem ~ vestInfoMap:', vestInfoMap)
    const { tokenA, tokenB, isReverse } = item
    const vestData = parseObjectKeysToCamelCase(item.vestData)
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:57 ~ parseVaultItem ~ vestData:', vestData)
    const vestInfo = vestInfoMap[vestData.vaultId]
    const periods = vestData.periodInfos ?? []
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:70 ~ parseVaultItem ~ vestInfo:', vestInfo)

    let releasedAmount = d(0)
    let availableAmount = d(0)
    let cetusAmount = d(0)

    const periodDetails = periods.map((p: any, i: number) => {
      const amt = d(p.amount || 0).div(1e9)
      const releaseTime = vestInfo.global_vesting_periods?.[i]?.release_time ?? 0
      const canClaim = d(now).gte(releaseTime) && !p.isRedeemed

      cetusAmount = cetusAmount.add(amt)
      if (d(now).gte(releaseTime)) {
        releasedAmount = releasedAmount.add(amt)
        if (!p.isRedeemed) availableAmount = availableAmount.add(amt)
      }

      return {
        ...p,
        cetusAmount: amt.toString(),
        releaseTime,
        canClaim,
        status: p.isRedeemed ? 'Claimed' : canClaim ? 'Pending Claim' : 'Locked',
        category: item.category
      }
    })

    const impairedA = d(vestData.impairedA || 0)
      .div(10 ** tokenA.decimals)
      .toString()
    const impairedB = d(vestData.impairedB || 0)
      .div(10 ** tokenB.decimals)
      .toString()

    return {
      ...item,
      vestData: {
        ...vestData,
        periodDetails,
        vaultsVestId: vestInfo.id,
        cetusAmount: cetusAmount.toString(),
        releasedAmount: releasedAmount.toString(),
        availableAmount: availableAmount.toString(),
        impairedA: isReverse ? impairedB : impairedA,
        impairedB: isReverse ? impairedA : impairedB,
        releasedAmountRatio: cetusAmount.gt(0) ? Math.ceil(releasedAmount.div(cetusAmount).mul(100).toNumber()) : '0'
      }
    }
  }

  const groupVaultPositionsByPool = (data: any[]) => {
    console.log('🚀🚀🚀 ~ useCompensationVaultPage.ts:121 ~ groupVaultPositionsByPool ~ data:', data)
    return data.reduce((acc: any, item: any) => {
      const pool = item.clmmPoolAddress
      if (!acc[pool]) {
        acc[pool] = {
          list: [],
          isReverse: item?.isReverse,
          tokenA: item?.tokenA,
          tokenB: item?.tokenB,
          displayTokenA: item?.displayTokenA,
          displayTokenB: item?.displayTokenB,
          clmmPoolAddress: pool,
          vestData: item?.vestData,
          feeDisplay: item?.feeDisplay,
          category: item?.category,
          vaultId: item?.vaultId
        }
      }
      acc[pool].list.push(item)
      return acc
    }, {})
  }

  return {
    handleGetVaultList,
    groupVaultPositionsByPool,
    processVaultVestList,
    parseVaultItem
  }
}
