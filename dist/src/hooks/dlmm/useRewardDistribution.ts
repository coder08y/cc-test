import { DLMMStatsRewardPath } from '@/apis/path'
import useDlmmLiquidityStore from '@/store/dlmm'
import { useFetch, useRpcListener } from '@cetus/hooks'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type RewardType = 'active' | 'upcoming' | 'expired'

export enum RewardTabEnum {
  active = 'Active',
  upcoming = 'Upcoming',
  expired = 'Ended'
}

export type RewardDistributionType = {
  amount: string
  coin: {
    decimals: number
    description: string
    iconUrl: string
    id: string
    name: string
    symbol: string
  }
  end_timestamp: number
  start_timestamp: number
}

function useRewardDistribution() {
  const navigate = useNavigate()
  const { dlmmApiPoolInfo } = useDlmmLiquidityStore()
  const [currentType, setCurrentType] = useState<RewardType>('active')
  const [isLoading, setIsLoading] = useState(true)
  const [rewardList, setRewardList] = useState<RewardDistributionType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const pageSize = 5
  const [total, setTotal] = useState(0)
  const { fetchByApi } = useFetch()
  const typeList = [
    {
      label: RewardTabEnum.active,
      key: 'active'
    },
    {
      label: RewardTabEnum.upcoming,
      key: 'upcoming'
    },
    {
      label: RewardTabEnum.expired,
      key: 'expired'
    }
  ]

  const onJumpAddIncentive = () => {
    navigate(`/incentive?poolAddress=${dlmmApiPoolInfo?.poolAddress}`)
  }

  const handleTypeChange = (type: (typeof typeList)[0]) => {
    console.log(type, 'handleTypeChange')
    setCurrentType(type?.key as RewardType)
    setCurrentPage(1)
    setTotal(0)
  }

  const handleChangePage = (page: number) => {
    setCurrentPage(page)
  }

  const fetchRewardList = async (poolAddress: string, type: RewardType) => {
    setIsLoading(true)
    try {
      const result = await fetchByApi(DLMMStatsRewardPath, 'GET', {
        pool: poolAddress,
        type
      })
      if (result) {
        setRewardList(result?.list)
        setTotal(result?.list?.length)
        setIsLoading(false)
        return result?.list
      }
      console.log(result, 'result')
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }

  const firstFetch = async () => {
    setIsLoading(true)
    try {
      const activeResult = await fetchRewardList(dlmmApiPoolInfo?.poolAddress || '', 'active')
      if (activeResult && activeResult?.length > 0) {
        setCurrentType('active')
        setIsInitialized(true)
        setIsLoading(false)
        return
      }
      const upcomingResult = await fetchRewardList(dlmmApiPoolInfo?.poolAddress || '', 'upcoming')
      if (upcomingResult && upcomingResult?.length > 0) {
        setCurrentType('upcoming')
        setIsInitialized(true)
        setIsLoading(false)
        return
      }
      const expiredResult = await fetchRewardList(dlmmApiPoolInfo?.poolAddress || '', 'expired')
      if (expiredResult && expiredResult?.length > 0) {
        setCurrentType('expired')
        setIsInitialized(true)
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    firstFetch()
  }, [])

  useEffect(() => {
    console.log(isInitialized, 'isInitialized')
    if (isInitialized) {
      fetchRewardList(dlmmApiPoolInfo?.poolAddress || '', currentType)
    }
  }, [dlmmApiPoolInfo?.poolAddress, currentType])

  useRpcListener({
    onRpcChange: () => {
      fetchRewardList(dlmmApiPoolInfo?.poolAddress || '', currentType)
    }
  })

  return {
    onJumpAddIncentive,
    currentType,
    typeList,
    handleTypeChange,
    handleChangePage,
    total,
    isLoading,
    rewardList,
    pageSize,
    currentPage
  }
}

export default useRewardDistribution
