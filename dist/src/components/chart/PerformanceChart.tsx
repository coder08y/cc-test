import { PerformanceItem } from '@/hooks/vault-v2/chart/useGetPerformance'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { CheckBox } from '@cetus/ui-kit'
import { d, formatNumber } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { CustomizedVaultV2UsdYAxisTick } from './CustomizedAxisTick'
import PerformanceChartTooltip from './PerformanceChartTooltip'
import { ZoomController } from './ZoomController'

type PerformanceChartProps = {
  vaultId?: string
  data: PerformanceItem[]
  isTabLoading: boolean
  displayCoinA?: Token
  displayCoinB?: Token
  dateType: 'sui' | 'usd'
}

type ChartLineKey = 'hae_vault_strategy' | 'token_pair' | 'token_a' | 'token_b'

const BASE_LINE_CONFIG = {
  hae_vault_strategy: { name: 'HEA Vault Strategy', color: '#6FBCF0', showInLegend: true },
  token_pair: { name: 'Token Pair HODL', color: '#68FFD8', showInLegend: true },
  token_a: { name: '100% Token A HODL', color: '#FFCA68', showInLegend: true },
  token_b: { name: '100% Token B HODL', color: '#6868FF', showInLegend: true }
}

const ColorOpacityObj = {
  '#6FBCF0': 'rgba(111,188,240,0.2)',
  '#68FFD8': 'rgba(104,255,216,0.2)',
  '#FFCA68': 'rgba(255,202,104,0.2)',
  '#6868FF': 'rgba(104,104,255,0.2)'
}

const arePropsEqual = (prevProps: PerformanceChartProps, nextProps: PerformanceChartProps) => {
  return (
    prevProps.data?.length === nextProps.data?.length &&
    prevProps.vaultId === nextProps.vaultId &&
    prevProps?.isTabLoading === nextProps?.isTabLoading &&
    prevProps.dateType === nextProps.dateType
  )
}

function PerformanceChart({ data, isTabLoading, displayCoinA, displayCoinB }: PerformanceChartProps) {
  const slicedData = useMemo(() => data, [data])
  const [labelList, setLabelList] = useState<{ color: string; label: string; isShow: boolean }[]>([])

  const [hiddenLines, setHiddenLines] = useState<Record<ChartLineKey, boolean>>({
    hae_vault_strategy: false,
    token_pair: false,
    token_a: false,
    token_b: false
  })

  const LINE_CONFIG = useMemo(() => {
    const config = { ...BASE_LINE_CONFIG }

    if (displayCoinA && displayCoinB) {
      config.token_a.name = `100% ${displayCoinA?.symbol} HODL`
      config.token_b.name = `100% ${displayCoinB?.symbol} HODL`
    }

    return config
  }, [displayCoinA?.symbol, displayCoinB?.symbol])

  useEffect(() => {
    setLabelList([
      {
        color: '#6FBCF0',
        label: 'heaVault Strategy',
        isShow: !hiddenLines.hae_vault_strategy
      },
      {
        color: '#68FFD8',
        label: 'Token Pair HODL',
        isShow: !hiddenLines.token_pair
      },
      {
        color: '#FFCA68',
        label: `100% ${displayCoinA?.symbol} HODL`,
        isShow: !hiddenLines.token_a
      },
      {
        color: '#6868FF',
        label: `100% ${displayCoinB?.symbol} HODL`,
        isShow: !hiddenLines.token_b
      }
    ])
  }, [displayCoinA?.symbol, displayCoinB?.symbol, hiddenLines])

  const ticks = useMemo(() => {
    if (slicedData.length) {
      let min: number | undefined = undefined
      let max: number | undefined = undefined
      slicedData.forEach((item: PerformanceItem) => {
        const values = [Number(item.hae_vault_strategy), Number(item.token_a), Number(item.token_b), Number(item.token_pair)]
        const tempMin = Math.min(...values)
        const tempMax = Math.max(...values)
        if (min === undefined || tempMin < min) {
          min = tempMin
        }
        if (max === undefined || tempMax > max) {
          max = tempMax
        }
      })

      const tick4 = d(max).mul(1.001)
      const tick0 = d(min).mul(0.999)
      const interval = tick4.sub(tick0).div(4)
      return Array.from({ length: 5 }, (_, i) => tick0.add(interval.mul(i)).toNumber())
    }
    return []
  }, [slicedData])

  const { isApp, windowWidth } = useWindowWidth()

  const ZoomableLineChart = useMemo(() => {
    return ZoomController(LineChart)
  }, [])

  const formatXAxis = useCallback(
    (value: number) => {
      if (isTabLoading) return ''
      const date = new Date(value * 1000)
      const hours = date.getUTCHours()
      const minutes = date.getUTCMinutes()
      const day = date.getUTCDate()
      const month = date.getUTCMonth() + 1

      if (slicedData.length < 24) {
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
      }

      return `${month}/${day}`
    },
    [slicedData.length, isTabLoading]
  )

  const getLegendText = useCallback(
    (type: string) => {
      switch (type) {
        case 'hae_vault_strategy':
          return 'heaVault Strategy'
        case 'token_pair':
          return 'Token Pair HODL'
        case 'token_a':
          return `100% ${displayCoinA?.symbol} HODL`
        case 'token_b':
          return `100% ${displayCoinB?.symbol} HODL`
      }
    },
    [displayCoinA?.symbol, displayCoinB?.symbol]
  )

  const handleLegendClick = useCallback((e: any) => {
    console.log('🚀🚀🚀 ~ PerformanceChart.tsx:58 ~ handleLegendClick ~ e:', e)
    const key = e.value as ChartLineKey
    setHiddenLines(prev => ({ ...prev, [key]: !prev[key] }))
    console.log('🚀🚀🚀 ~ PerformanceChart.tsx:50 ~ PerformanceChart ~ hiddenLines:', hiddenLines)
  }, [])

  const renderLegend = useCallback(
    (props: any) => {
      const { payload } = props
      return isApp ? (
        <HStack flexWrap="wrap" justifyContent="flex-start">
          {payload.map((entry, index) => (
            <HStack
              key={`item-${index}`}
              cursor="pointer"
              userSelect="none"
              color={entry.color}
              onClick={() => handleLegendClick(entry)}
              justifyContent="center"
              columnGap="6px"
              flex="0 0 50%"
              maxW="48%"
              mt="8px"
            >
              <CheckBox width="16px" height="16px" checked={!hiddenLines[entry.dataKey] as boolean} iconW="16px" iconH="16px" />
              <Text style={{ color: entry.color }} fontSize="12px">
                {getLegendText(entry.value)}
              </Text>
            </HStack>
          ))}
        </HStack>
      ) : (
        <HStack>
          {payload.map((entry, index) => (
            <HStack key={`item-${index}`} cursor="pointer" userSelect="none" color={entry.color} onClick={() => handleLegendClick(entry)}>
              <CheckBox width="16px" height="16px" checked={!hiddenLines[entry.dataKey] as boolean} iconW="16px" iconH="16px" />
              <Text style={{ color: entry.color }} fontSize="12px">
                {getLegendText(entry.value)}
              </Text>
            </HStack>
          ))}
        </HStack>
      )
    },
    [isApp, hiddenLines]
  )

  console.log('🚀🚀🚀 ~ PerformanceChart.tsx:208 ~ PerformanceChart ~ data:', data)
  return (
    <VStack w="100%" h="100%">
      <ZoomableLineChart width={isApp ? windowWidth - 50 : 650} height={260} data={slicedData} scaleExtent={[1, 5]} zoomHeight={isApp ? 220 : 260}>
        {/* <LineChart data={slicedData} margin={{ top: 0, left: 10, right: 28, bottom: 5 }}> */}
        <XAxis
          dataKey="date"
          fontSize="12px"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#909CA4' }}
          dy={16}
          tickFormatter={formatXAxis}
          minTickGap={slicedData.length > 8 ? 36 : undefined}
          interval={slicedData.length <= 8 ? 0 : undefined}
        />
        <YAxis
          fontSize="12px"
          ticks={ticks}
          domain={[ticks[0], ticks[ticks.length - 1]]}
          axisLine={false}
          tickLine={false}
          tickFormatter={value => formatNumber(value, 6)}
          tick={<CustomizedVaultV2UsdYAxisTick />}
        />
        <Tooltip content={<PerformanceChartTooltip labelList={labelList} />} />
        <Legend
          content={renderLegend}
          height={0}
          wrapperStyle={{
            width: isApp ? '100%' : 'auto',
            whiteSpace: 'nowrap',
            bottom: isApp ? -16 : -20,
            left: isApp ? 4 : '50%',
            transform: isApp ? 'translateX(0%)' : 'translateX(-50%)',
            fontSize: 12
          }}
        />

        {Object.entries(LINE_CONFIG).map(([key, { color, showInLegend }]) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            activeDot={{ r: 2, fill: color, strokeWidth: 3, stroke: ColorOpacityObj?.[color] }}
            dot={false}
            hide={hiddenLines[key as ChartLineKey]}
            legendType={!showInLegend ? undefined : 'none'}
            isAnimationActive={false}
          />
        ))}
        {/* </LineChart> */}
      </ZoomableLineChart>
    </VStack>
  )
}

export default memo(PerformanceChart, arePropsEqual)
