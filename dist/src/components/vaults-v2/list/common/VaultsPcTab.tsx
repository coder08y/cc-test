import { HStack, Skeleton } from '@chakra-ui/react'
import VaultsTabList from './VaultsTab'

type VaultsPcTabProps = {
  onClickVaultsTab: (value: string) => void
  currentTab: any
  showSkeletonLoading: boolean
}

export default function VaultsPcTab(props: VaultsPcTabProps) {
  const { currentTab, onClickVaultsTab, showSkeletonLoading } = props
  return (
    <HStack flexWrap="wrap">
      {showSkeletonLoading && <Skeleton w="480px" h="42px" />}
      {!showSkeletonLoading && <VaultsTabList currentTab={currentTab} onClickVaultsTab={onClickVaultsTab} />}
    </HStack>
  )
}
