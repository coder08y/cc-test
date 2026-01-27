import useZapStore from '@/store/zap/index'
import { HTextLabelBox } from '@cetus/ui-kit'
import { formatCurrencyWithKMB } from '@cetus/utils'

export default function ZapTotalRate() {
  const { zapAmountRate } = useZapStore()
  return (
    <HTextLabelBox
      isLoading={false}
      label="Total Amount"
      value={zapAmountRate && !!+zapAmountRate ? formatCurrencyWithKMB(zapAmountRate) : '--'}
      labelStyle={{
        fontSize: '14px'
      }}
      valueStyle={{
        fontSize: '14px',
        h: '20px'
      }}
      skeletonStyle={{
        valueW: '128px'
      }}
    />
  )
}
