import { generateRewardSchedule } from '@cetusprotocol/dlmm-sdk'

export const REWARD_PERIOD = 7 * 24 * 60 * 60 * 1000
interface timeOptionsParams {
  maxIntervals: number
  baseTime?: number
  timeInterval?: number
}
function useGetIncentiveTimeOptions() {
  const getIncentiveTimeOptions = async ({ maxIntervals, baseTime = new Date().getTime(), timeInterval = REWARD_PERIOD }: timeOptionsParams) => {
    const now = new Date()
    const twoDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2, 12, 0, 0, 0))
    const REWARD_PERIOD_START_AT = Math.floor(twoDaysAgo.getTime() / 1000)
    const endTime = baseTime + maxIntervals * timeInterval
    const _maxIntervals = Math.floor((endTime - REWARD_PERIOD_START_AT * 1000) / timeInterval)
    try {
      const res = await generateRewardSchedule(REWARD_PERIOD_START_AT, _maxIntervals, timeInterval)
      console.log('🚀 ~ getIncentiveTimeOptions ~ res:', res)
      return res
    } catch (error) {
      console.error('getDlmmContractPoolInfo error:', error)
    } finally {
    }
  }

  return { getIncentiveTimeOptions }
}
export default useGetIncentiveTimeOptions
