import { ChartBinItem, CurrentBinChartData } from '@/types/dlmm'
import { useThrottle } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, formatCurrencyWithKMB, formatPriceUseInDlmmAxis, textEllipses } from '@cetus/utils'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import Slider from 'rc-slider'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CustomBar from './CustomBar'

const RightColor = '#4A9AEF'
const LeftColor = '#00D8B6'

const LeftColorOpacity = 'rgba(0,216,182,0.2)'
const RightColorOpacity = 'rgba(59,130,246,0.2)'

// 获取柱子颜色
function getBinBarColor(info: ChartBinItem, activeBin: number, isReverse: boolean, isOpacity?: boolean) {
  if (info?.bin_id == activeBin && d(info.amount_a).gt(0)) {
    return isOpacity ? 'url(#splitGradientOpacity)' : 'url(#splitGradient)'
  }

  if (d(info?.bin_id).lte(activeBin)) {
    return isOpacity ? (isReverse ? RightColorOpacity : LeftColorOpacity) : isReverse ? RightColor : LeftColor
  }

  if (d(info?.bin_id).gte(activeBin)) {
    return isOpacity ? (isReverse ? LeftColorOpacity : RightColorOpacity) : isReverse ? LeftColor : RightColor
  }

  return isOpacity ? (isReverse ? LeftColorOpacity : RightColorOpacity) : isReverse ? LeftColor : RightColor
}

const getNewBin = (payload: any, height: number) => {
  const newBinRate = payload?.newBins?.liquidity ? d(payload?.newBins?.liquidity).div(payload?.totalLiquidity).toString() : '0'
  const newBinHeight = d(height).mul(newBinRate).toNumber()
  return newBinHeight
}

const ActiveBinBar = (props: any) => {
  const { payload, x, y, height, width, isOpacity, radius, BarShape, isReverse } = props
  const aHeight = d(height).mul(payload.quantityA).toNumber()
  const bHeight = d(height).minus(aHeight).toNumber()

  return (
    <g>
      <CustomBar
        x={x}
        y={y}
        width={width}
        height={aHeight}
        radius={radius}
        fill={isOpacity ? (!isReverse ? RightColorOpacity : LeftColorOpacity) : !isReverse ? RightColor : LeftColor}
        shape={BarShape}
      />
      <CustomBar
        x={x}
        y={y + aHeight}
        width={width}
        height={bHeight}
        radius={aHeight == 0 ? radius : 0}
        fill={isOpacity ? (!isReverse ? LeftColorOpacity : RightColorOpacity) : !isReverse ? LeftColor : RightColor}
        shape={BarShape}
      />
    </g>
  )
}

const BarItem = (props: any) => {
  const { payload, x, y, height, width, isOpacity, activeBin, BarShape } = props
  return payload?.quantityA !== undefined && payload?.bin_id == activeBin ? <ActiveBinBar {...props} /> : <CustomBar {...props} shape={BarShape} />
}

const renderCustomBar = (props: any, activeBin: number, isReverse: boolean, height: number, fromPosition?: boolean, BarShape?: string) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const { x, y, width, payload, index } = props
  const customHeight = props.height
  const isHovered = index === hoveredIndex

  let newBinHeight = 0

  if (fromPosition && payload?.newBins?.liquidity) {
    newBinHeight = getNewBin(payload, customHeight)
  }

  let otherHeight = 0
  if (fromPosition) {
    otherHeight = d(customHeight).minus(newBinHeight).toNumber()
  }

  const radius = payload?.noRadius || !payload?.liquidity ? 0 : 2
  return (
    <g onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
      {!fromPosition ? (
        <BarItem
          x={x}
          y={y}
          width={width}
          height={customHeight}
          radius={radius}
          fill={getBinBarColor(payload, activeBin, isReverse)}
          activeBin={activeBin}
          payload={payload}
          BarShape={BarShape}
          isReverse={isReverse}
        />
      ) : (
        <g>
          <BarItem
            x={x}
            y={y}
            width={width}
            height={newBinHeight}
            radius={radius}
            fill={getBinBarColor(payload, activeBin, isReverse, true)}
            activeBin={activeBin}
            payload={payload.newBins}
            isOpacity={true}
            BarShape={BarShape}
            isReverse={isReverse}
          />
          <BarItem
            x={x}
            y={y + newBinHeight}
            width={width}
            height={otherHeight}
            radius={radius}
            fill={getBinBarColor(payload, activeBin, isReverse)}
            activeBin={activeBin}
            payload={payload}
            BarShape={BarShape}
            isReverse={isReverse}
          />
        </g>
      )}
      {isHovered && <rect x={x} y={y} width={width} height={customHeight} fill="rgba(0,0,0,0.3)" />}
      {payload.bin_id == activeBin && (
        <g>
          {/* 竖线 */}
          <line x1={x + width / 2} y1={0} x2={x + width / 2} y2={height - 30} stroke="#fff" strokeWidth={2} />
          {/* 倒三角 - 使用圆角路径实现 */}
          <path
            d={`M${x + width / 2 - 5},${1} Q${x + width / 2 - 5},${0} ${x + width / 2 - 4},${0} L${x + width / 2 + 4},${0} Q${x + width / 2 + 5},${0} ${x + width / 2 + 5},${1} L${x + width / 2},${8} Z`}
            fill="#fff"
          />
        </g>
      )}
    </g>
  )
}

const getPriceValue = (value: any, price: any) => {
  if (!price || price === '--') {
    return '--'
  }

  return formatCurrencyWithKMB(d(value).mul(price).toString(), 2)
}

function CurrentLiquidityChart({
  width,
  data,
  activeBin,
  height = 192,
  fromPosition,
  type = 'position',
  direct = true,
  noDataText,
  isReverse = false,
  onChangeRange,
  isShowSlider,
  tokenAPrice,
  tokenBPrice,
  strategy,
  chartBinsData,
  dataLoading
}: {
  width: number
  data: CurrentBinChartData
  activeBin: number
  onChangeRange?: (min: any, max: any, isfromCurrentLiquidityChart?: boolean) => void
  height?: number
  fromPosition?: boolean
  type?: 'position' | 'pool' | 'simulation'
  direct?: boolean
  noDataText?: string
  isReverse?: boolean
  isShowSlider?: boolean
  tokenAPrice?: any
  tokenBPrice?: any
  strategy?: any
  chartBinsData?: any
  dataLoading?: boolean
}) {
  // 使用 state 存储可编辑的数据副本，确保数据变化时触发重新渲染
  const [editableData, setEditableData] = useState<CurrentBinChartData>()
  // 添加拖动状态跟踪
  const [isDragging, setIsDragging] = useState(false)
  // 记录拖动开始时的原始数据，用于拖动结束时重置
  const [originalData, setOriginalData] = useState<CurrentBinChartData>()
  // 预览数据，用于拖动时的动画效果
  const [previewData, setPreviewData] = useState<CurrentBinChartData>()

  // 当 data?.list 变化时，更新 state 数据
  useDeepCompareEffect(() => {
    setEditableData(data)
    setOriginalData(data) // 同时更新原始数据
    setPreviewData(data) // 同时更新预览数据
  }, [data])

  const toLargeRange = useMemo(() => {
    return !!data?.toLarge
  }, [data?.toLarge])

  const CustomTooltip = useCallback(
    ({ active, payload }: any) => {
      if (!active || !payload?.[0]?.payload) return null

      const item = payload[0].payload
      const isLeft = activeBin <= item.bin_id
      const isRight = activeBin >= item.bin_id
      const hasLiquidityChange = !!item.newBins?.liquidity && item.newBins.liquidity !== '0'
      const posAction = item.newBins?.isIncrease ? 'Add' : 'Remove'

      const renderLabel = (label: string, color?: string, showAddRemove = false) => (
        <HStack gap="4px">
          {color && <ColorBlock color={color} />}
          <Text fontSize="12px" color="text_paragraph">
            {label}
            {showAddRemove ? ` (${posAction})` : ''}
          </Text>
        </HStack>
      )

      const renderValue = (value: string) => (
        <Text fontSize="12px" color="text_caption" flex="1" textAlign="right">
          {formatPriceUseInDlmmAxis(value)}
        </Text>
      )

      return (
        <VStack
          // justify="space-between"
          gap="16px"
          minW="200px"
          bg="#141618"
          borderRadius="6px"
          border="1px solid"
          borderColor="border"
          padding="8px"
          className="current-liquidity-chart-tooltip"
        >
          <VStack w="100%" gap="8px" align="flex-start">
            <HStack w="100%" justify="space-between" pl="4px" pt="4px" pr="4px">
              {renderLabel(activeBin == item.bin_id ? 'Active Bin' : 'Bin Price')}
              {renderValue(item.price)}
            </HStack>

            <VStack w="100%" gap="8px" flexDirection={isReverse ? 'column-reverse' : 'column'}>
              {isLeft && (
                <VStack w="100%" gap="8px">
                  {isLeft && (
                    <VStack w="100%" bg="bg_fifth" borderRadius="4px" p="8px 4px" gap="8px">
                      <HStack w="100%" justify="space-between">
                        {renderLabel(
                          textEllipses(item.baseSymbol, 8),
                          item.bin_id < activeBin ? (isReverse ? RightColor : LeftColor) : isReverse ? LeftColor : RightColor
                        )}
                        {renderValue(item.baseAmount)}
                      </HStack>
                      <Text fontSize="12px" color="text_paragraph" w="100%" textAlign="right">
                        {getPriceValue(item.baseAmount, tokenAPrice)}
                      </Text>
                    </VStack>
                  )}

                  {isLeft && hasLiquidityChange && (
                    <VStack w="100%" bg="bg_fifth" borderRadius="4px" p="8px 4px" gap="8px">
                      <HStack w="100%" justify="space-between">
                        {renderLabel(
                          textEllipses(item.baseSymbol, 8),
                          item.bin_id < activeBin ? (isReverse ? RightColor : LeftColor) : isReverse ? LeftColor : RightColor,
                          true
                        )}
                        {renderValue(item.newBins.baseAmount || '0')}
                      </HStack>
                      <Text fontSize="12px" color="text_paragraph" w="100%" textAlign="right">
                        {getPriceValue(item.newBins.baseAmount || '0', tokenAPrice)}
                      </Text>
                    </VStack>
                  )}
                </VStack>
              )}

              {isRight && (
                <VStack w="100%" gap="8px">
                  {isRight && (
                    <VStack w="100%" bg="bg_fifth" borderRadius="4px" p="8px 4px" gap="8px">
                      <HStack w="100%" justify="space-between">
                        {renderLabel(
                          textEllipses(item.quoteSymbol, 8),
                          item.bin_id > activeBin ? (isReverse ? LeftColor : RightColor) : isReverse ? RightColor : LeftColor
                        )}
                        {renderValue(item.quoteAmount)}
                      </HStack>
                      <Text fontSize="12px" color="text_paragraph" w="100%" textAlign="right">
                        {getPriceValue(item.quoteAmount, tokenBPrice)}
                      </Text>
                    </VStack>
                  )}

                  {isRight && hasLiquidityChange && (
                    <VStack w="100%" bg="bg_fifth" borderRadius="4px" p="8px 4px" gap="8px">
                      <HStack w="100%" justify="space-between">
                        {renderLabel(
                          textEllipses(item.quoteSymbol, 8),
                          item.bin_id > activeBin ? (isReverse ? LeftColor : RightColor) : isReverse ? RightColor : LeftColor,
                          true
                        )}
                        {renderValue(item.newBins.quoteAmount || '0')}
                      </HStack>
                      <Text fontSize="12px" color="text_paragraph" w="100%" textAlign="right">
                        {getPriceValue(item.newBins.quoteAmount, tokenBPrice)}
                      </Text>
                    </VStack>
                  )}
                </VStack>
              )}
            </VStack>
          </VStack>
        </VStack>
      )
    },
    [activeBin, isReverse, tokenAPrice, tokenBPrice]
  )

  const handleSliderChangeComplete = useCallback(
    (value: any) => {
      const listLen = data?.list?.length
      if (!listLen) return

      // 计算新的范围
      const newMin = direct ? activeBin - value : activeBin - (listLen - value - 1)
      const newMax = direct ? activeBin + (listLen - value - 1) : activeBin + value

      // 检查是否真的改变了范围 - 计算当前滑块位置对应的范围
      const currentSliderIndex = data?.list?.findIndex(item => item.bin_id === activeBin) || 0
      const currentMin = direct ? activeBin - currentSliderIndex : activeBin - (listLen - currentSliderIndex - 1)
      const currentMax = direct ? activeBin + (listLen - currentSliderIndex - 1) : activeBin + currentSliderIndex

      const hasRangeChanged = newMin !== currentMin || newMax !== currentMax

      if (hasRangeChanged && onChangeRange) {
        // 如果范围真的改变了，调用 onChangeRange
        onChangeRange(newMin, newMax, true)
        // 将预览数据应用到可编辑数据
        if (previewData) {
          setEditableData(previewData)
        }
      } else {
        // 如果范围没有改变，重置数据到原始状态
        if (originalData) {
          setEditableData(originalData)
          setPreviewData(originalData)
        }
      }

      // 重置拖动状态
      setIsDragging(false)
    },
    [activeBin, data, direct, onChangeRange, originalData, previewData]
  )

  const [sliderValue, setSliderValue] = useState<number | undefined>(undefined)

  useEffect(() => {
    const activeBinIndex = data?.list?.findIndex(item => item.bin_id === activeBin)
    setSliderValue(activeBinIndex)
  }, [activeBin, data])

  // 使用节流优化其他处理逻辑，300ms 节流间隔
  // 这样可以避免滑动时过于频繁的计算和日志输出，提升性能
  const throttledProcessLogic = useThrottle(
    useCallback(
      async (value: any) => {
        // const activeBinIndex = data?.list?.findIndex(item => item.bin_id === activeBin)
        // chartBinsData && chartBinsData()
        const activeBinIndex = data?.list?.findIndex(item => item.bin_id === activeBin)
        if (activeBinIndex === value || data?.list?.length < 2) return
        const listLen = data?.list?.length

        // test start###########
        const a = activeBinIndex - value
        const isAsce = data?.list[0].bin_id < data?.list[data?.list?.length - 1].bin_id
        let min, max
        if (a < 0) {
          // 向右拖
          if (isAsce) {
            min = data?.list[0].bin_id + a
            max = data?.list[listLen - 1].bin_id + a
          } else {
            min = data?.list[listLen - 1].bin_id - a
            max = data?.list[0].bin_id - a
          }
        } else {
          // 向左拖
          if (isAsce) {
            min = data?.list[0].bin_id + a
            max = data?.list[listLen - 1].bin_id + a
          } else {
            min = data?.list[listLen - 1].bin_id - a
            max = data?.list[0].bin_id - a
          }
        }

        const res = chartBinsData && (await chartBinsData(min, max))

        if (res) {
          // 拖动时更新预览数据，保持动画效果
          if (isDragging) {
            setPreviewData({
              ...res
            })
          } else {
            setEditableData({
              ...res
            })
          }
          return
        }

        // test end########

        // 如果预计算方式拿到的是null，则走原来逻辑
        let result: any = []
        if (listLen > 0) {
          const s = direct ? value - activeBinIndex : activeBinIndex - value
          const priceStep = d(data?.list[1]?.price).minus(data?.list[0]?.price).toNumber()
          for (let i = 0; i < listLen; i++) {
            const cItem = data?.list[i]
            const index = direct ? i - s : i + s

            const item: any = data?.list[index]
            if (!item) {
              result.push({
                ...cItem,
                bin_id: cItem.bin_id - s,
                price: direct ? d(cItem.price).minus(d(priceStep).mul(i)).toNumber() : d(cItem.price).plus(d(priceStep).mul(i)).toNumber(),
                liquidity: 0
              })
            } else {
              result.push(item)
            }
          }

          // 计算 result 中 liquidity 的最大值
          const maxLiquidity = Math.max(...result.map((item: any) => Number(item.liquidity) || 0))

          // 拖动时更新预览数据，保持动画效果
          if (isDragging) {
            setPreviewData({
              list: result,
              max: maxLiquidity
            })
          } else {
            setEditableData({
              list: result,
              max: maxLiquidity
            })
          }
        }
      },
      [activeBin, data, chartBinsData, isDragging]
    ),
    10
  )

  // 立即更新滑动条值，保持实时响应
  const handleSliderChange = useCallback(
    (value: any) => {
      // 如果开始拖动，记录原始数据
      if (!isDragging) {
        setIsDragging(true)
        setOriginalData(editableData)
      }

      // 立即设置滑动条值，保持实时响应
      setSliderValue(value)

      // 直接在这里触发节流的处理逻辑，而不是通过 useEffect
      throttledProcessLogic(value)
    },
    [throttledProcessLogic, isDragging, editableData]
  )

  const renderData = useMemo(() => {
    // 如果正在拖动，使用预览数据保持动画效果
    if (isDragging && previewData) {
      return previewData
    }
    // 优先使用可编辑的 state 数据，否则使用原始数据
    return editableData?.list && editableData.list.length > 0 ? editableData : data || { list: [], max: 0 }
  }, [editableData, data?.list, isDragging, previewData])

  const BarShape = useMemo(() => {
    return renderData?.list?.length > 200 ? 'rect' : 'path'
  }, [renderData?.list?.length])

  // 计算 Slider 的偏移量，使其与柱子中心对齐
  const getSliderOffset = useMemo(() => {
    // if (!renderData?.list?.length || renderData?.list?.length <= 1) return 0
    if (!renderData?.list?.length) return 0

    const barWidth = width / renderData?.list?.length
    const halfBarWidth = barWidth / 2

    return halfBarWidth
  }, [renderData?.list?.length, width])

  // 计算 Slider 的实际宽度，确保可以正常拖动
  const getSliderWidth = useMemo(() => {
    // if (!renderData?.list?.length || renderData?.list?.length <= 1) return width
    if (!renderData?.list?.length) return width

    const barWidth = width / renderData?.list?.length
    const sliderWidth = width - barWidth // 减去一个柱子的宽度，确保边界对齐

    return sliderWidth
  }, [renderData?.list?.length, width, getSliderOffset])

  const haveRightMargin = useMemo(() => {
    if (!renderData?.list?.length) return 0
    return renderData?.list?.length > 650 ? 2 : 0
  }, [renderData?.list, activeBin])

  const haveLeftMargin = useMemo(() => {
    if (!renderData?.list?.length) return 0
    return renderData?.list?.length > 650 ? 2 : 0
  }, [renderData?.list, activeBin])

  const { isApp } = useWindowWidth()

  return (
    <VStack gap="0px" p="0px" width={width} height={height} position="relative">
      {toLargeRange ? (
        <ToLargeData />
      ) : !!renderData && renderData?.list?.length > 0 ? (
        <VStack w="100%" h="100%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={renderData?.list || []}
              margin={isApp ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: 12, right: haveRightMargin, left: haveLeftMargin, bottom: 0 }}
            >
              {/* 定义渐变 */}
              <defs>
                <linearGradient id="splitGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="50%" stopColor={direct ? LeftColor : RightColor} />
                  <stop offset="50%" stopColor={direct ? RightColor : LeftColor} />
                </linearGradient>
              </defs>
              <defs>
                <linearGradient id="splitGradientOpacity" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="50%" stopColor={direct ? LeftColorOpacity : RightColorOpacity} />
                  <stop offset="50%" stopColor={direct ? RightColorOpacity : LeftColorOpacity} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="price"
                tickLine={false}
                tick={{ fontSize: '12px', fill: '#909CA4' }}
                tickMargin={7}
                tickFormatter={value => formatPriceUseInDlmmAxis(value)}
              />
              <YAxis type="number" domain={[0, renderData?.max]} hide={true} />
              {/* <YAxis type="number" hide={true} /> */}
              {/* 自定义底部线 */}
              <line x1={0} y1={height - 29} x2="100%" y2={height - 29} stroke="#355369" strokeWidth="2px" />
              <Tooltip cursor={false} content={<CustomTooltip />} wrapperStyle={{ zIndex: 999999 }} />
              <Bar
                dataKey={fromPosition ? 'totalLiquidity' : 'liquidity'}
                shape={(props: any) => renderCustomBar(props, activeBin, isReverse, height, fromPosition, BarShape)}
              />
            </BarChart>
          </ResponsiveContainer>

          {isShowSlider && sliderValue !== undefined && (
            <Box
              w="100%"
              position="absolute"
              left="0px"
              bottom="28px"
              zIndex={100}
              style={{
                transform: `translateX(${getSliderOffset}px)`,
                width: `${getSliderWidth}px`
              }}
            >
              <Slider
                className="dlmm-current-liquidity-slider"
                min={0}
                max={Math.max(0, (renderData?.list?.length || 1) - 1)}
                // defaultValue={sliderValue}
                value={sliderValue}
                onChange={handleSliderChange} // 更新选中区间
                onChangeComplete={handleSliderChangeComplete}
                // onChangeComplete={handleSliderChangeComplete} // 更新选中区间
                step={1}
                dots={false}
                dotStyle={{ display: 'none' }}
                trackStyle={[
                  {
                    backgroundColor: '#355369', // 选中轨道颜色（默认蓝色）
                    height: 2, // 轨道高度
                    borderRadius: 0, // 轨道圆角
                    zIndex: 100
                  }
                ]}
                railStyle={{
                  backgroundColor: '#355369', // 外部轨道颜色（默认浅灰色）
                  height: 2, // 轨道高度
                  borderRadius: 0, // 轨道圆角
                  zIndex: 100
                }}
                handleStyle={{
                  // 右侧滑块样式
                  borderColor: 'none!important',
                  backgroundColor: '#fff!important',
                  borderRadius: '2px',
                  width: 18,
                  height: 10,
                  opacity: 1,
                  top: '1px',
                  zIndex: 100,
                  outline: 'none'
                }}
                // handleRender={handleRender}
              />
            </Box>
          )}
        </VStack>
      ) : (
        <NoData type={type} noDataText={noDataText} height={height} loading={dataLoading} />
      )}
    </VStack>
  )
}

const ColorBlock = ({ color }: { color: string }) => {
  return <Box w="12px" h="12px" bg={color} borderRadius="4px" />
}

const NoData = ({
  type = 'simulation',
  noDataText,
  height,
  loading
}: {
  type?: 'pool' | 'position' | 'simulation'
  noDataText?: string
  height?: number
  loading?: boolean
}) => {
  return (
    <VStack
      w="100%"
      h={height ? height - 8 + 'px' : '100%'}
      gap="8px"
      bg="center / contain no-repeat url('/images/dlmm_liquidity_bg.png') #72c1f708"
      alignItems="center"
      justify="center"
      position="absolute"
      left="0px"
      top="0px"
      backdropFilter="blur(2px)"
      borderRadius="12px"
    >
      {loading && <Spinner size="sm" />}
      {noDataText ? (
        <Text color="text_caption" fontSize="14px">
          {noDataText}
        </Text>
      ) : (
        <>
          <Text color="text_caption" fontSize="14px">
            Preview your liquidity position
          </Text>
          <Text color="text_paragraph" fontSize="12px">
            Please enter deposit amount and select price range
          </Text>
        </>
      )}
    </VStack>
  )
}

const ToLargeData = () => {
  return (
    <VStack
      w="100%"
      h="100%"
      gap="8px"
      bg="center / contain no-repeat url('/images/dlmm_liquidity_bg.png') #72c1f708"
      alignItems="center"
      justify="center"
      position="absolute"
      left="0px"
      top="0px"
      backdropFilter="blur(2px)"
      borderRadius="12px"
    >
      <Text color="text_caption" fontSize="14px">
        Missing chart data
      </Text>
      <Text color="text_paragraph" fontSize="12px">
        Chart cannot be generated for this price range
      </Text>
    </VStack>
  )
}

export default memo(CurrentLiquidityChart)
