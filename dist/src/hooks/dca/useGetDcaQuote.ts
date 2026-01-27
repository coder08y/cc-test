import { DcaQuotePath } from '@/apis/path'
import useDcaStore from '@/store/dca'
import { DcaQuoteData } from '@/types'
import { useFetch } from '@cetus/hooks'

export default function useDcaGetQuote() {
  const { fetchByApi } = useFetch()
  const { setDcaQuote } = useDcaStore()
  const getDcaQuote = async ({
    inCoin,
    freq,
    count,
    sender
  }: {
    inCoin: string
    freq: string | number
    count: string | number
    sender: string
  }): Promise<DcaQuoteData | null> => {
    try {
      const data = await fetchByApi(DcaQuotePath, 'GET', {
        in_coin: inCoin,
        freq,
        count,
        sender
      })
      if (data) {
        const result = {
          amountInLimitPerCycle: data?.amount_in_limit_per_cycle,
          coinType: data?.coin_type,
          feeRate: data?.fee_rate,
          signature: data?.signature,
          signer: data?.signer,
          timestamp: data?.timestamp
        }
        setDcaQuote(result)
        return result
      }
    } catch (error) {
      console.log('getDcaQuote ~ error:', error)
    }

    return null
  }

  return {
    getDcaQuote
  }
}
