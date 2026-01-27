import usePositionStore from '@/store/position'
import { PosBaseInfo, PosReward } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { TransactionStatusType } from '@cetus/types'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useState } from 'react'
import useTransaction from '../common/useTransaction'
import useGetFarmsPosRewards from './useGetFarmsPosRewards'
import useGetPosPools from './useGetPosPools'
import useGetPosRewards from './useGetPosRewards'
import useGetPosfees from './useGetPosfees'
import usePosClaimFeeAndReward from './usePosClaimFeeAndReward'

export default function useClaimPosition() {
  const { fetchAccountBalance } = useAccountBalance()
  const { posRewardsData, farmsPosRewardsData } = usePositionStore()
  const { getPosFeeData } = useGetPosfees()
  const { getPosRewardsData } = useGetPosRewards()
  const { getFarmsRewardsData } = useGetFarmsPosRewards()
  const { signAndExecuteTransaction } = useTransaction()
  const { getPosClaimFeeAndRewardAndFarmsTxPayload } = usePosClaimFeeAndReward()
  const { currentAccount } = useAccountStore()
  const [isClaimLoading, setIsClaimLoading] = useState(false)
  const { getPosPoolsOriginalObj } = useGetPosPools()

  // isClaimFarms是否收割farms奖励
  const toClaimPosition = async (positionInfo: any, curPosContractPoolInfo?: any, isClaimFarms?: boolean) => {
    setIsClaimLoading(true)

    try {
      const posId = positionInfo?.posId
      const id = positionInfo?.id

      const farmsRewards = farmsPosRewardsData[id] || []
      const miningRewards = posRewardsData[posId] || []

      // 收割farm奖励不用传coinType 所以不用区分  isClaimFarms ? [...rewarderFarmsCoinTypes,...rewarderMiningCoinTypes]
      const rewarderFarmsCoinTypes = farmsRewards.map((r: PosReward) => fixCoinType(r.token.coin_type))
      const rewarderMiningCoinTypes = miningRewards.map((r: PosReward) => fixCoinType(r.token.coin_type))

      const dlmmRewardsCoinTypes =
        positionInfo?.posType === 'dlmm'
          ? curPosContractPoolInfo?.reward_manager?.rewards
              ?.filter((item: any) => Number(item?.emissions_per_day) > 0)
              .map((item: any) => item?.reward_coin)
          : []

      const combinedCoinTypes = rewarderMiningCoinTypes

      const rewarderCoinTypes: string[] = positionInfo?.posType === 'dlmm' ? dlmmRewardsCoinTypes : Array.from(new Set(combinedCoinTypes))

      const params: any = {
        posType: positionInfo?.posType,
        id,
        clmmPool: positionInfo?.clmmPool,
        coinTypeA: positionInfo?.coinTypeA,
        coinTypeB: positionInfo?.coinTypeB,
        rewarderCoinTypes,
        account: currentAccount?.address,
        dlmmPool: positionInfo?.dlmmPool
      }
      console.log('🚀 ~ toClaimPosition ~ params:', params)

      if (isClaimFarms) {
        params['farmsPool'] = positionInfo?.farmsPool
      }
      console.log('🚀 ~ toClaim ~ params:', rewarderCoinTypes, params)

      const { tx, msafeParams } = await getPosClaimFeeAndRewardAndFarmsTxPayload(params)

      const trackData = {
        posType: positionInfo?.posType,
        posId: positionInfo?.posType == 'farms' ? positionInfo?.id : positionInfo?.posId,
        poolAddress: positionInfo?.clmmPool,
        coinTypeA: positionInfo?.coinTypeA,
        coinTypeB: positionInfo?.coinTypeB,
        rewarderCoinType1: rewarderCoinTypes?.[0],
        rewarderCoinType2: rewarderCoinTypes?.[1],
        rewarderCoinType3: rewarderCoinTypes?.[2],
        txAction: 'claimFeeAndReward'
      }

      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: (status: TransactionStatusType) => ({
            modalDescriptionText: '',
            toastTitleText: status === 'success' ? 'Claim Successful' : ''
          })
        },
        { msafeParams, trackData }
      )

      if (res) {
        const poolInfo = curPosContractPoolInfo || (await getPosPoolsOriginalObj([positionInfo as PosBaseInfo]))

        console.log('🚀 ~ toClaim ~ poolInfo:', poolInfo)

        // 延迟刷新数据
        setTimeout(() => {
          fetchAccountBalance()
          if (isClaimFarms) getFarmsRewardsData([positionInfo as PosBaseInfo])
          getPosFeeData([positionInfo as PosBaseInfo])
          getPosRewardsData([positionInfo as PosBaseInfo], {
            [poolInfo.poolAddress]: poolInfo
          })
          // getCurrentPosHistory(id, posId) // 如需历史记录
        }, 2000)
      }
    } catch (error) {
      console.error('🚀 ~ toClaim ~ error:', error)
    } finally {
      setIsClaimLoading(false)
    }
  }

  return {
    toClaimPosition,
    isClaimLoading
  }
}
