import { SwapRouterData } from '@/types/swap'
import { useGetToken } from '@cetus/hooks/src/useToken'
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
  x: number
  y: number
  width: number
  height: number
}

// 边数据结构
type Edge = {
  from: string
  target: string
  paths: number[] // 经过此边的路径ID
}

export function useSwapRouter(routerData?: SwapRouterData) {
  const { fetchTokenInfo } = useGetToken()
  const [newFormatSwapRouter, setNewFormatSwapRouter] = useState<any>({})
  const [nodes, setgNodes] = useState<any>([])
  const [edges, setEdges] = useState<any>([])

  // 1. 平铺path
  function getTilePaths(data: SwapRouterData): {
    titlePaths: TilePathItem[]
    gmaxPathIndex: number
  } {
    if (!data?.routerData?.routes) return { titlePaths: [], gmaxPathIndex: 0 }
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

    return {
      titlePaths,
      gmaxPathIndex
    }
  }

  // 2. 相对每个route中从后往前的顺序，对path根据target相同分组
  function groupPathStepsCorrectly(tilePaths: TilePathItem[]): {
    list: TilePathItem[]
    maxPathIndex: number
    minRouteIndex: number
  }[] {
    // 创建一个映射：stepsFromEnd -> target -> 步骤数组
    const groupMap: Record<number, Record<string, TilePathItem[]>> = {}

    // 填充映射
    tilePaths.forEach(step => {
      const { stepsFromEnd, target } = step

      if (!groupMap[stepsFromEnd]) {
        groupMap[stepsFromEnd] = {}
      }

      if (!groupMap[stepsFromEnd][target]) {
        groupMap[stepsFromEnd][target] = []
      }

      groupMap[stepsFromEnd][target].push(step)
    })

    // 获取所有stepsFromEnd值并按降序排序（从最后一步开始）
    const sortedPositions = Object.keys(groupMap)
      .map(Number)
      .sort((a, b) => b - a) // 降序

    // 构建最终结果数组（对象数组）
    const result: {
      list: TilePathItem[]
      maxPathIndex: number
      minRouteIndex: number
      pathIndexs: number[]
      routeIndexs: number[]
    }[] = []

    sortedPositions.forEach(position => {
      const targetGroups = groupMap[position]

      // 对每个target组按target排序
      const sortedTargets = Object.keys(targetGroups).sort()

      sortedTargets.forEach(target => {
        // 将步骤按routeIndex排序
        const sortedSteps = [...targetGroups[target]].sort((a, b) => a.routeIndex - b.routeIndex)

        // 计算当前组的 maxPathIndex 和 minRouteIndex
        const maxPathIndex = Math.max(...sortedSteps.map(s => s.pathIndex))
        const minRouteIndex = Math.min(...sortedSteps.map(s => s.routeIndex))
        const pathIndexs = [...new Set(sortedSteps.map(s => s.pathIndex))]
        const routeIndexs = [...new Set(sortedSteps.map(s => s.routeIndex))]

        // 添加分组对象到结果数组
        result.push({
          list: sortedSteps,
          maxPathIndex,
          minRouteIndex,
          pathIndexs,
          routeIndexs
        })
      })
    })

    return result
  }

  // 3. 根据maxPathIndex进行分组
  function groupByMaxPathIndex(
    data: {
      list: TilePathItem[]
      maxPathIndex: number
      minRouteIndex: number
    }[]
  ): {
    state: number
    stepList: {
      list: TilePathItem[]
      maxPathIndex: number
      minRouteIndex: number
    }[]
  }[] {
    // 1. 创建一个映射：maxPathIndex -> 分组数组
    const groupMap = new Map<
      number,
      {
        list: TilePathItem[]
        maxPathIndex: number
        minRouteIndex: number
      }[]
    >()

    // 2. 遍历原始数据，填充映射
    data.forEach(item => {
      const { maxPathIndex } = item

      if (!groupMap.has(maxPathIndex)) {
        groupMap.set(maxPathIndex, [])
      }

      groupMap.get(maxPathIndex)!.push(item)
    })

    // 3. 将映射转换为结果数组
    const result: {
      state: number
      stepList: {
        list: TilePathItem[]
        maxPathIndex: number
        minRouteIndex: number
      }[]
    }[] = []

    // 4. 按maxPathIndex升序排序（0,1,2...）
    const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => a - b)

    // 5. 构建最终结果
    sortedKeys.forEach(key => {
      const groupItems = groupMap.get(key)!

      // 对于每个分组，可以按minRouteIndex排序（可选）
      groupItems.sort((a, b) => a.minRouteIndex - b.minRouteIndex)

      result.push({
        state: key,
        stepList: groupItems
      })
    })

    return result
  }

  // 4. 遍历第三步的结果，生成节点列表，需要包含节点需要展示的数据和具体坐标
  function generateNodes(originRouterData: SwapRouterData, columeData: any) {
    const routeGap = 60 // 路径线之间的默认距离
    const columeGap = 176
    const maxStep = columeData.length

    // 遍历每列的数据，想计算出node的位置，并重新确定路径排列顺序(因为可能有同一个path的两个路径不相连)
    // 优先还是按原来的顺序，从上到下调整
    const nodes: any = []
    columeData?.forEach((item: any, index: number) => {
      item?.stepList?.forEach((sItem: any) => {
        nodes.push({
          ...sItem,
          top: sItem.minRouteIndex * routeGap,
          left: index * columeGap,
          colume: index,
          height: 90 + sItem?.list?.length * 16
        })
      })
    })

    function findPathFromNodes(routeIndex: number, pathIndex: number) {
      for (let i = 0; i < nodes?.length; i++) {
        const nodesItem = nodes[i]

        if (nodesItem.routeIndexs.includes(routeIndex) && nodesItem.pathIndexs.includes(pathIndex)) {
          return nodesItem
        }
      }
    }

    const originRouter = originRouterData.routerData?.routes || []
    const edges: any = []
    const edgesMap = new Map<number, any>()

    const newPaths: any = []
    originRouter.forEach((route: any, routeIndex: number) => {
      route?.path?.forEach((path: any, pathIndex: number) => {
        const currentPathInNodes = findPathFromNodes(routeIndex, pathIndex)

        edgesMap.set(routeIndex, {})
      })
    })
  }

  // 新思路，提取节点边
  function getNodesAndEdges(data: SwapRouterData) {
    const width = 800
    const height = 400
    const nodeWidth = 80
    const nodeHeight = 40
    const nodePadding = 20

    const nodesMap = new Map<string, Node>()
    const edgesMap = new Map<string, Edge>()
    if (!data?.routerData?.routes) return [[], []]
    data.routerData.routes.forEach((route, routeIndex) => {
      route?.path?.forEach((item, index) => {
        const from = item?.from
        const target = item?.target

        // 添加节点
        if (!nodesMap.has(from)) {
          nodesMap.set(from, { id: from, x: 0, y: 0, width: nodeWidth, height: nodeHeight })
        }
        if (!nodesMap.has(target)) {
          nodesMap.set(target, { id: target, x: 0, y: 0, width: nodeWidth, height: nodeHeight })
        }

        // 添加边
        const edgeKey = `${from}-${target}`
        if (!edgesMap.has(edgeKey)) {
          edgesMap.set(edgeKey, { from, target, paths: [routeIndex] })
        } else {
          const edge = edgesMap.get(edgeKey)!
          if (!edge.paths.includes(routeIndex)) {
            edge.paths.push(routeIndex)
          }
        }
      })
    })

    // 计算节点位置
    const nodesArray = Array.from(nodesMap.values())

    // 按层级排序节点 (简化版，实际应用可能需要更复杂的算法)
    const layers = new Map<string, number>()
    nodesArray.forEach(node => {
      layers.set(node.id, 0)
    })

    data.routerData.routes.forEach(route => {
      route?.path?.forEach((item, index) => {
        const from = item?.from
        const target = item?.target
        layers.set(target, Math.max(layers.get(target)! || 0, (layers.get(from)! || 0) + 1))
      })
    })

    // 按层级分组
    const layerGroups: Node[][] = []
    nodesArray.forEach(node => {
      const layer = layers.get(node.id)!
      if (!layerGroups[layer]) layerGroups[layer] = []
      layerGroups[layer].push(node)
    })

    // 计算节点位置
    const totalLayers = layerGroups.length
    const layerWidth = width / (totalLayers + 1)

    layerGroups.forEach((layerNodes, layerIndex) => {
      const x = (layerIndex + 1) * layerWidth - nodeWidth / 2
      const availableHeight = height - nodePadding * 2
      const spacing = availableHeight / (layerNodes.length + 1)

      layerNodes.forEach((node, nodeIndex) => {
        const y = nodePadding + (nodeIndex + 1) * spacing - nodeHeight / 2
        node.x = x
        node.y = y
      })
    })

    return [nodesArray, Array.from(edgesMap.values())]
  }

  const toFormatSwapRouter = async () => {
    if (routerData?.routerData?.routes) {
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~  routerData?.routerData:', routerData?.routerData)
      const routerLen = routerData?.routerData?.routes?.length
      // const maxStep = findMaxPathLength(routerData?.routerData?.routes)
      // console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ maxStep:', maxStep)

      const { titlePaths, gmaxPathIndex } = getTilePaths(routerData)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ titlePaths:', titlePaths)
      const groupPathWithTarget = groupPathStepsCorrectly(titlePaths)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ groupPathWithTarget:', groupPathWithTarget)
      const groupWithMaxPathIndex = groupByMaxPathIndex(groupPathWithTarget)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~ groupWithMaxPathIndex:', groupWithMaxPathIndex)

      const [nodes, edges] = getNodesAndEdges(routerData)

      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~  nodes:', nodes)
      console.log('useSwapRouter 🚀 ~ toFormatSwapRouter ~  edges:', edges)
      setgNodes(nodes)
      setEdges(edges)
    }

    setNewFormatSwapRouter(undefined)
  }

  // 一些临时的工具方法
  function findPathFromNodeList() {}

  function findMaxPathLength(routers: any) {
    let maxLength = 0
    for (const router of routers) {
      // 确保 router.path 是数组，并获取其长度
      if (Array.isArray(router.path)) {
        if (router.path.length > maxLength) {
          maxLength = router.path.length
        }
      }
    }
    return maxLength
  }

  useEffect(() => {
    toFormatSwapRouter()
  }, [routerData])

  return {
    newFormatSwapRouter,
    nodes,
    edges
  }
}
