import useCompensationStore from '@/store/compensation'
import { useSdk } from '@cetus/sdk-factory'
import { ClmmVestInfo, GlobalVestingPeriod } from '@cetusprotocol/sui-clmm-sdk'

export default function useGetClmmVestInfo() {
  const clmmSdk = useSdk('clmm')
  const { setClmmVestInfo } = useCompensationStore()
  const getClmmVestInfo = async (): Promise<ClmmVestInfo | undefined> => {
    try {
      const res = await clmmSdk?.Vest.getClmmVestInfo()
      console.log('🚀🚀🚀 ~ useGetClmmVestInfo.ts:11 ~ getClmmVestInfo ~ res:', res)
      if (res) {
        const globalVestingPeriods = res.global_vesting_periods.map((itemPeriod: GlobalVestingPeriod) => {
          return {
            period: itemPeriod.period,
            releaseTime: itemPeriod.release_time,
            redeemedAmount: itemPeriod.redeemed_amount,
            percentage: itemPeriod.percentage
          }
        })
        const result = {
          ...res,
          globalVestingPeriods
        }
        setClmmVestInfo(result)
        return result
      }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetClmmVestInfo.ts:28 ~ getClmmVestInfo ~ error:', error)
    }
  }
  return { getClmmVestInfo }
}
