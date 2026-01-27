import useLimitAddAction from '@/hooks/limit/useLimitAddAction'
import useLimitActionStore from '@/store/limit/useLimitAction'
import useProStore from '@/store/pro'
import { TradeInputGroup } from '@cetus/design'
import WarningTokenTipsModal from '@cetus/design/src/components/common/WarningTokenTipModal'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChartOrderIcon } from '../common/ChartOrderIcon'
import { TradeTab } from '../common/TradeTab'
import { TradeTabs } from '../swap'
import ConfirmModal from './ConfirmModal'
import { LimitExpires } from './LimitExpires'
import { LimitPrice } from './LimitPrice'

export function LimitAction() {
  const { expiresIn } = useLimitActionStore()
  const {
    buttonTextStatus,
    payBalanceInfo,
    targetBalanceInfo,
    payAmountValue,
    targetAmountValue,
    payAmount,
    targetAmount,
    payCoin,
    targetCoin,
    marketPrice,
    handleAmountChange,
    handleMarketPriceClick,
    handleSelectToken,
    inputPrice,
    setInputPrice,
    priceImpact,
    quoteToken,
    handleSubmitOrder,
    submitOrderLoading,
    onReverseClick,
    priceImpactInfoLoading,
    priceImpactInfo
  } = useLimitAddAction()
  const confirmData = useMemo(() => {
    return { payAmount, targetAmount, payCoin, targetCoin, inputPrice, expiresIn, quoteToken }
  }, [payAmount, targetAmount, payCoin, targetCoin, inputPrice, expiresIn, quoteToken])

  const { onWalletModal } = useAccountStore()
  const [tradeIcon, setTradeIcon] = useState<string>('#icon-a-icon_trade')
  const toggleTradeIcon = (hovered: boolean) => setTradeIcon(hovered ? '#icon-icon_swap1' : '#icon-a-icon_trade')
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false)
  const navigate = useNavigate()

  // add debounce to avoid price impact info flashing
  const [debouncedPriceImpactInfo, setDebouncedPriceImpactInfo] = useState(priceImpactInfo)

  const warningTokenList = useMemo(() => {
    const list: Token[] = []
    if (payCoin) {
      list.push(payCoin)
    }

    if (targetCoin) {
      list.push(targetCoin)
    }

    return list
  }, [payCoin, targetCoin])
  const { showTokenInfo, isProMode, currentProTab, currentProTabUpdateWith } = useProStore()
  useEffect(() => {
    if (currentProTabUpdateWith === 'toggleBtn' || !currentProTabUpdateWith) return
    console.log('🚀 ~ useEffect LimitAction0619 ~ showTokenInfo?.coin_type:', showTokenInfo?.coin_type)
    console.log('🚀 ~ useEffect LimitAction0619 ~ targetCoin?.coin_type:', targetCoin?.coin_type)
    console.log('🚀 ~ useEffect LimitAction0619 ~ payCoin?.coin_type:', payCoin?.coin_type)
    console.log('🚀 ~ useEffect LimitAction0619 ~ currentProTab:', currentProTab)
    if (showTokenInfo?.coin_type && targetCoin?.coin_type && payCoin?.coin_type) {
      if (
        (currentProTab == 'Buy' && fixCoinType(showTokenInfo?.coin_type) !== fixCoinType(targetCoin?.coin_type)) ||
        (currentProTab == 'Sell' && fixCoinType(showTokenInfo?.coin_type) !== fixCoinType(payCoin?.coin_type))
      ) {
        onReverseClick()
      }
    } else if (showTokenInfo?.coin_type && targetCoin?.coin_type && !payCoin?.coin_type) {
      onReverseClick()
    } else if (showTokenInfo?.coin_type && !targetCoin?.coin_type && payCoin?.coin_type) {
      onReverseClick()
    }
  }, [currentProTab])

  //debounce to handle price impact info, avoid flashing when switching frequently
  useEffect(() => {
    // if warning disappears, hide immediately
    if (!priceImpactInfo?.text) {
      setDebouncedPriceImpactInfo(priceImpactInfo)
      return
    }

    // if warning appears, show after 300ms delay
    const timer = setTimeout(() => {
      setDebouncedPriceImpactInfo(priceImpactInfo)
    }, 300)

    return () => clearTimeout(timer)
  }, [priceImpactInfo])

  return (
    <VStack w={{ base: '100%', lg: isProMode ? '380px' : '470px' }} gap="8px" mb="8px">
      <HStack w="100%" justifyContent="space-between" mb="8px">
        <TradeTab currTradeTab={TradeTabs.Limit} />
        {!isProMode && <ChartOrderIcon />}
      </HStack>
      <TradeInputGroup
        onClick={() => onReverseClick(true)}
        from={{
          title: 'You Pay',
          balance: payBalanceInfo?.balanceFormat || '',
          value: payAmount,
          amountValue: payAmountValue,
          onChange: value => {
            handleAmountChange(value, true)
          },
          selectable: true,
          placeholder: '0.0',
          token: payCoin,
          onTokenChange: (token: any) => {
            handleSelectToken(token, true)
          }
        }}
        to={{
          title: 'You Receive',
          balance: targetBalanceInfo?.balanceFormat || '',
          value: targetAmount,
          amountValue: targetAmountValue,
          onTokenChange: (token: any) => {
            handleSelectToken(token, false)
          },
          onChange: value => {
            handleAmountChange(value, false)
          },
          selectable: true,
          placeholder: '0.0',
          token: targetCoin,
          half: false,
          max: false
        }}
        iconParams={{
          xlinkHref: tradeIcon,
          svgFill: 'text_caption',
          transform: tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)',
          fontSize: tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px',
          onMouseEnter: () => toggleTradeIcon(true),
          onMouseLeave: () => toggleTradeIcon(false)
        }}
      />

      <HStack
        w="100%"
        justifyContent="space-between"
        alignItems="stretch"
        gap="8px"
        flexDirection={{ base: 'column', lg: 'row' }}
        sx={{
          '>div': {
            w: {
              base: '100% !important'
            }
          }
        }}
      >
        <LimitPrice
          marketPrice={marketPrice}
          priceImpactInfoLoading={priceImpactInfoLoading}
          priceImpactInfo={priceImpactInfo}
          priceImpact={priceImpact}
          inputPrice={inputPrice}
          setInputPrice={setInputPrice}
          handleMarketPriceClick={handleMarketPriceClick}
        />
        <LimitExpires />
      </HStack>
      {debouncedPriceImpactInfo?.text && marketPrice && Number(priceImpact) !== 0 && inputPrice && (
        <Text color={debouncedPriceImpactInfo?.color} lineHeight="20px" bg={debouncedPriceImpactInfo?.bg} p="12px" borderRadius="8px">
          {debouncedPriceImpactInfo?.text}&nbsp;
          <Text
            color={debouncedPriceImpactInfo?.color}
            textDecoration="underline"
            as="span"
            cursor="pointer"
            onClick={() => navigate(`/swap/${payCoin?.coin_type}/${targetCoin?.coin_type}`)}
          >
            Cetus Swap
          </Text>
          &nbsp;instead.
        </Text>
      )}
      <Button
        isDisabled={buttonTextStatus?.disabled || submitOrderLoading}
        isLoading={submitOrderLoading}
        mt="-1px"
        w="100%"
        borderRadius="12px"
        h="52px"
        fontSize="18px"
        fontWeight="500"
        variant={isProMode ? `solid-${currentProTab?.toLocaleLowerCase()}` : 'solid'}
        // variant="solid"
        onClick={buttonTextStatus?.text == 'Connect Wallet' ? () => onWalletModal(true) : () => setIsOpenConfirmModal(true)}
      >
        {isProMode && buttonTextStatus?.text == 'Place Limit Order' ? currentProTab : buttonTextStatus?.text}
      </Button>
      {isOpenConfirmModal && (
        <ConfirmModal
          confirmData={confirmData}
          isOpen={isOpenConfirmModal}
          onClose={() => setIsOpenConfirmModal(false)}
          handleSubmitOrder={handleSubmitOrder}
          submitOrderLoading={submitOrderLoading}
        />
      )}
      {(payCoin || targetCoin) && (
        <WarningTokenTipsModal
          addToken
          tokensInfo={warningTokenList}
          waringModalCancel={(tokenInfo: Token[]) => {
            tokenInfo.forEach(coin => {
              const hasFind = coin.coin_type === payCoin?.coin_type || coin.coin_type === targetCoin?.coin_type
              if (hasFind) {
                handleSelectToken(undefined, coin.coin_type === payCoin?.coin_type)
              }
            })
          }}
        />
      )}
    </VStack>
  )
}
