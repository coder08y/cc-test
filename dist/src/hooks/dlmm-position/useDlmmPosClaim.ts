import useDlmmPositionStore from '@/store/dlmm-position'
import { PosReward } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { useAccountBalance } from '@cetus/hooks'
import { CommonTypeInfo } from '@cetus/types'
import { useMemo, useState } from 'react'
import useTransaction from '../common/useTransaction'
import useDlmmPosCollect from './useDlmmPosCollect'
import useGetDlmmPosFeeAndReward from './useGetDlmmPosFeeAndReward'
import useGetDlmmPosPool from './useGetDlmmPosPool'

export default function useDlmmPosClaim() {
  const { collectRewardAndFeePayload } = useDlmmPosCollect()
  const { dlmmCurrentPosBaseInfo, dlmmPosRewardsData, dlmmPosFeeData, dlmmPosPoolsOriginalData } = useDlmmPositionStore()
  const [isClaimLoading, setIsClaimLoading] = useState(false)
  const { signAndExecuteTransaction } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const { getDlmmPosPoolsOriginalObj } = useGetDlmmPosPool()
  const { getDlmmPosFeeAndReward } = useGetDlmmPosFeeAndReward()

  const dlmmCurrentPosRewardData = useMemo(() => {
    return dlmmPosRewardsData?.[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosRewardsData])

  const dlmmCurPosContractPoolInfo = useMemo(() => {
    return dlmmPosPoolsOriginalData?.[dlmmCurrentPosBaseInfo?.dlmmPool]
  }, [dlmmPosPoolsOriginalData, dlmmCurrentPosBaseInfo?.dlmmPool])

  const toClaimDlmmPosition = async (positionInfo: any) => {
    console.log(positionInfo, 'toClaimDlmmPosition')
    let TrackDataParams: any = {}
    try {
      setIsClaimLoading(true)
      const { dlmmPool, id, coinTypeA, coinTypeB } = positionInfo
      const currentPosRewardData = dlmmPosRewardsData?.[id]
      const params = {
        dlmmPool,
        positionId: id,
        rewardCoins: (currentPosRewardData || [])?.map((reward: PosReward) => reward.coin_address),
        coinTypeA,
        coinTypeB
      }

      // 埋点params
      const { rewardCoins, ...trackData } = params
      TrackDataParams = {
        ...trackData,
        rewardCoins: JSON.stringify(rewardCoins)
      }

      const tx = collectRewardAndFeePayload([params])
      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: () => {
            const info: CommonTypeInfo = {
              modalDescriptionText: 'Claim Yield',
              toastTitleText: 'Claim'
            }
            return info
          }
        },
        {
          trackData: {
            params: TrackDataParams,
            actionType: 'dlmm',
            action: 'dlmmPosClaim'
          }
        }
      )
      console.log('🚀 ~ toClaimYield ~ res:', res)
      if (res) {
        // 重新拿列表数据
        const poolInfo = dlmmCurPosContractPoolInfo || (await getDlmmPosPoolsOriginalObj([dlmmCurrentPosBaseInfo as DlmmPosBaseInfo]))

        console.log('🚀 ~ toClaim ~ poolInfo:', poolInfo)

        // 延迟刷新数据
        setTimeout(() => {
          fetchAccountBalance()
          getDlmmPosFeeAndReward([positionInfo], {
            [poolInfo?.poolAddress]: poolInfo
          })
          // getCurrentPosHistory(id, posId) // 如需历史记录
        }, 2000)
      }
      setIsClaimLoading(false)
    } catch (error) {
      setIsClaimLoading(false)
      console.log('🚀🚀🚀 ~ useDlmmPosClaim.ts:29 ~ toClaimDlmmPosition ~ error:', error)
    }
  }

  return {
    toClaimDlmmPosition,
    isClaimLoading
  }
}
