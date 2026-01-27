import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { getPoolDirection } from '@/utils/pool'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { CoinType } from '@cetus/types'
import { camelCaseObject, d } from '@cetus/utils'
import { FEE_PRECISION } from '@cetusprotocol/dlmm-sdk'

function useGetDlmmContractPoolInfo() {
  const dlmmSdk = useSdk('dlmm')
  const { fetchTokenInfo } = useGetToken()
  const {
    dlmmContractPoolInfo,
    setDlmmContractPoolInfo,
    setDlmmContractPoolInfoLoading,
    dlmmApiPoolInfo,
    setDlmmApiPoolInfo,
    setDlmmApiPoolInfoLoading
  } = useDlmmLiquidityStore()

  const { setFromToken, setToToken } = useAddDlmmLiquidityStore()
  const getDlmmContractPoolInfo = async (poolId: string) => {
    setDlmmContractPoolInfoLoading(true)
    let poolInfo: any = null
    if (dlmmSdk) {
      try {
        const res = await dlmmSdk!.Pool.getPool(poolId)
        poolInfo = { ...res, ...camelCaseObject(res), poolAddress: res?.id }
        if ((dlmmApiPoolInfo as any)?.displayTokenA === undefined) {
          const _dlmmApiPool = await formatDlmmApiPoolByContractPool(poolInfo)
          if (_dlmmApiPool) {
            setDlmmApiPoolInfo(_dlmmApiPool as any)
            setDlmmApiPoolInfoLoading(false)
            setFromToken(_dlmmApiPool?.displayTokenA)
            setToToken(_dlmmApiPool?.displayTokenB)
          }
        }
      } catch (error) {
        console.error('getDlmmContractPoolInfo error:', error)
      } finally {
        setDlmmContractPoolInfoLoading(false)
        setDlmmApiPoolInfoLoading(false)
      }
    }
    if (!dlmmContractPoolInfo) {
      setDlmmContractPoolInfo(poolInfo || null)
      return poolInfo
    } else {
      if (poolInfo) {
        setDlmmContractPoolInfo(poolInfo as any)
        return poolInfo
      } else {
        return dlmmContractPoolInfo
      }
    }
  }

  async function formatDlmmApiPoolByContractPool(cPool: Record<string, any>) {
    const tokenA = await fetchTokenInfo(cPool.coinTypeA as CoinType)
    const tokenB = await fetchTokenInfo(cPool.coinTypeB as CoinType)
    if (tokenA && tokenB) {
      const name = `${tokenA?.symbol} - ${tokenB?.symbol}`

      const baseFee = d(cPool?.baseFeeRate).div(FEE_PRECISION).toString()
      const baseFeeDisplay = d(baseFee).mul(100).toString() + '%'
      const isReverse = !getPoolDirection(cPool.coinTypeA, cPool.coinTypeB)
      const pool = {
        ...cPool,
        poolAddress: cPool.poolAddress,
        name,
        isReverse,
        tokenA,
        tokenB,
        displayTokenA: isReverse ? tokenB : tokenA,
        displayTokenB: isReverse ? tokenA : tokenB,
        haveMining: false,
        miningRewardList: null,
        miningAprList: null,
        haveFarming: false,
        farmsRewarderList: null,
        farmsApr: '',
        farmingAprDisplay: '',
        feeApr: '',
        feeAprDisplay: '',
        miningAprTotal: '',
        feeAndMiningAprDisplay: '',
        totalAprDisplay: '',
        baseFee,
        baseFeeRate: cPool?.baseFeeRate,
        feeDisplay: baseFeeDisplay,
        baseFeeDisplay,
        tvlDisplay: '0',
        volume24Display: '0',
        fees24Display: '0',
        isVaults: false
      }
      return pool
    }
    return undefined
  }

  return { getDlmmContractPoolInfo, formatDlmmApiPoolByContractPool }
}

export default useGetDlmmContractPoolInfo
