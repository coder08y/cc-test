import { PosBaseInfo } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { getPoolDirection } from '@/utils/pool'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { BurnUtils } from '@cetusprotocol/burn-sdk'
import { d, extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { parseDlmmPosition } from '@cetusprotocol/dlmm-sdk'
import { FarmsUtils } from '@cetusprotocol/farms-sdk'
import { buildPosition } from '@cetusprotocol/sui-clmm-sdk'
import usePosHelper from './usePosHelper'

export default function useWrapPosData() {
  const { buildPositionType, buildFarmsPositionType, buildBurnPositionType, buildDlmmPositionType } = usePosHelper()
  const { getTokenListInfo } = useGetToken()

  const getPosTokenData = async (coinTypeA: string, coinTypeB: string): Promise<any> => {
    const isReverse = !getPoolDirection(coinTypeA, coinTypeB)
    const tokenMap = await getTokenListInfo([coinTypeA, coinTypeB])
    const tokenA = tokenMap?.get(coinTypeA)
    const tokenB = tokenMap?.get(coinTypeB)
    const displayTokenA = !isReverse ? tokenA : tokenB
    const displayTokenB = !isReverse ? tokenB : tokenA

    return {
      isReverse,
      tokenA,
      tokenB,
      displayTokenA,
      displayTokenB
    }
  }

  // Clmm仓位包装
  const wrapClmmPosBaseInfo = async (data: any): Promise<PosBaseInfo> => {
    const pos = buildPosition(data)
    const coinTypeA = extractStructTagFromType(pos.coin_type_a).full_address
    const coinTypeB = extractStructTagFromType(pos.coin_type_b).full_address
    const { isReverse, tokenA, tokenB, displayTokenA, displayTokenB } = await getPosTokenData(coinTypeA, coinTypeB)

    const version = data?.data?.version || '0'

    return {
      clmmPool: pos.pool,
      posId: pos.pos_object_id,
      id: pos.pos_object_id,
      liquidity: pos.liquidity,
      index: pos.index,
      lowerTick: pos.tick_lower_index,
      upperTick: pos.tick_upper_index,
      owner: pos.owner,
      coinTypeA,
      coinTypeB,
      posType: 'clmm',
      tokenName: '',
      tokenA,
      tokenB,
      displayTokenA,
      displayTokenB,
      isReverse,
      version
    }
  }

  const wrapDlmmPosBaseInfo = async (data: any): Promise<DlmmPosBaseInfo> => {
    console.log('🚀🚀🚀 ~ useWrapPosData.ts:66 ~ wrapDlmmPosBaseInfo ~ data:', data)
    const pos: any = parseDlmmPosition(data)
    const coinTypeA = extractStructTagFromType(pos.coin_type_a).full_address
    const coinTypeB = extractStructTagFromType(pos.coin_type_b).full_address
    const { isReverse, tokenA, tokenB, displayTokenA, displayTokenB } = await getPosTokenData(coinTypeA, coinTypeB)
    const version = data?.data?.version || '0'
    const info: DlmmPosBaseInfo = {
      dlmmPool: pos.pool_id,
      index: pos.index,
      lowerBinId: pos.lower_bin_id,
      upperBinId: pos.upper_bin_id,
      id: pos.id,
      coinTypeA,
      coinTypeB,
      posType: 'dlmm',
      tokenName: pos.name.split(' | ')[1],
      tokenA,
      tokenB,
      displayTokenA,
      displayTokenB,
      isReverse,
      liquidityShares: pos.liquidity_shares,
      totalShareLiquidity: pos.liquidity_shares.reduce((acc: string, curr: string) => d(acc).add(curr).toFixed(0), '0'),
      version
    }
    return info
  }

  // Farms仓位包装
  const wrapFarmsPosBaseInfo = async (data: any): Promise<PosBaseInfo> => {
    const pos: any = FarmsUtils.buildFarmsPositionNFT(data)

    const version = data?.data?.version || '0'
    const coinTypeA = extractStructTagFromType(pos.coin_type_a).full_address
    const coinTypeB = extractStructTagFromType(pos.coin_type_b).full_address

    const { isReverse, tokenA, tokenB, displayTokenA, displayTokenB } = await getPosTokenData(coinTypeA, coinTypeB)

    return {
      clmmPool: pos.clmm_pool_id,
      farmsPool: pos.pool_id,
      posId: pos.clmm_position_id,
      id: pos.id,
      liquidity: pos.liquidity,
      // index: pos.name.split('-')[1],
      lowerTick: pos.tick_lower_index,
      upperTick: pos.tick_upper_index,
      owner: '',
      coinTypeA,
      coinTypeB,
      posType: 'farms',
      tokenName: pos.name,
      isReverse,
      tokenA,
      tokenB,
      displayTokenA,
      displayTokenB,
      version,
      index: data?.data?.content?.fields?.clmm_postion?.fields?.index
    }
  }

  // Burn仓位包装
  const wrapBurnPosBaseInfo = async (data: any): Promise<PosBaseInfo> => {
    console.log('🚀🚀🚀 ~ useWrapPosData.ts:99 ~ wrapBurnPosBaseInfo ~ data?.data?.content?.fields:', data?.data?.content?.fields)
    const pos: any = BurnUtils.buildBurnPositionNFT(data?.data?.content?.fields)
    const version = data?.data?.version || '0'
    const coinTypeA = extractStructTagFromType(pos.coin_type_a).full_address
    const coinTypeB = extractStructTagFromType(pos.coin_type_b).full_address

    const { isReverse, tokenA, tokenB, displayTokenA, displayTokenB } = await getPosTokenData(coinTypeA, coinTypeB)

    return {
      clmmPool: pos.clmm_pool_id,
      posId: pos.clmm_position_id,
      liquidity: pos.liquidity,
      index: pos.index,
      id: pos.id,
      lowerTick: pos.tick_lower_index,
      upperTick: pos.tick_upper_index,
      owner: '',
      coinTypeA,
      coinTypeB,
      posType: 'burn',
      tokenName: pos.name,
      isReverse,
      tokenA,
      tokenB,
      displayTokenA,
      displayTokenB,
      version
    }
  }

  const buildPosBaseInfo = async (item: any): Promise<PosBaseInfo | DlmmPosBaseInfo | null> => {
    const type = extractStructTagFromType(item.data.type)

    if (type.full_address === buildPositionType) {
      return await wrapClmmPosBaseInfo(item)
    }

    if (type.full_address === buildFarmsPositionType) {
      return await wrapFarmsPosBaseInfo(item)
    }

    if (type.full_address === buildBurnPositionType) {
      return await wrapBurnPosBaseInfo(item)
    }

    if (type.full_address === buildDlmmPositionType) {
      return await wrapDlmmPosBaseInfo(item)
    }

    return null
  }

  return {
    wrapClmmPosBaseInfo,
    wrapBurnPosBaseInfo,
    wrapFarmsPosBaseInfo,
    buildPosBaseInfo,
    getPosTokenData,
    wrapDlmmPosBaseInfo
  }
}
