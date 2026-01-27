import { useRefValue } from '@/hooks/common/useRefValue'
import { RfqQuoteWidgetProps } from '@/types/swap'
import { CurrentPrice } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { formatCurrencyWithKMB, formatNumber, textEllipses } from '@cetus/utils'
import { Button, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FC, useMemo } from 'react'
import { RfqLogoTitle } from './RfqLogoTitle'
import SolidPieCountdown from './SolidPieCountdown'

const slideIn = keyframes`
  0% { transform: translateX(-50%); }
  60% { transform: translateX(5%); }
  80% { transform: translateX(-5%); }
  100% { transform: translateX(0); }
`

const slideOut = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(5%); }
  40% { transform: translateX(-5%); }
  100% { transform: translateX(-100%); }
`

export const RfqRightWidget: FC<RfqQuoteWidgetProps> = ({
  rfqData,
  toCoin,
  fromCoin,
  onTrade,
  isShowRfqWidget,
  findRouterLoading,
  rftCountdownFlagRef
}) => {
  const { getTokenAmountValue } = useTokenPrice()
  const rftCountdownFlag = useRefValue(rftCountdownFlagRef)

  const amountValue = getTokenAmountValue(toCoin?.coin_type, rfqData?.toAmountUi)

  const showRfqWidget = useMemo(() => {
    return rftCountdownFlag !== undefined && rftCountdownFlag > 0 && isShowRfqWidget
  }, [rftCountdownFlag, isShowRfqWidget])

  return (
    <VStack
      position="absolute"
      top="170px"
      right="-246px"
      w="240px"
      pt="10px"
      pl="12px"
      pr="16px"
      pb="10px"
      gap="0px"
      borderRadius="20px"
      animation={showRfqWidget ? `${slideIn} 0.3s ease-out` : `${slideOut} 0.3s ease-out`}
      visibility={showRfqWidget ? 'visible' : 'hidden'}
      opacity={showRfqWidget ? 1 : 0}
      transition="visibility 0.3s, opacity 0.3s"
      sx={{
        backgroundImage: "url('/images/bg_tide@2x.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '240px 182px'
      }}
    >
      <HStack w="100%" justifyContent="space-between">
        {/* Header */}
        <RfqLogoTitle bg_color="block_color_opacity.50" showTooltipIcon={true} tx_bg_color="linear(to-r, #72C1F7, #06FEBF)" font_size="12px" />

        <Image src="/images/img_bestrate@2x.png" w="71px" h="18px" />
      </HStack>

      {/* Amount Display */}
      <Skeleton mt="22px" isLoaded={rfqData !== undefined}>
        <HStack gap="4px" maxW="220px">
          <Text textColor="text_caption" fontSize="20px" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {formatNumber(rfqData?.toAmountUi, toCoin?.decimals)}
          </Text>
          <Text textColor="rfq_text_grey" fontSize="14px" whiteSpace="nowrap">
            {textEllipses(toCoin?.symbol, 10)}
          </Text>
        </HStack>
      </Skeleton>
      {/* Amount Value Display */}
      <Text mt="8px" textColor="rfq_text_grey" fontSize="12px" mb="28px">
        {amountValue && !!+amountValue ? `${formatCurrencyWithKMB(amountValue, 2)}` : null}
      </Text>

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
      />

      {/* Trade Button */}
      <Button
        mt="8px"
        onClick={() => {
          if (rfqData) {
            onTrade(rfqData)
          }
        }}
        h="28px"
        w="148px"
        borderRadius="14px"
        pl="13px"
      >
        <HStack gap="8px" w="100%" justifyContent="space-between">
          {showRfqWidget && (
            <HStack gap="2px" bg="bg_secondary" h="16px" p="3px" borderRadius="8px" w="44px" alignItems="center">
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
    </VStack>
  )
}
