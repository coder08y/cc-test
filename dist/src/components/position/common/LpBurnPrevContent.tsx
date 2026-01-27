import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { Block } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { NoData } from '@cetus/ui-kit'
import { Box, Button, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import ModalItem from './ModalItem'

export default function LpBurnPrevContent({
  onClose,
  onClickLock,
  currentLockItem,
  onClickCheckBox
}: {
  onClickLock: () => void
  onClose: () => void
  currentLockItem: PosBaseInfo
  onClickCheckBox: (item: PosBaseInfo) => void
}) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { fullRangePosBaseList, fullRangePosBaseListLoading } = usePositionStore()

  return (
    <VStack w="100%" gap="20px" maxH={{ base: '80vh', lg: 'unset' }} overflow="auto">
      <VStack w="100%" align="flex-start" gap="20px">
        <Text color="primary_gray" textAlign="left" lineHeight="20px">
          Token teams can permanently lock liquidity. The NFT representing your position is sent to a locked token account. Trading fees and mining
          rewards earned will still be claimable.
        </Text>
        <Text color="primary_gray" textAlign="left" lineHeight="20px">
          To start, select a liquidity position below to lock. Ensure that position value and NFT mint match the position you want to lock!
        </Text>
        <Text color="primary_gray" textAlign="left" lineHeight="20px">
          Note: Technically, your NFT is not burned but permanently locked.
        </Text>
      </VStack>
      <VStack w="100%" gap="16px" maxH="320px" overflow="auto">
        {!currentAccount?.address ? (
          <NoData type="nowallet" onboard={() => onWalletModal(true)} bg="none" border="none" />
        ) : fullRangePosBaseListLoading ? (
          [{}, {}]?.map((item: any, index) => {
            return <LpBurnLoading key={index} />
          })
        ) : fullRangePosBaseList?.length > 0 ? (
          fullRangePosBaseList?.map((item: any) => {
            return (
              <ModalItem
                key={item?.posId}
                posInfo={item}
                checked={item?.posId == currentLockItem?.posId}
                onClickCheckBox={item => onClickCheckBox(item)}
                pageFrom="lpBurnPrev"
              />
            )
          })
        ) : (
          <Block pb="30px" borderRadius="12px" bg="none" border="none" pt="0">
            <NoData h={{ base: 'auto', lg: '240px' }} type="nodata" pb="0px" text="No Available Liquidity" bg="none" noBorder={true} p="0px 40px" />
            <Text color="primary_gray" whiteSpace={{ base: 'wrap', lg: 'nowrap' }} lineHeight="20px">
              Burn/Lock Liquidity only available for CLMM Full-range position
            </Text>
          </Block>
        )}
      </VStack>
      {currentAccount?.address && (
        <VStack gap="8px" w="100%" p="20px 0" mt="-20px">
          <Button isDisabled={Object.values(currentLockItem).length <= 0} w="100%" h="52px" fontWeight="500" onClick={onClickLock}>
            Lock Liquidity
          </Button>
          <Button w="100%" p="20px" variant="outline" onClick={onClose} cursor="pointer" h="52px">
            Cancel
          </Button>
        </VStack>
      )}
    </VStack>
  )
}
export const LpBurnLoading = () => {
  return (
    <Block w="100%" borderRadius="8px" p="0" bg="bg_primary">
      <HStack w="100%" bg="bg_third" p="12px 16px" borderRadius="8px">
        <HStack gap="0">
          <SkeletonCircle size="9" />
          <SkeletonCircle size="9" />
          <VStack gap="4px" ml="4px" align="flex-start">
            <Skeleton height="4" width="100px" />
          </VStack>
        </HStack>
      </HStack>
      <Box w="100%" p="16px">
        <Skeleton height="5" width="250px" />
      </Box>
    </Block>
  )
}
