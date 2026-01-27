import useVaultFarmingOverview from '@/hooks/vaults-farming/useVaultsFarmingOverview'
import { CetusTooltip } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { HTextLabelBox, Icon, SingleCoinImage, VTextLabelBox } from '@cetus/ui-kit'
import { symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { RewardItem } from './FarmingIncentives'
import FarmingModal from './FarmingModal'

// vaults 详情 farming卡片部分
export default function FarmingOverview({ vaultId }: { vaultId: string }) {
  const [isOpenFarmingModal, setIsOpenFarmingModal] = useState(false)
  const [farmingModalAction, setFarmingModalAction] = useState('Stake')
  const {
    vaultFarmingAprDisplay,
    vaultFarmingLoading,
    farmingTvlDisplay,
    stakeVaultFarmingTvl,
    vaultFarmingRewardAmountUSD,
    vaultFarmingRewardLoading,
    farmClaimAction,
    farmClaimLoading,
    vaultsFarmingStaked,
    currentVaultPositionLoading,
    currentVaultPositionInfo,
    stakeButtonDisabled,
    claimButtonDisabled,
    unStakeButtonDisabled,
    vaultsFarmingRewardsLoading,
    holdingVaultAmountDisplay,
    vaultsFarmingRewards,
    currentVaultsFarm,
    vaultsFarmingStakeLoading,
    currentVaultsFarmingStaked,
    isActiveVaultsFarming
  } = useVaultFarmingOverview(vaultId)

  const { currentAccount } = useAccountStore()

  const stakeLoading = useMemo(() => {
    return (
      vaultsFarmingStakeLoading &&
      ((currentVaultsFarmingStaked && currentVaultsFarmingStaked?.ownerAddress != currentAccount?.address) || !currentVaultsFarmingStaked)
    )
  }, [vaultsFarmingStakeLoading, currentAccount?.address, currentVaultsFarmingStaked?.ownerAddress])

  return !isActiveVaultsFarming && unStakeButtonDisabled ? (
    <></>
  ) : (
    <VStack
      width="100%"
      bg="bg_six"
      p="16px"
      borderRadius="16px"
      background="linear-gradient( 180deg, #003125 0%, #111111 100%);"
      position="relative"
    >
      <Box
        backgroundImage="url(/images/img_farming_bg_2@2x.png)"
        backgroundSize="100% 100%"
        opacity="0.1"
        w="169px"
        h="169px"
        position="absolute"
        top="12px"
        right="16px"
      />
      <VStack w="100%" alignItems="flex-start" position="relative" zIndex="5">
        <HStack w="100%" justifyContent="space-between">
          {/* <VTextLabelBox
            title="LP Incentives"
            titleStyle={{
              color: 'text_caption'
            }}
            value="Stake your LP tokens to Earn"
            valueStyle={{ fontSize: '12px', color: 'primary_gray' }}
            wrapStyle={{
              gap: '8px'
            }}
          /> */}
          <VStack align="flex-start" gap="8px">
            <CetusTooltip
              tooltip={
                <Text fontSize="12px" lineHeight="20px">
                  Incentives on Haedal
                </Text>
              }
            >
              <HStack cursor="pointer" gap="4px" align="center">
                <Text fontSize="14px" color="text_caption">
                  LP Incentives
                </Text>
                <Icon xlinkHref="#icon-icon_tips" fontSize="20px" />
              </HStack>
            </CetusTooltip>
            <Text fontSize="12px" color="text_paragraph">
              Stake your LP tokens to Earn
            </Text>
          </VStack>
          <HTextLabelBox
            label={isActiveVaultsFarming ? 'APR' : 'Ended'}
            value={isActiveVaultsFarming ? vaultFarmingAprDisplay : ''}
            wrapStyle={{
              w: 'auto',
              gap: '4px'
            }}
            labelStyle={{
              fontSize: '14px',
              color: 'text_caption'
            }}
            valueStyle={{
              fontSize: '14px',
              color: 'primary'
            }}
          />
        </HStack>
        <HStack
          justifyContent="space-around"
          w="100%"
          // gap="90px"
          mt="6px"
          alignItems="center"
          backgroundImage="url('/images/img_farming_bg@2x.png')"
          backgroundSize="100% 100%"
          backgroundRepeat="no-repeat"
          padding="12px 0"
        >
          <VTextLabelBox
            wrapStyle={{
              textAlign: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
            skeletonStyle={{
              valueH: '20px'
            }}
            title="TVL"
            isLoading={vaultFarmingLoading}
            value={farmingTvlDisplay as string}
          />
          <VTextLabelBox
            wrapStyle={{
              textAlign: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
            titleStyle={{
              color: 'primary_gray'
            }}
            title="LP Rewards"
            isLoading={vaultFarmingLoading}
            skeletonStyle={{
              valueH: '20px'
            }}
            value={
              isActiveVaultsFarming ? (
                <HStack>
                  {currentVaultsFarm?.rewardList?.map((item: any) => {
                    return (
                      <HStack>
                        <SingleCoinImage
                          key={item?.coinDetail?.name + 'Icon'}
                          imageUrl={item?.coinDetail?.logo_url}
                          w="20px"
                          h="20px"
                          coinType={item?.coin_type}
                          showTag={false}
                        />
                        <Text color="text_caption">
                          {item.rewardItemRateDisplay} {item?.coinDetail?.symbol}/day
                        </Text>
                      </HStack>
                    )
                  })}
                </HStack>
              ) : (
                <Text color="text_caption">0</Text>
              )
            }
          />
        </HStack>
      </VStack>
      <VStack gap="16px" w="100%" mt="8px" position="relative" zIndex="5">
        {isActiveVaultsFarming && (
          <HTextLabelBox
            label="Available to Stake"
            isLoading={currentVaultPositionLoading || currentVaultPositionInfo?.vaultBalance === undefined}
            skeletonStyle={{
              valueH: '24px'
            }}
            value={
              <HStack gap="8px">
                <VStack gap="4px" alignItems="flex-end">
                  <Text fontSize="14px" color="text_caption">
                    {!currentAccount?.address ? '--' : currentVaultPositionInfo?.vaultBalanceDisplay} LP
                  </Text>
                  <Text fontSize="12px">{holdingVaultAmountDisplay}</Text>
                </VStack>
                <Button
                  w="80px"
                  h="24px"
                  bg="none"
                  borderRadius="8px"
                  fontSize="12px"
                  variant="outline"
                  onClick={() => {
                    setFarmingModalAction('Stake')
                    setIsOpenFarmingModal(true)
                  }}
                  isDisabled={stakeButtonDisabled}
                >
                  Stake
                </Button>
              </HStack>
            }
            labelStyle={{ color: 'primary_gray', fontSize: '14px' }}
          />
        )}
        <HTextLabelBox
          label="Your Staked"
          isLoading={stakeLoading || currentVaultPositionLoading}
          skeletonStyle={{
            valueH: '24px'
          }}
          value={
            <HStack gap="8px">
              <VStack gap="4px" alignItems="flex-end">
                <Text fontSize="14px" color="text_caption">
                  {!currentAccount?.address ? '--' : vaultsFarmingStaked?.stakedBalanceDisplay} LP
                </Text>
                <Text fontSize="12px">{symbolDataDisplayProcessing(stakeVaultFarmingTvl)}</Text>
              </VStack>
              <Button
                variant="outline"
                w="80px"
                h="24px"
                bg="none"
                borderRadius="8px"
                fontSize="12px"
                isDisabled={unStakeButtonDisabled}
                onClick={() => {
                  setFarmingModalAction('Unstake')
                  setIsOpenFarmingModal(true)
                  // getVaultFarmingUnStakePayload()
                }}
              >
                Unstake
              </Button>
            </HStack>
          }
          labelStyle={{ color: 'primary_gray', fontSize: '14px' }}
        />
        <HTextLabelBox
          label="Your Rewards"
          isLoading={vaultFarmingRewardLoading || currentVaultPositionLoading}
          skeletonStyle={{
            valueH: '24px'
          }}
          value={
            <HStack gap="8px">
              <CetusTooltip
                tooltip={
                  <VStack>
                    {vaultsFarmingRewards?.map(rewardInfo =>
                      !Number(rewardInfo?.rate) && !Number(rewardInfo?.rewardAmount) ? (
                        <></>
                      ) : (
                        <RewardItem key={rewardInfo.rewardCoinType} rewardInfo={rewardInfo} />
                      )
                    )}
                  </VStack>
                }
              >
                <Text textDecoration="underline dotted" textDecorationColor="text_paragraph" color="text_caption">
                  {symbolDataDisplayProcessing(vaultFarmingRewardAmountUSD)}
                </Text>
              </CetusTooltip>
              <Button
                variant="outline"
                w="80px"
                h="24px"
                bg="none"
                borderRadius="8px"
                fontSize="12px"
                onClick={farmClaimAction}
                isLoading={farmClaimLoading}
                isDisabled={claimButtonDisabled}
              >
                Claim
              </Button>
            </HStack>
          }
          labelStyle={{ color: 'primary_gray', fontSize: '14px' }}
        />
      </VStack>

      {isOpenFarmingModal && (
        <FarmingModal
          isOpen={isOpenFarmingModal}
          setIsOpen={setIsOpenFarmingModal}
          setIsOpenPre={setIsOpenFarmingModal}
          onClose={() => setIsOpenFarmingModal(false)}
          farmingModalAction={farmingModalAction}
          vaultsId={vaultId}
          isDetail={true}
        />
      )}
    </VStack>
  )
}
