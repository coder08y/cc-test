import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, formatCurrency, isAvailableObject, textEllipses } from '@cetus/utils'
import { HStack, Progress, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { TokenAmountAndAfter } from '../../clmm/details/DetailStatsInfo'

export default function DlmmPositionLiquidity() {
  const { isApp } = useWindowWidth()
  const { getTokenAmountValue } = useTokenPrice()
  const { dlmmCurrentPosBaseInfo, dlmmPosLiquidityData } = useDlmmPositionStore()
  const currentDlmmPosLiquidity = useMemo(() => {
    return dlmmPosLiquidityData?.[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosLiquidityData])

  const { tokenAmountAfterA, tokenAmountAfterB } = useDlmmPosDetailStore()

  const isLoaded = useMemo(() => {
    return isAvailableObject(dlmmCurrentPosBaseInfo) && isAvailableObject(currentDlmmPosLiquidity)
  }, [dlmmCurrentPosBaseInfo, currentDlmmPosLiquidity])

  const amountValue = useMemo(() => {
    if (
      currentDlmmPosLiquidity &&
      currentDlmmPosLiquidity?.displayCoinAmountA !== '--' &&
      currentDlmmPosLiquidity?.displayCoinAmountB !== '--' &&
      dlmmCurrentPosBaseInfo
    ) {
      console.log('🚀 ~ file: DlmmPositionLiquidity.tsx:24 ~ amountValue ~ currentDlmmPosLiquidity:', currentDlmmPosLiquidity)
      return formatCurrency(
        d(getTokenAmountValue(dlmmCurrentPosBaseInfo?.displayTokenA?.coin_type, currentDlmmPosLiquidity?.displayCoinAmountA))
          .plus(getTokenAmountValue(dlmmCurrentPosBaseInfo?.displayTokenB?.coin_type, currentDlmmPosLiquidity?.displayCoinAmountB))
          .toString(),
        2
      )
    }
    return '$--'
  }, [currentDlmmPosLiquidity?.displayCoinAmountA, currentDlmmPosLiquidity?.displayCoinAmountB])

  return (
    <VStack gap={{ base: '8px', lg: '20px' }} bg="bg_secondary" w="100%" p={{ base: '16px 8px 8px', lg: '20px 20px 0' }} borderRadius="16px">
      <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" justify={{ base: 'center', lg: 'space-between' }} gap={{ base: '24px', lg: '0' }}>
        <Stack
          flexDir={{ base: 'row', lg: 'column' }}
          align={{ base: 'center', lg: 'flex-start' }}
          justify={{ base: 'space-between', lg: 'center' }}
          gap="4px"
        >
          <Text color="primary_gray">Liquidity</Text>

          <Skeleton isLoaded={isLoaded}>
            <Text color="text_caption" fontSize="16px" textDecorationColor="primary_gray" lineHeight="16px">
              {amountValue}
            </Text>
          </Skeleton>
        </Stack>
        <HStack gap="4px" pb="12px" justifyContent="center">
          <Skeleton isLoaded={isLoaded}>
            <HStack gap="4px">
              <Text color="text_caption">{textEllipses(dlmmCurrentPosBaseInfo?.displayTokenA?.symbol)}</Text>
              <Text color="primary">{currentDlmmPosLiquidity?.displayPercentA}%</Text>
            </HStack>
          </Skeleton>
          <Progress
            w={{ base: '100px', lg: '200px' }}
            h="4px"
            value={currentDlmmPosLiquidity?.displayPercentA}
            bg="quote_green"
            sx={{
              'div[role="progressbar"]': {
                bg: 'primary'
              }
            }}
          />
          <Skeleton isLoaded={isLoaded}>
            <HStack gap="4px">
              <Text color="primary_green">{currentDlmmPosLiquidity?.displayPercentB}%</Text>
              <Text color="text_caption">{textEllipses(dlmmCurrentPosBaseInfo?.displayTokenB?.symbol)}</Text>
            </HStack>
          </Skeleton>
        </HStack>
      </Stack>
      <HStack
        gap={{ base: '8px', lg: '0px' }}
        p={{ base: '8px 0px', lg: '8px 40px 0px' }}
        w="100%"
        justify="space-between"
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <TokenAmountAndAfter
          label="Base"
          token={dlmmCurrentPosBaseInfo?.displayTokenA}
          amount={currentDlmmPosLiquidity?.displayCoinAmountA}
          afterAmount={tokenAmountAfterA}
          align={isApp ? 'flex-end' : 'flex-start'}
        />
        <TokenAmountAndAfter
          label="Quote"
          token={dlmmCurrentPosBaseInfo?.displayTokenB}
          amount={currentDlmmPosLiquidity?.displayCoinAmountB}
          afterAmount={tokenAmountAfterB}
          align="flex-end"
        />
      </HStack>
    </VStack>
  )
}
