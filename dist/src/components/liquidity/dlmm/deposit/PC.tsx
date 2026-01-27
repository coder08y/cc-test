import RiskConfirm from '@/components/common/RiskConfirm'
import TotalAmount from '@/components/common/TotalAmount'
import VaultBanner from '@/components/vaults-v2/add-liquidity/VaultsBanner'
import ZapSwitch from '@/components/zap/ZapSwitch'
import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { BothAndZapTabAction, zapInTabList } from '@/types/dlmm'
import { ErrorTips, TradeInput, TradeInputGroup } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { d } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import AutoFillSwitch from '../AutoFillSwitch'
import { BothAndZapTab } from '../BothAndZapTab'
import SelectStrategy from '../SelectStrategy'
import SetPriceRange from '../SetPriceRange'
import DlmmZapRoute from './DlmmZapRoute'
import { DLMMDepositProps } from './type'

function PCDeposit({
  btnText,
  btnDisabled,
  onReverseClick,
  direct,
  perText,
  rangeTabList,
  currentRangeTab,
  handleAmountChange,
  fromAmountValue,
  toAmountValue,
  fromBalanceInfo,
  toBalanceInfo,
  handleAdd,
  submitLoading,
  isReverse,
  preCalcLoading,
  zapProps,
  btnClickRef,
  knowsRisk,
  handleKnowsRisk,
  showRiskConfirm
}: DLMMDepositProps<any>) {
  const { dlmmApiPoolInfo, isAutoFill } = useDlmmLiquidityStore()
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    byAmountIn,
    totalAmount,
    fromTokenLock,
    toTokenLock,
    minPriceData,
    maxPriceData,
    positionCount,
    numBins,
    fromLoading,
    toLoading,
    preCalcError,
    currTabMode,
    setCurrTabMode
  } = useAddDlmmLiquidityStore()
  const { getTokenAmountValue } = useTokenPrice()

  const { liquiditySlippage } = useGlobalStore()

  const isOneSide = useMemo(() => {
    return fromTokenLock || toTokenLock
  }, [fromTokenLock, toTokenLock])

  const showZapSelectCoinUI = useMemo(() => {
    if (isOneSide) {
      if (currTabMode === BothAndZapTabAction.useBoth) {
        return false
      } else {
        return true
      }
    } else {
      if (isAutoFill) {
        if (currTabMode === BothAndZapTabAction.useBoth) {
          return false
        } else {
          return true
        }
      }
    }

    return false
  }, [isAutoFill, currTabMode, isOneSide])

  return (
    <>
      <HStack gap="16px" align="flex-start">
        <VStack flex="1" minW="588px">
          <SetPriceRange
            perText={perText}
            direct={direct !== isReverse}
            minPriceData={minPriceData}
            maxPriceData={maxPriceData}
            rangeTabList={rangeTabList}
            currentRangeTab={currentRangeTab}
            onReverseClick={onReverseClick}
            preCalcLoading={preCalcLoading}
          />
        </VStack>
        <VStack minW="420px" maxW="460px" gap="12px">
          <VStack gap="8px" minW="420px" maxW="460px" w="460px" p="18px 8px 16px" bg="card_bg" borderRadius="16px" align="flex-start">
            <VStack className="dlmm-tutorial-step-4" align="flex-start" gap="16px" p="0 8px" w="100%">
              <Text lineHeight="20px" fontSize="16px" fontWeight="500" color="text_caption">
                Select Strategy
              </Text>
              <SelectStrategy />
            </VStack>

            <VStack w="100%">
              <VStack gap="12px" w="100%" className="dlmm-tutorial-step-3" p="0 8px 2px">
                <HStack w="100%" h="32px" justify="space-between">
                  <Text lineHeight="20px" fontSize="16px" fontWeight="500" color="text_caption">
                    Deposit Amounts
                  </Text>
                  <HStack>
                    {(!isOneSide || !zapProps.supportZap) && <AutoFillSwitch disabled={!zapProps.supportZap && (fromTokenLock || toTokenLock)} />}
                    {isOneSide && zapProps.supportZap && !fromTokenLock && !toTokenLock && (
                      <ZapSwitch
                        action="Deposit"
                        value={currTabMode === BothAndZapTabAction.zapIn}
                        onChange={() => {
                          if (currTabMode === BothAndZapTabAction.zapIn) {
                            setCurrTabMode(BothAndZapTabAction.useBoth)
                          } else {
                            setCurrTabMode(BothAndZapTabAction.zapIn)
                          }
                        }}
                        padding="0px"
                      />
                    )}
                  </HStack>
                </HStack>
                {isAutoFill && !isOneSide && zapProps.supportZap && (
                  <BothAndZapTab currentTab={currTabMode} tabList={zapInTabList} onSelectTab={setCurrTabMode} />
                )}
                <Box w="100%" position="relative">
                  {showZapSelectCoinUI && !fromTokenLock && !toTokenLock ? (
                    <TradeInput
                      wrapStyle={{ h: '108px' }}
                      dropSelectTokenList={zapProps.zapCoinList}
                      token={zapProps.zapCoin}
                      value={zapProps.zapAmount}
                      amountValue={getTokenAmountValue(zapProps.zapCoin?.coin_type, zapProps.zapAmount)}
                      onChange={zapProps.handleChangeZapAmount}
                      changeCurrentToken={(token: Token) => {
                        zapProps.handleChangeZapCoin(token)
                      }}
                      balance={zapProps.availableAmount || ''}
                      placeholder="0.0"
                      balancePosition="bottom"
                      rightJustify="space-around"
                    />
                  ) : (
                    <TradeInputGroup
                      onClick={() => {
                        onReverseClick(rangeTabList.find(tab => tab.key !== currentRangeTab))
                      }}
                      from={{
                        wrapStyle: { h: '108px' },
                        balance: fromBalanceInfo?.balanceFormat || '',
                        value: fromAmount,
                        amountValue: getTokenAmountValue(fromToken?.coin_type, fromAmount),
                        loading: false,
                        onChange: value => {
                          handleAmountChange(value, true, fromToken?.coin_type === dlmmApiPoolInfo?.coin_type_a)
                        },
                        selectable: false,
                        placeholder: '0.0',
                        token: fromToken,
                        remainBalanceAmount: 0.5,
                        onFocusChange: (focus: boolean) => {
                          if (focus && +(fromAmount + '') && !byAmountIn) {
                            handleAmountChange(fromAmount + '', true, fromToken?.coin_type === dlmmApiPoolInfo?.coin_type_b)
                          }
                        },
                        lock: {
                          isLock: fromTokenLock && !toTokenLock,
                          text: 'The current pool price is outside your specified price range. Single-asset deposit only.'
                        },
                        balancePosition: 'bottom',
                        rightJustify: 'space-around'
                      }}
                      to={{
                        wrapStyle: { h: '108px' },
                        balance: toBalanceInfo?.balanceFormat || '',
                        value: toAmount,
                        amountValue: getTokenAmountValue(toToken?.coin_type, toAmount),
                        loading: false,
                        remainBalanceAmount: 0.5,
                        onFocusChange: (focus: boolean) => {
                          if (focus && +(toAmount + '') && byAmountIn) {
                            handleAmountChange(toAmount + '', false, toToken?.coin_type === dlmmApiPoolInfo?.coin_type_a)
                          }
                        },
                        onChange: value => {
                          handleAmountChange(value, false, toToken?.coin_type === dlmmApiPoolInfo?.coin_type_b)
                        },
                        selectable: false,
                        placeholder: '0.0',
                        token: toToken,
                        lock: {
                          isLock: !fromTokenLock && toTokenLock,
                          text: 'The current pool price is outside your specified price range. Single-asset deposit only.'
                        },
                        balancePosition: 'bottom',
                        rightJustify: 'space-around'
                      }}
                      iconParams={{
                        xlinkHref: '#icon-icon_add',
                        svgFill: 'text_caption'
                      }}
                      lock={{
                        isLock: fromTokenLock && toTokenLock,
                        style: { h: '224px' }
                      }}
                    />
                  )}
                </Box>
              </VStack>
              <VStack w="100%" gap="8px" className="dlmm-tutorial-step-6" p="2px 8px 0px">
                {!!dlmmApiPoolInfo?.id && !(fromTokenLock && toTokenLock) && (
                  <VStack gap="12px" w="100%" borderRadius="16px">
                    {preCalcError && (
                      <ErrorTips
                        tipsFontSize="12px"
                        tipsLineHeight="12px"
                        tips={'Amount too small to allocate across bins. Please increase the amount.'}
                        type="warning"
                      />
                    )}
                    <Button
                      w="100%"
                      h="52px"
                      margin="-1px -1px 5px"
                      fontSize="18px"
                      fontWeight="500"
                      borderRadius="12px"
                      isDisabled={btnDisabled || !btnClickRef.current || (showRiskConfirm && !knowsRisk)}
                      isLoading={submitLoading || preCalcLoading || zapProps.zapPreCalcLoading}
                      onClick={handleAdd}
                    >
                      {btnText}
                    </Button>

                    {zapProps.zapTipsError && <ErrorTips tips={zapProps.zapTipsError} />}

                    <DlmmZapRoute
                      zapProps={zapProps}
                      zapProgressRef={undefined}
                      warpStyle={{ pt: '0px', pb: '0px' }}
                      currentRangeTab={currentRangeTab}
                    >
                      {showRiskConfirm && !(btnDisabled || !btnClickRef.current) && (
                        <RiskConfirm
                          checked={knowsRisk}
                          onChange={handleKnowsRisk}
                          slippage={d(liquiditySlippage).mul(100).toNumber()}
                          tipType={d(liquiditySlippage).gte(0.1) ? 'error' : 'warning'}
                        />
                      )}
                    </DlmmZapRoute>

                    {fromToken && toToken && (currTabMode === BothAndZapTabAction.useBoth || !isAutoFill) && (
                      <>
                        {/* {positionCount > 1 && (
                        <HTextLabelBox
                          label={
                            <HStack gap="4px">
                              <Text>Position</Text>
                              <CetusTooltip
                                tooltip={
                                  <Text lineHeight="20px" fontSize="12px">
                                    Each position covers up to 69 bins on Sui, multiple positions are needed to cover a larger range.
                                  </Text>
                                }
                              >
                                <Icon xlinkHref="#icon-icon_tips" />
                              </CetusTooltip>
                            </HStack>
                          }
                          value={positionCount + ''}
                          labelStyle={{
                            fontSize: '14px'
                          }}
                          valueStyle={{
                            fontSize: '14px'
                          }}
                        />
                      )} */}

                        <TotalAmount totalAmount={totalAmount} loading={preCalcLoading} valueStyle={{ h: '20px', lineHeight: '20px' }} />

                        {/* {apiPoolInfo?.haveFarming && (
                        <AutoStakePosition disabled={fromTokenLock || toTokenLock} checked={autoStakePosition} onChange={handleChangeAutoStake} />
                      )} */}
                      </>
                    )}
                  </VStack>
                )}

                {/* {apiPoolInfo?.haveFarming && (
                <AutoStakePosition disabled={fromTokenLock || toTokenLock} checked={autoStakePosition} onChange={handleChangeAutoStake} />
              )} */}
              </VStack>
            </VStack>
          </VStack>
          <>
            {dlmmApiPoolInfo?.vaultCategory && (
              <VaultBanner
                displayTokenA={dlmmApiPoolInfo.displayTokenA!}
                displayTokenB={dlmmApiPoolInfo.displayTokenB!}
                feeDisplay={dlmmApiPoolInfo?.feeDisplay || ''}
                clmmPool={dlmmApiPoolInfo?.poolAddress || ''}
                vaultId={dlmmApiPoolInfo?.vaultId || ''}
                isReverse={dlmmApiPoolInfo?.isReverse || false}
                category={dlmmApiPoolInfo?.vaultCategory || ''}
              />
            )}
          </>
        </VStack>
      </HStack>
    </>
  )
}

export default PCDeposit
