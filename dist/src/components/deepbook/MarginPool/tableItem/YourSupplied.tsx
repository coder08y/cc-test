import useDeepBookMarginPools from '@/hooks/deepbook/margin/useDeepbookMarginPools'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { useInterval } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function YourSupplied({ item }: { item: any }) {
  const { currentAccount } = useAccountStore()
  const { coinPriceObj } = useTokenPriceStore()

  const userInfo = useDeepBookMarginPoolStore(state => state.userInfo)
  const currentPoolInfo = userInfo[item?.objectId]

  const { getUserSupply } = useDeepBookMarginPools()

  useEffect(() => {
    getUserSupply(item, currentAccount?.address)
  }, [coinPriceObj])

  const [refreshCount, setRefreshCount] = useState<number>(0)
  useInterval({
    interval: 1000,
    callback: () => {
      setRefreshCount(refreshCount + 1)
      if (refreshCount >= 5) {
        setRefreshCount(0)
        getUserSupply(item, currentAccount?.address)
      }
    }
  })

  const { isApp } = useWindowWidth()

  return (
    <VStack align="flex-end">
      <Skeleton
        isLoaded={
          !currentAccount?.address || userInfo?.noData || (!!currentPoolInfo?.displayUserSupplied && !!currentPoolInfo?.displayUserSuppliedValue)
        }
      >
        <VStack gap={{ base: '2px', lg: '4px' }} flexDirection={{ base: 'row', lg: 'column' }} align={{ base: 'center', lg: 'flex-end' }}>
          <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }} lineHeight="14px">
            {!currentAccount?.address ? '-' : (currentPoolInfo?.displayUserSupplied ?? '0')} {!currentAccount?.address ? '' : item?.tokenInfo?.symbol}
          </Text>
          {isApp && (
            <Text fontSize="12px" lineHeight="12px" color="primary_gray">
              (
            </Text>
          )}
          <Text fontSize="12px" lineHeight="12px" color="primary_gray">
            {!currentAccount?.address ? '-' : (currentPoolInfo?.displayUserSuppliedValue ?? '$0')}
          </Text>
          {isApp && (
            <Text fontSize="12px" lineHeight="12px" color="primary_gray">
              )
            </Text>
          )}
        </VStack>
      </Skeleton>
    </VStack>
  )
}
