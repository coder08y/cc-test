import TotalAmount from '@/components/common/TotalAmount'
import { HTextLabelBox } from '@cetus/ui-kit'
import { convertScientificToDecimal, formatNumber } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { VStack } from '@chakra-ui/react'

type VaultsAddResultProps = {
  preCalculateLoading: boolean
  inputTotalValue?: string
  lpRate: string
  amountLimit?: string
  labelColor?: string
  lpDecimals?: number
  poolName: string
  calculateLpLoading?: boolean
  showTotalAmount?: boolean
}

// Vault添加结果
export function VaultsAddResult(props: VaultsAddResultProps) {
  const {
    poolName,
    amountLimit,
    lpRate,
    inputTotalValue,
    preCalculateLoading,
    labelColor,
    lpDecimals,
    calculateLpLoading,
    showTotalAmount = true
  } = props

  return (
    <VStack w="100%" gap="16px">
      {showTotalAmount && <TotalAmount labelStyle={{ color: labelColor }} totalAmount={inputTotalValue} loading={preCalculateLoading} />}

      {/* <HTextLabelBox
        label="Total Amount"
        labelStyle={{
          fontSize: '14px',
          color: labelColor
        }}
        value={formatCurrency(inputTotalValue, 2)}
        valueStyle={{
          fontSize: '14px',
          h: '14px'
        }}
        isLoading={preCalculateLoading}
      /> */}
      <HTextLabelBox
        label="Share of Pool"
        labelStyle={{
          fontSize: { base: '12px', lg: '14px' },
          color: labelColor
        }}
        value={lpRate}
        isLoading={calculateLpLoading}
        valueStyle={{
          fontSize: { base: '12px', lg: '14px' },
          h: { base: '12px', lg: '14px' }
        }}
        skeletonStyle={{
          valueH: { base: '12px', lg: '14px' }
        }}
      />
      <HTextLabelBox
        label="Est. Received LP"
        labelStyle={{
          fontSize: { base: '12px', lg: '14px' },
          color: labelColor
        }}
        value={`${convertScientificToDecimal(formatNumber(fromDecimalsAmount(amountLimit || '0', lpDecimals ? lpDecimals : 9)).toString(), 9)} ${poolName}`}
        valueStyle={{
          fontSize: { base: '12px', lg: '14px' },
          h: { base: '12px', lg: '14px' }
        }}
        skeletonStyle={{
          valueH: { base: '12px', lg: '14px' }
        }}
        isLoading={calculateLpLoading}
      />
    </VStack>
  )
}
