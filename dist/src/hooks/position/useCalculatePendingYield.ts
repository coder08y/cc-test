import { PosBaseInfo, PosFee, PosReward } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { d } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
// 根据仓位列表返回fee和mining奖励的token数组
export default function useCalculatePendingYield() {
  const { getTokenAmountValue } = useTokenPrice()

  const calculatePendingYield = (
    list: (PosBaseInfo | DlmmPosBaseInfo)[],
    posFeeData: Record<string, any>,
    posRewardsData: Record<string, any>,
    posFarmsData?: Record<string, any>,
    dlmmPosFeeData?: Record<string, PosFee>,
    dlmmPosRewardsData?: Record<string, PosReward[]>
  ) => {
    if (!list?.length) {
      return {
        total: '0',
        rewardAndFeeList: [],
        clmmFeeList: [],
        clmmRewardList: [],
        dlmmFeeList: [],
        dlmmRewardList: []
      }
    }

    let total = d(0)
    let totalOrigin = d(0)
    const rewardAndFeeList: any[] = []
    const clmmFeeList: any[] = []
    const clmmRewardList: any[] = []
    const dlmmFeeList: any[] = []
    const dlmmRewardList: any[] = []

    const dlmmPosBaseList = list.filter((item: any) => item.posType === 'dlmm') as DlmmPosBaseInfo[]
    const clmmPosBaseList = list.filter((item: any) => item.posType !== 'dlmm') as PosBaseInfo[]

    if (clmmPosBaseList) {
      clmmPosBaseList.map(position => {
        const currentFeesData = posFeeData[position?.posId]
        const currentPosRewardsData = posRewardsData[position?.posId] || []
        const currentPosFarmsData = posFarmsData ? posFarmsData[position?.id] : []
        const rewardsArr = currentPosRewardsData.concat(currentPosFarmsData)
        console.log(currentPosFarmsData, posFarmsData, position, list, 'posFarmsData')
        let positionTotal = d(0)
        const tokens: any[] = []

        // 处理 fee
        if (currentFeesData) {
          const feeTokenA = processToken(position?.displayTokenA, currentFeesData?.displayFeeOwedA)
          const feeTokenB = processToken(position?.displayTokenB, currentFeesData?.displayFeeOwedB)

          if (feeTokenA) {
            tokens.push(feeTokenA)
            clmmFeeList.push(feeTokenA)
            positionTotal = addAmountValue(positionTotal, feeTokenA.amountUSD)
          }
          if (feeTokenB) {
            tokens.push(feeTokenB)
            clmmFeeList.push(feeTokenB)
            positionTotal = addAmountValue(positionTotal, feeTokenB.amountUSD)
          }
        }

        // 处理 reward
        rewardsArr.forEach((reward: any) => {
          if (Number(reward?.display_amount_owed) > 0) {
            const rewardToken = processToken(reward?.token, reward?.display_amount_owed, reward?.token?.coin_type)

            if (rewardToken) {
              tokens.push(rewardToken)
              clmmRewardList.push(rewardToken)
              positionTotal = addAmountValue(positionTotal, rewardToken.amountUSD)
            }
          }
        })

        rewardAndFeeList.push(...tokens)
        totalOrigin = totalOrigin.plus(positionTotal)

        const fixedTotalUsd = d(positionTotal.toFixed(2)) // 固定两位小数
        total = total.plus(fixedTotalUsd)
        return {
          ...position,
          totalUsd: positionTotal.toString()
        }
      })
    }

    if (dlmmPosBaseList) {
      dlmmPosBaseList.forEach(position => {
        let positionTotal = d(0)
        const tokens: any[] = []

        const currentFeesData = dlmmPosFeeData?.[position.id]
        const currentPosRewardsData = dlmmPosRewardsData?.[position.id] || []
        const rewardsArr = currentPosRewardsData
        // Process fees
        if (currentFeesData) {
          const feeTokenA = processToken(position?.displayTokenA, currentFeesData?.displayFeeOwedA)
          const feeTokenB = processToken(position?.displayTokenB, currentFeesData?.displayFeeOwedB)

          if (feeTokenA) {
            tokens.push(feeTokenA)
            dlmmFeeList.push(feeTokenA)
            positionTotal = addAmountValue(positionTotal, feeTokenA.amountUSD)
          }
          if (feeTokenB) {
            tokens.push(feeTokenB)
            dlmmFeeList.push(feeTokenB)
            positionTotal = addAmountValue(positionTotal, feeTokenB.amountUSD)
          }
        }

        // 处理 reward
        rewardsArr.forEach((reward: any) => {
          if (Number(reward?.display_amount_owed) > 0) {
            const rewardToken = processToken(reward?.token, reward?.display_amount_owed, reward?.token?.coin_type)

            if (rewardToken) {
              tokens.push(rewardToken)
              dlmmRewardList.push(rewardToken)
              positionTotal = addAmountValue(positionTotal, rewardToken.amountUSD)
            }
          }
        })

        rewardAndFeeList.push(...tokens)
        totalOrigin = totalOrigin.plus(positionTotal)

        const fixedTotalUsd = d(positionTotal.toFixed(2)) // 固定两位小数
        total = total.plus(fixedTotalUsd)
        return {
          ...position,
          totalUsd: positionTotal.toString()
        }
      })
    }

    const aggregatedList = aggregateRewardsAndFees(rewardAndFeeList)
    console.log('🚀 ~ calculatePendingYield ~  total,:', aggregatedList, totalOrigin.toString(), total.toString())
    // aggregatedList?.length > 0 && totalOrigin.eq(0)说明没有价格; total.eq(0)说明 '<0.01'此时用原值
    return {
      total: aggregatedList?.length > 0 && totalOrigin.eq(0) ? '--' : total.eq(0) ? totalOrigin.toString() : total.toFixed(2),
      rewardAndFeeList: aggregatedList,
      clmmFeeList,
      clmmRewardList,
      dlmmFeeList,
      dlmmRewardList
    }
  }

  // 单个 token 的转换处理
  const processToken = (token: any, amount: any, coinAddress?: string) => {
    if (!token || !amount) return null

    const coinType = coinAddress || token.coin_type
    if (!coinType) return null

    const amountUSD = getTokenAmountValue(coinType, amount)

    return {
      coin_address: fixCoinType(coinType, false),
      amount,
      amountUSD: d(amount).gt(0) && d(amountUSD).lte(0) ? '--' : amountUSD,
      token
    }
  }

  // 累加 helper
  const addAmountValue = (acc: any, amount?: string) => {
    if (!amount || amount === '--') return acc
    return acc.plus(amount)
  }

  // 聚合重复 token 并排序
  const aggregateRewardsAndFees = (list: any[]) => {
    const claimObj: Record<string, any> = {}

    list.forEach(item => {
      const { coin_address, amount, amountUSD } = item
      // console.log('🚀 ~ aggregateRewardsAndFees ~ claimObj:', amount, amountUSD, item, claimObj)

      if (!claimObj[coin_address]) {
        claimObj[coin_address] = { ...item, amount: '0', amountUSD: '0' }
      }

      if (amountUSD == '--') {
        claimObj[coin_address].amountUSD = '--'
      } else {
        claimObj[coin_address].amountUSD =
          claimObj[coin_address].amountUSD == '--'
            ? '--'
            : d(claimObj[coin_address]?.amountUSD)
                .plus(amountUSD || 0)
                .toString()
      }

      claimObj[coin_address].amount = d(claimObj[coin_address]?.amount)
        .plus(amount || 0)
        .toString()
    })

    return Object.values(claimObj)
      .filter((item: any) => Number(item.amount) > 0)
      .sort((a: any, b: any) =>
        d(b.amountUSD == '--' ? 0 : b.amountUSD)
          .minus(a.amountUSD == '--' ? 0 : a.amountUSD)
          .toNumber()
      )
  }

  return {
    calculatePendingYield,
    aggregateRewardsAndFees
  }
}
