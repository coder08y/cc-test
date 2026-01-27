import useBurnedLiquidity from '@/hooks/clmm/useBurnedLiquidity'
import useLiquidityStore from '@/store/clmm'
import { TooltipIcon } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HTextLabelBox, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, d, formatNumber, fromDecimalsAmountFix, textEllipses } from '@cetus/utils'
import { HStack, Stack, Text, VStack } from '@chakra-ui/react'

function BurnedLiquidity({ isShow }: { isShow: boolean }) {
  const { isApp } = useWindowWidth()
  const { apiPoolInfo } = useLiquidityStore()
  const { burnAmountA, burnAmountB, burnAmountAUSD, burnAmountBUSD, loading } = useBurnedLiquidity()

  return (d(burnAmountA).gt(0) || d(burnAmountB).gt(0)) && isShow ? (
    <Stack
      flexDir={{ base: 'column', lg: 'row' }}
      w="100%"
      bg={!isApp ? 'bg_secondary' : 'transparent'}
      borderRadius="16px"
      border="1px solid"
      borderColor={!isApp ? 'border' : 'transparent'}
      justify="space-between"
      align="flex-start"
      p={{ base: '32px 12px 12px', lg: '20px 16px 20px 20px' }}
      gap={isApp ? '10px' : '0.5rem'}
    >
      <HStack>
        <Text fontSize={isApp ? '14px' : '16px'} fontWeight={isApp ? '500' : '400'} color="text_caption">
          Burned Liquidity
        </Text>
        <TooltipIcon tooltipCon="The following liquidity has been permanently locked in the pool. Please note that LP locking could not eliminate all the risks of a token, especially when the token issuer holds a significant amount of the token." />
      </HStack>
      <Stack
        gap={isApp ? '12px' : '16px'}
        flexDir={{ base: apiPoolInfo?.isReverse ? 'column-reverse' : 'column', lg: apiPoolInfo?.isReverse ? 'row-reverse' : 'row' }}
        w={{ base: '100%', lg: '822px', xl: '862px' }}
      >
        <TokenBurnedLiquidity token={apiPoolInfo?.tokenA as Token} amount={burnAmountA} amountUSD={burnAmountAUSD} loading={loading} />
        <TokenBurnedLiquidity token={apiPoolInfo?.tokenB as Token} amount={burnAmountB} amountUSD={burnAmountBUSD} loading={loading} />
      </Stack>
    </Stack>
  ) : null
}

const TokenBurnedLiquidity = ({ token, amount, amountUSD, loading }: { token: Token; amount: string; amountUSD: string; loading: boolean }) => {
  const { isApp } = useWindowWidth()
  return (
    <VStack
      flex="1"
      align="flex-start"
      gap={isApp ? '8px' : '16px'}
      p={{ base: '12px 8px', lg: '16px 20px' }}
      borderRadius="8px"
      bg={!isApp ? 'background' : 'primary_opacity.10'}
      // border="1px solid"
      borderColor={!isApp ? 'border' : 'transparent'}
    >
      <HStack gap={isApp ? '4px' : '12px'}>
        <SingleCoinImage imageUrl={token?.logo_url} w={isApp ? '20px' : '28px'} h={isApp ? '20px' : '28px'} />
        <VStack align="flex-start" gap="4px">
          <Text color="text_caption" fontSize={isApp ? '12px' : '16px'} fontWeight={isApp ? '400' : '500'}>
            {textEllipses(token?.symbol, 10)}
          </Text>
          {token?.name && <Text fontSize={isApp ? '10px' : '12px'}>{token.name}</Text>}
        </VStack>
      </HStack>
      <HTextLabelBox
        label="Amount"
        labelStyle={{
          fontSize: isApp ? '12px' : '14px'
        }}
        value={addComma(fromDecimalsAmountFix(amount, token?.decimals)) as string}
        valueStyle={{
          fontSize: isApp ? '12px' : '14px'
        }}
        isLoading={loading}
        wrapStyle={{ h: '14px' }}
        skeletonStyle={{ valueW: '120px' }}
      />
      <HTextLabelBox
        label="Amount (USD)"
        labelStyle={{
          fontSize: isApp ? '12px' : '14px'
        }}
        value={d(amountUSD).gt('0') ? `$${formatNumber(fromDecimalsAmountFix(amountUSD, token?.decimals), 2)}` : '--'}
        valueStyle={{
          fontSize: isApp ? '12px' : '14px'
        }}
        isLoading={loading}
        wrapStyle={{ h: '14px' }}
        skeletonStyle={{ valueW: '120px' }}
      />
    </VStack>
  )
}

export default BurnedLiquidity
