import { useSdk } from '@cetus/sdk-factory'
import { WithdrawDcaParams } from '@cetusprotocol/dca-sdk'

export default function () {
  const dcaSdk = useSdk('dca')

  const dcaWithdrawPayload = async (params: WithdrawDcaParams[]) => {
    console.log('🚀🚀🚀 ~ file: useDcaClaim.ts:12 ~ params:', params)
    const tx = await dcaSdk!.Dca.withdrawAll(params)
    return tx
  }
  return { dcaWithdrawPayload }
}
