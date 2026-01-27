import useGlobalStore from '@/store/common/global'
import { MsafeTransactionSubType } from '@/types'
import { formatDescription } from '@/utils'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { BalanceChanges, CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types'
import { d } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { useState } from 'react'
import useTransaction from '../common/useTransaction'
import useCurrentVaultDetail from '../vault-v2/useCurrentVaultDetail'
import useGetVaultFarmingStaked from './useGetVaultFarmingStaked'

export function useVaultFarmingPage(vaultsId: string, currentVaultsFarming: any, vaultsFarmingStaked: any) {
  const [stakeAmount, setStakeAmount] = useState<string>('')
  const { haedalFarmSdk } = usePeripherySDKStore()
  const { signAndExecuteTransaction, transactionRejected } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { updateCurrentVaultById } = useCurrentVaultDetail()
  const { getVaultsFarmingStaked } = useGetVaultFarmingStaked()

  const handleChangeStakeValue = (value: string) => {
    setStakeAmount(value)
  }

  const farmStakeAction = async () => {
    setIsLoading(true)
    // 构建 交易提示
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = 'Stake ' + formatDescription(stakeAmount, currentVaultsFarming?.coinDetail?.symbol)
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }
        return info
      }
    }

    const stakeParams = {
      poolId: currentVaultsFarming.poolId,
      stakeCoinType: currentVaultsFarming.stakeCoinType,
      amount: Number(stakeAmount),
      decimals: Number(currentVaultsFarming.coinDetail.decimals),
      stakeObjectId: vaultsFarmingStaked.stakeObjectId
    }
    console.log('🚀🚀🚀 ~ useVaultFarmingPage.ts:42 ~ farmStakeAction ~ stakeParams.currentVaultsFarming:', currentVaultsFarming)

    console.log('🚀🚀🚀 ~ useVaultFarmStake.ts:31 ~ farmStakeAction ~ stakeParams:', JSON.stringify(stakeParams))

    try {
      const txb = async () => {
        const tx = new Transaction()
        tx.setSender(haedalFarmSdk.senderAddress)
        await haedalFarmSdk.Farms.buildStakePayload(stakeParams, tx)
        console.log('🚀🚀🚀 ~ useVaultFarmStake.ts:50 ~ txb ~ tx:', tx)
        return tx
      }

      const res = await signAndExecuteTransaction(txb, toastInfo, {
        useMev: mevProtect,
        txAction: 'signTransactionBlock',
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {
          action: MsafeTransactionSubType.VaultsFarmingStake,
          txbParams: stakeParams
        }
      })
      if (res) {
        setIsLoading(false)
        setStakeAmount('')
        updateCurrentVaultById(vaultsId)
        getVaultsFarmingStaked({ stakeCoinType: currentVaultsFarming.stakeCoinType, poolId: currentVaultsFarming.poolId }, vaultsId)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.log('🚀 ~ doAddAction ~ error:', error)
      transactionRejected(toastInfo)
      setIsLoading(false)
    }
  }

  const farmUnStakeAction = async () => {
    setIsLoading(true)
    // 构建 交易提示
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = 'Unstake ' + formatDescription(stakeAmount, currentVaultsFarming?.coinDetail?.symbol)
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }
        return info
      }
    }

    const unStakeParams = {
      poolId: currentVaultsFarming.poolId,
      stakeCoinType: currentVaultsFarming.stakeCoinType,
      stakeObjectId: vaultsFarmingStaked.stakeObjectId,
      amount: d(stakeAmount)
        .mul(10 ** currentVaultsFarming.coinDetail.decimals)
        .toString(),
      claimReward: true,
      rewardConfigs: vaultsFarmingStaked.rewardConfigs
    }
    console.log('🚀🚀🚀 ~ useVaultFarmingPage.ts:42 ~ farmStakeAction ~ stakeParams.currentVaultsFarming:', currentVaultsFarming)

    console.log('🚀🚀🚀 ~ useVaultFarmStake.ts:31 ~ farmStakeAction ~ stakeParams:', unStakeParams)

    try {
      const txb = async () => {
        const tx = new Transaction()
        tx.setSender(haedalFarmSdk.senderAddress)
        await haedalFarmSdk.Farms.buildUnstakePayload(unStakeParams, tx)
        console.log('🚀🚀🚀 ~ useVaultFarmStake.ts:50 ~ txb ~ tx:', tx)
        return tx
      }

      const res = await signAndExecuteTransaction(txb, toastInfo, {
        useMev: mevProtect,
        txAction: 'signTransactionBlock',
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {
          action: MsafeTransactionSubType.VaultsFarmingUnStake,
          txbParams: unStakeParams
        }
      })
      if (res) {
        setIsLoading(false)
        setStakeAmount('')
        updateCurrentVaultById(vaultsId)
        getVaultsFarmingStaked({ stakeCoinType: currentVaultsFarming.stakeCoinType, poolId: currentVaultsFarming.poolId }, vaultsId)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.log('🚀 ~ doAddAction ~ error:', error)
      transactionRejected(toastInfo)
      setIsLoading(false)
    }
  }

  const farmClaimAction = async () => {
    setIsLoading(true)
    // 构建 交易提示
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = 'Claim ' + 'Farming Rewards'
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }
        return info
      }
    }

    console.log('🚀🚀🚀 ~ useVaultFarmingPage.ts:42 ~ farmStakeAction ~ stakeParams.currentVaultsFarming:', currentVaultsFarming)

    let claimParams
    try {
      const txb = async () => {
        const tx = new Transaction()
        tx.setSender(haedalFarmSdk.senderAddress)

        for (let i = 0; i < vaultsFarmingStaked.rewardConfigs?.length; i++) {
          claimParams = {
            poolId: currentVaultsFarming.poolId,
            stakeCoinType: currentVaultsFarming.stakeCoinType,
            stakeObjectId: vaultsFarmingStaked.stakeObjectId,
            rewardCoinType: vaultsFarmingStaked.rewardConfigs[i]?.rewardCoinType,
            rewardBank: vaultsFarmingStaked.rewardConfigs[i]?.bank
          }
          console.log('🚀🚀🚀 ~ useVaultFarmStake.ts:31 ~ farmStakeAction ~ stakeParams:', claimParams)
          await haedalFarmSdk.Farms.buildHarvestPayload(claimParams, tx)
        }
        console.log('🚀🚀🚀 ~ useVaultFarmStake.ts:50 ~ txb ~ tx:', tx)
        return tx
      }

      const res = await signAndExecuteTransaction(txb, toastInfo, {
        useMev: mevProtect,
        txAction: 'signTransactionBlock',
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {
          action: MsafeTransactionSubType.VaultsFarmingClaim,
          txbParams: claimParams
        }
      })
      if (res) {
        setIsLoading(false)
        setStakeAmount('')
        getVaultsFarmingStaked({ stakeCoinType: currentVaultsFarming.stakeCoinType, poolId: currentVaultsFarming.poolId }, vaultsId)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.log('🚀 ~ doAddAction ~ error:', error)
      transactionRejected(toastInfo)
      setIsLoading(false)
    }
  }

  return { farmStakeAction, isLoading, handleChangeStakeValue, stakeAmount, farmUnStakeAction, farmClaimAction }
}
