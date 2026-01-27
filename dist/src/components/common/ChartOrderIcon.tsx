import useGlobalStore from '@/store/common/global'
import { CetusTooltip, IconBg } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Center, HStack, Text } from '@chakra-ui/react'

export const ChartOrderIcon = () => {
  const { isApp } = useWindowWidth()
  const { isShowTradeChart, setIsShowTradeChart, isShowTradeOrders, setIsShowTradeOrders } = useGlobalStore()
  return (
    <HStack w={'64px'} justify="space-between">
      <CetusTooltip
        showTooltip={isApp ? false : true}
        placement="bottom-end"
        tooltip={<Text fontSize="12px">{isShowTradeChart ? 'Hide reference price' : 'View reference price'}</Text>}
      >
        <Center>
          <IconBg
            w="28px"
            h="28px"
            borderRadius="8px"
            variant=""
            xlinkHref="#icon-icon_kline"
            svgFill={isShowTradeChart ? 'primary' : ''}
            svgHover={isShowTradeChart ? 'primary' : isApp ? 'text_paragraph' : 'text_caption'}
            onClick={() => setIsShowTradeChart(!isShowTradeChart)}
          />
        </Center>
      </CetusTooltip>
      <CetusTooltip
        showTooltip={isApp ? false : true}
        placement="bottom-end"
        tooltip={<Text fontSize="12px">{isShowTradeOrders ? 'Hide Orders' : 'View Orders'}</Text>}
      >
        <Center>
          <IconBg
            w="28px"
            h="28px"
            borderRadius="8px"
            variant=""
            xlinkHref="#icon-icon_order"
            svgFill={isShowTradeOrders ? 'primary' : ''}
            svgHover={isShowTradeOrders ? 'primary' : isApp ? 'text_paragraph' : 'text_caption'}
            onClick={() => setIsShowTradeOrders(!isShowTradeOrders)}
          />
        </Center>
      </CetusTooltip>
    </HStack>
  )
}
