import RiskConfirm from '@/components/common/RiskConfirm'
import DlmmZapRoute from '@/components/liquidity/dlmm/deposit/DlmmZapRoute'
import ZapSwitch from '@/components/zap/ZapSwitch'
import useDlmmPosRemovePage from '@/hooks/dlmm-position/useDlmmPosRemovePage'
import useGlobalStore from '@/store/common/global'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { CetusMenu, CetusTooltip, ErrorTips, SelectTab, TradeInput, TradeInputGroup } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { addComma, d, formatCurrency, isAvailableObject, removeComma, textEllipses } from '@cetus/utils'
import { Box, Button, Center, HStack, MenuButton, MenuItem, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AutoClaimCheckBox } from '../../common/AutoClaimCheckBox'
import { PositionSlider } from '../../details/RemoveBlock'
import DlmmPositionSelectRange from './DlmmPositionSelectRange'

export default function DlmmPositionRemove() {
  const {
    displayTokenA,
    displayTokenB,
    tokenBalanceA,
    tokenBalanceB,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    handleAmountChange,
    tokenAmountA,
    tokenAmountB,
    dlmmPreRemoveLoading,
    isFixedDisplayTokenA,
    removeSide,
    setRemoveSide,
    isRemoveLoading,
    handleRemove,
    changeSlideFun,
    slideValue,
    minPriceData,
    maxPriceData,
    handlePriceAction,
    posMinPrice,
    posMaxPrice,
    handleSlider,
    baseToken,
    quoteToken,
    isDirect,
    getRemoveTokenBalance,
    changeSlideValue,
    btnStatusText,
    isActive,
    displayTokenALock,
    isAllRemove,
    setTokenAmountA,
    setTokenAmountB,
    setSlideValue,
    isReverse,
    currentPosPoolsRelatedData,
    dlmmCurrentPosPoolsOriginalData,
    posMinPriceBinId,
    posMaxPriceBinId,
    tokenA,
    tokenB,
    numBins,
    zapProps,
    showRiskConfirm,
    knowsRisk,
    handleKnowsRisk,
    supportZap
  } = useDlmmPosRemovePage()
  const { isApp } = useWindowWidth()
  const { showPositionSelectRange, dlmmPosDetailDirect, isAutoClaim, setIsAutoClaim, useZapOut, setUseZapOut } = useDlmmPosDetailStore()
  const { getTokenAmountValue } = useTokenPrice()
  const [open, setOpen] = useState(false)
  const { liquiditySlippage } = useGlobalStore()
  const tabList = useMemo(
    () => [
      {
        label: 'Remove Both',
        value: 'Both'
      },
      {
        label: `Only ${isApp ? textEllipses(displayTokenA?.symbol, 8) : displayTokenA?.symbol.slice(0, 8)}`,
        value: isReverse ? 'OnlyCoinB' : 'OnlyCoinA',
        afterIcon: {
          xlinkHref: '#icon-icon_tips'
        },
        tooltip: `You will remove ${textEllipses(displayTokenA?.symbol, 8)} from bins with prices out of the active bin.Tokens in the current price bin will remain in the pool`
      },
      {
        label: `Only ${isApp ? textEllipses(displayTokenB?.symbol, 8) : displayTokenB?.symbol.slice(0, 8)}`,
        value: isReverse ? 'OnlyCoinA' : 'OnlyCoinB',
        afterIcon: {
          xlinkHref: '#icon-icon_tips'
        },
        tooltip: `You will remove ${textEllipses(displayTokenB?.symbol, 8)} from bins with prices out of the active bin.Tokens in the current price bin will remain in the pool`
      }
    ],
    [displayTokenA, displayTokenB, isReverse, isApp]
  )

  const [isInitBalance, setIsInitBalance] = useState(true)
  useEffect(() => {
    if (isAvailableObject(minPriceData) && isAvailableObject(maxPriceData) && isInitBalance) {
      setIsInitBalance(false)
      getRemoveTokenBalance(true)
    }
  }, [minPriceData, maxPriceData, removeSide])

  const showSwitchTab = useMemo(() => {
    if (isActive && currentPosPoolsRelatedData && dlmmCurrentPosPoolsOriginalData) {
      const activeBin = dlmmCurrentPosPoolsOriginalData?.active_bin
      if (currentPosPoolsRelatedData?.maxPriceBinId === activeBin?.bin_id && currentPosPoolsRelatedData?.minPriceBinId === activeBin?.bin_id) {
        return false
      }
      return true
    }
    return false
  }, [isActive, currentPosPoolsRelatedData, dlmmCurrentPosPoolsOriginalData])

  const isShowError = useMemo(() => {
    if (!minPriceData?.price || !maxPriceData?.price) return false

    return d(removeComma(minPriceData.price)).gt(removeComma(maxPriceData.price))
  }, [minPriceData?.price, maxPriceData?.price])

  const amountAValue = useMemo(() => {
    return getTokenAmountValue(displayTokenA?.coin_type, tokenAmountA)
  }, [displayTokenA?.coin_type, tokenAmountA])

  const amountBValue = useMemo(() => {
    return getTokenAmountValue(displayTokenB?.coin_type, tokenAmountB)
  }, [displayTokenB?.coin_type, tokenAmountB])

  const totalAmountValue = useMemo(() => {
    return d(amountAValue).add(amountBValue).toString()
  }, [amountAValue, amountBValue])

  return (
    <VStack w="100%" alignItems="flex-start" justifyContent="flex-start" gap="24px">
      {showSwitchTab &&
        (!isApp ? (
          <SelectTab
            type="outlineTab"
            isActive={(current, tab) => current === tab.value}
            wrapStyle={{
              w: '100%',
              border: 'none',
              bg: 'bg_secondary',
              h: '42px',
              justifyContent: 'flex-end',
              p: '4px'
            }}
            itemStyle={{
              w: { base: '33.33%', lg: '33.33%' },
              fontSize: '14px',
              padding: '8px',
              borderRadius: '8px',
              gap: '2px'
            }}
            tabList={tabList}
            currentTab={removeSide}
            handleChangeTab={(item: any) => {
              setRemoveSide(item?.value)
              if (item?.Both !== 'Both') {
                setUseZapOut(false)
              }
              if (item?.value !== removeSide) {
                setTokenAmountA('')
                setTokenAmountB('')
                setSlideValue('0')
              }
            }}
          />
        ) : (
          <RemoveMenus
            isOpen={open}
            value={removeSide}
            onClose={() => setOpen(false)}
            onClick={() => setOpen(!open)}
            tabList={tabList}
            onChange={value => {
              setRemoveSide(value)
              if (value !== removeSide) {
                setTokenAmountA('')
                setTokenAmountB('')
                setSlideValue('0')
              }
            }}
          />
        ))}
      <VStack w="100%" gap="16px" align="flex-start">
        {showPositionSelectRange && (
          <DlmmPositionSelectRange
            isShowError={isShowError}
            isReverse={isReverse}
            posMinPriceBinId={posMinPriceBinId}
            posMaxPriceBinId={posMaxPriceBinId}
            minPriceData={minPriceData}
            maxPriceData={maxPriceData}
            posMinPrice={posMinPrice}
            posMaxPrice={posMaxPrice}
            handlePriceAction={handlePriceAction}
            handleSlider={handleSlider}
            baseToken={baseToken}
            quoteToken={quoteToken}
            tokenA={tokenA}
            tokenB={tokenB}
            binStep={currentPosPoolsRelatedData?.binStep}
          />
        )}
        <HStack w="100%" justify="space-between" align="center" mb="-8px">
          <Text fontSize="14px" color="primary_gray" fontWeight="500">
            Remove Amounts
          </Text>
          {supportZap && <ZapSwitch action="Withdraw" value={useZapOut} onChange={() => setUseZapOut(!useZapOut)} padding="0px" />}
        </HStack>
      </VStack>

      {useZapOut && supportZap ? (
        <TradeInput
          wrapStyle={{ h: '110px' }}
          placeholder="0.0"
          dropSelectTokenList={zapProps.zapCoinList}
          token={zapProps.zapCoin}
          value={zapProps.zapAmount}
          balanceLabel="Available"
          amountValue={getTokenAmountValue(zapProps.zapCoin?.coin_type, zapProps.zapAmount)}
          onChange={zapProps.handleChangeZapAmount}
          changeCurrentToken={(token: Token) => {
            zapProps.handleChangeZapCoin(token)
          }}
          needRemainBalance={false}
          balance={zapProps.availableAmount || ''}
          calculateAvailableLoading={zapProps.calculateAvailableLoading}
          balancePosition="bottom"
          rightJustify="space-around"
        />
      ) : (
        <TradeInputGroup
          wrapStyle={{
            flexDirection: dlmmPosDetailDirect ? 'column' : 'column-reverse'
          }}
          from={{
            wrapStyle: { h: '110px' },
            hideSelf: !(removeSide == 'Both' || (isReverse ? removeSide == 'OnlyCoinB' : removeSide == 'OnlyCoinA')),
            balance: tokenBalanceA,
            value: tokenAmountA,
            amountValue: amountAValue,
            placeholder: '0.0',
            balanceLabel: 'Available',
            loading: !isFixedDisplayTokenA && dlmmPreRemoveLoading,
            onChange: (value: string) => {
              handleAmountChange(value, true)
            },
            selectable: false,
            token: displayTokenA,
            lock: {
              isLock: showDisplayTokenALock,
              style: {
                height: 'calc(100% + 2px)'
              }
            },
            needRemainBalance: false,
            balancePosition: 'bottom',
            rightJustify: 'space-around'
          }}
          to={{
            wrapStyle: { h: '110px' },
            hideSelf: !(removeSide == 'Both' || (isReverse ? removeSide == 'OnlyCoinA' : removeSide == 'OnlyCoinB')),
            balance: tokenBalanceB,
            value: tokenAmountB,
            amountValue: amountBValue,
            balanceLabel: 'Available',
            loading: isFixedDisplayTokenA && dlmmPreRemoveLoading,
            onChange: (value: string) => {
              handleAmountChange(value, false)
            },
            selectable: false,
            placeholder: '0.0',
            token: displayTokenB,
            lock: {
              isLock: showDisplayTokenBLock,
              style: {
                height: 'calc(100% + 2px)'
              }
            },
            needRemainBalance: false,
            balancePosition: 'bottom',
            rightJustify: 'space-around'
          }}
        />
      )}

      <PositionSlider
        sliderBg="bg_secondary"
        percentage={slideValue}
        onChange={(value: string | number) => changeSlideValue(value)}
        textFontSize="20px"
        sliderTrackHeight="8px"
      />

      <HStack w="100%" mt="-8px" mb="-8px">
        <AutoClaimCheckBox
          isDisabled={isAllRemove}
          checked={isAutoClaim}
          onChange={() => {
            setIsAutoClaim(!isAutoClaim)
          }}
        />
      </HStack>

      <Button
        w="100%"
        height="52px"
        fontWeight="500"
        fontSize="18px"
        isLoading={isRemoveLoading || dlmmPreRemoveLoading || zapProps?.zapPreCalcLoading}
        onClick={() => {
          if (zapProps.preWithdrawResult) {
            zapProps.handleZapSubmit()
          } else {
            handleRemove()
          }
        }}
        isDisabled={btnStatusText.disabled}
      >
        {btnStatusText.text}
      </Button>

      <VStack w="100%" gap="16px" mt="-8px">
        {zapProps.zapTipsError && <ErrorTips tips={zapProps.zapTipsError} />}
        {!useZapOut && (
          <HTextLabelBox
            label="Remove Amount"
            isLoading={dlmmPreRemoveLoading}
            value={formatCurrency(totalAmountValue, 2)}
            labelStyle={{
              fontSize: '14px',
              height: '16px'
            }}
            valueStyle={{
              fontSize: '14px'
            }}
          />
        )}

        {useZapOut && zapProps?.preWithdrawResult?.swap_result?.swap_in_amount && (
          <VStack w="100%" mt="-16px" mb="-16px">
            <DlmmZapRoute
              zapProps={zapProps}
              zapProgressRef={undefined}
              hideDepositRatio={true}
              currentRangeTab={dlmmPosDetailDirect ? displayTokenA?.coin_type : displayTokenB?.coin_type}
            >
              {showRiskConfirm && !btnStatusText.disabled && (
                <RiskConfirm
                  checked={knowsRisk}
                  onChange={handleKnowsRisk}
                  slippage={d(liquiditySlippage).mul(100).toNumber()}
                  tipType={d(liquiditySlippage).gte(0.1) ? 'error' : 'warning'}
                />
              )}
            </DlmmZapRoute>
          </VStack>
        )}

        <HTextLabelBox
          label={
            <HStack gap="4px">
              <Text>Num Bins</Text>
              <CetusTooltip tooltip="Total bins in this position or actions.">
                <Center cursor="pointer">
                  <Icon xlinkHref="#icon-icon_tips" svgW="20px" svgH="20px" />
                </Center>
              </CetusTooltip>
            </HStack>
          }
          value={addComma(numBins)}
          labelStyle={{
            fontSize: '14px'
          }}
          valueStyle={{
            fontSize: '14px'
          }}
        />
      </VStack>
    </VStack>
  )
}

const RemoveMenus = ({
  isOpen,
  onClose,
  onChange,
  onClick,
  tabList,
  value
}: {
  isOpen: boolean
  onClose: () => void
  onClick: () => void
  tabList: any[]
  value: string
  onChange: (value: string) => void
}) => {
  const currentTab = useMemo(() => tabList.find((tab: any) => tab.value === value), [tabList, value])
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleMenuButtonClick = (e: React.MouseEvent) => {
    // 检查点击的目标是否在 tooltip 区域内
    const target = e.target as HTMLElement

    // 检查是否是 tooltip 图标
    // 1. 检查是否是 SVG use 元素（xlink:href 指向 icon-icon_tips）
    // 2. 检查是否在包含 tooltip 图标的容器内
    const isTooltipIcon =
      target.getAttribute('xlink:href') === '#icon-icon_tips' ||
      target.closest('svg[data-tooltip-icon]') !== null ||
      (tooltipRef.current &&
        tooltipRef.current.contains(target) &&
        (target.closest('svg')?.getAttribute('data-tooltip-icon') === 'true' || target.closest('[data-tooltip-trigger]') !== null))

    if (isTooltipIcon) {
      e.stopPropagation()
      return
    }
    onClick()
  }

  return (
    <CetusMenu
      isLazy
      isOpen={isOpen}
      onClose={onClose}
      defaultMaxH="315px"
      listProps={{
        p: '8px',
        borderRadius: '12px',
        w: 'calc(100vw - 40px)',
        overflowY: 'auto'
      }}
    >
      <MenuButton
        as={Button}
        variant="unstyled"
        bg="bg_secondary"
        cursor="pointer"
        p="3px 8px 3px 8px"
        borderRadius="8px"
        border="1px solid"
        borderColor="border"
        mb="-12px"
        h="40px"
        w="100%"
        onClick={handleMenuButtonClick}
      >
        <HStack width="100%" justifyContent="space-between" gap="2px">
          <HStack>
            <Text color="text_caption" fontSize="14px">
              {currentTab?.label}
            </Text>
            {currentTab?.tooltip && (
              <Box ref={tooltipRef} position="relative" zIndex={10} data-tooltip-trigger="true">
                <CetusTooltip
                  tooltip={
                    <Text fontSize="12px" lineHeight="20px">
                      {currentTab?.tooltip}
                    </Text>
                  }
                >
                  <Center cursor="pointer" pointerEvents="auto" data-tooltip-trigger="true">
                    <Icon xlinkHref="#icon-icon_tips" data-tooltip-icon="true" />
                  </Center>
                </CetusTooltip>
              </Box>
            )}
          </HStack>

          <Icon
            transition="transform 0.5s"
            transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
            xlinkHref="#icon-icon_arrow"
            svgFill={isOpen ? 'text_caption' : 'text_paragraph'}
            fontSize="12px"
          />
        </HStack>
      </MenuButton>
      <VStack w="100%" gap="8px" p="0">
        {tabList.map(item => (
          <MenuItem
            key={item.value}
            w="100%"
            p="0 12px"
            h="40px"
            borderRadius="8px"
            border="1px solid"
            bg="bg_six"
            fontSize="14px"
            textAlign="center"
            borderColor={value === item?.value ? 'primary' : 'border'}
            color={value === item.value ? 'primary' : 'text_caption4'}
            fontWeight="500"
            onClick={() => {
              onChange(item?.value)
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </VStack>
    </CetusMenu>
  )
}
