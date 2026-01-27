import useAddIncentive from '@/hooks/incentive/useAddIncentive'
import useIncentiveStore from '@/store/incentive'
import { Block } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import {
  Decimal,
  formatNumber,
  formatNumberWithKMB,
  formatPercentage,
  isAvailableObject,
  removeComma,
  textEllipses,
  utcTimeFormattedWithSeconds
} from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { parseRewardPeriodEmission } from '@cetusprotocol/dlmm-sdk'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useSize } from 'ahooks'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Area, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatEpoch } from './RewardTokenAndDuration'

const RewardsPreviewChart = ({ rewardInfo }: { rewardInfo: any }) => {
  const { incentiveContractPoolInfo, incentiveApiPoolInfo } = useIncentiveStore()
  const { getRewardPeriodEmission } = useAddIncentive()
  const { getTokenAmountValue } = useTokenPrice()
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    if (isAvailableObject(incentiveContractPoolInfo)) {
      getRewardPeriod(incentiveContractPoolInfo, rewardInfo)
    }
  }, [incentiveContractPoolInfo, rewardInfo])
  const getRewardPeriod = async (incentiveContractPoolInfo: any, rewardInfo: any) => {
    if (incentiveApiPoolInfo?.tvl) {
      const reward = incentiveContractPoolInfo?.reward_manager?.rewards?.filter(
        (item: any) => fixCoinType(item?.reward_coin) == fixCoinType(rewardInfo?.rewardCoin?.coin_type || '')
      )
      let _data: any[]
      const startTime = Math.floor(rewardInfo?.startTime / 1000)
      const endTime = Math.floor(rewardInfo?.endTime / 1000)
      const durationSeconds = 60 * 60 * 24
      const currentReward = reward?.[0]
      console.log(currentReward, reward, incentiveApiPoolInfo, incentiveContractPoolInfo, 'incentiveApiPoolInfo')
      if (currentReward) {
        const existing = await getRewardPeriodEmission(
          currentReward?.period_emission_rates?.id,
          currentReward?.emissions_per_second,
          incentiveContractPoolInfo?.reward_manager?.last_updated_time
        )

        const formatExisting = parseRewardPeriodEmission(existing ?? [], startTime, endTime, durationSeconds)
        _data = formatExisting?.map(item => {
          const amountValue = getTokenAmountValue(
            rewardInfo?.rewardCoin?.coin_type,
            d(item?.emissions_per_second)
              .div(d(10).pow(rewardInfo?.rewardCoin?.decimals))
              .mul(365 * 24 * 60 * 60)
              .toString() || '0'
          )
          return {
            date: dayjs(d(item?.time).mul(1000).toNumber()).format('MM/DD'),
            time: item?.time,
            visualized_time: item?.visualized_time,
            Current: d(item?.emissions_per_second)
              .div(d(10).pow(rewardInfo?.rewardCoin?.decimals))
              .mul(60 * 60)
              .toString(),
            preApr:
              rewardInfo?.rewardCoin?.is_trusted === false && d(amountValue).lte(0)
                ? '--'
                : d(amountValue).div(incentiveApiPoolInfo?.tvl).mul(100).toString()
          }
        })
        if (d(removeComma(rewardInfo?.releaseRate) ?? '0').gt(0)) {
          const addRates = d(removeComma(rewardInfo?.releaseRate)).mul(d(10).pow(rewardInfo?.rewardCoin?.decimals)).toString()
          const formatAfter = formatExisting?.map(item => ({
            ...item,
            emissions_per_second: d(item?.emissions_per_second).plus(addRates).toString()
          }))

          if (_data && _data?.length > 0) {
            _data = _data?.map((item, index) => {
              const amountVal = getTokenAmountValue(
                rewardInfo?.rewardCoin?.coin_type,
                d(formatAfter[index]?.emissions_per_second)
                  .div(d(10).pow(rewardInfo?.rewardCoin?.decimals))
                  .mul(365 * 24 * 60 * 60)
                  .toString() || '0'
              )
              return {
                ...item,
                'After Update': d(formatAfter[index]?.emissions_per_second)
                  .div(d(10).pow(rewardInfo?.rewardCoin?.decimals))
                  .mul(60 * 60)
                  .toString(),
                afterApr:
                  rewardInfo?.rewardCoin?.is_trusted === false && d(amountVal).lte(0)
                    ? '--'
                    : d(amountVal).div(incentiveApiPoolInfo?.tvl).mul(100).toString()
              }
            })
          }
        }
        if (_data) {
          setData(_data)
        }
      } else {
        const result = []
        const rates = d(removeComma(rewardInfo?.releaseRate)).toString()
        for (let time = startTime; time <= endTime; time += durationSeconds) {
          result.push({
            time: time.toString(),
            emissions_per_hour: d(rates)
              .mul(60 * 60)
              .toString(),
            visualized_time: new Date(time * 1000).toLocaleString()
          })
        }
        if (result?.length > 0) {
          _data = result?.map(item => {
            const amountVal = getTokenAmountValue(
              rewardInfo?.rewardCoin?.coin_type,
              d(item?.emissions_per_hour)
                .mul(365 * 24)
                .toString() || '0'
            )

            return {
              date: dayjs(d(item?.time).mul(1000).toNumber()).format('MM/DD'),
              time: item?.time,
              visualized_time: item?.visualized_time,
              'After Update': item?.emissions_per_hour,
              afterApr:
                rewardInfo?.rewardCoin?.is_trusted === false && d(amountVal).lte(0)
                  ? '--'
                  : d(amountVal).div(incentiveApiPoolInfo?.tvl).mul(100).toString()
            }
          })
          setData(_data)
        }
      }
    }
  }

  const hasPreRewards = data?.some(item => item?.Current && d(item?.Current).gt(0))

  const ticks = useMemo(() => {
    if (data.length) {
      const min = d(Decimal.min(...data.map(d => d?.Current ?? d?.['After Update'] ?? 0)))
        .mul(0.95)
        .toString()
      const max = d(Decimal.max(...data.map(d => d?.['After Update'] ?? 0)))
        .mul(1.05)
        .toString()
      const tick3 = d(max)
      const tick0 = d(min)
      const interval = tick3.sub(tick0).div(3)
      return Array.from({ length: 4 }, (_, i) => tick0.add(interval.mul(i)).toNumber())
    }
    return []
  }, [data])

  const rightTicks = useMemo(() => {
    const list = data.filter(item => item?.preApr !== '--' && item?.afterApr !== '--')
    if (list.length) {
      const min = d(Decimal.min(...list?.map(d => d?.preApr ?? d?.afterApr ?? 0)))
        .mul(0.95)
        .toString()
      const max = d(Decimal.max(...list?.map(d => d?.afterApr ?? 0)))
        .mul(1.05)
        .toString()
      const tick3 = d(max)
      const tick0 = d(min)
      const interval = tick3.sub(tick0).div(3)
      return Array.from({ length: 4 }, (_, i) => tick0.add(interval.mul(i)).toNumber())
    }
    return []
  }, [data])

  const tooltipSize = useSize(document?.querySelector('.recharts-tooltip-wrapper'))
  const chartRef = useRef<HTMLDivElement>(null)
  const chartSize = useSize(chartRef)

  return (
    data?.length > 0 && (
      <VStack gap="0px" w="100%" align="flex-start" p="0 16px 12px">
        <Text lineHeight="20px" w="100%" color="text_caption" fontWeight="500" m="0px 0px 16px" borderTop="1px dotted" borderColor="border" pt="16px">
          Rewards Preview
        </Text>

        <ResponsiveContainer width="100%" height={145} ref={chartRef}>
          <ComposedChart data={data} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <defs>
              <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#00D8B6" strokeWidth="1.5" />
              </pattern>
            </defs>

            <XAxis
              dataKey="date"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              interval={data?.length}
              tick={props => (
                <CustomizedXAxisTick
                  {...props}
                  length={data?.length}
                  label={(formatEpoch(rewardInfo?.startTime, rewardInfo?.endTime) as string) || '--'}
                />
              )}
            />
            <YAxis
              width={40}
              yAxisId="left"
              dataKey="After Update"
              stroke="#909CA4"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              ticks={ticks}
              domain={[ticks[0], ticks[ticks.length - 1]]}
              tickFormatter={value => formatLeftYAxis(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              dataKey="afterApr"
              fontSize={12}
              width={58}
              ticks={rightTicks}
              domain={[rightTicks[0], rightTicks[rightTicks.length - 1]]}
              axisLine={false}
              tickLine={false}
              stroke="#909CA4"
              tickFormatter={value => (value === '--' ? '' : formatRightYAxis(value) + '%')}
            />
            <Tooltip
              offset={4}
              allowEscapeViewBox={{ y: true }}
              wrapperStyle={{ zIndex: 100 }}
              // position={{ x: ((chartSize?.width ?? 0) - 98 - (tooltipSize?.width ?? 0)) / 2 + 40, y: 120 }}
              content={<RewardsPreviewTooltip rewardInfo={rewardInfo} />}
            />

            {/* 添加图例 */}
            <Legend
              wrapperStyle={{
                fontSize: 12,
                color: '#909CA4',
                top: -33, // 可以微调位置
                right: -10
              }}
              verticalAlign="top"
              align="right"
            />

            {/* 绿色线及斜线填充 */}
            <Area yAxisId="left" type="monotone" dataKey="After Update" stroke="#00D8B6" fill="url(#diagonalHatch)" />

            {/* 蓝色线及背景填充 */}
            {hasPreRewards && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Current"
                stroke="#4A9AEF"
                fillOpacity={1} // 完全不透明
                fill="#0F0F0F" // 背景色
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </VStack>
    )
  )
}

const formatLeftYAxis = (value: string) => {
  if (d(value).gt(100000000)) {
    return '>100M'
  } else if (d(value).gt(1) && d(value).lt(1000)) {
    return Math.floor(Number(value)) + ''
  } else if (d(value).gt(0.01) && d(value).lt(1)) {
    return formatNumber(value, 2)
  } else if (d(value).gte(1000)) {
    return formatNumberWithKMB(value, 0)
  } else if (d(value).gt(0) && d(value).lt(0.01)) {
    return '<0.01'
  } else {
    return '0'
  }
}

const formatRightYAxis = (value: string) => {
  if (d(value).gt(100000000)) {
    return '>100M'
  } else if (d(value).gt(1) && d(value).lt(1000)) {
    return Math.floor(Number(value)) + ''
  } else if (d(value).gt(0.01) && d(value).lt(1)) {
    return formatNumber(value, 2)
  } else if (d(value).gte(1000)) {
    return formatNumberWithKMB(value, 0)
  } else if (d(value).gt(0) && d(value).lt(0.01)) {
    return '<0.01'
  } else {
    return '0'
  }
}

const CustomizedXAxisTick = ({ x, y, width, height, payload, label, length, ...rest }: any) => {
  // 这是你想要显示的自定义元素
  const len = label?.split(' ')?.length

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={x + (len > 2 ? 48 : 70)} y={8} fill="#909CA4" fontSize={12} fontFamily="Inter">
        {label}
      </text>
    </g>
  )
}

const RewardsPreviewTooltip = ({ payload, rewardInfo }) => {
  return (
    payload &&
    payload.length && (
      <Block borderRadius="12px" p="8px">
        <VStack alignItems="left">
          <Text fontSize="12px">{utcTimeFormattedWithSeconds(Number(payload[0]?.payload?.time) * 1000) + ' (UTC)'}</Text>
          {payload?.map((item: any) => {
            return (
              <VStack align="flex-start" bg="#1B1D21" borderRadius="8px" key={item?.dataKey} p="8px">
                <Text fontSize="12px" color={item.color}>
                  {item?.dataKey}
                </Text>
                <HStack w="100%" gap="16px" justify="space-between">
                  <VStack align="flex-start">
                    <Text fontSize="12px">Emission Rate</Text>
                    <Text fontSize="12px">{textEllipses(rewardInfo?.rewardCoin?.symbol, 10) || ''} Reward APR</Text>
                  </VStack>
                  <VStack align="flex-end">
                    <Text fontSize="12px" color="text_caption" as="span" textAlign="right">
                      {formatNumber(item?.payload[item?.dataKey], 2)}
                      <Text fontSize="12px" as="span" ml="4px" textAlign="right">
                        {textEllipses(rewardInfo?.rewardCoin?.symbol, 10) || ''} per hour
                      </Text>
                    </Text>
                    <Text fontSize="12px" color="text_caption">
                      {item?.name === 'After Update'
                        ? item?.payload?.afterApr === 'Infinity' || item?.payload?.afterApr === '--'
                          ? '--'
                          : formatPercentage(item?.payload?.afterApr)
                        : item?.payload?.preApr === 'Infinity' || item?.payload?.preApr === '--'
                          ? '--'
                          : formatPercentage(item?.payload?.preApr)}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            )
          })}
        </VStack>
      </Block>
    )
  )
}

export default RewardsPreviewChart
