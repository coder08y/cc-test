import useXCetusClaimRewardAction from '@/hooks/xcetus/useXCetusClaimRewardAction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { XCetusRewardInfo } from '@/types/xcetus'
import { Block } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { CoinType } from '@cetus/types'
import { HTextLabelBox, Icon, SingleCoinImage, VTextLabelBox } from '@cetus/ui-kit'
import { d, formatCurrency, formatPercentage } from '@cetus/utils'
import { DividendReward } from '@cetusprotocol/xcetus-sdk'
import { Box, Button, HStack, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import ESTAprTooltip from './ESTAprTooltip'

type StakeRewardSummaryProps = {
  myShare: string
  cetusApr?: string
  totalRewardValue: string
  summaryRewardList: XCetusRewardInfo[]
  rewardList: DividendReward[]
}

export function StakeRewardSummary(props: StakeRewardSummaryProps) {
  const { myShare, cetusApr, totalRewardValue, summaryRewardList, rewardList } = props
  const { claimRewardLoading, handleClaimReward } = useXCetusClaimRewardAction()
  const { currentAccount } = useAccountStore()
  const { veNFTLoading } = useXCetusStore()
  const { isApp } = useWindowWidth()

  const showAmount = useMemo(() => {
    return Number(summaryRewardList?.[0]?.value) > 0 || summaryRewardList.length == 0
  }, [summaryRewardList])

  return (
    <VStack w="100%" alignItems="start" p={{ base: '4px 8px 8px', lg: '4px 16px 16px' }} gap="16px">
      <Text fontSize="16px" color="text_caption">
        xCETUS Staking Rewards
      </Text>
      {/* <Flex p={isApp ? '12px' : '12px 40px'} bg="primary_yellow_opacity.10" borderRadius="12px">
        <Text color="primary_yellow" align="left" lineHeight="1.5">
          xCETUS staking rewards will be suspended for one week. We apologize for the inconvenience caused to you.{' '}
        </Text>
      </Flex> */}
      <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap="16px" justifyContent="space-between">
        {/* apr */}
        <Block h={{ base: '60px', lg: '88px' }} p={{ base: '20px 12px', lg: '20px 24px' }} borderRadius="12px" w="100%" bg="bg_primary">
          <HStack h="100%" w="100%s" justifyContent="space-between">
            <HStack gap="4px">
              <Text color="primary_gray">est.APR</Text>
              <ESTAprTooltip>
                <Box>
                  <Icon xlinkHref="#icon-icon_tips" />
                </Box>
              </ESTAprTooltip>
            </HStack>
            <Skeleton isLoaded={cetusApr !== '0'}>
              <Text fontSize="18px" color="text_caption">
                ≈{formatPercentage(cetusApr, 2)}
              </Text>
            </Skeleton>
          </HStack>
        </Block>
        {/* 我的持有率 */}
        <Block h={{ base: '60px', lg: '88px' }} p={{ base: '20px 12px', lg: '20px 24px' }} borderRadius="12px" w="100%" bg="bg_primary">
          <HStack h="100%" w="100%s" justifyContent="space-between">
            <Text color="primary_gray">Your Share</Text>
            <Skeleton isLoaded={!veNFTLoading}>
              <Text fontSize="18px" color="text_caption">
                {myShare !== '--' ? `≈${myShare}` : myShare}
              </Text>
            </Skeleton>
          </HStack>
        </Block>
      </Stack>
      {/* 待收割奖励 */}(
      <Block borderRadius="12px" w="100%" p={{ base: '20px 12px', lg: '20px 24px' }} bg="bg_primary">
        <VStack h="100%" w="100%" gap={{ base: '20px', lg: '14px' }}>
          <HStack w="100%" justifyContent="space-between">
            <Text color="primary_gray">Claimable Yield</Text>
            <HStack justifyContent="end" gap="12px">
              <Text fontSize="18px" color="text_caption">
                {currentAccount && showAmount ? formatCurrency(totalRewardValue, 2) : '--'}
              </Text>
              {!isApp && summaryRewardList.length > 0 && (
                <Button
                  onClick={() => {
                    if (claimRewardLoading) {
                      return
                    }
                    handleClaimReward(rewardList)
                  }}
                  variant="outline"
                  h="28px"
                  w="80px"
                  borderRadius="8px"
                  fontSize="14px"
                  isDisabled={claimRewardLoading}
                  isLoading={claimRewardLoading}
                  bg="button_ghost_bg"
                >
                  Claim
                </Button>
              )}
            </HStack>
          </HStack>
          {/* 奖励明细 */}
          {summaryRewardList.length > 0 && (
            <Stack
              w="100%"
              flexDir={{ base: 'column', lg: 'row' }}
              align="center"
              justify={{ base: 'center', lg: 'flex-start' }}
              gap={{ base: '20px', lg: '8px' }}
            >
              {summaryRewardList.map(item => (
                <RewardItem key={item.coin_type} info={item} />
              ))}
            </Stack>
          )}
          {isApp && summaryRewardList.length > 0 && (
            <Button
              onClick={() => {
                if (claimRewardLoading) {
                  return
                }
                handleClaimReward(rewardList)
              }}
              variant="outline"
              h="40px"
              w="168px"
              borderRadius="12px"
              fontSize="14px"
              isDisabled={claimRewardLoading}
              isLoading={claimRewardLoading}
              bg="button_ghost_bg"
            >
              Claim
            </Button>
          )}
        </VStack>
      </Block>
      )
    </VStack>
  )
}

type RewardItemProps = {
  info: XCetusRewardInfo
}

function RewardItem(props: RewardItemProps) {
  const { info } = props
  const { tokenInfo } = useGetToken<CoinType>(info.coin_type as CoinType)
  const { isApp } = useWindowWidth()
  return isApp ? (
    <HTextLabelBox
      label={
        <HStack>
          <SingleCoinImage
            imageUrl={tokenInfo?.logo_url}
            imageStyle={{
              w: '24px',
              h: '24px'
            }}
          />
          <Text>{tokenInfo?.symbol}</Text>
        </HStack>
      }
      value={
        <VStack alignItems="flex-end" gap="4px">
          <Text color="text_caption">{info.amount}</Text>
          {d(info.value).gt('0') && <Text>{formatCurrency(info.value, 2)}</Text>}
        </VStack>
      }
    />
  ) : (
    <VTextLabelBox
      wrapStyle={{
        gap: '10px',
        flex: 1,
        alignItems: 'flex-start'
      }}
      title={
        <HStack>
          <SingleCoinImage
            imageUrl={tokenInfo?.logo_url}
            imageStyle={{
              w: '24px',
              h: '24px'
            }}
          />
          <Text>{tokenInfo?.symbol}</Text>
        </HStack>
      }
      value={
        <VStack alignItems="flex-start" gap="4px">
          <Text color="text_caption">{info.amount}</Text>
          {d(info.value).gt('0') && <Text>{formatCurrency(info.value, 2)}</Text>}
        </VStack>
      }
    />
  )
}
