import useSwapStore from '@/store/swap/swap'
import { SwapRouterData } from '@/types/swap'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType } from '@cetus/types'
import { Decimal, d, fixDown } from '@cetus/utils'
import { Path } from '@cetusprotocol/aggregator-sdk'
import { useEffect, useState } from 'react'

export type TilePathItem = Path & {
  pathIndex: number
  routeIndex: number
  stepsFromEnd: number
}

// 节点数据结构
type Node = {
  id: string
  top: number
  left: number
  width: number
  height: number
  columnIndex: number
}

// 边数据结构
type Edge = {
  from: string
  target: string
  paths: number[] // 经过此边的路径ID
}

const routerComWidth = 878
const blockWidth = 176
const blockGap = 72
const gapWithLine = 22 // 同一列块儿距离路径线的距离
const blockPadding = 8 // 要考虑上下左右
const columeBlockSpace = 16 // 一列中块之间的上下距离
const targetCoinInfoHeight = 24 // 每个块儿里target icon和symbol展示区域的高度
const fromToTargetBlockPaddingTopAndBottom = 12
const fromToTargetBlockPaddingLeftAndRight = 8
const fromToTargetTitleHeight = 16
const providerRowHeight = 20 // 设计图上只有12，因为不想用间距控制，直接把高度算高一点
const minTop = 117

export function useSwapRouter(routerData?: SwapRouterData) {
  const { fetchTokenInfo } = useGetToken()
  const [newFormatSwapRouter, setNewFormatSwapRouter] = useState<any>({})
  const [nodes, setgNodes] = useState<any>([])
  const [edges, setEdges] = useState<any>([])
  const [panelHeight, setPanelHeight] = useState<number>(0)
  const { fromCoin, toCoin } = useSwapStore()

  // 1. 平铺path
  function getTilePaths(data: SwapRouterData): TilePathItem[] {
    if (!data?.routerData?.routes) return []
    const titlePaths: TilePathItem[] = []

    let gmaxPathIndex = 0
    data.routerData.routes.forEach((route, routeIndex) => {
      const totalSteps = route.path.length
      route.path.forEach((step, pathIndex) => {
        titlePaths.push({
          ...step,
          routeIndex,
          pathIndex,
          stepsFromEnd: totalSteps - 1 - pathIndex // 新增字段
        })
        gmaxPathIndex = Math.max(gmaxPathIndex, pathIndex)
      })
    })

    return titlePaths
  }

  // 2. 将path根据from分组, 分组中再按target分组
  function getGroupByFromAndTarget(titlePaths: TilePathItem[]) {
    // 先按 from 分组
    const fromMap: Record<string, TilePathItem[]> = {}
    titlePaths.forEach(item => {
      if (!fromMap[item.from]) {
        fromMap[item.from] = []
      }
      fromMap[item.from].push(item)
    })

    // 再对每个 from 组按 target 分组，并计算 targetGroups 的 amountIn 占比
    const result = Object.entries(fromMap).map(([from, items]) => {
      const targetMap: Record<string, TilePathItem[]> = {}
      items.forEach(item => {
        if (!targetMap[item.target]) {
          targetMap[item.target] = []
        }
        targetMap[item.target].push(item)
      })
      // 计算每个 targetGroup 的 amountIn 总和
      const targetGroupsRaw = Object.entries(targetMap).map(([target, tItems]) => {
        const groupAmountIn = tItems.reduce(
          (sum, item) =>
            d(sum)
              .plus(item.amountIn || '0')
              .toString(),
          '0'
        )
        return {
          target,
          items: tItems,
          groupAmountIn
        }
      })
      // 计算所有 targetGroup 的 amountIn 总和
      const totalAmountIn = targetGroupsRaw.reduce((sum, g) => d(sum).plus(g.groupAmountIn).toString(), '0')
      // 给每个 targetGroup 增加 fromPercent 字段
      const targetGroups = targetGroupsRaw.map(g => ({
        target: g.target,
        items: g.items,
        fromPercent: d(totalAmountIn).gt('0') ? fixDown(d(g.groupAmountIn).div(totalAmountIn).mul(100).toFixed(2, Decimal.ROUND_HALF_DOWN), 2) : '0'
      }))
      return {
        from,
        targetGroups
      }
    })
    return result
  }

  // 3.生成节点列数组
  function getNodeColume(originRoutes: any[], fromCoinType: string, targetCoinType: string) {
    console.log('🔍 getNodeColume 开始')
    console.log('🔍 fromCoinType:', fromCoinType)
    console.log('🔍 targetCoinType:', targetCoinType)
    console.log('🔍 originRoutes:', originRoutes)

    const columns: { froms: string[]; list: any[] }[] = []

    // 找到所有路径的最大长度
    const maxPathLength = Math.max(...originRoutes.map(route => route.path.length))
    console.log('🔍 maxPathLength:', maxPathLength)

    // 1. 从最后一个path开始，按target分组合并
    // 找到所有路径的最大深度
    const maxDepth = Math.max(...originRoutes.map(route => route.path.length))
    console.log('🔍 maxDepth:', maxDepth)

    // 从最后一个位置开始，依次往前处理
    for (let depth = 0; depth <= maxDepth; depth++) {
      console.log(`🔍 处理深度${depth}的path`)

      // 收集当前深度的所有数据
      const stepData = new Map<string, Map<string, any[]>>() // target -> from -> items

      originRoutes.forEach(route => {
        // 找到当前路径中深度为depth的step（从后往前数）
        const stepIndex = route.path.length - depth
        if (stepIndex >= 0 && route.path[stepIndex]) {
          const step = route.path[stepIndex]
          const target = step.target
          const from = step.from

          if (!stepData.has(target)) {
            stepData.set(target, new Map())
          }

          const targetData = stepData.get(target)!
          if (!targetData.has(from)) {
            targetData.set(from, [])
          }

          targetData.get(from)!.push({
            ...step,
            routeIndex: route.routeIndex
          })
        }
      })

      console.log(`🔍 深度${depth}收集的数据:`, Object.fromEntries(stepData))

      // 如果当前深度有数据，构建列
      if (stepData.size > 0) {
        const colData: any[] = []

        stepData.forEach((targetData, target) => {
          const fromGroups: any[] = []

          targetData.forEach((items, from) => {
            // 按provider合并
            const providerMap = new Map<string, any>()
            let totalAmountOut = '0'

            items.forEach(item => {
              const amountOut = item.amountOut || '0'
              totalAmountOut = d(totalAmountOut).plus(amountOut).toString()

              if (!providerMap.has(item.provider)) {
                providerMap.set(item.provider, { ...item, amountOut })
              } else {
                providerMap.get(item.provider).amountOut = d(providerMap.get(item.provider).amountOut).plus(amountOut).toString()
              }
            })

            // 计算percent
            const mergedItems = Array.from(providerMap.values()).map(item => ({
              ...item,
              percent: d(totalAmountOut).gt('0') ? d(item.amountOut).div(totalAmountOut).mul(100).toFixed(2, Decimal.ROUND_HALF_DOWN) : '0'
            }))

            fromGroups.push({
              from,
              items: mergedItems
            })
          })

          colData.push({
            target,
            fromGroups
          })
        })

        columns.unshift({
          froms: Array.from(new Set(colData.flatMap(item => item.fromGroups.map((fg: any) => fg.from)))),
          list: colData
        })
      }
    }

    console.log('🚀 ~ getNodeColume ~ columns:', columns)
    return columns
  }

  // 4. 生成画布需要的节点数据，包含到时候div定位的位置top, left和div的高度height和width(with是固定的)
  function getNodes(nodeColume: any, fromCoinType: string) {
    const columeNum = nodeColume.length
    const columeComWidth = columeNum * blockWidth + (columeNum - 1) * blockGap // 整个列块儿展示区域宽度
    const columeComMarginWithRouterCom = (routerComWidth - columeComWidth) / 2 // 整个列块儿展示区域居中展示时距离整个路由内容区边框的距离

    const nodesMap = new Map<string, Node>()

    // 构建连接关系映射，用于后续定位
    const connectionMap = new Map<string, string[]>() // nodeKey -> connected nodeKeys
    const reverseConnectionMap = new Map<string, string[]>() // nodeKey -> sources

    // 构建跨越路径映射：记录从起始位置直接连接到后面列的路径
    const crossPathMap = new Map<number, string[]>() // columnIndex -> nodeKeys that have direct connection from start

    // 遍历所有列，构建连接关系和跨越路径
    nodeColume.forEach((col: any, colIndex: number) => {
      col.list.forEach((block: any) => {
        const target = block.target
        const nodeKey = `${colIndex}-${target}` // 使用 columnIndex-target 作为唯一标识
        const connectedNodeKeys: string[] = []
        const sourceNodeKeys: string[] = []

        // 找到当前节点连接到的下一列节点
        if (colIndex < nodeColume.length - 1) {
          const nextCol = nodeColume[colIndex + 1]
          nextCol.list.forEach((nextBlock: any) => {
            if (nextBlock.fromGroups.some((fg: any) => fg.from === target)) {
              const nextNodeKey = `${colIndex + 1}-${nextBlock.target}`
              connectedNodeKeys.push(nextNodeKey)
            }
          })
        }

        // 找到连接到当前节点的上一列节点
        if (colIndex > 0) {
          const prevCol = nodeColume[colIndex - 1]
          prevCol.list.forEach((prevBlock: any) => {
            if (block.fromGroups.some((fg: any) => fg.from === prevBlock.target)) {
              const prevNodeKey = `${colIndex - 1}-${prevBlock.target}`
              sourceNodeKeys.push(prevNodeKey)
            }
          })
        }

        // 检查是否有从起始位置直接连接到当前节点的路径
        if (block.fromGroups.some((fg: any) => fg.from === fromCoinType)) {
          if (!crossPathMap.has(colIndex)) {
            crossPathMap.set(colIndex, [])
          }
          crossPathMap.get(colIndex)!.push(nodeKey)
        }

        connectionMap.set(nodeKey, connectedNodeKeys)
        reverseConnectionMap.set(nodeKey, sourceNodeKeys)
      })
    })

    // 从后往前计算节点位置
    for (let i = nodeColume.length - 1; i >= 0; i--) {
      console.log(`🔍 处理第${i}列的节点定位`)
      const arr = nodeColume[i]?.list
      const positionedNodes: { nodeKey: string; top: number; height: number }[] = []

      // 计算当前列需要为跨越路径预留的空间
      const crossPathsInCurrentCol = crossPathMap.get(i) || []
      const crossPathsInNextCol = crossPathMap.get(i + 1) || []
      const crossPathsInPrevCol = crossPathMap.get(i - 1) || []

      // 计算跨越路径的预留空间
      const reservedSpaces: { top: number; height: number }[] = []

      // 为下一列的跨越路径预留空间
      if (crossPathsInNextCol.length > 0 && i < nodeColume.length - 1) {
        crossPathsInNextCol.forEach(nodeKey => {
          const node = nodesMap.get(nodeKey)
          if (node) {
            reservedSpaces.push({
              top: node.top - gapWithLine,
              height: gapWithLine * 2
            })
          }
        })
      }

      // 处理当前列的节点，按优先级排序
      const sortedBlocks = arr
        .map((block: any) => {
          const nodeKey = `${i}-${block.target}`
          const hasDirectFromStart = block.fromGroups.some((fg: any) => fg.from === fromCoinType)
          const connectedNodeKeys = connectionMap.get(nodeKey) || []
          const hasOnlyFromStart = block.fromGroups.every((fg: any) => fg.from === fromCoinType)

          // 计算当前节点连接到下一列的哪些节点，以及这些节点在下一列的位置
          let nextColPosition = -1
          let nextColTargets: string[] = []
          if (i < nodeColume.length - 1) {
            const nextCol = nodeColume[i + 1]
            for (let j = 0; j < nextCol.list.length; j++) {
              const nextBlock = nextCol.list[j]
              if (nextBlock.fromGroups.some((fg: any) => fg.from === block.target)) {
                nextColPosition = j
                nextColTargets.push(nextBlock.target)
              }
            }
          }

          // 计算当前节点是否有来自前一列的连接
          let hasIncomingFromPrevCol = false
          if (i > 0) {
            const prevCol = nodeColume[i - 1]
            hasIncomingFromPrevCol = prevCol.list.some((prevBlock: any) => block.fromGroups.some((fg: any) => fg.from === prevBlock.target))
          }

          // 计算连接到的目标节点在下一列的平均位置
          let avgNextColPosition = -1
          if (nextColTargets.length > 0 && i < nodeColume.length - 1) {
            const nextCol = nodeColume[i + 1]
            const positions = nextColTargets.map(target => {
              const index = nextCol.list.findIndex((block: any) => block.target === target)
              return index >= 0 ? index : 0
            })
            avgNextColPosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length
          }

          return {
            block,
            nodeKey,
            hasDirectFromStart,
            hasOnlyFromStart,
            connectedNodeKeys,
            hasIncomingFromPrevCol,
            nextColPosition,
            avgNextColPosition,
            nextColTargets,
            priority: !hasIncomingFromPrevCol ? 1 : nextColPosition >= 0 ? 2 : 3, // 优先级：无前连接 > 有后连接 > 其他
            connectionCount: nextColTargets.length // 添加连接数量用于排序
          }
        })
        .sort((a: any, b: any) => {
          // 首先按优先级排序
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          // 如果优先级相同，按连接数量排序（连接数量少的排在前面，避免交叉）
          if (a.connectionCount !== b.connectionCount) {
            return a.connectionCount - b.connectionCount
          }
          // 如果连接数量相同，按平均下一列位置排序（确保连接关系更合理的排序）
          if (a.avgNextColPosition !== b.avgNextColPosition) {
            return a.avgNextColPosition - b.avgNextColPosition
          }
          // 如果平均位置相同，按下一列位置排序
          if (a.nextColPosition !== b.nextColPosition) {
            return a.nextColPosition - b.nextColPosition
          }
          return 0
        })

      console.log(
        `🔍 第${i}列排序后的节点:`,
        sortedBlocks.map((b: any) => ({
          target: b.block.target,
          priority: b.priority,
          connectionCount: b.connectionCount,
          avgNextColPosition: b.avgNextColPosition,
          nextColPosition: b.nextColPosition
        }))
      )

      sortedBlocks.forEach(
        ({
          block,
          nodeKey,
          hasDirectFromStart,
          hasOnlyFromStart,
          connectedNodeKeys,
          hasIncomingFromPrevCol,
          nextColPosition,
          avgNextColPosition
        }: any) => {
          const blockHeight = getBlockHeight(block.fromGroups)
          let preferredTop = minTop

          console.log(
            `🔍 节点定位开始: ${block.target}, col=${i}, hasDirectFromStart=${hasDirectFromStart}, connectedNodeKeys.length=${connectedNodeKeys.length}, hasIncomingFromPrevCol=${hasIncomingFromPrevCol}`
          )

          // 1. 优先考虑与连接节点的对齐
          if (connectedNodeKeys.length > 0) {
            // 如果当前节点没有来自前一列的连接，优先与目标节点的上部对齐
            if (!hasIncomingFromPrevCol) {
              let minConnectedTop = Infinity
              let found = false
              connectedNodeKeys.forEach((connectedNodeKey: string) => {
                const connectedNode = nodesMap.get(connectedNodeKey)
                if (connectedNode) {
                  minConnectedTop = Math.min(minConnectedTop, connectedNode.top)
                  found = true
                }
              })
              console.log('🚀 ~ getNodes ~ found:', found, '##minConnectedTop##', minConnectedTop, '##preferredTop##', preferredTop)
              if (found) {
                preferredTop = minConnectedTop
              }
            }
            // 否则与目标节点的中心对齐
            else {
              // 对于有来自前一列连接的节点，使用基于索引的简单定位，避免与高节点中心对齐
              const currentCol = nodeColume[i]
              const nodeIndexInCol = currentCol.list.findIndex((b: any) => b.target === block.target)
              if (nodeIndexInCol >= 0) {
                // 检查是否有横跨多列的连线经过当前节点
                const hasCrossColumnLines = crossPathMap.get(i)?.includes(nodeKey) || false

                // 只有在存在横跨连线时才预留 gapWithLine 空间
                const gapOffset = hasCrossColumnLines ? gapWithLine : 0
                preferredTop = minTop + gapOffset + nodeIndexInCol * columeBlockSpace
                console.log(
                  `🔍 第二列节点定位(简单定位): ${block.target}, index=${nodeIndexInCol}, hasCrossColumnLines=${hasCrossColumnLines}, preferredTop=${preferredTop}`
                )
              } else {
                // 如果没有找到索引，使用默认位置
                const hasCrossColumnLines = crossPathMap.get(i)?.includes(nodeKey) || false
                const gapOffset = hasCrossColumnLines ? gapWithLine : 0
                preferredTop = minTop + gapOffset
              }
            }
          }
          // 2. 如果没有连接节点，考虑与源节点的对齐
          else if (hasDirectFromStart) {
            // 对于直接从起始位置连接的节点，使用基于索引的位置来避免重叠
            const currentCol = nodeColume[i]
            const nodeIndexInCol = currentCol.list.findIndex((b: any) => b.target === block.target)
            if (nodeIndexInCol >= 0) {
              preferredTop = minTop + nodeIndexInCol * (blockHeight + columeBlockSpace)
              console.log(`🔍 第一列节点定位: ${block.target}, index=${nodeIndexInCol}, preferredTop=${preferredTop}`)
            } else {
              // 如果没有明确的目标位置，使用基于索引的位置
              preferredTop = minTop
              console.log(`🔍 第一列节点定位: ${block.target}, index=unknown, preferredTop=${preferredTop}`)
            }
          }
          // 3. 其他情况：根据源节点位置确定位置
          else {
            const sourceNodeKeys = reverseConnectionMap.get(nodeKey) || []
            if (sourceNodeKeys.length > 0) {
              let totalTop = 0
              let validSources = 0
              sourceNodeKeys.forEach(sourceNodeKey => {
                const sourceNode = nodesMap.get(sourceNodeKey)
                if (sourceNode) {
                  totalTop += sourceNode.top + sourceNode.height / 2
                  validSources++
                }
              })

              if (validSources > 0) {
                const averageTop = totalTop / validSources
                preferredTop = averageTop - blockHeight / 2
              }
            }
          }

          // 4. 确保不超出边界
          preferredTop = Math.max(preferredTop, minTop)

          console.log(`🔍 节点 ${block.target} 最终preferredTop: ${preferredTop}`)

          // 5. 检查与已定位节点的重叠和预留空间，调整位置
          let finalTop = preferredTop
          let attempts = 0
          const maxAttempts = 100

          while (attempts < maxAttempts) {
            let hasConflict = false

            // 检查与已定位节点的重叠
            for (const positionedNode of positionedNodes) {
              const overlap = !(finalTop + blockHeight <= positionedNode.top || finalTop >= positionedNode.top + positionedNode.height)

              if (overlap) {
                hasConflict = true
                // 尝试向下移动
                finalTop = positionedNode.top + positionedNode.height + columeBlockSpace
                console.log(`🔍 节点 ${block.target} 检测到重叠，调整位置到: ${finalTop}`)
                break
              }
            }

            // 检查与预留空间的冲突
            if (!hasConflict) {
              for (const reservedSpace of reservedSpaces) {
                const conflict = !(finalTop + blockHeight <= reservedSpace.top || finalTop >= reservedSpace.top + reservedSpace.height)

                if (conflict) {
                  hasConflict = true
                  // 尝试向下移动
                  finalTop = reservedSpace.top + reservedSpace.height + columeBlockSpace
                  break
                }
              }
            }

            if (!hasConflict) {
              break
            }

            attempts++
          }

          // 5. 记录已定位的节点
          positionedNodes.push({
            nodeKey: nodeKey,
            top: finalTop,
            height: blockHeight
          })

          // 6. 设置节点位置
          nodesMap.set(nodeKey, {
            ...block,
            id: nodeKey, // 使用 nodeKey 作为 id
            top: finalTop,
            left: columeComMarginWithRouterCom + i * blockWidth + i * blockGap,
            height: blockHeight,
            width: blockWidth,
            columnIndex: i // 添加列索引字段
          })

          console.log(`🔍 节点 ${block.target} 最终位置: top=${finalTop}, preferredTop=${preferredTop}, height=${blockHeight}`)
        }
      )
    }

    return nodesMap
  }

  // 5. 生成边
  // function getEdges(groupByFromAndTarget: any[], nodesMap: Map<string, any>, fromCoinType: string, nodeColume: any[]) {
  //   const edges: {
  //     from: string
  //     to: string
  //     fromX: number
  //     fromY: number
  //     toX: number
  //     toY: number
  //     fromPercent: string
  //     isStart?: boolean
  //   }[] = []

  //   // 1. 生成从原始from出发的初始线
  //   nodeColume.forEach((col, colIndex) => {
  //     col.list.forEach((block: any) => {
  //       // 检查当前节点是否有从原始from的连接
  //       const fromGroupsWithStart = block.fromGroups.filter((fg: any) => fg.from === fromCoinType)

  //       if (fromGroupsWithStart.length > 0) {
  //         const nodeKey = `${colIndex}-${block.target}`
  //         const toNode = nodesMap.get(nodeKey)
  //         if (toNode) {
  //           // 计算fromPercent - 从groupByFromAndTarget中获取
  //           let fromPercent = '0'
  //           const fromGroup = groupByFromAndTarget.find(fg => fg.from === fromCoinType)
  //           if (fromGroup) {
  //             const targetGroup = fromGroup.targetGroups.find((tg: any) => tg.target === block.target)
  //             if (targetGroup) {
  //               fromPercent = targetGroup.fromPercent
  //           }
  //         }

  //         // 初始线的Y轴位置计算
  //         // 对于第一列的节点，优先尝试直接水平连接
  //         let fromY: number

  //         if (colIndex === 0) {
  //           // 第一列的初始线：优先使用目标节点的中心位置，让路径生成器决定是否需要绕过
  //           fromY = toNode.top + toNode.height / 2
  //         } else if (colIndex === nodeColume.length - 1) {
  //           // 最后一列的初始线：从上方绕过
  //           fromY = minTop + gapWithLine
  //         } else {
  //           // 中间列的初始线：从上方绕过
  //           fromY = minTop + gapWithLine
  //         }

  //         const edge = {
  //           from: fromCoinType,
  //           to: nodeKey, // 使用 nodeKey 而不是 target
  //           toBlockHeight: toNode.height,
  //           toNodeColumeIndex: toNode.columnIndex,
  //           fromNodeColumeIndex: colIndex,
  //           fromX: 0, // 初始线的x坐标固定为0
  //           fromY: fromY,
  //           toX: toNode.left,
  //           toY: toNode.top,
  //           fromPercent,
  //           isStart: true
  //         }
  //         edges.push(edge)
  //         console.log('🔍 添加初始边:', edge)
  //       }
  //     }
  //   })

  //   // 2. 生成node之间的连接线
  //   // 只生成相邻列之间的连接
  //   for (let i = 0; i < nodeColume.length - 1; i++) {
  //     const currentCol = nodeColume[i]
  //     const nextCol = nodeColume[i + 1]

  //     currentCol.list.forEach((fromBlock: any) => {
  //       const fromNodeKey = `${i}-${fromBlock.target}`
  //       const fromNode = nodesMap.get(fromNodeKey)
  //       if (!fromNode) {
  //         console.log(`🔍 找不到fromNode: ${fromNodeKey}`)
  //         return
  //       }

  //       console.log(`🔍 检查节点 ${fromNodeKey} 的连接关系`)

  //       // 只检查下一列的节点
  //       nextCol.list.forEach((toBlock: any) => {
  //         const hasConnection = toBlock.fromGroups.some((fg: any) => fg.from === fromBlock.target)
  //         const toNodeKey = `${i + 1}-${toBlock.target}`
  //         console.log(`🔍 检查 ${fromNodeKey} -> ${toNodeKey}:`, hasConnection)

  //         if (hasConnection) {
  //           const toNode = nodesMap.get(toNodeKey)
  //           if (toNode) {
  //             // 计算fromPercent
  //             let fromPercent = '0'
  //             const fromGroup = groupByFromAndTarget.find(fg => fg.from === fromBlock.target)
  //             if (fromGroup) {
  //               const targetGroup = fromGroup.targetGroups.find((tg: any) => tg.target === toBlock.target)
  //               if (targetGroup) {
  //                 fromPercent = targetGroup.fromPercent
  //               }
  //             }

  //             const edge = {
  //               from: fromNodeKey, // 使用 nodeKey
  //               to: toNodeKey, // 使用 nodeKey
  //               fromX: fromNode.left + fromNode.width, // 从源节点的右边界开始
  //               fromY: fromNode.top + fromNode.height / 2, // 使用节点中心
  //               toX: toNode.left, // 到目标节点的左边界
  //               toY: toNode.top,
  //               toBlockHeight: toNode.height,
  //               toNodeColumeIndex: toNode.columnIndex,
  //               fromNodeColumeIndex: fromNode.columnIndex,
  //               fromPercent
  //             }
  //             edges.push(edge)
  //             console.log('🔍 添加连接边:', edge)
  //           } else {
  //             console.log(`🔍 找不到toNode: ${toNodeKey}`)
  //           }
  //         }
  //       })
  //     })
  //   }

  //   console.log('🔍 最终生成的边数据:', edges)
  //   return edges
  // }

  // 5. 生成边
  function getEdges(groupByFromAndTarget: any[], nodesMap: Map<string, any>, fromCoinType: string, nodeColume: any[]) {
    const edges: {
      from: string
      to: string
      fromX: number
      fromY: number
      toX: number
      toY: number
      fromPercent: string
      isStart?: boolean
    }[] = []

    // 辅助函数：检查线段是否与节点相交
    // 检查路线是否有障碍，如果有则调整障碍节点的位置
    const checkAndAdjustObstacles = (
      fromY: number,
      toY: number,
      fromCol: number,
      toCol: number,
      excludeNodeKey: string,
      fromCoinType?: string,
      targetCoinType?: string
    ) => {
      // 检查中间列是否有节点阻挡
      for (let middleColIndex = fromCol + 1; middleColIndex <= toCol; middleColIndex++) {
        const middleCol = nodeColume[middleColIndex]
        middleCol.list.forEach((middleBlock: any) => {
          const middleNodeKey = `${middleColIndex}-${middleBlock.target}`
          const middleNode = nodesMap.get(middleNodeKey)

          if (middleNode && middleNodeKey !== excludeNodeKey) {
            // 检查 fromY 是否在中间列节点的范围内

            if (fromY >= middleNode.top && fromY <= middleNode.top + middleNode.height && toY < middleNode.top) {
              console.log('🚀 ~ checkAndAdjustObstacles ~ toY:', toY)
              // 将障碍节点移到 fromY + 20 的位置
              console.log(
                '🔍 检测到中间列障碍: ',
                middleNodeKey,
                ' 阻挡了 ',
                fromCoinType,
                ' -> ',
                targetCoinType,
                ' 的连线, fromY=',
                fromY,
                ' 调整前top=',
                middleNode.top,
                ' 调整后top=',
                fromY + 20
              )
              middleNode.top = fromY + 20
            }
          } else if (middleNode && middleNodeKey === excludeNodeKey) {
            // 调试：检查目标节点是否被错误调整
            console.log('🔍 中间列目标节点检查: ', middleNodeKey, ' fromY=', fromY, ' node.top=', middleNode.top, ' node.height=', middleNode.height)
          }
        })
      }

      // 检查到达列是否有节点阻挡（只检查目标节点本身，不包括同列其他节点）
      // 注意：这里我们不需要检查到达列的其他节点，因为同列节点不应该被当作障碍
      // 只有中间列的节点才可能成为障碍
    }

    // 1. 生成从原始from出发的初始线
    nodeColume.forEach((col, colIndex) => {
      col.list.forEach((block: any) => {
        // 检查当前节点是否有从原始from的连接
        const fromGroupsWithStart = block.fromGroups.filter((fg: any) => fg.from === fromCoinType)

        if (fromGroupsWithStart.length > 0) {
          const nodeKey = `${colIndex}-${block.target}`
          const toNode = nodesMap.get(nodeKey)
          if (toNode) {
            // 计算fromPercent - 从groupByFromAndTarget中获取
            let fromPercent = '0'
            const fromGroup = groupByFromAndTarget.find(fg => fg.from === fromCoinType)
            if (fromGroup) {
              const targetGroup = fromGroup.targetGroups.find((tg: any) => tg.target === block.target)
              if (targetGroup) {
                fromPercent = targetGroup.fromPercent
              }
            }

            // 初始线的Y轴位置计算
            let fromY: number

            // 计算到达该节点的连线数量
            const incomingConnectionsCount = block.fromGroups.length

            // 根据连线数量决定连接位置，不管在哪一列
            if (incomingConnectionsCount === 1) {
              // 只有一个连线，连接到节点中心
              fromY = toNode.top + toNode.height / 2
            } else {
              // 多个连线，连接到节点顶部
              fromY = toNode.top + 5
            }

            // 如果是横穿多列的线，从目标节点的 top + 10 位置开始检查
            if (colIndex > 0 && incomingConnectionsCount > 1) {
              const targetY = toNode.top + 10
              // 检查这个Y位置是否可以直线到达目标节点
              let canReach = true

              // 检查中间列是否有节点阻挡
              for (let i = 0; i < colIndex; i++) {
                const middleCol = nodeColume[i]
                middleCol.list.forEach((middleBlock: any) => {
                  const middleNodeKey = `${i}-${middleBlock.target}`
                  const middleNode = nodesMap.get(middleNodeKey)
                  if (middleNode) {
                    // 检查是否有节点阻挡了这个Y位置
                    if (targetY >= middleNode.top && targetY <= middleNode.top + middleNode.height) {
                      canReach = false
                    }
                  }
                })
              }

              if (canReach) {
                fromY = targetY
              }
            }

            const edge = {
              from: fromCoinType,
              to: nodeKey,
              toBlockHeight: toNode.height,
              toNodeColumeIndex: toNode.columnIndex,
              fromNodeColumeIndex: colIndex,
              fromX: 28, // 初始线的x坐标固定为28（左边留出28px边距）
              fromY: fromY,
              toX: toNode.left,
              toY: block.fromGroups.length === 1 ? toNode.top + toNode.height / 2 : toNode.top + 5, // 根据连线数量决定连接位置
              fromPercent,
              isStart: true,
              incomingConnectionsCount: incomingConnectionsCount // 添加这个信息
            }

            // 检查并调整障碍节点
            console.log(`🔍 检查障碍: ${fromCoinType} -> ${block.target}, fromY=${fromY}, excludeNodeKey=${nodeKey}`)
            checkAndAdjustObstacles(fromY, edge['toY'], 0, colIndex, nodeKey, fromCoinType, block.target)

            console.log(
              '🔍 初始线连接: ',
              block.target,
              ' fromGroups.length=',
              block.fromGroups.length,
              ' toY=',
              edge.toY,
              ' node.top=',
              toNode.top,
              ' node.height=',
              toNode.height,
              ' center=',
              toNode.top + toNode.height / 2
            )

            edges.push(edge)
          }
        }
      })
    })

    // 2. 生成node之间的连接线
    for (let i = 0; i < nodeColume.length - 1; i++) {
      const currentCol = nodeColume[i]
      const nextCol = nodeColume[i + 1]

      currentCol.list.forEach((fromBlock: any) => {
        const fromNodeKey = `${i}-${fromBlock.target}`
        const fromNode = nodesMap.get(fromNodeKey)
        if (!fromNode) {
          return
        }

        // 只检查下一列的节点
        nextCol.list.forEach((toBlock: any) => {
          const hasConnection = toBlock.fromGroups.some((fg: any) => fg.from === fromBlock.target)
          const toNodeKey = `${i + 1}-${toBlock.target}`

          if (hasConnection) {
            const toNode = nodesMap.get(toNodeKey)
            if (toNode) {
              // 计算fromPercent
              let fromPercent = '0'
              const fromGroup = groupByFromAndTarget.find(fg => fg.from === fromBlock.target)
              if (fromGroup) {
                const targetGroup = fromGroup.targetGroups.find((tg: any) => tg.target === toBlock.target)
                if (targetGroup) {
                  fromPercent = targetGroup.fromPercent
                }
              }

              // 检查连线是否会与其他节点冲突并调整位置
              const fromY = fromNode.top + fromNode.height / 2
              const toY = toNode.top + 5 // 连接到目标节点顶部

              const edge = {
                from: fromNodeKey,
                to: toNodeKey,
                fromX: fromNode.left + fromNode.width,
                fromY: fromY,
                toX: toNode.left,
                toY: toY,
                toBlockHeight: toNode.height,
                toNodeColumeIndex: toNode.columnIndex,
                fromNodeColumeIndex: fromNode.columnIndex,
                fromPercent
              }

              // 检查并调整障碍节点（只在跨列连线时检查）
              if (fromNode.columnIndex !== toNode.columnIndex) {
                console.log(`🔍 检查节点间障碍: ${fromBlock.target} -> ${toBlock.target}, fromY=${fromY}, excludeNodeKey=${toNodeKey}`)
                checkAndAdjustObstacles(fromY, edge['toY'], fromNode.columnIndex, toNode.columnIndex, toNodeKey, fromBlock.target, toBlock.target)
              }

              edges.push(edge)
            }
          }
        })
      })
    }

    // 添加从最后一列节点中心到 routerComWidth 的边
    const maxColumnIndex = Math.max(...Array.from(nodesMap.values()).map(node => node.columnIndex))
    const lastColumnNodes = Array.from(nodesMap.values()).filter(node => node.columnIndex === maxColumnIndex)
    if (lastColumnNodes.length > 0) {
      // 找到最后一列节点的中心位置
      const lastColumnNode = lastColumnNodes[0] // 假设只有一个最后一列节点
      const fromY = lastColumnNode.top + lastColumnNode.height / 2

      const finalEdge = {
        from: lastColumnNode.id,
        to: 'final',
        fromX: lastColumnNode.left + lastColumnNode.width,
        fromY: fromY,
        toX: routerComWidth - 28, // 右边留出28px边距
        toY: fromY,
        toBlockHeight: 0,
        toNodeColumeIndex: maxColumnIndex + 1,
        fromNodeColumeIndex: maxColumnIndex,
        fromPercent: '100',
        isFinal: true
      }

      edges.push(finalEdge)
      console.log('🔍 添加最终边:', finalEdge)
    }

    return { edges, adjustedNodes: [...nodesMap.values()] }
  }

  function getPanelHeight(nodes: { top: number; height: number }[]) {
    if (nodes.length === 0) return 0
    let minTop = Infinity
    let maxBottom = -Infinity
    nodes.forEach(node => {
      minTop = Math.min(minTop, node.top)
      maxBottom = Math.max(maxBottom, node.top + node.height)
    })
    return maxBottom - minTop
  }

  const toFormatSwapRouter = async () => {
    console.log('🚀 ~ toFormatSwapRouter ~ routerData:', routerData)
    if (routerData?.routerData?.routes) {
      // console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~  routerData:', JSON.stringify(routerData))

      const originRoutes = routerData?.routerData?.routes
      const originRoutesLen = routerData?.routerData?.routes?.length
      // const fromCoinType = originRoutes?.[0]?.path?.[0]?.from
      // const targetCoinType = originRoutes?.[originRoutesLen - 1]?.path?.[originRoutes?.[originRoutesLen - 1]?.path?.length - 1].target
      const fromCoinType = fromCoin!.coin_type
      const targetCoinType = toCoin!.coin_type
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ fromCoinType:', fromCoinType)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ targetCoinType:', targetCoinType)

      // const titlePaths = getTilePaths(routerData)
      const titlePaths = getTilePaths(routerData)
      // const titlePaths: any = routerData?.routerData?.routes?.[0]?.path || []
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ titlePaths:', titlePaths)

      const groupByFromAndTarget = getGroupByFromAndTarget(titlePaths)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ groupByFromAndTarget:', groupByFromAndTarget)

      const nodeColume = getNodeColume(originRoutes, fromCoinType, targetCoinType)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ nodeColume:', nodeColume)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ nodeColume length:', nodeColume.length)

      const nodesMap = getNodes(nodeColume, fromCoinType)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ nodes:', [...nodesMap.values()])

      const { edges, adjustedNodes } = getEdges(groupByFromAndTarget, nodesMap, fromCoinType, nodeColume)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ edges:', edges)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ adjustedNodes:', adjustedNodes)

      const panelHeight = getPanelHeight([...nodesMap.values()]) + minTop + 32
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ panelHeight:', panelHeight)

      setPanelHeight(panelHeight)
      console.log(`🔍 设置节点数据:`, adjustedNodes.length)
      console.log(
        `🔍 节点ID列表:`,
        adjustedNodes.map(node => node.id)
      )
      setgNodes(adjustedNodes)
      setEdges(edges)
      // 从 nodeKey 中提取 target，并去重
      const targets = Array.from(new Set([...nodesMap.values()].map((node: any) => node.target)))
      getTokenMap([...targets, fromCoinType])
    }

    setNewFormatSwapRouter(undefined)
  }

  const { getTokenListInfo } = useGetToken()
  const [tokenMap, setTokenMap] = useState<Map<string, any>>(new Map())

  const getTokenMap = async (coinTypeList: string[]) => {
    const res = await getTokenListInfo(coinTypeList as CoinType[])
    if (res && res?.size > 0) {
      setTokenMap(res)
    }
  }

  useEffect(() => {
    toFormatSwapRouter()
  }, [routerData])

  //暂时放一部分工具方法
  function getMaxPathLength(routerData?: SwapRouterData): number {
    if (!routerData?.routerData?.routes) return 0
    return routerData.routerData.routes.reduce((max, route) => {
      const pathLen = route.path?.length || 0
      return Math.max(max, pathLen)
    }, 0)
  }

  // 获取target块儿信息高度
  function getBlockHeight(fromGroups: any): number {
    let height = blockPadding * 2 + targetCoinInfoHeight
    fromGroups.forEach((item: any) => {
      height += fromToTargetBlockPaddingTopAndBottom * 2
      height += fromToTargetTitleHeight
      item.items.forEach((i: any) => {
        height += providerRowHeight
      })
    })

    return height
  }

  return {
    newFormatSwapRouter,
    nodes,
    edges,
    tokenMap,
    panelHeight
  }
}
