import AssetsInfo from '@/components/deepbook/AssetsInfo'
import DeepbookChart from '@/components/deepbook/DeepbookChart'
import FooterBlock from '@/components/deepbook/FooterBlock'
import OrderBookBlock from '@/components/deepbook/OrderBookBlock'
import TradeTableBlock from '@/components/deepbook/Tables/TradeTableBlock'
import TopDataBlock from '@/components/deepbook/TopDataBlock'
import TradeBlock from '@/components/deepbook/Trade/TradeBlock'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import { Box, VStack } from '@chakra-ui/react'
import { IJsonModel, Layout, Model, TabNode } from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import { useCallback, useEffect, useMemo } from 'react'
import ChartAndMarketTabs from './ChartAndMarketTabs'
import MarginAccount from './Margin/MarginAccount'
import MarginTradeBlock from './Margin/MarginTradeBlock'
import MarginLeverageModal from './Margin/MarginleverageModal'
import MarketDetails from './MarketDetails'
import TopTabs from './TopTabs'
import TradeTypeSwitch from './TradeTypeSwitch'
interface DeepBookPCProps {
  currentDeepBookPool: any
  deepBookPools: any[]
  currentAccount: any
  currentBalanceManagerInfo: any
}

function DeepBookPC({ currentDeepBookPool, deepBookPools, currentAccount, currentBalanceManagerInfo }: DeepBookPCProps) {
  const { size } = useDocumentSize()
  const { chartAndMarketCurrentTab, currentDeepBookPool: storeCurrentDeepBookPool, getTradeType, deepBookSettleList } = useDeepBookStore()
  const { marginSettleList } = useMarginStore()

  // 优先使用 store 中的 currentDeepBookPool，确保获取最新状态
  const actualCurrentDeepBookPool = storeCurrentDeepBookPool?.address ? storeCurrentDeepBookPool : currentDeepBookPool
  // ==================== FlexLayout 配置 ====================
  // 创建稳定的布局模型，不依赖高度变化
  const model = useMemo(
    () =>
      Model.fromJson({
        global: {
          tabEnableClose: false,
          tabSetEnableTabStrip: false
        },
        layout: {
          type: 'column',
          children: [
            {
              type: 'column',
              weight: 85,
              children: [
                {
                  type: 'tabset',
                  weight: 1,
                  minWidth: 800,
                  minHeight: 56,
                  maxHeight: 56,
                  children: [{ type: 'tab', component: 'TopTabs' }],
                  enableDivide: false // 禁用分割条
                },
                {
                  type: 'tabset',
                  weight: 8,
                  minWidth: 800,
                  minHeight: 56,
                  maxHeight: 56,
                  children: [{ type: 'tab', component: 'TopDataBlock', zIndex: 9 }],
                  enableDivide: false // 禁用分割条
                },
                {
                  type: 'row',
                  weight: 75,
                  zIndex: 8,
                  config: { splitterEnabled: false },
                  children: [
                    {
                      type: 'tabset',
                      weight: 83,
                      minWidth: 288,
                      minHeight: 400, // 图表区域最小高度
                      config: {
                        tabSetMinHeight: 400,
                        tabSetMaxHeight: 0 // 0表示无限制，允许高度自适应
                      },
                      children: [{ type: 'tab', component: 'ChartBlock' }]
                    },
                    {
                      type: 'tabset',
                      weight: 17,
                      minWidth: 328,
                      minHeight: 360, // 深度区域最小高度
                      config: {
                        tabSetMinHeight: 360,
                        tabSetMaxHeight: 0 // 0表示无限制，允许高度自适应
                      },
                      children: [{ type: 'tab', component: 'OrderBookBlock' }]
                    }
                  ]
                },
                {
                  type: 'tabset',
                  weight: 36,
                  minHeight: 368, // 使用固定值，通过CSS控制实际高度
                  children: [{ type: 'tab', component: 'TradeTableBlock' }]
                }
              ]
            },
            {
              type: 'column',
              weight: 15,
              children: [
                {
                  type: 'tabset',
                  weight: 100,
                  minWidth: 352,
                  minHeight: 808,
                  children: [
                    {
                      type: 'tab',
                      component: 'TradeBlock',
                      name: 'TradeBlock'
                    }
                  ]
                }
              ]
            }
          ]
        }
      } as IJsonModel),
    [] // 空依赖数组，确保布局模型只创建一次
  )

  // ==================== FlexLayout 工厂函数 ====================
  // 使用 useCallback 避免工厂函数重新创建

  const tradeTypeByPool = useDeepBookStore(state => {
    return state.tradeTypeByPool
  })
  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool?.address])

  const tradeType = useMemo(() => {
    return poolAddress ? tradeTypeByPool[poolAddress] : 'Spot'
  }, [poolAddress, tradeTypeByPool])

  const factory = useCallback(
    (node: TabNode) => {
      const component = node.getComponent()

      // 将useEffect移到组件内部，避免在工厂函数中创建副作用
      // if (component === 'TopDataBlock') {
      //   return <TopDataBlock />
      // }

      switch (component) {
        case 'TopTabs':
          return <TopTabs />
        case 'TopDataBlock':
          return <TopDataBlock />
        case 'TradeBlock': {
          // 使用 key 强制重新渲染，确保 isMarginPool 变化时组件能正确切换
          const isMarginPool = actualCurrentDeepBookPool?.isMarginPool
          return (
            <VStack key={`trade-block-${actualCurrentDeepBookPool?.address}-${isMarginPool}-${tradeType}`} h="100%" w="100%" gap="0" align="stretch">
              <TradeTypeSwitch />
              <Box flexShrink={0}>{isMarginPool && tradeType == 'Margin' ? <MarginTradeBlock /> : <TradeBlock />}</Box>
              <Box h="4px" bg="bg_primary" flexShrink={0} />
              <Box flex="1" minH="0" w="100%">
                {isMarginPool && tradeType == 'Margin' ? <MarginAccount /> : <AssetsInfo />}
              </Box>
            </VStack>
          )
        }
        case 'ChartBlock':
          return (
            <Box h="100%" w="100%">
              <ChartAndMarketTabs />
              {chartAndMarketCurrentTab.key === 'chart' && <DeepbookChart currentDeepBookPool={actualCurrentDeepBookPool} />}
              {chartAndMarketCurrentTab.key === 'market' && <MarketDetails tradeType={tradeType} currentDeepBookPool={actualCurrentDeepBookPool} />}
            </Box>
          )
        case 'OrderBookBlock':
          return (
            <Box h="100%" w="100%">
              <OrderBookBlock />
            </Box>
          )
        case 'TradeTableBlock': {
          const isMarginPool = actualCurrentDeepBookPool?.isMarginPool
          return (
            <VStack key={`trade-table-block-${actualCurrentDeepBookPool?.address}-${isMarginPool}`} h="100%" w="100%" gap="0" align="stretch">
              <Box h="100%" w="100%">
                <TradeTableBlock />
              </Box>
            </VStack>
          )
        }
        case 'FooterBlock':
          return (
            <Box h="100%" w="100%">
              <FooterBlock />
            </Box>
          )
        default:
          return null
      }
    },
    [actualCurrentDeepBookPool, chartAndMarketCurrentTab, tradeType]
  ) // 使用 store 中的 currentDeepBookPool 确保及时更新

  // 将TopDataBlock包装成一个独立组件，避免在工厂函数中创建useEffect
  // const TopDataBlockWrapper = useCallback(() => {
  //   useEffect(() => {
  //     const handlersMap = new Map<Element, { enter: () => void; leave: () => void; indicator?: HTMLElement }>()

  //   const timer = setTimeout(() => {
  //     const splitters = document.querySelectorAll('.flexlayout__splitter')
  //     // console.log(splitters)
  //     if (splitters.length > 0) {
  //       // 隐藏第一个分割条（TopDataBlock上方的）
  //       ;(splitters[0] as HTMLElement).style.backgroundColor = 'transparent'
  //       ;(splitters[0] as HTMLElement).style.pointerEvents = 'none'
  //     }

  //     splitters.forEach(splitter => {
  //       const handleMouseEnter = () => {
  //         const rect = splitter.getBoundingClientRect()
  //         const isHorizontal = splitter.classList.contains('flexlayout__splitter_horz')

  //         const indicator = document.createElement('div')
  //         indicator.className = 'flexlayout__splitter_drag'
  //         indicator.style.position = 'absolute'
  //         indicator.style.left = `${rect.left}px`
  //         indicator.style.top = `${rect.top}px`
  //         indicator.style.width = `${rect.width}px`
  //         indicator.style.height = `${rect.height}px`
  //         indicator.style.pointerEvents = 'none'
  //         indicator.style.zIndex = '1000'
  //         indicator.style.flexDirection = isHorizontal ? 'row' : 'column'

  //         const handle = document.createElement('div')
  //         handle.className = `flexlayout__splitter_handle ${isHorizontal ? 'flexlayout__splitter_handle_horz' : 'flexlayout__splitter_handle_vert'}`
  //         indicator.appendChild(handle)

  //         document.body.appendChild(indicator)

  //         const handlers = handlersMap.get(splitter)
  //         if (handlers) {
  //           handlers.indicator = indicator
  //         }
  //       }

  //       const handleMouseLeave = () => {
  //         const handlers = handlersMap.get(splitter)
  //         if (handlers?.indicator && handlers.indicator.parentNode) {
  //           handlers.indicator.parentNode.removeChild(handlers.indicator)
  //           handlers.indicator = undefined
  //         }
  //       }

  //       handlersMap.set(splitter, { enter: handleMouseEnter, leave: handleMouseLeave })
  //       splitter.addEventListener('mouseenter', handleMouseEnter)
  //       splitter.addEventListener('mouseleave', handleMouseLeave)
  //     })
  //   }, 0)

  //   return () => {
  //     clearTimeout(timer)
  //     // 清理所有事件监听器和指示器元素
  //     handlersMap.forEach((handlers, splitter) => {
  //       splitter.removeEventListener('mouseenter', handlers.enter)
  //       splitter.removeEventListener('mouseleave', handlers.leave)
  //       if (handlers.indicator && handlers.indicator.parentNode) {
  //         handlers.indicator.parentNode.removeChild(handlers.indicator)
  //       }
  //     })
  //   }
  // }, [])

  //   return (
  //     <Box h='100%' w='100%'>
  //       <TopDataBlock />
  //     </Box>
  //   )
  // }, [])

  // 计算容器高度，避免在JSX中直接使用size.h
  const containerHeight = useMemo(() => size?.h - 80, [size?.h])
  const tradeTableHeight = useMemo(() => (size?.h < 600 ? 500 : 368), [size?.h])

  // 使用useEffect动态调整FlexLayout的高度，避免重新渲染
  useEffect(() => {
    if (size?.h) {
      // 动态调整TradeTableBlock的高度
      const tradeTableElement = document.querySelector('.flexlayout__tabset[data-weight="36"]')
      if (tradeTableElement) {
        ;(tradeTableElement as HTMLElement).style.minHeight = `${tradeTableHeight}px`
      }

      // 动态调整图表和深度区域的高度
      const chartOrderBookRow = document.querySelector('.flexlayout__row[data-weight="75"]')
      if (chartOrderBookRow) {
        // FooterBlock 在桌面端是 40px，移动端是 68px，这里使用 40px 作为基准
        // 加上 gap 4px 和 TopDataBlock 56px 和 TopTabs 56px 和 gap 4px
        const footerHeight = 40 // 桌面端 FooterBlock 高度
        const availableHeight = size.h - 80 - 56 - 4 - footerHeight - 4 - 56 - tradeTableHeight
        const chartOrderBookHeight = Math.max(availableHeight, 400)
        ;(chartOrderBookRow as HTMLElement).style.minHeight = `${chartOrderBookHeight}px`
        ;(chartOrderBookRow as HTMLElement).style.height = `${chartOrderBookHeight}px`
      }

      // 根据屏幕高度调整图表和深度区域的最小高度
      if (size.h >= 900) {
        // 大屏：图表和深度区域高度自适应
        const chartElement = document.querySelector('.flexlayout__tabset[data-weight="83"]')
        const orderBookElement = document.querySelector('.flexlayout__tabset[data-weight="17"]')

        if (chartElement) {
          ;(chartElement as HTMLElement).style.minHeight = '500px'
        }
        if (orderBookElement) {
          ;(orderBookElement as HTMLElement).style.minHeight = '400px'
        }
      }
    }
  }, [size?.h, tradeTableHeight])

  return (
    <VStack minWidth="1160px" w="100%" gap={'4px'} minHeight="960px" h={containerHeight} overflow="visible" align="stretch">
      <Box flex="1" minH="808px" w="100%" bg="bg_secondary" position="relative" zIndex="5" overflow="hidden">
        <Layout model={model} factory={factory} realtimeResize={true} />
      </Box>
      <Box w="100%" flexShrink={0}>
        <FooterBlock />
      </Box>
      <MarginLeverageModal />
    </VStack>
  )
}

export default DeepBookPC
