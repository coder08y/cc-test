import DepositRatio from '@/components/common/DepositRatio'
import PoolTag from '@/components/common/PoolTag'
import TotalAmount from '@/components/common/TotalAmount'
import PositionStatus from '@/components/position/common/PositionStatus'
import ZapSubmiteInfo from '@/components/zap/ZapSubmiteInfo'
import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { PoolApiInfo, TickData, TokensMap } from '@/types'
import { TradeConfirmAmountInfo } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { CoinPairImage, Icon, VaulDrawer } from '@cetus/ui-kit'
import { formatNumberWithDown, textEllipses } from '@cetus/utils'
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
import { debounce } from 'lodash-es'
import { useMemo, useState } from 'react'

type FeeTierType = {
  title: string
  feeDisplay: string
  feeRate: string
  poolAddress: string
  tvl: string
}

type ZapDatType = {
  amount: string
  token: Token
}

type AddLiquidityConfirmModalProps = {
  onClose: () => void
  onSubmit: () => void
  data: {
    feeTier?: FeeTierType
    zapData?: ZapDatType
  }
}

export default function AddLiquidityConfirmModal(props: AddLiquidityConfirmModalProps) {
  const {
    onClose,
    onSubmit,
    data: { feeTier, zapData }
  } = props
  const { fromToken, toToken, fromAmount, toAmount, totalAmount, percentMap, fromTokenLock, toTokenLock } = useAddLiquidityStore()
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const { currentPriceData, apiPoolInfo } = useLiquidityStore()
  // const { setIsChecked } = useNotifiStore()
  const [direct, setDirect] = useState(true)
  const showReverse = useMemo(() => {
    if (apiPoolInfo?.tokenA?.coin_type === fromToken?.coin_type) {
      if (direct) {
        return false
      } else {
        return true
      }
    } else {
      if (direct) {
        return true
      } else {
        return false
      }
    }
  }, [apiPoolInfo, fromToken, toToken, direct])

  const perText = useMemo(() => {
    return direct
      ? `${textEllipses(toToken?.symbol, 10)}/${textEllipses(fromToken?.symbol, 10)}`
      : `${textEllipses(fromToken?.symbol, 10)}/${textEllipses(toToken?.symbol)}`
  }, [direct, fromToken?.symbol, toToken?.symbol])

  const onOk = debounce(
    () => {
      onSubmit()
      onClose()
    },
    1000,
    {
      leading: true,
      trailing: false
    }
  )

  // const { notifiStatus } = useNotifiStore()
  const { isApp } = useWindowWidth()

  return isApp ? (
    <VaulDrawer isOpen={true} onClose={onClose}>
      <VStack align="flex-start" minH="300px">
        <Heading fontWeight="500" fontSize="14px">
          Add Liquidity
        </Heading>
        <ConfirmContent
          onOk={onOk}
          fromToken={fromToken}
          toToken={toToken}
          feeTier={feeTier}
          zapData={zapData}
          fromTokenLock={fromTokenLock}
          toTokenLock={toTokenLock}
          showReverse={showReverse}
          lowerTickData={lowerTickData}
          upperTickData={upperTickData}
          apiPoolInfo={apiPoolInfo}
          percentMap={percentMap}
          currentPriceData={currentPriceData}
          totalAmount={totalAmount}
          direct={direct}
          setDirect={setDirect}
          perText={perText}
          fromAmount={fromAmount}
          toAmount={toAmount}
        />
      </VStack>
    </VaulDrawer>
  ) : (
    <Modal
      isOpen={true}
      onClose={() => {
        onClose()
        // setIsChecked(false)
      }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Add Liquidity
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <ConfirmContent
            onOk={onOk}
            fromToken={fromToken}
            toToken={toToken}
            feeTier={feeTier}
            zapData={zapData}
            fromTokenLock={fromTokenLock}
            toTokenLock={toTokenLock}
            showReverse={showReverse}
            lowerTickData={lowerTickData}
            upperTickData={upperTickData}
            apiPoolInfo={apiPoolInfo}
            percentMap={percentMap}
            currentPriceData={currentPriceData}
            totalAmount={totalAmount}
            direct={direct}
            setDirect={setDirect}
            perText={perText}
            fromAmount={fromAmount}
            toAmount={toAmount}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const PriceItem = ({ title, price, perText }: { title: string; price: string; perText: string }) => {
  return (
    <VStack flex="1" gap={{ base: '4px', lg: '8px' }}>
      <Text fontSize={{ base: '12px', lg: '14px' }}>{title}</Text>
      <Text color="text_caption" wordBreak="break-all" fontSize={{ base: '12px', lg: '14px' }}>
        {price}
      </Text>
      <Text fontSize={{ base: '12px', lg: '14px' }}>{perText?.replace('/', ' per ')}</Text>
    </VStack>
  )
}

interface ConfirmContentProps {
  fromToken?: Token
  toToken?: Token
  feeTier?: FeeTierType
  zapData?: ZapDatType
  fromTokenLock: boolean
  toTokenLock: boolean
  showReverse: boolean
  lowerTickData: Partial<TickData>
  upperTickData: Partial<TickData>
  apiPoolInfo: PoolApiInfo | null
  percentMap: TokensMap
  currentPriceData: any
  totalAmount?: string
  direct: boolean
  setDirect: (value: boolean) => void
  perText: string
  fromAmount: string
  toAmount: string
  onOk: () => void
}

const ConfirmContent = ({
  fromToken,
  toToken,
  feeTier,
  zapData,
  fromTokenLock,
  toTokenLock,
  showReverse,
  lowerTickData,
  upperTickData,
  apiPoolInfo,
  percentMap,
  currentPriceData,
  totalAmount,
  direct,
  setDirect,
  perText,
  fromAmount,
  toAmount,
  onOk
}: ConfirmContentProps) => {
  const { isApp } = useWindowWidth()
  return (
    <VStack w="100%" gap={{ base: '12px', lg: '20px' }} p={{ base: '12px 0', lg: '8px 16px' }}>
      {' '}
      {/* pb={{base: '58px', lg: '0px'}} */}
      <HStack w="100%" justifyContent="space-between" h={{ base: '20px', lg: '40px' }}>
        <HStack>
          <CoinPairImage
            coinACoinType={fromToken?.coin_type}
            coinBCoinType={toToken?.coin_type}
            coinAIconUrl={fromToken?.logo_url}
            coinBIconUrl={toToken?.logo_url}
            imageStyle={{
              w: { base: '20px', lg: '40px' },
              h: { base: '20px', lg: '40px' }
            }}
            imgBoxStyle={{
              w: { base: '20px', lg: '40px' },
              h: { base: '20px', lg: '40px' }
            }}
          />
          <Text fontSize={{ base: '14px', lg: '16px' }} color="text_caption" textAlign="left">
            {`${textEllipses(fromToken?.symbol, 10)} - ${textEllipses(toToken?.symbol, 10)}`}
          </Text>
        </HStack>
        <PoolTag poolType="clmm" displayFee={feeTier?.feeDisplay} />
      </HStack>
      {/* 交易数量展示 */}
      {zapData ? (
        <TradeConfirmAmountInfo
          coinA={{
            amount: zapData?.amount as string,
            ...(zapData?.token as Token)
          }}
        />
      ) : (
        <TradeConfirmAmountInfo
          coinA={{
            amount: fromAmount as string,
            ...(fromToken as Token)
          }}
          coinB={{
            amount: toAmount as string,
            ...(toToken as Token)
          }}
        />
      )}
      <Box w="100%">
        <HStack w="100%" justify="space-between" h={{ base: '20px', lg: '32px' }}>
          <Text fontSize={{ base: '12px', lg: '16px' }} fontWeight="500" color="text_caption">
            Selected Range
          </Text>
          <PositionStatus
            isActive={!fromTokenLock && !toTokenLock}
            isRow
            imgStyle={{ imgW: isApp ? '18' : '29px', imgH: isApp ? '10px' : '16px' }}
            w={{ base: '66px', lg: '105px' }}
            h={{ base: '20px', lg: '32px' }}
          />
        </HStack>
        <VStack
          gap="0"
          border="1px solid"
          bg="bg_secondary"
          borderColor="border"
          borderRadius={{ base: '8px', lg: '12px' }}
          mt={{ base: '12px', lg: '8px' }}
        >
          <HStack justify="center" p={{ base: '8px', lg: '14px 12px' }} w="100%" gap="4px" flexWrap="wrap">
            <Text fontSize={{ base: '12px', lg: '14px' }}>Current Pool Price</Text>

            <HStack gap="4px">
              <Text as="span" color="text_caption" maxW="200px" wordBreak="break-all" whiteSpace="nowrap" fontSize={{ base: '12px', lg: '14px' }}>
                {formatNumberWithDown(showReverse ? currentPriceData.reverseCurrentPrice : currentPriceData?.currentPrice, 6)}
              </Text>
              <Text whiteSpace="nowrap" fontSize={{ base: '12px', lg: '14px' }}>
                {perText}
              </Text>
              <Button variant="unstyled" onClick={() => setDirect(!direct)} minW="20px" h="20px">
                <Icon xlinkHref="#icon-icon_swap1" fontSize={{ base: '14px', lg: '20px' }} />
              </Button>
            </HStack>
          </HStack>
          <Box h="1px" w="calc(100% - 32px)" p="0 12px" bg="border" />
          <HStack w="100%" h={{ base: '80px', lg: '100px' }}>
            <PriceItem
              title="Min Price"
              price={formatNumberWithDown(showReverse ? upperTickData?.reversePrice : lowerTickData?.price, 6)}
              perText={perText}
            />
            <Divider orientation="vertical" h="40px" />
            <PriceItem
              title="Max Price"
              price={formatNumberWithDown(showReverse ? lowerTickData?.reversePrice : upperTickData?.price, 6)}
              perText={perText}
            />
          </HStack>
        </VStack>
      </Box>
      {zapData ? (
        <ZapSubmiteInfo action="Deposit" inConfirmModal={true} />
      ) : (
        <>
          <DepositRatio
            tokenA={fromToken}
            tokenB={toToken}
            isReverse={fromToken?.coin_type !== apiPoolInfo?.tokenA?.coin_type}
            type="text"
            percentMap={percentMap}
          />
          <TotalAmount loading={false} totalAmount={totalAmount} />
        </>
      )}
      {/* {!fromTokenLock && !toTokenLock && !(lowerTickData?.price === '0' && upperTickData?.price === '∞') && notifiStatus == 'authenticated' && (
              <RangeAlerts
                subscriptionSource="AddLiquidity"
                title="Range alerts for this position"
                description="Subscribe to receive alerts on email, SMS, or Telegram when the price for this pool moves out of your selected range."
                wrapStyle={{
                  bg: 'bg_secondary',
                  borderRadius: '12px'
                }}
              />
            )} */}
      <Button
        w={{ base: '100%' }}
        bottom="0px"
        mt="4px"
        h={{ base: '42px', lg: '52px' }}
        borderRadius={{ base: '8px', lg: '12px' }}
        fontSize={{ base: '14px', lg: '16px' }}
        fontWeight="500"
        onClick={onOk}
      >
        Add Liquidity
      </Button>
    </VStack>
  )
}
