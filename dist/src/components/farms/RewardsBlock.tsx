import { PoolApiInfo } from '@/types'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType } from '@cetus/types'
import { formatNumber } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'

type RewardsBlockProps = {
  apiInfo: PoolApiInfo
}

export function RewardsBlock({ apiInfo }: RewardsBlockProps) {
  const { tokenInfo } = useGetToken<CoinType[]>((apiInfo?.farmsRewarderList || [])?.map(item => item?.coinType) as CoinType[])

  return (
    <VStack align="flex-end">
      {apiInfo?.farmsRewarderList && apiInfo?.farmsRewarderList?.length > 0 ? (
        apiInfo?.farmsRewarderList?.map(item => {
          return (
            <HStack key={item?.coinType}>
              <SingleTokenInfo
                token={tokenInfo?.get(item?.coinType as CoinType)}
                imgBoxStyle={{ w: '20px', h: '20px' }}
                warningIcon={{ iconW: '10px', iconH: '10px' }}
                haveName={false}
                haveSymbol={false}
              />
              <Text color="text_caption" fontWeight="500">
                {formatNumber(item?.emissionsEveryDay)} {tokenInfo?.get(item?.coinType as CoinType)?.symbol}
              </Text>
            </HStack>
          )
        })
      ) : (
        <Text color="text_caption">--</Text>
      )}
    </VStack>
  )
}
