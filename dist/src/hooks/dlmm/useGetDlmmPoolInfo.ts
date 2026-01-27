import { DLMMPoolsInfoPath } from '@/apis/path'
import useDlmmLiquidityStore from '@/store/dlmm'
import { useFetch } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { camelCaseObject } from '@cetus/utils'
import useGetDlmmContractPoolInfo from './useGetDlmmContractPoolInfo'

function useGetDlmmPoolInfo() {
  const { fetchByApi } = useFetch()
  const { getDlmmContractPoolInfo } = useGetDlmmContractPoolInfo()
  const { dlmmContractPoolInfo, setDlmmContractPoolInfo, setDlmmContractPoolInfoLoading, dlmmApiPoolInfo, setDlmmApiPoolInfoLoading } =
    useDlmmLiquidityStore()
  const { fetchTokenInfo } = useGetToken()
  const getDlmmInfo = async (poolId: string) => {
    try {
      setDlmmApiPoolInfoLoading(true)
      const res = await fetchByApi(DLMMPoolsInfoPath, 'POST', {
        pools: [poolId]
      })
      console.log(res, 'useGetDlmmPoolInfo getDlmmInfo')
      if (res && res?.data && res?.data?.list && res?.data?.list.length > 0) {
        const result = camelCaseObject(res?.data?.list?.[0])
        console.log(result, 'getDlmmInfo-result')
        return result
      }
      setDlmmApiPoolInfoLoading(false)
    } catch (error) {
      console.log('useGetDlmmPoolInfo error 1', error)
      try {
        await getDlmmContractPoolInfo(poolId)
      } catch (error) {}
      console.log('useGetDlmmPoolInfo error 2', error)
    }
  }
  return { getDlmmInfo }
}

export default useGetDlmmPoolInfo
