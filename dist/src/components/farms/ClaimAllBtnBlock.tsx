import useFarmsActions from '@/hooks/farms/useFarmsAction'
import usePositionList from '@/hooks/position/usePositionList'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { useAccountStore } from '@cetus/stores'
import { cancelBubble } from '@cetus/utils'
import { Button } from '@chakra-ui/react'

type ClaimAllBtnBlockProps = {
  apiInfo: any
  disabled: boolean
}

export function ClaimAllBtnBlock({ apiInfo, disabled }: ClaimAllBtnBlockProps) {
  const { currentAccount } = useAccountStore()
  const { posBaseListGroupByPool } = usePositionStore()
  const { getPositionBaseList } = usePositionList()
  const { toClaimAllPos, claimLoading } = useFarmsActions()
  const getPosList = async () => {
    await getPositionBaseList(currentAccount?.address as string, { isFarmsPage: true })
  }

  const toClaimAll = () => {
    toClaimAllPos(posBaseListGroupByPool[apiInfo?.poolAddress]?.list as PosBaseInfo[], getPosList)
  }

  return (
    <Button
      onClick={e => {
        cancelBubble(e)
        toClaimAll()
      }}
      isLoading={claimLoading}
      isDisabled={disabled || claimLoading}
      w={{ base: '64px', lg: '100px' }}
      h={{ base: '24px', lg: '32px' }}
      borderRadius="8px"
      variant="outline"
      fontSize="14px"
    >
      Claim
    </Button>
  )
}
