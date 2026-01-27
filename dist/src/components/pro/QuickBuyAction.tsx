import useQuickBuy from '@/hooks/pro/useQuickBuy'
import { ProCoinItem } from '@/types/pro'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, cancelBubble, d } from '@cetus/utils'
import { HStack, Spinner, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

const QuickBuyAction = ({
  quickCoin,
  quickAmount,
  info,
  currentAccount,
  onWalletModal
}: {
  quickCoin: Token & { limitBuy: number }
  quickAmount: string
  info: ProCoinItem
  currentAccount: any
  onWalletModal: any
}) => {
  const [isHover, setIsHover] = useState(false)
  const { quickBuy, quickLoading, quickLoadingCoin } = useQuickBuy()
  const { isApp } = useWindowWidth()

  const isDisabled = useMemo(() => {
    return (
      quickLoadingCoin === info?.coin_type ||
      quickCoin?.coin_type === info?.coin_type ||
      (quickAmount && quickCoin?.limitBuy && d(quickAmount).gt(quickCoin?.limitBuy))
    )
  }, [quickLoadingCoin, quickCoin?.coin_type, info?.coin_type, quickAmount])

  const handleQuickBuy = (e: any) => {
    cancelBubble(e)
    if (isDisabled) return
    if (!currentAccount) {
      onWalletModal(true)
      return
    }
    const targetCoin = {
      coin_type: info?.coin_type,
      decimals: info?.decimals,
      name: info?.name,
      symbol: info?.symbol
    }
    quickBuy({
      fromCoin: quickCoin,
      targetCoin,
      amount: quickAmount
    })
  }

  return (
    <HStack
      height="24px"
      borderRadius="8px"
      bg="#273946"
      gap="0px"
      p={{ base: '0', lg: '0px 8px' }}
      minW={{ base: '28px', lg: '48px' }}
      justify="center"
      cursor={isDisabled ? 'not-allowed' : 'cursor'}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={handleQuickBuy}
      zIndex={10}
    >
      {quickLoading && quickLoadingCoin === info?.coin_type && <Spinner w="12px" h="12px" color="text_paragraph" />}
      {!(quickLoading && quickLoadingCoin === info?.coin_type) && (
        <Icon
          xlinkHref="#icon-icon_quick"
          w="16px"
          h="16px"
          svgFill={isDisabled ? 'text_paragraph' : 'primary'}
          svgHover={isDisabled ? 'text_paragraph' : 'primary'}
          cursor={isDisabled ? 'not-allowed' : 'cursor'}
        />
      )}
      {!isDisabled && isHover && !isApp && (
        <Text color="primary" fontSize="12px" mr="6px">
          {addComma(quickAmount)}
        </Text>
      )}
      {!isDisabled && isHover && !isApp && <SingleCoinImage imageUrl={quickCoin?.logo_url} coinType={quickCoin?.coin_type} w="16px" h="16px" />}
    </HStack>
  )
}
export default QuickBuyAction
