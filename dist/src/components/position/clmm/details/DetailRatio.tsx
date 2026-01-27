import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import { Block, TooltipIcon } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { SingleCoinImage } from '@cetus/ui-kit'
import { d, formatCurrency, formatNumberWithDown, textEllipses } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Box, HStack, Progress, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import PendingYieldValue from '../../common/PendingYieldValue'

function DetailRatio({
  allRoutes,
  isError,
  compoundPreResult,
  amountA,
  amountB,
  displayPercentA,
  displayPercentB,
  labelSize = '14px',
  bg = 'blue_bg',
  label = 'Est. Compound Value',
  tips = "Estimated leftover assets that won't be compounded into your position, which will be returned to your wallet."
}: {
  isError?: boolean
  compoundPreResult: any
  amountA?: any
  amountB?: any
  labelSize?: string
  displayPercentA?: string
  displayPercentB?: string
  bg?: string
  label?: string
  tips?: string
  allRoutes?: any
}) {
  const { currentPosBaseInfo } = usePositionStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { liquiditySlippage } = useGlobalStore()
  const { getTokenInfo } = useGetToken()
  const { aggregateRewardsAndFees } = useCalculatePendingYield()

  const [remainInfos, setRemainInfos] = useState<any[]>([])

  const isPreError = useMemo(() => {
    return isError || compoundPreResult?.error
  }, [isError, compoundPreResult])

  const isLoaded = useMemo(() => {
    return !!compoundPreResult || compoundPreResult?.error
  }, [isError, compoundPreResult])

  const totalValue = useMemo(() => {
    console.log('🚀 ~ DetailRatio ~ compoundPreResult:', compoundPreResult)
    if (!isPreError && compoundPreResult?.displayUseAmountUsdA && compoundPreResult?.displayUseAmountUsdB) {
      return d(compoundPreResult?.displayUseAmountUsdA).plus(compoundPreResult?.displayUseAmountUsdB).toString()
    } else {
      return '--'
    }
  }, [compoundPreResult, isPreError])

  const getRemainInfos = async () => {
    if (!compoundPreResult && !allRoutes?.length) {
      setRemainInfos([])
      return
    }

    let result: any[] = []

    // 1. 原本的 remainAmountInfo
    if (compoundPreResult?.remainAmountInfo && d(compoundPreResult?.remainAmountInfo?.amountUSD).gt(0)) {
      result.push({ ...compoundPreResult.remainAmountInfo, coin_address: compoundPreResult.remainAmountInfo?.token?.coin_type })
    }

    // 2. 处理所有 routes（异步）
    if (allRoutes?.length > 0) {
      for (const item of allRoutes) {
        const target = item.paths[item.paths.length - 1].target
        const token = await getTokenInfo(target)

        const amountOutRaw = item?.amountOut
        if (!amountOutRaw) continue

        const swapAmountOut = !amountOutRaw ? 0 : fromDecimalsAmount(amountOutRaw?.toString(), token?.decimals || 0)
        const remainSwapAmountOut = d(swapAmountOut).mul(liquiditySlippage).toString()

        if (d(remainSwapAmountOut).gt(0)) {
          result.push({
            token,
            coin_address: token?.coin_type,
            amount: remainSwapAmountOut,
            amountUSD: getTokenAmountValue(token?.coin_type, remainSwapAmountOut)
          })
        }
      }
    }
    console.log('🚀 ~ DetailRatio ~ result:2121212', result)
    setRemainInfos(result)
  }
  useEffect(() => {
    getRemainInfos()
  }, [compoundPreResult, allRoutes, liquiditySlippage])

  // 3. useMemo 做纯同步处理
  const remainAmountInfos = useMemo(() => {
    if (remainInfos?.length > 1) {
      return aggregateRewardsAndFees(remainInfos)
    }
    return remainInfos
  }, [remainInfos])

  // 计算 remainAmountUSD
  const remainAmountUSD = useMemo(() => {
    console.log('🚀 ~ DetailRatio ~ result:2121212remainAmountInfos', remainAmountInfos)
    if (!remainAmountInfos?.length) return '0'

    return remainAmountInfos.reduce((sum, item) => d(sum).plus(item?.amountUSD || 0), d(0)).toString()
  }, [remainAmountInfos])

  return (
    <Block bg={bg} borderRadius="12px" p="12px">
      <VStack w="100%" align="flex-start">
        <HStack w="100%" gap="4px" justifyContent="space-between" minH="18px">
          <Skeleton isLoaded={isLoaded}>
            <HStack gap="4px">
              <SingleCoinImage imageUrl={currentPosBaseInfo?.displayTokenA?.logo_url} imgBoxStyle={{ w: '18px', h: '18px' }} />
              <Text color="primary">{displayPercentA ? displayPercentA : compoundPreResult?.displayPercentA}%</Text>
            </HStack>
          </Skeleton>
          <Skeleton isLoaded={isLoaded}>
            <HStack gap="4px">
              <Text color="primary_green">{displayPercentB ? displayPercentB : compoundPreResult?.displayPercentB}%</Text>
              <SingleCoinImage imageUrl={currentPosBaseInfo?.displayTokenB?.logo_url} imgBoxStyle={{ w: '18px', h: '18px' }} />
            </HStack>
          </Skeleton>
        </HStack>
        <Skeleton w="100%" isLoaded={isLoaded} h="4px">
          <Progress
            w={{ base: '100%', lg: '100%' }}
            h="4px"
            value={displayPercentA ? displayPercentA : compoundPreResult?.displayPercentA}
            bg="quote_green"
            sx={{
              'div[role="progressbar"]': {
                bg: 'primary'
              }
            }}
          />
        </Skeleton>
        <HStack w="100%" gap="4px" justifyContent="space-between" minH="30px">
          <Skeleton isLoaded={isLoaded}>
            <VStack gap="4px" align="flex-start">
              <Text color="text_caption">
                {isPreError ? '--' : formatNumberWithDown(compoundPreResult?.displayUseAmountA)}{' '}
                {textEllipses(currentPosBaseInfo?.displayTokenA?.symbol)}
              </Text>
              <Text fontSize="12px">{isPreError ? '--' : formatCurrency(compoundPreResult?.displayUseAmountUsdA, 2)}</Text>
            </VStack>
          </Skeleton>
          <Skeleton isLoaded={isLoaded}>
            <VStack gap="4px" align="flex-end">
              <Text color="text_caption">
                {isPreError ? '--' : formatNumberWithDown(compoundPreResult?.displayUseAmountB)}{' '}
                {textEllipses(currentPosBaseInfo?.displayTokenB?.symbol)}
              </Text>
              <Text fontSize="12px">{isPreError ? '--' : formatCurrency(compoundPreResult?.displayUseAmountUsdB, 2)}</Text>
            </VStack>
          </Skeleton>
        </HStack>
      </VStack>
      <Box h="1px" borderBottom="1px dotted" borderColor="white_color_opacity.10" w="100%" m="12px 0" />
      <HStack w="100%" justify="space-between" minH="20px">
        <Text fontSize={labelSize}>{label}</Text>
        <Skeleton isLoaded={isLoaded}>
          <Text color="text_caption">{formatCurrency(totalValue, 2)} </Text>
        </Skeleton>
      </HStack>
      {remainAmountUSD && d(remainAmountUSD || 0).gt(0) && (
        <HStack w="100%" justify="space-between" minH="20px" mt="8px">
          <HStack justify="flex-end" gap="2px">
            <Text fontSize={labelSize}>Est. Refund</Text>
            <TooltipIcon tooltipCon={tips} />
          </HStack>
          <PendingYieldValue
            myPosYieldValue={remainAmountUSD}
            yieldList={remainAmountInfos}
            textStyle={{ fontSize: '14px', color: 'text_caption', textDecorationColor: 'text_paragraph' }}
          />
        </HStack>
      )}
    </Block>
  )
}

export default DetailRatio
