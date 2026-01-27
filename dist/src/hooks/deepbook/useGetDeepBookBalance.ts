import useDeepBookStore from '@/store/deepbook'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import { useAccountStore } from '@cetus/stores'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { d } from '@cetus/utils'
import { useMemo } from 'react'
import { useGetCoin } from '../common/useCoin'
import { testnetCoins } from './useGetDeepBookPools'

// 从 managerBalanceListObjs 中聚合所有 balance manager 的指定 coin type 余额
const getTotalBalanceFromManagerList = (managerBalanceListObjs: Record<string, any>, coinType: string): string => {
  if (!managerBalanceListObjs || typeof managerBalanceListObjs !== 'object') {
    return '0'
  }

  let totalBalance = '0'
  Object.values(managerBalanceListObjs).forEach((balanceObjs: any) => {
    if (balanceObjs && typeof balanceObjs === 'object' && balanceObjs[coinType]) {
      const adjustedBalance = balanceObjs[coinType]?.adjusted_balance || '0'
      totalBalance = d(totalBalance).add(adjustedBalance).toString()
    }
  })

  return totalBalance
}

// 从 API 返回的 type 字段中提取 coin type
// type 格式: "0x2c8d603bc51326b8c13cef9dd07031a408a48dddb541963357661df5d3204809::balance_manager::BalanceKey<0x2::sui::SUI>"
// 需要提取: "0x2::sui::SUI"
const extractCoinTypeFromApiType = (typeStr: string): string | null => {
  const match = typeStr.match(/<(.+)>/)
  return match ? match[1] : null
}

export default function useGetDeepBookBalance(poolAddress?: string) {
  const { deepBookPools, currentDeepBookPool, managerBalanceObjs, managerBalanceListObjs, getCurrentBalanceManagerInfo } = useDeepBookStore()
  const { currentAccount } = useAccountStore()

  const currentDeepBookPoolData = useMemo(() => {
    return poolAddress ? deepBookPools.find((pool: any) => pool.address === poolAddress) : currentDeepBookPool
  }, [poolAddress, deepBookPools, currentDeepBookPool])

  // 优先使用 API 数据，如果没有则使用 SDK 数据
  const baseFreeBalance = useMemo(() => {
    if (!currentAccount?.address) {
      return '0'
    }
    // 使用 currentDeepBookPoolData 而不是 currentDeepBookPool，确保当传入 poolAddress 时使用正确的 pool
    if (currentDeepBookPoolData?.address) {
      const coinType = currentDeepBookPoolData?.baseAssets?.coin_type

      // 优先使用聚合后的所有 balance manager 的余额
      // const totalBalanceFromList = getTotalBalanceFromManagerList(managerBalanceListObjs, coinType)
      // if (d(totalBalanceFromList).gt(0)) {
      //   return totalBalanceFromList
      // }
      // 如果没有多个 balance manager 的数据，使用当前 balance manager 的余额
      // console.log('🚀🚀🚀 ~ useGetDeepBookBalance.ts:59 ~ useGetDeepBookBalance ~ managerBalanceObjs:', managerBalanceObjs)
      return managerBalanceObjs[coinType]?.adjusted_balance || '0'
    }
    return '0'
  }, [currentAccount?.address, currentDeepBookPoolData?.address, currentDeepBookPoolData?.baseAssets, managerBalanceObjs, managerBalanceListObjs])

  const quoteFreeBalance = useMemo(() => {
    // 如果账户未连接，直接返回 '0'
    if (!currentAccount?.address) {
      return '0'
    }
    // 使用 currentDeepBookPoolData 而不是 currentDeepBookPool，确保当传入 poolAddress 时使用正确的 pool
    if (currentDeepBookPoolData?.address) {
      const coinType = currentDeepBookPoolData?.quoteAssets?.coin_type

      // 优先使用聚合后的所有 balance manager 的余额
      // const totalBalanceFromList = getTotalBalanceFromManagerList(managerBalanceListObjs, coinType)
      // if (d(totalBalanceFromList).gt(0)) {
      //   return totalBalanceFromList
      // }
      // 如果没有多个 balance manager 的数据，使用当前 balance manager 的余额
      return managerBalanceObjs[coinType]?.adjusted_balance || '0'
    }
    return '0'
  }, [currentAccount?.address, currentDeepBookPoolData?.address, currentDeepBookPoolData?.quoteAssets, managerBalanceObjs, managerBalanceListObjs])

  // 使用 useMemo 确保当 coin_type 变化时，token 对象引用也会变化，从而触发 useGetTokenBalance 重新计算
  // 依赖整个对象而不是只依赖 coin_type，确保当 pool 切换时 token 对象引用会变化
  // 优先使用 currentDeepBookPoolData（当传入 poolAddress 时），否则使用 currentDeepBookPool
  const baseToken = useMemo(() => {
    return currentDeepBookPoolData?.baseAssets || currentDeepBookPool?.baseAssets
  }, [currentDeepBookPoolData?.baseAssets, currentDeepBookPool?.baseAssets])

  const quoteToken = useMemo(() => {
    return currentDeepBookPoolData?.quoteAssets || currentDeepBookPool?.quoteAssets
  }, [currentDeepBookPoolData?.quoteAssets, currentDeepBookPool?.quoteAssets])

  const { balanceInfo: baseBalance } = useGetTokenBalance(baseToken)
  const { balanceInfo: quoteBalance } = useGetTokenBalance(quoteToken)

  const deepCoinType = '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'
  const deepCoinMainnet = useGetCoin(deepCoinType)
  const deepCoin = envConfigs.env === 'testnet' ? testnetCoins.DEEP : deepCoinMainnet

  const { balanceInfo: deepBalance } = useGetTokenBalance(deepCoin)

  const deepFreeBalance = useMemo(() => {
    // 如果账户未连接，直接返回 '0'
    if (!currentAccount?.address) {
      return '0'
    }
    if (deepCoin?.coin_type && currentDeepBookPoolData?.address) {
      const coinType = deepCoin?.coin_type

      // 优先使用聚合后的所有 balance manager 的余额
      const totalBalanceFromList = getTotalBalanceFromManagerList(managerBalanceListObjs, coinType)
      if (d(totalBalanceFromList).gt(0)) {
        return totalBalanceFromList
      }
      // 如果没有多个 balance manager 的数据，使用当前 balance manager 的余额
      return managerBalanceObjs[coinType]?.adjusted_balance ?? '0'
    }
    return '0'
  }, [currentAccount?.address, managerBalanceObjs, currentDeepBookPoolData?.address, deepCoin?.coin_type, deepCoin?.decimals, managerBalanceListObjs])

  const allBaseBalance = useMemo(() => {
    return d(baseFreeBalance)
      .add(baseBalance?.balanceFormat ?? 0)
      .toString()
  }, [baseFreeBalance, baseBalance])

  const allQuoteBalance = useMemo(() => {
    return d(quoteFreeBalance)
      .add(quoteBalance?.balanceFormat ?? 0)
      .toString()
  }, [quoteFreeBalance, quoteBalance])

  return {
    baseFreeBalance,
    quoteFreeBalance,
    baseBalance,
    quoteBalance,
    deepFreeBalance,
    deepBalance,
    allBaseBalance,
    allQuoteBalance
  }
}
