import usePositionStore from '@/store/position'
import useProfileStore from '@/store/profile'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { PosBaseInfo } from '@/types/position'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { clmmConfig } from '@cetus/types/src/config/envConfigs'
import { XCetusUtil } from '@cetusprotocol/xcetus-sdk'
import { useEffect, useRef } from 'react'
import usePosHelper from '../position/usePosHelper'
import usePositionList from '../position/usePositionList'
import { XCetusLockCetusType, XCetusVeNFTType, buildLockCetus, buildVeNFT } from '../xcetus/useXCetusHelper'

export function useOwnerNFT() {
  const { currentAccount } = useAccountStore()
  const clmmSdk = useSdk('clmm')
  const xCetusSdk = useSdk('xcetus')
  const { buildFarmsPositionType, buildBurnPositionType } = usePosHelper()
  const { setPosBaseList, setFullRangePosBaseList, setPosBaseListLoading } = usePositionStore()
  const { setVeNFT, setVeNFTLoading, setLockCetusList, clearData, setLockCetusListLoading, setAvailableXCetusAmount } = useXCetusStore()
  const { formatPosBaseList } = usePositionList()
  const { isAutoRefresh } = useProfileStore()

  const addressRef = useRef(currentAccount?.address)

  useEffect(() => {
    addressRef.current = currentAccount?.address
  }, [currentAccount?.address])

  /**
   *  1: 获取仓位列表
   *  2: 获取xcetus  veNFT
   *  3: 获取xCetus 锁仓信息
   */
  const fetchOwnerNFT = async () => {
    try {
      const ownerAddress = addressRef.current
      if (ownerAddress) {
        // if (!isAutoRefresh) {
        //   setPosBaseListLoading(true)
        // }
        setVeNFTLoading(true)
        const ownerRes = await clmmSdk!.FullClient.getOwnedObjectsByPage(ownerAddress, {
          options: { showType: true, showContent: true, showOwner: true },
          filter: {
            MatchAny: [
              {
                Package: clmmConfig.clmm_pool.package_id
              },
              {
                StructType: buildFarmsPositionType
              },
              {
                StructType: buildBurnPositionType
              },
              {
                StructType: XCetusVeNFTType
              },
              {
                StructType: XCetusLockCetusType
              }
            ]
          }
        })

        // 仓位列表
        let result: PosBaseInfo[] = await formatPosBaseList(ownerRes)
        setPosBaseList(result)
        setPosBaseListLoading(false)
        if (result?.length == 0) {
          setFullRangePosBaseList([])
        }

        // 获取xCetus  veNFT
        const veNFT = buildVeNFT(ownerRes.data)
        if (veNFT && ownerAddress === addressRef.current) {
          setVeNFT(veNFT, ownerAddress)

          // 获取xCetus 锁仓信息
          const lockList = await buildLockCetus(ownerRes.data, xCetusSdk!)
          lockList.sort((a, b) => a.locked_until_time - b.locked_until_time)
          console.log('🚀 ~ fetchOwnerLockCetusList ~ lockList1:', {
            lockList,
            veNFT,
            availableXCetusAmount: XCetusUtil.getAvailableXCetus(veNFT, lockList)
          })
          setLockCetusList(lockList)
          setAvailableXCetusAmount(XCetusUtil.getAvailableXCetus(veNFT, lockList))
        } else {
          // 没veNFT，设置锁仓列表loading为false
          setLockCetusListLoading(false)
        }

        return {
          veNFT,
          posBaseList: result
        }
      }
    } catch (error) {
      console.error('🚀 ~ fetchOwnerNFT ~ error:', error)
      if (error instanceof TypeError) {
        setPosBaseListLoading(false)
        setPosBaseList([])
      }
    } finally {
      setPosBaseListLoading(false)
      setLockCetusListLoading(false)
      setVeNFTLoading(false)
    }
    return {
      veNFT: undefined,
      posBaseList: []
    }
  }

  const resetUserData = () => {
    setPosBaseList([])
    clearData()
  }

  return { fetchOwnerNFT, resetUserData }
}
