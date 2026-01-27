import RiskConfirm from '@/components/common/RiskConfirm'
import Slippage from '@/components/common/Slippage'
import TotalAmount from '@/components/common/TotalAmount'
import VaultBanner from '@/components/vaults-v2/add-liquidity/VaultsBanner'
import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { BothAndZapTabAction, zapInTabList } from '@/types/dlmm'
import { Block, ErrorTips, TradeInput, TradeInputGroup } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { d } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useSize } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AutoFillSwitch from '../AutoFillSwitch'
import { BothAndZapTab } from '../BothAndZapTab'
import SelectStrategy from '../SelectStrategy'
import SetPriceRange from '../SetPriceRange'
import DlmmZapRoute from './DlmmZapRoute'
import { DLMMDepositProps } from './type'

function H5Deposit({
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
  zapProps,
  preCalcLoading,
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
  const inputGroupRef = useRef<HTMLDivElement>(null)
  const [isInputInView, setIsInputInView] = useState(true)
  const { currentAccount } = useAccountStore()

  // 检测输入框是否在可视区域内
  useEffect(() => {
    const checkInputInView = () => {
      if (inputGroupRef.current) {
        const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
        if (!scrollContainer) {
          setIsInputInView(true)
          return
        }

        const containerRect = scrollContainer.getBoundingClientRect()
        const inputRect = inputGroupRef.current.getBoundingClientRect()

        // 检查输入框是否在滚动容器的可视区域内（考虑一些边距）
        const containerTop = containerRect.top
        const containerBottom = containerRect.bottom
        const inputTop = inputRect.top
        const inputBottom = inputRect.bottom

        // 输入框在可视区域内：输入框的顶部在容器顶部下方，且输入框的底部在容器底部上方（允许100px边距）
        const isVisible = inputTop >= containerTop - 100 && inputBottom <= containerBottom + 100
        setIsInputInView(isVisible)
      }
    }

    checkInputInView()
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkInputInView)
      window.addEventListener('resize', checkInputInView)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkInputInView)
        window.removeEventListener('resize', checkInputInView)
      }
    }
  }, [])

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

  // 检查输入框是否为空
  const isInputEmpty = useMemo(() => {
    if (showZapSelectCoinUI) {
      return !zapProps.zapAmount || zapProps.zapAmount === '0' || zapProps.zapAmount === ''
    }
    return (!fromAmount || fromAmount === '0' || fromAmount === '') && (!toAmount || toAmount === '0' || toAmount === '')
  }, [showZapSelectCoinUI, zapProps.zapAmount, fromAmount, toAmount, isAutoFill])

  // 处理按钮点击
  const handleButtonClick = useCallback(() => {
    if (!currentAccount) {
      handleAdd()
      return
    }
    // 如果输入框被遮挡且为空，滚动到页面底部
    if (!isInputInView && isInputEmpty && inputGroupRef.current) {
      const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
      if (scrollContainer) {
        // 使用双重 requestAnimationFrame 确保 DOM 已更新
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 计算最大滚动位置
            const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight
            // 直接设置 scrollTop 到最大值
            scrollContainer.scrollTop = maxScrollTop
            // 如果设置失败，使用 scrollTo 作为备选
            if (scrollContainer.scrollTop < maxScrollTop - 10) {
              scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
              })
            }
          })
        })
      }
      return
    }
    // 否则执行原来的逻辑
    handleAdd()
  }, [isInputInView, isInputEmpty, handleAdd, currentAccount])

  // 计算按钮是否应该禁用
  const shouldDisableButton = useMemo(() => {
    // 如果输入框未被遮挡，走原来的disabled逻辑
    // 如果输入框在可视区域内且为空，确保按钮是disabled的
    if (!currentAccount) return false
    if (isInputInView) {
      return btnDisabled || !btnClickRef.current || isInputEmpty
    }
    // 如果输入框被遮挡且为空，按钮可点击（用于滚动）
    if (!isInputInView && isInputEmpty) {
      return false
    }
    // 其他情况走原来的逻辑
    return btnDisabled || !btnClickRef.current
  }, [isInputInView, isInputEmpty, btnDisabled, btnClickRef.current, currentAccount])

  const getTradeInputWrapStyle = useCallback(
    (isFrom: boolean) => {
      return {
        h: '108px',
        overflow: 'hidden'
      }
    },
    [fromTokenLock, toTokenLock]
  )
  const { isApp } = useWindowWidth()

  const fixBottomSubmitSize = useSize(document.querySelector('.fixed-bottom-submit') as HTMLElement)

  return (
    <VStack
      w="100%"
      pb={fixBottomSubmitSize?.height && document.querySelector('.fixed-bottom-submit') ? `${fixBottomSubmitSize?.height - 28}px` : '8px'}
    >
      <VStack w="100%" p="12px" gap="12px" align="flex-start">
        <Text lineHeight="20px" fontSize="14px" fontWeight="500" color="text_caption">
          Select Strategy
        </Text>
        <SelectStrategy />
      </VStack>
      <VStack w="100%" p="12px" gap="0px">
        <SetPriceRange
          perText={perText}
          direct={direct !== isReverse}
          minPriceData={minPriceData}
          maxPriceData={maxPriceData}
          rangeTabList={rangeTabList}
          currentRangeTab={currentRangeTab}
          onReverseClick={onReverseClick}
        />
        <VStack w="100%" gap="8px" className="dlmm-tutorial-step-6">
          {!!dlmmApiPoolInfo?.id && !(fromTokenLock && toTokenLock) && (
            <VStack
              gap="12px"
              w="100%"
              borderTop="1px solid"
              borderColor="border"
              className="fixed-bottom-submit"
              sx={{ position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: '9999', bg: 'background', p: '12px 12px 32px' }}
            >
              <DlmmZapRoute zapProps={zapProps} zapProgressRef={undefined} warpStyle={{ pt: '0px', pb: '0px' }} currentRangeTab={currentRangeTab}>
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
                <TotalAmount totalAmount={totalAmount} loading={false} valueStyle={{ h: '12px', lineHeight: '12px' }} />
              )}

              <Button
                w="100%"
                h="42px"
                margin="-1px -1px 5px"
                fontSize="14px"
                fontWeight="500"
                borderRadius="8px"
                isDisabled={shouldDisableButton}
                isLoading={submitLoading || preCalcLoading || zapProps.zapPreCalcLoading}
                onClick={handleButtonClick}
              >
                {btnText}
              </Button>
            </VStack>
          )}
        </VStack>
      </VStack>
      <VStack w="100%" px="12px" gap="12px">
        <VStack w="100%" h="56px" align="flex-start">
          <Text lineHeight="20px" fontSize="14px" fontWeight="500" color="text_caption">
            Deposit Amounts
          </Text>
          <HStack w="100%" justify="space-between" flexDirection={'row-reverse'}>
            <Block p="4px 4px 4px 8px" borderRadius="8px" w="auto" bg="transparent" border="none">
              {/* {(!isOneSide || !zapProps.supportZap) && } */}
              <AutoFillSwitch disabled={!zapProps.supportZap && (fromTokenLock || toTokenLock)} />
              {/* {isOneSide && zapProps.supportZap && (
                  <ZapSwitch
                    action='Deposit'
                    value={currTabMode === BothAndZapTabAction.zapIn}
                    onChange={() => {
                      if (currTabMode === BothAndZapTabAction.zapIn) {
                        setCurrTabMode(BothAndZapTabAction.useBoth)
                      } else {
                        setCurrTabMode(BothAndZapTabAction.zapIn)
                      }
                    }}
                    padding='0px'
                  />
                )} */}
            </Block>
            <Slippage
              slippageType="liquidity"
              poolType="dlmm"
              showNewTolerance={currTabMode === BothAndZapTabAction.zapIn}
              tokenA={fromToken}
              tokenB={toToken}
            />
          </HStack>
        </VStack>
        {isAutoFill && !isOneSide && zapProps.supportZap && (
          <BothAndZapTab currentTab={currTabMode} tabList={zapInTabList} onSelectTab={setCurrTabMode} />
        )}
        <Box w="100%" position="relative" ref={inputGroupRef}>
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
              onClick={onReverseClick}
              from={{
                wrapStyle: getTradeInputWrapStyle(true),
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
                wrapStyle: getTradeInputWrapStyle(false),
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
        {zapProps.zapTipsError && <ErrorTips tips={zapProps.zapTipsError} />}

        {preCalcError && (
          <ErrorTips
            tipsFontSize="12px"
            tipsLineHeight="12px"
            tips={'Amount too small to allocate across bins. Please increase the amount.'}
            type="warning"
          />
        )}
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
  )
}

export default H5Deposit
