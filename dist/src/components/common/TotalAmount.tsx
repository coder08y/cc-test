import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox } from '@cetus/ui-kit'
import { HTextLabelBoxProps } from '@cetus/ui-kit/src/components/HTextLabelBox'
import { d, formatCurrencyWithKMB } from '@cetus/utils'

type TotalAmountWithTotalProps = {
  totalAmount?: string
}

type TotalAmountWithoutTotalProps = {
  amountA?: string
  amountB?: string
}

type TotalAmountProps = (TotalAmountWithTotalProps | TotalAmountWithoutTotalProps) & {
  loading?: boolean
} & Pick<HTextLabelBoxProps, 'labelStyle' | 'valueStyle' | 'skeletonStyle'>

function TotalAmount({ loading = false, labelStyle = {}, valueStyle = {}, skeletonStyle = {}, ...rest }: TotalAmountProps) {
  const { isApp } = useWindowWidth()
  const getValue = (props: TotalAmountWithTotalProps | TotalAmountWithoutTotalProps) => {
    if ('totalAmount' in props) {
      const { totalAmount } = props
      return totalAmount && !!+totalAmount ? formatCurrencyWithKMB(totalAmount) : '--'
    }
    if ('amountA' in props && 'amountB' in props) {
      const { amountA, amountB } = props
      return amountA == '--' || amountB == '--'
        ? '--'
        : d(amountA || '0')
            .plus(amountB || '0')
            .toString()
    }
    return '--'
  }
  return (
    <HTextLabelBox
      isLoading={loading}
      label="Total Amount"
      value={getValue(rest)}
      labelStyle={{
        fontSize: isApp ? '12px' : '14px',
        ...labelStyle
      }}
      valueStyle={{
        fontSize: isApp ? '12px' : '14px',
        ...valueStyle
      }}
      skeletonStyle={{
        valueW: isApp ? '80px' : '128px',
        ...skeletonStyle
      }}
    />
  )
}

export default TotalAmount
