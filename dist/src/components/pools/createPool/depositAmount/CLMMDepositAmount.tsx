import DepositRatio from '@/components/common/DepositRatio'
import TotalAmount from '@/components/common/TotalAmount'
import useCreateButtonStatus from '@/hooks/create-pool/useCreateButtonStatus'
import { TradeInputGroup } from '@cetus/design'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { d } from '@cetusprotocol/common-sdk'
import { Button, Heading, VStack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import type { CLMMDepositAmountProps } from './type'

function CLMMDepositAmount({
  currentStep,
  editStep,
  onCreate,
  baseToken,
  quoteToken,
  baseAmount,
  quoteAmount,
  onBaseAmountChange,
  onQuoteAmountChange,
  isReverse,
  percentMap
}: CLMMDepositAmountProps) {
  const { balanceInfo: baseBalanceInfo } = useGetTokenBalance(baseToken)
  const { balanceInfo: quoteBalanceInfo } = useGetTokenBalance(quoteToken)
  const { btnText, btnDisabled } = useCreateButtonStatus(baseAmount, quoteAmount, baseToken, quoteToken, baseBalanceInfo, quoteBalanceInfo)
  const { fetchTokenPrices, getTokenAmountValue } = useTokenPrice()

  // 刷新市场价格
  const refreshMarketPrice = () => {
    const list = []
    if (baseToken?.coin_type) {
      list.push(baseToken?.coin_type)
    }

    if (quoteToken?.coin_type) {
      list.push(quoteToken?.coin_type)
    }

    if (list.length > 0) {
      fetchTokenPrices(list)
    }
  }
  useEffect(() => {
    refreshMarketPrice()
  }, [baseToken?.coin_type, quoteToken?.coin_type])

  const baseAmountValue = getTokenAmountValue(baseToken?.coin_type, baseAmount)
  const quoteAmountValue = getTokenAmountValue(quoteToken?.coin_type, quoteAmount)

  const totalAmount = useMemo(() => {
    if (+baseAmountValue && +quoteAmountValue) {
      return d(baseAmountValue || '0')
        .plus(quoteAmountValue || '0')
        .toString()
    }
    return undefined
  }, [baseAmountValue, quoteAmountValue])

  return (
    <>
      {currentStep === 4 && editStep === 4 ? (
        <VStack w="100%" gap="12px" bg="bg_fifth" borderRadius="12px" p={{ base: '16px 8px', lg: '32px' }} align="flex-start">
          <Heading fontSize="16px" fontWeight="500">
            Deposit amounts
          </Heading>
          <TradeInputGroup
            wrapStyle={{ mt: '4px' }}
            from={{
              wrapStyle: { h: '108px' },
              balance: baseBalanceInfo?.balanceFormat || '',
              value: baseAmount,
              amountValue: baseAmountValue,
              loading: false,
              onChange: value => {
                onBaseAmountChange(value)
              },
              selectable: false,
              placeholder: '0.0',
              token: baseToken
            }}
            to={{
              wrapStyle: { h: '108px' },
              balance: quoteBalanceInfo?.balanceFormat || '',
              value: quoteAmount,
              amountValue: quoteAmountValue,
              loading: false,

              onChange: value => {
                onQuoteAmountChange(value)
              },
              selectable: false,
              placeholder: '0.0',
              token: quoteToken
            }}
          />
          <VStack gap="16px" w="100%" border="1px solid" borderColor="border" borderRadius="16px" p={{ base: '16px 8px', lg: '16px' }}>
            <TotalAmount totalAmount={totalAmount} />
            <DepositRatio tokenA={baseToken} tokenB={quoteToken} percentMap={percentMap!} isReverse={isReverse} type="image" />
          </VStack>
          <Button w="100%" onClick={onCreate} h="48px" fontSize="16px" borderRadius="12px" isDisabled={btnDisabled}>
            {btnText}
          </Button>
        </VStack>
      ) : null}
    </>
  )
}

export default CLMMDepositAmount
