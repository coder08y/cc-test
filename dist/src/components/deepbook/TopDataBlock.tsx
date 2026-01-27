'use client'

import useDeepBookStore from '@/store/deepbook'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { Block, CetusTooltip, TooltipIcon } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import {
  abbreviateTokenName,
  d,
  formatNumber,
  formatNumberWithKMB,
  formatPercentage,
  fromDecimalsAmountFix,
  symbolDataDisplayProcessing
} from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ManagePool from './ManagePool'
// import MarketDetailsModal from './MarketDetailsModal'

type SkeletonWrapperProps = {
  isLoading: boolean
  height?: string
  width?: string | object
  children: React.ReactNode
}

const SkeletonWrapper = ({ isLoading, height = '12px', width = 'max-content', children }: SkeletonWrapperProps) => (
  <Skeleton height={height} minWidth={width} isLoaded={!isLoading}>
    {children}
  </Skeleton>
)

/* ----------------------------- PriceChange ----------------------------- */
type PriceChangeProps = {
  priceChange?: string
  isLoading: boolean
}

export const PriceChange = ({ priceChange, isLoading }: PriceChangeProps) => {
  if (isLoading) return <Skeleton height="12px" width="50px" />

  if (!priceChange || priceChange === '0%') return <Text color="text_caption">{priceChange}</Text>

  const isNegative = priceChange.startsWith('-')
  const displayValue = isNegative ? priceChange.slice(1) : priceChange

  return (
    <HStack gap="2px" justify="flex-end">
      <Text color={isNegative ? 'primary_red' : 'primary_green'} fontSize="12px">
        {displayValue}
      </Text>
      <Icon
        sx={{ cursor: 'unset' }}
        fontSize="12px"
        xlinkHref="#icon-icon_arrow"
        transition="transform 0.5s"
        transform={isNegative ? 'rotate(0deg)' : 'rotate(180deg)'}
        svgFill={isNegative ? 'primary_red' : 'primary_green'}
        svgHover={isNegative ? 'primary_red' : 'primary_green'}
      />
    </HStack>
  )
}

/* ----------------------------- PriceDisplay ---------------------------- */
type PriceDisplayProps = {
  priceDisplay?: string
  priceUsd?: string
  isLoading: boolean
  priceChange?: string
  isApp: boolean
  isStuck?: boolean
}

export function PriceDisplay({ priceDisplay, priceUsd, isLoading, priceChange, isApp, isStuck }: PriceDisplayProps) {
  return (
    <VStack align="flex-start" w={{ lg: 'auto' }}>
      {isLoading ? (
        <VStack alignItems={{ base: 'flex-start' }} gap={isApp ? '8px' : '8px'}>
          <Skeleton height="12px" width={{ base: '80px', lg: '60px' }} />
          <Skeleton height="22px" width={{ base: '100px', lg: '80px' }} />
          {isApp && <Skeleton height="22px" width={{ base: '100px', lg: '80px' }} />}
        </VStack>
      ) : (
        <VStack alignItems={{ base: 'flex-start' }} gap={isApp ? '8px' : '8px'}>
          {isApp && !isStuck ? <Text fontSize="12px">Latest Price</Text> : null}
          <Text fontSize={{ base: '22px', lg: '16px' }} fontWeight="600" color="text_caption">
            {priceDisplay}
          </Text>
          <HStack>
            <Text fontSize="12px" color="text_caption">
              {symbolDataDisplayProcessing(priceUsd)}
            </Text>
            {isApp && <PriceChange priceChange={priceChange} isLoading={false} />}
          </HStack>
        </VStack>
      )}
    </VStack>
  )
}

/* ----------------------------- VolumeDisplay --------------------------- */
type VolumeDisplayProps = {
  vol24hDisplay?: string
  vol24hUsdDisplay?: string
  baseSymbol?: string
  quoteSymbol?: string
  isLoading: boolean
  isApp: boolean
}

const VolumeDisplay = ({ vol24hDisplay, vol24hUsdDisplay, baseSymbol, quoteSymbol, isLoading, isApp }: VolumeDisplayProps) => {
  return (
    <HStack w="100%" gap={{ base: '40px', lg: '28px' }}>
      {/* 24h Vol */}
      <VStack
        align={isApp ? 'flex-end' : 'flex-start'}
        // w={{ base: '50%', lg: 'auto' }}
        flex="1"
        gap="12px"
      >
        <Text fontSize={isApp ? '10px' : '12px'} fontWeight={{ base: '400', lg: '400' }} minW="max-content">
          24h Vol ({baseSymbol || '--'})
        </Text>

        <SkeletonWrapper isLoading={isLoading}>
          <Text color="text_caption" fontSize="12px" minWidth="max-content">
            {vol24hDisplay}
          </Text>
        </SkeletonWrapper>
      </VStack>

      {/* 24h Vol Value */}
      <VStack
        align={isApp ? 'flex-end' : 'flex-start'}
        // w={{ base: '50%', lg: 'auto' }}
        flex="1"
        gap="12px"
      >
        <Text fontSize={isApp ? '10px' : '12px'} fontWeight={{ base: '400', lg: '400' }} minW="max-content">
          24h Vol Value
        </Text>

        <SkeletonWrapper isLoading={isLoading}>
          <Text color="text_caption" fontSize="12px" minWidth="max-content">
            {symbolDataDisplayProcessing(vol24hUsdDisplay)}
          </Text>
        </SkeletonWrapper>
      </VStack>
    </HStack>
  )
}

/* ----------------------------- DataItem -------------------------- */
type DataItemProps = {
  label: string
  value?: string | number | ReactNode
  isLoading: boolean
  isApp: boolean
  color?: string
  gap?: string
  useSkeletonWrapper?: boolean
  showSymbol?: string
  labelFontWeight?: string | object
  labelDisplay?: string | object
  tooltip?: string
  iconSize?: string
}

const DataItem = ({
  label,
  value,
  isLoading,
  isApp,
  color = 'text_caption',
  gap,
  useSkeletonWrapper = false,
  showSymbol,
  labelFontWeight,
  labelDisplay,
  tooltip,
  iconSize = '16px'
}: DataItemProps) => {
  // 如果 value 是数字，需要格式化；如果已经是字符串（可能已格式化，如包含 $ 符号），直接使用
  const displayValue = (() => {
    if (typeof value === 'number') {
      // 数字类型，需要格式化（添加千分位）
      return formatNumber(value || 0)
    } else if (typeof value === 'string') {
      // 字符串类型：检查是否已经格式化（包含 $、% 等符号）
      if (value.includes('$') || value.includes('%') || value.includes('<') || value.includes('>') || value === '--') {
        // 已经格式化，直接使用
        return value
      } else {
        // 普通字符串，尝试转换为数字并格式化
        const numValue = Number(value)
        if (!isNaN(numValue) && value !== '') {
          return formatNumber(numValue)
        }
        // 无法转换为数字，直接使用原值
        return value || '0'
      }
    } else if (typeof value === 'object') {
      return value
    }
    // undefined 或其他类型
    return '0'
  })()
  const finalGap = gap || (isApp ? '4px' : '8px')
  const finalLabelFontWeight = labelFontWeight || (isApp ? '400' : '500')
  const finalLabelDisplay = labelDisplay || (isApp ? 'block' : { base: 'none', lg: 'block' })

  return (
    <VStack align={isApp ? 'flex-end' : 'flex-start'} gap={finalGap}>
      <HStack gap="4px">
        <Text fontSize={isApp ? '10px' : '12px'} fontWeight={finalLabelFontWeight} whiteSpace="nowrap" display={finalLabelDisplay} minW="max-content">
          {label} {showSymbol ? `(${abbreviateTokenName(showSymbol)})` : ''}
        </Text>
        {tooltip && <TooltipIcon tooltipCon={tooltip} iconSize={iconSize} />}
      </HStack>
      {useSkeletonWrapper ? (
        <SkeletonWrapper isLoading={isLoading}>
          <Text color={color} fontSize="12px" minWidth="max-content">
            {displayValue}
          </Text>
        </SkeletonWrapper>
      ) : isLoading ? (
        <Skeleton h="12px" minWidth="60px" />
      ) : (
        <Text fontSize="12px" color={color} fontWeight={isApp ? '400' : '400'}>
          {displayValue}
        </Text>
      )}
    </VStack>
  )
}

/* ----------------------------- HighLowDisplay -------------------------- */
type HighLowDisplayProps = {
  high?: number
  low?: number
  quoteSymbol?: string
  isLoading: boolean
  isApp: boolean
}
const HighLowDisplay = ({ high, low, quoteSymbol, isLoading, isApp }: HighLowDisplayProps) => {
  return (
    <VStack align="flex-start" w={{ base: isApp ? '100%' : '50%', lg: 'auto' }}>
      <HStack w="100%" gap={isApp ? '40px' : '28px'}>
        <VStack flex={isApp ? '1' : '0'} align={isApp ? 'flex-end' : 'flex-start'}>
          <DataItem
            label="24h High"
            value={high}
            isLoading={isLoading}
            isApp={isApp}
            color="primary_green"
            showSymbol={!isApp ? quoteSymbol : undefined}
            gap="12px"
          />
        </VStack>
        <VStack flex={isApp ? '1' : '0'} align={isApp ? 'flex-end' : 'flex-start'}>
          <DataItem
            label="24h Low"
            value={low}
            isLoading={isLoading}
            isApp={isApp}
            color="primary_red"
            showSymbol={!isApp ? quoteSymbol : undefined}
            gap="12px"
          />
        </VStack>
      </HStack>
    </VStack>
  )
}

const BorrowRateDisplay = ({
  baseAssets,
  quoteAssets,
  baseLabels,
  quoteLabels
}: { baseAssets: any; quoteAssets: any; currentDeepBookPool: any; baseLabels: any; quoteLabels: any }) => {
  return (
    <VStack w="100%" alignItems="left">
      <HStack gap="2px">
        <Text fontSize="12px">Hourly Interest</Text>
        <TooltipIcon
          tooltipCon="The current hourly borrow rate of the margin pool. Interest accrues continuously and the rate may change over time based on utilization."
          iconSize="14px"
        />
      </HStack>
      <HStack gap="4px">
        <SingleCoinImage
          coinType={baseAssets?.coin_type}
          imageUrl={baseAssets?.icon_url}
          imageStyle={{
            w: '12px',
            h: '12px'
          }}
          imgBoxStyle={{
            w: '12px',
            h: '12px'
          }}
        />
        <CetusTooltip
          children={
            <Text color={baseLabels.borrowAPR.color} textDecoration="underline dotted" cursor="pointer" fontSize="12px">
              {baseLabels.borrowAPR.hourValue}
            </Text>
          }
          tooltip={
            <VStack>
              {[
                {
                  label: `${baseAssets.symbol} Borrow APR`,
                  value: baseLabels.borrowAPR.value
                },
                {
                  label: `Est. Hourly Interest`,
                  value: baseLabels.borrowAPR.hourValue
                }
              ].map(item => (
                <HStack key={item.label} justifyContent="space-between" w="100%" gap="24px">
                  <Text fontSize="12px" lineHeight="16px">
                    {item.label}
                  </Text>
                  <Text fontSize="12px" lineHeight="16px" color={baseLabels.borrowAPR.color}>
                    {item.value}
                  </Text>
                </HStack>
              ))}
            </VStack>
          }
        />
        <Text>/</Text>
        <SingleCoinImage
          coinType={quoteAssets?.coin_type}
          imageUrl={quoteAssets?.icon_url}
          imageStyle={{
            w: '16px',
            h: '16px'
          }}
          imgBoxStyle={{
            w: '16px',
            h: '16px'
          }}
        />
        <CetusTooltip
          children={
            <Text color={quoteLabels.borrowAPR.color} textDecoration="underline dotted" cursor="pointer" fontSize="12px">
              {quoteLabels.borrowAPR.hourValue}
            </Text>
          }
          tooltip={
            <VStack>
              {[
                {
                  label: `${quoteAssets.symbol} Borrow APR`,
                  value: quoteLabels.borrowAPR.value
                },
                {
                  label: `Est. Hourly Interest`,
                  value: quoteLabels.borrowAPR.hourValue
                }
              ].map(item => (
                <HStack key={item.label} justifyContent="space-between" w="100%" gap="24px">
                  <Text fontSize="12px" lineHeight="16px">
                    {item.label}
                  </Text>
                  <Text fontSize="12px" lineHeight="16px" color={quoteLabels.borrowAPR.color}>
                    {item.value}
                  </Text>
                </HStack>
              ))}
            </VStack>
          }
        />
      </HStack>
    </VStack>
  )
}

/* ----------------------------- DetailsButton --------------------------- */
// type DetailsButtonProps = {
//   onClick: () => void
//   isLoading: boolean
//   isApp: boolean
// }

// const DetailsButton = ({ onClick, isLoading, isApp }: DetailsButtonProps) => (
//   <Skeleton isLoaded={!isLoading}>
//     <HStack ml={{base: '0', lg: '28px'}} cursor="pointer" _hover={{ p: { color: 'text_caption' }, svg: { fill: 'text_caption' } }}>
//       <HStack onClick={onClick} gap="4px">
//         <Text fontSize="12px">
//           <Box as="span" display={{ base: 'none', lg: 'none' }}>
//             Details
//           </Box>
//           <Box as="span" display={{ base: 'none', lg: 'inline' }} whiteSpace="nowrap">
//             Market Details
//           </Box>
//         </Text>
//         <Icon fontSize="12px" xlinkHref="#icon-icon_unfold" w="20px" h="20px" transform={!isApp ? 'rotate(90deg)' : 'rotate(0deg)'} />
//       </HStack>
//     </HStack>
//   </Skeleton>
// )

/* ----------------------------- BorrowRate --------------------------- */
// const BorrowRate = ({ currentDeepBookPool }: { currentDeepBookPool: any }) => {
//   return (
//     <VStack align="flex-start">
//       <HStack gap="4px">
//         <Text fontSize="12px">Borrow Rate</Text>
//         <CetusTooltip
//           tooltip={
//             <Text fontSize="12px" lineHeight="16px">
//               The current interest rate of the asset's margin pool. Interest accrues continuously and the rate may change over time based on its
//               utilization. The rate shown in red indicates borrowing costs, while the rate in green indicates potential earnings.
//             </Text>
//           }
//         >
//           <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
//         </CetusTooltip>
//       </HStack>
//       {/* Todo -- 负利率（用户可得到收益）为绿色字体，正利率（用户需支付利息）为黄色字体 */}
//       <HStack position="relative" top="-2px">
//         <HStack gap="4px">
//           <SingleCoinImage imageUrl={currentDeepBookPool?.baseAssets?.icon_url} w="14px" h="14px" />
//           <Text fontSize="12px" color="text_green">
//             4.8%
//           </Text>
//         </HStack>
//         /
//         <HStack gap="4px">
//           <SingleCoinImage imageUrl={currentDeepBookPool?.quoteAssets?.icon_url} w="14px" h="14px" />
//           <Text fontSize="12px" color="text_yellow">
//             5.2%
//           </Text>
//         </HStack>
//       </HStack>
//     </VStack>
//   )
// }

/* ----------------------------- ScrollArrow --------------------------- */
type ScrollArrowProps = {
  direction: 'left' | 'right'
  onClick: () => void
}

const ScrollArrow = ({ direction, onClick }: ScrollArrowProps) => {
  const isLeft = direction === 'left'

  return (
    <Box
      position="relative"
      cursor="pointer"
      onClick={onClick}
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="36px"
      opacity={0}
      transform="scale(0.85)"
      transition="opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      sx={{
        animation: 'fadeInScale 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        '@keyframes fadeInScale': {
          '0%': {
            opacity: 0,
            transform: 'scale(0.85)'
          },
          '100%': {
            opacity: 1,
            transform: 'scale(1)'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          [isLeft ? 'left' : 'right']: '0',
          top: '0',
          width: '36px',
          height: '100%',
          background: isLeft
            ? 'linear-gradient(90deg, #0F0F0F 0%, rgba(15,15,15,0.6) 70%)'
            : 'linear-gradient(90deg, rgba(15,15,15,0.6) 0%, #0F0F0F 30%)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          pointerEvents: 'none',
          zIndex: 1
        }
      }}
    >
      <Icon fontSize="16px" xlinkHref="#icon-detail" transform={isLeft ? 'rotate(180deg)' : 'none'} position="relative" zIndex={2} />
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

export default function TopDataBlock() {
  const { getTokenAmountValue } = useTokenPrice()
  // 使用精确的选择器，只订阅需要的字段，避免不必要的重渲染
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const deepBookPoolLoading = useDeepBookStore(state => state.deepBookPoolLoading)
  const deepbookPrice = useDeepBookStore(state => state.deepbookPrice)
  const { windowWidth, isApp } = useWindowWidth()

  const isLoading = deepBookPoolLoading || !currentDeepBookPool?.quoteAssets?.symbol

  // 监听 top-data-block 宽度，判断是否需要显示滚动箭头
  const [smallScreen, setSmallScreen] = useState(false)
  // 动态计算滚动容器的最大宽度
  const [scrollContainerMaxW, setScrollContainerMaxW] = useState<number>(256)

  useEffect(() => {
    if (isApp) return // 移动端不需要这个逻辑

    let resizeObserver: ResizeObserver | null = null

    const checkContainerWidth = () => {
      const topDataBlock = document.querySelector('.top-data-block') as HTMLElement

      if (!topDataBlock) {
        setSmallScreen(false)
        return
      }

      const topDataBlockWidth = topDataBlock.offsetWidth

      // 当 top-data-block 宽度小于 1000px 时，显示滚动箭头
      const baseSymbolLen = currentDeepBookPool?.baseAssets?.symbol?.length ?? 0
      const quoteSymbolLen = currentDeepBookPool?.quoteAssets?.symbol?.length ?? 0
      const symbolLen = d(baseSymbolLen).plus(quoteSymbolLen)?.toNumber()
      const length = Math.min(13, symbolLen)

      const num = d(1000).plus(d(12).mul(length)).toNumber()
      const shouldShowSmallScreen = topDataBlockWidth < num
      setSmallScreen(shouldShowSmallScreen)

      setScrollContainerMaxW(Math.max(200, topDataBlockWidth - d(354).plus(d(8).mul(length)).toNumber()))

      // 当 smallScreen 状态改变时，立即检查滚动位置
      if (shouldShowSmallScreen && scrollContainerRef.current) {
        // 使用 requestAnimationFrame 确保在样式应用后检查
        requestAnimationFrame(() => {
          const element = scrollContainerRef.current
          if (element) {
            const { scrollLeft, scrollWidth, clientWidth } = element
            const isAtLeft = scrollLeft <= 0
            const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1
            setScrollPosition({ isAtLeft, isAtRight })
          }
        })
      }
    }

    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(() => {
      checkContainerWidth()

      // 使用 ResizeObserver 监听 TopDataBlock 的宽度变化
      resizeObserver = new ResizeObserver(() => {
        checkContainerWidth()
        // 宽度变化后，再次检查滚动位置（延迟检查，确保样式已应用）
        if (scrollContainerRef.current) {
          requestAnimationFrame(() => {
            const element = scrollContainerRef.current
            if (element) {
              const { scrollLeft, scrollWidth, clientWidth } = element
              const isAtLeft = scrollLeft <= 0
              const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1
              setScrollPosition({ isAtLeft, isAtRight })
            }
          })
        }
      })

      const topDataBlock = document.querySelector('.top-data-block')

      if (topDataBlock) {
        resizeObserver.observe(topDataBlock)
      }

      // 也监听窗口大小变化
      window.addEventListener('resize', checkContainerWidth)
    }, 100)

    return () => {
      clearTimeout(timer)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', checkContainerWidth)
    }
  }, [isApp, currentDeepBookPool])

  const quoteSymbol = currentDeepBookPool?.quoteAssets?.symbol ?? ''
  const baseSymbol = currentDeepBookPool?.baseAssets?.symbol ?? ''

  const baseAssets = currentDeepBookPool?.baseAssets
  const quoteAssets = currentDeepBookPool?.quoteAssets

  /* --------------------------- 计算值（useMemo） -------------------------- */
  const { spread, priceUsd, vol24hUsdDisplay } = useMemo(() => {
    const price =
      deepbookPrice?.price && deepbookPrice?.poolId === currentDeepBookPool?.address ? deepbookPrice.price : (currentDeepBookPool?.price ?? '')

    const usd = getTokenAmountValue(currentDeepBookPool?.quoteAssets?.coin_type, price)

    // const volUsd = getTokenAmountValue(currentDeepBookPool?.baseAssets?.coin_type, currentDeepBookPool?.vol24h)
    const volUsd = currentDeepBookPool?.vol24hUsdDisplay

    return {
      spread: price,
      priceUsd: usd,
      vol24hUsdDisplay: volUsd
    }
  }, [currentDeepBookPool, deepbookPrice, getTokenAmountValue])

  // const [isOpenDetails, setIsOpenDetails] = useState(false)

  const [isStuck, setIsStuck] = useState(false)

  // 滚动位置状态
  const [scrollPosition, setScrollPosition] = useState({ isAtLeft: true, isAtRight: false })
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // 检查滚动位置
  const checkScrollPosition = useCallback(() => {
    const element = scrollContainerRef.current
    if (!element) return

    const { scrollLeft, scrollWidth, clientWidth } = element
    const isAtLeft = scrollLeft <= 0
    const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1 // 允许1px的误差

    setScrollPosition({ isAtLeft, isAtRight })
  }, [])

  // 监听滚动事件
  useEffect(() => {
    if (!smallScreen) return

    const element = scrollContainerRef.current
    if (!element) return

    // 初始检查
    checkScrollPosition()

    // 监听滚动
    element.addEventListener('scroll', checkScrollPosition)
    // 监听窗口大小变化（可能影响滚动状态）
    window.addEventListener('resize', checkScrollPosition)

    return () => {
      element.removeEventListener('scroll', checkScrollPosition)
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [smallScreen, checkScrollPosition])

  // 平滑滚动函数
  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const element = scrollContainerRef.current
    if (!element) return

    const scrollAmount = 160
    const targetScroll = direction === 'left' ? element.scrollLeft - scrollAmount : element.scrollLeft + scrollAmount

    element.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })

    // 滚动完成后更新位置（使用 setTimeout 等待平滑滚动完成）
    setTimeout(() => {
      const { scrollLeft, scrollWidth, clientWidth } = element
      const isAtLeft = scrollLeft <= 0
      const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1
      setScrollPosition({ isAtLeft, isAtRight })
    }, 300) // 300ms 应该足够完成平滑滚动
  }, [])

  /* ----------------------- 吸顶检测（仅移动端） ----------------------- */
  useEffect(() => {
    if (!isApp) return
    const scrollContainer = document.querySelector('.scroll-container')
    const topDataBlock = document.querySelector('.top-data-block')
    if (!scrollContainer || !topDataBlock) return

    const STICK_THRESHOLD = 48
    const UNSTICK_THRESHOLD = 56

    let ticking = false
    const update = () => {
      const { top } = topDataBlock.getBoundingClientRect()
      setIsStuck(prev => {
        const next = prev ? top <= UNSTICK_THRESHOLD : top <= STICK_THRESHOLD
        return next
      })
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update() // 初始检查
    scrollContainer.addEventListener('scroll', handleScroll)
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [isApp])

  const deepBookMarginPools = useDeepBookMarginPoolStore((state: any) => state.deepBookMarginPools)

  // 根据 coinType 查找对应的 margin pool
  const getMarginPoolByCoinType = (coinType: string): any => {
    if (!coinType || !deepBookMarginPools || deepBookMarginPools.length === 0) return null
    return deepBookMarginPools.find((pool: any) => pool.coinType === coinType) || null
  }

  // 计算 margin pool 的 labels
  const getMarginPoolLabels = (type: 'base' | 'quote') => {
    const assets = type === 'base' ? currentDeepBookPool?.baseAssets : currentDeepBookPool?.quoteAssets
    const coinType = assets?.coin_type
    const marginPool = getMarginPoolByCoinType(coinType)

    if (!marginPool) {
      // 如果没有找到对应的 margin pool，返回默认值
      return {
        totalSupplied: `-- ${assets?.symbol || ''}`,
        totalBorrowed: `-- ${assets?.symbol || ''}`,
        utilizationRate: '--',
        supplyAPR: '--',
        borrowAPR: { value: '--', color: 'text_caption' },
        maxUtilization: '--',
        minBorrow: `-- ${assets?.symbol || ''}`
      }
    }

    // 计算总借款量：使用 remain_to_borrow 和 maxUtilizationRate
    const totalSupply = d(marginPool.totalSupply || '0')
    // 格式化最大利用率（maxUtilizationRate 是 "800000000" 表示 80%，需要除以 1000000000 * 100）
    const maxUtilizationRate = d(marginPool.maxUtilizationRate || '0').div(1000000000)
    // 最大可借出量 = 总供应量 × 最大利用率
    const maxBorrowable = totalSupply.times(maxUtilizationRate)
    // 剩余可借出量（考虑最大利用率限制）
    const remainToBorrow = d(marginPool.remainToBorrow || '0')
    // 总借款量 = 最大可借出量 - 剩余可借出量
    const totalBorrowed = maxBorrowable.gt(0) ? maxBorrowable.minus(remainToBorrow) : d(0)
    const totalBorrowedDisplay = formatNumber(totalBorrowed.toString(), 2)

    // 计算利用率 = (总借款量 / 总供应量) * 100
    const utilizationRate = totalSupply.gt(0) ? totalBorrowed.div(totalSupply).times(100) : d(0)
    const utilizationRateDisplay = formatPercentage(utilizationRate.toString(), 2)

    // 格式化 APR（需要乘以 100 转换为百分比）
    const supplyApr = d(marginPool.supplyApr || '0').times(100)
    const borrowApr = d(marginPool.borrowApr || '0').times(100)
    const supplyAprDisplay = formatPercentage(supplyApr.toString(), 2)
    // 格式化 Borrow APR 显示（橙色，如果是负值取绝对值用绿色）
    const borrowAprValue = borrowApr
    const isNegative = borrowAprValue.lt(0)
    const absValue = borrowAprValue.abs()
    const borrowAprDisplay = {
      value: formatPercentage(absValue.toString(), 4),
      hourValue: formatPercentage(absValue.div(8760).toString(), 4),
      color: isNegative ? 'primary_green' : '#ff9968'
    }
    const maxUtilizationDisplay = formatPercentage(maxUtilizationRate.times(100).toString(), 2)

    // 格式化最小借款量（需要根据 decimals 格式化）
    const decimals = marginPool.tokenInfo?.decimals || assets?.decimals || 6
    const minBorrowAmount = fromDecimalsAmountFix(marginPool.minBorrow || '0', decimals)
    const minBorrowDisplay = formatNumber(minBorrowAmount, 2)

    // 格式化总供应量（带价值）
    const totalSuppliedDisplay = `${marginPool.displayTotalSupply || '0'} ${assets?.symbol || ''}`
    // 使用 totalValue 重新格式化为 K/M/B 格式
    const totalValueDisplay = marginPool.totalValue ? `$${formatNumberWithKMB(marginPool.totalValue, 2)}` : null
    const totalSuppliedWithValue = totalValueDisplay ? `${totalSuppliedDisplay} (${totalValueDisplay})` : totalSuppliedDisplay

    // 计算总借款量的价值（如果有总价值和总供应量，可以按比例计算）
    let totalBorrowedWithValue = totalBorrowedDisplay
    if (marginPool.totalValue && totalSupply.gt(0)) {
      const borrowedValue = d(marginPool.totalValue).times(totalBorrowed).div(totalSupply)
      const borrowedValueDisplay = `$${formatNumberWithKMB(borrowedValue.toString(), 2)}`
      totalBorrowedWithValue = `${totalBorrowedDisplay} ${assets?.symbol || ''} (${borrowedValueDisplay})`
    } else {
      totalBorrowedWithValue = `${totalBorrowedDisplay} ${assets?.symbol || ''}`
    }

    return {
      totalSupplied: totalSuppliedWithValue,
      totalBorrowed: totalBorrowedWithValue,
      utilizationRate: utilizationRateDisplay,
      supplyAPR: supplyAprDisplay,
      borrowAPR: borrowAprDisplay,
      maxUtilization: maxUtilizationDisplay,
      minBorrow: `${minBorrowDisplay} ${assets?.symbol || ''}`
    }
  }

  // 计算 base 和 quote 的 labels
  const baseLabels = useMemo(() => getMarginPoolLabels('base'), [currentDeepBookPool, deepBookMarginPools])
  const quoteLabels = useMemo(() => getMarginPoolLabels('quote'), [currentDeepBookPool, deepBookMarginPools])

  /* --------------------------- 移动端布局 --------------------------- */
  const mobileLayout = useMemo(
    () => (
      <VStack w="100%" gap={isStuck ? '0' : '8px'} display={{ base: 'flex', lg: 'none' }}>
        <HStack w="100%" justify="space-between" gap="0 !important">
          <ManagePool key="manage-pool-stable" isStuck={isStuck} />
          <VStack
            alignItems="flex-end"
            opacity={isStuck ? 1 : 0}
            w={isStuck ? 'inherit' : '0'}
            maxHeight={isStuck ? '100px' : '0px'}
            overflow="hidden"
            transition="opacity 0.3s ease, max-height 0.3s ease"
            pointerEvents={isStuck ? 'auto' : 'none'}
          >
            <Text fontSize="14px" color="text_caption" fontWeight="500">
              {formatNumber(spread)}
            </Text>
            <HStack>
              <PriceChange priceChange={currentDeepBookPool?.priceChange} isLoading={isLoading} />
              <Text fontSize="12px" color="text_caption">
                {symbolDataDisplayProcessing(priceUsd)}
              </Text>
            </HStack>
          </VStack>
        </HStack>
        <HStack
          w="100%"
          opacity={!isStuck ? 1 : 0}
          maxHeight={!isStuck ? '500px' : '0px'}
          overflow="hidden"
          transition="opacity 0.3s ease, max-height 0.3s ease"
          pointerEvents={!isStuck ? 'auto' : 'none'}
        >
          <VStack flex="1" alignItems={'flex-start'}>
            <PriceDisplay
              priceDisplay={formatNumber(spread)}
              priceUsd={priceUsd}
              isLoading={isLoading}
              priceChange={currentDeepBookPool?.priceChange}
              isApp={isApp}
            />
            {!isApp && (
              <VStack align="flex-start" flex="1">
                <Text fontSize="12px" fontWeight="500">
                  24h Change
                </Text>
                <PriceChange priceChange={currentDeepBookPool?.priceChange} isLoading={isLoading} />
              </VStack>
            )}
          </VStack>

          <VStack justify="space-between" gap="8px" flex="1">
            {/* 使用统一的网格布局确保上下对齐 */}
            <Box w="100%">
              <Box display="grid" gridTemplateColumns="1fr 1fr" columnGap={{ base: '40px', lg: '28px' }} rowGap="8px" w="100%">
                {/* 第一行：24h Vol */}
                <DataItem
                  label="24h Vol"
                  value={currentDeepBookPool?.vol24hDisplay}
                  isLoading={isLoading}
                  isApp={isApp}
                  useSkeletonWrapper={true}
                  showSymbol={baseSymbol || '--'}
                  labelFontWeight={{ base: '400', lg: '400' }}
                  labelDisplay="block"
                />

                {/* 第一行：24h Vol Val */}
                <DataItem
                  label={`24h Vol Value`}
                  value={symbolDataDisplayProcessing(vol24hUsdDisplay)}
                  isLoading={isLoading}
                  isApp={isApp}
                  useSkeletonWrapper={true}
                  labelFontWeight={{ base: '400', lg: '400' }}
                  labelDisplay="block"
                />

                {/* 第二行：24h High */}
                <DataItem label="24h High" value={currentDeepBookPool?.high} isLoading={isLoading} isApp={isApp} color="primary_green" />

                {/* 第二行：24h Low */}
                <DataItem label="24h Low" value={currentDeepBookPool?.low} isLoading={isLoading} isApp={isApp} color="primary_red" />

                {currentDeepBookPool?.isMarginPool && (
                  <DataItem
                    label="Hourly Interest"
                    showSymbol={baseAssets?.symbol}
                    value={
                      <CetusTooltip
                        children={
                          <Text color={baseLabels.borrowAPR.color} textDecoration="underline dotted" cursor="pointer" fontSize="12px">
                            {baseLabels.borrowAPR.hourValue}
                          </Text>
                        }
                        tooltip={
                          <VStack>
                            {[
                              {
                                label: `${baseAssets.symbol} Borrow APR`,
                                value: baseLabels.borrowAPR.value
                              },
                              {
                                label: `Est. Hourly Interest`,
                                value: baseLabels.borrowAPR.hourValue
                              }
                            ].map(item => (
                              <HStack key={item.label} justifyContent="space-between" w="100%" gap="24px">
                                <Text fontSize="12px" lineHeight="16px">
                                  {item.label}
                                </Text>
                                <Text fontSize="12px" lineHeight="16px" color={baseLabels.borrowAPR.color}>
                                  {item.value}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        }
                      />
                    }
                    isLoading={isLoading}
                    isApp={isApp}
                    color={baseLabels.borrowAPR.color}
                  />
                )}

                {currentDeepBookPool?.isMarginPool && (
                  <DataItem
                    label="Hourly Interest"
                    showSymbol={quoteAssets?.symbol}
                    value={
                      <CetusTooltip
                        children={
                          <Text color={quoteLabels.borrowAPR.color} textDecoration="underline dotted" cursor="pointer" fontSize="12px">
                            {quoteLabels.borrowAPR.hourValue}
                          </Text>
                        }
                        tooltip={
                          <VStack>
                            {[
                              {
                                label: `${quoteAssets.symbol} Borrow APR`,
                                value: quoteLabels.borrowAPR.value
                              },
                              {
                                label: `Est. Hourly Interest`,
                                value: quoteLabels.borrowAPR.hourValue
                              }
                            ].map(item => (
                              <HStack key={item.label} justifyContent="space-between" w="100%" gap="24px">
                                <Text fontSize="12px" lineHeight="16px">
                                  {item.label}
                                </Text>
                                <Text fontSize="12px" lineHeight="16px" color={quoteLabels.borrowAPR.color}>
                                  {item.value}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        }
                      />
                    }
                    isLoading={isLoading}
                    isApp={isApp}
                    color={quoteLabels.borrowAPR.color}
                  />
                )}
              </Box>
            </Box>
          </VStack>
        </HStack>
      </VStack>
    ),
    [
      isStuck,
      spread,
      priceUsd,
      quoteSymbol,
      baseSymbol,
      isLoading,
      currentDeepBookPool?.priceChange,
      currentDeepBookPool?.vol24hDisplay,
      currentDeepBookPool?.high,
      currentDeepBookPool?.low,
      vol24hUsdDisplay,
      isApp
    ]
  )

  /* --------------------------- PC 端布局 --------------------------- */
  const desktopLayout = useMemo(
    () => (
      <HStack w="100%" h="100%" gap="12px" display={{ base: 'none', lg: 'flex' }}>
        <HStack gap="28px" flex="1">
          <ManagePool key="manage-pool-stable" isStuck={isStuck} />
          {/* <Box h="32px" w="1px" bg="border" /> */}

          <PriceDisplay priceDisplay={formatNumber(spread)} priceUsd={priceUsd} isLoading={isLoading} isApp={isApp} />
          {/* arrow left? */}
          <HStack gap="0" flex="1">
            {smallScreen && !scrollPosition.isAtLeft && (
              <Box pr="10px">
                <ScrollArrow direction="left" onClick={() => handleScroll('left')} />
              </Box>
            )}

            <Box
              ref={scrollContainerRef}
              sx={{
                ...(smallScreen && {
                  maxW: `${scrollContainerMaxW - (smallScreen && !scrollPosition.isAtLeft ? 26 : 0) - (smallScreen && !scrollPosition.isAtRight ? 16 : 0) + 20}px`,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  '&::-webkit-scrollbar': { display: 'none' },
                  display: 'flex',
                  alignItems: 'center'
                })
              }}
            >
              <HStack gap="28px" minW="max-content">
                <VStack align="flex-start" gap="12px">
                  <Text fontSize="12px" whiteSpace="nowrap" fontWeight="500">
                    24h Change
                  </Text>
                  <PriceChange priceChange={currentDeepBookPool?.priceChange} isLoading={isLoading} />
                </VStack>

                <VolumeDisplay
                  vol24hDisplay={currentDeepBookPool?.vol24hDisplay}
                  vol24hUsdDisplay={vol24hUsdDisplay}
                  baseSymbol={baseSymbol}
                  quoteSymbol={quoteSymbol}
                  isLoading={isLoading}
                  isApp={isApp}
                />

                <HighLowDisplay
                  high={currentDeepBookPool?.high}
                  low={currentDeepBookPool?.low}
                  quoteSymbol={quoteSymbol}
                  isLoading={isLoading}
                  isApp={isApp}
                />

                {currentDeepBookPool?.isMarginPool && (
                  <BorrowRateDisplay
                    baseAssets={baseAssets}
                    quoteAssets={quoteAssets}
                    currentDeepBookPool={currentDeepBookPool}
                    baseLabels={baseLabels}
                    quoteLabels={quoteLabels}
                  ></BorrowRateDisplay>
                )}

                {/* {currentDeepBookPool?.isMarginPool && <BorrowRate currentDeepBookPool={currentDeepBookPool} />} */}
              </HStack>
            </Box>
            {smallScreen && !scrollPosition.isAtRight && <ScrollArrow direction="right" onClick={() => handleScroll('right')} />}
          </HStack>
        </HStack>

        {/* <DetailsButton onClick={() => setIsOpenDetails(true)} isLoading={isLoading} isApp={isApp} /> */}
      </HStack>
    ),
    [
      spread,
      priceUsd,
      baseSymbol,
      quoteSymbol,
      isLoading,
      currentDeepBookPool?.priceChange,
      currentDeepBookPool?.vol24hDisplay,
      currentDeepBookPool?.high,
      currentDeepBookPool?.low,
      vol24hUsdDisplay,
      isApp,
      isStuck,
      smallScreen,
      scrollPosition,
      scrollContainerMaxW,
      handleScroll,
      currentDeepBookPool?.isMarginPool
    ]
  )

  /* --------------------------------------------------------------------- */
  return (
    <Block
      className="top-data-block"
      borderRadius={{ base: '0px', lg: '8px' }}
      border="none"
      maxHeight="100%"
      h={{ base: 'auto', lg: '56px' }}
      p={{ base: '8px 12px 12px', lg: '0 12px' }}
      bg={'bg_secondary'}
      sx={{
        ...(isApp && {
          position: 'sticky',
          top: '48px',
          zIndex: '100',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
        })
      }}
    >
      {isApp ? mobileLayout : desktopLayout}
      {/* {isOpenDetails && (
        <MarketDetailsModal
          currentDeepBookPool={currentDeepBookPool}
          isOpen={isOpenDetails}
          onClose={() => setIsOpenDetails(false)}
          onCloseDetails={() => setIsOpenDetails(false)}
        />
      )} */}
    </Block>
  )
}
