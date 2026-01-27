import useDlmmPositionStore from '@/store/dlmm-position'
import { DlmmPoolData, DlmmPosBaseInfo, DlmmPosLiquidity } from '@/types/dlmm'
import { calcCoinProportion } from '@/utils/pool'
import { useGetTokens } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { bnToAmount } from '@cetus/utils'
import { parseLiquidityShares } from '@cetusprotocol/dlmm-sdk'
import { uniqBy } from 'lodash-es'

export default function useGetDlmmPosLiquiditys() {
  const { setPosLiquidityDataLoading, setDlmmPosLiquidityData } = useDlmmPositionStore()
  const dlmmSdk = useSdk('dlmm')
  const { getToken } = useGetTokens()

  const getDlmmPosLiquidityData = async (positionBaseList: DlmmPosBaseInfo[], posPoolsOriginalData: Record<string, DlmmPoolData>) => {
    setPosLiquidityDataLoading(true)
    const posLiquidityData: Record<string, DlmmPosLiquidity> = {}
    console.log(posLiquidityData, posPoolsOriginalData, positionBaseList, 'test posLiquidityData')
    try {
      const binInfoList = await dlmmSdk?.Pool?.getBinInfoList(
        uniqBy(positionBaseList, 'dlmmPool')?.map(item => {
          const poolInfo = posPoolsOriginalData?.[item.dlmmPool]
          return {
            bin_manager_handle: poolInfo.bin_manager.bin_manager_handle,
            bin_id: poolInfo.active_id,
            bin_step: poolInfo.bin_step
          }
        })
      )
      console.log(binInfoList, 'binInfoList')
      for (let i = 0; i < positionBaseList.length; i++) {
        const position = positionBaseList[i]
        const poolInfo = posPoolsOriginalData?.[position.dlmmPool]
        console.log('🚀🚀🚀 ~ useGetDlmmPosLiquiditys.ts:22 ~ getDlmmPosLiquidityData ~ poolInfo:', binInfoList, poolInfo)

        const active_bin = binInfoList?.find(
          item => item?.bin_id === poolInfo?.active_id && item?.bin_manager_handle === poolInfo?.bin_manager?.bin_manager_handle
        )
        console.log('🚀🚀🚀 ~ useGetDlmmPosLiquiditys.ts:24 ~ getDlmmPosLiquidityData ~ active_bin:', active_bin)
        const amountInfo = parseLiquidityShares(position.liquidityShares, poolInfo.bin_step, position.lowerBinId, active_bin)
        console.log('🚀🚀🚀 ~ useGetDlmmPosLiquiditys.ts:26 ~ getDlmmPosLiquidityData ~ amountInfo:', amountInfo)
        let decimalsA = position.tokenA.decimals
        let decimalsB = position.tokenB.decimals
        if (decimalsA == undefined) {
          decimalsA = (await getToken(position.tokenA.coin_type))?.decimals
        }
        if (decimalsB == undefined) {
          decimalsB = (await getToken(position.tokenB.coin_type))?.decimals
        }
        const coinAmountA = amountInfo.amount_a.toString()
        const coinAmountB = amountInfo.amount_b.toString()
        const amountA = bnToAmount(coinAmountA, decimalsA || 0)
        const amountB = bnToAmount(coinAmountB, decimalsB || 0)
        const currentPrice = poolInfo.currentPrice
        const { percentA, percentB } = calcCoinProportion(amountA, amountB, currentPrice, false)

        posLiquidityData[position.id] = {
          coinAmountA,
          coinAmountB,
          displayCoinAmountA: !position.isReverse ? amountA : amountB,
          displayCoinAmountB: !position.isReverse ? amountB : amountA,
          displayPercentA: !position.isReverse ? percentA : percentB,
          displayPercentB: !position.isReverse ? percentB : percentA,
          binInfos: amountInfo
        }
      }
      console.log(posLiquidityData, 'test posLiquidityData')

      setDlmmPosLiquidityData(posLiquidityData)
      setPosLiquidityDataLoading(false)
    } catch (error) {
      console.log(error, 'test posLiquidityData')
      setPosLiquidityDataLoading(false)
    }
  }
  return { getDlmmPosLiquidityData }
}
