import { IncentiveRewardInfo } from '@/types/incentive'
import { ErrorTips, TradeInput } from '@cetus/design'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { isAvailableObject, removeComma } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { ReleaseInfoItem } from './ReleaseInfo'
import TimeSelect from './TimeSelect'

interface RewardContentProps {
  isLast: boolean
  index: number
  rewardListLength: number
  rewardInfo: IncentiveRewardInfo
  whiteTokenList: any
  deleteReward: (index: number) => void
  updateReward: (index: number, type: string, value: any, startIsNow?: boolean) => void
}

type TabType = {
  label: string
  value: string
}
export default function RewardContent({
  whiteTokenList,
  index,
  rewardListLength,
  rewardInfo,
  deleteReward,
  updateReward,
  isLast
}: RewardContentProps) {
  const { balanceInfo } = useGetTokenBalance(rewardInfo?.rewardCoin)
  const { getTokenAmountValue } = useTokenPrice()
  const { isApp } = useWindowWidth()

  const tabList: TabType[] = [
    { label: 'Total', value: 'total' },
    { label: 'Per Day', value: 'perDay' }
  ]
  const handleChangeTab = (tab: TabType) => {
    updateReward(index, 'amountMode', tab?.value)
  }
  return (
    <VStack
      w="100%"
      align="flex-start"
      pb={isLast ? '4px' : '16px'}
      borderBottom={rewardListLength == index + 1 ? 'none' : '1px solid'}
      borderColor={rewardListLength && rewardListLength > 1 ? 'border' : 'transparent'}
    >
      <HStack w="100%" justify="space-between">
        <Text color="text_caption" h="20px" lineHeight="20px">
          Reward {index + 1}
        </Text>
        {rewardListLength && rewardListLength > 1 && (
          // <Button
          //   p="0"
          //   bg="none"
          //   border="none"
          //   leftIcon={<Icon w="18px" h="18px" xlinkHref="#icon-icon_del" svgHover="primary" />}
          //   _hover={{
          //     bg: 'none',
          //     border: 'none'
          //   }}
          //   variant="ghost"
          //   fontSize="14px"
          //   height="20px"
          //   onClick={() => deleteReward(index)}
          // />
          <Icon w="18px" h="18px" xlinkHref="#icon-icon_del" svgHover="primary" onClick={() => deleteReward(index)} />
        )}
      </HStack>

      <HStack w="100%" justify="space-between" flexDir={{ base: 'column', lg: 'row' }}>
        <TimeSelect
          rewardInfo={rewardInfo}
          title="Start Time"
          fieldKey="startTime"
          onSelect={(date, startIsNow) => updateReward(index, 'startTime', date, startIsNow)}
        />
        <TimeSelect rewardInfo={rewardInfo} title="End Time" fieldKey="endTime" onSelect={date => updateReward(index, 'endTime', date)} />
      </HStack>
      <TradeInput
        title="Input Amount"
        value={rewardInfo?.inputNum || ''}
        onChange={val => updateReward(index, 'inputNum', val)}
        token={rewardInfo?.rewardCoin}
        placeholder="0.0"
        balance={balanceInfo?.balanceFormat || ''}
        amountValue={getTokenAmountValue(rewardInfo?.rewardCoin?.coin_type, rewardInfo?.inputNum)}
        selectable
        onTokenChange={val => updateReward(index, 'rewardCoin', val)}
        wrapStyle={{ height: '122px' }}
        whiteTokenList={whiteTokenList}
        isShowTokenListTab={false}
        isShowLabelTab={false}
        isShowHotList={false}
        isShowOperate={false}
        isShowTokenName={false}
        showSearchInput={false}
        inputTabOptions={{
          type: 'outlineTab',
          tabList,
          currentTab: rewardInfo?.amountMode == 'total' ? 'Total' : 'Per Day',
          handleChangeTab: tab => {
            handleChangeTab(tab)
          },
          wrapStyle: {
            w: '168px',
            h: '28px',
            p: '3px',
            borderRadius: '10px'
          },
          itemStyle: {
            flex: '1',
            fontSize: '12px',
            margin: '0px',
            borderRadius: '6px'
          }
        }}
      />

      {rewardInfo?.startTime &&
        rewardInfo?.endTime &&
        rewardInfo?.rewardNum &&
        d(rewardInfo?.rewardNum).gt(0) &&
        isAvailableObject(rewardInfo?.rewardCoin) &&
        d(removeComma(rewardInfo?.releaseRate + '')).lt(d(1).div(d(10).pow(rewardInfo?.rewardCoin?.decimals))) && (
          <ErrorTips
            type="error"
            tipsFontSize="12px"
            tipsLineHeight="16px"
            tips="The reward rate is too low. Try shortening the epoch duration or increasing the reward amount"
          />
        )}
      {isApp && <ReleaseInfoItem rewardInfo={rewardInfo} />}
    </VStack>
  )
}
