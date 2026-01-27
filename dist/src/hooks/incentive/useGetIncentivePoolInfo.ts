import useIncentiveStore from '@/store/incentive'
import { useSdk } from '@cetus/sdk-factory'
import { camelCaseObject } from '@cetus/utils'
import useGetDlmmContractPoolInfo from '../dlmm/useGetDlmmContractPoolInfo'
import useGetDlmmPools from '../pool/useGetDlmmPools'

function useGetIncentivePoolInfo() {
  const dlmmSdk = useSdk('dlmm')
  const { formatDlmmApiPoolByContractPool } = useGetDlmmContractPoolInfo()
  const { getDlmmPools } = useGetDlmmPools()
  const { setIncentiveApiPoolInfo, setIncentiveContractPoolInfo } = useIncentiveStore()

  const getIncentivePoolInfo = async (poolAddress: string) => {
    if (!poolAddress) return

    let apiPoolInfo: any = undefined

    try {
      const res = await getDlmmPools({ pools: [poolAddress], display_all_pools: true })
      apiPoolInfo = res?.list?.[0]

      if (apiPoolInfo) {
        setIncentiveApiPoolInfo(apiPoolInfo)
      }
    } catch (error) {
      console.error('getIncentivePoolInfo error:', error)
    }

    await fetchContractPoolInfo(poolAddress, apiPoolInfo)
  }

  const fetchContractPoolInfo = async (poolAddress: string, apiPoolInfo?: any) => {
    if (!poolAddress) return

    try {
      const res = await dlmmSdk!.Pool.getPool(poolAddress)
      const contractPool = { ...res, ...camelCaseObject(res), poolAddress: res?.id }
      console.log('🚀 ~ fetchContractPoolInfo ~ contractPool:', poolAddress, apiPoolInfo, contractPool)

      if (contractPool) {
        setIncentiveContractPoolInfo(contractPool as any)

        // fallback: 如果 API 返回的数据缺失，尝试通过合约数据反推格式化信息
        if (!apiPoolInfo?.displayTokenA) {
          const formattedApiPool = await formatDlmmApiPoolByContractPool(contractPool)
          if (formattedApiPool) {
            setIncentiveApiPoolInfo(formattedApiPool as any)
          }
        }
      }
    } catch (error) {
      console.error('fetchContractPoolInfo error:', error)
    }
  }

  return { getIncentivePoolInfo }
}

export default useGetIncentivePoolInfo
