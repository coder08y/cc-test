import PoolTag from '@/components/common/PoolTag'
import TotalAmount from '@/components/common/TotalAmount'
import PositionStatus from '@/components/position/common/PositionStatus'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore, { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { DLMMPoolApiInfo } from '@/types'
import { TradeConfirmAmountInfo } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useNotifiStore from '@cetus/stores/src/notifi'
import { Token } from '@cetus/types'
import { CoinPairImage, Icon, VaulDrawer } from '@cetus/ui-kit'
import { d, formatCurrencyWithKMB, formatPrice, textEllipses } from '@cetus/utils'
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
import DlmmZapRoute from './deposit/DlmmZapRoute'
import { DLMMZapProps } from './deposit/type'

type DLMMAddLiquidityConfirmModalProps = {
  onClose: () => void
  onSubmit: () => void
  data: {
    baseFeeDisplay?: string
  }
  isReverse?: boolean
  isDirect: boolean
  zapProps?: DLMMZapProps
  currentRangeTab: string
}

export default function DLMMAddLiquidityConfirmModal(props: DLMMAddLiquidityConfirmModalProps) {
  const {
    onClose,
    onSubmit,
    data: { baseFeeDisplay },
    isReverse = false,
    isDirect,
    zapProps,
    currentRangeTab
  } = props
  const { fromToken, toToken, fromAmount, toAmount, byAmountIn, totalAmount, fromTokenLock, toTokenLock, minPriceData, maxPriceData, positionCount } =
    useAddDlmmLiquidityStore()
  const { dlmmApiPoolInfo, currentPrice, dlmmContractPoolInfo } = useDlmmLiquidityStore()
  const { getTokenAmountValue } = useTokenPrice()

  const { setIsChecked } = useNotifiStore()
  const [direct, setDirect] = useState(isDirect)

  const perText = useMemo(() => {
    return direct
      ? `${textEllipses(dlmmApiPoolInfo?.displayTokenB?.symbol, 10)}/${textEllipses(dlmmApiPoolInfo?.displayTokenA?.symbol, 10)}`
      : `${textEllipses(dlmmApiPoolInfo?.displayTokenA?.symbol, 10)}/${textEllipses(dlmmApiPoolInfo?.displayTokenB?.symbol)}`
  }, [direct, dlmmApiPoolInfo?.displayTokenA?.symbol, dlmmApiPoolInfo?.displayTokenB?.symbol])

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

  const { notifiStatus } = useNotifiStore()

  const isActive = useMemo(() => {
    if (minPriceData?.binId !== undefined && maxPriceData?.binId !== undefined && dlmmContractPoolInfo?.active_id !== undefined) {
      if (minPriceData?.binId <= dlmmContractPoolInfo?.active_id && maxPriceData?.binId >= dlmmContractPoolInfo?.active_id) {
        return true
      }
    }
    return false
  }, [minPriceData?.binId, maxPriceData?.binId, dlmmContractPoolInfo?.active_id])

  const zapAmountRate = useMemo(() => {
    return getTokenAmountValue(zapProps?.zapCoin?.coin_type, zapProps?.zapAmount)
  }, [zapProps?.zapAmount, zapProps?.zapCoin])

  const { isApp } = useWindowWidth()

  return isApp ? (
    <VaulDrawer
      isOpen={true}
      onClose={() => {
        onClose()
        setIsChecked(false)
      }}
    >
      <VStack align="flex-start">
        <Heading fontWeight="500" fontSize="16px">
          Add Liquidity
        </Heading>
        <ConfirmContent
          dlmmApiPoolInfo={dlmmApiPoolInfo}
          dlmmContractPoolInfo={dlmmContractPoolInfo}
          currentPrice={currentPrice}
          baseFeeDisplay={baseFeeDisplay}
          zapProps={zapProps}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          toAmount={toAmount}
          isActive={isActive}
          direct={direct}
          isReverse={isReverse}
          maxPriceData={maxPriceData}
          minPriceData={minPriceData}
          currentRangeTab={currentRangeTab}
          zapAmountRate={zapAmountRate}
          onOk={onOk}
          totalAmount={totalAmount}
          setDirect={setDirect}
          perText={perText}
        />
      </VStack>
    </VaulDrawer>
  ) : (
    <Modal
      isOpen={true}
      onClose={() => {
        onClose()
        setIsChecked(false)
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
            dlmmApiPoolInfo={dlmmApiPoolInfo}
            dlmmContractPoolInfo={dlmmContractPoolInfo}
            currentPrice={currentPrice}
            baseFeeDisplay={baseFeeDisplay}
            zapProps={zapProps}
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            toAmount={toAmount}
            isActive={isActive}
            direct={direct}
            isReverse={isReverse}
            maxPriceData={maxPriceData}
            minPriceData={minPriceData}
            currentRangeTab={currentRangeTab}
            zapAmountRate={zapAmountRate}
            onOk={onOk}
            totalAmount={totalAmount}
            setDirect={setDirect}
            perText={perText}
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
      <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }}>
        {price}
      </Text>
      <Text fontSize={{ base: '12px', lg: '14px' }}>{perText?.replace('/', ' per ')}</Text>
    </VStack>
  )
}

interface ConfirmContentProps {
  dlmmApiPoolInfo: Partial<DLMMPoolApiInfo> | null
  baseFeeDisplay?: string
  currentPrice: string
  dlmmContractPoolInfo: any
  zapProps?: DLMMZapProps
  fromToken?: Token
  toToken?: Token
  fromAmount: string
  toAmount: string
  isActive: boolean
  direct: boolean
  setDirect: (value: boolean) => void
  perText: string
  isReverse: boolean
  maxPriceData: RangePriceType | null
  minPriceData: RangePriceType | null
  currentRangeTab: string
  zapAmountRate: string
  totalAmount?: string
  onOk: () => void
}

const ConfirmContent = ({
  dlmmApiPoolInfo,
  baseFeeDisplay,
  currentPrice,
  dlmmContractPoolInfo,
  zapProps,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  isActive,
  direct,
  isReverse,
  maxPriceData,
  minPriceData,
  currentRangeTab,
  zapAmountRate,
  totalAmount,
  onOk,
  perText,
  setDirect
}: ConfirmContentProps) => {
  const { isApp } = useWindowWidth()
  return (
    <VStack w="100%" gap={{ base: '12px', lg: '20px' }} p={{ base: '12px 0', lg: '8px 16px' }}>
      <HStack w="100%" justifyContent="space-between" h={{ base: '20px', lg: '40px' }}>
        <HStack>
          <CoinPairImage
            coinACoinType={dlmmApiPoolInfo?.displayTokenA?.coin_type}
            coinBCoinType={dlmmApiPoolInfo?.displayTokenB?.coin_type}
            coinAIconUrl={dlmmApiPoolInfo?.displayTokenA?.logo_url}
            coinBIconUrl={dlmmApiPoolInfo?.displayTokenB?.logo_url}
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
            {`${textEllipses(dlmmApiPoolInfo?.displayTokenA?.symbol, 10)} - ${textEllipses(dlmmApiPoolInfo?.displayTokenB?.symbol, 10)}`}
          </Text>
        </HStack>
        <PoolTag poolType="dlmm" displayFee={baseFeeDisplay || ''} binStep={dlmmContractPoolInfo?.binStep} />
      </HStack>

      {/* 交易数量展示 */}
      {zapProps ? (
        <TradeConfirmAmountInfo
          coinA={{
            amount: zapProps.zapAmount as string,
            ...zapProps.zapCoin
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
            isActive={isActive}
            isRow
            imgStyle={{ imgW: isApp ? '18' : '29px', imgH: isApp ? '10px' : '16px' }}
            w={{ base: '66px', lg: '105px' }}
            h={{ base: '20px', lg: '32px' }}
          />
        </HStack>
        <VStack gap="0" border="1px solid" bg="bg_secondary" borderColor="border" borderRadius={{ base: '8px', lg: '12px' }} mt="8px">
          <HStack justify="center" p={{ base: '8px', lg: '14px 12px' }} w="100%" gap="4px" flexWrap="wrap">
            <Text fontSize={{ base: '12px', lg: '14px' }}>Current Pool Price</Text>

            <HStack gap="4px">
              <Text as="span" color="text_caption" fontSize={{ base: '12px', lg: '14px' }}>
                {formatPrice(direct === isReverse ? d(1).div(currentPrice).toString() : currentPrice)}
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
              price={formatPrice(direct === isReverse ? maxPriceData?.reversePrice : minPriceData?.price)}
              perText={perText}
            />
            <Divider orientation="vertical" h="40px" />
            <PriceItem
              title="Max Price"
              price={formatPrice(direct === isReverse ? minPriceData?.reversePrice : maxPriceData?.price)}
              perText={perText}
            />
          </HStack>
        </VStack>
      </Box>

      {zapProps && (
        <HStack w="100%" justify="space-between">
          <Text fontSize={{ base: '12px', lg: '14px' }} color="text_paragraph">
            Zap Amount
          </Text>
          <Text fontSize={{ base: '12px', lg: '14px' }} color="text_caption">
            {formatCurrencyWithKMB(zapAmountRate, 2)}
          </Text>
        </HStack>
      )}
      {/* <HTextLabelBox label="Position" value={positionCount} labelStyle={{ fontSize: '14px' }} valueStyle={{ fontSize: '14px' }} /> */}
      {!zapProps && <TotalAmount loading={false} totalAmount={totalAmount} />}
      {/* 
            {!fromTokenLock && !toTokenLock && !(minPriceData?.price === '0' && maxPriceData?.price === '∞') && notifiStatus == 'authenticated' && (
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
      {zapProps && (
        <DlmmZapRoute
          zapProps={zapProps}
          zapProgressRef={undefined}
          inConfirmModal={true}
          notAllowSetSlippage={true}
          currentRangeTab={currentRangeTab}
        />
      )}

      <Button
        w={{ base: '100%', lg: 'calc(100% + 32px)' }}
        bottom="0px"
        mt={{ base: 0, lg: '4px' }}
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
