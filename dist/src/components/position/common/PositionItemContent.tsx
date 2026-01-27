import { PoolType } from '@/components/pools/createPool/SelectPoolType'
import { PosBaseInfo } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import CLMMPositionItemContent from '../clmm/list/PositionItemContent'
import DLMMPositionItemContent from '../dlmm/list/DLMMPositionItemContent'

export type PositionItemContentProps = {
  positionInfo: PosBaseInfo | DlmmPosBaseInfo
  positionItemWidth?: string[]
  priceDirect?: boolean
  showMiningIcon?: boolean
  showFarmingIcon?: boolean
  poolType: PoolType
  isLoading?: boolean
}

function PositionItemContent({ poolType, positionInfo, ...rest }: PositionItemContentProps) {
  return poolType === 'dlmm' ? (
    <DLMMPositionItemContent positionInfo={positionInfo as DlmmPosBaseInfo} {...rest} />
  ) : (
    <CLMMPositionItemContent positionInfo={positionInfo as PosBaseInfo} {...rest} />
  )
}

export default PositionItemContent
