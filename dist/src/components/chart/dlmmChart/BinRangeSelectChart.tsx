import RangeChartBarPlaceholder from '@/assets/images/dlmm_range_bar_placeholder.png'
// import { CetusTooltip } from '@cetus/design'
import { MaxBinRangeDisplayNum } from '@/config/dlmm'
import { CurrentBinChartData, MaxBinRangeChartData } from '@/types/dlmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { SingleCoinImage } from '@cetus/ui-kit'
import { addComma, d, formatPercentage, formatPriceUseInDlmmAxis, textEllipses } from '@cetus/utils'
import { BinAmount } from '@cetusprotocol/dlmm-sdk'
import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Bar, BarChart, Customized, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const LeftColor = '#00D8B6'
const RightColor = '#4A9AEF'

function BinRangeSelectChart(props: {
  activeBin: number
  data: MaxBinRangeChartData
  width: number
  onChangeRange: (min: any, max: any) => void
  height?: number
  noToolTip?: boolean
  isSimple?: boolean
  minBinId?: number
  maxBinId?: number
  currentLiquidityBins?: CurrentBinChartData
  otherPosBinObj?: Record<string, BinAmount>
  maxBinLoading?: boolean
  tokenAPythPrice?: any
  tokenBPythPrice?: any
  type: 'liquidity' | 'position'
  direct?: boolean
  isReverse?: boolean
}) {
  const { minBinId, maxBinId, height, data } = props
  // ToLargeData
  const toLargeRange = useMemo(() => {
    if (minBinId !== undefined && maxBinId !== undefined) {
      return d(minBinId).minus(maxBinId).abs().gte(MaxBinRangeDisplayNum)
    }
    return false
  }, [minBinId, maxBinId])

  return (
    <Box as="div" p="0px" w={{ base: '100%', lg: `${props.width}px` }} h={`${props.height}px`} margin="0 auto" pos="relative" overflow="visible">
      {toLargeRange ? (
        <ToLargeData height={props.height ? props.height + 22 : 120} />
      ) : props?.data?.list?.length > 0 ? (
        <SelectChart {...props} />
      ) : (
        <NoData height={props.height ? props.height + 22 : 120} maxBinLoading={props.maxBinLoading || false} />
      )}
    </Box>
  )
}

// 自定义组件：绘制 poolPythPrice 的参考线
const PythPriceLine = memo((props: any) => {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringRef = useRef(false)
  const containerRef = useRef<SVGGElement | null>(null)
  const rectRef = useRef<SVGRectElement | null>(null) // 引用 rect 元素，用于原生事件监听
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null) // 用于检测滚动停止
  // 使用 ref 保存最新的处理函数，避免组件更新时事件监听器被移除和重新绑定
  const handleMouseEnterNativeRef = useRef<() => void>()
  const handleMouseLeaveNativeRef = useRef<() => void>()
  // 保存最新的鼠标位置，用于在组件更新后检查
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null)
  // 保存 onTooltipChange 的引用，用于检测外部调用
  const onTooltipChangeRef = useRef<
    | ((tooltipInfo: {
        show: boolean
        position: { x: number; y: number } | null
        content: { price: string; baseSymbol: string; quoteSymbol: string } | null
      }) => void)
    | undefined
  >()

  // Customized 组件会传递所有 props，包括我们自定义的
  const poolPythPrice = props.poolPythPrice
  const data = props.data
  const { xAxisMap, width, height, margin } = props
  const onTooltipChange = props.onTooltipChange // 回调函数，通知父组件 tooltip 状态

  // 保存 onTooltipChange 到 ref，用于检测外部调用
  useEffect(() => {
    onTooltipChangeRef.current = onTooltipChange
  }, [onTooltipChange])

  if (!poolPythPrice || !data || data.length === 0) {
    return null
  }

  // 找到 poolPythPrice 应该插入的位置（通过插值计算索引）
  const prices = data
    .map((item: any) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
      return Number(price) || 0
    })
    .filter((p: number) => p > 0)

  if (prices.length === 0) {
    return null
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  // 获取 token 信息（从第一个数据项获取）
  const firstItem = data[0]
  const baseSymbol = firstItem?.baseSymbol || ''
  const quoteSymbol = firstItem?.quoteSymbol || ''

  // 尝试获取 XAxis 的配置
  const xAxis = xAxisMap?.[0]
  let lineXPosition: number = 0 // 虚线的 x 位置
  let iconXPosition: number = 0 // icon 的 x 位置（确保在可见区域内）
  let lineY1: number = 0
  let lineY2: number = 0
  let isLeftBoundary = false
  let isRightBoundary = false

  // 判断是否在边界
  if (poolPythPrice < minPrice) {
    isLeftBoundary = true
  } else if (poolPythPrice > maxPrice) {
    isRightBoundary = true
  }

  // Icon 的位置（在标记线顶端的上面）
  const iconSize = 16
  const iconRadius = iconSize / 2
  const iconPadding = iconRadius + 4 // icon 距离边缘的最小距离
  // icon 在标记线顶部上方，确保在可见区域内
  const lineTop = margin?.top || 0
  // icon 中心位置：放在标记线顶部上方，icon 底部距离标记线顶部 4px
  // icon 中心 = lineTop - iconRadius - 4，这样 icon 底部在 lineTop - 4，icon 顶部在 lineTop - iconSize - 4
  // 如果计算出的 icon 顶部会超出可见区域（< 0），则至少放在距离顶部 iconSize 的位置
  const idealIconY = lineTop - iconRadius - 4
  const minIconY = iconSize // icon 中心至少距离顶部 iconSize，确保 icon 顶部至少距离顶部 0
  // const iconY = Math.max(minIconY, idealIconY) // 取较大值，确保 icon 在标记线顶部上方且可见
  const iconY = -4

  if (xAxis && xAxis.range) {
    // 使用 XAxis 的 range 和 scale 来计算位置
    const [xStart, xEnd] = xAxis.range
    const xAxisWidth = xEnd - xStart

    // 尝试使用 scale 函数（如果可用）来正确计算位置
    let calculatedXPosition: number | null = null
    if (xAxis.scale && typeof xAxis.scale === 'function') {
      try {
        // 使用 scale 函数将价格值转换为像素位置
        calculatedXPosition = xAxis.scale(poolPythPrice)
        // scale 函数返回的位置可能不在 range 内，需要检查
        if (calculatedXPosition !== null && calculatedXPosition !== undefined && !isNaN(calculatedXPosition)) {
          // 如果 scale 返回的位置在有效范围内，使用它
          if (calculatedXPosition >= xStart && calculatedXPosition <= xEnd) {
            lineXPosition = calculatedXPosition
            iconXPosition = calculatedXPosition
          } else if (calculatedXPosition < xStart) {
            isLeftBoundary = true
          } else if (calculatedXPosition > xEnd) {
            isRightBoundary = true
          }
        }
      } catch (error) {
        // 如果 scale 函数调用失败，回退到手动计算
        calculatedXPosition = null
      }
    }

    // 如果没有使用 scale 函数或 scale 函数不可用，使用手动计算
    if (calculatedXPosition === null) {
      if (isLeftBoundary) {
        // 最左侧：虚线到边缘，icon 在线上方，上下居中
        lineXPosition = xStart
        iconXPosition = lineXPosition // icon 中心与标记线对齐，上下居中
      } else if (isRightBoundary) {
        // 最右侧：虚线到边缘，icon 在线上方，上下居中
        lineXPosition = xEnd
        iconXPosition = lineXPosition // icon 中心与标记线对齐，上下居中
      } else {
        // 正常情况：使用线性插值计算精确位置
        // 首先检查是否有完全匹配的 bin
        let exactMatchIndex = -1
        for (let i = 0; i < data.length; i++) {
          const price = Number(data[i]?.price) || 0
          if (Math.abs(price - poolPythPrice) < 1e-10) {
            // 使用小的误差范围来比较浮点数
            exactMatchIndex = i
            break
          }
        }

        if (exactMatchIndex >= 0) {
          // 如果找到完全匹配的 bin，直接使用该 bin 的位置
          const dataPointWidth = xAxisWidth / data.length
          lineXPosition = xStart + exactMatchIndex * dataPointWidth + dataPointWidth / 2
          iconXPosition = lineXPosition
        } else {
          // 否则，找到 pyth 价格所在的两个 bin（前一个和后一个）
          let lowerIndex = -1
          let upperIndex = -1

          for (let i = 0; i < data.length - 1; i++) {
            const currentPrice = Number(data[i]?.price) || 0
            const nextPrice = Number(data[i + 1]?.price) || 0

            if (poolPythPrice >= currentPrice && poolPythPrice <= nextPrice) {
              lowerIndex = i
              upperIndex = i + 1
              break
            }
          }

          // 如果找到了区间，使用线性插值
          if (lowerIndex >= 0 && upperIndex >= 0) {
            const lowerPrice = Number(data[lowerIndex]?.price) || 0
            const upperPrice = Number(data[upperIndex]?.price) || 0
            const priceRange = upperPrice - lowerPrice

            // 计算插值比例
            const t = priceRange > 0 ? (poolPythPrice - lowerPrice) / priceRange : 0

            // 计算每个 bin 的宽度
            const dataPointWidth = xAxisWidth / data.length

            // 计算下界和上界的位置（bin 的中心位置）
            const lowerX = xStart + lowerIndex * dataPointWidth + dataPointWidth / 2
            const upperX = xStart + upperIndex * dataPointWidth + dataPointWidth / 2

            // 使用线性插值计算精确位置
            lineXPosition = lowerX + (upperX - lowerX) * t
            iconXPosition = lineXPosition
          } else {
            // 如果没找到区间（可能数据有问题），回退到找最接近的 bin
            let closestIndex = 0
            let minDiff = Math.abs(Number(data[0]?.price) - poolPythPrice)

            for (let i = 1; i < data.length; i++) {
              const price = Number(data[i]?.price)
              const diff = Math.abs(price - poolPythPrice)
              if (diff < minDiff) {
                minDiff = diff
                closestIndex = i
              }
            }

            const dataPointWidth = xAxisWidth / data.length
            lineXPosition = xStart + closestIndex * dataPointWidth + dataPointWidth / 2
            iconXPosition = lineXPosition
          }
        }
      }
    }

    lineY1 = margin?.top || 0
    lineY2 = height - (margin?.bottom || 0) - 30
  } else {
    // 如果没有 XAxis 配置，使用 width 和 margin 来计算
    const leftMargin = margin?.left || 0
    const rightMargin = margin?.right || 0
    const chartContentWidth = width - leftMargin - rightMargin

    if (isLeftBoundary) {
      // 最左侧：虚线到边缘，icon 在线上方，上下居中
      lineXPosition = leftMargin + 2
      iconXPosition = lineXPosition + 13 // icon 中心与标记线对齐，上下居中
    } else if (isRightBoundary) {
      // 最右侧：虚线到边缘，icon 在线上方，上下居中
      lineXPosition = leftMargin + chartContentWidth - 2
      iconXPosition = lineXPosition - 16 // icon 中心与标记线对齐，上下居中
    } else {
      // 正常情况：使用线性插值计算精确位置
      // 首先检查是否有完全匹配的 bin
      let exactMatchIndex = -1
      for (let i = 0; i < data.length; i++) {
        const price = Number(data[i]?.price) || 0
        if (Math.abs(price - poolPythPrice) < 1e-10) {
          // 使用小的误差范围来比较浮点数
          exactMatchIndex = i
          break
        }
      }

      if (exactMatchIndex >= 0) {
        // 如果找到完全匹配的 bin，直接使用该 bin 的位置
        const dataPointWidth = chartContentWidth / data.length
        lineXPosition = leftMargin + exactMatchIndex * dataPointWidth + dataPointWidth / 2
        iconXPosition = lineXPosition
      } else {
        // 否则，找到 pyth 价格所在的两个 bin（前一个和后一个）
        let lowerIndex = -1
        let upperIndex = -1

        for (let i = 0; i < data.length - 1; i++) {
          const currentPrice = Number(data[i]?.price) || 0
          const nextPrice = Number(data[i + 1]?.price) || 0

          if (poolPythPrice >= currentPrice && poolPythPrice <= nextPrice) {
            lowerIndex = i
            upperIndex = i + 1
            break
          }
        }

        // 如果找到了区间，使用线性插值
        if (lowerIndex >= 0 && upperIndex >= 0) {
          const lowerPrice = Number(data[lowerIndex]?.price) || 0
          const upperPrice = Number(data[upperIndex]?.price) || 0
          const priceRange = upperPrice - lowerPrice

          // 计算插值比例
          const t = priceRange > 0 ? (poolPythPrice - lowerPrice) / priceRange : 0

          // 计算每个 bin 的宽度
          const dataPointWidth = chartContentWidth / data.length

          // 计算下界和上界的位置（bin 的中心位置）
          const lowerX = leftMargin + lowerIndex * dataPointWidth + dataPointWidth / 2
          const upperX = leftMargin + upperIndex * dataPointWidth + dataPointWidth / 2

          // 使用线性插值计算精确位置
          lineXPosition = lowerX + (upperX - lowerX) * t
          iconXPosition = lineXPosition
        } else {
          // 如果没找到区间（可能数据有问题），回退到找最接近的 bin
          let closestIndex = 0
          let minDiff = Math.abs(Number(data[0]?.price) - poolPythPrice)

          for (let i = 1; i < data.length; i++) {
            const price = Number(data[i]?.price)
            const diff = Math.abs(price - poolPythPrice)
            if (diff < minDiff) {
              minDiff = diff
              closestIndex = i
            }
          }

          const dataPointWidth = chartContentWidth / data.length
          lineXPosition = leftMargin + closestIndex * dataPointWidth + dataPointWidth / 2
          iconXPosition = lineXPosition
        }
      }
    }

    lineY1 = margin?.top || 0
    lineY2 = height - (margin?.bottom || 0) - 30
  }

  // 计算 tooltip 的位置（相对于图表容器）
  // 参考 recharts tooltip 的行为：优先居中，边界时对齐到图表边界
  const calculateTooltipPosition = useCallback(() => {
    if (!containerRef.current) {
      return null
    }

    const tooltipWidth = 230
    const tooltipPadding = 8

    // 获取 SVG 容器
    const svgElement = containerRef.current.closest('svg')
    if (!svgElement) return null

    // 获取图表容器（Box 元素）
    const chartContainer = svgElement.closest('[data-chart-container]') || svgElement.parentElement
    if (!chartContainer) return null

    const svgRect = svgElement.getBoundingClientRect()
    const chartRect = (chartContainer as HTMLElement).getBoundingClientRect()

    // 计算 icon 在视口中的位置
    const iconAbsoluteX = svgRect.left + iconXPosition
    const iconAbsoluteY = svgRect.top + iconY

    // 计算 icon 相对于图表容器的位置
    const iconRelativeX = iconAbsoluteX - chartRect.left
    const iconRelativeY = iconAbsoluteY - chartRect.top

    // 获取图表展示区域的边界（相对于图表容器）
    const chartLeft = 0
    const chartRight = chartRect.width
    const chartWidth = chartRect.width

    // 优先尝试居中显示（tooltip 中心对齐到 icon 中心）
    let tooltipX = iconRelativeX - tooltipWidth / 2
    const tooltipY = iconRelativeY - 40 - 30

    // 计算 tooltip 的左右边界
    const tooltipLeft = tooltipX
    const tooltipRight = tooltipX + tooltipWidth

    // 检查左边界：如果 tooltip 左边超出图表区域，则左对齐到图表边界
    if (tooltipLeft < chartLeft + tooltipPadding) {
      tooltipX = chartLeft + tooltipPadding
    }
    // 检查右边界：如果 tooltip 右边超出图表区域，则右对齐到图表边界
    else if (tooltipRight > chartRight - tooltipPadding) {
      tooltipX = chartRight - tooltipWidth - tooltipPadding
    }

    // 如果 tooltip 宽度超过图表宽度，至少保证左边不超出
    if (tooltipWidth > chartWidth - tooltipPadding * 2) {
      tooltipX = chartLeft + tooltipPadding
    }

    // 最终检查：确保 tooltip 在图表区域内
    tooltipX = Math.max(chartLeft + tooltipPadding, Math.min(tooltipX, chartRight - tooltipWidth - tooltipPadding))

    return { x: tooltipX, y: tooltipY }
  }, [iconXPosition, iconY])

  // 检测是否是移动设备
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia('(max-width: 768px)').matches)
    )
  }, [])

  // 使用 ref 跟踪状态，避免快速连续调用导致的状态覆盖
  const pythIconIsHoverRef = useRef(false)
  // 标志：是否正在内部更新状态（避免在 wrappedOnTooltipChange 中重复更新）
  const isInternalUpdateRef = useRef(false)

  // 包装 onTooltipChange，当 tooltip 被外部隐藏时，重置 isHoveringRef
  // 这确保点击外部隐藏 tooltip 后，鼠标再次移入时能正常显示
  const wrappedOnTooltipChange = useCallback(
    (tooltipInfo: {
      show: boolean
      position: { x: number; y: number } | null
      content: { price: string; baseSymbol: string; quoteSymbol: string } | null
    }) => {
      // 如果 tooltip 被隐藏，重置悬停状态
      if (!tooltipInfo.show) {
        isHoveringRef.current = false
      }

      // 调用原始的 onTooltipChange
      if (onTooltipChange) {
        onTooltipChange(tooltipInfo)
      }
    },
    [onTooltipChange]
  )

  // 显示 tooltip 的通用函数
  const showTooltip = useCallback(() => {
    if (!wrappedOnTooltipChange || !data || data.length === 0) {
      return
    }

    // 计算位置
    const position = calculateTooltipPosition()
    if (!position) {
      return
    }

    // 准备内容
    const firstItem = data[0]
    const baseSymbol = firstItem?.baseSymbol || ''
    const quoteSymbol = firstItem?.quoteSymbol || ''
    const formattedPrice = formatPriceUseInDlmmAxis(poolPythPrice.toString())

    // 标记为内部更新
    isInternalUpdateRef.current = true

    // 通知父组件显示 tooltip
    wrappedOnTooltipChange({
      show: true,
      position,
      content: {
        price: formattedPrice,
        baseSymbol,
        quoteSymbol
      }
    })

    // 重置标志
    isInternalUpdateRef.current = false
  }, [wrappedOnTooltipChange, data, poolPythPrice, calculateTooltipPosition])

  // 隐藏 tooltip 的通用函数
  const hideTooltip = useCallback(() => {
    // 重置悬停状态
    isHoveringRef.current = false

    // 标记为内部更新
    isInternalUpdateRef.current = true

    if (wrappedOnTooltipChange) {
      wrappedOnTooltipChange({
        show: false,
        position: null,
        content: null
      })
    }

    // 重置标志
    isInternalUpdateRef.current = false
  }, [wrappedOnTooltipChange])

  // 检查鼠标是否在 rect 元素上
  const checkMouseOverRect = useCallback(() => {
    if (isMobile || !rectRef.current) {
      return false
    }

    const rectElement = rectRef.current
    const rect = rectElement.getBoundingClientRect()

    // 获取当前鼠标位置（从全局事件中获取）
    // 注意：这个方法需要在鼠标移动事件中调用
    return false // 默认返回 false，实际检查在鼠标移动监听器中完成
  }, [isMobile])

  // 检查鼠标是否在 rect 元素上的辅助函数（使用坐标）
  const isMouseOverRect = useCallback(
    (mouseX: number, mouseY: number) => {
      if (isMobile || !rectRef.current) {
        return false
      }

      const rectElement = rectRef.current
      const rect = rectElement.getBoundingClientRect()

      return mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom
    },
    [isMobile]
  )

  // PC: 处理鼠标移入事件（用于原生事件监听器）
  const handleMouseEnterNative = useCallback(() => {
    if (isMobile) return // 移动设备不使用鼠标事件

    // 清除任何待执行的隐藏定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    isHoveringRef.current = true
    showTooltip()
  }, [isMobile, showTooltip])

  // PC: 处理鼠标移出事件（用于原生事件监听器）
  const handleMouseLeaveNative = useCallback(() => {
    if (isMobile) return // 移动设备不使用鼠标事件

    // 立即标记为不悬停
    isHoveringRef.current = false

    // 清除任何待执行的隐藏定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    // 立即隐藏 tooltip，不需要延迟
    // 因为 tooltip 是渲染在 body 上的，鼠标移出 rect 时就应该立即隐藏
    hideTooltip()
  }, [isMobile, hideTooltip])

  // 每次渲染时更新 ref 中的函数，确保事件监听器始终使用最新的函数
  useEffect(() => {
    handleMouseEnterNativeRef.current = handleMouseEnterNative
    handleMouseLeaveNativeRef.current = handleMouseLeaveNative
  }, [handleMouseEnterNative, handleMouseLeaveNative])

  // 提供重置函数，供外部调用（当 tooltip 被外部隐藏时）
  const resetHoveringState = useCallback(() => {
    isHoveringRef.current = false
  }, [])

  // 将重置函数传递给父组件
  useEffect(() => {
    if (props.onResetHoveringState) {
      props.onResetHoveringState(resetHoveringState)
    }
  }, [props.onResetHoveringState, resetHoveringState])

  // PC: 处理鼠标移入事件（用于 React 合成事件，作为备用）
  const handleMouseEnter = useCallback(() => {
    handleMouseEnterNative()
  }, [handleMouseEnterNative])

  // PC: 处理鼠标移出事件（用于 React 合成事件，作为备用）
  const handleMouseLeave = useCallback(() => {
    handleMouseLeaveNative()
  }, [handleMouseLeaveNative])

  // PC: 处理鼠标移出事件（onMouseOut，作为额外备用）
  const handleMouseOut = useCallback(() => {
    handleMouseLeaveNative()
  }, [handleMouseLeaveNative])

  // H5: 处理点击事件 - 使用 onMouseDown 代替 onClick（SVG 中更可靠）
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isMobile) return // PC 设备不使用点击事件

      e.stopPropagation() // 阻止事件冒泡，避免触发外部点击隐藏
      e.preventDefault() // 阻止默认行为

      if (!onTooltipChange || !data || data.length === 0) {
        return
      }

      // 如果当前已显示，则隐藏；否则显示
      if (isHoveringRef.current) {
        isHoveringRef.current = false
        hideTooltip()
      } else {
        isHoveringRef.current = true
        showTooltip()
      }
    },
    [isMobile, onTooltipChange, data, showTooltip, hideTooltip]
  )

  // 保存上一次绑定的 rect 元素，用于检测变化
  const previousRectRef = useRef<SVGRectElement | null>(null)
  // 保存事件监听器的包装函数，用于清理
  const eventHandlersRef = useRef<{
    handleMouseEnterWrapper: () => void
    handleMouseLeaveWrapper: () => void
  } | null>(null)

  // 绑定事件监听器的函数
  const bindEventListeners = useCallback(() => {
    const rectElement = rectRef.current
    if (!rectElement || isMobile) {
      // 如果 rect 元素不存在，清理之前的事件监听器
      if (previousRectRef.current && eventHandlersRef.current) {
        previousRectRef.current.removeEventListener('mouseenter', eventHandlersRef.current.handleMouseEnterWrapper)
        previousRectRef.current.removeEventListener('mouseleave', eventHandlersRef.current.handleMouseLeaveWrapper)
        previousRectRef.current.removeEventListener('mouseout', eventHandlersRef.current.handleMouseLeaveWrapper)
        eventHandlersRef.current = null
        previousRectRef.current = null
      }
      return
    }

    // 如果 rect 元素变化了，先清理旧的事件监听器
    if (previousRectRef.current && previousRectRef.current !== rectElement && eventHandlersRef.current) {
      previousRectRef.current.removeEventListener('mouseenter', eventHandlersRef.current.handleMouseEnterWrapper)
      previousRectRef.current.removeEventListener('mouseleave', eventHandlersRef.current.handleMouseLeaveWrapper)
      previousRectRef.current.removeEventListener('mouseout', eventHandlersRef.current.handleMouseLeaveWrapper)
      eventHandlersRef.current = null
    }

    // 如果已经绑定过相同元素的事件监听器，不需要重复绑定
    if (previousRectRef.current === rectElement && eventHandlersRef.current) {
      return
    }

    // 创建稳定的包装函数，从 ref 中读取最新的处理函数
    const handleMouseEnterWrapper = () => {
      handleMouseEnterNativeRef.current?.()
    }
    const handleMouseLeaveWrapper = () => {
      handleMouseLeaveNativeRef.current?.()
    }

    // 保存包装函数和当前元素
    eventHandlersRef.current = {
      handleMouseEnterWrapper,
      handleMouseLeaveWrapper
    }
    previousRectRef.current = rectElement

    // 绑定原生事件监听器
    rectElement.addEventListener('mouseenter', handleMouseEnterWrapper)
    rectElement.addEventListener('mouseleave', handleMouseLeaveWrapper)
    rectElement.addEventListener('mouseout', handleMouseLeaveWrapper) // 备用方案
  }, [isMobile])

  // 使用原生 DOM 事件监听器，确保在组件更新时也能正常工作
  // 使用 ref 中的函数，避免因依赖变化导致事件监听器被移除和重新绑定
  useEffect(() => {
    bindEventListeners()

    // 清理函数
    return () => {
      const rectElement = rectRef.current
      if (rectElement && eventHandlersRef.current) {
        rectElement.removeEventListener('mouseenter', eventHandlersRef.current.handleMouseEnterWrapper)
        rectElement.removeEventListener('mouseleave', eventHandlersRef.current.handleMouseLeaveWrapper)
        rectElement.removeEventListener('mouseout', eventHandlersRef.current.handleMouseLeaveWrapper)
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      // 在清理时，如果 tooltip 正在显示，检查鼠标是否还在元素上
      // 如果不在，强制隐藏 tooltip（防止组件更新时鼠标已移出但事件丢失的情况）
      if (isHoveringRef.current && handleMouseLeaveNativeRef.current) {
        // 延迟一小段时间检查，确保 DOM 已经更新
        setTimeout(() => {
          const currentRect = rectRef.current
          if (currentRect && handleMouseLeaveNativeRef.current) {
            // 使用 document.elementFromPoint 检查鼠标位置下的元素
            // 注意：这个方法需要在鼠标移动事件中调用，这里只是作为备用
            handleMouseLeaveNativeRef.current()
          }
        }, 0)
      }
    }
  }, [isMobile, bindEventListeners])

  // 使用 useLayoutEffect 在 DOM 更新后立即检查 rectRef.current 是否变化
  // 这确保在组件重新渲染时，如果 rect 元素变化了，能及时重新绑定事件监听器
  useLayoutEffect(() => {
    if (!isMobile) {
      bindEventListeners()
    }
  })

  // 添加全局鼠标移动监听器，检查鼠标是否还在 rect 元素上
  // 用于处理组件更新时鼠标快速移出的情况
  useEffect(() => {
    if (isMobile) {
      return
    }

    let checkInterval: NodeJS.Timeout | null = null

    let animationFrameId: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      // 保存最新的鼠标位置
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY }

      // 如果 tooltip 正在显示，检查鼠标是否还在 rect 元素上
      if (isHoveringRef.current && rectRef.current) {
        const isOver = isMouseOverRect(e.clientX, e.clientY)
        if (!isOver) {
          // 鼠标不在元素上，但 tooltip 还在显示，说明事件丢失了，强制隐藏
          isHoveringRef.current = false
          handleMouseLeaveNativeRef.current?.()
          // 停止持续检查
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
          }
        } else if (!animationFrameId) {
          // 鼠标在元素上且 tooltip 显示，启动持续检查
          const checkMousePosition = () => {
            if (isHoveringRef.current && rectRef.current && lastMousePositionRef.current) {
              const stillOver = isMouseOverRect(lastMousePositionRef.current.x, lastMousePositionRef.current.y)
              if (!stillOver) {
                // 鼠标不在元素上，强制隐藏
                isHoveringRef.current = false
                handleMouseLeaveNativeRef.current?.()
                animationFrameId = null
              } else {
                // 继续检查
                animationFrameId = requestAnimationFrame(checkMousePosition)
              }
            } else {
              // tooltip 未显示，停止检查
              animationFrameId = null
            }
          }
          animationFrameId = requestAnimationFrame(checkMousePosition)
        }
      }
    }

    // 使用节流来减少检查频率，但降低到 16ms（约 60fps）以提高响应速度
    let lastCheckTime = 0
    const throttledHandleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastCheckTime > 16) {
        // 每 16ms 检查一次（约 60fps）
        lastCheckTime = now
        handleMouseMove(e)
      }
    }

    // 处理鼠标离开文档区域
    const handleMouseLeave = () => {
      if (isHoveringRef.current) {
        isHoveringRef.current = false
        handleMouseLeaveNativeRef.current?.()
      }
    }

    // 监听全局鼠标移动事件
    document.addEventListener('mousemove', throttledHandleMouseMove, true)
    // 监听鼠标离开文档区域
    document.addEventListener('mouseleave', handleMouseLeave, true)

    // 清理函数
    return () => {
      document.removeEventListener('mousemove', throttledHandleMouseMove, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isMobile, isMouseOverRect])

  // 在每次渲染后检查鼠标是否还在元素上
  // 用于处理组件更新时鼠标快速移出的情况
  useEffect(() => {
    if (isMobile || !isHoveringRef.current) {
      return
    }

    // 延迟一小段时间检查，确保 DOM 已经更新
    const checkTimeout = setTimeout(() => {
      if (lastMousePositionRef.current && rectRef.current) {
        const isOver = isMouseOverRect(lastMousePositionRef.current.x, lastMousePositionRef.current.y)
        if (!isOver) {
          // 鼠标不在元素上，但 tooltip 还在显示，说明事件丢失了，强制隐藏
          isHoveringRef.current = false
          handleMouseLeaveNativeRef.current?.()
        }
      }
    }, 10) // 延迟 10ms 检查

    return () => {
      clearTimeout(checkTimeout)
    }
  }) // 每次渲染后都检查

  // 监听窗口大小改变事件，当窗口大小改变时重新计算 tooltip 位置
  // 注意：由于 tooltip 现在是相对于图表容器定位的，页面滚动时不需要重新计算
  useEffect(() => {
    if (isMobile) {
      return
    }

    const handleResize = () => {
      // 如果 tooltip 正在显示，重新计算位置
      if (isHoveringRef.current) {
        const newPosition = calculateTooltipPosition()
        if (newPosition && onTooltipChange && data && data.length > 0) {
          // 重新计算内容
          const firstItem = data[0]
          const baseSymbol = firstItem?.baseSymbol || ''
          const quoteSymbol = firstItem?.quoteSymbol || ''
          const formattedPrice = formatPriceUseInDlmmAxis(poolPythPrice.toString())

          onTooltipChange({
            show: true,
            position: newPosition,
            content: {
              price: formattedPrice,
              baseSymbol,
              quoteSymbol
            }
          })
        }
      }
    }

    // 只监听窗口大小改变事件
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobile, calculateTooltipPosition, onTooltipChange, data, poolPythPrice])

  // 监听滚动事件，滚动时立即检查鼠标位置并隐藏 tooltip
  useEffect(() => {
    if (isMobile) {
      return
    }

    const handleScroll = () => {
      // 如果 tooltip 正在显示，立即检查鼠标是否还在元素上
      if (isHoveringRef.current && rectRef.current && lastMousePositionRef.current) {
        const isOver = isMouseOverRect(lastMousePositionRef.current.x, lastMousePositionRef.current.y)
        if (!isOver) {
          // 鼠标不在元素上，立即隐藏 tooltip
          isHoveringRef.current = false
          handleMouseLeaveNativeRef.current?.()
        } else {
          // 鼠标还在元素上，但滚动可能导致位置变化，清除之前的定时器
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current)
          }

          // 设置新的滚动停止定时器，滚动停止后再次检查
          scrollTimeoutRef.current = setTimeout(() => {
            if (isHoveringRef.current && rectRef.current && lastMousePositionRef.current) {
              const stillOver = isMouseOverRect(lastMousePositionRef.current.x, lastMousePositionRef.current.y)
              if (!stillOver) {
                isHoveringRef.current = false
                handleMouseLeaveNativeRef.current?.()
              }
            }
            scrollTimeoutRef.current = null
          }, 100) // 滚动停止 100ms 后再次检查
        }
      } else if (isHoveringRef.current) {
        // 如果没有鼠标位置信息，直接隐藏（可能是快速滚动导致）
        isHoveringRef.current = false
        handleMouseLeaveNativeRef.current?.()
      }
    }

    // 监听滚动事件（使用捕获阶段，确保能捕获所有滚动）
    window.addEventListener('scroll', handleScroll, true)
    // 也监听触摸滚动（移动端）
    window.addEventListener('touchmove', handleScroll, true)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('touchmove', handleScroll, true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isMobile, isMouseOverRect])

  // 监听全局点击事件，点击 pyth icon 以外的位置时隐藏 tooltip
  useEffect(() => {
    if (isMobile) {
      return // 移动设备已有自己的点击处理逻辑
    }

    const handleClick = (e: MouseEvent) => {
      // 如果 tooltip 未显示，不需要处理
      if (!isHoveringRef.current || !rectRef.current) {
        return
      }

      const target = e.target as Node | null
      if (!target) {
        return
      }

      const rectElement = rectRef.current

      // 方法1: 检查点击的目标是否在 rect 元素的 DOM 树中
      // 这可以处理点击 rect 的子元素（如 SVG 元素）的情况
      let isClickOnRectOrChild = false
      let currentNode: Node | null = target
      while (currentNode && currentNode !== document.body) {
        if (currentNode === rectElement) {
          isClickOnRectOrChild = true
          break
        }
        // 检查是否是 SVG 元素（rect 的父元素）
        if (currentNode.nodeName === 'g' || currentNode.nodeName === 'svg') {
          // 继续向上查找
        }
        currentNode = currentNode.parentNode
      }

      // 方法2: 如果方法1没找到，使用坐标检查
      // 这可以处理点击 rect 本身但事件目标不是 rect 的情况（如透明区域）
      if (!isClickOnRectOrChild) {
        try {
          const rect = rectElement.getBoundingClientRect()
          const clickX = e.clientX
          const clickY = e.clientY

          isClickOnRectOrChild = clickX >= rect.left && clickX <= rect.right && clickY >= rect.top && clickY <= rect.bottom
        } catch (error) {
          // 如果获取边界失败，假设不在 rect 上
          isClickOnRectOrChild = false
        }
      }

      // 如果点击不在 rect 元素或其子元素上，隐藏 tooltip
      if (!isClickOnRectOrChild) {
        isHoveringRef.current = false
        handleMouseLeaveNativeRef.current?.()
      }
    }

    // 使用捕获阶段，确保能捕获所有点击
    // 直接绑定，不使用延迟，确保能及时响应
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [isMobile])

  const pythIconIsHover = useMemo(() => {
    return props?.isHover
  }, [props?.isHover])

  return (
    <g ref={containerRef} style={{ overflow: 'visible' }}>
      {/* 白色虚线 */}
      <line
        x1={lineXPosition}
        y1={lineY1}
        x2={lineXPosition}
        y2={lineY2}
        stroke={pythIconIsHover ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
        strokeWidth={1}
        strokeDasharray="4 4"
        style={{ pointerEvents: 'none' }}
      />

      {/* Pyth 图标（圆形，带虚线边框） */}
      <g style={{ cursor: 'pointer', overflow: 'visible' }}>
        {/* 内圈实心圆 */}
        <circle
          cx={iconXPosition}
          cy={iconY}
          r={iconRadius}
          fill={pythIconIsHover ? '#6D28D9' : 'rgba(46,46,46,0.5)'}
          stroke={pythIconIsHover ? '#6D28D9' : 'rgba(109,109,109,0.5)'}
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
        {/* iconfont icon-pyth */}
        <svg
          x={iconXPosition - iconRadius}
          y={iconY - iconRadius}
          width={iconSize}
          height={iconSize}
          fill={pythIconIsHover ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
          style={{ overflow: 'visible', pointerEvents: 'none' }}
        >
          <use xlinkHref="#icon-pyth" />
        </svg>

        {
          // 左侧边界：箭头在 icon 左侧，朝左 <，icon 在右
          isLeftBoundary && (
            <svg
              x={iconXPosition - 18}
              y={iconY - 4}
              width={10}
              height={10}
              fill={pythIconIsHover ? '#6D6D6D' : 'rgba(109,109,109,0.5)'}
              style={{ overflow: 'visible', pointerEvents: 'none' }}
            >
              <use xlinkHref="#icon-icon_ascending" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center center' }} />
            </svg>
          )
        }

        {
          // 右侧边界：箭头在 icon 右侧，朝右 >
          isRightBoundary && (
            <svg
              x={iconXPosition + 10}
              y={iconY - 4}
              width={10}
              height={10}
              fill={pythIconIsHover ? '#6D6D6D' : 'rgba(109,109,109,0.5)'}
              style={{ overflow: 'visible', pointerEvents: 'none' }}
            >
              <use xlinkHref="#icon-icon_ascending" style={{ transform: 'rotate(90deg)', transformOrigin: 'center center' }} />
            </svg>
          )
        }

        {/* 透明覆盖层 - PC 上捕获鼠标事件，H5 上捕获点击事件 */}
        {/* 使用原生 DOM 事件监听器确保在组件更新时也能正常工作 */}
        <rect
          ref={rectRef}
          x={isLeftBoundary ? 0 : iconXPosition - iconRadius}
          y={iconY - iconRadius}
          width={isRightBoundary ? iconSize + 10 : isLeftBoundary ? iconSize + 10 : iconSize}
          height={iconSize}
          fill="transparent"
          // fill="red"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseOut={handleMouseOut}
          onMouseDown={handleMouseDown}
          style={{ pointerEvents: 'all', cursor: 'pointer' }}
        />
      </g>
    </g>
  )
})

function SelectChart({
  activeBin,
  data,
  width,
  onChangeRange,
  height = 120,
  noToolTip,
  isSimple,
  minBinId,
  maxBinId,
  currentLiquidityBins,
  otherPosBinObj,
  isReverse = false,
  direct,
  type,
  tokenAPythPrice,
  tokenBPythPrice
}: {
  activeBin: number
  data: MaxBinRangeChartData
  width: number
  onChangeRange: (min: any, max: any) => void
  height?: number
  noToolTip?: boolean
  isSimple?: boolean
  minBinId?: number
  maxBinId?: number
  isReverse?: boolean
  direct?: boolean
  currentLiquidityBins?: CurrentBinChartData
  otherPosBinObj?: Record<string, BinAmount>
  type: 'liquidity' | 'position'
  tokenAPythPrice?: any
  tokenBPythPrice?: any
}) {
  const { isApp } = useWindowWidth()
  const [range, setRange] = useState<[number, number]>([0, 0])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [pythTooltip, setPythTooltip] = useState<{
    show: boolean
    position: { x: number; y: number } | null
    content: { price: string; baseSymbol: string; quoteSymbol: string } | null
  }>({ show: false, position: null, content: null })
  const lockedTooltipRef = useRef<{
    position: { x: number; y: number }
    content: { price: string; baseSymbol: string; quoteSymbol: string }
  } | null>(null)
  const tooltipElementRef = useRef<HTMLDivElement | null>(null)
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const maxBinRangeData = data?.list

  // 检测是否是移动设备
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia('(max-width: 768px)').matches)
    )
  }, [])

  const poolPythPrice = useMemo(() => {
    if (!tokenAPythPrice || !tokenBPythPrice) return undefined

    if (direct) {
      return tokenAPythPrice / tokenBPythPrice
    } else {
      return tokenBPythPrice / tokenAPythPrice
    }
  }, [tokenAPythPrice, tokenBPythPrice, direct])

  // 保存 PythPriceLine 的重置函数引用
  const pythPriceLineResetRef = useRef<(() => void) | null>(null)

  // 处理 tooltip 状态变化 - 锁定位置避免闪烁
  const handleTooltipChange = useCallback(
    (tooltipInfo: {
      show: boolean
      position: { x: number; y: number } | null
      content: { price: string; baseSymbol: string; quoteSymbol: string } | null
    }) => {
      if (tooltipInfo.show && tooltipInfo.position && tooltipInfo.content) {
        // 锁定位置和内容，避免图表更新时重新计算
        lockedTooltipRef.current = {
          position: tooltipInfo.position,
          content: tooltipInfo.content
        }
        setPythTooltip({
          show: true,
          position: tooltipInfo.position,
          content: tooltipInfo.content
        })
      } else {
        // 清除锁定
        lockedTooltipRef.current = null
        setPythTooltip({
          show: false,
          position: null,
          content: null
        })
        // 通知 PythPriceLine 重置状态
        if (pythPriceLineResetRef.current) {
          pythPriceLineResetRef.current()
        }
      }
    },
    []
  )

  // 监听点击外部区域，隐藏 tooltip（移动设备和 PC 都适用）
  useEffect(() => {
    if (!pythTooltip.show) {
      return
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null

      // 检查点击是否在 tooltip 内
      if (tooltipElementRef.current && tooltipElementRef.current.contains(target)) {
        return
      }

      // 检查点击是否在 pyth icon 上（通过查找图表容器内的 rect 元素）
      if (chartContainerRef.current) {
        const clickX = e.clientX
        const clickY = e.clientY

        // 查找图表容器内的所有 rect 元素（pyth icon 的透明覆盖层）
        const svgElement = chartContainerRef.current.querySelector('svg')
        if (svgElement) {
          const rects = svgElement.querySelectorAll('rect')
          for (let i = 0; i < rects.length; i++) {
            const rect = rects[i]

            // 检查这个 rect 是否有 pointerEvents: 'all'（pyth icon 的覆盖层）
            const style = window.getComputedStyle(rect)
            if (style.pointerEvents === 'all' || style.pointerEvents === 'auto') {
              try {
                const rectBounds = rect.getBoundingClientRect()

                // 检查点击是否在这个 rect 的边界内
                if (clickX >= rectBounds.left && clickX <= rectBounds.right && clickY >= rectBounds.top && clickY <= rectBounds.bottom) {
                  // 点击在 pyth icon 上，不隐藏 tooltip
                  return
                }
              } catch (error) {
                // 如果获取边界失败，跳过这个 rect，继续检查下一个
              }
            }
          }
        }
      }

      // 点击在外部，隐藏 tooltip
      handleTooltipChange({
        show: false,
        position: null,
        content: null
      })
    }

    // 使用捕获阶段，但延迟执行，让其他点击处理先处理
    // 这样如果点击 pyth icon，其他处理可能会阻止冒泡
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [pythTooltip.show, handleTooltipChange])

  // const marks = useMemo(() => {
  //   if (!maxBinRangeData || maxBinRangeData.length === 0) return {}

  //   const totalBins = maxBinRangeData.length
  //   const result: Record<number, string> = {}

  //   if (totalBins <= 8) {
  //     // 小于等于8个时：第一个刻度是第二个，最后一个刻度是倒数第二个，中间每个都展示
  //     for (let i = 1; i < totalBins - 1; i++) {
  //       result[i] = formatPriceUseInDlmmAxis(removeComma(maxBinRangeData[i].price))
  //     }
  //   } else {
  //     // 大于8个时：尽量保持一共有6个刻度，避免边缘展示
  //     const targetMarks = 6

  //     // 根据数组长度决定起始位置，避免贴边
  //     const startOffset = Math.floor(totalBins / 8) // 根据数组长度动态计算偏移
  //     const startIndex = Math.max(1, startOffset) // 至少从第二个开始
  //     const endIndex = totalBins - 1 - startOffset // 对应的结束位置

  //     // 在有效范围内等分分布6个刻度
  //     const step = (endIndex - startIndex) / (targetMarks - 1)

  //     for (let i = 0; i < targetMarks; i++) {
  //       const index = Math.round(startIndex + i * step)
  //       // 确保索引在安全范围内
  //       const safeIndex = Math.max(startIndex, Math.min(index, endIndex))
  //       result[safeIndex] = formatPriceUseInDlmmAxis(removeComma(maxBinRangeData[safeIndex].price))
  //     }
  //   }

  //   console.log('🚀 ~ SelectChart ~ result:', result)

  //   return result
  // }, [maxBinRangeData])

  const handleChangeComplete = useCallback(
    (value: any) => {
      if (!maxBinRangeData || maxBinRangeData.length === 0) return

      const minBin = maxBinRangeData[value[0]]?.bin_id
      const maxBin = maxBinRangeData[value[1]]?.bin_id

      if (minBin !== undefined && maxBin !== undefined) {
        if (d(maxBin).gte(minBin)) {
          onChangeRange(minBin, maxBin)
        } else {
          onChangeRange(maxBin, minBin)
        }
      }
    },
    [maxBinRangeData, onChangeRange]
  )

  useEffect(() => {
    if (minBinId !== undefined && maxBinId !== undefined && maxBinRangeData && maxBinRangeData?.length > 0) {
      const direct = maxBinRangeData?.[0]?.bin_id < maxBinRangeData?.[maxBinRangeData?.length - 1]?.bin_id
      const minIndex = maxBinRangeData.findIndex(item => item.bin_id === minBinId)
      const maxIndex = maxBinRangeData.findIndex(item => item.bin_id === maxBinId)
      const min = minIndex === -1 ? (direct ? 0 : maxBinRangeData.length - 1) : minIndex
      const max = maxIndex === -1 ? (direct ? maxBinRangeData.length - 1 : 0) : maxIndex
      setRange([Math.min(min, max), Math.max(min, max)])
    } else {
      if (isSimple) {
        setRange([0, maxBinRangeData?.length - 1])
      }
    }
  }, [minBinId, maxBinId, maxBinRangeData, isSimple])

  const currentLiquidityBinsObj = useMemo(() => {
    if (currentLiquidityBins && currentLiquidityBins?.list?.length > 0) {
      return Object.fromEntries(currentLiquidityBins?.list?.map((item: any) => [item?.bin_id, item]))
    }
    return {}
  }, [currentLiquidityBins])

  const BarShape = useMemo(() => {
    return maxBinRangeData?.length > 120 ? 'rect' : 'path'
  }, [maxBinRangeData?.length])

  // 自定义柱子渲染函数
  const renderCustomBar = useCallback(
    (props: any) => {
      const { x, y, width, height: barHeight, index, payload } = props

      // 判断各种状态
      const isInRange = range[0] <= range[1] ? index >= range[0] && index <= range[1] : index >= range[1] && index <= range[0]

      const isActiveBin = payload?.bin_id === activeBin
      const isHovered = index === hoveredIndex

      // 计算柱子实际高度
      const actualBarHeight = Math.max(0, barHeight)

      // 确定填充颜色
      let fill = '#222C35' // 默认颜色

      if (isInRange) {
        fill = '#354F62' // 选中区间颜色
      }

      if (isActiveBin) {
        fill = '#568BB0' // 当前bin颜色
      }

      if (isHovered) {
        fill = '#76C8FF' // hover颜色
      }

      // 顶部圆角半径
      const radius = 3

      return (
        <g>
          {/* 1. 实际柱子部分 */}
          {BarShape === 'rect' || actualBarHeight < 1 ? (
            <rect x={x} y={isNaN(y) ? 0 : y} width={width} height={actualBarHeight} fill={fill} />
          ) : (
            <path
              d={`
            M${x},${y + actualBarHeight}
            L${x},${y + radius}
            Q${x},${y} ${x + radius},${y}
            L${x + width - radius},${y}
            Q${x + width},${y} ${x + width},${y + radius}
            L${x + width},${y + actualBarHeight}
            Z
          `}
              fill={fill}
            />
          )}

          {/* 2. 透明覆盖层 - 用于hover事件 */}
          <rect
            x={x}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ cursor: 'pointer' }}
          />
        </g>
      )
    },
    [range, activeBin, hoveredIndex, height, BarShape]
  )

  const CustomTooltip = useCallback(
    ({ active, payload, coordinate }: any) => {
      if (!active) return null
      const item = payload?.[0]?.payload

      const currentLiquidityItem = currentLiquidityBinsObj?.[item?.bin_id]
      const otherPosBinItem = otherPosBinObj?.[item?.bin_id]

      let beforeBaseAmount = type === 'liquidity' ? otherPosBinItem?.amount_a || '0' : currentLiquidityItem?.baseAmount || '0'
      let beforeQuoteAmount = type === 'liquidity' ? otherPosBinItem?.amount_b || '0' : currentLiquidityItem?.quoteAmount || '0'

      const yourLiquidityBaseAmountPercent = !Number(beforeBaseAmount)
        ? '0%'
        : !Number(item?.baseAmount || '0')
          ? '100%'
          : formatPercentage(d(beforeBaseAmount).lt(item?.baseAmount) ? d(beforeBaseAmount).div(item?.baseAmount).mul(100).toString() : '100', 2)

      const yourLiquidityQuoteAmountPercent = !Number(beforeQuoteAmount)
        ? '0%'
        : !Number(item?.quoteAmount || '0')
          ? '100%'
          : formatPercentage(d(beforeQuoteAmount).lt(item?.quoteAmount) ? d(beforeQuoteAmount).div(item?.quoteAmount).mul(100).toString() : '100', 2)

      const isLeft = activeBin <= item?.bin_id
      const isRight = activeBin >= item?.bin_id

      const inPositionHaveLiquidity =
        (!!currentLiquidityItem?.newBins && currentLiquidityItem?.newBins?.liquidity && currentLiquidityItem?.newBins?.liquidity !== '0') ||
        (type === 'liquidity' && (+currentLiquidityItem?.baseAmount || +currentLiquidityItem?.quoteAmount))
      let yourNewLiquidityBasePercent = '0%'
      let yourNewLiquidityQuotePercent = '0%'

      if (inPositionHaveLiquidity) {
        const newInfo = currentLiquidityItem?.newBins
        let isIncrease = type === 'liquidity' ? true : newInfo.isIncrease
        let newBaseAmount = type === 'liquidity' ? currentLiquidityItem?.baseAmount || '0' : newInfo?.baseAmount || '0'
        let newQuoteAmount = type === 'liquidity' ? currentLiquidityItem?.quoteAmount || '0' : newInfo?.quoteAmount || '0'

        const afterAmountA = isIncrease
          ? d(beforeBaseAmount || '0')
              .add(newBaseAmount || '0')
              .toString()
          : d(beforeBaseAmount || '0')
              .minus(newBaseAmount)
              .toString()
        const afterAmountB = isIncrease
          ? d(beforeQuoteAmount || '0')
              .add(newQuoteAmount || '0')
              .toString()
          : d(beforeQuoteAmount || '0')
              .minus(newQuoteAmount || '0')
              .toString()

        const afterTotalAmountA = isIncrease ? d(item?.baseAmount).add(newBaseAmount).toString() : d(item?.baseAmount).minus(newBaseAmount).toString()
        const afterTotalAmountB = isIncrease
          ? d(item?.quoteAmount).add(newQuoteAmount).toString()
          : d(item?.quoteAmount).minus(newQuoteAmount).toString()

        yourNewLiquidityBasePercent = d(afterAmountA).lte(0)
          ? '0%'
          : d(item?.baseAmount).lte(0)
            ? '100%'
            : formatPercentage(d(afterAmountA).div(afterTotalAmountA).mul(100).toString(), 2)
        yourNewLiquidityQuotePercent = d(afterAmountB).lte(0)
          ? '0%'
          : d(item?.quoteAmount).lte(0)
            ? '100%'
            : formatPercentage(d(afterAmountB).div(afterTotalAmountB).mul(100).toString(), 2)
      }

      // 计算 tooltip 位置
      const tooltipWidth = document?.querySelector('.dlmm_select_range_tooltip')?.clientWidth ?? 200
      const mouseX = coordinate?.x || 0

      // 如果右侧空间足够显示完整 tooltip，则显示在右侧，否则显示在左侧
      const rightSpace = width - mouseX
      const shouldShowOnRight = rightSpace >= tooltipWidth
      const leftPosition = shouldShowOnRight
        ? Math.min(mouseX, width - tooltipWidth) // 显示在右侧，确保不超出右边界
        : Math.max(0, mouseX - tooltipWidth) // 显示在左侧，确保不超出左边界

      return (
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: `${leftPosition}px`,
            zIndex: 999999
          }}
        >
          <VStack
            minW="200px"
            bg="#141618"
            borderRadius="12px"
            border="1px solid"
            borderColor="#2A3238"
            padding="8px"
            gap="8px"
            justify="space-between"
            className="dlmm_select_range_tooltip"
          >
            <HStack justify="space-between" w="100%">
              <Text fontSize="12px" color="text_paragraph">
                {activeBin == item?.bin_id ? 'Active Bin' : 'Bin Price'}
              </Text>
              <Text fontSize="12px" color="text_caption">
                {formatPriceUseInDlmmAxis(item?.price)}
              </Text>
            </HStack>
            <VStack w="100%" gap="12px" flexDirection={isReverse ? 'column-reverse' : 'column'}>
              {isLeft && (
                <VStack padding="8px 4px" bg="bg_fifth" borderRadius="4px" gap="8px" w="100%" align="space-between" justify="center">
                  <HStack w="100%" gap="16px" justify="space-between">
                    <HStack gap="4px">
                      <SingleCoinImage imageUrl={item?.baseLogo} w="16px" h="16px" />
                      <Text fontSize="12px" color="text_paragraph">
                        {textEllipses(item?.baseSymbol, 8)}
                      </Text>
                    </HStack>

                    <Text fontSize="12px" color="text_caption">
                      {addComma(item?.baseAmount)}
                    </Text>
                  </HStack>
                  <HStack w="100%" gap="16px" justify="space-between">
                    <Text
                      whiteSpace="nowrap"
                      fontSize="12px"
                      color={item?.bin_id < activeBin ? (isReverse ? RightColor : LeftColor) : isReverse ? LeftColor : RightColor}
                    >
                      Your share in this bin
                    </Text>

                    <Text fontSize="12px" color="text_caption" whiteSpace="nowrap">
                      {yourLiquidityBaseAmountPercent}
                      {!!inPositionHaveLiquidity && !isNaN(inPositionHaveLiquidity) && ' -> '}
                      {!!inPositionHaveLiquidity && !isNaN(inPositionHaveLiquidity) && yourNewLiquidityBasePercent}
                    </Text>
                  </HStack>
                </VStack>
              )}

              {isRight && (
                <VStack padding="8px 4px" bg="bg_fifth" borderRadius="4px" gap="8px" w="100%" align="space-between" justify="center">
                  <HStack w="100%" gap="16px" justify="space-between">
                    <HStack gap="4px">
                      <SingleCoinImage imageUrl={item?.quoteLogo} w="16px" h="16px" />
                      <Text fontSize="12px" color="text_paragraph">
                        {textEllipses(item?.quoteSymbol, 8)}
                      </Text>
                    </HStack>
                    <Text fontSize="12px" color="text_caption">
                      {addComma(item?.quoteAmount)}
                    </Text>
                  </HStack>
                  <HStack w="100%" gap="16px" justify="space-between">
                    <Text
                      fontSize="12px"
                      whiteSpace="nowrap"
                      color={item?.bin_id > activeBin ? (isReverse ? LeftColor : RightColor) : isReverse ? RightColor : LeftColor}
                    >
                      Your share in this bin
                    </Text>
                    <Text fontSize="12px" color="text_caption" whiteSpace="nowrap">
                      {yourLiquidityQuoteAmountPercent}
                      {!!inPositionHaveLiquidity && !isNaN(inPositionHaveLiquidity) && ' -> '}
                      {!!inPositionHaveLiquidity && !isNaN(inPositionHaveLiquidity) && yourNewLiquidityQuotePercent}
                    </Text>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </VStack>
        </div>
      )
    },
    [currentLiquidityBinsObj, activeBin, isReverse, type, otherPosBinObj, width]
  )

  const haveRightMargin = useMemo(() => {
    if (!maxBinRangeData?.length) return 0
    return maxBinRangeData?.length > 650 ? 2 : 0
  }, [maxBinRangeData, activeBin])

  const haveLeftMargin = useMemo(() => {
    if (!maxBinRangeData?.length) return 0
    return maxBinRangeData?.length > 650 ? 2 : 0
  }, [maxBinRangeData, activeBin])

  // 自定义 XAxis tick 组件，隐藏左右各30px范围内的坐标数字
  const CustomXAxisTick = useCallback(
    ({ x, y, payload }: any) => {
      // 在 Recharts 中，x 坐标是相对于绘制区域的（已考虑 margin）
      // 计算实际绘制区域的宽度
      const chartContentWidth = width - haveLeftMargin - haveRightMargin
      const hideZoneSize = 30 // 左右各30px不显示

      // 判断是否在隐藏区域内
      // x 是相对于绘制区域左边缘的坐标（从 0 开始）
      const isInLeftHideZone = x <= hideZoneSize
      const isInRightHideZone = x >= chartContentWidth - hideZoneSize

      // 总是渲染g元素以保持布局，但根据位置决定是否显示文本
      return (
        <g transform={`translate(${x},${y})`}>
          {!(isInLeftHideZone || isInRightHideZone) && (
            <text x={0} y={0} dy={8} textAnchor="middle" fill="#909CA4" fontSize="12px">
              {formatPriceUseInDlmmAxis(payload.value)}
            </text>
          )}
        </g>
      )
    },
    [width, haveLeftMargin, haveRightMargin]
  )

  return (
    <Box
      ref={chartContainerRef}
      as="div"
      p="0px"
      w={{ base: '100%', lg: `${width}px` }}
      h={`${height}px`}
      margin="0 auto"
      overflow="visible"
      position="relative"
      data-chart-container
      sx={{
        '& .recharts-surface': {
          overflow: 'visible !important'
        },
        '& svg': {
          overflow: 'visible !important'
        }
      }}
      onMouseLeave={() => {
        if (isApp) return
        handleTooltipChange({
          show: false,
          content: null,
          position: null
        })
      }}
      onClick={() => {
        if (!isApp) return
        handleTooltipChange({
          show: false,
          content: null,
          position: null
        })
      }}
    >
      {/* 单个 BarChart 实现所有功能 */}
      {isApp ? (
        <ResponsiveContainer width="100%" height={height + 30 + 5}>
          <BarChart
            data={maxBinRangeData}
            margin={{ top: 6, right: haveRightMargin, left: haveLeftMargin, bottom: 0 }}
            barCategoryGap={0}
            barGap={0}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <XAxis dataKey="price" tickLine={false} tick={CustomXAxisTick} tickMargin={8} tickFormatter={value => formatPriceUseInDlmmAxis(value)} />
            <YAxis hide={true} />

            {!noToolTip && <Tooltip cursor={false} content={<CustomTooltip />} />}

            <Bar
              dataKey="liquidity"
              barSize={20}
              shape={renderCustomBar}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
            {poolPythPrice !== undefined && maxBinRangeData && maxBinRangeData.length > 0 && (
              <Customized
                component={(props: any) => (
                  <PythPriceLine
                    {...props}
                    poolPythPrice={poolPythPrice}
                    data={maxBinRangeData}
                    direct={direct}
                    isHover={pythTooltip?.show}
                    onTooltipChange={handleTooltipChange}
                    onResetHoveringState={(resetFn: () => void) => {
                      pythPriceLineResetRef.current = resetFn
                    }}
                  />
                )}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <BarChart
          width={width}
          height={height + 30 + 5}
          data={maxBinRangeData}
          margin={{ top: 6, right: haveRightMargin, left: haveLeftMargin, bottom: 0 }}
          barCategoryGap={0}
          barGap={0}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <XAxis dataKey="price" tickLine={false} tick={CustomXAxisTick} tickMargin={8} tickFormatter={value => formatPriceUseInDlmmAxis(value)} />
          <YAxis hide={true} />

          {!noToolTip && <Tooltip cursor={false} content={<CustomTooltip />} />}

          <Bar
            dataKey="liquidity"
            barSize={20}
            shape={renderCustomBar}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
          {poolPythPrice !== undefined && maxBinRangeData && maxBinRangeData.length > 0 && (
            <Customized
              component={(props: any) => (
                <PythPriceLine
                  {...props}
                  poolPythPrice={poolPythPrice}
                  data={maxBinRangeData}
                  direct={direct}
                  isHover={pythTooltip?.show}
                  onTooltipChange={handleTooltipChange}
                  onResetHoveringState={(resetFn: () => void) => {
                    pythPriceLineResetRef.current = resetFn
                  }}
                />
              )}
            />
          )}
        </BarChart>
      )}

      {/* 双边滑动杆 */}
      {/* <div style={{ width: '100%', position: 'absolute', left: 0, bottom: '0px' }}> */}
      <div style={{ width: '100%', position: 'absolute', left: 0, bottom: '-7px' }}>
        <Slider
          className="bin-range-select-chart-slider"
          range
          min={0}
          max={maxBinRangeData.length - 1}
          value={range}
          onChange={newRange => setRange(newRange as [number, number])}
          onChangeComplete={handleChangeComplete}
          // marks={marks}
          step={1}
          dots={false}
          dotStyle={{ display: 'none' }}
          disabled={isSimple ? true : false}
          // handleRender={handleRender}
          handleStyle={[
            {
              borderColor: '#00D8B6',
              backgroundColor: '#00D8B6',
              borderRadius: '4px 2px 2px 4px',
              width: 14,
              height: 16,
              opacity: 1,
              top: '-2px',
              zIndex: 103,
              display: isSimple ? 'none' : 'block'
            },
            {
              borderColor: '#4A9AEF',
              backgroundColor: '#4A9AEF',
              borderRadius: '2px 4px 4px 2px',
              width: 14,
              height: 16,
              opacity: 1,
              top: '-2px',
              zIndex: 103,
              display: isSimple ? 'none' : 'block'
              // display: 'none'
            }
          ]}
          trackStyle={[
            {
              backgroundColor: '#355369',
              height: 2,
              borderRadius: 0
            }
          ]}
          railStyle={{
            backgroundColor: '#22323E',
            height: 2,
            borderRadius: 0
          }}
        />
      </div>

      {/* 渲染 tooltip 到图表容器内，使用 absolute 定位，使其保持在图表中的相对位置 */}
      {pythTooltip.show && lockedTooltipRef.current && (
        <div
          ref={tooltipElementRef}
          style={{
            position: 'absolute',
            left: `${lockedTooltipRef.current.position.x}px`,
            top: `${lockedTooltipRef.current.position.y}px`,
            pointerEvents: 'auto', // 改为 auto，允许点击 tooltip 本身
            zIndex: 10000,
            backgroundColor: '#141618',
            border: '1px solid #2A3238',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#909CA4',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            width: '230px',
            lineHeight: 1.5
          }}
        >
          Market Price <span style={{ color: '#fff' }}>{lockedTooltipRef.current.content.price} </span>
          {!direct ? lockedTooltipRef.current.content.baseSymbol : lockedTooltipRef.current.content.quoteSymbol} /{' '}
          {!direct ? lockedTooltipRef.current.content.quoteSymbol : lockedTooltipRef.current.content.baseSymbol} from Pyth Network
        </div>
      )}
    </Box>
  )
  // : (
  //   <div
  //     style={{
  //       padding: '0px',
  //       width: `${width}px`,
  //       height: `${height}px`,
  //       margin: '0 auto',
  //       position: 'relative',
  //       overflow: 'visible' // 允许 tooltip 超出容器边界
  //     }}
  //   >
  //     <BarChart
  //       width={width}
  //       height={height}
  //       data={maxBinRangeData}
  //       margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
  //       barCategoryGap={0}
  //       barGap={0}
  //       onMouseLeave={() => setHoveredIndex(null)}
  //     >
  //       <XAxis dataKey="price" tickSize={0} tickMargin={10} tick={{ fontSize: '12px', fill: '#909CA4' }} />
  //       <YAxis hide={true} />

  //       {!noToolTip && <Tooltip cursor={false} content={<CustomTooltip />} />}

  //       <Bar
  //         dataKey="liquidity"
  //         barSize={20}
  //         isAnimationActive={true}
  //         animationDuration={800}
  //         animationEasing="ease-in-out"
  //         shape={renderCustomBar}
  //       />
  //     </BarChart>
  //   </div>
  // )
}

const NoData = ({ height, maxBinLoading }: { height: number; maxBinLoading: boolean }) => {
  return (
    <VStack w="100%" gap="0px">
      <Image src={RangeChartBarPlaceholder} h={`${height - 22}px`} />
      <Text fontSize="12px" color="text_paragraph" mt="10px">
        {maxBinLoading ? 'Loading ...' : 'No liquidity data'}
      </Text>
    </VStack>
  )
}

const ToLargeData = ({ height }: { height: number }) => {
  return (
    <VStack w="100%" gap="0px">
      <Image src={RangeChartBarPlaceholder} h={`${height - 22}px`} />
      <Text fontSize="12px" color="text_paragraph" mt="10px">
        Missing chart data
      </Text>
    </VStack>
  )
}

export default memo(BinRangeSelectChart)
