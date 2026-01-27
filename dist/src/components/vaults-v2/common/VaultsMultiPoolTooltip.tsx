import PoolTag from '@/components/common/PoolTag'
import { AddressCopyLink } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage, SingleCoinImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'

export function VaultsMultiPoolTooltip({ poolInfo }: { poolInfo: any }) {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()
  return (
    <VStack align="flex-start">
      <HStack gap="4px">
        <CoinPairImage
          coinACoinType={poolInfo?.displayTokenA?.coin_type || poolInfo?.displayTokenA?.address}
          coinBCoinType={poolInfo?.displayTokenB?.coin_type || poolInfo?.displayTokenB?.address}
          coinAIconUrl={poolInfo?.displayTokenA?.logo_url}
          coinBIconUrl={poolInfo?.displayTokenB?.logo_url}
          w="20px"
          h="20px"
          status={status}
        />

        <Text fontSize="14px" color="text_caption" whiteSpace="nowrap" mr="8px">
          {textEllipses(poolInfo?.displayTokenA?.symbol, 8)}&nbsp;-&nbsp;
          {textEllipses(poolInfo?.displayTokenB?.symbol, 8)}
        </Text>

        {poolInfo?.poolType && <PoolTag poolType={poolInfo?.poolType} displayFee={poolInfo?.feeDisplay || '--'} binStep={poolInfo?.binStep} />}
      </HStack>
      <HStack>
        <Text fontSize="12px" color="primary_gray">
          Pool Address
        </Text>
        <AddressCopyLink
          address={poolInfo?.poolAddress}
          color="text_caption"
          showLink={isApp ? true : false}
          onClickLink={() => {
            window.open(getExplorerUrl(poolInfo?.poolAddress, 'poolAddress'), '_blank')
          }}
        />
      </HStack>
    </VStack>
  )
}
