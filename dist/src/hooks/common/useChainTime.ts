import useGlobalStore from '@/store/common/global'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetus/utils'
import { CLOCK_ADDRESS, getObjectFields } from '@cetusprotocol/common-sdk'

export function useChainTime() {
  const clmmSdk = useSdk('clmm')
  const { userTimeHasChang } = useGlobalStore()

  const fetchChainTime = async () => {
    if (!clmmSdk) {
      return undefined
    }
    try {
      const res = await clmmSdk.FullClient.getObject({ id: CLOCK_ADDRESS, options: { showContent: true } })
      const filed = getObjectFields(res)
      console.log('🚀 ~ fetchCHainTime ~ filed:', filed)

      return Number(filed.timestamp_ms)
    } catch (error) {
      console.log('🚀 ~ fetchCHainTime ~ error:', error)
    }
    return undefined
  }

  /**
   * 计算网络时间和本地时间偏差
   */
  const calculateTimeDiff = async () => {
    const chainTime = await fetchChainTime()
    if (chainTime) {
      const now = new Date()
      const diffTime = chainTime - now.getTime()
      return diffTime
    }
    return 0
  }

  const getCountDown = async (expired_at: number) => {
    if (!expired_at || expired_at === 0) {
      return 0
    }
    const now = new Date()

    let difference = 0
    let nowTime = now.getTime()

    if (userTimeHasChang) {
      nowTime = (await fetchChainTime()) || now.getTime()
      difference = expired_at * 1000 - nowTime
    } else {
      difference = expired_at * 1000 - now.getTime()
    }

    const rawDuration = Math.floor((difference / 1000) % 60)
    const duration = rawDuration > 30 ? 30 : rawDuration
    console.log('🚀 ~ getCountDown ~ timeDiff:', { userTimeHasChang, difference, duration, expired_at, nowTime })
    return duration
  }

  /**
   * 获取准确的时间，如果本地时间和链上时间偏差大于5秒则用链上时间
   */
  const getAccurateTime = async () => {
    try {
      const chainTime = await fetchChainTime()
      const localTime = new Date().getTime()

      if (chainTime) {
        const diffTime = chainTime - localTime
        if (
          d(diffTime)
            .abs()
            .gt(5 * 1000)
        ) {
          return chainTime
        }
      }
      return localTime
    } catch (error) {
      return new Date().getTime()
    }
  }

  return {
    fetchChainTime,
    calculateTimeDiff,
    getCountDown,
    getAccurateTime
  }
}
