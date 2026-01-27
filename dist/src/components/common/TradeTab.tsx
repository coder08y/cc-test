import useGlobalStore from '@/store/common/global'
import useProStore from '@/store/pro'
import { Block, CetusTooltip, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, Center, HStack, Image, Text, VStack } from '@chakra-ui/react'

import { useEffect, useMemo, useTransition } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TradeTabs } from '../swap/type'
import BuySellTab from './proModeAndChart/BuySellTab'

const tradeTabList = [
  {
    label: TradeTabs.Swap
  },
  {
    label: TradeTabs.Limit
  },
  {
    label: TradeTabs.DCA
  }
]

type TradeTab = {
  currTradeTab: TradeTabs
}

export function TradeTab(props: TradeTab) {
  const { currTradeTab } = props
  const { setIsShowTradeChart, setIsShowTradeOrders } = useGlobalStore()
  const { isProMode, setIsProMode } = useProStore()
  const { from, to, pay, target } = useParams()
  const [isPending, startTransition] = useTransition()

  const { a, b } = useMemo(() => {
    return {
      a: from || pay || '',
      b: to || target || ''
    }
  }, [from, to, pay, target])

  useEffect(() => {
    if (isProMode) {
      // setIsShowTradeChart(true)
      setIsShowTradeOrders(false)
    }
  }, [isProMode])
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  return (
    <VStack w="100%" gap="0">
      {isProMode && <BuySellTab />}
      <HStack w="100%" justify="space-between">
        <SelectTab
          type="borderTab"
          currentTab={currTradeTab}
          tabList={tradeTabList}
          handleChangeTab={tab => {
            // 使用 startTransition 让路由切换更流畅
            startTransition(() => {
              if (tab.label === TradeTabs.Limit) {
                navigate(`/limit${a ? `/${a}` : ''}${b ? `/${b}` : ''}`)
              } else if (tab.label === TradeTabs.DCA) {
                navigate(`/dca${a ? `/${a}` : ''}${b ? `/${b}` : ''}`)
              } else {
                navigate(`/swap${a ? `/${a}` : ''}${b ? `/${b}` : ''}`)
              }
            })
          }}
          wrapStyle={{
            bg: 'none',
            h: '52px',
            gap: '32px',
            border: 'none'
          }}
          itemStyle={{
            fontSize: '16px',
            fontWeight: 500,
            position: 'relative'
          }}
        />
        <HStack>
          {currTradeTab === TradeTabs.Swap && (
            <CetusTooltip
              placement="top"
              tooltip={
                <Text fontWeight="500" fontSize="12px">
                  Merge Swap
                </Text>
              }
            >
              <Block
                p="5px 8px"
                display="flex"
                alignItems="center"
                gap="6px"
                borderRadius="8px"
                w="fit-content"
                onClick={() => navigate('/merge-swap')}
              >
                <Image src="/images/icon_merge_swap.svg" w="16px" h="16px" />
                <Text color="primary_gray" fontSize="12px" fontWeight="500">
                  Merge
                </Text>
              </Block>
            </CetusTooltip>
          )}

          <HStack gap="2px" onClick={() => setIsProMode(!isProMode)} cursor="pointer">
            <CetusTooltip
              showTooltip={isApp ? false : true}
              placement="top"
              tooltip={
                <Text fontWeight="500" fontSize="12px">
                  {isProMode ? 'Switch to Lite Mode' : 'Switch to Pro Mode'}
                </Text>
              }
            >
              <Center>
                {!isProMode ? (
                  <Image w="62px" h="28px" src="/images/icon_lite.png" />
                ) : (
                  <Box position="relative">
                    <Image w="62px" h="28px" src="/images/icon_lpro.png" />
                    {/* <Image w="30px" h="10px" src="/images/icon_beta_new@2x.png" position="absolute" top="-4px" right="-8px" /> */}
                  </Box>
                )}
              </Center>
            </CetusTooltip>
          </HStack>
        </HStack>
      </HStack>
    </VStack>
  )
}
