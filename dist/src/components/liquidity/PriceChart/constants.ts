import useWindowWidth from '@cetus/hooks/src/useWindowWidth'

const RIGHT_AXIS_WIDTH = 64
const CHART_CONTAINER_WIDTH = 452 + RIGHT_AXIS_WIDTH
const LIQUIDITY_CHART_WIDTH = 68
const INTER_CHART_PADDING = 12
const CHART_HEIGHT = 200
const BOTTOM_AXIS_HEIGHT = 28
const loadedPriceChartWidth = CHART_CONTAINER_WIDTH - LIQUIDITY_CHART_WIDTH - INTER_CHART_PADDING - RIGHT_AXIS_WIDTH

const desktopSizes = {
  rightAxisWidth: RIGHT_AXIS_WIDTH,
  chartContainerWidth: CHART_CONTAINER_WIDTH,
  liquidityChartWidth: LIQUIDITY_CHART_WIDTH,
  interChartPadding: INTER_CHART_PADDING,
  chartHeight: CHART_HEIGHT,
  bottomAxisHeight: BOTTOM_AXIS_HEIGHT,
  loadedPriceChartWidth
}

const mobileSizes = {
  rightAxisWidth: 64,
  chartContainerWidth: 290,
  liquidityChartWidth: 48,
  interChartPadding: 0,
  chartHeight: CHART_HEIGHT,
  bottomAxisHeight: BOTTOM_AXIS_HEIGHT,
  loadedPriceChartWidth: 290
}

export function useRangeInputSizes(parentWidth?: number) {
  const { isApp } = useWindowWidth()

  return isApp
    ? {
        ...desktopSizes,
        chartContainerWidth: parentWidth ? parentWidth - 12 : mobileSizes.chartContainerWidth,
        loadedPriceChartWidth: parentWidth ? parentWidth - 12 : mobileSizes.loadedPriceChartWidth
      }
    : desktopSizes
}
