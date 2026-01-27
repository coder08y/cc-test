import { useMergeSwap } from '@/hooks/merge-swap/useMergeSwap'
import { useMergeSwapButtonStatus } from '@/hooks/merge-swap/useMergeSwapButtonStatus'
import { useFormatMergeSwapRoute, useMergeSwapScamsText } from '@/hooks/merge-swap/useMergeSwapHelper'
import useMergeSwapStore from '@/store/merge-swap/useMergeSwapStore'
import { MergeSwapMaxOutValue, MergeSwapQuote } from '@/types/merge_swap'
import { ErrorTips, TokenSelectModal, TradeInput } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { BackButton, HTextLabelBox, Icon } from '@cetus/ui-kit'
import { addComma, cancelBubble, formatCurrency, formatNumber } from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, Button, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScamsAlert from '../swap/ScamsAlert'
import OverView from '../swap/SwapRoutes/OverView'
import RoutesModal from '../swap/SwapRoutes/RoutesModal'
import MergeSwapConfirm from './MergeSwapConfirm'
import { MergeTradeHeader } from './MergeTradeHeader'
import { MergeTradeInputFrom } from './MergeTradeInputFrom'

export default function MergeSwapTrade() {
  const { windowWidth } = useWindowWidth()
  const navigate = useNavigate()
  const {
    toToken,
    setToToken,
    setFromTokenList,
    switchFromToken,
    fromTokenList,
    removeFromToken,
    mergeSwapQuote,
    findRouterLoading,
    isOpenRoutePathModal,
    setIsOpenRoutePathModal,
    selectedRoutePathIndex,
    setSelectedRoutePathIndex,
    isShowSelectRouter
  } = useMergeSwapStore()
  const {
    totalOutValue,
    totalInputValue,
    minReceivedAmount,
    toBalanceInfo,
    handleSwapSubmit,
    isAllInputValid,
    hasAnyInput,
    isAllBalanceEnough,
    handleRefresh,
    isOpenConfirmModel,
    setIsOpenConfirmModel,
    progressRef,
    targetTokenList
  } = useMergeSwap()
  const { btnText, btnDisabled } = useMergeSwapButtonStatus(isAllInputValid, isAllBalanceEnough, totalOutValue)
  const { currentAccount, onWalletModal } = useAccountStore()
  const [isOpenSelectTokenModal, setIsOpenSelectTokenModal] = useState(false)
  const [tokenModalType, setTokenModalType] = useState<'from' | 'to'>('from')
  const [tokenSelectType, setTokenSelectType] = useState<'multiple' | 'single'>('multiple')
  const [actionFromIndex, setActionFromIndex] = useState<number>(0)

  const { scamsText } = useMergeSwapScamsText(fromTokenList)

  const onSelectToken = useCallback(
    (tokenInfo: Token | Token[]) => {
      console.log('MergeSwapTrade 🚀 ~ onSelectToken ~ tokenInfo:', tokenInfo)
      if (!tokenInfo) return
      if (tokenSelectType === 'multiple') {
        const tokenList = tokenInfo as Token[]
        if (toToken && tokenList.find(item => fixCoinType(item.coin_type) === fixCoinType(toToken.coin_type))) {
          setToToken(undefined)
        }
        setFromTokenList(tokenInfo as Token[])
      } else {
        if (tokenModalType === 'from') {
          const newToken = tokenInfo as Token
          // 如果选择的是from token，则不进行切换
          if (newToken.coin_type === fromTokenList[actionFromIndex].coin_type) {
            return
          }
          if (toToken && fixCoinType(newToken.coin_type) === fixCoinType(toToken.coin_type)) {
            setToToken(undefined)
          }
          switchFromToken(newToken, actionFromIndex)
        } else {
          setFromTokenList(fromTokenList.filter(item => fixCoinType(item.coin_type) !== fixCoinType((tokenInfo as Token).coin_type)))
          setToToken(tokenInfo as Token)
        }
      }
    },
    [tokenSelectType, tokenModalType, fromTokenList, toToken, actionFromIndex]
  )

  const confirmModalDataRef = useRef<MergeSwapQuote | null>(null)

  const { allProviders, hasHighPriceDiff } = useFormatMergeSwapRoute(mergeSwapQuote)

  const modalSelectTokens = useMemo(() => {
    if (tokenSelectType === 'multiple') {
      return fromTokenList
    } else {
      if (tokenModalType === 'from') {
        return fromTokenList[actionFromIndex]
      } else {
        return toToken
      }
    }
  }, [fromTokenList, toToken, tokenSelectType, actionFromIndex, tokenModalType])

  const getMergeSwapQuote = (): MergeSwapQuote => {
    if (isOpenConfirmModel && confirmModalDataRef.current) {
      return confirmModalDataRef.current
    }
    return { ...mergeSwapQuote! }
  }

  useEffect(() => {
    if (!isOpenConfirmModel) {
      confirmModalDataRef.current = null
    }
  }, [isOpenConfirmModel])

  return (
    <VStack alignItems="start" mt={{ base: '28px', lg: '32px' }} w={{ base: '100%', lg: '470px' }} position="relative" gap="12px">
      <BackButton
        h="28px"
        customTextStyle={{ fontSize: '12px' }}
        onClick={() => {
          navigate('/swap')
        }}
      />
      <HStack mt="20px" width="100%" justifyContent="space-between" alignItems="center">
        <Text fontSize="16px" fontWeight="500" color="text_caption">
          Merge Swap
        </Text>
        {/* 滑点、进度条 */}
        <MergeTradeHeader progressRef={progressRef} handleRefresh={handleRefresh} callbackInterval={isOpenConfirmModel ? 5 : 10} />
      </HStack>

      <VStack w="100%" gap="12px" pt="12px" pb="12px" alignItems="start">
        <Text fontSize="13px">You Pay</Text>
        {/* 选择from token */}
        <MergeTradeInputFrom
          openSelectTokenModal={(selectType, fromIndex) => {
            setTokenSelectType(selectType)
            setTokenModalType('from')
            setActionFromIndex(fromIndex)
            setIsOpenSelectTokenModal(true)
          }}
          handleRemoveClick={token => {
            removeFromToken(token)
          }}
        />
        {/* 指示箭头 */}
        <Center w="36px" h="36px" ml="calc(50% - 18px)" borderRadius="50%" border="1px solid" borderColor="token_inactive_border" bg={'input_bg'}>
          <Icon cursor="default" xlinkHref="#icon-a-icon_trade" svgFill="text_caption" fontSize="12px" />
        </Center>

        <Text fontSize="13px">You Receive</Text>
        {/* 选择to token */}
        <TradeInput
          token={toToken}
          value={mergeSwapQuote?.totalAmountOutDisplay || ''}
          balance={toBalanceInfo?.balanceFormat || '0'}
          selectable={true}
          placeholder={'0'}
          inputAllowed={false}
          half={false}
          max={false}
          loading={findRouterLoading}
          onChange={() => {}}
          openSelectTokenModal={() => {
            setTokenModalType('to')
            setTokenSelectType('single')
            setIsOpenSelectTokenModal(true)
          }}
          amountValue={totalOutValue}
          wrapStyle={{
            h: '98px',
            borderRadius: '12px'
          }}
          symbolTipStyle={{
            fontSize: '16px'
          }}
        />

        {/* 风险提示 */}
        {scamsText && (
          <Box mt="-44px" p="48px 16px 16px" borderRadius="20px" bg="bg_secondary" border="1px solid" borderColor="border">
            <ScamsAlert scamsText={scamsText} />
          </Box>
        )}

        {/* 超出最大输出值 */}
        {!findRouterLoading && totalOutValue && d(totalOutValue).gt(MergeSwapMaxOutValue) && (
          <ErrorTips mt="-4px" type="error" tips={`The Output exceeds the maximum: $${addComma(MergeSwapMaxOutValue)}`} />
        )}
        {/* 流动性不足 */}
        {!findRouterLoading && mergeSwapQuote?.error?.coin && (
          <ErrorTips mt="-4px" type="error" tips={`Insufficient Liquidity on ${mergeSwapQuote?.error?.coin?.symbol}`} />
        )}
        {/* 未连接钱包 */}
        {!currentAccount && hasAnyInput && <ErrorTips mt="-4px" type="warning" tips={`Please connect wallet to load results.`} />}
        {/* 价格差异过大 */}
        {/* {hasHighPriceDiff && !findRouterLoading && isShowSelectRouter && (
          <ErrorTips mt="-4px" type="warning" tips={`High price difference. Be cautious before submitting your order`} />
        )} */}
        <VStack gap="12px" bg="bg_secondary" w="100%" borderRadius="12px 12px 16px 16px" border="1px solid" borderColor="border">
          {/* 提交按钮 */}
          <Button
            fontSize="18px"
            fontWeight="500"
            width="100%"
            h="52px"
            m="-1px"
            isDisabled={btnDisabled || findRouterLoading}
            isLoading={findRouterLoading}
            onClick={() => {
              if (!currentAccount?.address) {
                onWalletModal(true)
                return
              }
              // 在打开确认弹窗前保存当前数据
              if (mergeSwapQuote) {
                confirmModalDataRef.current = { ...mergeSwapQuote }
              }
              setIsOpenConfirmModel(true)
            }}
          >
            {btnText}
          </Button>

          {/* 报价结果 */}
          {mergeSwapQuote?.data && mergeSwapQuote.data.allRoutes.length > 0 && isShowSelectRouter && (
            <VStack w="100%" mt="4px" pb="12px">
              <HTextLabelBox
                isLoading={findRouterLoading}
                label={'Total Input Value'}
                value={`${totalInputValue === 'Incalculable' ? totalInputValue : formatCurrency(totalInputValue, 2)}`}
                labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
                valueStyle={{ fontWeight: 500, fontSize: '14px', color: totalInputValue === 'Incalculable' ? 'primary_yellow' : 'text_primary' }}
                skeletonStyle={{
                  valueW: '128px'
                }}
                wrapStyle={{
                  p: '0 8px',
                  minH: '20px'
                }}
              />
              <HTextLabelBox
                isLoading={findRouterLoading}
                label={'Minimum Received'}
                value={`${formatNumber(minReceivedAmount, toToken?.decimals)} ${toToken?.symbol}`}
                labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
                valueStyle={{ fontWeight: 500, fontSize: '14px' }}
                skeletonStyle={{
                  valueW: '128px'
                }}
                wrapStyle={{
                  p: '0 8px',
                  minH: '20px'
                }}
              />

              <HStack w="100%" justify="space-between" align="flex-start" p="0 8px" mt="2px">
                <Text fontWeight="500" whiteSpace="nowrap">
                  Route
                </Text>
                <Box
                  mt="-2px"
                  onClick={e => {
                    cancelBubble(e)
                    setIsOpenRoutePathModal(true)
                    setSelectedRoutePathIndex(0)
                  }}
                  cursor="pointer"
                >
                  <OverView allProviders={allProviders} loading={findRouterLoading}>
                    <Icon xlinkHref="#icon-icon_spread" fontSize="16px" />
                  </OverView>
                </Box>
              </HStack>
            </VStack>
          )}
        </VStack>
      </VStack>
      {/* 交易确认弹窗 */}
      {isOpenConfirmModel && getMergeSwapQuote() && (
        <MergeSwapConfirm
          data={getMergeSwapQuote()!}
          onClose={() => {
            setIsOpenConfirmModel(false)
            confirmModalDataRef.current = null
          }}
          handleRouterSwap={data => {
            handleSwapSubmit(data)
          }}
          isOpen={isOpenConfirmModel}
        />
      )}

      {/* 路由path弹窗 */}
      {isOpenRoutePathModal && mergeSwapQuote?.data && (
        <RoutesModal
          isOpen={isOpenRoutePathModal}
          onClose={() => {
            setIsOpenRoutePathModal(false)
          }}
          mergeSwapData={{
            allRoutes: [...mergeSwapQuote?.data?.allRoutes],
            currentIndex: selectedRoutePathIndex
          }}
          toCoin={toToken}
          allProviders={allProviders}
        />
      )}

      {/* 选择token弹窗      */}
      <TokenSelectModal
        selectType={tokenSelectType}
        value={modalSelectTokens}
        isShowCoinInfo={tokenModalType === 'from'}
        showSearchInput={tokenModalType === 'from'}
        isShowHotList={tokenModalType !== 'to'}
        haveImport={tokenModalType !== 'to'}
        isShowLabelTab={tokenModalType !== 'to'}
        isShowTokenListTab={tokenModalType !== 'to'}
        isShowCollectListBox={tokenModalType === 'from'}
        whiteTokenList={tokenModalType === 'to' ? targetTokenList : undefined}
        maxSelectNum={tokenSelectType === 'multiple' ? 6 : 1}
        isOnlyMergeTargetToken={tokenModalType === 'to'}
        onSelectToken={onSelectToken}
        isOpen={isOpenSelectTokenModal}
        onClose={() => {
          setIsOpenSelectTokenModal(false)
        }}
      />
    </VStack>
  )
}
