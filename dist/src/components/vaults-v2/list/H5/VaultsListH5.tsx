import { VaultsV2ListProps } from '@/types/vaults-v2'
import { useAccountStore } from '@cetus/stores'
import { NoData } from '@cetus/ui-kit'
import { HStack, Skeleton, SkeletonCircle, VStack } from '@chakra-ui/react'
import VaultsListItem from '../VaultsListItem'

function VaultsListH5({ dataList, showSkeletonLoading, showNoWallet, isShowPowered, currentStatus }: VaultsV2ListProps) {
  const { onWalletModal } = useAccountStore()
  if (!showNoWallet && !showSkeletonLoading && dataList.length === 0) {
    return <NoData type="nodata" text="No vaults found" border="none" />
  }
  if (showNoWallet) {
    return <NoData type="nowallet" onboard={() => onWalletModal(true)} border="none" />
  }
  if (showSkeletonLoading) {
    return <SkeletonViewH5 itemList={[1, 2, 3]} />
  }
  return (
    <VStack w="100%" mt="20px">
      {dataList?.map(item => (
        <VaultsListItem key={item.vaultId} apiInfo={item} isShowPowered={isShowPowered && item.category == 'haedal'} currentStatus={currentStatus} />
      ))}
    </VStack>
  )
}

function SkeletonViewH5({ itemList }: { itemList: number[] }) {
  return (
    <VStack w="100%" mt="20px">
      {itemList.map(item => {
        return (
          <VStack w="100%" key={item} align="flex-start" border="1px solid" borderColor="border" p="8px" borderRadius="12px" gap="16px">
            <HStack gap="0">
              <SkeletonCircle size="9" />
              <SkeletonCircle size="9" />
              <HStack gap="4px" ml="4px" align="flex-start">
                <Skeleton height="4" width="100px" />
                <Skeleton height="4" width="60px" />
              </HStack>
            </HStack>
            <VStack w="100%" gap="16px" mt="4px">
              {[1, 2, 3, 4].map(line => (
                <HStack key={line} w="100%" justify="space-between">
                  <Skeleton height="4" width="100px" />
                  <Skeleton height="4" width="100px" />
                </HStack>
              ))}
            </VStack>
            <VStack w="100%" gap="8px">
              <Skeleton height="8" width="100%" />
              <Skeleton height="8" width="100%" />
            </VStack>
          </VStack>
        )
      })}
    </VStack>
  )
}

export default VaultsListH5
