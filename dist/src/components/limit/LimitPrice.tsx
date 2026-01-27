import useLimitActionStore from '@/store/limit/useLimitAction'
import { isDecimalWithZeros } from '@/utils'
import { CetusTooltip, InputBox } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, NumericFormatInput } from '@cetus/ui-kit'
import { d, formatNumberWithDown, formatPercentage, textEllipses } from '@cetus/utils'
import { Button, HStack, Spinner, Text, VStack } from '@chakra-ui/react'

type LimitPriceProps = {
  inputPrice?: string
  priceImpact?: string
  marketPrice?: string
  priceImpactInfo?: any
  priceImpactInfoLoading?: boolean
  handleMarketPriceClick: (isUse: boolean) => void
  setInputPrice: (price: string) => void
}

export function LimitPrice(props: LimitPriceProps) {
  const { isApp } = useWindowWidth()
  const { marketPrice, priceImpactInfo, priceImpactInfoLoading, priceImpact, inputPrice, handleMarketPriceClick, setInputPrice } = props
  const { payCoin, targetCoin, quoteToken, refreshPriceLoading, setQuoteToken } = useLimitActionStore()
  return (
    <InputBox w="calc(100% - 156px)">
      <VStack w="100%" gap="20px">
        <HStack w="100%" justifyContent="space-between" h="23px">
          <HStack>
            <Text fontSize="13px" fontWeight="500">
              {!targetCoin || !payCoin
                ? '-- at rate'
                : quoteToken?.coin_type === payCoin?.coin_type
                  ? `Buy ${textEllipses(targetCoin?.symbol, 10)} at rate`
                  : `Sell ${textEllipses(payCoin?.symbol, 10)} at rate`}
            </Text>

            {Number(priceImpact) !== 0 &&
              !refreshPriceLoading &&
              (priceImpactInfoLoading ? (
                <Spinner size="sm" />
              ) : (
                <CetusTooltip
                  placement="top"
                  tooltip={
                    <Text fontSize="12px" lineHeight="20px" maxW="220px">
                      {priceImpactInfo.tooltip}
                    </Text>
                  }
                >
                  <Text color={priceImpactInfo.color} minW="82px">
                    {d(priceImpact).gt(0) ? '+' : ''}
                    {Number(priceImpact) > 10000 ? '>10000%' : formatPercentage(priceImpact)}
                  </Text>
                </CetusTooltip>
              ))}
          </HStack>
          {payCoin && targetCoin && (marketPrice || refreshPriceLoading) && (
            <Button
              isLoading={refreshPriceLoading}
              loadingText="Market"
              minW="58px"
              h="22px"
              pl="4px"
              pr="4px"
              color="primary_gray"
              borderRadius="4px"
              variant="outline"
              fontWeight="500"
              fontSize="12px"
              flexShrink={0}
              onClick={() => handleMarketPriceClick(true)}
            >
              Market
            </Button>
          )}
        </HStack>

        <HStack w="100%" justifyContent="space-between">
          <NumericFormatInput
            value={
              inputPrice ? (isDecimalWithZeros(inputPrice) && Number(inputPrice) > 0 ? formatNumberWithDown(inputPrice).toString() : inputPrice) : ''
            }
            onChange={(value: string) => {
              console.log('🚀 ~ useEffect ~ useMarketPrice:', inputPrice, value)
              handleMarketPriceClick(false)
              setInputPrice(value)
            }}
            decimals={18}
            placeholder="0.0"
            style={{
              width: 'calc(100% - 8px)',
              background: 'none',
              whiteSpace: 'nowrap',
              opacity: 1,
              outline: 'none',
              color: 'var(--chakra-colors-text_caption)',
              fontSize: '20px',
              touchAction: 'manipulation',
              transition: 'all 0.3s'
            }}
          />

          {targetCoin && payCoin && (
            <HStack gap="4px">
              <Text textColor="text_caption">{quoteToken?.symbol}</Text>
              <Icon
                xlinkHref="#icon-icon_swap1"
                onClick={() => {
                  if (targetCoin && payCoin) {
                    if (quoteToken?.coin_type === payCoin?.coin_type) {
                      setQuoteToken(targetCoin)
                    } else {
                      setQuoteToken(payCoin)
                    }
                  }
                }}
              />
            </HStack>
          )}
        </HStack>
      </VStack>
    </InputBox>
  )
}
