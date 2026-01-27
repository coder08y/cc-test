import useMarginPoolsSwap from '@/hooks/deepbook/margin/useMarginPoolsSwap'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { ErrorTips, SelectTab, TradeInput } from '@cetus/design'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { CheckBox, VaulDrawer } from '@cetus/ui-kit'
import { d, textEllipses } from '@cetus/utils'
import { Box, Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import DropSelectToken from './DropSelectToken'
import RouteBlock from './RouteBlock'

export interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  currentMarginPool: any
  isLoading: boolean
  toDeposit: () => void
  toWithdraw: (isClickMax: boolean) => void
  tab?: 'Deposit' | 'Withdraw'
}

export default function ActionModal({ isOpen, onClose, currentMarginPool, isLoading, toDeposit, toWithdraw, tab = 'Deposit' }: ActionModalProps) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { isApp } = useWindowWidth()

  useEffect(() => {
    return () => {
      setInputValue('')
    }
  }, [])

  const deepBookMarginPools = useDeepBookMarginPoolStore(state => state.deepBookMarginPools)
  const userInfo = useDeepBookMarginPoolStore(state => state.userInfo)
  const isAutoSwap = useDeepBookMarginPoolStore(state => state.isAutoSwap)
  const inputValue = useDeepBookMarginPoolStore(state => state.inputValue)
  const routerData = useDeepBookMarginPoolStore(state => state.routerData)
  const toToken = useDeepBookMarginPoolStore(state => state.toToken)
  const setToToken = useDeepBookMarginPoolStore(state => state.setToToken)
  const setInputValue = useDeepBookMarginPoolStore(state => state.setInputValue)
  const setIsAutoSwap = useDeepBookMarginPoolStore(state => state.setIsAutoSwap)

  const poolMap = useMemo(() => {
    return deepBookMarginPools.reduce(
      (acc, pool) => {
        acc[pool.objectId] = pool
        return acc
      },
      {} as Record<string, (typeof deepBookMarginPools)[number]>
    )
  }, [deepBookMarginPools])

  const marginPool = currentMarginPool?.objectId ? poolMap[currentMarginPool.objectId] : null

  const tabList = [
    { label: 'Deposit', value: 'Deposit' },
    { label: 'Withdraw', value: 'Withdraw' }
  ]
  const [currentTab, setCurrentTab] = useState(tab)

  const { tokenList, reCalculateRouteData, findRouterLoading } = useMarginPoolsSwap(marginPool)

  const { balanceInfo } = useGetTokenBalance(marginPool?.tokenInfo)

  const { getTokenAmountValue } = useTokenPrice()

  const tokenAmountValue = getTokenAmountValue(marginPool?.tokenInfo?.coin_type, inputValue)

  /* ================= 派生状态集中 ================= */
  const currentPoolInfo = userInfo[marginPool?.objectId]

  const balance = useMemo(() => {
    return currentTab == 'Deposit' ? balanceInfo?.balanceFormat || '' : currentPoolInfo?.userSupplied
  }, [currentTab, balanceInfo?.balanceFormat, currentPoolInfo?.userSupplied])

  const btnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: currentTab,
      disabled: false
    }
    if (!currentAccount?.address) {
      btnInfo.text = 'No Available Route'
      btnInfo.disabled = false
      return btnInfo
    }

    if (!inputValue) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    if (!balance || Number(balance) == 0 || d(balance).lt(inputValue)) {
      btnInfo.text = `Insufficient ${textEllipses(marginPool?.tokenInfo?.symbol)} Balance`
      btnInfo.disabled = true
      return btnInfo
    }
    if (currentTab === 'Deposit' && marginPool?.availableSupply && d(marginPool.availableSupply).lt(inputValue)) {
      btnInfo.text = 'Exceeds available supply'
      btnInfo.disabled = true
      return btnInfo
    }
    if (isLoading || (isAutoSwap && routerData?.errorCode)) {
      btnInfo.disabled = true
      return btnInfo
    }
    return btnInfo
  }, [balance, marginPool, balanceInfo?.balanceFormat, currentTab, inputValue, currentAccount?.address, isLoading, isAutoSwap, routerData?.errorCode])

  /* ================= 事件收口 ================= */
  const [isClickMax, setIsClickMax] = useState(false)
  const clickBtn = () => {
    if (!currentAccount?.address) {
      onWalletModal(true)
      return
    }

    currentTab === 'Deposit' ? toDeposit() : toWithdraw(isClickMax)
  }

  /* ================= Content ================= */
  const renderContent = () => (
    <VStack w="100%" align="flex-start" gap="16px">
      <SelectTab
        type="borderTab"
        tabList={tabList}
        currentTab={currentTab}
        handleChangeTab={tab => {
          setCurrentTab(tab.value)
          setInputValue('')
          if (isAutoSwap) setIsAutoSwap(false)
        }}
        wrapStyle={{
          w: { base: '220px', lg: '350px' },
          h: '56px',
          p: '0px',
          borderRadius: '8px',
          bg: 'none',
          border: 'none',
          gap: '30px',
          mt: isApp ? '-20px' : '-2px'
        }}
        itemStyle={{ fontSize: '16px', margin: 0, bg: 'none' }}
      />
      {/* <Block p="20px" bg="#192127" mt="8px" minH="105px">
          <HStack w="100%" justify="space-around">
            <VStack gap="16px">
              <Text fontSize="13px" lineHeight="1" color="primary_gray">
                Your Supplied
              </Text>
              <Text color="text_caption" lineHeight="1">
                {currentPoolInfo?.displayUserSupplied} {marginPool?.tokenInfo?.symbol}
              </Text>
              <Text mt="-8px" fontSize="12px" lineHeight="1" color="primary_gray">
                {marginPool?.displayUserSupplyValue}
              </Text>
            </VStack>
            <VStack gap="16px">
              <Text fontSize="13px" lineHeight="1" color="primary_gray">
                Your Earnings
              </Text>
              <Text color="text_caption" lineHeight="1">
                {marginPool?.displayUnsettledEarning} {marginPool?.tokenInfo?.symbol}
              </Text>
              <Text mt="-8px" fontSize="12px" lineHeight="1" color="primary_gray">
                {marginPool?.displayUnsettledValue}
              </Text>
            </VStack>
          </HStack>
        </Block> */}
      <TradeInput
        wrapStyle={{ h: '110px', py: '20px !important', px: '16px !important' }}
        placeholder="0.0"
        value={inputValue}
        amountValue={tokenAmountValue}
        onChange={(val: any, isClickMax: boolean) => {
          console.log('🚀 ~ renderContent ~ isClickMax:', isClickMax)
          setIsClickMax(isClickMax)
          setInputValue(val)
        }}
        balance={balance}
        balanceLabel={currentTab === 'Deposit' ? '' : 'Available'}
        token={marginPool?.tokenInfo}
        inputStyle={{ width: '100%' }}
        needRemainBalance={currentTab === 'Deposit'}
      />

      {currentTab == 'Deposit' && (
        <HStack w="100%" justify="space-between" h="28px">
          <Text color="primary_gray">Available to Supply</Text>
          <Text color="text_caption">
            {marginPool?.displayAvailableSupply} {marginPool?.tokenInfo?.symbol}
          </Text>
        </HStack>
      )}

      {currentTab === 'Withdraw' && (
        <VStack align="flex-start" w="100%" gap="8px">
          <HStack h="28px" w="100%" justify="space-between">
            <HStack>
              <CheckBox checked={isAutoSwap} onClick={() => setIsAutoSwap(!isAutoSwap)} />
              <Text fontSize="13px" color="primary_gray">
                Auto swap to
              </Text>
            </HStack>

            {isAutoSwap && <DropSelectToken list={tokenList} currentToken={toToken} changeCurrentToken={token => setToToken(token)} />}
          </HStack>

          {isAutoSwap && !btnInfo.disabled && (
            <RouteBlock
              tokenA={marginPool?.tokenInfo}
              tokenB={toToken}
              routerData={routerData || {}}
              findRouterLoading={findRouterLoading}
              reCalculateRouteData={reCalculateRouteData}
              routeErrorInfo={routerData?.errorCode ? { ...routerData, errorText: 'Request failed' } : undefined}
            />
          )}
        </VStack>
      )}
      {btnInfo.text == 'Exceeds available supply' && (
        <ErrorTips
          type="warning"
          isShowIcon={false}
          tips={`Deposit amount exceeds available pool capacity. Remaining capacity: ${marginPool?.displayAvailableSupply} ${marginPool?.tokenInfo?.symbol}.`}
        />
      )}
      <Button isDisabled={btnInfo.disabled} w="100%" h="52px" fontSize="18px" fontWeight="500" onClick={clickBtn}>
        {btnInfo.text}
      </Button>
    </VStack>
  )

  /* ================= Layout ================= */

  if (isApp) {
    return (
      <VaulDrawer isOpen={isOpen} onClose={onClose} placement="bottom" padding="16px">
        <Box>{renderContent()}</Box>
      </VaulDrawer>
    )
  }

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton h="28px" />
        <ModalBody p="0 16px 16px">{renderContent()}</ModalBody>
      </ModalContent>
    </Modal>
  )
}
