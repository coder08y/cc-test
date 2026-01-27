import { CetusAdd } from '@/components/xcetus/CetusAdd'
import { CetusRedeem } from '@/components/xcetus/CetusRedeem'
import { RewardCountDown } from '@/components/xcetus/RewardCountDown'
import { RewardVesting } from '@/components/xcetus/RewardVesting'
import { StakeRewardSummary } from '@/components/xcetus/StakeRewardSummary'
import { XCetusTopHerder } from '@/components/xcetus/XCetusTopHerder'
import { useXCetus } from '@/hooks/xcetus/useXCetus'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { Block, SelectTab } from '@cetus/design'
import { useAccountBalance, useRpcListener } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useSdkStore } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { fromDecimalsAmountFix } from '@cetus/utils'
import { Stack, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export type TabTypes = 'Get xCETUS' | 'Redeem CETUS'

const tabList: { label: TabTypes; value: TabTypes }[] = [
  {
    label: 'Get xCETUS',
    value: 'Get xCETUS'
  },
  {
    label: 'Redeem CETUS',
    value: 'Redeem CETUS'
  }
]

function XCetus() {
  const { currentAccount } = useAccountStore()
  const { isInitialized } = useSdkStore()
  const {
    fetchOwnerVeNFT,
    fetchXCetusManager,
    fetchVeNFTDividendInfo,
    availableXCetusAmount,
    veNFT,
    veNFTLoading,
    lockCetusListLoading,
    redeemingXCetusAmount,
    fetchDividendManager,
    myShare,
    nextStartTime,
    cetusApr,
    summaryRewardList,
    totalRewardValue,
    lockCetusList,
    rewardList,
    calculateCurrPeriod
  } = useXCetus()
  const { dividendManager } = useXCetusStore()

  const [currTab, setCurrTab] = useState<TabTypes>('Get xCETUS')
  const { fetchAccountBalance } = useAccountBalance()
  useRpcListener({
    onRpcChange: () => {
      fetchXCetusManager(false)
      fetchDividendManager(false)
      if (currentAccount) {
        fetchOwnerVeNFT(currentAccount.address, true)
        fetchAccountBalance()
      }
    }
  })

  useEffect(() => {
    if (currentAccount) {
      fetchOwnerVeNFT(currentAccount.address, true)
    }
  }, [currentAccount?.address])

  useEffect(() => {
    if (!isInitialized) return
    fetchXCetusManager(false)
    fetchDividendManager(false)
    if (currentAccount?.address) {
      fetchAccountBalance()
    }
  }, [isInitialized])

  const [tradeIcon, setTradeIcon] = useState('#icon-a-icon_trade')

  const onTradeIconMouseEnter = () => {
    setTradeIcon('#icon-icon_swap1')
  }

  const onTradeIconMouseLeave = () => {
    setTradeIcon('#icon-a-icon_trade')
  }

  const onIconClick = () => {
    const value = tabList?.find(tab => tab?.value !== currTab)?.value
    if (value) {
      setCurrTab(value)
    }
  }
  const { isApp } = useWindowWidth()
  return (
    <VStack
      gap="0px"
      w="100%"
      pos="relative"
      sx={
        isApp
          ? {
              backgroundImage: "url('/images/xcetus_h5_bg.png')",
              backgroundPosition: 'center 256px',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '375px 200px'
            }
          : {}
      }
    >
      {/* 顶部区域 */}
      <XCetusTopHerder
        totalAmount={veNFT?.xcetus_balance || '0'}
        availableAmount={availableXCetusAmount}
        redeemingAmount={redeemingXCetusAmount}
        isLoading={lockCetusListLoading || veNFTLoading}
      />
      <Stack
        flexDir={{ base: 'column-reverse', lg: 'row' }}
        mt={{ base: '118px', lg: '28px' }}
        zIndex={100}
        w="100%"
        gap="16px"
        alignItems="start"
        justifyContent="space-between"
      >
        {/* 左边 */}
        <VStack w="60%" gap="16px" minW={{ base: '100%', lg: '600px' }}>
          <Block p="0px" borderRadius="16px" w="100%">
            <VStack w="100%" gap="16px">
              {/* 奖励倒计时 */}
              <RewardCountDown
                nextStartTime={nextStartTime || 0}
                refresh={() => {
                  if (veNFT) {
                    fetchVeNFTDividendInfo(veNFT.id)
                  }
                  fetchDividendManager(true)
                  if (dividendManager) {
                    calculateCurrPeriod(dividendManager)
                  }
                }}
              />
              {/* 质押奖励汇总 */}
              <StakeRewardSummary
                myShare={myShare.toString()}
                cetusApr={cetusApr}
                totalRewardValue={totalRewardValue}
                summaryRewardList={summaryRewardList}
                rewardList={rewardList}
              />
            </VStack>
          </Block>
          {lockCetusList.length > 0 && <RewardVesting lockCetusList={lockCetusList} />}
        </VStack>
        {/* 右边  */}
        <VStack w="40%" gap="8px" minW={{ base: '100%', lg: '380px' }}>
          {/* 切换Tab */}
          <SelectTab
            type="borderTab"
            wrapStyle={{
              w: '100%',
              h: '60px'
            }}
            itemStyle={{
              w: '50%',
              fontSize: '16px'
            }}
            tabList={tabList}
            currentTab={currTab}
            handleChangeTab={(item: any) => {
              setCurrTab(item?.value)
            }}
          />
          {currTab === 'Get xCETUS' && (
            <CetusAdd
              availableXCetusAmount={availableXCetusAmount}
              onIconClick={onIconClick}
              iconParams={{
                xlinkHref: tradeIcon,
                svgFill: 'text_caption',
                transform: tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)',
                fontSize: tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px',
                onMouseEnter: onTradeIconMouseEnter,
                onMouseLeave: onTradeIconMouseLeave
              }}
            />
          )}
          {currTab === 'Redeem CETUS' && (
            <CetusRedeem
              availableXCetusAmount={fromDecimalsAmountFix(availableXCetusAmount, 9)}
              onIconClick={onIconClick}
              iconParams={{
                xlinkHref: tradeIcon,
                svgFill: 'text_caption',
                transform: tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)',
                fontSize: tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px',
                onMouseEnter: onTradeIconMouseEnter,
                onMouseLeave: onTradeIconMouseLeave
              }}
            />
          )}
        </VStack>
      </Stack>
    </VStack>
  )
}

export default XCetus
