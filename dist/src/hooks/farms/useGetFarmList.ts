import useGetPoolList from '@/hooks/pool/useGetPoolList'

export default function useGetFarmList() {
  const { getPoolList } = useGetPoolList()

  const getFarmList = async (orderBy: '-apr' | '-tvl' | 'apr' | 'tvl' = '-tvl') => {
    const res = await getPoolList({
      is_vaults: false,
      display_all_pools: false,
      has_mining: false,
      has_farming: true,
      no_incentives: false,
      order_by: '-vol',
      limit: 100,
      offset: 0
    })
    console.log('🚀 ~ getFarmList ~ res:', res)

    return res?.list?.sort((a: any, b: any) => {
      if (orderBy === '-apr') {
        return b.feeAndFarmsApr - a.feeAndFarmsApr
      } else if (orderBy === 'apr') {
        return a.feeAndFarmsApr - b.feeAndFarmsApr
      } else if (orderBy === '-tvl') {
        return b.farmsStatedTvl - a.farmsStatedTvl
      } else {
        return a.farmsStatedTvl - b.farmsStatedTvl
      }
    })
  }

  return {
    getFarmList
  }
}
