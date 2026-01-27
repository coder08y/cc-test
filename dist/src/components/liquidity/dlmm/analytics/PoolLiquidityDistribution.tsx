import CurrentLiquidityChart from '@/components/chart/dlmmChart/CurrentLiquidityChart'
import FunnelPrice from '@/components/common/FunnelPrice'
import ActionButton from '@/components/liquidity/common/ActionButton'
import { Legend } from '@/components/pools/createPool/depositAmount/DLMMDepositAmount'
import useDlmmPoolLiquidityDistribution from '@/hooks/dlmm/useDlmmPoolLiquidityDistribution'
import useGetDlmmPoolRelatedData from '@/hooks/dlmm/useGetDlmmPoolRelatedData'
import useDlmmLiquidityStore from '@/store/dlmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, formatPrice, removeComma, textEllipses } from '@cetus/utils'
import { Center, HStack, Heading, Spinner, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
function PoolLiquidityDistribution({ priceDirect }: { priceDirect: boolean }) {
  const { currentPrice, reverseCurrentPrice, dlmmApiPoolInfo } = useDlmmLiquidityStore()
  const { getPerText } = useGetDlmmPoolRelatedData()
  const [maxBinsLength, setMaxBinsLength] = useState(251)
  const { activeBin, maxBinRangeData, isLoading, tokenAPrice, tokenBPrice, allBinsLength } = useDlmmPoolLiquidityDistribution(
    maxBinsLength,
    priceDirect
  )

  const { windowWidth, isApp } = useWindowWidth()

  useEffect(() => {
    setMaxBinsLength(isApp ? 61 : 251)
  }, [isApp])

  const width = useMemo(() => {
    if (windowWidth < 810) {
      return windowWidth - 24
    }
    return 1118
  }, [windowWidth])

  const handleAdd = () => {
    if (maxBinsLength <= 19) return
    const newLength = Math.max(Math.min(maxBinsLength, allBinsLength) - 8, 19)
    setMaxBinsLength(newLength)
  }

  const handleSub = () => {
    if (maxBinsLength >= allBinsLength) return
    const newLength = Math.min(maxBinsLength + 8, allBinsLength)
    setMaxBinsLength(newLength)
    setMaxBinsLength(pre => pre + 8)
  }

  const isReverse = dlmmApiPoolInfo?.isReverse || false

  const displayPrice = useMemo(() => {
    const fromValue = 1
    const toValue = removeComma((dlmmApiPoolInfo?.isReverse ? reverseCurrentPrice : currentPrice).toString())
    if (priceDirect && toValue && fromValue) {
      return formatPrice(d(toValue).div(fromValue).toString())
    }
    if (!priceDirect && toValue && fromValue) {
      return formatPrice(d(fromValue).div(toValue).toString())
    }
    return ''
  }, [priceDirect, dlmmApiPoolInfo?.id, currentPrice])

  return (
    <VStack
      w="100%"
      gap={{ base: '20px', lg: '40px' }}
      p={{ base: '32px 12px 12px', lg: '20px' }}
      borderRadius="16px"
      border="1px solid"
      borderColor={isApp ? 'transparent' : 'border'}
      bg={isApp ? 'transparent' : 'bg_secondary'}
    >
      <VStack gap={isApp ? '12px' : '20px'} w="100%">
        {isApp ? (
          <>
            <HStack w="100%" justify="space-between">
              <Heading fontSize={isApp ? '14px' : '16px'} fontWeight={isApp ? '500' : '400'}>
                Pool Liquidity Distribution
              </Heading>
              {!isApp && (
                <HStack>
                  <ActionButton
                    type="Sub"
                    onClick={handleSub}
                    disabled={maxBinsLength >= allBinsLength}
                    wrapStyle={{ minW: '24px', w: '24px', h: '24px' }}
                  />
                  <ActionButton type="Add" onClick={handleAdd} disabled={maxBinsLength <= 19} wrapStyle={{ minW: '24px', w: '24px', h: '24px' }} />
                </HStack>
              )}
            </HStack>
            <HStack w="100%" justify="space-between">
              <HStack gap={isApp ? '8px' : '16px'}>
                <Legend symbol={textEllipses(dlmmApiPoolInfo?.displayTokenA?.symbol || '', 8)} color="dlmm_blue" />
                <Legend symbol={textEllipses(dlmmApiPoolInfo?.displayTokenB?.symbol || '', 8)} color="dlmm_green" />
              </HStack>
              {isApp && (
                <HStack>
                  <ActionButton
                    type="Sub"
                    onClick={handleSub}
                    disabled={maxBinsLength >= allBinsLength}
                    wrapStyle={{ minW: isApp ? '22px' : '24px', w: isApp ? '22px' : '24px', h: isApp ? '22px' : '24px' }}
                  />
                  <ActionButton
                    type="Add"
                    onClick={handleAdd}
                    disabled={maxBinsLength <= 19}
                    wrapStyle={{ minW: isApp ? '22px' : '24px', w: isApp ? '22px' : '24px', h: isApp ? '22px' : '24px' }}
                  />
                </HStack>
              )}
            </HStack>
            <FunnelPrice price={displayPrice} perText={getPerText(priceDirect)} showIcon={false} />
          </>
        ) : (
          <HStack w="100%" justify="space-between">
            <Heading fontSize="16px" fontWeight="400">
              Pool Liquidity Distribution
            </Heading>
            <HStack gap="40px">
              <HStack gap="16px">
                <FunnelPrice price={displayPrice} perText={getPerText(priceDirect)} />
                <Legend symbol={textEllipses(dlmmApiPoolInfo?.displayTokenA?.symbol || '', 8)} color="dlmm_blue" />
                <Legend symbol={textEllipses(dlmmApiPoolInfo?.displayTokenB?.symbol || '', 8)} color="dlmm_green" />
              </HStack>
              <HStack>
                <ActionButton type="Sub" onClick={handleSub} disabled={maxBinsLength >= allBinsLength} />
                <ActionButton type="Add" onClick={handleAdd} disabled={maxBinsLength <= 19} />
              </HStack>
            </HStack>
          </HStack>
        )}

        {activeBin !== undefined &&
          (isLoading && maxBinRangeData === undefined ? (
            <Center h={isApp ? '135px' : '160px'} px={isApp ? '12px' : '0'}>
              <Spinner />
            </Center>
          ) : (
            <CurrentLiquidityChart
              type="simulation"
              data={maxBinRangeData}
              activeBin={Number(activeBin)}
              width={width}
              height={isApp ? 135 : 160}
              noDataText="No Liquidity Data"
              isReverse={isReverse || false}
              tokenAPrice={tokenAPrice}
              tokenBPrice={tokenBPrice}
            />
          ))}
      </VStack>
    </VStack>
  )
}

export default PoolLiquidityDistribution
