import { AggregatorDexMap } from '@/config/aggregator'
import { getPercentage } from '@/utils'
import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage, SingleCoinImage } from '@cetus/ui-kit'
import { adjustTo100, d, fixDown, formatFeeRate, textEllipses } from '@cetus/utils'
import { Box, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
import { useMemo, useRef } from 'react'
import { useSwapRouter } from '../../hooks/swap/useSwapRouter'

const pathStrokeWidth = 2

interface V3RouterProps {
  data: any
  originFromCoinType?: string
  originToCoinType?: string
  isWidget?: boolean
  config?: {
    nodeWidth?: number
    searchStep?: number
    nodePadding?: number
    maxSearchDistance?: number
    arrowOffset?: number
  }
}

export default function V3Router({ data, config = {}, originFromCoinType, originToCoinType, isWidget }: V3RouterProps) {
  const { nodes, edges, tokenMap, panelHeight, resultColumes } = useSwapRouter(data, originFromCoinType, originToCoinType)
  const containerRef = useRef<HTMLDivElement>(null)

  // 默认配置
  const defaultConfig = {
    nodeWidth: 176,
    searchStep: 5,
    nodePadding: 10,
    maxSearchDistance: 50,
    arrowOffset: 5,
    ...config
  }

  const displayNodes = useMemo(() => {
    return nodes?.map((targetItem: any) => {
      // 使用 originalTarget 来获取正确的 token 信息
      const originalTarget = targetItem.originalTarget || targetItem.target
      const targetInfo = tokenMap?.get(originalTarget)
      const keys = Object.keys(targetItem?.list)
      return {
        ...targetItem,
        targetSymbol: targetInfo?.symbol,
        targetImg: targetInfo?.logo_url,
        fromGroups: Object.values(targetItem?.list)?.map((item: any, index: number) => {
          // 使用 keys[index] 作为 from，因为它已经是正确的 coin type
          const fromInfo = tokenMap?.get(keys[index])
          const title = `${textEllipses(fromInfo?.symbol || '', 8)} > ${textEllipses(targetInfo?.symbol || '', 8)}`

          // 确保每个item都包含percent字段，并且总和为100%
          const totalAmountOut = item.reduce((sum: number, i: any) => {
            return sum + parseFloat(i.amountOut || '0')
          }, 0)

          // 先计算所有项目的原始百分比
          const rawPercents: number[] = []
          item.forEach((listItem: any) => {
            const amountOut = parseFloat(listItem.amountOut || '0')
            const rawPercent = totalAmountOut > 0 ? fixDown(d(amountOut).div(totalAmountOut).mul(100).toString(), 0) : '0'
            rawPercents.push(Number(rawPercent) || 1)
          })

          // 计算总和并调整最后一个项目
          // const totalRawPercent = rawPercents.reduce((sum, percent) => sum + percent, 0)
          // if (rawPercents.length > 0) {
          //   rawPercents[rawPercents.length - 1] += 100 - totalRawPercent
          // }

          const tempPercents = adjustTo100(rawPercents)

          const processedList = item.map((listItem: any, index: number) => {
            // 使用计算好的百分比，确保总和为100%
            const percent = tempPercents[index]?.toString() || '0'
            const fromInfo = tokenMap?.get(listItem?.from)

            return {
              ...listItem,
              percent,
              fromLogo: fromInfo?.logo_url,
              targetLogo: targetInfo?.logo_url,
              fromSymbol: fromInfo?.symbol,
              targetSymbol: targetInfo?.symbol,
              displayFee: getPercentage(formatFeeRate(listItem?.feeRate, 4))
            }
          })

          return {
            list: processedList.sort((a: any, b: any) => {
              return Number(b?.percent) - Number(a?.percent)
            }),
            title
          }
        })
      }
    })
  }, [nodes, tokenMap, resultColumes])

  return (
    <Box position="relative" w="878px" h={panelHeight ? `${panelHeight}px` : '531px'} ref={containerRef}>
      <SvgEdges edges={edges} nodes={nodes} config={defaultConfig} />
      <DrawBlock data={displayNodes} isWidget={isWidget} />
    </Box>
  )
}

// 检查线段是否与矩形相交
function checkLineRectIntersection(
  lineX1: number,
  lineY1: number,
  lineX2: number,
  lineY2: number,
  rectLeft: number,
  rectTop: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  const rectRight = rectLeft + rectWidth
  const rectBottom = rectTop + rectHeight

  // 检查线段是否与矩形相交
  // 使用AABB（轴对齐包围盒）检测
  const lineLeft = Math.min(lineX1, lineX2)
  const lineRight = Math.max(lineX1, lineX2)
  const lineTop = Math.min(lineY1, lineY2)
  const lineBottom = Math.max(lineY1, lineY2)

  // 如果线段完全在矩形外部，则不相交
  if (lineRight < rectLeft || lineLeft > rectRight || lineBottom < rectTop || lineTop > rectBottom) {
    return false
  }

  // 如果线段完全在矩形内部，则相交
  if (lineLeft >= rectLeft && lineRight <= rectRight && lineTop >= rectTop && lineBottom <= rectBottom) {
    return true
  }

  // 对于水平线，使用简单的边界检测
  if (Math.abs(lineY1 - lineY2) < 0.001) {
    // 水平线
    if (lineY1 >= rectTop && lineY1 <= rectBottom) {
      if (lineRight >= rectLeft && lineLeft <= rectRight) {
        return true
      }
    }
    return false
  }

  // 对于垂直线，使用简单的边界检测
  if (Math.abs(lineX1 - lineX2) < 0.001) {
    // 垂直线
    if (lineX1 >= rectLeft && lineX1 <= rectRight) {
      if (lineBottom >= rectTop && lineTop <= rectBottom) {
        return true
      }
    }
    return false
  }

  // 对于斜线，使用参数化方法检测
  // 检查线段是否与矩形的四条边相交
  const edges = [
    // 上边
    { x1: rectLeft, y1: rectTop, x2: rectRight, y2: rectTop },
    // 下边
    { x1: rectLeft, y1: rectBottom, x2: rectRight, y2: rectBottom },
    // 左边
    { x1: rectLeft, y1: rectTop, x2: rectLeft, y2: rectBottom },
    // 右边
    { x1: rectRight, y1: rectTop, x2: rectRight, y2: rectBottom }
  ]

  for (const edge of edges) {
    if (linesIntersect(lineX1, lineY1, lineX2, lineY2, edge.x1, edge.y1, edge.x2, edge.y2)) {
      return true
    }
  }

  return false
}

// 辅助函数：检查两条线段是否相交
function linesIntersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denom) < 0.001) return false // 使用更小的阈值

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  return t >= 0 && t <= 1 && u >= 0 && u <= 1
}

function generateSmartPathWithNodeConnection(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  toBlockHeight: number,
  targetNodeWidth: number = 176,
  isStart: boolean,
  edge: any,
  allNodes: any[] = [],
  allEdges: any[] = [],
  config: any = {}
): string {
  // 定义配置参数
  const searchStep = config.searchStep || 5
  const nodePadding = config.nodePadding || 10
  const maxSearchDistance = config.maxSearchDistance || 50
  const arrowOffset = config.arrowOffset || 5

  // 检查线段是否与节点相交
  const checkLineIntersection = (x1: number, y1: number, x2: number, y2: number): boolean => {
    for (const node of allNodes) {
      if (edge.from === node.id || edge.to === node.id) {
        continue
      }
      if (checkLineRectIntersection(x1, y1, x2, y2, node.left, node.top, node.width, node.height)) {
        return true
      }
    }
    return false
  }

  // 检查从源节点到目标节点的水平连接是否可行
  const checkHorizontalConnection = (sourceY: number): boolean => {
    // 检查水平线是否与其他节点相交
    if (checkLineIntersection(fromX, sourceY, toX - arrowOffset, sourceY)) {
      return false
    }

    // 检查源节点和目标节点的位置关系
    const sourceTop = sourceNode.top
    const sourceBottom = sourceNode.top + sourceNode.height
    const targetTop = targetNode.top
    const targetBottom = targetNode.top + targetNode.height

    // 如果源节点和目标节点有重叠的Y范围，检查连接点是否在重叠范围内
    const overlapTop = Math.max(sourceTop, targetTop)
    const overlapBottom = Math.min(sourceBottom, targetBottom)

    if (overlapTop < overlapBottom) {
      // 有重叠范围，检查连接点是否在重叠范围内
      return sourceY >= overlapTop + nodePadding && sourceY <= overlapBottom - nodePadding
    } else {
      // 没有重叠范围，不能水平连接
      return false
    }
  }

  // 获取源节点和目标节点
  const sourceNode = allNodes.find(node => node.id === edge.from)
  const targetNode = allNodes.find(node => node.id === edge.to)

  if (!sourceNode || !targetNode) {
    return `M${fromX},${fromY} L${toX},${fromY == toY ? toY : fromY}`
  }

  // 1. 如果是起始线，连接到目标节点中心位置
  if (isStart) {
    const targetCenterY = targetNode.top + targetNode.height / 2
    if (checkHorizontalConnection(targetCenterY)) {
      return `M${fromX},${fromY} L${toX - arrowOffset},${targetCenterY}`
    }

    return `M${fromX},${fromY} L${toX - arrowOffset},${fromY}`
  }

  // 2. 检查源节点和目标节点的连接线数量
  const sourceOutgoingEdges = allEdges.filter((e: any) => e.from === edge.from)
  const targetIncomingEdges = allEdges.filter((e: any) => e.to === edge.to)

  // 3. 如果源节点只有一条线出发，优先从高度中间位置连接
  if (sourceOutgoingEdges.length === 1) {
    const sourceCenterY = sourceNode.top + sourceNode.height / 2
    if (checkHorizontalConnection(sourceCenterY)) {
      return `M${fromX},${sourceCenterY} L${toX - arrowOffset},${sourceCenterY}`
    }
  }

  // 4. 检查是否有直接水平连接的可能
  const sourceTop = sourceNode.top
  const sourceBottom = sourceNode.top + sourceNode.height
  const targetTop = targetNode.top
  const targetBottom = targetNode.top + targetNode.height

  // 寻找重叠的Y范围
  const overlapTop = Math.max(sourceTop, targetTop)
  const overlapBottom = Math.min(sourceBottom, targetBottom)

  if (overlapTop < overlapBottom) {
    // 有重叠范围，在重叠范围内寻找连接点
    for (let y = overlapTop + nodePadding; y <= overlapBottom - nodePadding; y += searchStep) {
      if (checkHorizontalConnection(y)) {
        // return `M${fromX},${y} L${toX - arrowOffset},${y}`
        return `M${fromX},${y} L${toX - arrowOffset},${y}`
      }
    }
  }

  // 5. 如果没有直接连接的可能，检查是否可以向下/向上再横向连接
  const sourceCenterY = sourceNode.top + sourceNode.height / 2
  const targetCenterX = targetNode.left + targetNode.width / 2
  const targetBottomY = targetNode.top + targetNode.height

  if (sourceBottom - 10 < targetTop) {
    // 源节点在目标节点上方，尝试向下再横向
    const sourceCenterX = sourceNode.left + sourceNode.width / 2
    const sourceCenterY = sourceNode.top + sourceNode.height
    const downY = targetNode.top + targetNode.height / 2

    // 检查向下路径是否无障碍
    if (!checkLineIntersection(sourceCenterX, sourceBottom, sourceCenterX, downY)) {
      // 检查横向路径是否无障碍
      if (!checkLineIntersection(sourceCenterX, downY, toX - arrowOffset, downY)) {
        return `M${sourceCenterX},${sourceCenterY} L${sourceCenterX},${sourceBottom} L${sourceCenterX},${downY} L${toX - arrowOffset},${downY}`
      }
    }

    // 如果向下再横向不行，使用原来的L型路径

    return `M${fromX},${sourceCenterY} L${targetCenterX},${sourceCenterY} L${targetCenterX},${targetBottomY}`
  } else if (sourceTop + 10 >= targetBottom) {
    // 源节点在目标节点下方，尝试向上再横向
    // const sourceCenterX = sourceNode.left + sourceNode.width
    // const upY = sourceTop - nodePadding

    // 检查向上路径是否无障碍
    // if (!checkLineIntersection(sourceCenterX, sourceTop, sourceCenterX, upY)) {
    //   // 检查横向路径是否无障碍
    //   if (!checkLineIntersection(sourceCenterX, upY, toX - arrowOffset, upY)) {
    //     return `M${fromX},${sourceCenterY} L${sourceCenterX},${sourceTop} L${sourceCenterX},${upY} L${toX - arrowOffset},${upY}`
    //   }
    // }

    // console.log('先向右再向上###sourceNode: ', sourceNode)
    // console.log('先向右再向上###targetNode: ', targetNode)

    // 如果向上再横向不行，使用原来的L型路径
    return `M${fromX},${sourceCenterY} L${targetCenterX},${sourceCenterY} L${targetCenterX},${targetBottomY}`
  }

  // 6. 最后的备选方案：简单的L型路径
  // const midX = fromX + 50
  // return `M${fromX},${sourceCenterY} L${midX},${sourceCenterY} L${midX},${targetBottomY}`
  return `M${fromX},${sourceCenterY} L${toX},${sourceCenterY}`
}

function SvgEdges({ edges, nodes, config }: { edges: any[]; nodes: any[]; config: any }) {
  const svgRef = useRef<SVGSVGElement>(null)

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 1,
        width: '100%',
        height: '100%'
      }}
    >
      <defs>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 255, 165, 1)" />
          <stop offset="100%" stopColor="rgba(0, 183, 255, 1)" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="5" markerHeight="9" refX="4" refY="4" orient="auto">
          <path d="M1 1 L4 3.5 L1 6" fill="none" stroke="url(#arrowGradient)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* 额外的圆圈和连接线 */}
      {(() => {
        // 找到第一列最后一个连接线段的开始点（Y坐标最大的初始边）
        const firstColumnEdges = edges?.filter(edge => edge.isStart) || []
        console.log('🚀 ~ firstColumnEdges:', firstColumnEdges)
        const lastFirstColumnEdge = firstColumnEdges.reduce((maxEdge, currentEdge) => {
          // 找到Y坐标最大的初始边
          return currentEdge.fromY > maxEdge.fromY ? currentEdge : maxEdge
        }, firstColumnEdges[0])
        console.log('🚀 ~ lastFirstColumnEdge:', lastFirstColumnEdge)

        // 找到最后一列最后一个线段的结束点（从初始出发且Y坐标最大的）
        const lastColumnEdges = edges?.filter(edge => edge.isFinal) || []
        const lastThirdColumnEdge = lastColumnEdges.reduce((maxEdge, currentEdge) => {
          // 找到Y坐标最大的边
          return currentEdge.toY > maxEdge.toY ? currentEdge : maxEdge
        }, lastColumnEdges[0])
        console.log('🚀 ~ lastThirdColumnEdge:', lastThirdColumnEdge)

        if (lastFirstColumnEdge && lastThirdColumnEdge) {
          const leftCircleX = 13
          const leftCircleY = 4
          const rightCircleX = 878 - 13 // routerComWidth - 28
          const rightCircleY = 4

          // 左侧连接线：从左侧圆圈中心向下连接到第一列最后一个连接线段的开始点
          const leftConnectionPath = `M ${leftCircleX} ${leftCircleY + 4} Q ${leftCircleX} ${lastFirstColumnEdge.fromY - 10} ${lastFirstColumnEdge.fromX} ${lastFirstColumnEdge.fromY}`

          // 右侧连接线：从右侧圆圈中心向下连接到最后一列最后一个线段的结束点
          const rightConnectionPath = `M ${rightCircleX} ${rightCircleY} L ${rightCircleX} ${lastThirdColumnEdge.toY} L ${lastThirdColumnEdge.toX} ${lastThirdColumnEdge.toY}`

          return (
            <g>
              {/* 左侧连接线 */}
              <path d={leftConnectionPath} stroke="#2D2D2D" strokeWidth={pathStrokeWidth} fill="none" />

              {/* 右侧连接线 */}
              <path d={rightConnectionPath} stroke="#2D2D2D" strokeWidth={pathStrokeWidth} fill="none" />

              {/* 左侧圆圈 */}
              <circle cx={leftCircleX} cy={leftCircleY} r="4" fill="#75C8FF" />

              {/* 右侧圆圈 */}
              <circle cx={rightCircleX} cy={rightCircleY} r="4" fill="#75C8FF" />
            </g>
          )
        }
        return null
      })()}

      {/* 第一层：fromCoinType直接到targetCoinType的跨列连接（画在最上面） */}
      {edges
        ?.filter((edge: any) => edge.isCrossColumnConnection && edge.isStart)
        ?.map((edge, idx) => {
          let path: string
          let labelX: number
          let labelY: number

          // 检查是否有segments字段（多段线条）
          if (edge.segments && edge.segments.length > 0) {
            // 使用segments生成多段路径
            path = edge.segments
              .map((segment: any, segmentIdx: number) => {
                if (segmentIdx === 0) {
                  return `M${segment.x1},${segment.y1} L${segment.x2},${segment.y2}`
                } else {
                  return `L${segment.x2},${segment.y2}`
                }
              })
              .join(' ')

            // 对于多段线条，根据第一段方向确定标签位置
            const firstSegment = edge.segments[0]

            // 判断第一段的方向
            const deltaX = firstSegment.x2 - firstSegment.x1
            const deltaY = firstSegment.y2 - firstSegment.y1

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // 第一段主要是向右或向左
              labelY = (firstSegment.y1 + firstSegment.y2) / 2 // 线段上下居中
              labelX = firstSegment.x1 + 30 // fromX + 30
            } else if (deltaY < 0) {
              // 第一段向上
              labelY = firstSegment.y1 - 16
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            } else {
              // 第一段向下
              labelY = firstSegment.y1 + 30 // fromY + 30
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            }
          } else {
            // 使用原来的逻辑生成单段路径
            path = generateSmartPathWithNodeConnection(
              edge.fromX,
              edge.fromY,
              edge.toX,
              edge.toY,
              edge.toBlockHeight,
              config.nodeWidth,
              !!edge.isStart,
              edge,
              nodes,
              edges,
              config
            )

            // 计算标签位置
            // 从生成的路径中解析出实际的出发位置和路径类型
            const pathParts = path.split(' ')
            let actualStartX = edge.fromX
            let actualStartY = edge.fromY
            let isDownThenHorizontal = false

            // 解析路径的第一个点作为实际出发位置
            if (pathParts.length > 0 && pathParts[0].startsWith('M')) {
              const startCoords = pathParts[0].substring(1).split(',')
              if (startCoords.length === 2) {
                actualStartX = parseFloat(startCoords[0])
                actualStartY = parseFloat(startCoords[1])
              }
            }

            // 检查是否是先向下然后横向的路径
            if (pathParts.length >= 3) {
              const firstSegment = pathParts[1] // 第一个L命令
              const secondSegment = pathParts[2] // 第二个L命令

              if (firstSegment && secondSegment) {
                const firstCoords = firstSegment.substring(1).split(',')
                const secondCoords = secondSegment.substring(1).split(',')

                if (firstCoords.length === 2 && secondCoords.length === 2) {
                  const firstY = parseFloat(firstCoords[1])
                  const secondY = parseFloat(secondCoords[1])

                  // 如果第一段的Y小于第二段的Y，说明是先向下再横向
                  if (firstY < secondY) {
                    isDownThenHorizontal = true
                  }
                }
              }
            }

            // 根据路径类型确定标签位置
            if (isDownThenHorizontal) {
              // 先向下然后横向：X是标签宽度居中和线对齐，Y大于当前出发Y+5
              const textContent = edge.fromPercent ? `${edge.fromPercent}%` : ''
              const textWidth = textContent.length * 6
              const backgroundWidth = Math.max(42, textWidth + 10)
              labelX = actualStartX // 标签中轴线与向下线对齐
              labelY = actualStartY + 12 // Y再向下5（从原来的+5改为+10）
            } else {
              // 其他情况：标签应该展示在实际出发位置+30的x和当前y的位置（上下居中）
              labelX = actualStartX + 30
              labelY = actualStartY
            }
          }

          // 计算背景矩形的尺寸
          const textContent = edge.fromPercent ? `${edge.fromPercent}%` : ''
          const textWidth = textContent.length * 6 // 更精确的文字宽度估算
          const backgroundWidth = Math.max(42, textWidth + 10) // 最小宽度42，左右各10边距
          const backgroundHeight = 16
          const backgroundX = labelX - backgroundWidth / 2
          const backgroundY = labelY - backgroundHeight / 2

          return (
            <g key={`cross-${idx}`}>
              <path
                d={path}
                stroke="#2D2D2D"
                strokeWidth={pathStrokeWidth}
                fill="none"
                markerEnd="url(#arrowhead)"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              {/* 背景矩形 */}
              <rect x={backgroundX} y={backgroundY} width={backgroundWidth} height={backgroundHeight} rx="4" ry="4" fill="#192128" />
              {/* 百分比文字 */}
              <text
                x={labelX} // 使用labelX作为中心点，因为背景矩形就是以labelX为中心的
                y={backgroundY + backgroundHeight / 2 + 0.5} // 文字在背景矩形的垂直中心位置
                fontSize="10"
                fill="#00B7FF"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="auto"
              >
                {textContent}
              </text>
            </g>
          )
        })}

      {/* 第二层：fromCoinType直接到第二列的连接 */}
      {edges
        ?.filter((edge: any) => edge.renderOnTop)
        ?.map((edge, idx) => {
          let path: string
          let labelX: number
          let labelY: number

          // 检查是否有segments字段（多段线条）
          if (edge.segments && edge.segments.length > 0) {
            // 使用segments生成多段路径
            path = edge.segments
              .map((segment: any, segmentIdx: number) => {
                if (segmentIdx === 0) {
                  return `M${segment.x1},${segment.y1} L${segment.x2},${segment.y2}`
                } else {
                  return `L${segment.x2},${segment.y2}`
                }
              })
              .join(' ')

            // 对于多段线条，根据第一段方向确定标签位置
            const firstSegment = edge.segments[0]

            // 判断第一段的方向
            const deltaX = firstSegment.x2 - firstSegment.x1
            const deltaY = firstSegment.y2 - firstSegment.y1

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // 第一段主要是向右或向左
              labelY = (firstSegment.y1 + firstSegment.y2) / 2 // 线段上下居中
              labelX = firstSegment.x1 + 30 // fromX + 30
            } else if (deltaY < 0) {
              // 第一段向上
              labelY = firstSegment.y1 - 16
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            } else {
              // 第一段向下
              labelY = firstSegment.y1 + 30 // fromY + 30
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            }
          } else {
            // 使用原来的逻辑生成单段路径
            path = generateSmartPathWithNodeConnection(
              edge.fromX,
              edge.fromY,
              edge.toX,
              edge.toY,
              edge.toBlockHeight,
              config.nodeWidth,
              !!edge.isStart,
              edge,
              nodes,
              edges,
              config
            )

            // 计算标签位置
            labelX = (edge.fromX + edge.toX) / 2
            labelY = (edge.fromY + edge.toY) / 2
          }

          // 计算背景矩形的尺寸
          const textContent = edge.fromPercent ? `${edge.fromPercent}%` : ''
          const textWidth = textContent.length * 6
          const backgroundWidth = Math.max(42, textWidth + 10)
          const backgroundHeight = 16
          const backgroundX = labelX - backgroundWidth / 2
          const backgroundY = labelY - backgroundHeight / 2

          return (
            <g key={`cross-other-${idx}`}>
              <path
                d={path}
                stroke="#2D2D2D"
                strokeWidth={pathStrokeWidth}
                fill="none"
                markerEnd="url(#arrowhead)"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              {/* 背景矩形 */}
              <rect x={backgroundX} y={backgroundY} width={backgroundWidth} height={backgroundHeight} rx="4" ry="4" fill="#192128" />
              {/* 百分比文字 */}
              <text
                x={labelX}
                y={backgroundY + backgroundHeight / 2 + 0.5}
                fontSize="10"
                fill="#00B7FF"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="auto"
              >
                {textContent}
              </text>
            </g>
          )
        })}

      {/* 第三层：其他跨列连接（但不包括fromCoinType直接到第二列和targetCoinType的） */}
      {edges
        ?.filter((edge: any) => edge.isCrossColumnConnection && !edge.isStart && !edge.renderOnTop)
        ?.map((edge, idx) => {
          let path: string
          let labelX: number
          let labelY: number

          // 检查是否有segments字段（多段线条）
          if (edge.segments && edge.segments.length > 0) {
            // 使用segments生成多段路径
            path = edge.segments
              .map((segment: any, segmentIdx: number) => {
                if (segmentIdx === 0) {
                  return `M${segment.x1},${segment.y1} L${segment.x2},${segment.y2}`
                } else {
                  return `L${segment.x2},${segment.y2}`
                }
              })
              .join(' ')

            // 对于多段线条，根据第一段方向确定标签位置
            const firstSegment = edge.segments[0]

            // 判断第一段的方向
            const deltaX = firstSegment.x2 - firstSegment.x1
            const deltaY = firstSegment.y2 - firstSegment.y1

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // 第一段主要是向右或向左
              labelY = (firstSegment.y1 + firstSegment.y2) / 2 // 线段上下居中
              labelX = firstSegment.x1 + 30 // fromX + 30
            } else if (deltaY < 0) {
              // 第一段向上
              labelY = firstSegment.y1 - 16
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            } else {
              // 第一段向下
              labelY = firstSegment.y1 + 30 // fromY + 30
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            }
          } else {
            // 使用原来的逻辑生成单段路径
            path = generateSmartPathWithNodeConnection(
              edge.fromX,
              edge.fromY,
              edge.toX,
              edge.toY,
              edge.toBlockHeight,
              config.nodeWidth,
              !!edge.isStart,
              edge,
              nodes,
              edges,
              config
            )

            // 计算标签位置
            labelX = (edge.fromX + edge.toX) / 2
            labelY = (edge.fromY + edge.toY) / 2
          }

          // 计算背景矩形的尺寸
          const textContent = edge.fromPercent ? `${edge.fromPercent}%` : ''
          const textWidth = textContent.length * 6
          const backgroundWidth = Math.max(42, textWidth + 10)
          const backgroundHeight = 16
          const backgroundX = labelX - backgroundWidth / 2
          const backgroundY = labelY - backgroundHeight / 2

          return (
            <g key={`cross-other-${idx}`}>
              <path
                d={path}
                stroke="#2D2D2D"
                strokeWidth={pathStrokeWidth}
                fill="none"
                markerEnd="url(#arrowhead)"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              {/* 背景矩形 */}
              <rect x={backgroundX} y={backgroundY} width={backgroundWidth} height={backgroundHeight} rx="4" ry="4" fill="#192128" />
              {/* 百分比文字 */}
              <text
                x={labelX}
                y={backgroundY + backgroundHeight / 2 + 0.5}
                fontSize="10"
                fill="#00B7FF"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="auto"
              >
                {textContent}
              </text>
            </g>
          )
        })}

      {/* 第四层：所有其他连接（排除前面已经渲染的） */}
      {edges
        ?.filter((edge: any) => !edge.isCrossColumnConnection && !edge.renderOnTop)
        ?.map((edge, idx) => {
          let path: string
          let labelX: number
          let labelY: number

          // 检查是否有segments字段（多段线条）
          if (edge.segments && edge.segments.length > 0) {
            console.log('🔍 第四层发现segments，数量:', edge.segments.length, 'edge:', edge)
            // 使用segments生成多段路径
            path = edge.segments
              .map((segment: any, segmentIdx: number) => {
                if (segmentIdx === 0) {
                  return `M${segment.x1},${segment.y1} L${segment.x2},${segment.y2}`
                } else {
                  return `L${segment.x2},${segment.y2}`
                }
              })
              .join(' ')

            // 对于多段线条，根据第一段方向确定标签位置
            const firstSegment = edge.segments[0]

            // 判断第一段的方向
            const deltaX = firstSegment.x2 - firstSegment.x1
            const deltaY = firstSegment.y2 - firstSegment.y1

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // 第一段主要是向右或向左
              labelY = (firstSegment.y1 + firstSegment.y2) / 2 // 线段上下居中
              labelX = firstSegment.x1 + 30 // fromX + 30
            } else if (deltaY < 0) {
              // 第一段向上
              labelY = firstSegment.y1 - 16
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            } else {
              // 第一段向下
              labelY = firstSegment.y1 + 30 // fromY + 30
              labelX = (firstSegment.x1 + firstSegment.x2) / 2 // 线段左右居中
            }
          } else {
            // 使用原来的逻辑生成单段路径
            path = generateSmartPathWithNodeConnection(
              edge.fromX,
              edge.fromY,
              edge.toX,
              edge.toY,
              edge.toBlockHeight,
              config.nodeWidth,
              !!edge.isStart,
              edge,
              nodes,
              edges,
              config
            )

            // 计算标签位置
            // 从生成的路径中解析出实际的出发位置和路径类型
            const pathParts = path.split(' ')
            let actualStartX = edge.fromX
            let actualStartY = edge.fromY
            let isDownThenHorizontal = false

            // 解析路径的第一个点作为实际出发位置
            if (pathParts.length > 0 && pathParts[0].startsWith('M')) {
              const startCoords = pathParts[0].substring(1).split(',')
              if (startCoords.length === 2) {
                actualStartX = parseFloat(startCoords[0])
                actualStartY = parseFloat(startCoords[1])
              }
            }

            // 检查是否是先向下然后横向的路径
            if (pathParts.length >= 3) {
              const firstSegment = pathParts[1] // 第一个L命令
              const secondSegment = pathParts[2] // 第二个L命令

              if (firstSegment && secondSegment) {
                const firstCoords = firstSegment.substring(1).split(',')
                const secondCoords = secondSegment.substring(1).split(',')

                if (firstCoords.length === 2 && secondCoords.length === 2) {
                  const firstY = parseFloat(firstCoords[1])
                  const secondY = parseFloat(secondCoords[1])

                  // 如果第一段的Y小于第二段的Y，说明是先向下再横向
                  if (firstY < secondY) {
                    isDownThenHorizontal = true
                  }
                }
              }
            }

            // 根据路径类型确定标签位置
            if (isDownThenHorizontal) {
              // 先向下然后横向：X是标签宽度居中和线对齐，Y大于当前出发Y+5
              const textContent = edge.fromPercent ? `${edge.fromPercent}%` : ''
              const textWidth = textContent.length * 6
              const backgroundWidth = Math.max(42, textWidth + 10)
              labelX = actualStartX // 标签中轴线与向下线对齐
              labelY = actualStartY + 12 // Y再向下5（从原来的+5改为+10）
            } else {
              // 其他情况：标签应该展示在实际出发位置+30的x和当前y的位置（上下居中）
              labelX = actualStartX + 30
              labelY = actualStartY
            }
          }

          // 计算背景矩形的尺寸
          const textContent = edge.fromPercent ? `${edge.fromPercent}%` : ''
          const textWidth = textContent.length * 6 // 更精确的文字宽度估算
          const backgroundWidth = Math.max(42, textWidth + 10) // 最小宽度42，左右各10边距
          const backgroundHeight = 16
          const backgroundX = labelX - backgroundWidth / 2
          const backgroundY = labelY - backgroundHeight / 2

          return (
            <g key={`normal-${idx}`}>
              <path
                d={path}
                stroke="#2D2D2D"
                strokeWidth={pathStrokeWidth}
                fill="none"
                markerEnd="url(#arrowhead)"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              {/* 背景矩形 */}
              <rect x={backgroundX} y={backgroundY} width={backgroundWidth} height={backgroundHeight} rx="4" ry="4" fill="#192128" />
              {/* 百分比文字 */}
              <text
                x={labelX} // 使用labelX作为中心点，因为背景矩形就是以labelX为中心的
                y={backgroundY + backgroundHeight / 2 + 0.5} // 文字在背景矩形的垂直中心位置
                fontSize="10"
                fill="#00B7FF"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="auto"
              >
                {textContent}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

function DrawBlock({ data, isWidget }: { data: any; isWidget?: boolean }) {
  return (
    <Box w="100%" position="relative" h="100%" zIndex={2}>
      {data?.map((targetNode: any) => {
        return <TargetBlock key={targetNode.target} data={targetNode} isWidget={isWidget} />
      })}
    </Box>
  )
}

function TargetBlock({ data, isWidget }: { data: any; isWidget?: boolean }) {
  return (
    <VStack
      w="176px"
      p="8px"
      gap="0px"
      bg={isWidget ? 'swap_bg_primary' : 'background'}
      borderRadius="8px"
      border="1px solid"
      borderColor={isWidget ? '#242C33' : 'border'}
      position="absolute"
      left={data?.left}
      top={data?.top + 'px'}
      data-node-id={data?.target}
      key={data?.target}
    >
      <Box w="100%">
        <TokenToolTip data={data}>
          <HStack w="100%" h="24px" justify="flex-start">
            <SingleCoinImage imageUrl={data?.targetImg} coinType={data?.originalTarget} showTagWidth="12px" showTagHeight="12px" w="24px" h="24px" />
            <Text fontSize="14px" color="text_caption">
              {textEllipses(data?.targetSymbol || '', 16)}
            </Text>
          </HStack>
        </TokenToolTip>
      </Box>

      {data?.fromGroups?.map((item: any) => {
        return <PathItem key={item.from} data={item} isWidget={isWidget} />
      })}
    </VStack>
  )
}

function PathItem({ data, isWidget }: { data: any; isWidget?: boolean }) {
  return (
    <VStack p="12px 8px" bg={isWidget ? '#1F2933' : '#1C1C1C'} borderRadius="8px" w="100%" gap="0px" mt="8px">
      <Text h="16px" fontSize="14px" color="primary_gray" w="100%">
        {data?.title}
      </Text>
      <VStack gap="0px" w="100%" align="flex-start" mt="10px">
        {data?.list?.map((item: any) => {
          return (
            <PathToolTip key={item?.id} data={item}>
              <HStack key={item.provider} h="22px" w="100%" gap="0px" cursor="pointer">
                <SingleCoinImage imageUrl={AggregatorDexMap[item?.provider]?.logo} w="16px" h="16px" />
                <Text fontSize="12px" color="primary_gray" ml="4px">
                  {AggregatorDexMap[item?.provider]?.name}
                </Text>
                <Text fontSize="12px" color="primary_gray" flex="1" textAlign="right">
                  {item?.percent}%
                </Text>
              </HStack>
            </PathToolTip>
          )
        })}
      </VStack>
    </VStack>
  )
}

function PathToolTip({ children, data }: { children: any; data: any }) {
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  return (
    <Popover isLazy trigger={isApp ? 'click' : 'hover'} gutter={4}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <Portal>
        <PopoverContent w="unset" minW="unset">
          <PopoverBody p="12px">
            <VStack w="190px" gap="12px" className="no-close-widget-flag">
              <HStack w="100%" justify="space-between" p="0" gap="0px">
                <CoinPairImage
                  coinAIconUrl={data?.fromLogo}
                  coinBIconUrl={data?.targetLogo}
                  variant=""
                  p="0px"
                  w="16px"
                  h="16px"
                  imageStyle={{ decoding: 'async' }}
                  coinACoinType={data?.from}
                  coinBCoinType={data?.target}
                  showTagWidth="10px"
                  showTagHeight="10px"
                />
                <Text fontSize="12px" color="text_caption" flex={1} textAlign="left" ml="4px">
                  {textEllipses(data?.fromSymbol || '', 8)} - {textEllipses(data?.targetSymbol || '', 8)}
                </Text>
                {data?.feeRate && Number(data?.feeRate) > 0 && (
                  <Center minW="50px" h="16px" border="1px solid" borderColor="border" borderRadius="12px" p="0px 6px">
                    <Text fontSize="12px" color="#76C8FF" lineHeight="12px" fontWeight="400">
                      {data.displayFee}
                    </Text>
                  </Center>
                )}
              </HStack>
              {data?.id && (
                <HStack w="100%" justify="space-between" h="20px" p="0">
                  <HStack>
                    {/* <Image src={pool_img} w="20px" h="20px" /> */}
                    <Text fontSize="12px" color="text_paragraph">
                      Pool
                    </Text>
                  </HStack>
                  <AddressCopyLink
                    address={data?.id as string}
                    color="text_caption"
                    showLink={isApp ? true : false}
                    onClickLink={() => {
                      window.open(getExplorerUrl(data?.id, 'poolAddress'), '_blank')
                    }}
                  />
                </HStack>
              )}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

function TokenToolTip({ data, children }: { data: any; children: any }) {
  const { getExplorerUrl } = useExplorer()
  return (
    <CetusTooltip
      placement="top"
      showTooltip={true}
      tooltip={
        <HStack w="100%" justify="flex-start">
          <SingleCoinImage
            imageUrl={data?.targetImg}
            w="20px"
            h="20px"
            minH="20px"
            minW="20px"
            showTag={true}
            showTagWidth="10px"
            showTagHeight="10px"
            coinType={data?.originalTarget}
          />
          <Text color="text_caption"> {textEllipses(data?.targetSymbol, 10)}</Text>
          <AddressCopyLink address={data?.originalTarget} onClickLink={() => window.open(getExplorerUrl(data?.originalTarget, 'coin'))} />
        </HStack>
      }
    >
      <Box w="100%">{children}</Box>
    </CetusTooltip>
  )
}
