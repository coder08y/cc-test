import Slippage from '@/components/common/Slippage'
import { PercentageTab } from '@/components/position/details/RemoveBlock'
import { Block, SelectTab, TradeInput, TradeInputGroup } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { HTextLabelBox, Icon, RefreshButton } from '@cetus/ui-kit'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

// vaults farming提取时指定coin 这部分暂时没上
export function UnstakeAndWithdraw() {
  const [percentage, setPercentage] = useState<string | number>(25)
  const [currentActionTab, setCurrentActionTab] = useState<string>('USDC+SUI')
  const tabList: Tab[] = [
    {
      label: 'USDC+SUI',
      value: 'USDC+SUI'
    },
    {
      label: 'USDC',
      value: 'USDC'
    },
    {
      label: 'SUI',
      value: 'SUI'
    }
  ]
  return (
    <>
      <HStack w="100%" justifyContent="space-between" gap="8px">
        <Text fontSize="16px" color="text_caption">
          Unstake
        </Text>
        <HStack w="100%" justifyContent="flex-end">
          <Slippage slippageType="liquidity" compact={true} />
          <RefreshButton
            handleRefresh={() => {}}
            w="28px"
            h="28px"
            minW="28px"
            minH="28px"
            innerStyle={{ w: '28px', h: '28px', borderRadius: '8px', bg: 'bg_secondary' }}
          />
        </HStack>
      </HStack>
      <VStack w="100%">
        <TradeInput value="1" onChange={() => {}} placeholder="0" balance="100" wrapStyle={{ position: 'relative', zIndex: 5, height: '110px' }} />
        <Block borderRadius="0 0 20px 20px" p="20px 14px 8px" mt="-20px">
          <PercentageTab
            percentage={percentage}
            onChange={value => setPercentage(value)}
            wrapStyle={{
              justifyContent: 'space-between'
            }}
            selectTabStyle={{
              w: { base: '220px', lg: '276px' },
              h: '32px',
              p: '3px',
              borderRadius: '8px'
            }}
            selectTabItemStyle={{
              flex: '1',
              fontSize: '12px',
              margin: '0px'
            }}
            textFontSize="20px"
          />
        </Block>
        <Icon xlinkHref="#icon-a-icon_trade" svgW="12px" svgH="12px" isActive activeColor="text_caption" m="8px 0 0px" />
      </VStack>
      <VStack w="100%">
        <Text w="100%" fontSize="16px" color="text_caption" textAlign="left" mt="4px">
          Receive
        </Text>
        <SelectTab
          type="outlineTab"
          wrapStyle={{
            w: {
              base: '100%'
            },
            h: '42px',
            padding: '4px'
            // marginTop: '8px'
            // marginBottom: '4px'
          }}
          itemStyle={{
            w: '50%',
            fontSize: '14px',
            borderRadius: '8px'
          }}
          tabList={tabList}
          currentTab={currentActionTab}
          handleChangeTab={item => {
            setCurrentActionTab(item.value)
          }}
        />
        <TradeInputGroup
          from={{
            wrapStyle: {
              height: '110px'
            }
          }}
          to={{
            wrapStyle: {
              height: '110px'
            }
          }}
        />
        <Button w="100%" h="52px">
          Deposit
        </Button>
        <VStack w="100%" gap="20px" mt="8px">
          <HTextLabelBox
            label="Total Withdraw"
            labelStyle={{
              fontSize: '14px'
            }}
            value="11"
            valueStyle={{
              fontSize: '14px'
            }}
            isLoading={false}
          />
          <HTextLabelBox
            label="LP Burn Amount"
            // value={`${formatNumber(fromDecimalsAmountFix(amountLimit || '0', lpTokenInfo?.decimals), 9)} ${`${displayTokenA?.symbol} - ${displayTokenB?.symbol}`}`}
            value="11"
            labelStyle={{
              fontSize: '14px'
            }}
            valueStyle={{
              fontSize: '14px'
            }}
            isLoading={false}
          />
        </VStack>
      </VStack>
    </>
  )
}
