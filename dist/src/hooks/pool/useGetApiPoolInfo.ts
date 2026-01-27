import useGetPoolList from '@/hooks/pool/useGetPoolList'
import useLiquidityStore from '@/store/clmm'
import { PoolApiInfo } from '@/types'

export default function useGetApiPoolInfo() {
  const { getPoolList } = useGetPoolList()
  const { setApiPoolInfo, setApiPoolInfoLoading } = useLiquidityStore()

  // 根据池子地址获取api池子详情
  const getApiPoolInfo = async (pool: string): Promise<PoolApiInfo | null> => {
    setApiPoolInfoLoading(true)
    const res: any = await getPoolList({
      is_vaults: false,
      display_all_pools: true,
      has_mining: true,
      has_farming: true,
      no_incentives: true,
      order_by: '-vol',
      pool
    })
    console.log('getApiPoolInfo ~ res:', res)

    setApiPoolInfo(res?.list?.[0] || null)
    return res?.list?.[0] || null
  }

  // 获取指定coinA, coinB的所有池子，主要用在feetier下拉框占比计算等(两个coin用逗号分隔)
  const getCoinABApiPools = async (coinType: string): Promise<PoolApiInfo[]> => {
    const res: any = await getPoolList({
      is_vaults: false,
      display_all_pools: true,
      has_mining: true,
      has_farming: true,
      no_incentives: true,
      order_by: '-vol',
      coin_type: coinType
    })

    return res || []
  }

  return {
    getApiPoolInfo,
    getCoinABApiPools
  }
}
