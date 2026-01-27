import PoolTag from '@/components/common/PoolTag'
import useCreateDlmmPoolStore from '@/store/pool/createDlmmPool'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage, Icon } from '@cetus/ui-kit'
import { convertScientificToDecimal, d, formatNumber, formatPrice, textEllipses } from '@cetus/utils'
import { Button, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

type CreateConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function CreateDlmmConfirmModal(props: CreateConfirmModalProps) {
  const { isOpen, onClose, onSubmit } = props
  const { baseToken, quoteToken } = useCreatePoolStore()
  const {
    baseAmount,
    quoteAmount,
    initPrice,
    binStep,
    strategy,
    minPriceData,
    maxPriceData,
    createBinInfos,
    positionCount,
    baseTokenLock,
    quoteTokenLock
  } = useCreateDlmmPoolStore()
  const [direct, setDirect] = useState(true)

  // const { getTokenAmountValue } = useTokenPrice()

  // const baseAmountValue = getTokenAmountValue(baseToken?.coin_type, baseAmount)
  // const quoteAmountValue = getTokenAmountValue(quoteToken?.coin_type, quoteAmount)

  // const totalValue = useMemo(() => {
  //   return d(baseAmountValue || '0')
  //     .plus(quoteAmountValue || '0')
  //     .toString()
  // }, [baseAmountValue, quoteAmountValue])

  const perText = useMemo(() => {
    return direct
      ? `${textEllipses(quoteToken?.symbol)} per ${textEllipses(baseToken?.symbol)}`
      : `${textEllipses(baseToken?.symbol)} per ${textEllipses(quoteToken?.symbol)}`
  }, [direct, baseToken?.symbol, quoteToken?.symbol])

  // const showMinPrice = useMemo(() => {
  //   return direct ? minPriceData?.displayPrice : maxPriceData?.displayReversePrice
  // }, [direct, minPriceData, maxPriceData])

  // const showMaxPrice = useMemo(() => {
  //   return direct ? maxPriceData?.displayPrice : minPriceData?.displayReversePrice
  // }, [direct, maxPriceData, minPriceData])

  const isActive = !baseTokenLock && !quoteTokenLock

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
                <VStack align="flex-start" gap="4px">
                  <Text fontSize="16px" color="text_caption">
                    {`${textEllipses(baseToken?.symbol, 8)} - ${textEllipses(quoteToken?.symbol, 8)}`}
                  </Text>
                  <PoolTag poolType="dlmm" displayFee={binStep?.feeDisplay} binStep={binStep?.binStep} />
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
                    {`${textEllipses(baseToken?.symbol, 8)} - ${textEllipses(quoteToken?.symbol, 8)}`}
                  </Text>
                </HStack>
                <PoolTag poolType="dlmm" displayFee={binStep?.feeDisplay} binStep={binStep?.binStep} />
              </HStack>
            )}

            <HStack justify="space-between" bg="bg_secondary" p="16px 8px" borderRadius="12px" w="100%" mt="12px" flexWrap="wrap">
              <Text whiteSpace="nowrap">Initial Price</Text>
              <HStack gap="4px">
                <Text as="span" color="text_caption">
                  {formatPrice(
                    convertScientificToDecimal(!direct ? formatNumber(d(1).div(initPrice).toFixed(18), 18, true).toString() : initPrice, 18),
                    18
                  )}
                </Text>
                <Text whiteSpace="nowrap">{perText}</Text>
                <Button
                  variant="unstyled"
                  onClick={() => setDirect(!direct)}
                  w="20px"
                  h="20px"
                  minW="20px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon xlinkHref="#icon-icon_swap1" fontSize="16px" />
                </Button>
              </HStack>
            </HStack>
            {/* 交易数量展示 */}
            {/* <TradeConfirmAmountInfo
              coinA={{
                amount: baseAmount,
                ...baseToken
              }}
              coinB={{
                amount: quoteAmount,
                ...quoteToken
              }}
            /> */}
            {/* <Box w="100%"> */}
            {/* <HStack w="100%" justify="space-between" h="32px">
                <Text fontSize="16px" fontWeight="500" color="text_caption">
                  Selected Range
                </Text>
                <PositionStatus isActive={isActive} isRow imgStyle={{ imgW: '29px', imgH: '16px' }} w="105px" h="32px" />
              </HStack>
              <HStack justify="center" bg="bg_secondary" borderRadius="8px" h="48px" w="100%" gap="4px" mt="12px">
                <Text>Current Price</Text>
                <Text as="span" color="text_caption">
                  {formatPrice(
                    convertScientificToDecimal(!direct ? formatNumber(d(1).div(initPrice).toFixed(18), 18, true).toString() : initPrice, 18),
                    18
                  )}
                </Text>
                <Text>{perText}</Text>
                <Button variant="unstyled" onClick={() => setDirect(!direct)}>
                  <Icon xlinkHref="#icon-icon_swap1" />
                </Button>
              </HStack> */}
            {/* <HStack w="100%" h="100px" bg="bg_secondary" borderRadius="12px" mt="8px">
                <PriceItem title="Min Price" price={showMinPrice + ''} perText={perText} />
                <Divider orientation="vertical" h="40px" />
                <PriceItem title="Max Price" price={showMaxPrice + ''} perText={perText} />
              </HStack> */}
            {/* </Box> */}
            {/* <TotalAmount totalAmount={totalValue} /> */}
            <Button w="calc(100% + 32px)" bottom="0px" mt="4px" h="52px" borderRadius="12px" fontSize="16px" fontWeight="500" onClick={onSubmit}>
              Create
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
