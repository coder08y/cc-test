import { FrozenPools } from '@/constant/pool'
import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import { PoolApiInfo, PoolContractInfo } from '@/types'
import { getPoolDirection } from '@/utils/pool'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetusprotocol/common-sdk'
import useGetCurrentPrice from '../clmm/useGetCurrentPrice'

export default function useGetContractPoolInfo() {
  const clmmSdk = useSdk('clmm')
  const { fetchTokenInfo } = useGetToken()
  const { contractPoolInfo, setContractPoolInfo, setContractPoolInfoLoading, apiPoolInfo, setApiPoolInfo, setApiPoolInfoLoading } =
    useLiquidityStore()
  const { setFromToken, setToToken } = useAddLiquidityStore()
  const { getCurrentPrice } = useGetCurrentPrice()

  const getContractPoolInfo = async (poolAddress: string): Promise<PoolContractInfo | null> => {
    setContractPoolInfoLoading(true)
    let poolInfo: PoolContractInfo | null = null
    try {
      const res = await clmmSdk!.Pool.getPool(poolAddress)
      poolInfo = {
        ...res,
        coinAmountA: String(res.coin_amount_a),
        coinAmountB: String(res.coin_amount_b),
        coinTypeA: res.coin_type_a,
        coinTypeB: res.coin_type_b,
        poolAddress: res.id,
        poolType: res.pool_type,
        tickSpacing: Number(res.tick_spacing),
        current_sqrt_price: String(res.current_sqrt_price),
        fee_growth_global_a: String(res.fee_growth_global_a),
        fee_growth_global_b: String(res.fee_growth_global_b),
        fee_protocol_coin_a: String(res.fee_protocol_coin_a),
        fee_protocol_coin_b: String(res.fee_protocol_coin_b),
        fee_rate: String(res.fee_rate),
        liquidity: String(res.liquidity),
        rewarder_infos: res.rewarder_infos.map(r => {
          return {
            coinAddress: r.coin_type,
            emissionsEveryDay: r.emissions_per_second,
            emissions_per_second: String(r.emissions_per_second),
            growth_global: String(r.growth_global)
          }
        })
      }
      console.log(poolAddress, poolInfo, 'poolAddress')
      console.log('🚀 ~ getContractPoolInfo ~ poolInfo:', {
        poolInfo,
        apiPoolInfo
      })

      // 如果没拿到apiPoolInfo 信息，则用合约信息转化一份
      if (apiPoolInfo?.displayTokenA === undefined) {
        const apiPool = await formatApiPoolByContractPool(poolInfo)
        console.log('🚀🚀🚀 ~ useGetContractPoolInfo.ts:59 ~ getContractPoolInfo ~ apiPool:', apiPool)

        if (apiPool) {
          setApiPoolInfo(apiPool)
          setApiPoolInfoLoading(false)
          getCurrentPrice(poolInfo?.current_sqrt_price, apiPool, poolInfo?.current_tick_index)
          setFromToken(apiPool?.displayTokenA)
          setToToken(apiPool?.displayTokenB)
        }
      }
    } catch (error) {
      console.log('getContractPoolInfo ~ error:', error)
    } finally {
      setContractPoolInfoLoading(false)
    }
    if (!contractPoolInfo) {
      setContractPoolInfo(poolInfo || null)

      return poolInfo
    } else {
      if (poolInfo) {
        setContractPoolInfo(poolInfo)
        return poolInfo
      } else {
        return contractPoolInfo
      }
    }
  }

  async function formatApiPoolByContractPool(cPool: PoolContractInfo) {
    const tokenA = await fetchTokenInfo(cPool.coinTypeA)
    const tokenB = await fetchTokenInfo(cPool.coinTypeB)

    if (tokenA && tokenB) {
      const name = `${tokenA?.symbol} - ${tokenB?.symbol}`
      const feeRate = d(cPool.fee_rate).div(100).toString()
      const fee = d(cPool.fee_rate).div(10000).toString()
      const feeDisplay = d(feeRate).div(100).toString() + '%'
      const isReverse = !getPoolDirection(cPool.coinTypeA, cPool.coinTypeB)
      const isFrozen = FrozenPools.includes(cPool.poolAddress)

      const pool: PoolApiInfo & { isFrozen?: boolean } = {
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
        fee,
        feeRate,
        feeDisplay,
        tvlDisplay: '0',
        volume24Display: '0',
        fees24Display: '0',
        isVaults: false,
        tickSpacing: cPool.tickSpacing.toString(),
        isFrozen
      }

      return pool
    }

    return undefined
  }

  return {
    getContractPoolInfo
  }
}
