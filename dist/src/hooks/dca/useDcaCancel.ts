import { useSdk } from '@cetus/sdk-factory'
import { CloseDcaOrderParams } from '@cetusprotocol/dca-sdk'

export default function () {
  const dcaSdk = useSdk('dca')

  const dcaCloseOrderPayload = async (params: Array<CloseDcaOrderParams>) => {
    const tx = await dcaSdk!.Dca.dcaCloseOrderPayload(params)
    return tx
  }
  return { dcaCloseOrderPayload }
}
