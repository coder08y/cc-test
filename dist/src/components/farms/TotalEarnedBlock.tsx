import { PoolApiInfo } from '@/types'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { formatCurrency } from '@cetus/utils'
import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { ClaimAllBtnBlock } from './ClaimAllBtnBlock'

type TotalEarnedBlockProps = {
  totalEarned: string | undefined
  apiInfo: PoolApiInfo
  disabled: boolean
}

export function TotalEarnedBlock({ apiInfo, disabled, totalEarned }: TotalEarnedBlockProps) {
  const { isApp } = useWindowWidth()
  return (
    <HStack justify="flex-end">
      <Skeleton isLoaded={!!totalEarned}>
        <Text textColor="primary_yellow" textAlign="right" fontWeight="500">
          {formatCurrency(totalEarned, 2)}
        </Text>
      </Skeleton>
      {isApp && <ClaimAllBtnBlock apiInfo={apiInfo} disabled={disabled} />}
    </HStack>
  )
}
