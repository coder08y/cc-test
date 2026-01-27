import { VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import BinRangeSelectChart from './BinRangeSelectChart'
import CurrentLiquidityChart from './CurrentLiquidityChart'

type RangeDataItem = {
  bin: number
  liquidity: number
  animatedValue?: number
}

enum StrategyType {
  Spot = 'Spot',
  Curve = 'Curve',
  BidAsk = 'BidAsk'
}

const BarChartWidth = 652
const activeBin = -4787

function getMaxBinRangeData() {
  const activeBin = -4787
  // const data = []

  // for (let i = activeBin - 34; i <= activeBin + 34; i++) {
  //   const randomInt = getRandomInt(10000, 20000)
  //   data.push({
  //     bin: i,
  //     liquidity: randomInt
  //   })
  // }
  // return data

  const list = [
    { bin: -4821, liquidity: 12789 },
    { bin: -4820, liquidity: 10112 },
    { bin: -4819, liquidity: 11612 },
    { bin: -4818, liquidity: 19832 },
    { bin: -4817, liquidity: 17090 },
    { bin: -4816, liquidity: 12878 },
    { bin: -4815, liquidity: 18001 },
    { bin: -4814, liquidity: 15450 },
    { bin: -4813, liquidity: 12145 },
    { bin: -4812, liquidity: 16025 },
    { bin: -4811, liquidity: 17644 },
    { bin: -4810, liquidity: 12043 },
    { bin: -4809, liquidity: 18405 },
    { bin: -4808, liquidity: 18097 },
    { bin: -4807, liquidity: 11798 },
    { bin: -4806, liquidity: 14314 },
    { bin: -4805, liquidity: 19947 },
    { bin: -4804, liquidity: 19773 },
    { bin: -4803, liquidity: 17392 },
    { bin: -4802, liquidity: 11263 },
    { bin: -4801, liquidity: 10466 },
    { bin: -4800, liquidity: 14047 },
    { bin: -4799, liquidity: 18950 },
    { bin: -4798, liquidity: 12466 },
    { bin: -4797, liquidity: 14931 },
    { bin: -4796, liquidity: 17491 },
    { bin: -4795, liquidity: 15817 },
    { bin: -4794, liquidity: 16792 },
    { bin: -4793, liquidity: 18381 },
    { bin: -4792, liquidity: 16478 },
    { bin: -4791, liquidity: 14828 },
    { bin: -4790, liquidity: 16604 },
    { bin: -4789, liquidity: 16159 },
    { bin: -4788, liquidity: 12349 },
    { bin: -4787, liquidity: 18842 },
    { bin: -4786, liquidity: 19518 },
    { bin: -4785, liquidity: 17422 },
    { bin: -4784, liquidity: 13194 },
    { bin: -4783, liquidity: 19142 },
    { bin: -4782, liquidity: 11459 },
    { bin: -4781, liquidity: 16268 },
    { bin: -4780, liquidity: 11607 },
    { bin: -4779, liquidity: 11138 },
    { bin: -4778, liquidity: 19061 },
    { bin: -4777, liquidity: 10147 },
    { bin: -4776, liquidity: 18575 },
    { bin: -4775, liquidity: 11247 },
    { bin: -4774, liquidity: 15465 },
    { bin: -4773, liquidity: 17212 },
    { bin: -4772, liquidity: 13302 },
    { bin: -4771, liquidity: 10682 },
    { bin: -4770, liquidity: 14714 },
    { bin: -4769, liquidity: 14162 },
    { bin: -4768, liquidity: 12849 },
    { bin: -4767, liquidity: 19939 },
    { bin: -4766, liquidity: 12338 },
    { bin: -4765, liquidity: 16601 },
    { bin: -4764, liquidity: 12214 },
    { bin: -4763, liquidity: 17379 },
    { bin: -4762, liquidity: 14502 },
    { bin: -4761, liquidity: 11942 },
    { bin: -4760, liquidity: 19370 },
    { bin: -4759, liquidity: 15461 },
    { bin: -4758, liquidity: 17568 },
    { bin: -4757, liquidity: 10193 },
    { bin: -4756, liquidity: 17198 },
    { bin: -4755, liquidity: 16177 },
    { bin: -4754, liquidity: 15628 },
    { bin: -4753, liquidity: 15676 }
  ]

  return list
}

function getCurrentRangeData(params: { minBin: number; maxBin: number; activeBin: number; type: StrategyType }) {
  const { minBin, maxBin, activeBin, type } = params
  const data = []
  if (type === StrategyType.Spot) {
    for (let i = minBin; i <= maxBin; i++) {
      data.push({
        bin: i,
        liquidity: 100
      })
    }
    // return data
  }

  if (type === StrategyType.Curve) {
    const t = 340
    const leftUnit = t / (activeBin - minBin)
    console.log('🚀 ~ getCurrentRangeData ~ minBin:', minBin)
    console.log('🚀 ~ getCurrentRangeData ~ maxBin:', maxBin)
    console.log('🚀 ~ getCurrentRangeData ~ activeBin:', activeBin)

    const rightUnit = t / (maxBin - activeBin)

    console.log('🚀 ~ getCurrentRangeData ~ leftUnit:', leftUnit)
    console.log('🚀 ~ getCurrentRangeData ~ rightUnit:', rightUnit)

    let leftIndex = 0
    for (let i = minBin; i < activeBin; i++) {
      leftIndex++
      data.push({
        bin: i,
        liquidity: leftIndex * leftUnit
      })
    }

    let rightIndex = maxBin - activeBin
    for (let i = activeBin; i <= maxBin; i++) {
      data.push({
        bin: i,
        liquidity: rightIndex * rightUnit
      })
      rightIndex--
    }

    // return data
  }

  if (type === StrategyType.BidAsk) {
    const t = 340
    const leftUnit = t / (activeBin - minBin)
    const rightUnit = t / (maxBin - activeBin)

    let leftIndex = activeBin - minBin + 1
    for (let i = minBin; i < activeBin; i++) {
      leftIndex--
      data.push({
        bin: i,
        liquidity: leftIndex * leftUnit
      })
    }

    let rightIndex = 0
    for (let i = activeBin; i <= maxBin; i++) {
      rightIndex++
      data.push({
        bin: i,
        liquidity: rightIndex * rightUnit
      })
    }

    // return data
  }

  if (activeBin < minBin) {
    data.unshift({
      bin: activeBin,
      liquidity: 0
    })
  }

  if (activeBin > maxBin) {
    data.push({
      bin: activeBin,
      liquidity: 0
    })
  }

  return data
}

export default function ChartTest9() {
  const [maxBinRangeData, setMaxBinRangeData] = useState<RangeDataItem[]>([])
  const [currentLiquidityChartData, setCurrentLiquidityChartData] = useState<RangeDataItem[]>([])

  useEffect(() => {
    const data = getMaxBinRangeData()
    if (data) {
      setMaxBinRangeData(data)
    }
  }, [])

  const handleChangeRange = useCallback((minBin: any, maxBin: any) => {
    console.log('🚀 ~ handleChangeRange ~ minBin:', minBin)
    console.log('🚀 ~ handleChangeRange ~ maxBin:', maxBin)
    const list: any = getCurrentRangeData({
      minBin,
      maxBin,
      activeBin,
      type: StrategyType.Spot
    })
    console.log('🚀 ~ handleChangeRange ~ list:', list)
    setCurrentLiquidityChartData(list)
  }, [])

  return (
    <VStack>
      <CurrentLiquidityChart width={BarChartWidth} data={currentLiquidityChartData} activeBin={activeBin} />
      <BinRangeSelectChart data={maxBinRangeData} activeBin={activeBin} onChangeRange={handleChangeRange} />
    </VStack>
  )
}
