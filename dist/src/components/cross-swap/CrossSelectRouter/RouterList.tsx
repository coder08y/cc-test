import { PriceImpactTips } from '@/components/swap/PriceImpact'
import { useGetQuoteShowDuration, useGetQuoteTag, useGetStepTypeLabel } from '@/hooks/cross-swap/useCrossHelper'
import { useCrossPriceImpact } from '@/hooks/cross-swap/useCrossPriceImpact'
import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import { CetusTooltip, CurrentPrice } from '@cetus/design'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { formatCurrency, formatNumber } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Chain, CrossSwapQuote, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { Box, Center, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react'
import { StepToolDetails } from '@lifi/sdk'
import { useEffect, useState } from 'react'
import { chainPlaceholderImg } from '../ChainCoinSelect'
import RouterStatus from '../common/RouterStatus'

export type RouterHeaderProps = {
  toChain: Chain
  toToken: CrossSwapToken
  toAmount: string
  toAmountUsd?: string
  toolDetails?: StepToolDetails
  isOpen: boolean
  handleOpen: (isOpen: boolean) => void
}

function RouterHeader({ toChain, toToken, toAmount, toAmountUsd, toolDetails, isOpen, handleOpen }: RouterHeaderProps) {
  return (
    <HStack w="100%" justifyContent="space-between" alignItems="center" cursor="pointer" onClick={() => handleOpen(!isOpen)}>
      <HStack>
        <SingleCoinImage
          w="32px"
          h="32px"
          imageUrl={toToken.logo_url}
          borderRadius="50%"
          tag_url={toChain.logo_url}
          placeholderTagImg={chainPlaceholderImg}
        />

        <VStack alignItems="flex-start">
          <HStack gap="4px">
            <Text color="text_caption" fontSize="16px">
              {formatNumber(fromDecimalsAmount(toAmount, toToken.decimals))}
            </Text>
            <Text color="text_paragraph" fontSize="16px">
              {toToken.symbol}
            </Text>
          </HStack>
          <HStack gap="4px">
            <Text color="text_paragraph" fontSize="12px">
              {formatCurrency(toAmountUsd, 2)}
            </Text>
            <SingleCoinImage ml="4px" borderRadius="50%" w="12px" h="12px" imageUrl={toolDetails?.logoURI || 'url("/images/chainflip@2x.png")'} />
            <Text color="text_paragraph" fontSize="12px">
              {toolDetails?.name}
            </Text>
          </HStack>
        </VStack>
      </HStack>

      <Icon mt={isOpen ? '0px' : '-4px'} xlinkHref={isOpen ? '#icon-icon_ascending' : '#icon-icon_descending'} boxW="18px" boxH="12px" svgH="16px" />
    </HStack>
  )
}

function RouterSteps({ currentQuote }: { currentQuote: CrossSwapQuote }) {
  const { quote, from_chain, to_chain } = currentQuote

  if (!quote.lifi_quote) {
    return <></>
  }

  const { steps } = quote.lifi_quote

  return (
    <VStack alignItems="flex-start">
      {/* Chainflip */}
      {steps.map((step, index) => {
        const { toolDetails } = step
        return (
          <VStack gap="12px" key={step.id} mt="8px" alignItems="flex-start">
            <HStack>
              {/* <Image src="/images/chainflip@2x.png" w="32px" h="32px" /> */}
              <SingleCoinImage
                borderRadius="50%"
                w="32px"
                h="32px"
                imageUrl={toolDetails.logoURI || "url('/images/chainflip@2x.png')"}
                tag_url="/images/lifi_logo.png"
              />
              <Text color="text_caption">{toolDetails.name} via LI.FI</Text>
            </HStack>
            <VStack gap="14px" alignItems="flex-start" pl="6px">
              {step.includedSteps.map((includedStep, index) => {
                const { toolDetails, estimate, action } = includedStep
                const { label } = useGetStepTypeLabel(includedStep, from_chain, to_chain)
                return (
                  <RouterStep
                    key={includedStep.id}
                    showLimit={index !== step.includedSteps.length - 1}
                    logo={toolDetails.logoURI || 'url("/images/chainflip@2x.png")'}
                    title={label}
                    desc={`${formatNumber(fromDecimalsAmount(estimate.fromAmount, action.fromToken.decimals), action.fromToken.decimals)} ${action.fromToken.symbol} → 
                    ${formatNumber(fromDecimalsAmount(estimate.toAmount, action.toToken.decimals), action.toToken.decimals)} ${action.toToken.symbol}`}
                  />
                )
              })}
            </VStack>
          </VStack>
        )
      })}

      {/* Relay */}
      {/* <VStack mt="8px" alignItems="flex-start">
        <HStack>
          <Box
            w="32px"
            h="32px"
            borderRadius="50%"
            backgroundImage="url('/images/base_return.png')"
            backgroundSize="cover"
            backgroundRepeat="no-repeat"
            backgroundPosition="center"
            position="relative"
          >
            <Image w="14px" h="14px" src="/images/lifi_logo.png" position="absolute" bottom="0" right="0" />
          </Box>
          <Text color="text_caption">Relay via LI.FI</Text>
        </HStack>
        <VStack gap="14px" alignItems="flex-start" pl="6px">
          <RouterStep logo="/images/mayan_logo.png" title="Swap on Solana via Relay" desc="7.6 SOL → 0.51524 ETH" />
        </VStack>
      </VStack> */}

      {/* 提示 */}
      <HStack mt="8px" alignItems="flex-start">
        <Image src="/images/chain/signature.svg" w="32px" h="32px" borderRadius="50%" />
        <VStack alignItems="flex-start" p="8px 0 0">
          <Text fontWeight="400" color="text_caption">
            {steps.length}
          </Text>
          <Text fontSize="12px" lineHeight="15px" textAlign="start">
            Each exchange step can contain 1–2 transactions that require a signature
          </Text>
        </VStack>
      </HStack>
    </VStack>
  )
}

function RouterStep({ logo, title, desc, showLimit }: { logo: string; title: string; desc: string; showLimit: boolean }) {
  return (
    <HStack gap="14px" alignItems="flex-start">
      <Box
        position="relative"
        sx={{
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: '26px',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: showLimit ? 'border' : 'transparent',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }
        }}
      >
        <SingleCoinImage borderRadius="50%" imageUrl={logo} w="20px" h="20px" />
      </Box>

      <VStack alignItems="flex-start" pt="4px">
        <Text textAlign="start" fontSize="12px">
          {title}
        </Text>
        <Text textAlign="start" fontSize="12px">
          {desc}
        </Text>
      </VStack>
    </HStack>
  )
}

function RouterFooter({ currentQuote }: { currentQuote: CrossSwapQuote }) {
  const { from_token, to_token, gas_cost_usd, amount_out, amount_in, amount_in_formatted, amount_out_formatted, execution_duration } = currentQuote
  const { quoteShowDuration } = useGetQuoteShowDuration(execution_duration)
  const { priceImpactTextInfo, showIncalculable, sources, marketPrice } = useCrossPriceImpact(
    currentQuote.platform,
    from_token,
    to_token,
    amount_in_formatted,
    amount_out_formatted
  )

  return (
    <VStack w="100%">
      <HStack w="100%" justifyContent="space-between">
        <CetusTooltip tooltip={<Text>Gas Fee</Text>}>
          <HStack alignItems="center" gap="2px">
            <Icon xlinkHref="#icon-icon_gas" boxW="16px" boxH="16px" />
            <Text fontSize="12px">{formatCurrency(gas_cost_usd, 2)}</Text>
          </HStack>
        </CetusTooltip>

        <HStack justifyContent="flex-end">
          <CurrentPrice
            noIcon={true}
            fontSize="12px"
            fromToken={from_token as any}
            toToken={to_token as any}
            fromValue={amount_in_formatted}
            toValue={amount_out_formatted}
            color="text_caption"
          />
        </HStack>
      </HStack>

      <HStack w="100%" justifyContent="space-between">
        <CetusTooltip tooltip={<Text>Est. Completion</Text>}>
          <HStack alignItems="center" gap="2px">
            <Icon xlinkHref="#icon-icon_time" boxW="16px" boxH="16px" />

            <Text fontSize="12px">{quoteShowDuration}</Text>
          </HStack>
        </CetusTooltip>

        <HStack justify="flex-end" h="20px" gap="2px">
          <Text
            maxW={`unset`}
            flex="1"
            mr="2px"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            color={priceImpactTextInfo?.textColor}
            fontWeight="500"
            fontSize={'12px'}
          >
            {priceImpactTextInfo?.priceImpactText && !showIncalculable ? priceImpactTextInfo?.priceImpactText : 'Incalculable'}
          </Text>
          <CetusTooltip
            tooltip={
              <PriceImpactTips
                marketPrice={marketPrice}
                sources={sources}
                fromToken={from_token as any}
                toToken={to_token as any}
                showIncalculable={showIncalculable}
              />
            }
          >
            <Center>
              <Icon xlinkHref="#icon-icon_tips" svgW="20px" svgH="20px" />
            </Center>
          </CetusTooltip>
        </HStack>
      </HStack>
    </VStack>
  )
}

function RouterItem({
  isActive,
  currentQuote,
  isOpenSelectRouter
}: {
  isActive: boolean
  currentQuote: CrossSwapQuote
  isOpenSelectRouter: boolean
}) {
  const [isOpen, setIsOpen] = useState(isActive)
  const { tag } = useGetQuoteTag(currentQuote.quote.lifi_quote?.tags || [])
  const { to_chain, to_token, amount_out, amount_out_usd } = currentQuote

  useEffect(() => {
    if (isOpenSelectRouter) {
      setIsOpen(isActive)
    }
  }, [isOpenSelectRouter])

  return (
    <VStack
      width="100%"
      bg={isActive ? 'primary_opacity.10' : 'bg_primary'}
      position="relative"
      alignItems="flex-start"
      padding="16px"
      borderRadius="8px"
      border="1px solid"
      borderColor={isActive ? 'primary' : 'border'}
      gap="14px"
    >
      <RouterStatus
        tag={tag}
        wrapStyle={{
          w: 'unset',
          borderRadius: '8px 0px 8px 0px',
          bg: 'primary_opacity.15',
          padding: '4px 8px',
          m: '-16px 0 0 -16px'
        }}
      />

      <RouterHeader
        toChain={to_chain}
        toToken={to_token}
        toAmount={amount_out}
        toAmountUsd={amount_out_usd}
        isOpen={isOpen}
        handleOpen={setIsOpen}
        toolDetails={currentQuote.quote.lifi_quote?.steps[0].toolDetails}
      />
      {isOpen && <RouterSteps currentQuote={currentQuote} />}
      <Box w="100%" borderBottom="1px dashed" borderColor="border" />
      <RouterFooter currentQuote={currentQuote} />
    </VStack>
  )
}

export default function RouterList({ isOpenSelectRouter }: { isOpenSelectRouter: boolean }) {
  const { routers, quote, setQuote, findRouterLoading } = useCrossSwapStore()

  if (!quote) {
    return <></>
  }
  return (
    <VStack w="100%" mt="12px">
      {findRouterLoading ? (
        <RouterListSkeleton />
      ) : (
        routers?.quotes?.map((item, index) => (
          <Box w="100%" key={item.quote?.lifi_quote?.id || index} cursor="pointer" onClick={() => setQuote(item!)}>
            <RouterItem
              isOpenSelectRouter={isOpenSelectRouter}
              isActive={item.quote?.lifi_quote?.id === quote!.quote?.lifi_quote?.id}
              currentQuote={item!}
            />
          </Box>
        ))
      )}
    </VStack>
  )
}

export function RouterListSkeleton() {
  return (
    <VStack w="100%" mt="12px" gap="16px">
      {[1, 2, 3].map((_, idx) => (
        <VStack
          key={idx}
          width="100%"
          bg="bg_primary"
          position="relative"
          alignItems="flex-start"
          padding="16px"
          borderRadius="8px"
          border="1px solid"
          borderColor="border"
          gap="12px"
        >
          {/* 顶部标签骨架 */}
          <Skeleton height="20px" width="60px" borderRadius="8px 0px 8px 0px" mb="4px" />

          {/* Header骨架 */}
          <HStack w="100%" justifyContent="space-between">
            <HStack>
              <Skeleton boxSize="32px" borderRadius="50%" />
              <Skeleton height="20px" width="120px" ml="8px" />
            </HStack>
            <VStack alignItems="flex-end">
              <Skeleton height="20px" width="60px" />
              <Skeleton height="16px" width="50px" />
            </VStack>
          </HStack>

          {/* Footer骨架 */}
          <VStack w="100%" gap="8px">
            <HStack w="100%" justifyContent="space-between">
              <HStack>
                <Skeleton boxSize="16px" borderRadius="50%" />
                <Skeleton height="16px" width="40px" />
              </HStack>
              <Skeleton height="16px" width="120px" />
            </HStack>
            <HStack w="100%" justifyContent="space-between">
              <HStack>
                <Skeleton boxSize="16px" borderRadius="50%" />
                <Skeleton height="16px" width="40px" />
              </HStack>
              <Skeleton height="16px" width="16px" borderRadius="50%" />
            </HStack>
          </VStack>
        </VStack>
      ))}
    </VStack>
  )
}
