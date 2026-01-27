import useProListStore from '@/store/pro/list'
import { useGlobalToast } from '@cetus/design'
import { CommonTypeInfo, ToastType } from '@cetus/types'
import { NumericFormatInput, SingleCoinImage } from '@cetus/ui-kit'
import Icon from '@cetus/ui-kit/src/components/Icon'
import { d, formatNumberWithDown } from '@cetus/utils'
import { Box, HStack, Menu, MenuButton, MenuList, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

export default function ProQuickBuySelect({ isApp }: { isApp?: boolean }) {
  const QuickBuyCoinList = [
    {
      symbol: 'SUI',
      name: 'sui',
      coin_type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      logo_url: 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/sui-coin.svg/public',
      decimals: 9,
      limitBuy: 100 //最多兑换100SUI
    },
    {
      symbol: 'USDC',
      name: 'usdc',
      coin_type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      logo_url: 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/usdc.png/public',
      decimals: 6,
      limitBuy: 200 //最多兑换200USDC
    }
  ]

  const { quickCoin, setQuickCoin, quickAmount, setQuickAmount } = useProListStore()
  const [isFocus, setIsFocus] = useState(false)
  const { failedTsToast } = useGlobalToast()
  const handleChangeQuickCoin = (info: any) => {
    setQuickCoin(info)
    if (d(quickAmount).gt(info?.limitBuy)) {
      showTips(info)
      setQuickAmount(info?.limitBuy)
    }
  }

  const handleChangeQuickAmount = (value: string) => {
    console.log('🚀 ~ handleChangeQuickAmount ~ value:', value)
    console.log('🚀 ~ handleChangeQuickAmount ~ formatNumberWithDown(value, quickCoin?.decimals):', formatNumberWithDown(value, quickCoin?.decimals))
    setQuickAmount(value)
  }

  const handleBlur = () => {
    // 没有输入或者输入为0时 默认填充1; 输入超过限制购买数量 填充为最大购买数量 并提示toast
    const amount = !quickAmount || d(quickAmount).eq(0) ? '1' : d(quickAmount).gt(quickCoin?.limitBuy) ? quickCoin?.limitBuy : quickAmount
    setQuickAmount(formatNumberWithDown(amount, quickCoin?.decimals))
    if (d(quickAmount).gt(quickCoin?.limitBuy)) {
      showTips(quickCoin)
    }
    setIsFocus(false)
  }

  const showTips = (coin: any) => {
    const info: ToastType = {
      linkLabel: '',
      getShowInfo: () => {
        const info: CommonTypeInfo = {
          toastTitleText: `Quick buy currently supports input amounts up to ${coin?.limitBuy} ${coin?.symbol}. For bigger input, please initiate the trade from the swap page.`
        }
        return info
      }
    }
    failedTsToast(info)
  }

  return (
    <HStack
      minW={isApp ? 'unset' : '220px'}
      maxW={isApp ? '100%' : '220px'}
      background="bg_secondary"
      border="1px solid"
      borderColor={isFocus ? 'primary' : 'token_inactive_border'}
      height="36px"
      gap="0px"
      borderRadius="8px"
      pl={isApp ? '4px' : '8px'}
    >
      <Icon xlinkHref="#icon-icon_quick" svgFill="primary" svgHover="primary" cursor="text" w="16px" h="16px" />
      <Text fontSize="12px" color="text_paragraph" whiteSpace="nowrap" pr="8px" borderRight="1px solid" borderColor="border">
        {isApp ? 'Buy' : 'Quick Buy'}
      </Text>
      <Box
        flex="1"
        minW="30px"
        sx={{
          _hover: {
            input: {
              color: '#fff !important'
            }
          }
        }}
      >
        <NumericFormatInput
          style={{
            height: '16px',
            width: '100%',
            paddingLeft: '8px',
            paddingRight: '8px',
            variant: 'outline',
            fontSize: '14px',
            border: 'none',
            borderRadius: '0px',
            textAlign: isApp ? 'center' : 'right',
            outline: 'none',
            background: 'none',
            color: '#909ca4'
          }}
          decimals={quickCoin.decimals}
          placeholder="0.0"
          value={quickAmount}
          onChange={handleChangeQuickAmount}
          onFocus={() => setIsFocus(true)}
          onBlur={handleBlur}
        />
      </Box>
      <Menu isLazy placement="bottom-end">
        {({ isOpen, onClose }) => (
          <>
            <MenuButton pr={isApp ? '4px' : '8px'} sx={{ _hover: { svg: { fill: 'text_caption' }, p: { color: 'text_caption' } } }}>
              <HStack gap="4px">
                <SingleCoinImage imageUrl={quickCoin?.logo_url} w="16px" h="16px" />
                <Text as="p">{quickCoin?.symbol}</Text>
                <Icon
                  mt="1px"
                  xlinkHref="#icon-icon_arrow"
                  svgW="14px"
                  transition="transform 0.5s"
                  svgH="14px"
                  transform={isOpen ? 'rotate(180deg)' : 'none'}
                />
              </HStack>
            </MenuButton>
            <MenuList zIndex={9999} p="4px" minW="100px">
              <VStack gap="0px">
                {QuickBuyCoinList?.map(item => (
                  <HStack
                    key={item.symbol}
                    h="30px"
                    justify="center"
                    w="100%"
                    p="0 12px"
                    cursor="pointer"
                    onClick={() => {
                      handleChangeQuickCoin(item)
                      onClose()
                    }}
                    bg={quickCoin?.coin_type === item?.coin_type ? 'checked_bg' : 'none'}
                    borderRadius="8px"
                    _hover={{
                      p: {
                        color: quickCoin?.coin_type === item?.coin_type ? 'text_paragraph' : 'text_caption'
                      }
                    }}
                  >
                    <SingleCoinImage imageUrl={item?.logo_url} w="16px" h="16px" />
                    <Text fontSize="14px">{item.symbol}</Text>
                  </HStack>
                ))}
              </VStack>
            </MenuList>
          </>
        )}
      </Menu>
    </HStack>
  )
}
