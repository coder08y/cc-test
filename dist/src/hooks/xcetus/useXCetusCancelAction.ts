import useTransaction from '@/hooks/common/useTransaction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { MsafeTransactionSubType } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { CancelRedeemParams, LockCetus } from '@cetusprotocol/xcetus-sdk'
import { useState } from 'react'
import { useGetOwnerVeNFT } from '../xcetus/useXCetusHelper'

export default function useXCetusCancelAction() {
  const { fetchAccountBalance } = useAccountBalance()
  const { signAndExecuteTransaction } = useTransaction()
  const xCetusSdk = useSdk('xcetus')
  const { veNFT } = useXCetusStore()

  const { fetchOwnerVeNFT } = useGetOwnerVeNFT()
  const { currentAccount } = useAccountStore()

  const [cancelOrderLoading, setCancelOrderLoading] = useState<boolean>(false)

  const handleCancelOrder = async (order: LockCetus) => {
    if (!veNFT) {
      return
    }
    setCancelOrderLoading(true)

    const params: CancelRedeemParams = {
      venft_id: veNFT.id,
      lock_id: order.id
    }
    const txb = xCetusSdk!.XCetusModule.cancelRedeemPayload(params)

    const res = await signAndExecuteTransaction(
      txb,
      {},
      {
        msafeParams: {
          action: MsafeTransactionSubType.xCETUSCancelRedeem,
          txbParams: params
        }
      }
    )
    setCancelOrderLoading(false)

    if (res) {
      // 刷新余额
      fetchAccountBalance()

      if (currentAccount) {
        setTimeout(() => {
          fetchOwnerVeNFT(currentAccount?.address, true)
        }, 2000)
      }
    }
  }

  return {
    handleCancelOrder,
    cancelOrderLoading
  }
}
