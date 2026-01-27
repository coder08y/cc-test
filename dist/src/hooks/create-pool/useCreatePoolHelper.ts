import { FeeTier } from '@/components/selectPool/type'
import usePosAdd from '@/hooks/position/usePosAdd'
import { MsafeTransactionSubType, PreCreateDLMMRes, preCreateRes } from '@/types'
import { getFeeTierList } from '@/utils/clmm'
import { getBaseFeeList } from '@/utils/dlmm'
import { getReversePrice } from '@/utils/pool'
import { clmmDefaultFeeOptions } from '@cetus/design/src/components/common/feeSelect/config'
import { BinStepType } from '@cetus/design/src/components/common/feeSelect/type'
import { useSdk } from '@cetus/sdk-factory'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import { Token } from '@cetus/types'
import { amountToBN, d } from '@cetus/utils'
import { TickMath, TickUtil, getNearestTickByTick } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { useMemo } from 'react'
import useGetDlmmPoolList from '../pool/useGetDlmmPoolList'
import useGetPoolList from '../pool/useGetPoolList'
import useWrapPoolData from '../pool/useWrapPoolData'

export default function useCreatePoolHelper() {
  const clmmSdk = useSdk('clmm')
  const dlmmSdk = useSdk('dlmm')
  const { preAdd } = usePosAdd()
  const { getPoolList } = useGetPoolList()
  const { getDlmmPoolList } = useGetDlmmPoolList()
  const { wrapDLmmPoolData } = useWrapPoolData()
  const { binStepConfig } = useBinStepConfigStore()
  const slippage = 0.05

  /**
   * 获取fee tier list
   * @param baseCoinType
   * @param quoteCoinType
   * @returns
   */
  const fetchFeeTierList = async (baseCoinType: string, quoteCoinType: string) => {
    try {
      if (baseCoinType && quoteCoinType) {
        const res = await getPoolList({
          coin_type: `${baseCoinType},${quoteCoinType}`,
          is_vaults: false,
          display_all_pools: true,
          has_mining: true,
          has_farming: true,
          no_incentives: true,
          order_by: '-vol',
          offset: 0
        })
        if (res && res.list && res.list.length > 0) {
          const feeTierList = getFeeTierList(res.list) as FeeTier[]
          const result = clmmDefaultFeeOptions?.map(item => {
            const _pool = feeTierList.find(feeTier => feeTier.feeRate === item.feeRate)
            return {
              ...item,
              title: _pool?.title || item.title,
              poolAddress: _pool?.poolAddress,
              liquidity: _pool?.liquidity,
              tvl: _pool?.tvl
            }
          })

          const feeIndex = result.findIndex((ele: any) => ele.feeDisplay === '0.001%' && !ele.poolAddress)
          return result.filter((ele, index) => Number(index) !== feeIndex)
        } else {
          return clmmDefaultFeeOptions.filter(ele => ele.feeDisplay !== '0.001%')
        }
      }
    } catch (error) {
      console.log('🚀 ~ fetchFeeTierList ~ fetchFeeTierList:', error)
    }
    return [...clmmDefaultFeeOptions]
  }

  // 创建池子预计算
  const preAddPool = (params: {
    realTokenA: Token
    realTokenB: Token
    needReverse: boolean
    price: string
    tickSpacing: number
    minPrice: string
    maxPrice: string
    amount: string
    amountCoinType: string
  }): preCreateRes => {
    const { tickSpacing, price, minPrice, maxPrice, amount, amountCoinType, realTokenA, realTokenB, needReverse } = params
    const currentSqrtPrice = TickMath.priceToSqrtPriceX64(d(price), realTokenA.decimals, realTokenB.decimals).toString()

    const currTick = TickMath.priceToTickIndex(d(price), realTokenA.decimals, realTokenB.decimals).toString()

    const decimalsA = realTokenA.decimals
    const decimalsB = realTokenB.decimals

    let lowerTick, upperTick
    if (minPrice === '0' && maxPrice === '∞') {
      lowerTick = TickUtil.getMinIndex(tickSpacing)
      upperTick = TickUtil.getMaxIndex(tickSpacing)
    } else {
      const min = !needReverse ? minPrice : getReversePrice(maxPrice)
      const max = !needReverse ? maxPrice : getReversePrice(minPrice)
      const realMintTick = TickMath.priceToTickIndex(d(min), realTokenA.decimals, realTokenB.decimals).toString()
      console.log('🚀 ~ file: useCreatePoolHelper.ts:103 ~ useCreatePoolHelper ~ realMintTick:', realMintTick)

      lowerTick = getNearestTickByTick(TickMath.priceToTickIndex(d(min), decimalsA, decimalsB), tickSpacing)
      upperTick = getNearestTickByTick(TickMath.priceToTickIndex(d(max), decimalsA, decimalsB), tickSpacing)
    }

    console.log('🚀 ~ file: useCreatePoolHelper.ts:87 ~ useCreatePoolHelper ~ params:', {
      ...params,
      currentSqrtPrice,
      lowerTick,
      upperTick,
      currTick
    })

    const isTokenA = amountCoinType === realTokenA?.coin_type
    const amountBN = amountToBN(amount, isTokenA ? decimalsA : decimalsB).toString()
    const res = preAdd({
      amount: amountBN,
      tokenA: realTokenA,
      tokenB: realTokenB,
      isTokenA,
      lowerTick,
      upperTick,
      curSqrtPrice: currentSqrtPrice,
      isReverse: needReverse,
      roundUp: true
    })
    console.log('🚀 -----------------------------------------------------------------------🚀')
    console.log('🚀 ~ file: useCreatePoolHelper.ts:128 ~ useCreatePoolHelper ~ res:', res)
    console.log('🚀 -----------------------------------------------------------------------🚀')

    return {
      ...res,
      currentSqrtPrice,
      fixAmountA: isTokenA,
      lowerTick,
      upperTick,
      tickSpacing,
      coinTypeA: realTokenA.coin_type,
      coinTypeB: realTokenB.coin_type
    }
  }

  /**
   * 获取创建CLMM池子tx
   * @param params
   * @returns
   */
  const getCreatePoolTxPayload = async (params: preCreateRes) => {
    console.log('🚀 ~ file: useCreatePoolHelper.ts:140 ~ getCreatePoolTxPayload ~ params:', params)
    const { tickSpacing, currentSqrtPrice, fixAmountA, coinAmountAOrigin, coinAmountBOrigin, lowerTick, upperTick, coinTypeA, coinTypeB } = params

    const metaDataA: any = await clmmSdk!.FullClient.fetchCoinMetadataId(coinTypeA)
    const metaDataB: any = await clmmSdk!.FullClient.fetchCoinMetadataId(coinTypeB)

    const parameter = {
      tick_spacing: tickSpacing,
      initialize_sqrt_price: currentSqrtPrice,
      uri: '',
      fix_amount_a: fixAmountA,
      amount_a: coinAmountAOrigin,
      amount_b: coinAmountBOrigin,
      tick_lower: lowerTick,
      tick_upper: upperTick,
      coin_type_a: coinTypeA,
      coin_type_b: coinTypeB
      // metadata_a: metaDataA,
      // metadata_b: metaDataB
    }

    const tx = await clmmSdk!.Pool.createPoolPayload(parameter)

    return {
      tx,
      msafeParams: {
        action: MsafeTransactionSubType.CreatePool,
        txbParams: parameter
      }
    }
  }

  /**
   * 获取创建DLMM池子tx
   * @param params
   * @returns
   */
  const getCreateDLMMPoolTxPayload = async (params: PreCreateDLMMRes) => {
    console.log('🚀 ~ file: useCreatePoolHelper.ts:140 ~ getCreatePoolTxPayload ~ params:', params)
    const { active_id, lower_bin_id, upper_bin_id, bin_step, bin_infos, tokenA, tokenB, base_factor } = params
    const tx = new Transaction()
    const pool_id = await dlmmSdk?.Pool.createPoolPayload(
      {
        active_id,
        bin_step,
        coin_type_a: tokenA?.coin_type,
        coin_type_b: tokenB?.coin_type,
        base_factor
      },
      tx
    )

    return { pool_id, tx }
  }

  /**
   * 获取dlmm base fee and bin step
   */
  const getBinStepConfigs = async (baseFee: Pick<BinStepType, 'fee' | 'feeDisplay'>, baseCoinType: string, quoteCoinType: string) => {
    if (baseFee !== undefined) {
      console.log(binStepConfig, baseFee, 'getBinStepConfigs')
      const defaultOptions = binStepConfig?.find(item => item?.fee === baseFee.fee)?.binStepList
      try {
        if (baseCoinType && quoteCoinType) {
          const res = await getDlmmPoolList({
            coin_type: `${baseCoinType},${quoteCoinType}`,
            is_vaults: false,
            display_all_pools: true,
            has_mining: true,
            has_farming: true,
            no_incentives: true,
            order_by: '-vol',
            offset: 0
          })
          if (res && res.list && res.list.length > 0) {
            const pools = res?.list?.[0]?.pools?.map(item => wrapDLmmPoolData(item))
            const feeList = getBaseFeeList(pools)
            return defaultOptions?.map(item => {
              const existPool = feeList?.find(l => l.fee + '' === baseFee.fee && l?.binStep === item?.binStep)
              return {
                ...item,
                title: existPool?.title || item.title,
                poolAddress: existPool?.poolAddress || undefined
              }
            })
          } else {
            return defaultOptions
          }
        }
      } catch (error) {
        return defaultOptions
      }
      return defaultOptions
    }
    return
  }

  return {
    preAddPool,
    fetchFeeTierList,
    getCreatePoolTxPayload,
    getBinStepConfigs,
    getCreateDLMMPoolTxPayload
  }
}

export function useShowPriceWarn(isFull: boolean, currTick?: number, minTick?: number, maxTick?: number) {
  const showInputPriceWarn = useMemo(() => {
    if (isFull) {
      return false
    }
    try {
      if (currTick !== undefined && minTick !== undefined && maxTick !== undefined) {
        return d(currTick).lt(minTick) || d(currTick).gt(maxTick)
      }
    } catch (error) {
      //
    }

    return false
  }, [maxTick, currTick, minTick, isFull])

  const showPriceRangeWarn = useMemo(() => {
    if (isFull) {
      return false
    }
    try {
      if (minTick !== undefined && maxTick !== undefined) {
        return d(minTick).gt(maxTick)
      }
    } catch (error) {
      //
    }

    return false
  }, [maxTick, minTick, isFull])

  return {
    showInputPriceWarn,
    showPriceRangeWarn
  }
}

export function useShowDlmmPriceWarn(currBinId?: number, minBinId?: number, maxBinId?: number) {
  const showInputPriceWarn = useMemo(() => {
    try {
      if (
        currBinId !== undefined &&
        minBinId !== undefined &&
        maxBinId !== undefined &&
        Number.isFinite(minBinId) &&
        Number.isFinite(maxBinId) &&
        Number.isFinite(currBinId)
      ) {
        return d(currBinId).lt(minBinId) || d(currBinId).gt(maxBinId)
      }
    } catch (error) {
      //
    }

    return false
  }, [currBinId, minBinId, maxBinId])

  const showPriceRangeWarn = useMemo(() => {
    try {
      if (minBinId !== undefined && maxBinId !== undefined && Number.isFinite(minBinId) && Number.isFinite(maxBinId)) {
        return d(minBinId).gt(maxBinId)
      }
    } catch (error) {
      //
    }

    return false
  }, [minBinId, maxBinId])

  return {
    showInputPriceWarn,
    showPriceRangeWarn
  }
}
