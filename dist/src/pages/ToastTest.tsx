import SwapTradeStatus from '@/components/swap-widget/SwapTradeStatus'
import { useGlobalToast } from '@cetus/design'
import { useTransactionStore } from '@cetus/stores'
import { CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { sleepTime } from '@cetus/utils'
import { Button, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import useTransactionModal from '../../../hooks/src/useTransactionModal'

const info: ToastType = {
  link: 'http://localhost:5173/test-toast',
  isSwapWidget: false,
  getShowInfo: (status: TransactionStatusType): CommonTypeInfo => {
    const info: CommonTypeInfo = {
      showSubmittedToast: true,
      iconUrl: '/images/chain/cross_pending_icon@2x.png',
      // toastTitleText: 'KaiaBunny (BUNNY)',
      toastTitleText:
        'Remove Liquidity 0.000000022 WBTC WBTC WBTC WBTC WBTC and 0.01383623789237892378923 WBTC WBTC WBTC WBTC WBTC WBTC WBTC WBTC wUSDC',
      toastDescriptionContent: '234 BUNNY successful',
      modalTitleText: 'Buy ABC Token',
      modalDescriptionText: 'Pay 1 SUl for 0.529453032 ABC'
    }
    return info
  }
}

export default function ToastTest() {
  const { failedTsToast, submittedTsToast, successTsToast, closeToast, customToast } = useGlobalToast()
  const { transactionConfirmation, transactionSubmitted, transactionSuccess, transactionRejected } = useTransactionModal()
  const { transactionModalVisible, transactionData, setTransactionModalVisible, setManualCloseId } = useTransactionStore()

  const showFailedTsToast = () => {
    failedTsToast(info)
  }

  const showSuccessTsToast = () => {
    successTsToast(info)
  }

  const showConfirmingTsToast = () => {
    submittedTsToast(info)
  }

  const showSuccessToast = async () => {
    const transactionId = submittedTsToast(info)
    await sleepTime(1000)
    closeToast(transactionId)
    successTsToast(info)
  }

  const showFailedToast = async () => {
    const transactionId = submittedTsToast(info)
    await sleepTime(1000)
    closeToast(transactionId)
    failedTsToast(info)
  }

  const showTransactionnConfirmation = () => {
    transactionConfirmation(info)
  }

  const showTransactionSubmitted = () => {
    transactionSubmitted(info)
  }

  const showTransactionSuccess = () => {
    transactionSuccess(info)
  }

  const showTransactionFailed = () => {
    transactionRejected(info)
  }
  const showCustomToast = () => {
    customToast(
      <VStack gap="8px" alignItems="start">
        <HStack>
          <Icon xlinkHref="#icon-icon_close" variant="error" />
          <Heading fontSize="14px" fontWeight="400" whiteSpace="nowrap" color="primary_red">
            Wallet Not Ready Error
          </Heading>
        </HStack>

        <HStack>
          <Text fontSize="14px" color="primary_gray" wordBreak="break-all">
            Please install
          </Text>
          <Text cursor="pointer" fontSize="14px" color="primary" wordBreak="break-all" onClick={() => {}}>
            Sui name
          </Text>
          <Text fontSize="14px" color="primary_gray" wordBreak="break-all">
            extension first
          </Text>
        </HStack>
      </VStack>
    )
  }

  return (
    <VStack pt="60px">
      <Button onClick={showConfirmingTsToast}>Toast 钱包点击确认</Button>
      <Button onClick={showFailedTsToast}>Toast交易失败</Button>
      <Button onClick={showSuccessTsToast}>Toast交易成功</Button>

      <Button mt="20px" onClick={showTransactionnConfirmation}>
        弹窗 用户点击提交（唤起钱包待确认）
      </Button>
      <Button onClick={showTransactionSubmitted}>弹窗 用户在钱包点击确认</Button>
      <Button onClick={showTransactionSuccess}>弹窗 交易成功 </Button>
      <Button onClick={showTransactionFailed}>弹窗 交易失败 </Button>

      <Button mt="20px" onClick={showSuccessToast}>
        完整成功流程串联
      </Button>
      <Button onClick={showFailedToast}>完整失败流程串联</Button>
      <Button onClick={showCustomToast}>Custom Toast Test</Button>

      {transactionModalVisible && (
        <VStack bg="swap_bg_primary" w="386px" borderRadius="16px" p="0px">
          <SwapTradeStatus data={transactionData!} onClose={() => {}} />
        </VStack>
      )}
    </VStack>
  )
}
