import { useRefValue } from '@/hooks/common/useRefValue'
import { RfqQuoteWidgetProps } from '@/types'
import { CurrentPrice } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { formatCurrencyWithKMB, formatNumber, textEllipses } from '@cetus/utils'
import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FC, useMemo } from 'react'
import { RfqLogoTitle } from './RfqLogoTitle'
import SolidPieCountdown from './SolidPieCountdown'

const slideUp = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideUpOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

export const RfqBottomWidget: FC<RfqQuoteWidgetProps> = ({
  rfqData,
  toCoin,
  fromCoin,
  onTrade,
  isShowRfqWidget,
  rftCountdownFlagRef,
  findRouterLoading
}) => {
  const { getTokenAmountValue } = useTokenPrice()
  const { isApp } = useWindowWidth()
  const amountValue = getTokenAmountValue(toCoin?.coin_type, rfqData?.toAmountUi)
  const rftCountdownFlag = useRefValue(rftCountdownFlagRef)

  const showRfqWidget = useMemo(() => {
    return rftCountdownFlag !== undefined && rftCountdownFlag > 0 && isShowRfqWidget
  }, [rftCountdownFlag, isShowRfqWidget])

  return (
    <VStack
      h={showRfqWidget ? '122px' : '0px'}
      overflow="hidden"
      transition="height 0.3s ease-out"
      w="100%"
      pt={showRfqWidget ? '10px' : '0px'}
      pl={isApp ? '8px' : '15px'}
      pr={isApp ? '8px' : '16px'}
      pb={showRfqWidget ? '12px' : '0px'}
      gap="0px"
      mt={isApp ? '-8px' : '0px'}
      mb={isApp ? '-20px' : '0px'}
      alignItems="start"
      borderRadius="20px"
      animation={`${showRfqWidget ? slideUp : slideUpOut} 0.3s ease-out forwards`}
      opacity={showRfqWidget ? 1 : 0}
      sx={{
        backgroundImage: "url('/images/rfq_bottom_widget_bg@2x.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '470px 122px'
      }}
    >
      <HStack w="100%" justifyContent="space-between" gap="2px">
        {/* Header */}
        <RfqLogoTitle bg_color="block_color_opacity.50" showTooltipIcon={true} tx_bg_color="linear(to-r, #72C1F7, #06FEBF)" font_size="12px" />

        <HStack flex={1} justifyContent="flex-end" gap="2px" minW="0">
          {/* Exchange Rate */}
          <CurrentPrice
            showSwitchIcon={false}
            noIcon={true}
            fromToken={fromCoin as Token}
            toToken={toCoin as Token}
            fromValue={rfqData?.fromAmountUi}
            toValue={rfqData?.toAmountUi}
            isLoading={findRouterLoading}
            color="text_caption"
            fontSize="12px"
            priceWrap={true}
          />

          <Image src="/images/img_bestrate@2x.png" w="71px" h="18px" />
        </HStack>
      </HStack>

      {/* Amount Display */}
      <HStack mt="10px" gap="8px" alignItems="end" whiteSpace="nowrap">
        <Text
          fontFamily="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji"
          textColor="text_caption"
          fontSize="28px"
          fontWeight="500"
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
        >
          {formatNumber(rfqData?.toAmountUi, toCoin?.decimals)}
        </Text>
        <Text textColor="text_caption" fontSize="16px" mb="2px" whiteSpace="nowrap">
          {textEllipses(toCoin?.symbol, 6)}
        </Text>
      </HStack>

      <HStack mt="10px" w="100%" justifyContent="space-between" alignItems="center">
        <Text textColor="primary_gray" fontSize="14px">
          {amountValue && !!+amountValue ? `${formatCurrencyWithKMB(amountValue, 2)}` : null}
        </Text>

        <Button
          onClick={() => {
            if (rfqData) {
              onTrade(rfqData)
            }
          }}
          h="24px"
          borderRadius="14px"
          pl="5px"
          pr="4px"
          w="148px"
        >
          <HStack gap="8px" justifyContent="start" w="100%">
            {showRfqWidget && (
              <HStack gap="2px" bg="bg_secondary" h="16px" p="3px" w="44px" borderRadius="8px">
                {/* <TooltipIcon
                    type="rfq_countdown"
                    showTooltipIcon={false}
                    children={
                      <SolidPieCountdown
                        rftCountdownFlag={rftCountdownFlag}
                        totalSeconds={Number(rfqData?.rfqQuote?.total_countdown || 0)}
                        text_size="12px"
                        outer_size="12.8px"
                        inner_size="9.6px"
                        text_width="28px"
                      />
                    }
                  /> */}

                <SolidPieCountdown
                  rftCountdownFlag={rftCountdownFlag}
                  totalSeconds={Number(rfqData?.rfqQuote?.total_countdown || 0)}
                  text_size="12px"
                  outer_size="12.8px"
                  inner_size="9.6px"
                  text_width="28px"
                />
              </HStack>
            )}

            <HStack w="100%" justifyContent="center">
              <HStack gap="0px">
                <Text fontSize="14px" color="rfq_btn_text_black" fontWeight="500">
                  Trade
                </Text>
                <Icon
                  ml="-4px"
                  svgH="12px"
                  svgW="12px"
                  xlinkHref="#icon-icon_arrow"
                  svgFill="rfq_btn_text_black"
                  svgHover="rfq_btn_text_black"
                  transform="rotate(-90deg)"
                />
              </HStack>
            </HStack>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  )
}
