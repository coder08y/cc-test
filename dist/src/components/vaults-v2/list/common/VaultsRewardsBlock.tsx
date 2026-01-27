import RewardsBlock from '@/components/pools/RewardsBlock'
import { CetusTooltip } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinType } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import { add0x } from '@cetus/utils'
import { Center, HStack, Text } from '@chakra-ui/react'

function VaultsRewardsBlock({ rewardList }: { rewardList: string[] }) {
  const { isApp } = useWindowWidth()
  return (
    <CetusTooltip
      tooltip={
        <Text fontSize="12px" lineHeight="20px">
          Rewards will be auto harvested and compounded to your position.
        </Text>
      }
    >
      <HStack justifyContent="end" gap="4px">
        {!isApp ? (
          <RewardsBlock
            miningRewardList={[]}
            farmsRewarderList={rewardList?.map(item => ({ coinType: item, emissionsEveryDay: 0 }))}
            showTips={false}
          />
        ) : (
          rewardList?.map(coinType => {
            return <CoinImage key={coinType} coinType={coinType} />
          })
        )}
      </HStack>
    </CetusTooltip>
  )
}

export function CoinImage({ coinType, size = '20px' }: { coinType: string; size?: string }) {
  const { tokenInfo } = useGetToken(add0x(coinType) as CoinType)
  return (
    <Center>
      <SingleCoinImage imageUrl={tokenInfo?.logo_url} w={size} h={size} />
    </Center>
  )
}

export default VaultsRewardsBlock
