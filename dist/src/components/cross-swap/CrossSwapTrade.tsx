import { useCrossButtonStatus } from '@/hooks/cross-swap/useCrossButtonStatus'
import { useGetCrossSwapErrorTips, useGetCrossSwapOptions } from '@/hooks/cross-swap/useCrossHelper'
import { useCrossPriceImpact } from '@/hooks/cross-swap/useCrossPriceImpact'
import useCrossSwap from '@/hooks/cross-swap/useCrossSwap'
import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { ErrorTips } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Chain, CrossSwapPlatform, CrossSwapToken, isEqualToken } from '@cetusprotocol/cross-swap-sdk'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useRef, useState } from 'react'
import { FreshProgressRef } from '../swap/FreshProgressV2'
import CrossProwered from './CrossProwered'
import CrossSwapHistoryModal from './CrossSwapHistoryModal'
import CrossSwapQuoteResult from './CrossSwapQuoteResult'
import CrossSwapSelectChainAndCoinModal from './CrossSwapSelectChainAndCoinModal'
import { CrossTradeHeader } from './CrossTradeHeader'
import CrossTradeInputGroup from './CrossTradeInputGroup'
import CrossAccountModal from './common/CrossAccountModal'
import { PriceDiffWarn } from './common/PriceDiffWarn'
import SettingToAddressModal from './common/SettingToAddressModal'

export interface CrossSwapTradeProps {
  platform: CrossSwapPlatform
  isShowCrossSelectRouter: boolean
  handleShowCrossSelectRouter: (isShow: boolean) => void
}

export default function CrossSwapTrade(props: CrossSwapTradeProps) {
  const { platform, isShowCrossSelectRouter, handleShowCrossSelectRouter } = props
  const { windowWidth } = useWindowWidth()

  const {
    fromChainAddress,
    toChainAddress,
    fromTokenBalance,
    toTokenBalance,
    handleInputAmountChange,
    isOpenHistoryModal, // 历史记录弹窗
    setIsOpenHistoryModal,
    isOpenSelectChainAndTokenModal, // 选择token弹窗
    setIsOpenSelectChainAndTokenModal,
    handleWalletAction,
    handleExecuteQuote,
    resetData,
    handleChangeChainAndToken,
    refetchQuote,
    handleConnectWalletClick,
    isSelectFromToken,
    setIsSelectFromToken
  } = useCrossSwap(platform)

  const { routers, findRouterLoading, fromCoinAmount, quote, setCrossSwapOptions } = useCrossSwapStore()
  const { fromChain, toChain, fromToken, toToken } = useGetCrossSwapOptions(platform)

  const { crossWalletModalData, setCrossWalletModalData, switchChainLoading, settingToAddressModalData, setSettingToAddressModalData } =
    useCrossSwapWalletStore()

  const { showPriceImpactWarn } = useCrossPriceImpact(
    platform,
    quote?.from_token,
    quote?.to_token,
    quote?.amount_in_formatted,
    quote?.amount_out_formatted
  )

  const progressRef = useRef<FreshProgressRef>(null)

  const [confirmPriceDiff, setConfirmPriceDiff] = useState(false)

  // 获取收到数量
  const toCoinAmount = useMemo(() => {
    setConfirmPriceDiff(false)
    if (quote) {
      return quote.amount_out_formatted
    }
    handleShowCrossSelectRouter(false)
    return ''
  }, [quote?.amount_out_formatted])

  // 按钮状态
  const { btnText, btnDisabled, action } = useCrossButtonStatus(
    platform,
    confirmPriceDiff,
    showPriceImpactWarn,
    fromChain,
    fromToken,
    fromChainAddress.address,
    toChainAddress.address,
    fromTokenBalance?.balance_formatted,
    routers
  )

  // 错误提示
  const { showErrorTips } = useGetCrossSwapErrorTips(routers, platform, fromToken, quote, fromTokenBalance?.balance_formatted)

  return (
    <VStack mt={{ base: '28px', lg: windowWidth && windowWidth < 1024 ? '0' : '42px' }} w={{ base: '100%', lg: '470px' }} position="relative">
      <HStack width="100%" justifyContent="space-between" h="52px" alignItems="center">
        <Text fontSize="16px" fontWeight="500" color="text_caption">
          Cross-Chain Swap
        </Text>
        {/* 历史记录、滑点、进度条 */}
        <CrossTradeHeader
          platform={platform}
          fromChainAddress={fromChainAddress.address}
          setIsOpenHistoryModal={setIsOpenHistoryModal}
          progressRef={progressRef}
          handleRefresh={refetchQuote}
        />
      </HStack>
      {/* 输入框 */}
      <CrossTradeInputGroup
        wrapStyle={{
          width: '100%',
          mt: '-6px'
        }}
        // 交换链和token方向
        onClick={handleChangeChainAndToken}
        from={{
          title: 'You Pay',
          currentCoin: fromToken,
          value: fromCoinAmount,
          balance: fromTokenBalance?.balance_formatted || '0',
          placeholder: '0.0',
          currentChain: fromChain,
          platform,
          amountValue: quote?.amount_in_usd || '0',
          onChange: (value: string) => {
            handleInputAmountChange(value)
          },
          onFocusChange: () => {},
          openSelectChainAndTokenModal: () => {
            setIsSelectFromToken(true)
            setIsOpenSelectChainAndTokenModal(true)
          },
          walletAddress: fromChainAddress.address,
          onConnectWallet: () => {
            handleConnectWalletClick(true)
          }
        }}
        to={{
          title: 'You Receive',
          currentCoin: toToken,
          inputAllowed: false,
          value: toCoinAmount,
          balance: toTokenBalance?.balance_formatted || '0',
          placeholder: '0.0',
          half: false,
          max: false,
          loading: findRouterLoading,
          currentChain: toChain,
          platform,
          walletAddress: toChainAddress.address,
          onConnectWallet: () => {
            handleConnectWalletClick(false)
          },
          amountValue: findRouterLoading ? '0' : quote?.amount_out_usd || '0',
          onChange: () => {},
          onFocusChange: () => {},
          openSelectChainAndTokenModal: () => {
            setIsSelectFromToken(false)
            setIsOpenSelectChainAndTokenModal(true)
          }
        }}
      />
      {/* 报价错误提示 */}
      {showErrorTips && !findRouterLoading && (
        <ErrorTips tips={showErrorTips} bg="primary_yellow_opacity.10" type="warning" isShowIcon={true} tipsFontSize="12px" />
      )}
      {/* 价格差大于10%警告 */}
      {showPriceImpactWarn && !findRouterLoading && (
        <PriceDiffWarn
          confirmPriceDiff={confirmPriceDiff}
          handleConfirmPriceDiffClick={(confirm: boolean) => {
            setConfirmPriceDiff(confirm)
          }}
        />
      )}

      <VStack bg="bg_secondary" w="100%" borderRadius="12px 12px 16px 16px" border="1px solid" borderColor="border">
        {/* 提交按钮 */}
        <Button
          fontSize="18px"
          fontWeight="500"
          width="100%"
          h="52px"
          m="-1px"
          isDisabled={btnDisabled}
          isLoading={findRouterLoading || switchChainLoading}
          onClick={() => {
            if (action === 'swap') {
              if (quote) {
                handleExecuteQuote(quote)
              }
            } else if (action === 'approve') {
              //   handleApprove()
            } else if (action === 'connect_from') {
              handleWalletAction(true, 'connect')
            } else if (action === 'connect_to') {
              // to方向钱包不直接连接，需要打开弹窗用户再次选择
              handleConnectWalletClick(false)
            }
          }}
        >
          {btnText}
        </Button>

        {/* 报价结果 */}
        {quote && (
          <CrossSwapQuoteResult
            platform={platform}
            toCoinAmount={toCoinAmount}
            isShowCrossSelectRouter={isShowCrossSelectRouter}
            handleShowCrossSelectRouter={() => {
              handleShowCrossSelectRouter(!isShowCrossSelectRouter)
            }}
          />
        )}
      </VStack>
      <CrossProwered crossPlatform={platform} />

      {/* {isOpenConfirmModal && (
        <CrossSwapConfirmModal isOpen={isOpenConfirmModal} onClose={() => setIsOpenConfirmModal(false)} originQuote={getConfirmModalData()} />
      )} */}

      {/* 历史记录弹窗 */}
      {isOpenHistoryModal && (
        <CrossSwapHistoryModal
          fromChainAddress={fromChainAddress.address}
          isOpen={isOpenHistoryModal}
          onClose={() => setIsOpenHistoryModal(false)}
          platform={platform}
        />
      )}
      {/* 选择链和token弹窗 */}
      {isOpenSelectChainAndTokenModal && (
        <CrossSwapSelectChainAndCoinModal
          isOpen={isOpenSelectChainAndTokenModal}
          onClose={() => setIsOpenSelectChainAndTokenModal(false)}
          onChangeChainAndCoin={(chain: Chain, token: CrossSwapToken) => {
            if (isSelectFromToken) {
              const isSameToken = toToken && isEqualToken(token, toToken)
              setCrossSwapOptions(platform, { fromChain: chain, fromToken: token, toToken: isSameToken ? undefined : toToken })
            } else {
              const isSameToken = fromToken && isEqualToken(token, fromToken)
              setCrossSwapOptions(platform, { toChain: chain, toToken: token, fromToken: isSameToken ? undefined : fromToken })
            }
            resetData()
            setIsOpenSelectChainAndTokenModal(false)
          }}
          crossPlatform={platform}
          isPay={isSelectFromToken}
          fromChain={fromChain as any}
          toChain={toChain as any}
          fromToken={fromToken}
          toToken={toToken}
        />
      )}

      {/* 查看钱包详情弹窗 */}
      {crossWalletModalData && (
        <CrossAccountModal
          isOpen={true}
          onClose={() => {
            setCrossWalletModalData(undefined)
          }}
          handleChangeWallet={() => {
            handleWalletAction(crossWalletModalData.isFrom, 'change')
          }}
          handleDisconnectWallet={() => {
            handleWalletAction(crossWalletModalData.isFrom, 'disconnect')
          }}
          data={crossWalletModalData}
        />
      )}
      {/* 设置目标地址弹窗 */}
      {settingToAddressModalData && (
        <SettingToAddressModal
          isOpen={true}
          handleChangeWallet={() => {
            handleWalletAction(false, 'connect')
          }}
          onClose={() => setSettingToAddressModalData(undefined)}
          data={settingToAddressModalData}
        />
      )}
    </VStack>
  )
}
