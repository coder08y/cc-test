import useCreatePool, { CREATEFEE } from '@/hooks/deepbook/useCreatePool'
import useDeepBookStore from '@/store/deepbook'
import { Block, ErrorTips } from '@cetus/design'
import { useDebounceValue } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { CoinPairImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Button, HStack, Image, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import CreateInputBlock from './CreateInputBlock'
import { CreateSelectToken } from './CreateSelectToken'

export default function CreatePoolContent({ onClose }: { onClose: () => void }) {
  const {
    pricePlaceholder,
    lotPlaceholder,
    minPlaceholder,
    deepCoinBalance,
    createLoading,
    baseToken,
    quoteToken,
    priceSizeInput,
    lotSizeInput,
    minSizeInput,
    quoteWhiteTokenList,
    changePriceInput,
    changeLotSizeInput,
    changeMinSizeInput,
    changeBaseToken,
    changeQuoteToken,
    toCreate,
    btnInfo
  } = useCreatePool()

  const isCreatePoolSuccess = useDeepBookStore(state => state.isCreatePoolSuccess)
  const debounceLotSizeValue = useDebounceValue(lotSizeInput, 300)

  const userInputMin = useMemo(() => {
    return baseToken?.decimals ? d(1000).div(d(10).pow(baseToken?.decimals)) : ''
  }, [baseToken?.decimals])

  const isShowWarning1 = useMemo(() => {
    return minSizeInput && debounceLotSizeValue && d(minSizeInput).lt(debounceLotSizeValue)
  }, [minSizeInput, debounceLotSizeValue])

  const isShowWarning2 = useMemo(() => {
    return userInputMin && debounceLotSizeValue && d(debounceLotSizeValue).mul(d(10).pow(baseToken?.decimals)).lt(1000)
  }, [userInputMin, debounceLotSizeValue])

  const { currentAccount, onWalletModal } = useAccountStore()

  return (
    <>
      {!isCreatePoolSuccess ? (
        <VStack w="100%" gap={{ base: '16px', lg: '12px' }} mt="-8px" mb="8px" pb={{ base: '12px', lg: '0' }}>
          <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap="12px" justify="space-between">
            <CreateSelectToken
              title="Base token"
              value={baseToken}
              isWhiteSelect={false}
              whiteTokenList={undefined}
              onChange={(token: any) => changeBaseToken(token)}
            />
            <CreateSelectToken
              title="Quote token"
              value={quoteToken}
              isWhiteTokenSort={false}
              isWhiteSelect={true}
              isNeedSearchInput={false}
              whiteTokenList={quoteWhiteTokenList}
              onChange={(token: any) => changeQuoteToken(token)}
            />
          </Stack>
          <CreateInputBlock
            title="Price step size"
            placeholder={pricePlaceholder}
            symbol={quoteToken?.symbol}
            decimals={quoteToken?.decimals}
            value={priceSizeInput}
            tooltipCon={
              <VStack w="100%" align="flex-start" gap="0">
                <Text fontSize="12px" lineHeight="20px">
                  The minimum price increment allowed. For example, 0.01 means prices move by 0.01 each time. Smaller steps suit stable assets; larger
                  steps suit volatile ones.
                </Text>
                <Text fontSize="12px" lineHeight="20px">
                  The value must be greater than 0 and a power of 10 (e.g. 0.01, 0.1, 1, 10).
                </Text>
              </VStack>
            }
            onChange={(val: string) => changePriceInput(val)}
          />
          <CreateInputBlock
            title="Lot size"
            placeholder={lotPlaceholder}
            symbol={baseToken?.symbol}
            decimals={baseToken?.decimals}
            value={lotSizeInput}
            tooltipCon={
              baseToken?.symbol ? (
                <VStack w="100%" align="flex-start" gap="0">
                  <Text fontSize="12px" lineHeight="20px">
                    The minimum amount you can trade in this pool. For example, a lot size of 0.01 means trades must be in multiples of 0.01.
                  </Text>
                  <Text fontSize="12px" lineHeight="20px">
                    The value must be a power of 10 (e.g. 0.01, 0.1, 1, 10), with a minimum of {userInputMin?.toString()} {baseToken?.symbol}.
                  </Text>
                </VStack>
              ) : (
                <VStack w="100%" align="flex-start" gap="0">
                  <Text fontSize="12px" lineHeight="20px">
                    Set the base token first
                  </Text>
                </VStack>
              )
            }
            onChange={(val: string) => changeLotSizeInput(val)}
          />
          <CreateInputBlock
            title="Minimum order size"
            placeholder={minPlaceholder}
            symbol={baseToken?.symbol}
            decimals={baseToken?.decimals}
            value={minSizeInput}
            inputAllowed={lotSizeInput !== ''}
            tooltipCon={
              lotSizeInput ? (
                <VStack w="100%" align="flex-start" gap="0">
                  <Text fontSize="12px" lineHeight="20px">
                    The smallest order allowed in this pool. For example, a minimum size of 0.1 means any order below 0.1 will be rejected.
                  </Text>
                  <Text fontSize="12px" lineHeight="20px">
                    The value must be greater than the lot size and a power of 10 (e.g. 0.01, 0.1, 1, 10).
                  </Text>
                </VStack>
              ) : (
                <VStack w="100%" align="flex-start" gap="0">
                  <Text fontSize="12px" lineHeight="20px">
                    Enter the lot size first
                  </Text>
                </VStack>
              )
            }
            onChange={(val: string) => changeMinSizeInput(val)}
          />
          <HStack w="100%" justify="space-between" h="14px" mt="4px">
            <HStack gap="2px">
              <Text fontSize="12px">Deepbook fee</Text>
              {/* <TooltipIcon tooltipCon="Fee charged by DeepBook when creating a pool" iconSize="18px" /> */}
            </HStack>
            <Text fontSize="12px" color="text_caption">
              {CREATEFEE} DEEP
            </Text>
          </HStack>
          <HStack w="100%" justify="space-between" h="14px" mt="4px">
            <HStack gap="2px">
              <Text fontSize="12px">Protocol fee</Text>
            </HStack>
            <Text fontSize="12px" color="text_caption">
              0 DEEP
            </Text>
          </HStack>
          <HStack w="100%" justify="space-between" h="14px" mt="4px">
            <Text fontSize="12px">Your DEEP balance</Text>
            <Text fontSize="12px" color="text_caption">
              {deepCoinBalance?.balanceDisplay ?? '0'} DEEP
            </Text>
          </HStack>
          {!isShowWarning2 && isShowWarning1 && (
            <ErrorTips
              p="8px"
              mt="4px"
              borderRadius="8px"
              type="warning"
              tipsFontSize="12px"
              isShowIcon={false}
              tips="Min size must be greater than or equal to lot size"
            />
          )}

          {isShowWarning2 && (
            <ErrorTips
              p="8px"
              mt="4px"
              borderRadius="8px"
              type="warning"
              tipsFontSize="12px"
              isShowIcon={false}
              tips={`Lot size is too small. Minimum is ${userInputMin} ${baseToken?.symbol}`}
            />
          )}

          <Button
            isLoading={createLoading}
            isDisabled={btnInfo?.disabled || createLoading || !!isShowWarning1 || !!isShowWarning2}
            w="100%"
            mt="4px"
            fontSize="14px"
            fontWeight="500"
            borderRadius="12px"
            h="42px"
            onClick={!currentAccount?.address ? () => onWalletModal(true) : () => toCreate()}
          >
            {btnInfo?.text}
          </Button>
        </VStack>
      ) : (
        <VStack gap="8px" pt="28px" w="100%" pb={{ base: '12px', lg: '8px' }}>
          {/* 描述 */}
          <VStack gap="8px">
            <Image src="/images/img_transactionsuccess@2x.png" w="200px" h="200px" alt="icon" />

            <VStack mt="-155px" gap="10px">
              <HStack>
                <CoinPairImage
                  coinACoinType={baseToken?.coin_type}
                  coinBCoinType={quoteToken?.coin_type}
                  coinAIconUrl={baseToken?.logo_url}
                  coinBIconUrl={quoteToken?.logo_url}
                  imageStyle={{
                    w: '24px',
                    h: '24px'
                  }}
                  imgBoxStyle={{
                    w: '24px',
                    h: '24px'
                  }}
                />

                <Text fontSize="14px" color="text_caption">
                  {`${textEllipses(baseToken?.symbol, 8)} - ${textEllipses(quoteToken?.symbol)}`}
                </Text>
              </HStack>
            </VStack>

            <Block mt="80px" borderRadius="16px" padding="16px">
              <Text color="primary_gray" fontSize="12px" lineHeight="20px">
                The deepbook trading pool has been created successfully. It may take up to 3 minutes for the new pool to appear on the interface. You
                can find it by searching the trading pair
              </Text>
            </Block>

            <Button
              mt="16px"
              fontSize="14px"
              w="100%"
              onClick={() => {
                onClose()
              }}
            >
              OK
            </Button>
          </VStack>
        </VStack>
      )}
    </>
  )
}
