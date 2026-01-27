import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { SingleCoinImage } from '@cetus/ui-kit'
import { d, formatNumber } from '@cetus/utils'
import { Box, Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'

type ClosePositionModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  poolAddress: string
  ordersCount?: number
  isLoading?: boolean
}

export default function ClosePositionModal({ isOpen, onClose, onConfirm, poolAddress, ordersCount = 0, isLoading = false }: ClosePositionModalProps) {
  const { currentAccount } = useAccountStore()
  const { deepBookPools } = useDeepBookStore()
  const { getMarginBalanceData, getMarginDebt } = useMarginStore()

  // 获取池子信息
  const pool = deepBookPools?.find((p: any) => p.address === poolAddress) as any

  // 获取债务数据
  const debtData = currentAccount?.address
    ? getMarginDebt(currentAccount.address, poolAddress)
    : {
        baseDebt: '0',
        quoteDebt: '0',
        baseDebtUSD: '0',
        quoteDebtUSD: '0',
        totalDebtValue: '0'
      }

  // 获取余额数据
  const balanceData = currentAccount?.address
    ? getMarginBalanceData(currentAccount.address, poolAddress)
    : {
        baseTotalBalance: '0',
        quoteTotalBalance: '0',
        baseTotalBalanceUSD: '0',
        quoteTotalBalanceUSD: '0'
      }

  // 计算要提取的资产（总余额 - 债务）
  const baseWithdrawAmount = d(balanceData.baseTotalBalance || '0').sub(d(debtData.baseDebt || '0'))
  const quoteWithdrawAmount = d(balanceData.quoteTotalBalance || '0').sub(d(debtData.quoteDebt || '0'))

  // 计算提取资产的 USD 价值
  const baseWithdrawUSD = d(balanceData.baseTotalBalanceUSD || '0').sub(d(debtData.baseDebtUSD || '0'))
  const quoteWithdrawUSD = d(balanceData.quoteTotalBalanceUSD || '0').sub(d(debtData.quoteDebtUSD || '0'))

  // 格式化债务显示（返回 JSX 元素以便设置不同颜色）
  const formatDebtDisplay = () => {
    const baseDebt = d(debtData.baseDebt || '0')
    const quoteDebt = d(debtData.quoteDebt || '0')
    const totalDebtUSD = d(debtData.totalDebtValue || '0')

    if (baseDebt.gt(0) && quoteDebt.gt(0)) {
      // 两种债务都有
      return (
        <HStack gap="4px" align="baseline">
          <Text color="text_caption">
            {formatNumber(baseDebt.toString(), 4)} {pool?.baseAssets?.symbol || ''} + {formatNumber(quoteDebt.toString(), 4)}{' '}
            {pool?.quoteAssets?.symbol || ''}
          </Text>
          <Text color="text_paragraph">(${formatNumber(totalDebtUSD.toString(), 2)})</Text>
        </HStack>
      )
    } else if (baseDebt.gt(0)) {
      // 只有 base 债务
      const baseDebtUSD = d(debtData.baseDebtUSD || '0')
      return (
        <HStack gap="4px" align="baseline">
          <Text color="text_caption">
            {formatNumber(baseDebt.toString(), 4)} {pool?.baseAssets?.symbol || ''}
          </Text>
          <Text color="text_paragraph">(${formatNumber(baseDebtUSD.toString(), 2)})</Text>
        </HStack>
      )
    } else if (quoteDebt.gt(0)) {
      // 只有 quote 债务
      const quoteDebtUSD = d(debtData.quoteDebtUSD || '0')
      return (
        <HStack gap="4px" align="baseline">
          <Text color="text_caption">
            {formatNumber(quoteDebt.toString(), 4)} {pool?.quoteAssets?.symbol || ''}
          </Text>
          <Text color="text_paragraph">(${formatNumber(quoteDebtUSD.toString(), 2)})</Text>
        </HStack>
      )
    }
    return <Text color="text_caption">0</Text>
  }

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="480px" w="90%" borderRadius="16px">
        <ModalHeader
          sx={{
            p: '16px 16px 0'
          }}
        >
          <Text fontSize="16px" color="text_caption" fontWeight="500">
            Close Position
          </Text>
        </ModalHeader>
        <ModalCloseButton h="28px" />
        <ModalBody p="16px">
          <VStack w="100%" gap="0px" align="flex-start">
            {/* Information Box */}
            <Box w="100%" p="12px 16px" bg="primary_opacity.10" borderRadius="8px" border="1px solid" borderColor="primary_opacity.20" mb="16px">
              <VStack align="flex-start" gap="8px">
                <HStack gap="8px" align="flex-start">
                  <Text fontSize="14px" color="primay_opacity.10" lineHeight="20px">
                    •
                  </Text>
                  <Text fontSize="14px" color="primary" lineHeight="20px">
                    {ordersCount} open {ordersCount === 1 ? 'order' : 'orders'} will be cancelled
                  </Text>
                </HStack>
                <HStack gap="8px" align="flex-start">
                  <Text fontSize="14px" color="primay_opacity.10" lineHeight="20px">
                    •
                  </Text>
                  <Text fontSize="14px" color="primary" lineHeight="20px">
                    Your debt will be fully repaid, and all remaining assets will be withdrawn to your wallet.
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Debt Repayment Section */}
            <VStack w="100%" align="flex-start" gap="12px" mb="16px">
              <Text fontSize="14px" color="text_caption" fontWeight="500">
                Debt Repayment
              </Text>
              <HStack w="100%" justify="space-between">
                <Text color="text_paragraph">Current Debt</Text>
                {formatDebtDisplay()}
              </HStack>
            </VStack>

            {/* Dashed Divider */}
            <Box w="100%" h="1px" borderTop="1px dashed" borderColor="border" mb="16px" />

            {/* Withdrawal to Wallet Section */}
            <VStack w="100%" align="flex-start" gap="12px">
              <Text fontSize="14px" color="text_caption" fontWeight="500">
                Withdrawal to Wallet
              </Text>
              <VStack w="100%" gap="8px">
                {/* Base Asset */}
                {baseWithdrawAmount.gt(0) && (
                  <HStack w="100%" justify="space-between">
                    <HStack gap="8px">
                      <SingleCoinImage
                        imageUrl={pool?.baseAssets?.logo_url}
                        imgBoxStyle={{ w: '24px', h: '24px' }}
                        imageStyle={{ w: '24px', h: '24px' }}
                      />
                      <Text fontSize="12px" color="text_paragraph">
                        {pool?.baseAssets?.symbol || ''}
                      </Text>
                    </HStack>
                    <Text fontSize="12px" color="text_paragraph">
                      {formatNumber(baseWithdrawAmount.toString(), 4)} {pool?.baseAssets?.symbol || ''}
                    </Text>
                  </HStack>
                )}

                {/* Quote Asset */}
                {quoteWithdrawAmount.gt(0) && (
                  <HStack w="100%" justify="space-between">
                    <HStack gap="8px">
                      <SingleCoinImage
                        imageUrl={pool?.quoteAssets?.logo_url}
                        imgBoxStyle={{ w: '24px', h: '24px' }}
                        imageStyle={{ w: '24px', h: '24px' }}
                      />
                      <Text fontSize="12px" color="text_paragraph">
                        {pool?.quoteAssets?.symbol || ''}
                      </Text>
                    </HStack>
                    <Text fontSize="12px" color="text_paragraph">
                      {formatNumber(quoteWithdrawAmount.toString(), 4)} {pool?.quoteAssets?.symbol || ''}
                    </Text>
                  </HStack>
                )}

                {/* 如果没有可提取的资产 */}
                {baseWithdrawAmount.lte(0) && quoteWithdrawAmount.lte(0) && (
                  <Text fontSize="12px" color="text_caption">
                    No assets to withdraw
                  </Text>
                )}
              </VStack>
            </VStack>

            {/* Close Position Button */}
            <Button
              w="100%"
              h="44px"
              fontWeight="500"
              onClick={onConfirm}
              isLoading={isLoading}
              isDisabled={baseWithdrawAmount.lte(0) && quoteWithdrawAmount.lte(0) && d(debtData.totalDebtValue || '0').lte(0)}
              mt="16px"
            >
              Close Position
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
