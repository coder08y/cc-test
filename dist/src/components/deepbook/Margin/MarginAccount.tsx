import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import useDeepBookMarginManager from '@/hooks/deepbook/margin/useDeepBookMarginManager'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { useMemo } from 'react'
import AssetsInfo from '../AssetsInfo'
import BalanceManagerSelector from '../BalanceManagerSelector'
import MarginHealthBlock from './MarginHealthBlock'

export default function MarginAccount() {
  const { currentDeepBookPool, openAssetsActionModal } = useDeepBookStore()
  const { getMarginManagerByAccount } = useDeepBookMarginManager()
  const { currentAccount, onWalletModal } = useAccountStore()

  const [activeTab, setActiveTab] = useState<'Margin Exposure' | 'Asset'>('Asset')

  const { isApp } = useWindowWidth()
  const { marginManagerByAccount } = useMarginStore()

  // 获取 margin manager
  useEffect(() => {
    if (currentDeepBookPool?.address && currentDeepBookPool?.isMarginPool) {
      getMarginManagerByAccount()
    }
  }, [currentDeepBookPool, getMarginManagerByAccount, currentAccount?.address])

  // 检查是否为初始状态（没有 margin manager）
  const isInitialState = useMemo(() => {
    if (!currentDeepBookPool?.address || !marginManagerByAccount) {
      return true
    }
    return !marginManagerByAccount.some((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
  }, [currentDeepBookPool?.address, marginManagerByAccount])

  const renderInitialState = () => {
    return (
      <VStack pt="44px" gap="12px">
        <Text fontSize="14px" lineHeight="18px" fontWeight="500" color={'primary'}>
          Start Trading
        </Text>
        <Text fontSize="12px" lineHeight="16px" fontWeight="500" color={'text_caption'}>
          Deposit collateral to start margin trading
        </Text>
        <Button
          onClick={() => {
            if (!currentAccount?.address) {
              onWalletModal(true)
              return
            }
            openAssetsActionModal('Initialize & Deposit Collateral', currentDeepBookPool?.quoteAssets)
          }}
          bg="primary_opacity.10"
          rounded="6px"
          w="76px"
          h="28px"
          _hover={{ bg: !currentAccount?.address ? 'primary_disabled !important' : 'primary_opacity.20' }}
          justifyContent="center"
          alignItems="center"
          // disabled={!currentAccount?.address}
        >
          <Text fontSize="12px" lineHeight="16px" fontWeight="500" color="primary">
            Deposit
          </Text>
        </Button>
      </VStack>
    )
  }

  return (
    <VStack h="100%" gap="0" w="100%" align="flex-start" bg={{ base: 'transparent', lg: 'bg_secondary' }} borderRadius={{ base: '0', lg: '8px' }}>
      <Box w="100%" p="12px 0 0" flexShrink={0}>
        {!isApp && (
          <HStack w="100%" borderBottom="1px solid" borderColor="border" pb="12px">
            <HStack w="100%" justifyContent={'space-between'} alignItems={'center'} px="12px">
              <Text fontSize="14px" color="text_caption">
                Margin Account
              </Text>
              <HStack>
                <BalanceManagerSelector isMarginPool={currentDeepBookPool?.isMarginPool} />
              </HStack>
            </HStack>
          </HStack>
        )}
        <HStack p={{ base: '12px 0', lg: '12px 10px 0px 12px' }} justifyContent="space-between" alignItems="center">
          {/* <HStack gap="4px">
            <TabItem active={activeTab === 'Margin Exposure'} onClick={() => setActiveTab('Margin Exposure')}>
              Margin Exposure
            </TabItem>
            <TabItem active={activeTab === 'Asset'} onClick={() => setActiveTab('Asset')}>
              Asset
            </TabItem>
          </HStack> */}
          {isApp && <BalanceManagerSelector isMarginPool={currentDeepBookPool?.isMarginPool} />}
        </HStack>
      </Box>
      <Box p="12px" w="100%" flex="1" minH="0" overflowY="auto" display={activeTab === 'Margin Exposure' ? 'block' : 'none'}>
        {isInitialState ? renderInitialState() : <MarginHealthBlock />}
      </Box>
      <Box pt="12px" w="100%" flex="1" minH="0" display={activeTab === 'Asset' ? 'block' : 'none'} sx={{ ...(isApp && { '&>div>div': { p: 0 } }) }}>
        {isInitialState ? renderInitialState() : <AssetsInfo hideHeader maxH="100%" />}
      </Box>
    </VStack>
  )
}
