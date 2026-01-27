import ZapDeposite from '@/components/zap/ZapDeposite'
import ZapSubmiteInfo from '@/components/zap/ZapSubmiteInfo'
import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import usePosRemovePage from '@/hooks/position/usePosRemovePage'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { Block, SelectTab, TradeInputGroup } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { d, formatNumberWithDown } from '@cetus/utils'
import {
  Box,
  Button,
  FlexProps,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  StackProps,
  Text,
  TextProps,
  VStack
} from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import FarmsBlock from '../clmm/details/FarmsBlock'
import TradeTitle from '../clmm/details/TradeTitle'

export default function RemoveBlock() {
  const { currentPosBaseInfo, posPoolsRelatedData, posApiPoolData } = usePositionStore()
  const { isFixedDisplayTokenA, slideValue, setSlideValue, curPosContractPoolInfo, useZapIn, currentPosPoolInfo } = usePositionDetailStore()
  const {
    tokenAmountA,
    tokenAmountB,
    tokenABalance,
    tokenBBalance,
    displayTokenA,
    displayTokenB,
    tokenAmountValueA,
    tokenAmountValueB,
    preRemoveLoading,
    handleAmountChange,
    changeSlideFun,
    btnStatusText,
    toRemove,
    isRemoveLoading,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    resetInputAmount,
    onlyAmountA,
    onlyAmountB,
    currentApiPoolInfo,
    currentPoolSqrtPrice,
    currentPosLiquidityData
  } = usePosRemovePage()

  useEffect(() => {
    return () => {
      resetInputAmount()
    }
  }, [])

  const changeSlideValue = (value: string | number) => {
    console.log('🚀 ~ changeSlideValue ~ value:', value)
    if (value == 'MAX' || value == 100) {
      setSlideValue(100)

      changeSlideFun(100)
    } else {
      setSlideValue(Number((value + '').split('%')[0]))
      changeSlideFun(Number((value + '').split('%')[0]))
    }
  }
  useEffect(() => {
    return setSlideValue('--')
  }, [])

  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId]
  const { isSupportZap } = useIsSupportZap(displayTokenA?.coin_type, displayTokenB?.coin_type)

  return (
    <VStack w="100%" gap={{ base: '12px', lg: '16px' }}>
      <VStack
        w="100%"
        position="relative"
        gap={{ base: '12px', lg: '16px' }}
        p={{ base: '0 8px 16px', lg: '0 16px 16px' }}
        bg="card_bg"
        borderRadius="0px 0px 16px 16px"
      >
        <Box w="100%">
          {isSupportZap && currentPosBaseInfo?.posType !== 'burn' && !showDisplayTokenALock && !showDisplayTokenBLock && (
            <TradeTitle action="Withdraw" resetInputAmount={resetInputAmount} />
          )}
          {useZapIn ? (
            <ZapDeposite
              action="Withdraw"
              apiPoolInfo={currentApiPoolInfo}
              currentSqrtPrice={currentPoolSqrtPrice}
              onlyAmountA={onlyAmountA}
              onlyAmountB={onlyAmountB}
              liquidity={currentPosBaseInfo?.liquidity}
              lowerTick={currentPosBaseInfo?.lowerTick}
              upperTick={currentPosBaseInfo?.upperTick}
              slideValue={String(slideValue)}
              currentPosLiquidityData={currentPosLiquidityData}
              // changeSlideValue={changeSlideValue}
            />
          ) : (
            <>
              <TradeInputGroup
                from={{
                  wrapStyle: {
                    h: '108px'
                  },
                  balance: tokenABalance || '',
                  value: tokenAmountA,
                  amountValue: !isFixedDisplayTokenA && preRemoveLoading ? '' : tokenAmountValueA,
                  loading: !isFixedDisplayTokenA && preRemoveLoading,
                  onChange: value => {
                    handleAmountChange(value, true)
                  },
                  needRemainBalance: false,
                  placeholder: '0.0',
                  balanceLabel: 'Available',
                  token: displayTokenA,
                  half: false,
                  lock: {
                    isLock: currentPosBaseInfo && curPosContractPoolInfo && showDisplayTokenALock
                  }
                }}
                to={{
                  wrapStyle: {
                    h: '108px'
                  },
                  balance: tokenBBalance || '',
                  value: tokenAmountB,
                  amountValue: isFixedDisplayTokenA && preRemoveLoading ? '' : tokenAmountValueB,
                  loading: isFixedDisplayTokenA && preRemoveLoading,
                  onChange: value => {
                    handleAmountChange(value, false)
                  },
                  needRemainBalance: false,
                  placeholder: '0.0',
                  balanceLabel: 'Available',
                  token: displayTokenB,
                  half: false,
                  lock: {
                    isLock: currentPosBaseInfo && curPosContractPoolInfo && showDisplayTokenBLock
                  }
                }}
                lock={{
                  isLock: !currentPosBaseInfo || !curPosContractPoolInfo || (currentPosBaseInfo && currentPosBaseInfo?.posType == 'burn'),
                  text: currentPosBaseInfo && currentPosBaseInfo?.posType == 'burn' ? 'Your liquidity has been permanently locked' : undefined,
                  style: {
                    h: '224px'
                  }
                }}
              />
            </>
          )}
        </Box>
        {currentPosBaseInfo?.posType !== 'burn' && (
          <PositionSlider
            sliderBg="bg_secondary"
            percentage={slideValue}
            onChange={(value: string | number) => changeSlideValue(value)}
            textFontSize="20px"
            sliderTrackHeight="8px"
          />
        )}
        {useZapIn ? (
          <ZapDeposite
            action="Withdraw"
            apiPoolInfo={currentApiPoolInfo}
            currentSqrtPrice={currentPoolSqrtPrice}
            onlyAmountA={onlyAmountA}
            onlyAmountB={onlyAmountB}
            liquidity={currentPosBaseInfo?.liquidity}
            lowerTick={currentPosBaseInfo?.lowerTick}
            upperTick={currentPosBaseInfo?.upperTick}
            slideValue={String(slideValue)}
            currentPosLiquidityData={currentPosLiquidityData}
            changeSlideValue={changeSlideValue}
          />
        ) : (
          <>
            <TradeInputGroup
              from={{
                wrapStyle: {
                  h: '108px',
                  borderRadius: '12px'
                },
                balance: tokenABalance || '',
                value: tokenAmountA,
                amountValue: tokenAmountValueA,
                loading: !isFixedDisplayTokenA && preRemoveLoading,
                onChange: value => {
                  handleAmountChange(value, true)
                },
                needRemainBalance: false,
                placeholder: '0.0',
                balanceLabel: 'Available',
                token: displayTokenA,
                half: false,
                lock: {
                  isLock: currentPosBaseInfo && curPosContractPoolInfo && showDisplayTokenALock,
                  style: {
                    borderRadius: '12px'
                  }
                }
              }}
              to={{
                wrapStyle: {
                  h: '108px',
                  borderRadius: '12px'
                },
                balance: tokenBBalance || '',
                value: tokenAmountB,
                amountValue: tokenAmountValueB,
                loading: isFixedDisplayTokenA && preRemoveLoading,
                onChange: value => {
                  handleAmountChange(value, false)
                },
                needRemainBalance: false,
                placeholder: '0.0',
                balanceLabel: 'Available',
                token: displayTokenB,
                half: false,
                lock: {
                  isLock: currentPosBaseInfo && curPosContractPoolInfo && showDisplayTokenBLock,
                  style: {
                    borderRadius: '12px'
                  }
                }
              }}
              lock={{
                isLock: !currentPosBaseInfo || !curPosContractPoolInfo || (currentPosBaseInfo && currentPosBaseInfo?.posType == 'burn'),
                text: currentPosBaseInfo && currentPosBaseInfo?.posType == 'burn' ? 'Your liquidity has been permanently locked' : undefined,
                style: {
                  h: '224px',
                  borderRadius: '12px'
                }
              }}
            />
          </>
        )}

        {currentPosBaseInfo?.posType !== 'burn' && (
          <Block borderRadius="12px" p="16px" mt="8px">
            <Text color="primary_gray">Amount</Text>
            <PositionSlider percentage={slideValue} onChange={(value: string | number) => changeSlideValue(value)} />
          </Block>
        )}
      </VStack>

      {useZapIn ? (
        <ZapSubmiteInfo
          action="Withdraw"
          onClick={toRemove}
          hideDepositRatio={true}
          otherLoading={isRemoveLoading}
          isReverse={currentPosBaseInfo?.isReverse}
        />
      ) : (
        <Button
          isLoading={isRemoveLoading}
          onClick={toRemove}
          isDisabled={btnStatusText.disabled || isRemoveLoading || currentPosBaseInfo?.isFrozen}
          w="100%"
          h="56px"
          fontSize="20px"
          fontWeight="500"
        >
          {btnStatusText.text}
        </Button>
      )}
      {currentPosBaseInfo?.posType !== 'burn' && <FarmsBlock haveFarming={currentPosPoolInfo?.haveFarming} />}
      {/* {currentPosPoolsRelatedData && currentPosPoolsRelatedData?.minPrice !== '0' && currentPosPoolsRelatedData?.maxPrice !== '∞' && (
        <RangeAlerts subscriptionSource="PositionDetail" wrapStyle={{ p: { base: '16px 8px', lg: '16px' } }} />
      )} */}
    </VStack>
  )
}

export function PercentageTab(props: {
  percentage: string | number
  onChange: (value: string | number) => void
  wrapStyle?: StackProps
  selectTabStyle?: FlexProps
  selectTabItemStyle?: FlexProps
  selectTabItemTextStyle?: TextProps
  textFontSize?: string
  isShowPercentageText?: boolean
  percentageTextMinW?: string
}) {
  const {
    percentage,
    onChange,
    wrapStyle,
    textFontSize,
    selectTabStyle,
    selectTabItemStyle,
    selectTabItemTextStyle,
    isShowPercentageText = true,
    percentageTextMinW = '62px'
  } = props
  const tabList: Tab[] = [{ label: '25%' }, { label: '50%' }, { label: '75%' }, { label: 'MAX' }]
  const currentTab = useMemo(() => {
    if (Number(percentage) !== 100) {
      return `${percentage}%`
    } else {
      return 'MAX'
    }
  }, [percentage])

  return (
    <HStack w="100%" {...wrapStyle}>
      {isShowPercentageText && (
        <Text minW={percentageTextMinW} fontSize={textFontSize} color="text_caption">
          {percentage == '--' ? '--' : d(percentage).gt(0) && Number(percentage) < 0.01 ? '<0.01' : formatNumberWithDown(percentage, 2)}%
        </Text>
      )}

      <SelectTab
        type="outlineTab"
        tabList={tabList}
        currentTab={currentTab}
        handleChangeTab={tab => {
          if (tab.label === 'MAX') {
            onChange(100)
          } else {
            onChange(tab.label.replace('%', ''))
          }
        }}
        wrapStyle={selectTabStyle}
        itemStyle={selectTabItemStyle}
        selectTabItemTextStyle={selectTabItemTextStyle}
      />
    </HStack>
  )
}

export function PositionSlider(props: {
  percentage: string | number
  onChange: (value: string | number) => void
  percentageTextMinW?: '62px'
  textFontSize?: string
  sliderBg?: string
  sliderTrackHeight?: string
}) {
  const { percentage, onChange, percentageTextMinW, textFontSize = '24px', sliderBg = 'bg_four', sliderTrackHeight = '4px' } = props
  return (
    <Box w="100%">
      <PercentageTab
        percentage={percentage}
        onChange={onChange}
        percentageTextMinW={percentageTextMinW}
        wrapStyle={{
          justifyContent: 'space-between'
        }}
        selectTabStyle={{
          w: { base: '220px', lg: '310px' },
          h: '32px',
          p: '3px',
          borderRadius: '8px'
        }}
        selectTabItemStyle={{
          flex: '1',
          fontSize: '14px',
          margin: '0px'
        }}
        textFontSize={textFontSize}
      />
      <Box mt="10px" w="100%">
        <Slider
          aria-label="slider-ex-1"
          min={0}
          max={100}
          focusThumbOnChange={false}
          value={percentage == '--' ? 0 : Number(percentage)}
          onChange={value => onChange(value + '%')}
        >
          <SliderTrack bg={sliderBg} h={sliderTrackHeight}>
            <SliderFilledTrack h="4px" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </Box>
  )
}
