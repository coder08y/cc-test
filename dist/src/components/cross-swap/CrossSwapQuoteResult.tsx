import { useGetQuoteShowDuration, useGetQuoteTag } from '@/hooks/cross-swap/useCrossHelper'
import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox, Icon, SingleCoinImage } from '@cetus/ui-kit'
import { Decimal, formatCurrency, formatNumber, isSuiCoin } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import CrossPriceRatio from './common/CrossPriceRatio'

export interface CrossSwapQuoteResultProps {
  platform: CrossSwapPlatform
  toCoinAmount?: string
  isShowCrossSelectRouter: boolean
  handleShowCrossSelectRouter: (isShow: boolean) => void
}

export default function CrossSwapQuoteResult(props: CrossSwapQuoteResultProps) {
  const { platform, isShowCrossSelectRouter, handleShowCrossSelectRouter } = props
  const { isApp } = useWindowWidth()

  const { findRouterLoading, quote } = useCrossSwapStore()

  // 获取报价标签
  const { tag } = useGetQuoteTag(quote?.quote?.lifi_quote?.tags || [])

  // 报价展示时间
  const { quoteShowDuration } = useGetQuoteShowDuration(quote?.execution_duration)

  const gasFeeObj = useMemo(() => {
    if (platform === CrossSwapPlatform.LI_FI) {
      const gasCosts = quote?.quote?.lifi_quote?.steps?.[0]?.estimate?.gasCosts
      if (gasCosts && gasCosts.length > 0) {
        const gasCost = gasCosts[0]
        if (isSuiCoin(gasCost.token.address)) {
          gasCost.token.logoURI = 'https://archive.cetus.zone/assets/image/sui/sui.png'
        }
        return gasCost
      }
    }
    return undefined
  }, [quote, platform])

  if (!quote) {
    return <></>
  }

  return (
    <VStack width="100%" p="8px 8px 16px" gap="12px">
      <CrossPriceRatio platform={platform} findRouterLoading={findRouterLoading} quote={quote} />
      <HTextLabelBox
        isLoading={findRouterLoading}
        label={'Minimum Received'}
        value={`${formatNumber(quote?.min_amount_out_formatted || '0', quote?.to_token?.decimals, false, Decimal.ROUND_DOWN)} ${quote?.to_token?.symbol}`}
        labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
        valueStyle={{ fontWeight: 500, fontSize: '14px' }}
        skeletonStyle={{
          valueW: '128px'
        }}
        wrapStyle={{
          p: '0 8px'
        }}
      />
      <HTextLabelBox
        isLoading={findRouterLoading}
        label={'Est. Completion'}
        value={`< ${quoteShowDuration}`}
        labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
        valueStyle={{ fontWeight: 500, fontSize: '14px' }}
        skeletonStyle={{
          valueW: '128px'
        }}
        wrapStyle={{
          p: '0 8px',
          mt: '4px'
        }}
      />
      <HTextLabelBox
        isLoading={findRouterLoading}
        rightValueTip={
          gasFeeObj ? (
            <Text>
              {formatNumber(fromDecimalsAmount(gasFeeObj?.amount || '0', gasFeeObj?.token?.decimals), gasFeeObj?.token?.decimals)}{' '}
              {gasFeeObj?.token?.symbol}
            </Text>
          ) : undefined
        }
        label={platform === CrossSwapPlatform.LI_FI ? 'Gas Fee' : 'Relayer Fee'}
        value={
          <HStack>
            {gasFeeObj && <SingleCoinImage borderRadius="50%" imageUrl={gasFeeObj?.token?.logoURI} w="16px" h="16px" />}
            <Text color="text_caption">{formatCurrency(quote.gas_cost_usd || '0', 2)}</Text>
          </HStack>
        }
        labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
        valueStyle={{ fontWeight: 500, fontSize: '14px', textDecoration: 'none' }}
        skeletonStyle={{
          valueW: '128px'
        }}
        wrapStyle={{
          p: '0 8px',
          mt: '4px'
        }}
      />
      {platform === CrossSwapPlatform.LI_FI && (
        <HTextLabelBox
          isLoading={findRouterLoading}
          label={'Router'}
          rightValueTip={isApp ? undefined : isShowCrossSelectRouter ? 'Hide routes' : 'View more routes'}
          valueStyle={{
            textDecoration: 'none'
          }}
          value={
            <HStack
              gap="4px"
              w="100%"
              justifyContent="flex-end"
              cursor="pointer"
              userSelect="none"
              onClick={() => handleShowCrossSelectRouter(!isShowCrossSelectRouter)}
            >
              {tag && (
                <Text
                  textAlign="center"
                  h="20px"
                  fontWeight="500"
                  fontSize="12px"
                  bg="primary_opacity.15"
                  p="2px 8px"
                  borderRadius="10px"
                  color="primary"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {tag}
                </Text>
              )}

              <SingleCoinImage
                borderRadius="50%"
                imageUrl={quote?.quote?.lifi_quote?.steps?.[0]?.toolDetails?.logoURI || '/images/base_return.png'}
                w="16px"
                h="16px"
              />
              <Icon xlinkHref="#icon-detail" boxW="12px" boxH="16px" />
            </HStack>
          }
          labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
          skeletonStyle={{
            valueW: '128px'
          }}
          wrapStyle={{
            p: '0 8px',
            mt: '4px'
          }}
        />
      )}
    </VStack>
  )
}
