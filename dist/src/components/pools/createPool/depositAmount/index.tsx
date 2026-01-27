import CLMMDepositAmount from './CLMMDepositAmount'
import DLMMDepositAmount from './DLMMDepositAmount'
import type { DepositAmountProps } from './type'

function DepositAmount({ poolType, ...rest }: DepositAmountProps) {
  return poolType === 'dlmm' && 'minPriceData' in rest ? <DLMMDepositAmount {...rest} /> : <CLMMDepositAmount {...rest} />
}

export default DepositAmount
