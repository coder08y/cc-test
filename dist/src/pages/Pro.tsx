import ProCoinList from '@/components/pro/ProCoinList'
import ProTopBlock from '@/components/pro/ProTopBlock'
import useProListStore from '@/store/pro/list'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export type porListType = {
  label: 'Liquidity' | 'Volume (24H)' | 'Price/% Δ'
  value: 'liquidity' | 'volume' | 'change'
}

function Pro() {
  const [refreshInfo, setRefreshInfo] = useState<any>({
    refreshTrigger: 0,
    isAuto: false
  })
  const { isShowTokenRickModal, setIsOpenProTokenRiskModal, setIsRefreshing, isTopProgressLoading } = useProListStore()

  const { isApp } = useWindowWidth()
  const handleRefresh = (isAuto = true) => {
    // 只有手动刷新才重置刷新状态，自动刷新保持无感知更新
    if (!isAuto) {
      setIsRefreshing(false) // 重置刷新状态，RefreshButton 会开始显示加载动画
    }
    setRefreshInfo((prev: any) => ({
      refreshTrigger: prev?.refreshTrigger + 1,
      isAuto
    }))
  }

  // 1分钟自动刷新
  useEffect(() => {
    if (isShowTokenRickModal) {
      setIsOpenProTokenRiskModal(true)
    }
    const intervalId = setInterval(() => {
      handleRefresh()
    }, 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <VStack w="100%" gap="0px" position="relative">
      <Box borderTop="1px solid" borderColor={isApp ? 'transparent' : 'border'} w={{ base: '100%', lg: '1160px' }} margin="auto" pb="16px">
        <ProTopBlock handleRefresh={() => handleRefresh(false)} isApp={isApp} />
      </Box>
      <ProCoinList refreshInfo={refreshInfo} />
    </VStack>
  )
}

export default Pro
