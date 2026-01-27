import CLMMInitPrice from './CLMMInitPrice'
import DLMMInitPrice from './DLMMInitPrice'
import { InitPriceProps } from './type'

function SetInitPrice({ poolType, ...rest }: InitPriceProps) {
  return poolType === 'clmm' && 'isReverse' in rest ? <CLMMInitPrice {...rest} /> : <DLMMInitPrice {...rest} />
}

export default SetInitPrice
