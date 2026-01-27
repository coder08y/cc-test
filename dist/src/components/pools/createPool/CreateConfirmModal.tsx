import DepositRatio from '@/components/common/DepositRatio'
import PoolTag from '@/components/common/PoolTag'
import TotalAmount from '@/components/common/TotalAmount'
import PositionStatus from '@/components/position/common/PositionStatus'
import { TickData } from '@/types'
import { calcCoinProportion } from '@/utils/pool'
import { TradeConfirmAmountInfo } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { CoinPairImage, Icon } from '@cetus/ui-kit'
import { convertScientificToDecimal, d, formatNumber, formatPrice, textEllipses } from '@cetus/utils'
import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import PriceItem from './PriceItem'

export type CreateConfirmModalData = {
  isReverse: boolean
  baseToken: Token
  quoteToken: Token
  baseAmount: string
  quoteAmount: string
  minPrice: TickData
  maxPrice: TickData
  initPrice: string
  feeDisplay: string
  isFullRange: boolean
}

type CreateConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  data: CreateConfirmModalData
}

export default function CreateConfirmModal(props: CreateConfirmModalProps) {
  const { isOpen, onClose, onSubmit, data } = props
  const { baseToken, quoteToken, feeDisplay, baseAmount, quoteAmount, isReverse, initPrice, minPrice, maxPrice, isFullRange } = data
  const [direct, setDirect] = useState(true)

  const { getTokenAmountValue } = useTokenPrice()

  const baseAmountValue = getTokenAmountValue(baseToken?.coin_type, baseAmount)
  const quoteAmountValue = getTokenAmountValue(quoteToken?.coin_type, quoteAmount)

  const totalValue = useMemo(() => {
    return d(baseAmountValue || '0')
      .plus(quoteAmountValue || '0')
      .toString()
  }, [baseAmountValue, quoteAmountValue])

  const percentMap = useMemo(() => {
    return calcCoinProportion(baseAmount, quoteAmount, initPrice, isFullRange)
  }, [baseAmount, quoteAmount])

  const perText = useMemo(() => {
    return direct
      ? `${textEllipses(quoteToken?.symbol)}/${textEllipses(baseToken?.symbol)}`
      : `${textEllipses(baseToken?.symbol)}/${textEllipses(quoteToken?.symbol)}`
  }, [direct, baseToken?.symbol, quoteToken?.symbol])

  const showMinPrice = useMemo(() => {
    if (isFullRange) {
      return '0'
    }

    return isReverse
      ? direct
        ? minPrice?.displayReversePrice
        : maxPrice.displayPrice
      : direct
        ? minPrice?.displayPrice
        : maxPrice.displayReversePrice
  }, [direct])

  const showMaxPrice = useMemo(() => {
    if (isFullRange) {
      return '∞'
    }
    return isReverse
      ? direct
        ? maxPrice?.displayReversePrice
        : minPrice.displayPrice
      : direct
        ? maxPrice?.displayPrice
        : minPrice.displayReversePrice
  }, [direct])

  const isActive =
    isFullRange ||
    (isReverse
      ? d(minPrice?.reversePrice).lte(initPrice) && d(maxPrice?.reversePrice).gte(initPrice)
      : d(minPrice?.price).lte(initPrice) && d(maxPrice?.price).gte(initPrice))

  const { isApp } = useWindowWidth()

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Preview
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <VStack w="100%" gap="20px" p="8px 16px" pb="0px">
            {isApp ? (
              <HStack w="100%" h="40px">
                <CoinPairImage
                  coinACoinType={baseToken?.coin_type}
                  coinBCoinType={quoteToken?.coin_type}
                  coinAIconUrl={baseToken?.logo_url}
                  coinBIconUrl={quoteToken?.logo_url}
                  imageStyle={{
                    w: '40px',
                    h: '40px'
                  }}
                  imgBoxStyle={{
                    w: '40px',
                    h: '40px'
                  }}
                />
                <VStack gap="4px" align="flex-start">
                  <Text fontSize="16px" color="text_caption">
                    {`${textEllipses(baseToken?.symbol)} - ${textEllipses(quoteToken?.symbol)}`}
                  </Text>
                  <PoolTag poolType="clmm" displayFee={feeDisplay} />
                </VStack>
              </HStack>
            ) : (
              <HStack w="100%" justifyContent="space-between" h="40px">
                <HStack>
                  <CoinPairImage
                    coinACoinType={baseToken?.coin_type}
                    coinBCoinType={quoteToken?.coin_type}
                    coinAIconUrl={baseToken?.logo_url}
                    coinBIconUrl={quoteToken?.logo_url}
                    imageStyle={{
                      w: '40px',
                      h: '40px'
                    }}
                    imgBoxStyle={{
                      w: '40px',
                      h: '40px'
                    }}
                  />

                  <Text fontSize="16px" color="text_caption">
                    {`${textEllipses(baseToken?.symbol)} - ${textEllipses(quoteToken?.symbol)}`}
                  </Text>
                </HStack>
                <PoolTag poolType="clmm" displayFee={feeDisplay} />
              </HStack>
            )}

            {/* 交易数量展示 */}
            <TradeConfirmAmountInfo
              coinA={{
                amount: baseAmount,
                ...baseToken
              }}
              coinB={{
                amount: quoteAmount,
                ...quoteToken
              }}
            />
            <Box w="100%">
              <HStack w="100%" justify="space-between" h="32px">
                <Text fontSize="16px" fontWeight="500" color="text_caption">
                  Selected Range
                </Text>
                <PositionStatus isActive={isActive} isRow imgStyle={{ imgW: '29px', imgH: '16px' }} w="105px" h="32px" />
              </HStack>
              <HStack justify="center" bg="bg_secondary" borderRadius="8px" p="14px 12px" w="100%" gap="4px" mt="12px" flexWrap="wrap">
                <Text whiteSpace="nowrap">Current Pool Price</Text>

                <HStack gap="4px">
                  <Text as="span" color="text_caption" whiteSpace="nowrap">
                    {formatPrice(
                      convertScientificToDecimal(!direct ? formatNumber(d(1).div(initPrice).toFixed(18), 18, true).toString() : initPrice, 18),
                      18
                    )}
                  </Text>
                  <Text whiteSpace="nowrap">{perText}</Text>
                  <Button variant="unstyled" onClick={() => setDirect(!direct)} minW="20px" h="20px">
                    <Icon xlinkHref="#icon-icon_swap1" />
                  </Button>
                </HStack>
              </HStack>
              <HStack w="100%" h="100px" bg="bg_secondary" borderRadius="12px" mt="8px">
                <PriceItem title="Min Price" price={showMinPrice} perText={perText} />
                <Divider orientation="vertical" h="40px" />
                <PriceItem title="Max Price" price={showMaxPrice} perText={perText} />
              </HStack>
            </Box>
            <DepositRatio tokenA={baseToken} tokenB={quoteToken} percentMap={percentMap} type="text" />
            <TotalAmount totalAmount={totalValue} />
            <Button w="calc(100% + 32px)" bottom="0px" mt="4px" h="52px" borderRadius="12px" fontSize="16px" fontWeight="500" onClick={onSubmit}>
              Create and Add Liquidity
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
