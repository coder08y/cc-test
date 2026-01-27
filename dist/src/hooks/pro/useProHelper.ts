import useProStore from '@/store/pro'
import useProListStore from '@/store/pro/list'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useNavigate } from 'react-router-dom'

export default function useProHelper() {
  const { isProMode, setIsProMode, resetProAllData } = useProStore()
  const { quickBuyCoinList } = useProListStore()
  const navigate = useNavigate()
  const goToken = (from: string, to: string) => {
    resetProAllData()
    if (!isProMode) {
      setIsProMode(true)
    }
    if (fixCoinType(from) == fixCoinType(to)) {
      const fromCoin =
        fixCoinType(to) === fixCoinType(quickBuyCoinList?.[0]?.coin_type) ? quickBuyCoinList?.[1]?.coin_type : quickBuyCoinList?.[0]?.coin_type
      navigate(`/swap/${fromCoin}/${to}?from=pro`)
      return
    }

    navigate(`/swap/${from}/${to}?from=pro`)
  }

  const getVolumeMin = (volumeMin: any, dateType: string) => {
    let volume_min = volumeMin
    if (!volume_min) {
      switch (dateType) {
        case 'hour24':
          volume_min = '10000'
          break
        case 'hour4':
          volume_min = '2000'
          break
        case 'hour1':
          volume_min = '500'
          break
        case 'm30':
          volume_min = '200'
          break
      }
    }
    return volume_min
  }
  return {
    goToken,
    getVolumeMin
  }
}
