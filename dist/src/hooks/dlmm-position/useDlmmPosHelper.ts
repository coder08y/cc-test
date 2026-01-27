import { DlmmPoolData, DlmmPosBaseInfo } from '@/types/dlmm'
import { isAvailableObject } from '@cetus/utils'

export default function useDlmmPosHelper() {
  // dlmm 区间与clmm不同
  const getTokenALock = (currentPosBaseInfo: DlmmPosBaseInfo, curPosContractPoolInfo: DlmmPoolData) => {
    if (isAvailableObject(currentPosBaseInfo) && isAvailableObject(curPosContractPoolInfo)) {
      const { lowerBinId, upperBinId } = currentPosBaseInfo
      console.log('🚀🚀🚀 ~ useDlmmPosHelper.ts:8 ~ getTokenALock ~ lowerBinId:', lowerBinId)
      console.log('🚀🚀🚀 ~ useDlmmPosHelper.ts:9 ~ getTokenALock ~ upperBinId:', upperBinId)
      const currentTickIndex = curPosContractPoolInfo?.active_id
      console.log('🚀🚀🚀 ~ useDlmmPosHelper.ts:11 ~ getTokenALock ~ currentTickIndex:', lowerBinId, currentTickIndex, upperBinId)
      if (currentTickIndex !== undefined && lowerBinId !== undefined && upperBinId !== undefined) {
        if (currentTickIndex >= lowerBinId && currentTickIndex <= upperBinId) {
          return false
        } else if (currentTickIndex > upperBinId) {
          return true
        } else if (currentTickIndex < lowerBinId) {
          return false
        } else {
          return true
        }
      }
    }
    return false
  }

  const getTokenBLock = (currentPosBaseInfo: DlmmPosBaseInfo, curPosContractPoolInfo: DlmmPoolData) => {
    if (isAvailableObject(currentPosBaseInfo) && isAvailableObject(curPosContractPoolInfo)) {
      const { lowerBinId, upperBinId } = currentPosBaseInfo
      const currentTickIndex = curPosContractPoolInfo?.active_id
      if (currentTickIndex !== undefined && lowerBinId !== undefined && upperBinId !== undefined) {
        if (currentTickIndex >= lowerBinId && currentTickIndex <= upperBinId) {
          return false
        } else if (currentTickIndex > upperBinId) {
          return false
        } else if (currentTickIndex < lowerBinId) {
          return true
        } else {
          return true
        }
      }
    }
    return false
  }

  return { getTokenALock, getTokenBLock }
}
