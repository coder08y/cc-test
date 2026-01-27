import useVaultsPythPriceStore from '@/store/vaults-v2/useVaultsPythPrice'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { suiAddressShortToLong } from '@cetus/utils'

export default function useGetPythLastPrice() {
  const { volatileVaultsSdk } = usePeripherySDKStore()
  const { setPythPriceMap } = useVaultsPythPriceStore()
  const getPythLastPrice = async (coinType: string[], category: string) => {
    const list = coinType.map(item => {
      return suiAddressShortToLong(item)
    })
    try {
      let pythPriceMap
      if (category === 'haedal') {
        pythPriceMap = await volatileVaultsSdk.Vaults.PythPrice.getLatestPrice(list)
      } else if (category === 'haevault_v2') {
        pythPriceMap = await volatileVaultsSdk.VaultsV2.PythPrice.getLatestPrice(list)
      }
      console.log('🚀🚀🚀 ~ useGetPythLastPrice.ts:18 ~ getPythLastPrice ~ pythPriceMap:', pythPriceMap)
      setPythPriceMap(pythPriceMap || {})
      return pythPriceMap
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetPythLastPrice.ts:16 ~ getPythLastPrice ~ error:', error)
    }
  }
  return { getPythLastPrice }
}
