import useGlobalStore from '@/store/common/global'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { useCallback, useMemo } from 'react'
import useStatsTokens from '../stats/useStatsTokens'

export default function useIsSupportZap(coinTypeA?: string, coinTypeB?: string) {
  const { getAllStatesTokens } = useStatsTokens()
  const { setIsSupportZap: setIsSupportZapStore, getIsSupportZap, supportZapMap } = useGlobalStore()

  const fetchIsSupportZap = async (coinTypeA: string, coinTypeB: string) => {
    const coinTypeAFixed = fixCoinType(coinTypeA, false)
    const coinTypeBFixed = fixCoinType(coinTypeB, false)
    getAllStatesTokens({
      coinTypes: [coinTypeAFixed, coinTypeBFixed]
    }).then(res => {
      const list = res?.data || []
      console.log('🚀 ~ useEffect ~ res:', list)
      if (list.length > 1) {
        const isSupportZap = list.every((item: any) => d(item.totalTvl).gt(10000))
        console.log('🚀 ~ useEffect ~ res:', isSupportZap)
        setIsSupportZapStore(coinTypeAFixed, coinTypeBFixed, isSupportZap)
      }
    })
  }

  const isSupportZap = useMemo(() => {
    if (coinTypeA && coinTypeB) {
      const coinTypeAFixed = fixCoinType(coinTypeA, false)
      const coinTypeBFixed = fixCoinType(coinTypeB, false)
      return getIsSupportZap(coinTypeAFixed, coinTypeBFixed)
    }
    return false
  }, [coinTypeA, coinTypeB, supportZapMap])

  return {
    isSupportZap,
    fetchIsSupportZap
  }
}
