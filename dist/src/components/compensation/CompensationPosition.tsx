import useCompensationStore from '@/store/compensation'
import { useAccountStore } from '@cetus/stores'
import { NoData } from '@cetus/ui-kit'
import { VStack } from '@chakra-ui/react'
import CompensationListLoading from './CompensationListLoading'
import CompensationPoolItem from './CompensationPoolItem'

export default function CompensationPosition() {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { posBaseListGroupByPool, posBaseListLoading } = useCompensationStore()

  return (
    <VStack w="100%" gap="12px" mt={{ base: '0px', lg: '0' }}>
      {!currentAccount?.address ? (
        <NoData type="nowallet" onboard={() => onWalletModal(true)} />
      ) : posBaseListLoading ? (
        [{}, {}, {}].map((item, index) => {
          return <CompensationListLoading key={index} />
        })
      ) : Object.values(posBaseListGroupByPool)?.length > 0 ? (
        Object.values(posBaseListGroupByPool).map((item, index) => {
          return <CompensationPoolItem key={index} poolInfo={item} />
        })
      ) : (
        <NoData type="nodata" text="No compensation data" />
      )}
    </VStack>
  )
}
