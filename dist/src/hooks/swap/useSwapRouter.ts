import useSwapStore from '@/store/swap/swap'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType } from '@cetus/types'
import { adjustTo100, d, fixDown, toLongCoinType } from '@cetus/utils'
import { Path } from '@cetusprotocol/aggregator-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { useState } from 'react'

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
  to: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  fromPercent: string
  isStart?: boolean
  segments?: {
    x1: number
    y1: number
    x2: number
    y2: number
  }[]
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
const fromToTargetMrTop = 8
const providerRowHeight = 22 // 设计图上只有12，因为不想用间距控制，直接把高度算高一点
// const minTop = 117
const minTop = 50
const zStartWidth = 55 // Z字形连线水平偏移距离
const routerComGap = 13
const pathToGap = 5

export function useSwapRouter(routerData?: any, originFromCoinType?: string, originToCoinType?: string) {
  // const { fetchTokenInfo } = useGetToken()
  const [newFormatSwapRouter, setNewFormatSwapRouter] = useState<any>({})
  const [nodes, setgNodes] = useState<any>([])
  const [edges, setEdges] = useState<any>([])
  const [panelHeight, setPanelHeight] = useState<number>(0)
  const { fromCoin, toCoin } = useSwapStore()
  const [allProviders, setAllProviders] = useState<string[]>([])
  const [resultColumes, setResultColumes] = useState<any[][]>([])

  // 新的优化方法：根据最大深度合理分配路径和列结构
  function getNodeColumeOptimized(paths: any[], fromCoinType: string, targetCoinType: string, maxDepth: number = 3): any[][] {
    console.log('🔍 getNodeColumeOptimized 开始')
    console.log('🔍 fromCoinType:', fromCoinType)
    console.log('🔍 targetCoinType:', targetCoinType)
    console.log('🔍 maxDepth:', maxDepth)

    // 收集所有唯一的节点
    const allNodes = new Set<string>()
    paths.forEach((path: any) => {
      allNodes.add(path.from)
      allNodes.add(path.target)
    })

    console.log('🔍 所有节点:', Array.from(allNodes))

    // 按层级分配节点
    const columns: any[][] = []

    // 第0列：从fromCoinType出发的节点
    const column0: any[] = []
    const firstColNodes = new Set<string>()

    paths.forEach((path: any) => {
      if (path.from === fromCoinType && path.target !== targetCoinType) {
        const target = path.target

        // 检查除了fromCoinType之外，是否还有其他节点到达这个target
        const hasOtherFroms = paths.some((otherPath: any) => otherPath.target === target && otherPath.from !== fromCoinType)
        let notCollectInfirst = false
        if (hasOtherFroms) {
          const allTargets = new Set(paths.filter((otherPath: any) => otherPath.from === target)?.map((item: any) => item?.target))
          const allTargetsArray = Array.from(allTargets)
          const allTargetsArrayOnlyEqualTargetCoinType = allTargetsArray.every((item: any) => item === targetCoinType)
          if (allTargetsArrayOnlyEqualTargetCoinType) {
            notCollectInfirst = true
          }
        }

        // 如果所有到达这个target的节点都是targetCoinType，则不放入第一列
        if (!notCollectInfirst) {
          firstColNodes.add(target)
        }
      }
    })

    // 为第一列节点收集路径
    firstColNodes.forEach(target => {
      const fromGroups: Record<string, any[]> = {}

      paths.forEach((path: any) => {
        if (path.from === fromCoinType && path.target === target) {
          if (!fromGroups[fromCoinType]) {
            fromGroups[fromCoinType] = []
          }
          fromGroups[fromCoinType].push(path)
        }
      })

      // 对每个 fromGroups 中的数组按 provider 和 feeRate 合并
      Object.keys(fromGroups).forEach(fromKey => {
        const providerFeeRateMap = new Map<string, any>()

        fromGroups[fromKey].forEach(path => {
          const provider = path.provider
          const feeRate = path.feeRate
          const key = `${provider}_${feeRate}`

          if (providerFeeRateMap.has(key)) {
            // 如果已存在相同 provider 和 feeRate，累加 amountIn 和 amountOut
            const existing = providerFeeRateMap.get(key)
            existing.amountIn = d(existing.amountIn)
              .plus(path.amountIn || '0')
              .toString()
            existing.amountOut = d(existing.amountOut)
              .plus(path.amountOut || '0')
              .toString()
          } else {
            // 如果不存在，直接添加
            providerFeeRateMap.set(key, {
              ...path,
              amountIn: path.amountIn || '0',
              amountOut: path.amountOut || '0'
            })
          }
        })

        // 将合并后的数据转换回数组
        fromGroups[fromKey] = Array.from(providerFeeRateMap.values())
      })

      column0.push({
        target: `0-${target}`,
        originalTarget: target,
        list: fromGroups
      })
    })

    if (column0.length > 0) {
      columns.push(column0)
      console.log('🔍 添加第0列，数据数量:', column0.length)
    }

    // 第1列：中间节点（既不是fromCoinType也不是targetCoinType）
    const column1: any[] = []
    const middleNodes = new Set<string>()

    paths.forEach((path: any) => {
      if (path.from !== fromCoinType && path.from !== targetCoinType) {
        middleNodes.add(path.from)
      }
      if (path.target !== fromCoinType && path.target !== targetCoinType) {
        middleNodes.add(path.target)
      }
    })

    // 为中间列节点收集路径
    middleNodes.forEach(node => {
      const fromGroups: Record<string, any[]> = {}
      paths.forEach((path: any) => {
        if (path.target === node) {
          // 如果from是fromCoinType，需要检查这个节点是否在第一列
          if (path.from === fromCoinType) {
            // 如果这个节点不在第一列，才收集这个路径
            if (!firstColNodes.has(node)) {
              if (!fromGroups[path.from]) {
                fromGroups[path.from] = []
              }
              fromGroups[path.from].push(path)
            }
          } else {
            // 如果from不是fromCoinType，直接收集
            if (!fromGroups[path.from]) {
              fromGroups[path.from] = []
            }
            fromGroups[path.from].push(path)
          }
        }
      })

      if (Object.keys(fromGroups).length > 0) {
        // 对每个 fromGroups 中的数组按 provider 和 feeRate 合并
        Object.keys(fromGroups).forEach(fromKey => {
          const providerFeeRateMap = new Map<string, any>()

          fromGroups[fromKey].forEach(path => {
            const provider = path.provider
            const feeRate = path.feeRate
            const key = `${provider}_${feeRate}`

            if (providerFeeRateMap.has(key)) {
              // 如果已存在相同 provider 和 feeRate，累加 amountIn 和 amountOut
              const existing = providerFeeRateMap.get(key)
              existing.amountIn = d(existing.amountIn)
                .plus(path.amountIn || '0')
                .toString()
              existing.amountOut = d(existing.amountOut)
                .plus(path.amountOut || '0')
                .toString()
            } else {
              // 如果不存在，直接添加
              providerFeeRateMap.set(key, {
                ...path,
                amountIn: path.amountIn || '0',
                amountOut: path.amountOut || '0'
              })
            }
          })

          // 将合并后的数据转换回数组
          fromGroups[fromKey] = Array.from(providerFeeRateMap.values())
        })

        column1.push({
          target: `1-${node}`,
          originalTarget: node,
          list: fromGroups
        })
      }
    })

    if (column1.length > 0) {
      columns.push(column1)
      console.log('🔍 添加第1列，数据数量:', column1.length)
    }

    // 第2列：targetCoinType
    const column2: any[] = []
    const targetFromGroups: Record<string, any[]> = {}

    paths.forEach((path: any) => {
      if (path.target === targetCoinType) {
        if (!targetFromGroups[path.from]) {
          targetFromGroups[path.from] = []
        }
        targetFromGroups[path.from].push(path)
      }
    })

    if (Object.keys(targetFromGroups).length > 0) {
      // 对每个 targetFromGroups 中的数组按 provider 和 feeRate 合并
      Object.keys(targetFromGroups).forEach(fromKey => {
        const providerFeeRateMap = new Map<string, any>()

        targetFromGroups[fromKey].forEach(path => {
          const provider = path.provider
          const feeRate = path.feeRate
          const key = `${provider}_${feeRate}`

          if (providerFeeRateMap.has(key)) {
            // 如果已存在相同 provider 和 feeRate，累加 amountIn 和 amountOut
            const existing = providerFeeRateMap.get(key)
            existing.amountIn = d(existing.amountIn)
              .plus(path.amountIn || '0')
              .toString()
            existing.amountOut = d(existing.amountOut)
              .plus(path.amountOut || '0')
              .toString()
          } else {
            // 如果不存在，直接添加
            providerFeeRateMap.set(key, {
              ...path,
              amountIn: path.amountIn || '0',
              amountOut: path.amountOut || '0'
            })
          }
        })

        // 将合并后的数据转换回数组
        targetFromGroups[fromKey] = Array.from(providerFeeRateMap.values())
      })

      column2.push({
        target: `2-${targetCoinType}`,
        originalTarget: targetCoinType,
        list: targetFromGroups
      })
    }

    if (column2.length > 0) {
      columns.push(column2)
      console.log('🔍 添加第2列，数据数量:', column2.length)
    }

    // 如果列数大于2，进行额外处理
    // if (columns.length > 2) {
    //   console.log('🔍 列数大于2，开始处理第一列节点')

    //   const firstCol = columns[0] || []
    //   const secondCol = columns[1] || []
    //   const thirdCol = columns[2] || []

    //   // 找到第三列的目标节点
    //   const thirdColTarget = thirdCol[0]?.originalTarget || thirdCol[0]?.target

    //   if (thirdColTarget) {
    //     // 遍历第一列节点，检查哪些需要移动到第二列
    //     const nodesToMove: any[] = []
    //     const nodesToKeep: any[] = []

    //     firstCol.forEach((node: any) => {
    //       const originalTarget = node.originalTarget || node.target

    //       // 检查该节点是否只到达第三列的一个节点
    //       const outgoingPaths = paths.filter((path: any) => path.from === originalTarget)
    //       const onlyReachesThirdCol = outgoingPaths.length === 1 && outgoingPaths[0].target === thirdColTarget

    //       if (onlyReachesThirdCol) {
    //         console.log(`🔍 节点 ${originalTarget} 只到达第三列，移动到第二列`)
    //         nodesToMove.push(node)
    //       } else {
    //         console.log(`🔍 节点 ${originalTarget} 保持在第一列`)
    //         nodesToKeep.push(node)
    //       }
    //     })

    //     // 更新第一列和第二列
    //     if (nodesToMove.length > 0) {
    //       // 更新第一列，只保留不需要移动的节点
    //       columns[0] = nodesToKeep
    //       console.log(`🔍 第一列保留 ${nodesToKeep.length} 个节点`)

    //       // 将需要移动的节点添加到第二列
    //       columns[1] = [...secondCol, ...nodesToMove]
    //       console.log(`🔍 第二列新增 ${nodesToMove.length} 个节点`)
    //     }
    //   }
    // }

    return columns
  }

  // 4. 生成画布需要的节点数据，包含到时候div定位的位置top, left和div的高度height和width(with是固定的)
  function getNodes(nodeColume: any, fromCoinType: string, paths: any[]) {
    const columeNum = nodeColume.length
    const columeComWidth = columeNum * blockWidth + (columeNum - 1) * blockGap
    const columeComMarginWithRouterCom = (routerComWidth - columeComWidth) / 2

    const nodesMap = new Map<string, Node>()
    const orderedNodeColume: any[][] = []

    // 1. 首先计算每个节点的height
    const nodeHeights = new Map<string, number>()
    nodeColume.forEach((col: any, colIndex: number) => {
      col.forEach((block: any) => {
        const nodeKey = `${colIndex}-${block.target}`
        const height = getBlockHeight(block.list)
        console.log(`node高度, nodeKey=${nodeKey}, height=${height}`)
        nodeHeights.set(nodeKey, height)
      })
    })

    // 2. 根据列数采用不同的布局策略
    if (columeNum === 1) {
      // 情况1: 只有1列，上下左右居中放置
      console.log('🔍 情况1: 只有1列')
      const col = nodeColume[0]
      let currentTop = minTop

      col.forEach((block: any) => {
        const nodeKey = `0-${block.target}`
        const blockHeight = nodeHeights.get(nodeKey) || 0

        nodesMap.set(nodeKey, {
          ...block,
          id: nodeKey,
          top: currentTop,
          left: columeComMarginWithRouterCom,
          height: blockHeight,
          width: blockWidth,
          columnIndex: 0
        })

        console.log(`🔍 放置单列节点 ${block.target}: top=${currentTop}`)
        currentTop += blockHeight + columeBlockSpace
      })

      orderedNodeColume.push(col)
    } else if (columeNum === 2) {
      // 情况2: 只有2列
      console.log('🔍 情况2: 只有2列')

      const firstCol = nodeColume[0]
      const secondCol = nodeColume[1]

      // 检查是否有fromCoinType直接到第二列
      const hasFromCoinToSecondCol = secondCol.some((secondBlock: any) => {
        return secondBlock.list && secondBlock.list[fromCoinType]
      })

      // 第一列：按amountIn降序排序
      const sortedFirstCol = firstCol
        .map((block: any) => {
          const totalAmountIn = block.list[fromCoinType]?.reduce((sum: number, item: any) => sum + parseFloat(item.amountIn || '0'), 0) || 0
          return { block, totalAmountIn }
        })
        .sort((a: any, b: any) => b.totalAmountIn - a.totalAmountIn)
        .map(({ block }: { block: any; totalAmountIn: number }) => block)

      // 放置第一列
      let currentTop = hasFromCoinToSecondCol ? minTop + gapWithLine : minTop
      sortedFirstCol.forEach((block: any) => {
        const nodeKey = `0-${block.target}`
        const blockHeight = nodeHeights.get(nodeKey) || 0

        nodesMap.set(nodeKey, {
          ...block,
          id: nodeKey,
          top: currentTop,
          left: columeComMarginWithRouterCom,
          height: blockHeight,
          width: blockWidth,
          columnIndex: 0
        })

        console.log(`🔍 放置第一列节点 ${block.target}: top=${currentTop}`)
        currentTop += blockHeight + columeBlockSpace
      })

      // 第二列：从minTop开始
      let secondColTop = minTop
      secondCol.forEach((block: any) => {
        const nodeKey = `1-${block.target}`
        const blockHeight = nodeHeights.get(nodeKey) || 0

        nodesMap.set(nodeKey, {
          ...block,
          id: nodeKey,
          top: secondColTop,
          left: columeComMarginWithRouterCom + blockWidth + blockGap,
          height: blockHeight,
          width: blockWidth,
          columnIndex: 1
        })

        console.log(`🔍 放置第二列节点 ${block.target}: top=${secondColTop}`)
        secondColTop += blockHeight + columeBlockSpace
      })

      orderedNodeColume.push(sortedFirstCol, secondCol)
    } else {
      // 情况3: 有三列
      console.log('🔍 情况3: 有三列')

      const firstCol = nodeColume[0]
      const secondCol = nodeColume[1]
      const thirdCol = nodeColume[2]
      const targetCoinType = thirdCol[0]?.originalTarget || thirdCol[0]?.target

      // 确定第一列的顺序
      const firstColAnalysis = firstCol.map((block: any) => {
        const target = block.originalTarget || block.target
        const nodeKey = `0-${block.target}`
        const height = nodeHeights.get(nodeKey) || 0

        // 检查是否有直接到targetCoinType的连接

        const secondColHaveEqualTarget = secondCol.some((secondBlock: any) => {
          return secondBlock.originalTarget == block.originalTarget
        })

        const hasDirectToTarget = thirdCol?.[0]?.list?.[block?.originalTarget] && !secondColHaveEqualTarget

        // 检查是否有到第二列的连接
        const hasConnectionToSecond = secondCol.some((secondBlock: any) => {
          const secondTarget = secondBlock.originalTarget || secondBlock.target
          return paths.some((path: any) => {
            return path.from === target && path.target === secondTarget
          })
        })

        // 检查第二列目标节点是否只有这一个from
        const secondColTargets: string[] = []
        secondCol.forEach((secondBlock: any) => {
          const secondTarget = secondBlock.originalTarget || secondBlock.target
          if (paths.some((path: any) => path.from === target && path.target === secondTarget)) {
            secondColTargets.push(secondTarget)
          }
        })

        // 计算优先级
        let priority = 6
        if (hasDirectToTarget && !hasConnectionToSecond) {
          priority = 1 // 只到最后一列（最高优先级）
        } else if (hasDirectToTarget && hasConnectionToSecond) {
          priority = 2 // 既到最后一列节点，也到第二列节点的
        } else if (!hasDirectToTarget && hasConnectionToSecond) {
          if (secondColTargets.length === 1) {
            const singleTarget = secondColTargets[0]
            const secondBlock = secondCol.find((block: any) => {
              const secondTarget = block.originalTarget || block.target
              return secondTarget === singleTarget
            })
            const currentColFromCount = secondBlock ? Object.keys(secondBlock.list || {}).length : 0

            if (currentColFromCount === 1) {
              priority = 3 // 只到第二列，且只到一个节点，且到达节点只有这一个from
            } else {
              priority = 5 // 只到第二列节点，且只到这一个节点的，但到达节点有多个from
            }
          } else {
            // 检查所有到达的节点是否都只有一个from
            const allTargetsHaveSingleFrom = secondColTargets.every((target: string) => {
              const secondBlock = secondCol.find((block: any) => {
                const secondTarget = block.originalTarget || block.target
                return secondTarget === target
              })
              const currentColFromCount = secondBlock ? Object.keys(secondBlock.list || {}).length : 0
              return currentColFromCount === 1
            })

            if (allTargetsHaveSingleFrom) {
              priority = 4 // 只到第二列节点，且到多个节点，且到达的所有节点只有这一个from
            } else {
              priority = 6 // 其他情况
            }
          }
        }

        return {
          block,
          target,
          height,
          hasDirectToTarget,
          hasConnectionToSecond,
          secondColTargets,
          priority
        }
      })

      // 按优先级排序第一列
      firstColAnalysis.sort((a: any, b: any) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        // 优先级相同时，按amountIn排序
        const aAmountIn = a.block.list[fromCoinType]?.reduce((sum: number, item: any) => sum + parseFloat(item.amountIn || '0'), 0) || 0
        const bAmountIn = b.block.list[fromCoinType]?.reduce((sum: number, item: any) => sum + parseFloat(item.amountIn || '0'), 0) || 0
        return bAmountIn - aAmountIn
      })

      // 检查是否有fromCoinType直接到targetCoinType
      const hasFromCoinToTarget = thirdCol.some((thirdBlock: any) => {
        const thirdTarget = thirdBlock.originalTarget || thirdBlock.target
        return thirdTarget === targetCoinType && thirdBlock.list && thirdBlock.list[fromCoinType]
      })

      const hasFromCoinToSecondCol = secondCol.some((secondBlock: any) => {
        return secondBlock.list && secondBlock.list[fromCoinType]
      })

      // 确定第一列起始位置
      let firstColStartTop = hasFromCoinToTarget ? minTop + gapWithLine : minTop // 因为有三列且有fromCoinType到targetCoinType

      // 如果有fromCoinType到第二列节点，且该节点只有一个from，则加上该节点的高度和间距
      if (hasFromCoinToSecondCol) {
        const fromCoinSecondColBlock = secondCol.find((secondBlock: any) => {
          return secondBlock.list && secondBlock.list[fromCoinType]
        })

        if (fromCoinSecondColBlock) {
          const fromCount = Object.keys(fromCoinSecondColBlock.list || {}).length
          if (fromCount === 1) {
            // 该节点只有一个from，加上其高度和间距
            const secondBlockKey = `1-${fromCoinSecondColBlock.target}`
            const secondBlockHeight = nodeHeights.get(secondBlockKey) || 0
            firstColStartTop += secondBlockHeight + columeBlockSpace
          } else {
            firstColStartTop += gapWithLine
          }
        }
      }

      // 特殊处理：如果fromCoinType直接到第二列节点，且第一列的第一个节点有直接到第三列节点
      if (hasFromCoinToSecondCol && firstColAnalysis.length > 0) {
        const firstNode = firstColAnalysis[0]
        if (firstNode.hasDirectToTarget && firstColStartTop <= minTop + gapWithLine) {
          console.log('🔍 检测到特殊情况：fromCoinType直接到第二列，且第一列第一个节点直接到第三列')
          firstColStartTop += 50 // 在原有基础上再加50
          console.log(`🔍 第一列起始位置调整为: ${firstColStartTop}`)
        } else {
          firstColStartTop += columeBlockSpace
        }
      }

      // 放置第一列
      let currentColume1Top = firstColStartTop
      firstColAnalysis.forEach((item: any, index: number) => {
        const nodeKey = `0-${item.block.target}`
        const blockHeight = nodeHeights.get(nodeKey) || 0

        nodesMap.set(nodeKey, {
          ...item.block,
          id: nodeKey,
          top: currentColume1Top,
          left: columeComMarginWithRouterCom,
          height: blockHeight,
          width: blockWidth,
          columnIndex: 0
        })

        console.log(`🔍 放置第一列节点 ${item.target}: top=${currentColume1Top}`)

        // 计算下一个节点的位置
        if (index < firstColAnalysis.length - 1) {
          // 第一列节点依次放置，只加上当前节点高度和间距
          currentColume1Top += blockHeight + columeBlockSpace
        }
      })

      // 确定第二列的顺序
      const secondColOrder: any[] = []

      // 从from等于fromCoinType的放在第一个
      const fromCoinSecondCol = secondCol.find((block: any) => {
        return block.list && block.list[fromCoinType]
      })
      if (fromCoinSecondCol) {
        secondColOrder.push(fromCoinSecondCol)
      }

      // 其他根据第一列每个节点到达第二列情况排序
      firstColAnalysis.forEach((firstItem: any) => {
        firstItem.secondColTargets.forEach((secondTarget: string) => {
          const secondBlock = secondCol.find((block: any) => {
            return (block.originalTarget || block.target) === secondTarget
          })
          if (secondBlock && !secondColOrder.some(item => item.target === secondBlock.target)) {
            secondColOrder.push(secondBlock)
          }
        })
      })

      // 添加第一列没有连接到的第二列节点
      secondCol.forEach((secondBlock: any) => {
        const secondTarget = secondBlock.originalTarget || secondBlock.target
        if (!secondColOrder.some(item => (item.originalTarget || item.target) === secondTarget)) {
          secondColOrder.push(secondBlock)
        }
      })

      // 确定第二列起始位置
      let secondColStartTop = hasFromCoinToTarget ? minTop + gapWithLine : minTop

      // 检查第一列是否有节点既到第二列也直接到最后一列
      const hasFirstColToBoth = firstColAnalysis.some((item: any) => {
        return item.hasDirectToTarget && item.hasConnectionToSecond
      })

      if (hasFirstColToBoth) {
        // 如果第一列有节点既到第二列也直接到最后一列，第二列多留出gapWithLine距离
        secondColStartTop += gapWithLine
      }

      // 判断第一列是否有直接到最后一列的
      const hasFirstColToTargetNum = firstColAnalysis.filter((item: any) => {
        return item.hasDirectToTarget && !item.hasConnectionToSecond
      })?.length

      // 放置第二列
      let currentColume2Top = secondColStartTop
      secondColOrder.forEach((block: any, index: number) => {
        const nodeKey = `1-${block.target}`
        const blockHeight = nodeHeights.get(nodeKey) || 0
        if (index === 0 && hasFirstColToTargetNum > 0) {
          if (!hasFromCoinToSecondCol) {
            currentColume2Top += hasFirstColToTargetNum * 120 + hasFirstColToTargetNum * columeBlockSpace
          } else {
            currentColume2Top += gapWithLine
          }
        }

        nodesMap.set(nodeKey, {
          ...block,
          id: nodeKey,
          top: currentColume2Top,
          left: columeComMarginWithRouterCom + blockWidth + blockGap,
          height: blockHeight,
          width: blockWidth,
          columnIndex: 1
        })

        console.log(`🔍 放置第二列节点 ${block.originalTarget || block.target}: top=${currentColume2Top}  blockHeight=${blockHeight}`)
        currentColume2Top += blockHeight + columeBlockSpace
      })

      // 放置第三列
      let currentColume3Top = minTop
      thirdCol.forEach((block: any) => {
        const nodeKey = `2-${block.target}`
        const blockHeight = nodeHeights.get(nodeKey) || 0

        nodesMap.set(nodeKey, {
          ...block,
          id: nodeKey,
          top: currentColume3Top,
          left: columeComMarginWithRouterCom + 2 * blockWidth + 2 * blockGap,
          height: blockHeight,
          width: blockWidth,
          columnIndex: 2
        })

        console.log(`🔍 放置第三列节点 ${block.target}: top=${currentColume3Top}`)
        currentColume3Top += blockHeight + columeBlockSpace
      })

      orderedNodeColume.push(
        firstColAnalysis.map((item: any) => item.block),
        secondColOrder,
        thirdCol
      )
    }

    return { nodesMap, orderedNodeColume }
  }

  // 根据nodeColume重新生成正确的百分比数据
  function generateNodePercentages(nodeColume: any[], paths: any[], fromCoinType: string) {
    console.log('🚀 ~ generateNodePercentages ~ nodeColume:', nodeColume)
    const nodePercentages: Record<string, Record<string, { fromPercent: string }>> = {}

    // 1. 先处理fromCoinType的百分比

    // 收集所有列中list里存在fromCoinType为key的数据
    const fromCoinTypeTargets: { target: string; amountIn: number; colIndex: number }[] = []

    nodeColume.forEach((col, colIndex) => {
      col.forEach((block: any) => {
        const originalTarget = block.originalTarget || block.target
        if (block.list && block.list[fromCoinType]) {
          const totalAmountIn = block.list[fromCoinType].reduce((sum: number, item: any) => {
            return sum + parseFloat(item.amountIn || '0')
          }, 0)
          fromCoinTypeTargets.push({
            target: originalTarget,
            amountIn: totalAmountIn,
            colIndex
          })
        }
      })
    })

    console.log('🔍 fromCoinType的目标:', fromCoinTypeTargets)

    if (fromCoinTypeTargets.length > 0) {
      const totalFromAmountIn = fromCoinTypeTargets.reduce((sum, item) => sum + item.amountIn, 0)

      // 先计算原始百分比
      const rawPercents: number[] = []
      fromCoinTypeTargets.forEach(({ amountIn }) => {
        const rawPercent = totalFromAmountIn > 0 ? fixDown(d(amountIn).div(totalFromAmountIn).mul(100).toString(), 0) : 0
        rawPercents.push(Number(rawPercent) || 1)
      })

      const rawAjuestPercents = adjustTo100(rawPercents)

      fromCoinTypeTargets.forEach(({ target }, index) => {
        const fromPercent = rawAjuestPercents[index]?.toString() || '0'

        if (!nodePercentages[fromCoinType]) {
          nodePercentages[fromCoinType] = {}
        }
        nodePercentages[fromCoinType][target] = { fromPercent }

        console.log(`🔍 设置fromCoinType百分比: ${fromCoinType} -> ${target}: ${fromPercent}%`)
      })
    }

    // 2. 处理第一列节点的百分比
    if (nodeColume.length > 0) {
      const firstCol = nodeColume[0]
      console.log('🔍 处理第一列节点的百分比')

      firstCol.forEach((block: any) => {
        const originalTarget = block.originalTarget || block.target
        const nodeKey = `0-${originalTarget}`

        console.log(`🔍 处理第一列节点: ${originalTarget}`)

        // 收集所有目标
        const allTargets: { target: string; amountIn: number }[] = []

        // 1. 检查第二列是否有节点的originalTarget等于当前第一列节点的originalTarget
        let hasSameTargetInSecondCol = false
        if (nodeColume.length > 1) {
          const secondCol = nodeColume[1]
          hasSameTargetInSecondCol = secondCol.some((secondBlock: any) => {
            const secondTarget = secondBlock.originalTarget || secondBlock.target
            return secondTarget === originalTarget
          })
        }

        // 2. 如果第二列有相同的originalTarget，只检查第二列
        if (hasSameTargetInSecondCol) {
          const secondCol = nodeColume[1]
          secondCol.forEach((secondBlock: any) => {
            const secondTarget = secondBlock.originalTarget || secondBlock.target
            if (secondBlock.list && secondBlock.list[originalTarget]) {
              const totalAmountIn = secondBlock.list[originalTarget].reduce((sum: number, item: any) => {
                return sum + parseFloat(item.amountIn || '0')
              }, 0)
              allTargets.push({
                target: secondTarget,
                amountIn: totalAmountIn
              })
            }
          })
        } else {
          // 3. 如果第二列没有相同的originalTarget，检查后面所有列
          for (let colIndex = 1; colIndex < nodeColume.length; colIndex++) {
            const currentCol = nodeColume[colIndex]
            currentCol.forEach((block: any) => {
              const blockTarget = block.originalTarget || block.target
              if (block.list && block.list[originalTarget]) {
                const totalAmountIn = block.list[originalTarget].reduce((sum: number, item: any) => {
                  return sum + parseFloat(item.amountIn || '0')
                }, 0)
                allTargets.push({
                  target: blockTarget,
                  amountIn: totalAmountIn
                })
              }
            })
          }
        }

        console.log(`🔍 ${originalTarget} 的所有目标:`, allTargets)

        if (allTargets.length > 0) {
          const totalAmountIn = allTargets.reduce((sum, item) => sum + item.amountIn, 0)

          // 先计算原始百分比
          const rawPercents: number[] = []
          allTargets.forEach(({ amountIn }) => {
            const rawPercent = totalAmountIn > 0 ? fixDown(d(amountIn).div(totalAmountIn).mul(100).toString(), 0) : 0
            rawPercents.push(Number(rawPercent) || 1)
          })

          const rawAjuestPercents = adjustTo100(rawPercents)

          allTargets.forEach(({ target }, index) => {
            const fromPercent = rawAjuestPercents[index]

            if (!nodePercentages[nodeKey]) {
              nodePercentages[nodeKey] = {}
            }
            nodePercentages[nodeKey][target] = { fromPercent: fromPercent.toString() }

            console.log(`🔍 设置第一列节点百分比: ${originalTarget} -> ${target}: ${fromPercent}%`)
          })
        }
      })
    }

    // 3. 处理第二列节点的百分比（如果有第三列的话）
    if (nodeColume.length > 2) {
      const secondCol = nodeColume[1]
      console.log('🔍 处理第二列节点的百分比')

      secondCol.forEach((block: any) => {
        const originalTarget = block.originalTarget || block.target
        const nodeKey = `1-${originalTarget}`

        console.log(`🔍 处理第二列节点: ${originalTarget}`)

        // 检查第三列
        const thirdColTargets: { target: string; amountIn: number }[] = []
        const thirdCol = nodeColume[2]
        thirdCol.forEach((thirdBlock: any) => {
          const thirdTarget = thirdBlock.originalTarget || thirdBlock.target
          if (thirdBlock.list && thirdBlock.list[originalTarget]) {
            const totalAmountIn = thirdBlock.list[originalTarget].reduce((sum: number, item: any) => {
              return sum + parseFloat(item.amountIn || '0')
            }, 0)
            thirdColTargets.push({
              target: thirdTarget,
              amountIn: totalAmountIn
            })
          }
        })

        console.log(`🔍 ${originalTarget} 在第三列的目标:`, thirdColTargets)

        if (thirdColTargets.length > 0) {
          const totalAmountIn = thirdColTargets.reduce((sum, item) => sum + item.amountIn, 0)

          // 先计算原始百分比
          const rawPercents: number[] = []
          thirdColTargets.forEach(({ amountIn }) => {
            const rawPercent = totalAmountIn > 0 ? fixDown(d(amountIn).div(totalAmountIn).mul(100).toString(), 0) : 0
            rawPercents.push(Number(rawPercent) || 1)
          })

          const rawAjuestPercents = adjustTo100(rawPercents)

          thirdColTargets.forEach(({ target }, index) => {
            const fromPercent = rawAjuestPercents[index]

            if (!nodePercentages[nodeKey]) {
              nodePercentages[nodeKey] = {}
            }
            nodePercentages[nodeKey][target] = { fromPercent: fromPercent.toString() }

            console.log(`🔍 设置第二列节点百分比: ${originalTarget} -> ${target}: ${fromPercent}%`)
          })
        }
      })
    }

    return nodePercentages
  }

  // 辅助方法：根据列索引和coinType查找节点
  function findNodeByColumnAndCoinType(colIndex: number, coinType: string, nodesMap: Map<string, any>): any {
    for (const [key, node] of nodesMap.entries()) {
      if (key.startsWith(`${colIndex}-`) && (node.originalTarget === coinType || node.target === coinType)) {
        return node
      }
    }
    return null
  }

  function getEdges(nodePercentages: any, nodesMap: Map<string, any>, fromCoinType: string, nodeColume: any[], paths: any[]) {
    const edges: {
      from: string
      to: string
      fromX: number
      fromY: number
      toX: number
      toY: number
      fromPercent: string
      isStart?: boolean
      isFinal?: boolean
      segments?: any[]
    }[] = []

    console.log('🔍 开始生成连接线')

    // 1. 先确定fromCoinType出发的线
    console.log('🔍 处理fromCoinType出发的线')

    // 1.1 从fromCoinType到targetCoinType的线
    const targetCoinType = nodeColume[nodeColume.length - 1]?.[0]?.originalTarget || nodeColume[nodeColume.length - 1]?.[0]?.target
    if (targetCoinType) {
      const targetNode = findNodeByColumnAndCoinType(nodeColume.length - 1, targetCoinType, nodesMap)

      if (targetNode) {
        const fromPercent = nodePercentages[fromCoinType]?.[targetCoinType]?.fromPercent || '0'

        // 检查是否有fromCoinType直接到targetCoinType的路径
        const hasDirectPath =
          nodeColume.length > 0 &&
          nodeColume[nodeColume.length - 1].some((lastBlock: any) => {
            const lastTarget = lastBlock.originalTarget || lastBlock.target
            return lastTarget === targetCoinType && lastBlock.list && lastBlock.list[fromCoinType]
          })

        // 只有当有直接路径时才生成这条线
        if (hasDirectPath) {
          // 检查是否是单列情况（只有一列，且只有一个节点）
          const isSingleColumn = nodeColume.length === 1 && nodeColume[0].length === 1

          if (isSingleColumn) {
            // 单列情况：到达节点的中心位置
            edges.push({
              from: fromCoinType,
              to: targetNode.id,
              fromX: routerComGap,
              fromY: targetNode.top + targetNode.height / 2,
              toX: targetNode.left - pathToGap,
              toY: targetNode.top + targetNode.height / 2,
              fromPercent,
              isStart: true
            })
            console.log(`🔍 添加fromCoinType到targetCoinType的线（单列）: ${fromPercent}%`)
          } else {
            // 多列情况：使用固定的跨列位置
            edges.push({
              from: fromCoinType,
              to: targetNode.id,
              fromX: routerComGap,
              fromY: minTop + 10,
              toX: targetNode.left - pathToGap,
              toY: minTop + 10,
              fromPercent,
              isStart: true
            })
            console.log(`🔍 添加fromCoinType到targetCoinType的线（跨列）: ${fromPercent}%`)
          }
        } else {
          console.log(`🔍 跳过fromCoinType到targetCoinType的线，因为fromPercent为0`)
        }
      }
    }

    // 1.2 从fromCoinType到其他列的线（排除targetCoinType，因为已经在1.1中处理了）
    for (let colIndex = 0; colIndex < nodeColume.length; colIndex++) {
      const currentCol = nodeColume[colIndex]

      currentCol.forEach((block: any) => {
        const originalTarget = block.originalTarget || block.target
        const currentNode = findNodeByColumnAndCoinType(colIndex, originalTarget, nodesMap)

        if (!currentNode) return

        // 检查是否有fromCoinType到当前节点的连接
        const hasFromCoinConnection = block.list && block.list[fromCoinType]
        if (!hasFromCoinConnection) return

        // 跳过targetCoinType，因为已经在1.1中处理了
        if (originalTarget === targetCoinType) return

        const fromPercent = nodePercentages[fromCoinType]?.[originalTarget]?.fromPercent || '0'

        // 1.3 列数大于2，从fromCoinType到第二列节点的处理
        if (nodeColume.length > 2 && colIndex === 1) {
          const fromCount = Object.keys(block.list || {}).length

          if (fromCount === 1) {
            // 到达节点只有这一个from
            edges.push({
              from: fromCoinType,
              to: currentNode.id,
              fromX: routerComGap,
              fromY: currentNode.top + currentNode.height / 2,
              toX: currentNode.left - pathToGap,
              toY: currentNode.top + currentNode.height / 2,
              fromPercent,
              isStart: true
            })
          } else {
            // 到达节点有多个不同from
            edges.push({
              from: fromCoinType,
              to: currentNode.id,
              fromX: routerComGap,
              fromY: currentNode.top + 10,
              toX: currentNode.left - pathToGap,
              toY: currentNode.top + 10,
              fromPercent,
              isStart: true
            })
          }
        } else {
          // 1.4 其他fromCoinType到第一列的线
          edges.push({
            from: fromCoinType,
            to: currentNode.id,
            fromX: routerComGap,
            fromY: currentNode.top + currentNode.height / 2,
            toX: currentNode.left - pathToGap,
            toY: currentNode.top + currentNode.height / 2,
            fromPercent,
            isStart: true
          })
        }

        console.log(`🔍 添加fromCoinType到${originalTarget}的线: ${fromPercent}%`)
      })
    }

    // 2. 确定节点到节点的线
    console.log('🔍 处理节点到节点的线')

    // 为同一个节点的多条出发线分配不同的Y坐标
    const nodeOutgoingCounts = new Map<string, number>()
    const nodeOutgoingIndices = new Map<string, number>()

    // 先统计每个节点的出发线数量
    for (let colIndex = 0; colIndex < nodeColume.length; colIndex++) {
      const currentCol = nodeColume[colIndex]

      currentCol.forEach((block: any) => {
        const originalTarget = block.originalTarget || block.target
        const currentNode = findNodeByColumnAndCoinType(colIndex, originalTarget, nodesMap)

        if (!currentNode) return

        // 获取当前节点的所有from连接
        const fromConnections = block.list || {}

        Object.entries(fromConnections).forEach(([fromToken, targetData]: [string, any]) => {
          if (fromToken === fromCoinType) return // 跳过fromCoinType的连接

          // 找到fromToken对应的节点
          let fromNode: any = null

          for (let prevColIndex = colIndex - 1; prevColIndex >= 0; prevColIndex--) {
            fromNode = findNodeByColumnAndCoinType(prevColIndex, fromToken, nodesMap)
            if (fromNode) break
          }

          if (!fromNode) return

          // 统计出发线数量
          const fromNodeId = fromNode.id
          const currentCount = nodeOutgoingCounts.get(fromNodeId) || 0
          nodeOutgoingCounts.set(fromNodeId, currentCount + 1)
        })
      })
    }

    // 处理所有节点到节点的连接
    for (let colIndex = 0; colIndex < nodeColume.length; colIndex++) {
      const currentCol = nodeColume[colIndex]

      currentCol.forEach((block: any) => {
        const originalTarget = block.originalTarget || block.target
        const currentNode = findNodeByColumnAndCoinType(colIndex, originalTarget, nodesMap)

        if (!currentNode) return

        // 获取当前节点的所有from连接
        const fromConnections = block.list || {}

        Object.entries(fromConnections).forEach(([fromToken, targetData]: [string, any]) => {
          if (fromToken === fromCoinType) return // 跳过fromCoinType的连接

          // 找到fromToken对应的节点
          let fromNode: any = null

          for (let prevColIndex = colIndex - 1; prevColIndex >= 0; prevColIndex--) {
            fromNode = findNodeByColumnAndCoinType(prevColIndex, fromToken, nodesMap)
            if (fromNode) break
          }

          if (!fromNode) return

          const fromNodeId = fromNode.id

          // 检查是否需要绕行连接
          const fromCenterY = fromNode.top + fromNode.height / 2
          let needZigzag = false

          // 计算当前节点的出发线索引，用于分配不同的Y坐标
          const currentOutgoingIndex = nodeOutgoingIndices.get(fromNodeId) || 0
          nodeOutgoingIndices.set(fromNodeId, currentOutgoingIndex + 1)

          // 特殊检查：第一列第一个节点到第三列节点的连接
          if (nodeColume.length === 3 && fromNode.columnIndex === 0 && currentNode.columnIndex === 2) {
            // 检查是否是第一列的第一个节点
            const firstColFirstNode = nodeColume[0]?.[0]
            if (
              firstColFirstNode &&
              (fromNode.originalTarget || fromNode.target) === (firstColFirstNode.originalTarget || firstColFirstNode.target)
            ) {
              // 检查是否有fromCoinType直接到第二列
              const hasFromCoinToSecondCol =
                nodeColume.length > 1 &&
                nodeColume[1].some((secondBlock: any) => {
                  return secondBlock.list && secondBlock.list[fromCoinType]
                })

              // 只有当同时有fromCoinType直接到第三列和第二列时，才进行特殊处理
              if (hasFromCoinToSecondCol) {
                console.log('特殊处理：第一列第一个节点到第三列节点，强制使用特殊路径')
                needZigzag = true
              } else {
                console.log('第一列第一个节点到第三列节点，使用普通水平连接')
                needZigzag = false
                // 直接生成水平连接线
                const fromPercent =
                  nodePercentages[`${fromNode.columnIndex}-${fromNode.originalTarget || fromNode.target}`]?.[originalTarget]?.fromPercent || '0'

                edges.push({
                  from: fromNode.id,
                  to: currentNode.id,
                  fromX: fromNode.left + fromNode.width,
                  fromY: fromNode.top + 10,
                  toX: currentNode.left,
                  toY: fromNode.top + 10,
                  fromPercent
                })
              }
            } else {
              // 检查是否可以从fromCenterY水平到达目标节点
              if (fromCenterY >= currentNode.top && fromCenterY <= currentNode.top + currentNode.height) {
                // 可以直接水平连接
                const fromPercent =
                  nodePercentages[`${fromNode.columnIndex}-${fromNode.originalTarget || fromNode.target}`]?.[originalTarget]?.fromPercent || '0'

                edges.push({
                  from: fromNode.id,
                  to: currentNode.id,
                  fromX: fromNode.left + fromNode.width,
                  fromY: fromCenterY,
                  toX: currentNode.left - pathToGap,
                  toY: fromCenterY,
                  fromPercent
                })
              } else {
                // 检查当前节点范围内是否有可以水平连接的位置
                let foundHorizontalPosition = false
                for (let y = fromNode.top; y <= fromNode.top + fromNode.height; y += 5) {
                  if (y >= currentNode.top && y <= currentNode.top + currentNode.height) {
                    const fromPercent =
                      nodePercentages[`${fromNode.columnIndex}-${fromNode.originalTarget || fromNode.target}`]?.[originalTarget]?.fromPercent || '0'

                    edges.push({
                      from: fromNode.id,
                      to: currentNode.id,
                      fromX: fromNode.left + fromNode.width,
                      fromY: y,
                      toX: currentNode.left - pathToGap,
                      toY: y,
                      fromPercent
                    })
                    foundHorizontalPosition = true
                    break
                  }
                }

                if (!foundHorizontalPosition) {
                  // 需要绕行连接
                  needZigzag = true
                }
              }
            }
          } else {
            // 其他情况：检查是否可以从fromCenterY水平到达目标节点
            if (fromCenterY >= currentNode.top && fromCenterY <= currentNode.top + currentNode.height) {
              // 可以直接水平连接
              const fromPercent =
                nodePercentages[`${fromNode.columnIndex}-${fromNode.originalTarget || fromNode.target}`]?.[originalTarget]?.fromPercent || '0'

              edges.push({
                from: fromNode.id,
                to: currentNode.id,
                fromX: fromNode.left + fromNode.width,
                fromY: fromCenterY,
                toX: currentNode.left,
                toY: fromCenterY,
                fromPercent
              })
            } else {
              // 检查当前节点范围内是否有可以水平连接的位置
              let foundHorizontalPosition = false
              for (let y = fromNode.top; y <= fromNode.top + fromNode.height; y += 5) {
                if (y > currentNode.top + 10 && y < currentNode.top + currentNode.height - 10) {
                  const fromPercent =
                    nodePercentages[`${fromNode.columnIndex}-${fromNode.originalTarget || fromNode.target}`]?.[originalTarget]?.fromPercent || '0'
                  edges.push({
                    from: fromNode.id,
                    to: currentNode.id,
                    fromX: fromNode.left + fromNode.width,
                    fromY: y,
                    toX: currentNode.left,
                    toY: y,
                    fromPercent
                  })
                  foundHorizontalPosition = true
                  break
                }
              }

              if (!foundHorizontalPosition) {
                // 需要绕行连接
                needZigzag = true
              }
            }
          }

          // 如果需要绕行连接，生成Z型连线
          if (needZigzag) {
            const fromPercent =
              nodePercentages[`${fromNode.columnIndex}-${fromNode.originalTarget || fromNode.target}`]?.[originalTarget]?.fromPercent || '0'

            // 计算出发点的Y坐标，为同一个节点的多条出发线分配不同的Y坐标
            const totalOutgoingCount = nodeOutgoingCounts.get(fromNodeId) || 1
            const currentOutgoingIndex = nodeOutgoingIndices.get(fromNodeId) || 0
            const spacing = 50 // 出发线之间的间隔
            const startY = fromNode.top + 10 // 从节点顶部+10开始
            const availableHeight = fromNode.height - 20 // 可用高度
            const step = totalOutgoingCount > 3 ? Math.min(spacing, availableHeight / Math.max(1, totalOutgoingCount - 1)) : spacing
            const adjustedFromY = startY + currentOutgoingIndex * step

            // 特殊处理：第一列第一个节点到第三列节点的连接
            if (nodeColume.length === 3 && fromNode.columnIndex === 0 && currentNode.columnIndex === 2) {
              // 检查是否是第一列的第一个节点
              const firstColFirstNode = nodeColume[0]?.[0]
              if (
                firstColFirstNode &&
                (fromNode.originalTarget || fromNode.target) === (firstColFirstNode.originalTarget || firstColFirstNode.target)
              ) {
                console.log('特殊处理：第一列第一个节点到第三列节点')

                // 从当前节点left+width/2, top位置出发
                const specialFromX = fromNode.left + fromNode.width / 2
                const specialFromY = fromNode.top

                edges.push({
                  from: fromNode.id,
                  to: currentNode.id,
                  fromX: specialFromX,
                  fromY: specialFromY,
                  toX: currentNode.left,
                  toY: minTop + 10,
                  fromPercent,
                  segments: [
                    {
                      x1: specialFromX,
                      y1: specialFromY,
                      x2: specialFromX,
                      y2: minTop + 10
                    },
                    {
                      x1: specialFromX,
                      y1: minTop + 10,
                      x2: currentNode.left - pathToGap,
                      y2: minTop + 10
                    }
                  ]
                })
              } else {
                // 其他第一列到第三列的连接，使用原来的逻辑
                if (currentNode.top > fromNode.top + fromNode.height) {
                  console.log('生成Z型连线，segments数量: 3')

                  // 目标节点在下方
                  edges.push({
                    from: fromNode.id,
                    to: currentNode.id,
                    fromX: fromNode.left + fromNode.width,
                    fromY: adjustedFromY,
                    toX: fromNode.left + fromNode.width + zStartWidth,
                    toY: adjustedFromY,
                    fromPercent,
                    segments: [
                      {
                        x1: fromNode.left + fromNode.width,
                        y1: adjustedFromY,
                        x2: fromNode.left + fromNode.width + zStartWidth,
                        y2: adjustedFromY
                      },
                      {
                        x1: fromNode.left + fromNode.width + zStartWidth,
                        y1: adjustedFromY,
                        x2: fromNode.left + fromNode.width + zStartWidth,
                        y2: currentNode.top + 20
                      },
                      {
                        x1: fromNode.left + fromNode.width + zStartWidth,
                        y1: currentNode.top + 20,
                        x2: currentNode.left,
                        y2: currentNode.top + 20
                      }
                    ]
                  })
                  console.log('Z型连线生成完成，edge:', edges[edges.length - 1])
                } else {
                  // 目标节点在上方
                  edges.push({
                    from: fromNode.id,
                    to: currentNode.id,
                    fromX: fromNode.left + fromNode.width,
                    fromY: adjustedFromY,
                    toX: fromNode.left + fromNode.width + zStartWidth,
                    toY: adjustedFromY,
                    fromPercent,
                    segments: [
                      {
                        x1: fromNode.left + fromNode.width,
                        y1: adjustedFromY,
                        x2: fromNode.left + fromNode.width + zStartWidth,
                        y2: adjustedFromY
                      },
                      {
                        x1: fromNode.left + fromNode.width + zStartWidth,
                        y1: adjustedFromY,
                        x2: fromNode.left + fromNode.width + zStartWidth,
                        y2: currentNode.top + currentNode.height - 20
                      },
                      {
                        x1: fromNode.left + fromNode.width + zStartWidth,
                        y1: currentNode.top + currentNode.height - 20,
                        x2: currentNode.left - pathToGap,
                        y2: currentNode.top + currentNode.height - 20
                      }
                    ]
                  })
                }
              }
            } else {
              // 特殊处理：三列情况下第二列到第三列的连接
              if (nodeColume.length === 3 && fromNode.columnIndex === 1 && currentNode.columnIndex === 2 && currentNode.top < fromNode.top) {
                console.log('三列情况：第二列到第三列，目标节点在上方')
                console.log('三列情况：第二列到第三列，目标节点在上方from: ', fromNode.id)
                console.log('三列情况：第二列到第三列，目标节点在上方to: ', currentNode.id)

                // 从源节点中心出发，先水平到目标节点中心，然后向上到目标节点底部
                edges.push({
                  from: fromNode.id,
                  to: currentNode.id,
                  fromX: fromNode.left + fromNode.width,
                  fromY: adjustedFromY,
                  toX: currentNode.left + currentNode.width / 2,
                  toY: adjustedFromY,
                  fromPercent,
                  segments: [
                    {
                      x1: fromNode.left + fromNode.width,
                      y1: adjustedFromY,
                      x2: currentNode.left + currentNode.width / 2,
                      y2: adjustedFromY
                    },
                    {
                      x1: currentNode.left + currentNode.width / 2,
                      y1: adjustedFromY,
                      x2: currentNode.left + currentNode.width / 2,
                      y2: currentNode.top + currentNode.height + pathToGap
                    }
                  ]
                })
              } else if (currentNode.top > fromNode.top + fromNode.height) {
                console.log('生成Z型连线，segments数量: 3')

                // 目标节点在下方
                edges.push({
                  from: fromNode.id,
                  to: currentNode.id,
                  fromX: fromNode.left + fromNode.width,
                  fromY: adjustedFromY,
                  toX: fromNode.left + fromNode.width + zStartWidth,
                  toY: adjustedFromY,
                  fromPercent,
                  segments: [
                    {
                      x1: fromNode.left + fromNode.width,
                      y1: adjustedFromY,
                      x2: fromNode.left + fromNode.width + zStartWidth,
                      y2: adjustedFromY
                    },
                    {
                      x1: fromNode.left + fromNode.width + zStartWidth,
                      y1: adjustedFromY,
                      x2: fromNode.left + fromNode.width + zStartWidth,
                      y2: currentNode.top + 20
                    },
                    {
                      x1: fromNode.left + fromNode.width + zStartWidth,
                      y1: currentNode.top + 20,
                      x2: currentNode.left - pathToGap,
                      y2: currentNode.top + 20
                    }
                  ]
                })
              } else {
                console.log('目标节点在上面11 fromNode: ', fromNode)
                console.log('目标节点在上面11 currentNode: ', currentNode)
                // 目标节点在上方
                edges.push({
                  from: fromNode.id,
                  to: currentNode.id,
                  fromX: fromNode.left + fromNode.width,
                  fromY: adjustedFromY,
                  toX: fromNode.left + fromNode.width + zStartWidth,
                  toY: adjustedFromY,
                  fromPercent,
                  segments: [
                    {
                      x1: fromNode.left + fromNode.width,
                      y1: adjustedFromY,
                      x2: fromNode.left + fromNode.width + zStartWidth,
                      y2: adjustedFromY
                    },
                    {
                      x1: fromNode.left + fromNode.width + zStartWidth,
                      y1: adjustedFromY,
                      x2: fromNode.left + fromNode.width + zStartWidth,
                      y2: currentNode.top + currentNode.height - 20
                    },
                    {
                      x1: fromNode.left + fromNode.width + zStartWidth,
                      y1: currentNode.top + currentNode.height - 20,
                      x2: currentNode.left - pathToGap,
                      y2: currentNode.top + currentNode.height - 20
                    }
                  ]
                })
              }
            }
          }
        })
      })
    }

    // 3. 添加最后一列出发的线
    console.log('🔍 添加最后一列出发的线')
    const maxColumnIndex = Math.max(...Array.from(nodesMap.values()).map(node => node.columnIndex))
    const lastColumnNodes = Array.from(nodesMap.values()).filter(node => node.columnIndex === maxColumnIndex)

    if (lastColumnNodes.length > 0) {
      const lastColumnNode = lastColumnNodes[0]
      const fromY = lastColumnNode.top + lastColumnNode.height / 2

      edges.push({
        from: lastColumnNode.id,
        to: 'final',
        fromX: lastColumnNode.left + lastColumnNode.width,
        fromY,
        toX: routerComWidth - routerComGap,
        toY: fromY,
        fromPercent: '100',
        isFinal: true
      })

      console.log('🔍 添加最终边')
    }

    return { edges }
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
    const paths: any = routerData?.routerData?.paths

    // console.log('🚀 ~ toFormatSwapRouter ~ paths:', JSON.stringify(paths))
    // const paths: any = []

    if (!paths || paths?.length === 0) return
    const fromCoinType = toLongCoinType(fromCoin?.coin_type || originFromCoinType || '')
    console.log('4444🚀 ~ toFormatSwapRouter ~ fromCoinType:', fromCoinType)
    const targetCoinType = toLongCoinType(toCoin?.coin_type || originToCoinType || '')
    console.log('4444🚀 ~ toFormatSwapRouter ~ targetCoinType:', targetCoinType)

    // 使用优化版本的方法，确保最大深度不超过3列
    const nodeColume = getNodeColumeOptimized(paths, fromCoinType, targetCoinType, 3)
    console.log('🚀 ~ toFormatSwapRouter11 ~ nodeColume (优化版):', nodeColume)

    const { nodesMap, orderedNodeColume } = getNodes(nodeColume, fromCoinType, paths)
    setResultColumes(orderedNodeColume)

    // 生成基于nodeColume的百分比数据
    const nodePercentages = generateNodePercentages(orderedNodeColume, paths, fromCoinType)
    console.log('🚀 ~ toFormatSwapRouter ~ nodePercentages:', nodePercentages)

    const { edges } = getEdges(nodePercentages, nodesMap, fromCoinType, orderedNodeColume, paths)
    const adjustedNodes = [...nodesMap.values()]
    console.log('🚀 ~ toFormatSwapRouter ~ adjustedNodes:', adjustedNodes)
    console.log('🚀 ~ toFormatSwapRouter11 ~ edges:', edges)

    const panelHeight = getPanelHeight([...nodesMap.values()]) + minTop + 32

    setPanelHeight(panelHeight)
    setgNodes(adjustedNodes)
    setEdges(edges)

    // 从 nodeKey 中提取 originalTarget，并去重
    const targets = Array.from(new Set([...nodesMap.values()].map((node: any) => node.originalTarget || node.target)))
    getTokenMap([...targets, fromCoinType])
  }

  const { getTokenListInfo } = useGetToken()
  const [tokenMap, setTokenMap] = useState<Map<string, any>>(new Map())

  const getTokenMap = async (coinTypeList: string[]) => {
    const res = await getTokenListInfo(coinTypeList as CoinType[])
    if (res && res?.size > 0) {
      setTokenMap(res)
    }
  }

  useDeepCompareEffect(() => {
    toFormatSwapRouter()
    getAllProviders(routerData?.routerData?.paths || [])
  }, [routerData])

  // 获取所有去重的 providers
  function getAllProviders(paths: any[]) {
    if (!Array.isArray(paths)) return []

    const providers = new Set<string>()
    paths.forEach((path: any) => {
      if (path.provider) {
        providers.add(path.provider)
      }
    })

    // return Array.from(providers)
    setAllProviders(Array.from(providers))
  }

  // 获取target块儿信息高度
  function getBlockHeight(list: any): number {
    console.log('🚀 ~ getBlockHeight ~ list:', list)
    let height = blockPadding * 2 + targetCoinInfoHeight
    const fromEntries = Object.entries(list)

    fromEntries.forEach(([from, items]: [string, any], index: number) => {
      height += fromToTargetBlockPaddingTopAndBottom * 2
      height += fromToTargetTitleHeight
      height += 10 // 来源具体xx>xx标题距离

      items.forEach((i: any) => {
        height += providerRowHeight
      })
    })

    return height + (fromEntries?.length - 1) * fromToTargetMrTop + 10
  }

  return {
    newFormatSwapRouter,
    nodes,
    edges,
    tokenMap,
    panelHeight,
    getAllProviders,
    allProviders,
    resultColumes
  }
}
