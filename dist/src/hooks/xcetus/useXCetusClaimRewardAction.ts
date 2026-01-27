import useTransaction from '@/hooks/common/useTransaction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { MsafeTransactionSubType } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { DividendReward } from '@cetusprotocol/xcetus-sdk'
import { useState } from 'react'
import { useGetVeNFTDividendInfo } from './useXCetusHelper'

export default function useXCetusClaimRewardAction() {
  const { fetchAccountBalance } = useAccountBalance()
  const { signAndExecuteTransaction } = useTransaction()
  const xCetusSdk = useSdk('xcetus')
  const { veNFT } = useXCetusStore()
  const [claimRewardLoading, setClaimRewardLoading] = useState<boolean>(false)
  const { fetchVeNFTDividendInfo } = useGetVeNFTDividendInfo()

  const handleClaimReward = async (rewardList: DividendReward[]) => {
    if (!veNFT) {
      return
    }
    setClaimRewardLoading(true)

    console.log('🚀 ~ file: useXCetusClaimRewardAction.ts:23 ~ handleClaimReward ~ rewardList:', rewardList)

    try {
      const txb = xCetusSdk!.XCetusModule.redeemDividendV3Payload(veNFT.id, rewardList)

      const res = await signAndExecuteTransaction(
        txb,
        {},
        {
          useDevInspect: true,
          msafeParams: {
            action: MsafeTransactionSubType.xCETUSClaimStakingRwewards,
            txbParams: {
              veNftId: veNFT.id,
              rewardList
            }
          }
        }
      )
      setClaimRewardLoading(false)

      if (res) {
        setTimeout(() => {
          // 刷新余额
          fetchAccountBalance()
          // 刷新订单
          fetchVeNFTDividendInfo(veNFT.id)
        }, 2000)
      }
    } catch (error) {
      console.log('🚀 ~ file: useXCetusClaimRewardAction.ts:40 ~ handleClaimReward ~ error:', error)
    } finally {
      setClaimRewardLoading(false)
    }
  }

  return {
    handleClaimReward,
    claimRewardLoading
  }
}
