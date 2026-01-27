import useInsufficientBalanceToast from '@/hooks/common/useInsufficientBalanceToast'
import useTransaction from '@/hooks/common/useTransaction'
import { useDcaHook } from '@/hooks/dca/useDcaHook'
import useGetDcaTokenList from '@/hooks/dca/useGetDcaTokenList'
import useOpenDcaOrder from '@/hooks/dca/useOpenDcaOrder'
import useDcaStore from '@/store/dca'
import useProStore from '@/store/pro'
import { Block, CurrentPrice, ErrorTips, TooltipIcon, TradeInputGroup, useGlobalToast } from '@cetus/design'
import WarningTokenTipsModal from '@cetus/design/src/components/common/WarningTokenTipModal'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import { d, formatNumber, formatNumberWithDown, textEllipses } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Button, HStack, Image, RangeSlider, RangeSliderFilledTrack, RangeSliderThumb, RangeSliderTrack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import icon_currentprice from '/images/icon_currentprice@2x.png'
import ConfirmModal from './ConfirmModal'
import DetailsBlock from './DetailsBlock'
import { detailsDataType } from './DetailsContent'
import InvestAndOrders from './InvestAndOrders'
import MinAndMaxPrice from './MinAndMaxPrice'

export function DcaInputBlock({ handleGetDcaOrderList }: { handleGetDcaOrderList: (orderId: string) => void }) {
  const {
    sellCoin,
    buyCoin,
    sellAmount,
    buyAmount,
    setInvestNum,
    setOrderNum,
    investNum,
    orderNum,
    currentInvest,
    setCurrentInvest,
    pageDirect,
    isDcaRefresh,
    dcaMode,
    setDcaMode,
    sellTotalAmount,
    upperPriceSize,
    lowerPriceSize,
    setLowerPriceSize,
    setUpperPriceSize
  } = useDcaStore()
  const {
    currentPrice,
    btnStatus,
    findRouterLoading,
    sellBalanceInfo,
    buyBalanceInfo,
    sellAmountValue,
    handleAmountChange,
    handleSelectToken,
    minPriceValue,
    maxPriceValue,
    handleMinInputChange,
    handleMaxInputChange,
    handlePageToggleDirect,
    onReverseClick,
    orderSizeError,
    orderInputError,
    orderTimeError,
    priceError,
    sellPerOrder,
    estEndDate,
    platformFee,
    fetchFindAvailableRouterDebounce,
    cycleFrequency,
    resetInputAmount,
    warningTokenList,
    missingCoins
  } = useDcaHook()

  useEffect(() => {
    if (isDcaRefresh) {
      fetchFindAvailableRouterDebounce()
    }
  }, [isDcaRefresh])

  const { currentAccount, onWalletModal } = useAccountStore()
  const [tradeIcon, setTradeIcon] = useState<string>('#icon-a-icon_trade')

  const timeList: string[] = ['Minute', 'Hour', 'Day', 'Week', 'Month']

  const toggleTradeIcon = (hovered: boolean) => setTradeIcon(hovered ? '#icon-icon_swap1' : '#icon-a-icon_trade')
  const { openDcaOrder } = useOpenDcaOrder()
  const [toOpenDcaLoading, setToOpenDcaLoading] = useState(false)

  const { fetchCoinBalance } = useAccountBalance()
  const { signAndExecuteTransaction, transactionRejected, transactionConfirmation } = useTransaction()
  const { failedTsToast } = useGlobalToast()
  const { showInsufficientBalanceToast } = useInsufficientBalanceToast()
  const toOpenDca = async () => {
    setToOpenDcaLoading(true)
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType) => {
        const desc = `Creating DCA Order for ${formatNumber(sellTotalAmount)} ${sellCoin?.symbol} to ${buyCoin?.symbol} over ${orderNum} orders`
        const info: CommonTypeInfo = {
          modalDescriptionText: 'Creating DCA Order',
          toastTitleText: 'Creating DCA Order'
        }
        if (status === 'success') {
          info.modalDescriptionText = 'DCA Order Created'
          info.toastDescriptionContent = ''
          info.toastTitleText = 'DCA Order Created'
        }
        return info
      }
    }
    transactionConfirmation(toastInfo)
    const min_price = !pageDirect ? minPriceValue : d(1).div(maxPriceValue).toString()
    const max_price = !pageDirect ? maxPriceValue : d(1).div(minPriceValue).toString()
    try {
      const params: any = {
        in_coin: sellCoin,
        out_coin: buyCoin,
        in_coin_amount: sellTotalAmount,
        cycle_count: orderNum,
        min_price,
        max_price,
        freq: cycleFrequency
      }

      console.log('🚀 ~ toOpenDca ~ params:', !pageDirect, minPriceValue, maxPriceValue, min_price, max_price, params)
      const tx = await openDcaOrder(params)
      console.log('🚀 ~ toOpenDca ~ tx:', tx)

      const trackData = {
        inCoin: sellCoin?.coin_type,
        outCoin: buyCoin?.coin_type,
        inCoinAmount: sellTotalAmount,
        cycleCount: orderNum,
        minPrice: min_price,
        maxPrice: max_price,
        freq: cycleFrequency,
        txAction: 'openDcaOrder'
      }

      const res = await signAndExecuteTransaction(tx, toastInfo, { trackData })
      console.log('🚀 ~ toOpenDca ~ res:', res)
      if (res) {
        // 重新拿数据
        resetInputAmount()
        setTimeout(() => {
          fetchCoinBalance(currentAccount?.address, sellCoin?.coin_type)
          handleGetDcaOrderList(currentAccount?.address as string)
        }, 2000)
      }
      setToOpenDcaLoading(false)
    } catch (error) {
      const errorInfo: ToastType = {
        getShowInfo: (status: TransactionStatusType): CommonTypeInfo => {
          const info: CommonTypeInfo = {}
          if (String(error) === 'Error: Each order size should be higher than $10') {
            info['toastTitleText'] = 'Transaction Submission Error'
            info['toastDescriptionContent'] = 'Each order size should be higher than $10.'
          }
          if (String(error) === 'Error: Request timed out') {
            info['toastTitleText'] = 'Request timed out'
            info['toastDescriptionContent'] = 'Please confirm the network status and resubmit the transaction.'
          }
          if (String(error) === 'Error: minPrice error') {
            info['toastTitleText'] = 'DCA order submission failed'
            info['toastDescriptionContent'] = 'Your nominated prices are out of scope. Please modify your accepted price range and submit it again.'
          }
          return info
        }
      }
      console.log('🚀 ~ toOpenDca ~ error:', error)
      console.error('Open DCA Order Error: ', error)
      showInsufficientBalanceToast(String(error))
      transactionRejected(errorInfo)
      failedTsToast(errorInfo)
      setToOpenDcaLoading(false)
    }
  }

  const { currentCoinKey, inCoinWhiteList, outCoinWhiteList, dcaConfig, whiteTokenList, setWhiteTokenList } = useDcaStore()
  const { getDcaCoinWhiteList } = useGetDcaTokenList()
  // const [whiteTokenList, setWhiteTokenList] = useState<Token[]>([])
  useEffect(() => {
    if (currentCoinKey == 'sellCoin') {
      setWhiteTokenList(inCoinWhiteList)
    } else {
      setWhiteTokenList(outCoinWhiteList)
    }
  }, [currentCoinKey, inCoinWhiteList, outCoinWhiteList])

  useEffect(() => {
    if (dcaConfig && (dcaConfig.whitelistMode || dcaConfig.whitelistMode == 0)) {
      console.log('🚀🚀🚀 ~ file: DcaInputBlock.tsx:101 ~ DcaInputBlock ~ dcaConfig:', dcaConfig)
      getDcaCoinWhiteList(dcaConfig.whitelistMode)
    }
  }, [dcaConfig])

  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false)

  const detailsData: detailsDataType = useMemo(() => {
    const decimals = !pageDirect ? sellCoin?.decimals : buyCoin?.decimals
    let minPrice = ''
    let maxPrice = ''
    let minPriceResever = ''
    let maxPriceResever = ''
    if (minPriceValue && maxPriceValue) {
      minPrice = !pageDirect ? minPriceValue : formatNumberWithDown(d(1).div(maxPriceValue).toString(), decimals, true).toString()
      maxPrice = !pageDirect ? maxPriceValue : formatNumberWithDown(d(1).div(minPriceValue).toString(), decimals, true).toString()
      minPriceResever = !pageDirect ? formatNumberWithDown(d(1).div(maxPriceValue).toString(), decimals, true).toString() : minPriceValue
      maxPriceResever = !pageDirect ? formatNumberWithDown(d(1).div(minPriceValue).toString(), decimals, true).toString() : maxPriceValue
    }
    return { estEndDate, sellPerOrder, platformFee, minPriceValue: minPrice, maxPriceValue: maxPrice, minPriceResever, maxPriceResever }
  }, [pageDirect, estEndDate, sellPerOrder, platformFee, minPriceValue, maxPriceValue])

  const tabList = [
    { label: 'Total', value: 'total' },
    { label: 'Per Order', value: 'perOrder' }
  ]

  const [value, setValue] = useState<number[]>([0, 0])
  const [minValue, setMinValue] = useState<number>(0)
  const [maxValue, setMaxValue] = useState<number>(0)

  const handleSlider = (val: number[]) => {
    console.log('🚀 ~ handleSlider ~ val:', val)
    setValue(val)
    handleMinInputChange(val[0].toString())
    handleMaxInputChange(val[1].toString())
  }

  useEffect(() => {
    // 计算滑杆的min和max值 实际为了保证当前价格在中间 min=0 max=currentPrice * 2
    if (minPriceValue && maxPriceValue) {
      const start = Number(minPriceValue)
      const end = Number(maxPriceValue)
      setValue([start, end])
      console.log('🚀 ~ useEffect ~ start:', start, end)
    }
    if (!minPriceValue) {
      setLowerPriceSize('0%')
    }
    if (!maxPriceValue) {
      setUpperPriceSize('0%')
    }
  }, [minPriceValue, maxPriceValue])

  useEffect(() => {
    if (currentPrice) {
      const min = d('-100').div(100).plus(1).mul(currentPrice).toNumber()
      const max = d('100').div(100).plus(1).mul(currentPrice).toNumber()
      console.log('🚀 ~ useEffect ~ min:', min, max)
      setMinValue(min)
      setMaxValue(max)
    }
  }, [currentPrice])

  // useEffect(() => {
  //   console.log('DcaInputBlock#### sellCoin: ', sellCoin)
  //   console.log('DcaInputBlock#### buyCoin: ', buyCoin)
  //   console.log('DcaInputBlock#### pageDirect: ', pageDirect)
  // }, [sellCoin, buyCoin, pageDirect])

  const isNotSupported = useMemo(() => {
    const a = inCoinWhiteList?.filter((item: any) => item?.coin_type == sellCoin?.coin_type)
    const b = outCoinWhiteList?.filter((item: any) => item?.coin_type == buyCoin?.coin_type)

    if (inCoinWhiteList?.length && outCoinWhiteList?.length && (a?.length < 1 || b?.length < 1)) {
      return true
    }
    return false
  }, [inCoinWhiteList, outCoinWhiteList, sellCoin, buyCoin])

  const { showTokenInfo, isProMode, currentProTab, currentProTabUpdateWith } = useProStore()

  useEffect(() => {
    if (currentProTabUpdateWith === 'toggleBtn' || !currentProTabUpdateWith) return
    if (showTokenInfo?.coin_type && buyCoin?.coin_type && sellCoin?.coin_type) {
      if (
        (currentProTab == 'Buy' && fixCoinType(showTokenInfo?.coin_type) !== fixCoinType(buyCoin?.coin_type)) ||
        (currentProTab == 'Sell' && fixCoinType(showTokenInfo?.coin_type) !== fixCoinType(sellCoin?.coin_type))
      ) {
        onReverseClick()
      }
    } else if (showTokenInfo?.coin_type && buyCoin?.coin_type && !sellCoin?.coin_type) {
      onReverseClick()
    } else if (showTokenInfo?.coin_type && !buyCoin?.coin_type && sellCoin?.coin_type) {
      onReverseClick()
    }
  }, [currentProTab])
  return (
    <VStack w="100%">
      <TradeInputGroup
        onClick={() => onReverseClick(true)}
        currentCoinKey={currentCoinKey}
        whiteTokenList={whiteTokenList}
        from={{
          inputTabOptions: {
            type: 'outlineTab',
            tabList,
            currentTab: dcaMode == 'total' ? 'Total' : 'Per Order',
            handleChangeTab: tab => {
              setDcaMode(tab?.value)
            },
            wrapStyle: {
              w: '168px',
              h: '28px',
              p: '3px',
              borderRadius: '10px'
            },
            itemStyle: {
              flex: '1',
              fontSize: '12px',
              margin: '0px',
              borderRadius: '6px'
            }
          },
          title: 'You Pay',
          balance: sellBalanceInfo?.balanceFormat || '',
          value: sellAmount,
          amountValue: sellAmountValue,
          loading: false,
          onChange: handleAmountChange,
          selectable: true,
          placeholder: '0.0',
          token: sellCoin,
          whiteTokenList: inCoinWhiteList,
          onTokenChange: token => handleSelectToken(token, true)
        }}
        to={{
          isDcaTo: true,
          wrapStyle: {
            backgroundColor: 'bg_secondary',
            h: '94px'
          },
          title: 'You Receive',
          inputAllowed: false,
          balance: buyBalanceInfo?.balanceFormat || '',
          value: '',
          amountValue: '',
          loading: false,
          onChange: () => {},
          token: buyCoin,
          whiteTokenList: outCoinWhiteList,
          onTokenChange: token => handleSelectToken(token, false),
          selectable: true,
          placeholder: '',
          half: false,
          max: false
        }}
        iconParams={{
          xlinkHref: tradeIcon,
          svgFill: 'text_caption',
          transform: tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)',
          fontSize: tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px',
          onMouseEnter: () => toggleTradeIcon(true),
          onMouseLeave: () => toggleTradeIcon(false)
        }}
      />
      {orderSizeError?.status && <ErrorTips tips={orderSizeError?.tips} bg="primary_red_bg" />}
      <HStack w="100%">
        <InvestAndOrders
          title="Invest Every"
          label={currentInvest}
          inputValue={investNum}
          list={timeList}
          onListItemClick={item => {
            setCurrentInvest(item)
          }}
          inputChange={item => {
            console.log('🚀 ~ DcaInputBlock ~ item:', item)
            setInvestNum(item)
          }}
        />
        <InvestAndOrders
          title={
            <TooltipIcon
              tooltipCon="How many orders your want to repeat in total."
              children={
                <Text fontSize="13px" fontWeight="500" mr="4px">
                  Over
                </Text>
              }
            />
          }
          label="Orders"
          inputValue={orderNum}
          inputChange={item => {
            setOrderNum(item)
            fetchFindAvailableRouterDebounce()
          }}
        />
      </HStack>
      {orderInputError?.status && <ErrorTips tips={orderInputError?.tips} bg="primary_red_bg" />}
      {orderTimeError?.status && <ErrorTips tips={orderTimeError?.tips} bg="primary_red_bg" />}
      <Block zIndex="1" p="16px" borderRadius="16px">
        <VStack align="flex-start">
          <Text color="text_caption">Set Price Range</Text>
          <Text lineHeight="16px" fontSize="12px" m={{ base: '4px 0', lg: '0' }} mb={{ base: sellAmount ? '4px' : '0' }}>
            DCA will only be executed if the price falls within the range of your pricing strategy.
          </Text>
          {sellAmount && sellPerOrder && buyAmount && buyAmount != '0' && (
            <HStack mt="8px" w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }} align={{ base: 'align', lg: 'center' }}>
              <Text>Current Rate</Text>
              <VStack align={{ base: 'flex-start', lg: 'flex-end' }}>
                <CurrentPrice
                  color="text_caption"
                  pageDirect={pageDirect}
                  handlePageToggleDirect={handlePageToggleDirect}
                  fromToken={sellCoin!}
                  toToken={buyCoin!}
                  fromValue={sellPerOrder}
                  toValue={buyAmount}
                  isLoading={findRouterLoading || !buyAmount || !sellPerOrder}
                />
              </VStack>
            </HStack>
          )}
        </VStack>
        <HStack justify="space-between" gap="8px" mt="20px">
          <MinAndMaxPrice
            direct={pageDirect}
            text={sellAmount && minPriceValue ? lowerPriceSize : ''}
            inputValue={minPriceValue}
            inputChange={val => handleMinInputChange(val)}
            align="flex-start"
          />
          <Text color="text_caption">-</Text>
          <MinAndMaxPrice
            direct={pageDirect}
            text={sellAmount && maxPriceValue ? upperPriceSize : ''}
            inputValue={maxPriceValue}
            inputChange={val => handleMaxInputChange(val)}
            align="flex-start"
          />
        </HStack>
        {!findRouterLoading &&
          sellAmount &&
          minPriceValue &&
          maxPriceValue &&
          Number(maxPriceValue) >= Number(minPriceValue) &&
          btnStatus?.text !== 'No Available Route' &&
          buyAmount &&
          buyAmount != '0' && (
            <VStack w="100%" gap="0" mt="20px">
              <RangeSlider
                min={minValue}
                max={maxValue}
                step={0.1}
                value={value}
                onChange={val => {
                  handleSlider(val)
                }}
                colorScheme="teal"
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
              </RangeSlider>
              <Image src={icon_currentprice} w="32px" h="32px" />
              <HStack w="100%" h="14px" justify="center" mt="-2px">
                <Text>Current Rate</Text>
              </HStack>
            </VStack>
          )}
      </Block>
      {priceError?.status && <ErrorTips tips={priceError?.tips} bg="primary_red_bg" />}
      {/* Pro选择到不支持的token时需要提示 */}
      {isNotSupported && buyCoin && sellCoin && (
        <ErrorTips tips="This token is not supported for DCA yet. Please select from the supported list." type="warning" isShowIcon={false} />
      )}
      {missingCoins && missingCoins?.length > 0 && (
        <ErrorTips
          tips={`${missingCoins.map(coin => textEllipses(coin.symbol)).join(missingCoins.length === 2 ? ' and ' : ', ')} ${missingCoins.length === 1 ? 'is' : 'are'} not supported for DCA yet.`}
          type="warning"
          isShowIcon={false}
        />
      )}

      <Button
        isLoading={toOpenDcaLoading}
        isDisabled={btnStatus?.disabled || toOpenDcaLoading || isNotSupported || missingCoins?.length > 0}
        w="100%"
        h="52px"
        fontSize="18px"
        fontWeight="500"
        variant={isProMode ? `solid-${currentProTab?.toLocaleLowerCase()}` : 'solid'}
        // variant="solid"
        onClick={btnStatus?.text == 'Connect Wallet' ? () => onWalletModal(true) : () => setIsOpenConfirmModal(true)}
      >
        {isProMode && btnStatus?.text == 'Create DCA Order' ? currentProTab : btnStatus?.text}
      </Button>
      {sellAmount && <DetailsBlock detailsData={detailsData} />}
      {isOpenConfirmModal && (
        <ConfirmModal
          confirmData={detailsData}
          isOpen={isOpenConfirmModal}
          onClose={() => setIsOpenConfirmModal(false)}
          toOpenDca={toOpenDca}
          toOpenDcaLoading={toOpenDcaLoading}
        />
      )}
      {(buyCoin || sellCoin) && (
        <WarningTokenTipsModal
          addToken
          tokensInfo={warningTokenList}
          waringModalCancel={(tokenInfo: Token[]) => {
            tokenInfo.forEach(coin => {
              const hasFind = coin.coin_type === buyCoin?.coin_type || coin.coin_type === sellCoin?.coin_type
              if (hasFind) {
                handleSelectToken(undefined, coin.coin_type === buyCoin?.coin_type)
              }
            })
          }}
        />
      )}
    </VStack>
  )
}
