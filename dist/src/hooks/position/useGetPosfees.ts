import usePositionStore from '@/store/position'
import { PosBaseInfo, PosFee } from '@/types'
import { useSdk } from '@cetus/sdk-factory'
import { bnToAmount } from '@cetus/utils'
import { CollectFeesQuote } from '@cetusprotocol/sui-clmm-sdk'

export default function useGetPosfees() {
  const clmmSdk = useSdk('clmm')
  const { setPosFeeData, setPosFeeDataLoading } = usePositionStore()

  const getPosFeeData = async (positionBaseList: PosBaseInfo[]) => {
    console.log('🚀 ~ file: useGetPosfees.ts:11 ~ getPosFeeData ~ positionBaseList:', positionBaseList)
    setPosFeeDataLoading(true)
    const feeParams = positionBaseList?.map((posInfo: any) => {
      return {
        pool_id: posInfo.clmmPool,
        position_id: posInfo.posId,
        coin_type_a: posInfo.coinTypeA,
        coin_type_b: posInfo.coinTypeB
      }
    })

    try {
      console.log('🚀 ~ file: useGetPosfees.ts:11 ~ feeParams ~ feeParams:', feeParams)

      const res = (await clmmSdk!.Position.fetchPosFeeAmount(feeParams)) || []
      console.log('🚀 ~ file: useGetPosfees.ts:11 ~ getPosFeeData ~ res:', res)

      const posFeesData: Record<string, PosFee> = await formatPosFeeData(res, positionBaseList)
      console.log('getPosFeeData ~ posFeesData:', posFeesData)

      setPosFeeData(posFeesData)
    } catch (error) {
      console.log('🚀 ~ file: useGetPosfees.ts:54 ~ getPosFeeData ~ error:', error)
      setPosFeeDataLoading(false)
    } finally {
      setPosFeeDataLoading(false)
    }
  }

  const formatPosFeeData = async (res: CollectFeesQuote[], positionBaseList: PosBaseInfo[]) => {
    const posFeesData: Record<string, PosFee> = Object.fromEntries(
      res.map((item, index) => {
        const pos = positionBaseList[index]
        const displayFeeOwedA = bnToAmount(
          !pos.isReverse ? item.fee_owned_a.toString() : item.fee_owned_b.toString(),
          pos?.displayTokenA?.decimals || 0
        )
        const displayFeeOwedB = bnToAmount(
          !pos.isReverse ? item.fee_owned_b.toString() : item.fee_owned_a.toString(),
          pos?.displayTokenB?.decimals || 0
        )
        return [
          item.position_id,
          {
            feeOwedA: item.fee_owned_a.toString(),
            feeOwedB: item.fee_owned_b.toString(),
            displayFeeOwedA,
            displayFeeOwedB
          }
        ]
      })
    )
    return posFeesData
  }

  return {
    getPosFeeData,
    formatPosFeeData
  }
}
