import useStatsTokens from '@/hooks/stats/useStatsTokens'
import { getReversePrice } from '@/utils/pool'
import { InputBox, SelectTab } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NumericFormatInput } from '@cetus/ui-kit'
import { convertScientificToDecimal, d, formatPrice, isAvailablePrice, textEllipses } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Button, HStack, Heading, InputGroup, InputRightAddon, Stack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CompletedBlock from '../CompletedBlock'
import MarketPrice from './MarketPrice'
import { DLMMInitPriceProps } from './type'

function DLMMInitPrice({
  editStep,
  currentStep,
  onEdit,
  onContinue,
  baseToken,
  quoteToken,
  initPrice,
  onInitPriceChange
}: Omit<DLMMInitPriceProps, 'poolType'>) {
  const { isApp } = useWindowWidth()
  const [direct, setDirect] = useState(true)
  const { getTokenPrice, fetchTokenPrices } = useTokenPrice()
  const { getAllStatesTokens } = useStatsTokens()
  const [showRefPrice, setShowRefPrice] = useState<boolean>(false)
  const handleSwitchDirection = () => {
    setDirect(!direct)
  }
  const perText = useMemo(() => {
    return direct
      ? `${textEllipses(quoteToken?.symbol)} per ${textEllipses(baseToken?.symbol)}`
      : `${textEllipses(baseToken?.symbol)} per ${textEllipses(quoteToken?.symbol)}`
  }, [baseToken?.symbol, quoteToken?.symbol, direct])

  const tabList = useMemo(() => {
    if (baseToken && quoteToken) {
      return [baseToken, quoteToken].filter(Boolean).map(item => ({
        label: item?.symbol,
        isToken: true,
        imgInfo: {
          src: item?.logo_url,
          w: '16px',
          h: '16px',
          borderRadius: '50%',
          fallbackSrc: '/images/placeholder-token@2x.png'
        }
      }))
    }
    return []
  }, [baseToken, quoteToken])

  const marketPrice = useMemo(() => {
    if (baseToken && quoteToken) {
      const priceA = getTokenPrice(baseToken.coin_type)
      const priceB = getTokenPrice(quoteToken.coin_type)
      if (priceA && priceB) {
        return direct ? d(priceA?.price).div(priceB?.price).toString() : d(priceB?.price).div(priceA?.price).toString()
      }
    }
  }, [baseToken?.coin_type, quoteToken?.coin_type, direct, getTokenPrice])

  const fetchData = useCallback(async () => {
    try {
      if (baseToken?.coin_type && quoteToken?.coin_type) {
        const params = {
          coinTypes: [fixCoinType(baseToken?.coin_type, false), fixCoinType(quoteToken?.coin_type, false)]
        }
        const result: any = await getAllStatesTokens(params, false)
        if (result && result?.data?.length === 2) {
          console.log('🚀 ~ fetchData ~ result:', result)
          setShowRefPrice(!result?.data?.some(item => item?.tvl && d(item?.tvl?.replace(/[$,]/g, '')).lt(1000)))
        } else {
          setShowRefPrice(false)
        }
      }
    } catch (error) {}
  }, [baseToken?.coin_type, quoteToken?.coin_type])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <>
      {currentStep >= 3 ? (
        editStep === 3 || currentStep === 3 ? (
          <VStack w="100%" gap="32px" bg="bg_fifth" borderRadius="12px" p={{ base: '16px 8px', lg: '32px' }}>
            <VStack gap="8px" w="100%" align="flex-start">
              <Heading fontSize="16px" fontWeight="500">
                Set initial price
              </Heading>
              <Stack
                flexDir={{ base: 'column', lg: 'row' }}
                w="100%"
                justify="space-between"
                mt="-2px"
                alignItems={{ base: 'flex-start', lg: 'center' }}
              >
                <Text fontSize="12px">Please set an initial price for this new pool to start</Text>
                <SelectTab<any, any>
                  type="outlineTab"
                  tabList={tabList}
                  currentTab={direct ? baseToken?.symbol : quoteToken?.symbol}
                  handleChangeTab={tab => {
                    handleSwitchDirection()
                  }}
                  wrapStyle={{
                    w: { base: '100%', lg: 'auto' },
                    h: '32px',
                    p: '3px',
                    border: '1px solid',
                    borderColor: 'border',
                    borderRadius: '8px',
                    gap: '4px'
                  }}
                  itemStyle={{
                    flex: 1,
                    h: '24px',
                    p: '4px 12px',
                    borderRadius: '4px',
                    gap: '4px'
                  }}
                />
              </Stack>

              <InputBox mt="4px" h="48px" borderRadius="12px" p="16px">
                <InputGroup fontFamily="Inter" justifyContent="space-between" gap="12px">
                  <NumericFormatInput
                    value={initPrice ? formatPrice(convertScientificToDecimal(direct ? initPrice : getReversePrice(initPrice), 18), 18) : ''}
                    onChange={(value: string) => {
                      onInitPriceChange?.(direct ? value : isAvailablePrice(value) ? getReversePrice(value) : '')
                    }}
                    placeholder="0.0"
                    inputAllowed
                    decimals={18}
                    style={{
                      width: 'calc(100% - 8px)',
                      background: 'none',
                      whiteSpace: 'nowrap',
                      opacity: 1,
                      outline: 'none',
                      color: 'var(--chakra-colors-text_caption)',
                      fontSize: '16px',
                      fontWeight: '500',
                      height: '14px',
                      lineHeight: '20px',
                      touchAction: 'manipulation',
                      transition: 'all 0.3s'
                    }}
                  />
                  <InputRightAddon gap="4px">
                    <Text>{perText}</Text>
                  </InputRightAddon>
                </InputGroup>
              </InputBox>
              {showRefPrice && (
                <MarketPrice
                  inputPrice={initPrice && d(initPrice).gt(0) ? (direct ? initPrice : getReversePrice(initPrice)) : undefined}
                  marketPrice={marketPrice}
                  perText={perText}
                  onClick={() => onInitPriceChange(direct ? marketPrice : isAvailablePrice(marketPrice) ? getReversePrice(marketPrice) : '')}
                />
              )}
            </VStack>
            <VStack w="100%" align="flex-start" gap="12px">
              <Button
                mt="4px"
                w="100%"
                onClick={onContinue}
                isDisabled={!initPrice || !+initPrice}
                h="48px"
                fontSize="16px"
                borderRadius="12px"
                fontWeight="500"
              >
                {!initPrice || !+initPrice ? 'Enter initial price' : 'Create'}
              </Button>
            </VStack>
          </VStack>
        ) : (
          <CompletedBlock onEdit={onEdit}>
            <VStack gap="12px" align="flex-start">
              <HStack>
                <Text whiteSpace="nowrap">Initial price</Text>
                <Text
                  color="text_caption"
                  fontWeight="500"
                >{`${formatPrice(convertScientificToDecimal(direct ? initPrice : getReversePrice(initPrice), 18), 18)} ${perText}`}</Text>
              </HStack>
            </VStack>
          </CompletedBlock>
        )
      ) : null}
    </>
  )
}

export default DLMMInitPrice
