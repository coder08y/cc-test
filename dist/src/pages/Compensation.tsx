import CompensationHaedar from '@/components/compensation/CompensationHeader'
import CompensationPosition from '@/components/compensation/CompensationPosition'
import CompensationTotalAndClaim from '@/components/compensation/CompensationTotalAndClaim'
import CompensationVault from '@/components/compensation/CompensationVault'
import useCompensationPositionPage from '@/hooks/compensation/useCompensationPositionPage'
import useCompensationVaultPage from '@/hooks/compensation/useCompensationVaultPage'
import useCompensationStore from '@/store/compensation'
import { useInterval } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { Box, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function Compensation() {
  const [currentTab, setCurrentTab] = useState('positions')
  const { currentAccount } = useAccountStore()

  const { handleGetPositionList } = useCompensationPositionPage()
  const { handleGetVaultList } = useCompensationVaultPage()
  const { setPosBaseList, setVaultPositionList } = useCompensationStore()
  useEffect(() => {
    if (currentAccount?.address) {
      setPosBaseList([])
      setVaultPositionList([])
      handleGetPositionList(currentAccount?.address)
      handleGetVaultList(currentAccount?.address)
    }
  }, [currentAccount?.address])

  const [refreshCount, setRefreshCount] = useState(20000)

  useInterval({
    interval: refreshCount,
    callback: () => {
      if (!currentAccount?.address) return

      if (currentTab == 'positions') {
        handleGetPositionList(currentAccount?.address, false)
      } else {
        handleGetVaultList(currentAccount?.address, false)
      }
    }
  })

  return (
    <VStack w="100%" gap="12px">
      <CompensationHaedar currentTab={currentTab} setCurrentTab={setCurrentTab} setRefreshCount={setRefreshCount} />
      <Box h={{ base: '204px', lg: '174px' }} />
      <VStack w={{ base: '100%', lg: '1200px' }} align="flex-start">
        {currentAccount?.address && <CompensationTotalAndClaim currentTab={currentTab} />}
        {currentTab == 'positions' && <CompensationPosition />}
        {currentTab == 'vault' && <CompensationVault />}
      </VStack>
    </VStack>
  )
}
