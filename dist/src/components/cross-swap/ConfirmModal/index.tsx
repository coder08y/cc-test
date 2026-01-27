import { useGetPriceAcceptQuote } from '@/hooks/cross-swap/useCrossHelper'
import { useCrossPriceImpact } from '@/hooks/cross-swap/useCrossPriceImpact'
import useGlobalStore from '@/store/common/global'
import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import { AddressCopyLink, CurrentPrice, TradeConfirmAmountInfo } from '@cetus/design'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { Decimal, formatNumber, textEllipses } from '@cetus/utils'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { CrossSwapQuote } from '@cetusprotocol/cross-swap-sdk'
import { Button, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { cloneDeep } from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import ChainBlock from '../common/ChainBlock'

type CrossSwapConfirmModalProps = {
  isOpen: boolean
  originQuote: CrossSwapQuote
  onClose: () => void
}
export default function CrossSwapConfirmModal(props: CrossSwapConfirmModalProps) {
  const { originQuote, isOpen, onClose } = props
  const [originData, setOriginData] = useState<CrossSwapQuote>(originQuote)
  const { amount_in, amount_out, min_amount_out, from_token, to_token } = originData
  const { quote: newQuote } = useCrossSwapStore()

  const amount_in_ui = useMemo(() => {
    return fromDecimalsAmount(amount_in, from_token.decimals).toString()
  }, [amount_in, from_token])
  const amount_out_ui = useMemo(() => {
    return fromDecimalsAmount(amount_out, to_token.decimals).toString()
  }, [amount_out, to_token])

  // 计算价差
  const {
    priceImpactTextInfo,
    marketPrice,
    sources: priceSources,
    showPriceImpactTips,
    showPriceImpactWarn,
    showIncalculable
  } = useCrossPriceImpact(originQuote.platform, from_token, to_token, amount_in_ui, amount_out_ui)

  const { crossSwapSlippage } = useGlobalStore()

  // 用户点击了 忽视PriceImpact
  const [ignorePriceImpact, setIgnorePriceImpact] = useState<boolean>(false)

  // 如兑换价格和原始值不一致，返回变动后对象
  const { priceAcceptRouterData } = useGetPriceAcceptQuote(originData, newQuote)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const showPriceUpdated = useMemo(() => {
    return priceAcceptRouterData !== undefined
  }, [priceAcceptRouterData])

  const isClicking = useRef(false)

  const handlePriceAcceptClick = () => {
    if (priceAcceptRouterData) {
      if (isClicking.current) return
      isClicking.current = true

      const safeData = cloneDeep(priceAcceptRouterData)
      setOriginData(safeData)

      setTimeout(() => {
        isClicking.current = false
      }, 300)
    }
  }

  const buttonDisabled = useMemo(() => {
    if (ignorePriceImpact) {
      return false
    }

    if (showPriceImpactWarn) {
      return true
    }
    return false
  }, [ignorePriceImpact, showPriceImpactWarn])

  const onSubmitClick = () => {}

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Swap
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <VStack textAlign="center" p="0px" w="100%">
            <VStack w="100%" gap="16px" pl="16px" pr="16px" pb="16px">
              {/* 交易数量展示 */}
              <TradeConfirmAmountInfo
                bg={'bg_primary'}
                coinA={{
                  amount: amount_in_ui || '0',
                  logo_url: from_token.logo_url,
                  symbol: from_token.symbol,
                  coin_type: from_token.address
                }}
                iconParams={{
                  xlinkHref: '#icon-a-icon_trade',
                  svgFill: 'text_caption',
                  fontSize: '12px'
                }}
                coinB={{
                  amount: amount_out_ui || '0',
                  logo_url: to_token.logo_url,
                  symbol: to_token.symbol,
                  coin_type: to_token.address
                }}
              />
              {/* 价格 */}
              <HStack
                w="100%"
                minH="48px"
                bg={'bg_primary'}
                borderRadius="8px"
                border="1px solid"
                borderColor="border"
                justifyContent="center"
                zIndex="100"
              >
                <CurrentPrice
                  fromToken={from_token! as any}
                  toToken={to_token! as any}
                  fromValue={amount_in_ui}
                  toValue={amount_out_ui}
                  color="text_caption"
                />
              </HStack>
              {/* 价格提示	 */}
              {showPriceImpactTips && (
                <HStack
                  zIndex="99"
                  w="100%"
                  mt="-26px"
                  bg={showPriceImpactWarn ? 'primary_red_opacity.10' : 'primary_yellow_opacity.10'}
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="border"
                  justifyContent="center"
                  p="18px 16px 10px"
                >
                  <Text
                    color={showPriceImpactWarn ? 'primary_red' : 'primary_yellow'}
                    fontSize="12px"
                    lineHeight="20px"
                    textAlign="start"
                    fontWeight="500"
                  >
                    High price difference. Be cautious before submitting your order.
                  </Text>
                </HStack>
              )}

              <HTextLabelBox
                wrapStyle={{ h: '20px', lineHeight: '20px' }}
                label={'Minimum Received'}
                labelStyle={{
                  fontSize: '14px'
                }}
                value={`${formatNumber(min_amount_out || 0, to_token?.decimals, false, Decimal.ROUND_DOWN).toString()} ${textEllipses(to_token?.symbol)}`}
                valueStyle={{
                  fontSize: '14px'
                }}
              />

              <HTextLabelBox
                wrapStyle={{ h: '20px', lineHeight: '20px' }}
                label="Slippage Tolerance"
                labelStyle={{
                  fontSize: '14px'
                }}
                value={`${d(crossSwapSlippage).mul(100)}%`}
                valueStyle={{
                  fontSize: '14px'
                }}
              />
              <HTextLabelBox
                wrapStyle={{ h: '20px', lineHeight: '20px' }}
                label="Est. Completion"
                labelStyle={{
                  fontSize: '14px'
                }}
                value={`< 60s`}
                valueStyle={{
                  fontSize: '14px'
                }}
              />
              <HTextLabelBox
                wrapStyle={{ h: '20px', lineHeight: '20px' }}
                label="Source Address"
                labelStyle={{
                  fontSize: '14px'
                }}
                value={
                  <HStack>
                    <ChainBlock chainLogo="/images/chain/solana@2x.png" chainName="Sloana" type="default" />
                    <AddressCopyLink address={'xxxxxx'} onClickLink={() => window.open()} showLink={false} fontSize="14px" color="text_caption" />
                  </HStack>
                }
                valueStyle={{
                  fontSize: '14px'
                }}
              />
              <HTextLabelBox
                wrapStyle={{ h: '20px', lineHeight: '20px' }}
                label="Destination Address"
                labelStyle={{
                  fontSize: '14px'
                }}
                value={
                  <HStack>
                    <ChainBlock chainLogo="/images/chain/solana@2x.png" chainName="Sloana" type="default" />
                    <AddressCopyLink address={'xxxxxx'} onClickLink={() => window.open()} showLink={false} fontSize="14px" color="text_caption" />
                  </HStack>
                }
              />

              <HTextLabelBox
                wrapStyle={{ h: '20px', lineHeight: '20px' }}
                label="Relayer Fee"
                labelStyle={{
                  fontSize: '14px'
                }}
                value={'#1.23'}
              />
              {/* 价差 */}
              {/* <PriceImpact
                fromToken={from_token!}
                toToken={to_token!}
                sources={priceSources}
                marketPrice={marketPrice}
                priceImpact={priceImpactTextInfo}
                showIncalculable={showIncalculable}
              /> */}
              {/* 价格警告 */}

              {showPriceImpactWarn && (
                <VStack w="100%" gap="8px">
                  <HStack
                    w="100%"
                    bg="primary_red_opacity.10"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="border"
                    justifyContent="start"
                    p="10px 16px"
                  >
                    <Text color="primary_red" fontSize="12px" lineHeight="20px" textAlign="start">
                      The exchange rate of this order deviates from the market price by a large percentage. Are you sure you want to continue the
                      swap?
                    </Text>
                  </HStack>
                  <HStack w="100%" justifyContent="space-between" gap="16px">
                    <Button
                      variant="outline"
                      w="100%"
                      color="text_highlight"
                      fontSize="14px"
                      borderColor={ignorePriceImpact ? 'text_highlight' : 'button_outline_border'}
                      onClick={() => {
                        setIgnorePriceImpact(true)
                      }}
                    >
                      Yes, please continue.
                    </Button>
                    <Button variant="outline" w="100%" color="text_highlight" fontSize="14px" borderColor="button_outline_border" onClick={onClose}>
                      No,cancel it.
                    </Button>
                  </HStack>
                </VStack>
              )}

              {showPriceUpdated && (
                <HStack w="100%" justifyContent="space-between">
                  <HStack>
                    <Icon xlinkHref="#icon-icon_priceupdated1" svgW="20px" svgH="20px" />
                    <Text color="text_caption" fontWeight="500" fontSize="14px">
                      Price updated
                    </Text>
                  </HStack>
                  <Button onClick={handlePriceAcceptClick} h="40px" borderRadius="12px" fontSize="16px" fontWeight="500" p="0 42px">
                    Accept
                  </Button>
                </HStack>
              )}
            </VStack>
            {!showPriceUpdated && (
              <Button
                isDisabled={buttonDisabled}
                isLoading={isLoading}
                mt="4px"
                w="100%"
                h="52px"
                borderRadius="12px"
                fontSize="16px"
                fontWeight="500"
                variant={'solid'}
                onClick={() => {
                  if (isLoading) {
                    return
                  }
                  setIsLoading(true)
                  onSubmitClick()
                }}
              >
                {'Confirm Swap'}
              </Button>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
