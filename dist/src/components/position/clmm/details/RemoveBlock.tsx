import ZapDeposite from '@/components/zap/ZapDeposite'
import ZapSubmiteInfo from '@/components/zap/ZapSubmiteInfo'

import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import usePosRemovePage from '@/hooks/position/usePosRemovePage'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { SelectTab, TradeInputGroup } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { d, formatCurrency, formatNumberWithDown } from '@cetus/utils'
import { Box, Button, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { AutoClaimCheckBox } from '../../common/AutoClaimCheckBox'
import FarmsBlock from './FarmsBlock'
import TradeTitle from './TradeTitle'

export default function RemoveBlock() {
  const { currentPosBaseInfo, posPoolsRelatedData } = usePositionStore()
  const { liquiditySlippage } = useGlobalStore()
  const { isFixedDisplayTokenA, slideValue, setSlideValue, curPosContractPoolInfo, useZapIn, currentPosPoolInfo, isAutoClaim, setIsAutoClaim } =
    usePositionDetailStore()
  const {
    totalAmount,
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
    <VStack w="100%" gap="16px">
      <VStack w="100%" position="relative" gap="16px" p={{ base: '0 8px 16px', lg: '0 16px 16px' }} bg="card_bg" borderRadius="0px 0px 16px 16px">
        <Box w="100%">
          {currentPosBaseInfo?.posType !== 'burn' && (
            <TradeTitle
              haveZap={isSupportZap && !showDisplayTokenALock && !showDisplayTokenBLock}
              action="Withdraw"
              resetInputAmount={resetInputAmount}
            />
          )}
          {useZapIn && !showDisplayTokenALock && !showDisplayTokenBLock ? (
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
                  rightJustify: 'space-around',
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
                  rightJustify: 'space-around',
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

        <AutoClaimCheckBox
          checked={isAutoClaim}
          isDisabled={+slideValue ? d(slideValue).eq(100) : false}
          onChange={() => {
            setIsAutoClaim(!isAutoClaim)
          }}
        />

        {useZapIn ? (
          <ZapSubmiteInfo
            action="Withdraw"
            onClick={toRemove}
            hideDepositRatio={true}
            isPositionStyle={true}
            otherLoading={isRemoveLoading}
            isReverse={currentPosBaseInfo?.isReverse}
          />
        ) : (
          <Button
            isLoading={isRemoveLoading}
            onClick={toRemove}
            disabled={btnStatusText.disabled || isRemoveLoading || currentPosBaseInfo?.isFrozen}
            w="100%"
            h="56px"
            fontSize="20px"
            fontWeight="500"
          >
            {btnStatusText.text}
          </Button>
        )}
        {totalAmount && currentPosBaseInfo?.posType !== 'burn' && (
          <HStack w="100%" justify="space-between">
            <Text>Remove Amount</Text>
            <Text color="text_caption">{formatCurrency(totalAmount, 2)}</Text>
          </HStack>
        )}
      </VStack>

      {currentPosBaseInfo?.posType !== 'burn' && <FarmsBlock haveFarming={currentPosPoolInfo?.haveFarming} />}
      {/* {currentPosPoolsRelatedData && currentPosPoolsRelatedData?.minPrice !== '0' && currentPosPoolsRelatedData?.maxPrice !== '∞' && (
        <RangeAlerts subscriptionSource="PositionDetail" />
      )} */}
    </VStack>
  )
}

export function PercentageTab(props: {
  percentage: string | number
  onChange: (value: string | number) => void
  wrapStyle?: {}
  selectTabStyle?: {}
  selectTabItemStyle?: {}
  selectTabItemTextStyle?: {}
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
    if (percentage === '--' || Number(percentage) !== 100) {
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
      <Box mt="10px" w="100%" pl="4px">
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
