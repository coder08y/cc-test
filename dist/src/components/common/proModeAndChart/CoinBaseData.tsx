import useProStore from '@/store/pro'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, VTextLabelBox } from '@cetus/ui-kit'
import { d, formatNumberWithKMB, formatUSDPrice } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

const flashGreen = keyframes`
  0% { background-color: rgba(104,255,216,0.1); }
  50% { background-color: rgba(104,255,216,0.3); }
  100% { background-color: transparent; }
`

const flashRed = keyframes`
  0% { background-color: rgba(255,80,115,0.1); }
  50% { background-color: rgba(255,80,115,0.3); }
  100% { background-color: transparent; }
`

const green = '#68FFD8'
const red = '#FF5073'

const CoinBaseData = () => {
  const { isApp } = useWindowWidth()
  const { coinBvPrice, coinBvPriceLoading, coinDetail, coinDetailLoading, coinMarketData, coinMarketDataLoading } = useProStore()

  // 价格变化动画状态
  const [priceAnimation, setPriceAnimation] = useState<'green' | 'red' | null>(null)
  const [priceParts, setPriceParts] = useState<{ value: string; changedParts: number[] }>({ value: '', changedParts: [] })
  const prevPriceRef = useRef<string | null>(null)
  const preCoinType = useRef<string | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fdv = useMemo(() => {
    if (coinBvPrice?.price && coinDetail?.totalSupply) {
      return d(coinBvPrice?.price).mul(coinDetail?.totalSupply).toString()
    }
    return '0'
  }, [coinBvPrice?.price, coinDetail?.totalSupply])

  const marketCap = useMemo(() => {
    if (coinBvPrice?.price && coinDetail?.cirSupply) {
      return d(coinBvPrice?.price).mul(coinDetail?.cirSupply).toString()
    }
    return '0'
  }, [coinBvPrice?.price, coinDetail?.cirSupply])

  // 改进的变化范围检测函数
  const findChangedRange = (prevStr: string, currentStr: string) => {
    let firstChangeIndex = -1
    let lastChangeIndex = -1

    // 找出第一个变化的字符
    for (let i = 0; i < Math.max(prevStr.length, currentStr.length); i++) {
      if (prevStr[i] !== currentStr[i]) {
        firstChangeIndex = i
        break
      }
    }

    // 如果没有找到变化，返回空数组
    if (firstChangeIndex === -1) return []

    // 从第一个变化位置开始，标记后面所有字符为变化
    const changedIndices = []
    for (let i = firstChangeIndex; i < currentStr.length; i++) {
      changedIndices.push(i)
    }

    return changedIndices
  }

  // 价格变化效果处理
  useEffect(() => {
    if (!coinBvPrice?.price || coinBvPriceLoading) return

    const currentPrice = coinBvPrice.price
    const prevPrice = prevPriceRef.current

    // 清除之前的动画定时器
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    // 只有当价格确实变化时才触发动画
    if (prevPrice && prevPrice !== currentPrice) {
      const prevNum = parseFloat(prevPrice)
      const currentNum = parseFloat(currentPrice)

      // 格式化价格（包含千位分隔符）
      const prevStr = formatUSDPrice(prevPrice)
      const currentStr = formatUSDPrice(currentPrice)

      // 找出变化的范围（从第一个变化字符到末尾）
      const changedIndices = findChangedRange(prevStr, currentStr)

      setPriceParts({
        value: currentStr,
        changedParts: changedIndices
      })

      // 设置动画类型
      if (preCoinType.current !== coinBvPrice?.coinType) {
        setPriceAnimation(null)
      } else {
        if (currentNum > prevNum) {
          setPriceAnimation('green')
        } else if (currentNum < prevNum) {
          setPriceAnimation('red')
        }
      }

      // 1秒后清除动画效果
      animationTimeoutRef.current = setTimeout(() => {
        setPriceAnimation(null)
        setPriceParts(prev => ({ ...prev, changedParts: [] }))
      }, 1000)
    } else {
      // 价格没有变化，直接更新显示
      setPriceParts({
        value: formatUSDPrice(currentPrice),
        changedParts: []
      })
      setPriceAnimation(null)
    }

    prevPriceRef.current = currentPrice
    preCoinType.current = coinBvPrice?.coinType
  }, [coinBvPrice?.price, coinBvPriceLoading])

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // 渲染带效果的价格
  const renderAnimatedPrice = () => {
    if (coinBvPrice?.price === '0') return '-'

    const formattedPrice = priceParts.value || formatUSDPrice(coinBvPrice?.price)

    if (!priceAnimation || priceParts.changedParts.length === 0) {
      return `$${formattedPrice}`
    }

    return (
      <Box as="span" display="inline-block" animation={`${priceAnimation === 'green' ? flashGreen : flashRed} 2s ease-out`}>
        $
        {formattedPrice.split('').map((char, index) => (
          <Box
            as="span"
            key={index}
            color={priceParts.changedParts.includes(index) ? (priceAnimation === 'green' ? green : red) : 'inherit'}
            transition="color 0.3s ease"
          >
            {char}
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <HStack w="100%" flexWrap="wrap" sx={{ '>div': { w: 'calc((100% - 16px) / 3)', mt: '20px', gap: '8px' } }}>
      <VTextLabelBox
        wrapStyle={{
          alignItems: 'flex-start'
        }}
        titleStyle={{
          fontSize: '12px',
          color: 'primary_gray'
        }}
        title="Price USD"
        value={renderAnimatedPrice()}
        isLoading={coinBvPriceLoading}
      />
      <VTextLabelBox
        wrapStyle={{
          alignItems: 'center'
        }}
        titleStyle={{
          fontSize: '12px',
          color: 'primary_gray'
        }}
        title="Liquidity"
        value={coinMarketData?.liquidityInUsd || '--'}
        isLoading={coinMarketDataLoading}
      />
      <VStack align="flex-end" w="calc((100% - 16px) / 3)">
        <CetusTooltip
          placement="top"
          tooltip={
            <Text fontSize="12px" lineHeight="20px" maxW="280px">
              FDV(Fully Diluted Valuation) = Total Supply × Price
            </Text>
          }
        >
          <HStack gap="0px">
            <Text fontSize="12px" color="primary_gray">
              FDV
            </Text>
            <Icon svgW="18px" svgH="18px" xlinkHref="#icon-icon_tips" />
          </HStack>
        </CetusTooltip>
        <Skeleton isLoaded={!coinDetailLoading && !coinBvPriceLoading}>
          <Text color="text_caption">${formatNumberWithKMB(fdv, 2)}</Text>
        </Skeleton>
      </VStack>
      <VTextLabelBox
        wrapStyle={{
          alignItems: 'flex-start'
        }}
        titleStyle={{
          fontSize: '12px',
          color: 'primary_gray'
        }}
        title="Market Cap"
        value={`$${formatNumberWithKMB(marketCap, 2)}`}
        isLoading={coinDetailLoading}
      />
      <VTextLabelBox
        wrapStyle={{
          alignItems: isApp ? 'center' : 'center'
        }}
        titleStyle={{
          fontSize: '12px',
          color: 'primary_gray'
        }}
        title="Total Supply"
        value={coinDetail?.totalSupplyDisplay || '--'}
        isLoading={coinDetailLoading}
      />
      <VStack align="flex-end" w="calc((100% - 16px) / 3)">
        <CetusTooltip
          placement="top"
          tooltip={
            <Text fontSize="12px" lineHeight="20px" maxW="280px">
              Circulating Supply refers to the number of tokens that are currently available to the public and circulating in the market.
            </Text>
          }
        >
          <HStack gap="0px">
            <Text fontSize="12px" color="primary_gray">
              Circ. Supply
            </Text>
            <Icon svgW="18px" svgH="18px" xlinkHref="#icon-icon_tips" />
          </HStack>
        </CetusTooltip>
        <Skeleton isLoaded={!coinDetailLoading}>
          <Text color="text_caption">{coinDetail?.cirSupplyDisplay || '--'}</Text>
        </Skeleton>
      </VStack>
    </HStack>
  )
}

export default CoinBaseData
