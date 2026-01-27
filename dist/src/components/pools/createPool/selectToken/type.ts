import { SelectPoolProps } from '@/components/selectPool/type'
import { DlmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'

export interface SelectTokenProps
  extends Omit<
    SelectPoolProps,
    'title' | 'description' | 'poolType' | 'feeTier' | 'feeTierList' | 'onFeeTierChange' | 'binStep' | 'binStepList' | 'onBinStepChange'
  > {
  editStep: number
  currentStep: number
  onEdit: () => void
}

export interface SelectCLMMTokenProps extends SelectTokenProps, Pick<SelectPoolProps, 'feeTier' | 'feeTierList' | 'onFeeTierChange'> {}

export interface SelectDLMMTokenProps extends SelectTokenProps, Pick<SelectPoolProps, 'binStep' | 'binStepList' | 'onBinStepChange'> {
  baseFeeList: any[]
  baseFee: Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'>
  onBaseFeeChange: (fee: DlmmSelectFeeType) => void
  getBinStepListLoading: boolean
}
