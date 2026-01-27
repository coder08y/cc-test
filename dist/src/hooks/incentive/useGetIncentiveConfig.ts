import useIncentiveStore from '@/store/incentive'
import { useSdk } from '@cetus/sdk-factory'

function useGetIncentiveConfig() {
  const { setPoolWhiteTokenList, setGlobalConfig } = useIncentiveStore()
  const dlmmSdk = useSdk('dlmm')

  const getDlmmWhiteTokenList = async () => {
    try {
      const res = await dlmmSdk!.Config.getDlmmGlobalConfig()
      console.log('🚀 ~ getDlmmWhiteTokenList ~ res:', res)
      // setPoolWhiteTokenList([
      //   '0x14a71d857b34677a7d57e0feb303df1adb515a37780645ab763d42ce8d1a5e48::usdc::USDC',
      //   '0x5419f6e223f18a9141e91a42286f2783eee27bf2667422c2100afc7b2296731b::nbtc::NBTC'
      // ])
      setGlobalConfig(res)
      setPoolWhiteTokenList(res?.reward_white_list)
    } catch (error) {
      console.error('getDlmmContractPoolInfo error:', error)
    } finally {
    }
  }

  return { getDlmmWhiteTokenList }
}
export default useGetIncentiveConfig
