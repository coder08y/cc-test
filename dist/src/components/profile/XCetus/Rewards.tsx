import useXCetusClaimRewardAction from '@/hooks/xcetus/useXCetusClaimRewardAction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { XCetusRewardInfo } from '@/types/xcetus'
import { CetusTooltip } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { d, formatCurrency, formatNumber } from '@cetus/utils'
import { DividendReward } from '@cetusprotocol/xcetus-sdk'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import Holding from './Holding'

type Props = {
  totalRewardValue: string
  rewardList: DividendReward[]
  summaryRewardList: XCetusRewardInfo[]
}

function Rewards({ totalRewardValue, rewardList, summaryRewardList }: Props) {
  const { currentAccount } = useAccountStore()
  const { veNFTLoading } = useXCetusStore()
  const { claimRewardLoading, handleClaimReward } = useXCetusClaimRewardAction()
  const onClickClaim = () => {
    if (claimRewardLoading) {
      return
    }
    handleClaimReward(rewardList)
  }

  const { isApp } = useWindowWidth()

  return (
    <Holding
      type="rewards"
      amount={
        currentAccount ? (
          d(totalRewardValue).gt('0') ? (
            <CetusTooltip
              tooltip={
                <VStack w="100%" align="flex-start" bg="bg_secondary" gap="0px">
                  {summaryRewardList?.map(item => {
                    return (
                      <HStack w="100%" key={item.coin_type} p="10px 12px" minW="300px" justify="space-between">
                        <SingleTokenInfo
                          coinType={item.coin_type}
                          imgBoxStyle={{ w: '20px', h: '20px' }}
                          haveName={false}
                          symbolFontSize="12px"
                          warningIcon={{ iconW: '10px', iconH: '10px' }}
                        />
                        <HStack gap="4px">
                          <Text fontSize="12px" color="text_caption">
                            {formatNumber(item?.amount, 6)}
                          </Text>
                          <Text fontSize="12px">({formatCurrency(item?.value, 2)})</Text>
                        </HStack>
                      </HStack>
                    )
                  })}
                </VStack>
              }
            >
              <Text
                textDecoration="underline dotted"
                textUnderlineOffset="3px"
                textDecorationColor="text_paragraph"
                cursor="pointer"
                color="text_caption"
                h="24px"
                lineHeight="24px"
                fontSize="20px"
              >
                {formatCurrency(totalRewardValue, 2)}
              </Text>
            </CetusTooltip>
          ) : (
            <Text textUnderlineOffset="3px" textDecorationColor="text_paragraph" color="text_caption" h="24px" lineHeight="24px" fontSize="20px">
              {formatCurrency(totalRewardValue, 2)}
            </Text>
          )
        ) : (
          '--'
        )
      }
      isLoading={veNFTLoading}
    >
      {summaryRewardList.length > 0 && (
        <Button
          onClick={onClickClaim}
          variant="unstyled"
          bg="primary"
          border="none"
          color="background"
          flex="0 0 120px"
          fontSize={{ base: '12px', lg: '14px' }}
          fontWeight="500"
          h="32px"
          lineHeight="32px"
          w={{ base: '122px', lg: 'unset' }}
          borderRadius="8px"
        >
          Claim
        </Button>
      )}
    </Holding>
  )
}

export default Rewards
