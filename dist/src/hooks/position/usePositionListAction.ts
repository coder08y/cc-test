import usePosHelper from '@/hooks/position/usePosHelper'
import useGlobalStore from '@/store/common/global'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import { PosBaseInfo, PosReward } from '@/types'
import { DlmmPosBaseInfo, DlmmPosClosePositionParams } from '@/types/dlmm'
import { useAccountBalance } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { TransactionStatusType } from '@cetus/types'
import { Decimal, d, formatNumberWithDown, removeComma } from '@cetus/utils'
import { Transaction } from '@mysten/sui/transactions'
import { useCallback, useState } from 'react'
import useTransaction from '../common/useTransaction'
import useDlmmPosRemove from '../dlmm-position/useDlmmPosRemove'
import useGetDlmmPositionList from '../dlmm-position/useGetDlmmPositionList'
import usePosRemove from './usePosRemove'
import usePositionApr from './usePositionApr'
import usePositionList from './usePositionList'

export default function usePositionListAction() {
  const [isRemoveLoading, setIsRemoveLoading] = useState(false)

  const { getPositionApr } = usePositionApr()
  const { getTokenAmountValue } = useTokenPrice()
  const { getPosIsActive } = usePosHelper()

  const {
    posPoolsRelatedData,
    posLiquidityData,
    posFeeData,
    farmsPosRewardsData,
    posRewardsData,
    posApiPoolData,
    poolRangeObj,
    setPosBaseList,
    posAprMap,
    posClmmDailyEarningsData,
    posPoolsOriginalData
  } = usePositionStore()
  const {
    dlmmPosRewardsData,
    setDlmmPosBaseList,
    dlmmPosFeeData,
    dlmmPosLiquidityData,
    dlmmAprMap,
    posDlmmDailyEarningsData,
    dlmmPosPoolsRelatedData
  } = useDlmmPositionStore()
  const { mevProtect, transactionMode, maxCapForGas, customGasPrice } = useGlobalStore()
  const { getCloseTsPayloadAll } = usePosRemove()
  const { signAndExecuteTransaction, transactionConfirmation } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const { getPositionBaseList, getPosRelatedData } = usePositionList()
  const { currentAccount } = useAccountStore()
  const { getDlmmPosClosePositionPayload } = useDlmmPosRemove()
  const { getDlmmPositionBaseList } = useGetDlmmPositionList()
  const handleGetPositionList = async () => {
    await getPositionBaseList(currentAccount?.address)
  }

  const toCloseAllAction = async (closeAllPositionList: (PosBaseInfo | DlmmPosBaseInfo)[]) => {
    console.log('🚀 ~ toCloseAllAction ~ closeAllPositionList:', closeAllPositionList)
    setIsRemoveLoading(true)

    const clmmPosIdList = closeAllPositionList.filter(item => item.posType == 'clmm').map((item: any) => item) as PosBaseInfo[]
    const dlmmPosIdList = closeAllPositionList.filter(item => item.posType == 'dlmm').map((item: any) => item) as DlmmPosBaseInfo[]

    try {
      // dlmm close all
      const dlmmParamsList = dlmmPosIdList.map((posInfo: DlmmPosBaseInfo) => {
        const currentPosRewardsData = dlmmPosRewardsData[posInfo.id]
        const options: DlmmPosClosePositionParams = {
          dlmmPool: posInfo.dlmmPool,
          positionId: posInfo.id,
          rewardCoins: currentPosRewardsData?.map((item: PosReward) => item.coin_address) || [],
          coinTypeA: posInfo.coinTypeA,
          coinTypeB: posInfo.coinTypeB
        }
        return options
      })

      // clmm close all
      const clmmParamsList = clmmPosIdList.map((posInfo: PosBaseInfo) => {
        const isVestingPos = !!posInfo?.vestData
        const currentPosLiquidityData = posLiquidityData[posInfo?.posId]
        const currentPosRewardsData = posRewardsData[posInfo?.posId]
        const currentPosPoolInfo = posApiPoolData[posInfo.clmmPool]

        const rewarderCoinTypes =
          !currentPosRewardsData || currentPosRewardsData?.length == 0
            ? (currentPosPoolInfo?.miningRewardList || [])?.reduce((arr: string[], item: any) => {
                arr.push(item.coinType)
                return arr
              }, [])
            : (currentPosRewardsData || []).map((item: PosReward) => item.coin_address)
        console.log('🚀 ~ paramsList ~ rewarderCoinTypes:', posInfo, posApiPoolData, currentPosPoolInfo, currentPosRewardsData, rewarderCoinTypes)

        const tokenABalance = formatNumberWithDown(currentPosLiquidityData?.displayCoinAmountA, undefined, true)
        const tokenBBalance = formatNumberWithDown(currentPosLiquidityData?.displayCoinAmountB, undefined, true)

        const isReverse = posInfo.isReverse
        const [amountA, amountB] = isReverse
          ? [
              d(tokenBBalance).mul(Decimal.pow(10, posInfo.displayTokenB?.decimals)).toString(),
              d(tokenABalance).mul(Decimal.pow(10, posInfo.displayTokenA?.decimals)).toString()
            ]
          : [
              d(tokenABalance).mul(Decimal.pow(10, posInfo.displayTokenA?.decimals)).toString(),
              d(tokenBBalance).mul(Decimal.pow(10, posInfo.displayTokenB?.decimals)).toString()
            ]

        const baseParams: any = {
          posId: posInfo.posType === 'farms' ? posInfo.id : posInfo.posId,
          poolAddress: posInfo.clmmPool,
          coinTypeA: posInfo.coinTypeA,
          coinTypeB: posInfo.coinTypeB,
          amountA,
          amountB,
          liquidity: posInfo.liquidity,
          lowerTick: posInfo.lowerTick,
          upperTick: posInfo.upperTick,
          posType: posInfo.posType,
          rewarderCoinTypes,
          isVestingPos
        }

        if (posInfo.posType === 'farms') {
          baseParams.farmsPoolId = posInfo.farmsPool
          baseParams.farmsPosId = posInfo.id
        }

        return baseParams
      })

      console.log('🚀 ~ toRemove ~ paramsList:', clmmParamsList)

      const toastInfo = {
        getShowInfo: (status: TransactionStatusType) => {
          const isSuccess = status === 'success'
          return {
            modalDescriptionText: isSuccess ? '' : 'Close all positions',
            toastTitleText: isSuccess ? 'Close all positions successful' : 'Close all positions',
            toastDescriptionContent: isSuccess ? '' : undefined
          }
        }
      }

      transactionConfirmation(toastInfo)
      let txb = new Transaction()

      dlmmParamsList.forEach(params => {
        txb = getDlmmPosClosePositionPayload(params, txb)
      })

      const clmmRes = await getCloseTsPayloadAll(clmmParamsList, txb)
      console.log('🚀 ~ toCloseAllAction ~ txb:', {
        clmmRes,
        txb
      })
      const res = await signAndExecuteTransaction(txb, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: clmmRes?.msafeParams
      })
      console.log('🚀 ~ toClaim ~ res:', res)
      if (res) {
        fetchAccountBalance()
        setPosBaseList([])
        setDlmmPosBaseList([])
        handleGetPositionList()
        getDlmmPositionBaseList(currentAccount?.address)
      }
    } catch (error) {
      console.error('🚀 ~ toClaim ~ error:', error)
    } finally {
      setIsRemoveLoading(false)
    }
  }

  const getPositionSortList = useCallback(
    async (sortByValue: string, sortRule: string, list: (PosBaseInfo | DlmmPosBaseInfo)[]): Promise<(PosBaseInfo | DlmmPosBaseInfo)[]> => {
      if (!list?.length) return []

      const getUSDRewards = (rewards: any[] = []) => {
        return rewards
          .map(reward => ({
            ...reward,
            amountUSD: getTokenAmountValue(reward?.token?.coin_type, reward?.display_amount_owed)
          }))
          .filter(r => d(r.display_amount_owed).gt(0))
      }

      const newList = []
      for (let i = 0; i < list.length; i++) {
        const positionInfo = list[i]
        const isDlmm = positionInfo.posType === 'dlmm'
        const posId = isDlmm ? positionInfo.id : positionInfo.posId
        // const poolId = isDlmm ? positionInfo.dlmmPool : positionInfo.clmmPool

        const currentPosData = isDlmm ? dlmmPosLiquidityData[posId] : posLiquidityData[posId]

        const amountValueA = getTokenAmountValue(positionInfo.displayTokenA?.coin_type, currentPosData?.displayCoinAmountA)
        const amountValueB = getTokenAmountValue(positionInfo.displayTokenB?.coin_type, currentPosData?.displayCoinAmountB)
        const totalLiquidity = d(amountValueA).plus(amountValueB).toString()

        const currentPosFeeData = isDlmm ? dlmmPosFeeData[posId] : posFeeData[posId]
        const feeA = getTokenAmountValue(positionInfo.displayTokenA?.coin_type, currentPosFeeData?.displayFeeOwedA)
        const feeB = getTokenAmountValue(positionInfo.displayTokenB?.coin_type, currentPosFeeData?.displayFeeOwedB)
        const totalFee = d(feeA).plus(feeB).toString()

        const miningRewards = isDlmm ? getUSDRewards(dlmmPosRewardsData[posId]) : getUSDRewards(posRewardsData[posId])
        const farmRewards = isDlmm ? [] : getUSDRewards(farmsPosRewardsData[positionInfo.id])
        const totalRewards = [...miningRewards, ...farmRewards].reduce((acc, cur) => acc.plus(cur.amountUSD), d(0)).toString()
        const totalMiningAmount = miningRewards.reduce((acc, cur) => acc.plus(cur.display_amount_owed), d(0)).toString()
        const totalFarmingAmount = farmRewards.reduce((acc, cur) => acc.plus(cur.display_amount_owed), d(0)).toString()
        const totalYield = d(totalFee).plus(totalRewards).toString()
        let apr = '--'
        let estDailyEarn = '--'
        let isActive = true
        if (posId) {
          isActive = isDlmm
            ? dlmmPosPoolsRelatedData?.[positionInfo?.id]?.currentStatus === 'Active'
            : getPosIsActive(positionInfo as PosBaseInfo, posPoolsOriginalData?.[positionInfo?.clmmPool || '']?.current_sqrt_price)
          apr = isActive ? (isDlmm ? posDlmmDailyEarningsData?.[posId]?.apr : posClmmDailyEarningsData?.[posId]?.apr) : '0'
          estDailyEarn = isDlmm
            ? isActive
              ? posDlmmDailyEarningsData?.[posId]?.totalDailyExpansionFactorUSD
              : '0'
            : isActive
              ? posClmmDailyEarningsData?.[posId]?.totalDailyExpansionFactorUSD
              : '0'
        }

        newList.push({
          ...positionInfo,
          apr,
          totalLiquidity,
          totalYield,
          totalFee,
          totalRewards,
          totalMiningAmount,
          totalFarmingAmount,
          estDailyEarn
        })
      }

      const sortMap: Record<string, (a: any, b: any) => number> = {
        apr: (a, b) => {
          const aprA = d(removeComma(a.apr?.replace(/[%<]/g, '') ?? 0))
          const aprB = d(removeComma(b.apr?.replace(/[%<]/g, '') ?? 0))
          return sortRule === 'asc' ? aprA.minus(aprB).toNumber() : aprB.minus(aprA).toNumber()
        },
        liquidity: (a, b) => {
          const aVal = d(removeComma(a.totalLiquidity)),
            bVal = d(removeComma(b.totalLiquidity))
          return sortRule === 'asc' ? aVal.minus(bVal).toNumber() : bVal.minus(aVal).toNumber()
        },
        fees: (a, b) => {
          const aVal = d(removeComma(a.totalFee)),
            bVal = d(removeComma(b.totalFee))
          return sortRule === 'asc' ? aVal.minus(bVal).toNumber() : bVal.minus(aVal).toNumber()
        },
        rewards: (a, b) => {
          const aVal = d(removeComma(a.totalRewards)),
            bVal = d(removeComma(b.totalRewards))
          return sortRule === 'asc' ? aVal.minus(bVal).toNumber() : bVal.minus(aVal).toNumber()
        },
        yield: (a, b) => {
          const aVal = d(removeComma(a.totalYield)),
            bVal = d(removeComma(b.totalYield))
          return sortRule === 'asc' ? aVal.minus(bVal).toNumber() : bVal.minus(aVal).toNumber()
        },
        dailyEarn: (a, b) => {
          const aVal = d(a?.estDailyEarn === '--' ? 0 : a?.estDailyEarn),
            bVal = d(b?.estDailyEarn === '--' ? 0 : b?.estDailyEarn)
          return sortRule === 'asc' ? aVal.minus(bVal).toNumber() : bVal.minus(aVal).toNumber()
        }
      }

      if (sortMap[sortByValue]) {
        newList.sort(sortMap[sortByValue])
      }
      return newList
    },
    [
      posLiquidityData,
      posFeeData,
      posRewardsData,
      farmsPosRewardsData,
      posAprMap,
      dlmmAprMap,
      dlmmPosLiquidityData,
      dlmmPosFeeData,
      dlmmPosRewardsData,
      getTokenAmountValue
    ]
  )

  return {
    getPositionSortList,
    toCloseAllAction,
    isRemoveLoading
  }
}
