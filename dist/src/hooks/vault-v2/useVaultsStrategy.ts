import useVaultsPoolContract from '@/store/vaults-v2/useVaultsPoolContract'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { FEE_PRECISION } from '@cetusprotocol/dlmm-sdk'
import useDeepCompareEffect from 'ahooks/lib/useDeepCompareEffect'
import Decimal from 'decimal.js'
import { ClmmBalance, DlmmBalance } from 'haedal-vault-sdk'
import { useCallback, useState } from 'react'
import useGetPythTokenPrice from './pyth-price/useGetPythTokenPrice'

const dlmmTextColorList = ['#00FF9A', '#52FFD2', '#A9FFE9']
const dlmmBgColorList = ['#12241F', '#162B25', '#1C3830']

const clmmTextColorList = ['#009AFF', '#75C8FF', '#B5E7FF']
const clmmBgColorList = ['#0F1D28', '#192128', '#222E38']

export function useVaultsStrategy(currentVaultPool: any, apiVaultInfo: any) {
  const [poolBalanceList, setPoolBalanceList] = useState<any[]>([])
  const { vaultClmmPoolContractInfoObj, vaultDlmmPoolContractInfoObj } = useVaultsPoolContract()
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()
  const { getTokenAmountValue } = useTokenPrice()

  const getTokenValue = useCallback(
    (coinType: string, amount: string) => {
      return getTokenAmountValueByPyth(coinType, amount) || getTokenAmountValue(coinType, amount)
    },
    [getTokenAmountValueByPyth, getTokenAmountValue]
  )

  useDeepCompareEffect(() => {
    if (currentVaultPool && apiVaultInfo) {
      const { displayTokenA, displayTokenB, tokenA, tokenB, liquidity_pools } = apiVaultInfo
      const { clmm_balances, dlmm_balances, share_buffer_assets } = currentVaultPool.poolBalanceInfo

      let bufferValue = '0'

      for (const item of share_buffer_assets) {
        const valueDisplay = getTokenValue(item.coin_type, item.amount_display) || getTokenAmountValue(item.coin_type, item.amount_display)
        bufferValue = d(bufferValue).add(valueDisplay).toString()
        // console.log('🚀🚀🚀 ~ useVaultsStrategy.ts:37 ~ useDeepCompareEffect ~ valueDisplay:', valueDisplay)
        // console.log('🚀🚀🚀 ~ useVaultsStrategy.ts:37 ~ useDeepCompareEffect ~ tokenValue:', item)
      }

      const _poolBalanceMap: Record<string, any> = {}

      clmm_balances.forEach((item: ClmmBalance, index: number) => {
        const { certified_pool_id, position_amount_a, position_amount_b, position_id } = item
        const clmmContract = vaultClmmPoolContractInfoObj[certified_pool_id]
        const liquidity_pool = liquidity_pools.find((item: any) => item.id === certified_pool_id)
        if (clmmContract && liquidity_pool) {
          const poolBalance = _poolBalanceMap[certified_pool_id] || {}
          const tokenAmountA = fromDecimalsAmount(position_amount_a, tokenA.decimals)
          const tokenAmountB = fromDecimalsAmount(position_amount_b, tokenB.decimals)
          poolBalance.tokenAmountA = d(tokenAmountA)
            .add(poolBalance?.tokenAmountA || '0')
            .toString()
          poolBalance.tokenAmountB = d(tokenAmountB)
            .add(poolBalance?.tokenAmountB || '0')
            .toString()
          poolBalance.tokenAValue = getTokenValue(tokenA.coin_type, poolBalance.tokenAmountA)
          poolBalance.tokenBValue = getTokenValue(tokenB.coin_type, poolBalance.tokenAmountB)
          poolBalance.tokenValue = d(poolBalance.tokenAValue || '0')
            .add(poolBalance.tokenBValue || '0')
            .toString()
          poolBalance.certified_pool_id = certified_pool_id
          poolBalance.tag = 'clmm'
          poolBalance.feeDisplay = d(clmmContract.fee_rate).div(10000).toString() + '%'
          poolBalance.displayTokenA = displayTokenA
          poolBalance.displayTokenB = displayTokenB
          poolBalance.apy = liquidity_pool?.vault_apy ? d(liquidity_pool?.vault_apy).mul(100).toFixed(2) : undefined
          poolBalance.apr = liquidity_pool?.vault_apr ? d(liquidity_pool?.vault_apr).mul(100).toFixed(2) : undefined
          if (!poolBalance.positions) {
            poolBalance.positions = []
          }
          poolBalance.positions.push(item)
          poolBalance.pool = clmmContract
          poolBalance.hasMining = clmmContract.rewarder_infos.some((rewarder: any) => rewarder.emissions_per_second > 0)
          _poolBalanceMap[certified_pool_id] = poolBalance
        }
      })

      dlmm_balances.forEach((item: DlmmBalance) => {
        const { certified_pool_id, position_amount_a, position_amount_b, position_id } = item
        const poolBalance = _poolBalanceMap[certified_pool_id] || {}
        const dlmmContract = vaultDlmmPoolContractInfoObj[certified_pool_id]
        const liquidity_pool = liquidity_pools.find((item: any) => item.id === certified_pool_id)
        if (dlmmContract && liquidity_pool) {
          const tokenAmountA = fromDecimalsAmount(position_amount_a, tokenA.decimals)
          const tokenAmountB = fromDecimalsAmount(position_amount_b, tokenB.decimals)
          poolBalance.tokenAmountA = d(tokenAmountA)
            .add(poolBalance?.tokenAmountA || '0')
            .toString()
          poolBalance.tokenAmountB = d(tokenAmountB)
            .add(poolBalance?.tokenAmountB || '0')
            .toString()
          poolBalance.tokenAValue = getTokenAmountValueByPyth(tokenA.coin_type, poolBalance.tokenAmountA)
          poolBalance.tokenBValue = getTokenAmountValueByPyth(tokenB.coin_type, poolBalance.tokenAmountB)
          poolBalance.tokenValue = d(poolBalance.tokenAValue || '0')
            .add(poolBalance.tokenBValue || '0')
            .toString()
          poolBalance.certified_pool_id = certified_pool_id
          poolBalance.tag = 'dlmm'
          poolBalance.bin_step = dlmmContract.bin_step
          poolBalance.feeDisplay = d(dlmmContract.base_fee_rate).div(FEE_PRECISION).mul(100).toString() + '%'
          poolBalance.displayTokenA = displayTokenA
          poolBalance.displayTokenB = displayTokenB
          poolBalance.apy = liquidity_pool?.vault_apy ? d(liquidity_pool?.vault_apy).mul(100).toFixed(2) : undefined
          poolBalance.apr = liquidity_pool?.vault_apr ? d(liquidity_pool?.vault_apr).mul(100).toFixed(2) : undefined
          if (!poolBalance.positions) {
            poolBalance.positions = []
          }
          poolBalance.pool = dlmmContract
          poolBalance.positions.push(item)
          poolBalance.hasMining = dlmmContract.reward_manager.rewards.some((rewarder: any) => rewarder.emissions_per_second > 0)
          _poolBalanceMap[certified_pool_id] = poolBalance
        }
      })

      const _poolBalanceList = Object.values(_poolBalanceMap)

      const posTotalTokenValue = _poolBalanceList.reduce((acc: any, curr: any) => {
        return d(acc).add(d(curr.tokenValue)).toString()
      }, '0')
      const tokenValue = d(posTotalTokenValue).add(bufferValue).toString()
      _poolBalanceList.push({
        tokenValue: bufferValue,
        certified_pool_id: apiVaultInfo?.vaultId,
        displayTokenA,
        displayTokenB,
        color: '#7f98a7',
        bgColor: 'rgba(144,156,164,0.1)',
        tag: 'buffer',
        feeDisplay: 'Idle Liquidity'
      })

      // 计算每个仓位占比
      if (d(tokenValue).gt(0)) {
        let sumPercent = d(0)
        _poolBalanceList.forEach((poolBalance: any, idx: number) => {
          if (idx < _poolBalanceList.length - 1) {
            const percent = d(poolBalance.tokenValue).div(d(tokenValue)).mul(100)
            if (d(percent).lt(1) && d(percent).gt(0)) {
              poolBalance.percent = '1'
            } else {
              poolBalance.percent = percent.toFixed(2, Decimal.ROUND_DOWN)
            }
            poolBalance.realPercent = percent.toFixed(2, Decimal.ROUND_DOWN)

            sumPercent = sumPercent.add(poolBalance.realPercent)
          }
        })
        const lastIdx = _poolBalanceList.length - 1
        if (lastIdx >= 0) {
          const bufferPercent = d(100).sub(sumPercent)
          if (d(bufferPercent).lt(1) && d(bufferPercent).gt(0)) {
            _poolBalanceList[lastIdx].percent = 1
          } else {
            _poolBalanceList[lastIdx].percent = bufferPercent.toFixed(2, Decimal.ROUND_DOWN)
          }
          _poolBalanceList[lastIdx].realPercent = bufferPercent.toFixed(2, Decimal.ROUND_DOWN)
        }
        _poolBalanceList.forEach((poolBalance: any) => {
          poolBalance.percent = d(poolBalance.percent).lt(0) ? '0' : d(poolBalance.percent).toFixed(6)
        })
      } else {
        _poolBalanceList.forEach((poolBalance: any) => {
          poolBalance.percent = '0'
        })
      }
      _poolBalanceList.sort((a, b) => {
        // 如果 a 是 buffer，则排在最后
        if (a.tag === 'buffer') return 1
        // 如果 b 是 buffer，则 a 排在前面（即 b 在后面）
        if (b.tag === 'buffer') return -1
        // 其它情况按百分比降序
        const percentA = parseFloat(a?.realPercent ?? '0')
        const percentB = parseFloat(b?.realPercent ?? '0')
        return percentB - percentA
      })
      let clmmIndex = 0
      let dlmmIndex = 0
      _poolBalanceList.forEach((poolBalance: any, index) => {
        if (poolBalance.tag !== 'buffer') {
          if (poolBalance.tag === 'clmm') {
            poolBalance.color = clmmTextColorList[clmmIndex % clmmTextColorList.length]
            poolBalance.bgColor = clmmBgColorList[clmmIndex % clmmBgColorList.length]
            clmmIndex++
          } else {
            poolBalance.color = dlmmTextColorList[dlmmIndex % dlmmTextColorList.length]
            poolBalance.bgColor = dlmmBgColorList[dlmmIndex % dlmmBgColorList.length]
            dlmmIndex++
          }
        }
      })
      setPoolBalanceList([..._poolBalanceList])
    }
  }, [vaultClmmPoolContractInfoObj, vaultDlmmPoolContractInfoObj, currentVaultPool, apiVaultInfo, getTokenValue])

  return {
    poolBalanceList
  }
}
