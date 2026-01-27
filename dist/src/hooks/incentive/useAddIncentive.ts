import { useSdk } from '@cetus/sdk-factory'
import { AddRewardOption, InitRewardOption } from '@cetusprotocol/dlmm-sdk'
import { Transaction } from '@mysten/sui/transactions'

function useAddIncentive() {
  const dlmmSdk = useSdk('dlmm')

  // 新增dlmm奖励
  const getAddIncentivePayload = (option: AddRewardOption, tx?: Transaction) => {
    console.log('🚀 ~ getAddIncentivePayload ~ option:', option)
    const txf = dlmmSdk?.Reward.addRewardPayload(option, tx)
    console.log('🚀 ~ getAddIncentivePayload ~ txf:', txf)
    return txf
  }

  // 初始化dlmm奖励
  const getInitIncentivePayload = (option: InitRewardOption, tx?: Transaction) => {
    console.log('🚀 ~ getInitIncentivePayload ~ option:', option)
    const txf = dlmmSdk?.Reward.initRewardPayload(option, tx)
    console.log('🚀 ~ getInitIncentivePayload ~ txf:', txf)
    return txf
  }

  const getRewardPeriodEmission = async (id: string, curr_emission_per_second: string, last_updated_time: number) => {
    try {
      const res = await dlmmSdk!.Reward.getRewardPeriodEmission(id, curr_emission_per_second, last_updated_time)
      return res
    } catch (error) {
      console.error('getDlmmContractPoolInfo error:', error)
    } finally {
    }
  }

  return { getAddIncentivePayload, getInitIncentivePayload, getRewardPeriodEmission }
}
export default useAddIncentive
