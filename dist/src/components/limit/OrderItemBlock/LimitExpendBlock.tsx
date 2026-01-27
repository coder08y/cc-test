import { LimitOrderInfo } from '@/types/limit'
import { Block } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { bnToAmount, cancelBubble, formatNumber, timeFormatUTC } from '@cetus/utils'
import { HStack, HTMLChakraProps, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
interface LimitExpendBlockProps extends HTMLChakraProps<'div'> {
  historyInfo: LimitOrderInfo
  type?: 'card'
}
export const LimitExpendBlock = ({ historyInfo, type, ...rest }: LimitExpendBlockProps) => {
  const { getExplorerUrl } = useExplorer()
  const expendList = useMemo(() => {
    return historyInfo?.events || []
  }, [historyInfo])

  const { isApp } = useWindowWidth()
  return (
    <Block p="16px" borderTop="none" borderRadius=" 0 0 16px 16px" {...rest}>
      <VStack align="flex-start">
        {expendList.map((item: any) => {
          const { tokenInfo, text, icon, color, num } = getEventInfo(item, historyInfo)
          return (
            <VStack align="flex-start" w="100%" bg="card_bg" borderRadius="8px" p="12px" key={item?.tx} flexDirection={{ base: 'column', lg: 'row' }}>
              <HStack align={{ base: 'flex-start', lg: 'center' }} w="100%" gap="16px" justifyContent="space-between">
                <HStack
                  gap={type == 'card' ? '4px' : '8px'}
                  flexDirection={type == 'card' ? 'column' : 'row'}
                  align={type == 'card' ? 'flex-start' : 'center'}
                >
                  <HStack w="68px" justify="flex-start" gap="4px">
                    <Icon svgW="14px" xlinkHref={icon} svgFill={color} svgHover={color} />
                    <Text color={color}>{text}</Text>
                  </HStack>
                  {!isApp && (
                    <Text whiteSpace="nowrap" color="text_caption" h="20px" lineHeight="20px">
                      {num}&nbsp;{tokenInfo?.symbol}
                    </Text>
                  )}
                </HStack>
                <HStack
                  gap={type == 'card' ? '4px' : '20px'}
                  flexDirection={type == 'card' && !isApp ? 'column' : 'row'}
                  align={type == 'card' && !isApp ? 'flex-end' : 'center'}
                >
                  <Text h="20px" lineHeight="20px">
                    {timeFormatUTC(Number(item.block_time), '')} (UTC)
                  </Text>
                  <HStack
                    gap="4px"
                    cursor="pointer"
                    onClick={e => {
                      cancelBubble(e)
                      window.open(getExplorerUrl(item.tx, 'tx'))
                    }}
                    _hover={{
                      svg: {
                        fill: 'text_caption'
                      }
                    }}
                  >
                    {!isApp && <Text color="text_caption">View Transaction</Text>}
                    <Icon fontSize="16px" xlinkHref="#icon-icon_link3" />
                  </HStack>
                </HStack>
              </HStack>
              {isApp && (
                <Text whiteSpace="nowrap" color="text_caption" h="20px" lineHeight="20px">
                  {num}&nbsp;{tokenInfo?.symbol}
                </Text>
              )}
            </VStack>
          )
        })}
      </VStack>
    </Block>
  )
}
export const getEventInfo = (info: any, historyInfo: LimitOrderInfo) => {
  const { pay_coin, target_coin } = historyInfo
  const type = info?.event_type
  if (type.includes('OrderCanceledEvent')) {
    return {
      text: 'Cancel',
      color: 'primary_yellow',
      icon: '#icon-tx_remove',
      tokenInfo: pay_coin,
      num: `+${formatNumber(bnToAmount(info?.amount, pay_coin?.decimals))}`
    }
  } else if (type.includes('FlashLoanEvent')) {
    return {
      text: 'Trade',
      color: 'primary',
      icon: '#icon-a-icon_swap2',
      tokenInfo: target_coin,
      num: `+${formatNumber(bnToAmount(info?.amount, target_coin?.decimals))}`
    }
  } else if (type.includes('OrderPlacedEvent')) {
    return {
      text: 'Create',
      color: 'primary_green',
      icon: '#icon-a-icon_add1',
      num: `-${formatNumber(bnToAmount(info?.amount, pay_coin?.decimals))}`,
      tokenInfo: pay_coin
    }
  } else {
    return {
      text: '',
      icon: '',
      color: '',
      num: ``,
      tokenInfo: null
    }
  }
}
