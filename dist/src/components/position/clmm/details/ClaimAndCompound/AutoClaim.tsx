import PendingYieldValue from '@/components/position/common/PendingYieldValue'
import { Block, TooltipIcon } from '@cetus/design'
import { HStack, Text } from '@chakra-ui/react'

type AutoClaimProps = {
  autoClaimList: any
  autoClaimTotalYield: string | number
  warpStyle?: any
}

function AutoClaim({ autoClaimList, autoClaimTotalYield, warpStyle }: AutoClaimProps) {
  return (
    <Block bg="blue_bg" borderRadius="12px" p="12px" {...warpStyle}>
      <HStack w="100%" justify="space-between">
        <HStack gap="2px">
          <Text>Auto Claim</Text>
          <TooltipIcon tooltipCon="Small amount of yield will be automatically claimed." />
        </HStack>
        <PendingYieldValue
          myPosYieldValue={autoClaimTotalYield}
          yieldList={autoClaimList}
          textStyle={{ fontSize: '14px', color: 'text_caption', textDecorationColor: 'text_paragraph' }}
        />
      </HStack>
    </Block>
  )
}

export default AutoClaim
