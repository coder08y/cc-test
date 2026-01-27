import useVaultFarmingOverview from '@/hooks/vaults-farming/useVaultsFarmingOverview'
import { TooltipIcon } from '@cetus/design'
import { HTextLabelBox, Icon, SingleCoinImage } from '@cetus/ui-kit'
import { d, symbolDataDisplayProcessing } from '@cetus/utils'
import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

type FarmingIncentivesProps = {
  apiVaultInfo: any
  setIsOpenPre: (isOpen: boolean) => void
  setIsOpenFarmingModal: (isOpen: boolean) => void
  setFarmingModalAction: (action: string) => void
}

export function RewardItem({ rewardInfo }: { rewardInfo: any }) {
  return (
    <VStack borderRadius="12px">
      <HStack p="0" w="100%" justifyContent="space-between">
        <HStack>
          <Image src={rewardInfo?.coinDetail?.logo_url} w="20px" h="20px" />
        </HStack>
        <HStack gap="4px">
          <Text fontSize="12px" color="text_caption">
            {rewardInfo?.rewardAmountDisplay}
          </Text>
          <Text fontSize="12px">{rewardInfo?.coinDetail?.symbol}</Text>
        </HStack>
      </HStack>
    </VStack>
  )
}

// vaults弹窗 farming卡片部分
export default function FarmingIncentives(props: FarmingIncentivesProps) {
  const { setIsOpenPre, setIsOpenFarmingModal, setFarmingModalAction, apiVaultInfo } = props

  const [isOpen, setIsOpen] = useState(false)

  const {
    stakeVaultFarmingTvl,
    vaultFarmingRewardAmountUSD,
    farmClaimAction,
    vaultsFarmingStakeLoading,
    vaultsFarmingStaked,
    vaultsFarmingRewards,
    stakeButtonDisabled,
    claimButtonDisabled,
    unStakeButtonDisabled
  } = useVaultFarmingOverview(apiVaultInfo?.vaultId)

  return (
    <VStack border="1px solid" borderColor="border" gap="12px" w="100%" borderRadius="8px">
      <HStack
        w="100%"
        p={{ base: '12px 8px', lg: '16px 12px' }}
        borderRadius="7px"
        bg="primary_opacity.10"
        justifyContent="space-between"
        onClick={() => setIsOpen(!isOpen)}
        cursor="pointer"
      >
        <HStack gap="4px" cursor="pointer" userSelect="none">
          <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }} userSelect="none">
            3rd-Party Incentives
          </Text>
          <TooltipIcon tooltipCon="Powered by Haedal" />
        </HStack>
        {/* <Text color="text_highlight">APR {vaultFarmingAprDisplay}</Text> */}
        <Icon fontSize="12px" xlinkHref="#icon-icon_arrow" transition="transform 0.5s" transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} />
      </HStack>
      {isOpen && (
        <VStack w="100%" padding="0 12px 12px" gap="8px">
          <VStack w="100%" gap="4px">
            <HTextLabelBox
              isLoading={vaultsFarmingStakeLoading && !vaultsFarmingStaked?.stakedBalanceDisplay}
              label="Your Staked"
              value={
                <VStack alignItems="flex-end">
                  <Text fontSize="14px" color="text_caption">
                    {vaultsFarmingStaked?.stakedBalanceDisplay} LP
                  </Text>
                  <Text fontSize="12px">{symbolDataDisplayProcessing(stakeVaultFarmingTvl)}</Text>
                </VStack>
              }
              skeletonStyle={{
                subValueH: '20px'
              }}
              valueStyle={{
                color: 'text_caption'
              }}
            />
          </VStack>
          <VStack w="100%">
            <HTextLabelBox
              label="Your Rewards"
              isLoading={vaultsFarmingStakeLoading}
              rightValueTip={vaultsFarmingRewards?.map((item: any) => {
                return (
                  <VStack borderRadius="12px">
                    <RewardItem rewardInfo={item} />
                  </VStack>
                )
              })}
              value={
                <HStack position="relative">
                  <Text color="text_caption">{symbolDataDisplayProcessing(vaultFarmingRewardAmountUSD)}</Text>
                  {vaultsFarmingStaked?.rewardConfigs
                    ?.filter((r: any) => r.bankSum !== undefined && d(r.bankSum).gt(0))
                    .map((item: any) => {
                      return (
                        <SingleCoinImage
                          key={item?.coinDetail?.name + 'Icon'}
                          imageUrl={item?.coinDetail?.logo_url}
                          w="20px"
                          h="20px"
                          coinType={item?.coin_type}
                          showTag={false}
                        />
                      )
                    })}
                </HStack>
              }
              valueStyle={{
                textDecoration: 'none'
              }}
              wrapStyle={{
                mt: '4px'
              }}
            />
          </VStack>
          <Button
            w="100%"
            mt="12px"
            height="32px"
            borderRadius="8px"
            fontSize="12px"
            isDisabled={stakeButtonDisabled}
            onClick={() => {
              setIsOpenPre(false)
              setFarmingModalAction('Stake')
              setIsOpenFarmingModal(true)
            }}
          >
            Stake
          </Button>
          <HStack w="100%" justifyContent="space-between">
            <Button
              w="50%"
              height="32px"
              variant="outline"
              borderRadius="8px"
              fontSize="12px"
              bg="none"
              isDisabled={unStakeButtonDisabled}
              onClick={() => {
                setIsOpenPre(false)
                setFarmingModalAction('Unstake')
                setIsOpenFarmingModal(true)
              }}
            >
              Unstake
            </Button>
            <Button
              w="50%"
              height="32px"
              variant="outline"
              borderRadius="8px"
              fontSize="12px"
              bg="none"
              onClick={farmClaimAction}
              isDisabled={claimButtonDisabled}
            >
              Claim
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  )
}
