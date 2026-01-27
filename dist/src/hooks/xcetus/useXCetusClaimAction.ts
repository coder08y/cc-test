import useTransaction from '@/hooks/common/useTransaction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { MsafeTransactionSubType } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { RedeemXcetusParams } from '@cetusprotocol/xcetus-sdk'
import { useState } from 'react'
import { useGetOwnerVeNFT } from './useXCetusHelper'

export default function useXCetusClaimAction() {
  const { fetchAccountBalance } = useAccountBalance()
  const { signAndExecuteTransaction } = useTransaction()
  const xCetusSdk = useSdk('xcetus')
  const { veNFT } = useXCetusStore()
  const { fetchOwnerVeNFT } = useGetOwnerVeNFT()
  const { currentAccount } = useAccountStore()
  const [claimOrderLoading, setClaimOrderLoading] = useState<boolean>(false)

  const handleClaimOrder = async (lock_id: string) => {
    setClaimOrderLoading(true)

    if (!veNFT) {
      return
    }

    const params: RedeemXcetusParams = {
      lock_id,
      venft_id: veNFT.id
    }

    const txb = await xCetusSdk!.XCetusModule.redeemPayload(params)

    console.log('xCetus 🚀 ~ handleClaimOrder ~ params:', params)

    const res = await signAndExecuteTransaction(
      txb,
      {},
      {
        useDevInspect: false,
        msafeParams: {
          action: MsafeTransactionSubType.xCETUSRedeem,
          txbParams: params
        }
      }
    )
    setClaimOrderLoading(false)

    if (res) {
      setTimeout(() => {
        // 刷新余额
        fetchAccountBalance()
        if (currentAccount) {
          fetchOwnerVeNFT(currentAccount?.address, true)
        }
      }, 2000)
    }
  }

  return {
    handleClaimOrder,
    claimOrderLoading
  }
}
