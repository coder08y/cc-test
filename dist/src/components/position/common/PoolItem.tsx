import CLMMPoolItem from '../clmm/list/PoolItem'
import DLMMPoolItem from '../dlmm/list/DLMMPoolItem'

function PoolItem({ poolInfo, ...rest }: { poolInfo: any; [key: string]: any }) {
  return poolInfo?.poolType === 'dlmm' ? <DLMMPoolItem poolInfo={poolInfo} {...rest} /> : <CLMMPoolItem poolInfo={poolInfo} {...rest} />
}

export default PoolItem
