import RiskConfirm from '@/components/common/RiskConfirm'
import { BothAndZapTab } from '@/components/liquidity/dlmm/BothAndZapTab'
import { Strategy } from '@/components/liquidity/dlmm/SelectStrategy'
import DlmmZapRoute from '@/components/liquidity/dlmm/deposit/DlmmZapRoute'
import ZapSwitch from '@/components/zap/ZapSwitch'
import useDlmmPosAddPage from '@/hooks/dlmm-position/useDlmmPosAddPage'
import useGlobalStore from '@/store/common/global'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { BothAndZapTabAction, zapInTabList } from '@/types/dlmm'
import { CetusTooltip, ErrorTips, TradeInput, TradeInputGroup } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { addComma, d, formatCurrency, isAvailableObject } from '@cetus/utils'
import { StrategyType } from '@cetusprotocol/dlmm-sdk'
import { Box, Button, Center, FormControl, FormLabel, HStack, Switch, Text, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useMemo } from 'react'
import { AutoClaimCheckBox } from '../../common/AutoClaimCheckBox'
import DlmmPositionSelectRange from './DlmmPositionSelectRange'

export default function DlmmPositionAdd() {
  const {
    displayTokenA,
    displayTokenB,
    tokenABalanceInfo,
    tokenBBalanceInfo,
    tokenAmountValueA,
    tokenAmountValueB,
    tokenAmountA,
    tokenAmountB,
    handleAmountChange,
    strategy,
    setStrategy,
    dlmmPreAddLoading,
    isFixedDisplayTokenA,
    totalAmount,
    btnStatusText,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    displayTokenALock,
    displayTokenBLock,
    isAutoFill,
    handleAdd,
    isAddLoading,
    minPriceData,
    maxPriceData,
    posMinPrice,
    posMaxPrice,
    handlePriceAction,
    handleSlider,
    baseToken,
    quoteToken,
    dlmmPosDetailDirect,
    reCalculateResult,
    setIsAutoFill,
    setIsInitPrice,
    disabledAutoFill,
    onAutoFillChange,
    numBins,
    posMinPriceBinId,
    posMaxPriceBinId,
    isReverse,
    binStep,
    tokenA,
    tokenB,
    zapProps,
    totalTokenBalanceA,
    showRiskConfirm,
    knowsRisk,
    handleKnowsRisk,
    isOneSide,
    supportZap
  } = useDlmmPosAddPage()

  const { showPositionSelectRange, isAutoClaim, setIsAutoClaim, preCalcError, currAddTabMode, setCurrAddTabMode } = useDlmmPosDetailStore()
  const { isApp } = useWindowWidth()
  const { getTokenAmountValue } = useTokenPrice()

  const { liquiditySlippage } = useGlobalStore()
  useDebounceEffect(
    () => {
      if (isAvailableObject(minPriceData) && isAvailableObject(maxPriceData)) {
        reCalculateResult()
      }
    },
    [
      minPriceData?.binId,
      maxPriceData?.binId,
      displayTokenALock,
      displayTokenBLock,
      isFixedDisplayTokenA,
      tokenAmountA,
      tokenAmountB,
      strategy,
      isAutoFill,
      totalTokenBalanceA
    ],
    {
      wait: 300
    }
  )

  const isShowError = useMemo(() => {
    if (!minPriceData?.binId || !maxPriceData?.binId) return false
    return d(minPriceData.binId).gt(maxPriceData.binId)
  }, [minPriceData?.binId, maxPriceData?.binId])

  return (
    <VStack gap="16px" w="100%">
      <VStack mb="-6px" w="100%" justify="space-between" mt="4px" justifyContent="flex-start" alignItems="flex-start" gap="18px">
        <Text fontSize="14px" color="primary_gray" fontWeight="500">
          Select Strategy
        </Text>
        <HStack w="100%" justify="space-between" gap={{ base: '6px', lg: '0px' }}>
          <Strategy type={StrategyType.Spot} isActive={strategy === StrategyType.Spot} onClick={() => setStrategy(StrategyType.Spot)} size="m" />
          <Strategy type={StrategyType.Curve} isActive={strategy === StrategyType.Curve} onClick={() => setStrategy(StrategyType.Curve)} size="m" />
          <Strategy
            type={StrategyType.BidAsk}
            isActive={strategy === StrategyType.BidAsk}
            onClick={() => setStrategy(StrategyType.BidAsk)}
            size="m"
          />
        </HStack>
      </VStack>
      {showPositionSelectRange && (
        <DlmmPositionSelectRange
          isReverse={isReverse}
          posMinPriceBinId={posMinPriceBinId}
          posMaxPriceBinId={posMaxPriceBinId}
          minPriceData={minPriceData}
          maxPriceData={maxPriceData}
          isShowError={isShowError}
          posMinPrice={posMinPrice}
          posMaxPrice={posMaxPrice}
          handlePriceAction={handlePriceAction}
          handleSlider={handleSlider}
          baseToken={baseToken}
          quoteToken={quoteToken}
          binStep={binStep}
          tokenA={tokenA}
          tokenB={tokenB}
        />
      )}

      <HStack w="100%" justifyContent="space-between">
        <Text whiteSpace="nowrap" fontSize="14px" color="primary_gray" fontWeight="500">
          Deposit Amounts
        </Text>

        {isApp && !isOneSide && (
          <FormControl display="flex" justifyContent="end" alignItems="center">
            <FormLabel htmlFor="auto-fill" mb="0" fontSize="14px" fontWeight="500" color={isAutoFill ? 'text_highlight' : 'text_caption'}>
              <CetusTooltip
                maxW="320px"
                tooltip={
                  <Text fontSize="12px" lineHeight="20px">
                    <Text fontSize="12px" as="span" color="text_caption">
                      ON:
                    </Text>{' '}
                    Enter one token amount, the other is calculated automatically.
                    <br />
                    <Text fontSize="12px" as="span" color="text_caption">
                      OFF:
                    </Text>{' '}
                    Enter custom amounts for both tokens manually.
                    <Box h="8px" />
                    <Box
                      as="div"
                      lineHeight="20px"
                      cursor="pointer"
                      _hover={{ svg: { fill: 'text_caption' } }}
                      onClick={() => window.open('https://cetus-1.gitbook.io/cetus-docs/dlmm/dynamic-fee/fee-structure#composition-fee')}
                    >
                      A composition fee may be applied during DLMM liquidity provision if the deposited token ratio into a bin differs from the bin’s
                      current ratio. <Icon xlinkHref="#icon-icon_link3" display="inline-block" fontSize="16px" verticalAlign="middle" />
                    </Box>
                  </Text>
                }
              >
                Auto Fill
              </CetusTooltip>
            </FormLabel>
            <Switch id="auto-fill" isChecked={isAutoFill} onChange={onAutoFillChange} />
          </FormControl>
        )}

        {!isApp && !isOneSide && (
          <CetusTooltip
            maxW="400px"
            tooltip={
              <Text fontSize="12px" lineHeight="20px">
                <Text fontSize="12px" as="span" color="text_caption">
                  ON:
                </Text>{' '}
                Enter one token amount, the other is calculated automatically.
                <br />
                <Text fontSize="12px" as="span" color="text_caption">
                  OFF:
                </Text>{' '}
                Enter custom amounts for both tokens manually.
                <Box h="8px" />
                <Box
                  as="div"
                  lineHeight="20px"
                  cursor="pointer"
                  _hover={{ svg: { fill: 'text_caption' } }}
                  onClick={() => window.open('https://cetus-1.gitbook.io/cetus-docs/dlmm/dynamic-fee/fee-structure#composition-fee')}
                >
                  A composition fee may be applied during DLMM liquidity provision if the deposited token ratio into a bin differs from the bin’s
                  current ratio. <Icon xlinkHref="#icon-icon_link3" display="inline-block" fontSize="16px" verticalAlign="middle" />
                </Box>
              </Text>
            }
          >
            <FormControl display="flex" alignItems="center">
              <FormLabel
                htmlFor="auto-fill"
                mb="0"
                fontSize={{ base: '12px', lg: '14px' }}
                fontWeight="500"
                color={isAutoFill ? 'text_highlight' : 'text_caption'}
              >
                Auto Fill
              </FormLabel>

              <Switch id="auto-fill" isChecked={isAutoFill} onChange={onAutoFillChange} />
            </FormControl>
          </CetusTooltip>
        )}

        {isOneSide && supportZap && (
          <ZapSwitch
            action="Deposit"
            value={currAddTabMode === BothAndZapTabAction.zapIn}
            onChange={() => {
              if (currAddTabMode === BothAndZapTabAction.zapIn) {
                setIsAutoFill(false)
                setCurrAddTabMode(BothAndZapTabAction.useBoth)
              } else {
                setCurrAddTabMode(BothAndZapTabAction.zapIn)
                setIsAutoFill(true)
              }
            }}
            padding="0px"
          />
        )}
      </HStack>

      {isAutoFill && !isOneSide && supportZap && <BothAndZapTab currentTab={currAddTabMode} tabList={zapInTabList} onSelectTab={setCurrAddTabMode} />}

      {(!isAutoFill || !supportZap || (isAutoFill && currAddTabMode === BothAndZapTabAction.useBoth)) && (
        <TradeInputGroup
          onClick={() => {
            //  onReverseClick(rangeTabList.find(tab => tab.key !== currentRangeTab))
          }}
          wrapStyle={{
            flexDirection: dlmmPosDetailDirect ? 'column' : 'column-reverse'
          }}
          from={{
            wrapStyle: { h: '110px' },
            balance: tokenABalanceInfo?.balanceFormat || '',
            value: tokenAmountA,
            amountValue: tokenAmountValueA,
            placeholder: '0.0',
            loading: !isFixedDisplayTokenA && dlmmPreAddLoading && isAutoFill,
            onChange: (value: string) => {
              handleAmountChange(value, true)
            },
            selectable: false,
            token: displayTokenA,
            remainBalanceAmount: 0.5,
            lock: {
              isLock: displayTokenALock || showDisplayTokenALock || isShowError,
              style: {
                height: 'calc(100% + 2px)'
              }
            },
            balancePosition: 'bottom',
            rightJustify: 'space-around'
          }}
          to={{
            wrapStyle: { h: '110px' },
            balance: tokenBBalanceInfo?.balanceFormat || '',
            value: tokenAmountB,
            amountValue: tokenAmountValueB,
            loading: isFixedDisplayTokenA && dlmmPreAddLoading && isAutoFill,
            remainBalanceAmount: 0.5,
            onChange: (value: string) => {
              handleAmountChange(value, false)
            },
            selectable: false,
            placeholder: '0.0',
            token: displayTokenB,
            lock: {
              isLock: displayTokenBLock || showDisplayTokenBLock || isShowError,
              style: {
                height: 'calc(100% + 2px)'
              }
            },
            balancePosition: 'bottom',
            rightJustify: 'space-around'
          }}
          iconParams={{
            xlinkHref: '#icon-icon_add',
            svgFill: 'text_caption'
          }}
          lock={{
            isLock: showDisplayTokenBLock && showDisplayTokenALock,
            style: { h: '224px' }
          }}
        />
      )}

      {isAutoFill && currAddTabMode === BothAndZapTabAction.zapIn && supportZap && (
        <TradeInput
          wrapStyle={{ h: '110px' }}
          placeholder="0.0"
          dropSelectTokenList={zapProps.zapCoinList}
          token={zapProps.zapCoin}
          value={zapProps.zapAmount}
          amountValue={getTokenAmountValue(zapProps.zapCoin?.coin_type, zapProps.zapAmount)}
          onChange={zapProps.handleChangeZapAmount}
          changeCurrentToken={(token: Token) => {
            zapProps.handleChangeZapCoin(token)
          }}
          balance={zapProps.availableAmount || ''}
          balancePosition="bottom"
          rightJustify="space-around"
        />
      )}

      {preCalcError && <ErrorTips tips={'Amount too small to allocate across bins. Please increase the amount.'} type="warning" />}

      <AutoClaimCheckBox
        checked={isAutoClaim}
        onChange={() => {
          setIsAutoClaim(!isAutoClaim)
        }}
      />

      <Button
        width="100%"
        height="52px"
        fontSize="18px"
        fontWeight="500"
        isDisabled={btnStatusText?.disabled || preCalcError !== undefined || dlmmPreAddLoading || (showRiskConfirm && !knowsRisk)}
        isLoading={isAddLoading || dlmmPreAddLoading || zapProps?.zapPreCalcLoading}
        onClick={() => {
          if (zapProps.preDepositResult) {
            zapProps.handleZapSubmit()
          } else {
            handleAdd()
          }
        }}
      >
        {btnStatusText?.text}
      </Button>

      {zapProps.zapTipsError && <ErrorTips tips={zapProps.zapTipsError} />}

      {isAutoFill && currAddTabMode === BothAndZapTabAction.zapIn && zapProps?.preDepositResult?.swap_result?.swap_in_amount && (
        <VStack w="100%" mt="-16px" mb="-16px">
          <DlmmZapRoute
            zapProps={zapProps}
            zapProgressRef={undefined}
            currentRangeTab={dlmmPosDetailDirect ? displayTokenA?.coin_type : displayTokenB?.coin_type}
          >
            {showRiskConfirm && !(btnStatusText?.disabled || preCalcError !== undefined || dlmmPreAddLoading) && (
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
      {(!isAutoFill || (isAutoFill && currAddTabMode === BothAndZapTabAction.useBoth)) && (
        <HTextLabelBox
          label="Deposit Amount"
          value={formatCurrency(totalAmount, 2)}
          isLoading={dlmmPreAddLoading}
          labelStyle={{
            fontSize: '14px',
            height: '16px'
          }}
          valueStyle={{
            fontSize: '14px'
          }}
        />
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
  )
}
