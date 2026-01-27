import { d, symbolDataDisplayProcessing } from '@cetus/utils'
import Decimal from 'decimal.js'
import useWrapPoolData from './useWrapPoolData'

function useWrapDlmmPoolData() {
  const { wrapDLmmPoolData } = useWrapPoolData()
  const wrapDlmmGroupedPoolData = (list: any[], isLocalData = false) => {
    return list?.map((item: any) => {
      const isReverse = item?.showReverse
      const pools = item?.pools || []
      const wrapPools = pools?.map(pool =>
        wrapDLmmPoolData(
          {
            ...pool,
            showReverse: isReverse,
            coinA: item?.coinA || { coinType: pool?.coinTypeA, symbol: pool?.coinTypeA?.split('::')?.pop() },
            coinB: item?.coinB || { coinType: pool?.coinTypeB, symbol: pool?.coinTypeB?.split('::')?.pop() },
            pool: pool?.pool || pool?.id
          },
          isLocalData
        )
      )
      let totalApr = '--'

      if (wrapPools?.length === 1) {
        // 如果只有1个池子，直接使用该池子的APR
        totalApr = wrapPools[0].totalApr
      } else if (wrapPools?.length > 1) {
        // 过滤掉无效池子：APR > 1,000,000% 且 TVL < $10
        const validPools = wrapPools.filter((pool: any) => {
          console.log('00000: ', pool)
          const apr = d(pool.totalApr == '--' ? 0 : pool.totalApr)
          const tvl = d(pool.tvl == '--' ? 0 : pool.tvl)
          // 如果APR > 1,000,000% 且 TVL < $10，则视为无效
          return !(apr.gt(10000) && tvl.lt(10))
        })

        // 检查是否有无效池子且其他池子APR都是0%
        const invalidPools = wrapPools.filter((pool: any) => {
          const apr = d(pool.totalApr == '--' ? 0 : pool.totalApr)
          const tvl = d(pool.tvl == '--' ? 0 : pool.tvl)
          // 如果APR > 1,000,000% 且 TVL < $10，则视为无效
          return apr.gt(10000) && tvl.lt(10)
        })

        const zeroAprPools = wrapPools.filter((pool: any) => {
          const apr = d(pool.totalApr == '--' ? 0 : pool.totalApr)
          return apr.eq(0)
        })

        // 如果有无效池子且其他池子APR都是0%，则取>1,000,000%
        if (invalidPools.length > 0 && zeroAprPools.length === wrapPools.length - invalidPools.length) {
          totalApr = '10001'
        } else if (validPools.length === 1) {
          // 如果过滤后只剩1个池子，使用该池子的APR
          totalApr = validPools[0].totalApr
        } else {
          // 如果过滤后有多个有效池子，取最大APR
          const maxApr = Decimal.max(...validPools.map(pool => d(pool.totalApr)))
          totalApr = maxApr.toString()
        }
      }

      // 移除重复的代码
      // const newWrapPools = wrapPools.filter(pool => !d(pool.totalApr).gt(10000) && d(pool.tvl).lt(10))
      // const totalApr = isLocalData ? '--' : Decimal.max(...newWrapPools?.map(pool => Number(pool.totalApr)))
      const miningRewardList = new Map()
      wrapPools?.forEach((pool: any) => {
        pool?.miningRewardList?.forEach((reward: any) => {
          if (miningRewardList.has(reward?.coinType)) {
            miningRewardList.set(reward?.coinType, {
              ...reward,
              emissionsEveryDay: d(miningRewardList.get(reward?.coinType)?.emissionsEveryDay).plus(reward?.emissionsEveryDay).toString()
            })
          } else {
            miningRewardList.set(reward?.coinType, reward)
          }
        })
      })
      const farmsRewarderList = new Map()
      wrapPools?.forEach((pool: any) => {
        pool?.farmsRewarderList?.forEach((reward: any) => {
          if (farmsRewarderList.has(reward?.coinType)) {
            farmsRewarderList.set(reward?.coinType, {
              ...reward,
              emissionsEveryDay: d(farmsRewarderList.get(reward?.coinType)?.emissionsEveryDay).plus(reward?.emissionsEveryDay).toString()
            })
          } else {
            farmsRewarderList.set(reward?.coinType, reward)
          }
        })
      })
      const tvlDisplay = isLocalData
        ? '--'
        : symbolDataDisplayProcessing(
            pools?.reduce(
              (sum: any, current: any) =>
                d(sum)
                  .plus(current?.tvl || '0')
                  .toString(),
              '0'
            ) || 0
          )

      const tokenA = item?.coinTypeA
        ? {
            coinType: item?.coinTypeA,
            symbol: item?.coinTypeA?.split('::')?.pop()
          }
        : item?.coinA
      const tokenB = item?.coinTypeB
        ? {
            coinType: item?.coinTypeB,
            symbol: item?.coinTypeB?.split('::')?.pop()
          }
        : item?.coinB
      return {
        id: (item?.coinA?.coinType || item?.coinTypeA) + '-' + (item?.coinB?.coinType || item?.coinTypeB),
        tokenA,
        tokenB,
        isReverse,
        displayTokenA: isReverse ? tokenB : tokenA,
        displayTokenB: isReverse ? tokenA : tokenB,
        ...item,
        coinTypeA: item?.coinA?.coinType || item?.coinTypeA,
        coinTypeB: item?.coinB?.coinType || item?.coinTypeB,
        haveFarming: wrapPools?.some((p: any) => p.haveFarming),
        haveMining: wrapPools?.some((p: any) => p.haveMining),
        volume24Display: isLocalData
          ? '--'
          : symbolDataDisplayProcessing(
              pools?.reduce((sum, current) => d(sum).plus(current?.stats?.find(s => s.dateType === '24H')?.vol || '0'), '0')
            ),

        fees24Display: isLocalData
          ? '--'
          : symbolDataDisplayProcessing(
              pools?.reduce((sum, current) => d(sum).plus(current?.stats?.find(s => s.dateType === '24H')?.fee || '0'), '0'),
              '$'
            ),
        miningRewardList: Array.from(miningRewardList?.values()),
        farmsRewarderList: Array.from(farmsRewarderList?.values()),
        totalAllAprDisplay:
          isLocalData || totalApr === '--'
            ? totalApr
            : d(totalApr).gt(10000)
              ? '>1,000,000%'
              : d(totalApr).lt(0.0001) && d(totalApr).gt(0)
                ? '<0.01%'
                : symbolDataDisplayProcessing(d(totalApr).mul(100).toString(), '%'),
        tvlDisplay,
        list: wrapPools
      }
    })
  }

  return {
    wrapDlmmGroupedPoolData
  }
}

export default useWrapDlmmPoolData
