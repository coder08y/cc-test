import PoolsContent from '@/components/pools/PoolsContent'
import PoolsTopData from '@/components/pools/PoolsTopData'
import DLMMPools from '@/components/pools/dlmmPools'
import PositionsContent from '@/components/position/common/PositionsContent'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

function Pools() {
  const { tab } = useQueryParams()
  const [isRefreshed, setIsRefreshed] = useState(true)
  const { isApp } = useWindowWidth()
  // 定时刷新相关状态
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isPaginationLoadingRef = useRef(false)
  const currentTabRef = useRef<string>(tab || 'clmm_pools')

  const REFRESH_INTERVAL = 20000
  const REFRESH_DELAY = 2000

  const refreshHandlersRef = useRef<{
    topData?: () => Promise<void>
    clmm?: () => Promise<void>
    dlmm?: () => Promise<void>
    positions?: () => Promise<void>
  }>({})

  const registerRefreshHandler = (tabName: string, handler: () => Promise<void>) => {
    if (tabName === 'clmm_pools' || !tabName) {
      refreshHandlersRef.current.clmm = handler
    } else if (tabName === 'dlmm_pools') {
      refreshHandlersRef.current.dlmm = handler
    } else if (tabName === 'positions') {
      refreshHandlersRef.current.positions = handler
    }
  }

  const handleIsRefreshed = (isRefreshed: boolean) => {
    setIsRefreshed(isRefreshed)
  }

  const startAutoRefresh = () => {
    if (autoRefreshTimerRef.current) {
      clearTimeout(autoRefreshTimerRef.current)
      autoRefreshTimerRef.current = null
    }

    const performRefresh = async () => {
      if (isPaginationLoadingRef.current) {
        autoRefreshTimerRef.current = setTimeout(performRefresh, REFRESH_DELAY)
        return
      }

      if (refreshHandlersRef.current.topData) {
        try {
          await refreshHandlersRef.current.topData()
        } catch (error) {
          console.error('Auto refresh top data error:', error)
        }
      }

      const currentTab = currentTabRef.current
      const handler =
        currentTab === 'clmm_pools' || !currentTab
          ? refreshHandlersRef.current.clmm
          : currentTab === 'dlmm_pools'
            ? refreshHandlersRef.current.dlmm
            : refreshHandlersRef.current.positions

      if (handler) {
        try {
          await handler()
        } catch (error) {
          console.error('Auto refresh error:', error)
        }
      }

      autoRefreshTimerRef.current = setTimeout(performRefresh, REFRESH_INTERVAL)
    }

    autoRefreshTimerRef.current = setTimeout(performRefresh, REFRESH_INTERVAL)
  }

  const resetAutoRefresh = () => {
    if (autoRefreshTimerRef.current) {
      clearTimeout(autoRefreshTimerRef.current)
      autoRefreshTimerRef.current = null
    }
    startAutoRefresh()
  }

  const setPaginationLoading = (loading: boolean) => {
    isPaginationLoadingRef.current = loading
  }

  useEffect(() => {
    currentTabRef.current = tab || 'clmm_pools'
    resetAutoRefresh()
  }, [tab])

  useEffect(() => {
    startAutoRefresh()
    return () => {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current)
        autoRefreshTimerRef.current = null
      }
    }
  }, [])

  const handleManualRefresh = () => {
    resetAutoRefresh()
    handleIsRefreshed(false)
  }

  return (
    <VStack gap={{ base: '0', lg: '16px' }} w="100%" pt={isApp ? '16px' : '40px'}>
      <PoolsTopData
        isRefreshed={isRefreshed}
        onRefreshHandlerRegistered={(handler: () => Promise<void>) => {
          const topDataHandler = async () => {
            await handler()
          }
          refreshHandlersRef.current.topData = topDataHandler
        }}
      />
      {(tab == 'clmm_pools' || tab === undefined) && (
        <PoolsContent
          isRefreshed={isRefreshed}
          handleIsRefreshed={handleIsRefreshed}
          onRefreshHandlerRegistered={(handler: () => Promise<void>) => registerRefreshHandler('clmm_pools', handler)}
          onManualRefresh={handleManualRefresh}
          setPaginationLoading={setPaginationLoading}
        />
      )}
      {tab == 'dlmm_pools' && (
        <DLMMPools
          isRefreshed={isRefreshed}
          handleIsRefreshed={handleIsRefreshed}
          onRefreshHandlerRegistered={(handler: () => Promise<void>) => registerRefreshHandler('dlmm_pools', handler)}
          onManualRefresh={handleManualRefresh}
          setPaginationLoading={setPaginationLoading}
        />
      )}
      {tab == 'positions' && (
        <PositionsContent
          isRefreshed={isRefreshed}
          handleIsRefreshed={handleIsRefreshed}
          onRefreshHandlerRegistered={(handler: () => Promise<void>) => registerRefreshHandler('positions', handler)}
          onManualRefresh={handleManualRefresh}
          setPaginationLoading={setPaginationLoading}
        />
      )}
    </VStack>
  )
}

export default Pools
