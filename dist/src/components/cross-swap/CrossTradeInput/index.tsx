import { CrossTradeInputProps } from '@/types/cross_swap'
import { Icon, NumericFormatInput } from '@cetus/ui-kit'
import { formatCurrencyWithKMB, formatNumberWithDown } from '@cetus/utils'
import { convertScientificToDecimal, d } from '@cetusprotocol/common-sdk'
import { Box, Button, HStack, InputGroup, InputRightAddon, Skeleton, Text, VStack } from '@chakra-ui/react'
import { Suspense, useRef, useState } from 'react'
import ChainCoinSelect from '../ChainCoinSelect'
import WalletSelect from '../WalletSelect'

export default function CrossTradeInput(props: CrossTradeInputProps) {
  const fromRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState<boolean>(false)
  const {
    inputAllowed = true,
    wrapStyle,
    loading,
    value,
    onChange,
    balance,
    currentCoin,
    placeholder,
    onFocusChange,
    amountValue,
    calculateAvailableLoading,
    balanceLabel,
    half = true,
    max = true,
    title,
    currentChain,
    platform,
    walletAddress,
    openSelectChainAndTokenModal,
    onConnectWallet
  } = props
  const handleHalfBalance = () => {
    const _half = d(balance || 0).div(2)
    if (value && _half.eq(value)) {
      return
    }
    onChange?.(formatNumberWithDown(_half.toString(), currentCoin?.decimals, true, true).toString(), false, true)
  }

  const handleMaxBalance = () => {
    const _max = d(balance || 0)
    let useAmount = _max

    if (value && d(useAmount).eq(value)) {
      return
    }
    if (d(useAmount).gte(0)) {
      onChange?.(useAmount.toString() || '0', true, false)
    }
  }
  return (
    <Box
      ref={fromRef}
      w="100%"
      pos="relative"
      p={{ base: '10px 16px 16px 16px', lg: '10px 16px 16px 16px' }}
      borderRadius="16px"
      border="1px solid"
      backgroundColor={inputAllowed ? 'bg_secondary' : 'card_bg'}
      borderColor={focused ? 'token_active_border' : wrapStyle?.borderColor ? wrapStyle.borderColor : 'border'}
      boxShadow={focused ? '0px 0px 6px 0px #0067AD' : ''}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...wrapStyle}
    >
      <HStack width="100%" justifyContent="space-between">
        <HStack alignItems="center" whiteSpace="nowrap">
          {title && (
            <Text color="text_paragraph" fontSize="13px" fontWeight="500" textAlign="left">
              {title}
            </Text>
          )}
        </HStack>
        <WalletSelect walletAddress={walletAddress} onConnectWallet={onConnectWallet} />
      </HStack>
      <VStack gap="10px" mt="8px">
        <InputGroup h="38px" fontFamily="Inter" justifyContent="space-between" gap="12px">
          <Skeleton isLoaded={!loading} height="38px" width="calc(100% - 8px)" borderRadius="8px">
            <NumericFormatInput
              value={convertScientificToDecimal(value, 9)}
              onChange={(value: string) => {
                onChange?.(value, d(value || '0').eq(balance || '0'))
              }}
              decimals={currentCoin?.decimals}
              placeholder={placeholder}
              inputAllowed={inputAllowed}
              onFocus={() => onFocusChange?.(true)}
              onBlur={() => onFocusChange?.(false)}
              style={{
                width: 'calc(100% - 8px)',
                background: 'none',
                whiteSpace: 'nowrap',
                opacity: 1,
                outline: 'none',
                color: 'var(--chakra-colors-text_caption)',
                fontSize: '28px',
                height: '38px',
                lineHeight: '34px',
                touchAction: 'manipulation',
                transition: 'all 0.3s',
                fontWeight: '500'
              }}
            />
          </Skeleton>

          <InputRightAddon>
            <Suspense fallback={<Skeleton h="20px" w="100px" borderRadius="8px" />}>
              <ChainCoinSelect
                openSelectChainAndTokenModal={() => openSelectChainAndTokenModal()}
                currentCoinKey={currentCoin?.address}
                currentChain={currentChain}
                value={currentCoin}
                platform={platform}
              />
            </Suspense>
          </InputRightAddon>
        </InputGroup>

        <HStack mt="4px" justify="space-between" w="100%">
          <Text width="50%" flex="0" fontWeight="500">
            {amountValue && !!+amountValue ? `${formatCurrencyWithKMB(amountValue, 2)}` : null}
          </Text>

          <HStack justify="flex-end" gap="8px">
            <Skeleton isLoaded={!calculateAvailableLoading}>
              <HStack gap="4px">
                {balanceLabel ? <Text>{balanceLabel}</Text> : <Icon xlinkHref="#icon-icon_wallet" svgHover="text_paragraph" cursor="default" />}
                <Text>{!balance || balance === '0' ? '0.0' : formatNumberWithDown(balance)}</Text>
              </HStack>
            </Skeleton>

            {half && (
              <Button
                onClick={handleHalfBalance}
                fontSize="12px"
                fontWeight="500"
                lineHeight="20px"
                color="text_paragraph"
                w="42px"
                h="20px"
                bg="button_outline_bg"
                borderRadius="4px"
                variant="outline"
              >
                HALF
              </Button>
            )}

            {max && (
              <Button
                onClick={handleMaxBalance}
                fontSize="12px"
                fontWeight="500"
                lineHeight="20px"
                color="text_paragraph"
                w="42px"
                h="20px"
                bg="button_outline_bg"
                borderRadius="4px"
                variant="outline"
              >
                MAX
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}
