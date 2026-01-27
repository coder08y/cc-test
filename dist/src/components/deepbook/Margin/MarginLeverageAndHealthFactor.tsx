import { HealthFactorStatus } from '@/hooks/deepbook/margin/useMarginTrade'
import useDeepBookStore from '@/store/deepbook'
import { CetusTooltip } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { d, formatNumberFloor } from '@cetus/utils'
import { HStack, Text } from '@chakra-ui/react'

export default function MarginLeverageAndHealthFactor({
  healthFactorValue,
  healthFactorStatus,
  healthFactorOriginal,
  healthFactorOriginalStatus
}: {
  healthFactorValue: number | '∞' | null
  healthFactorStatus: HealthFactorStatus | null
  healthFactorOriginal: number | null
  healthFactorOriginalStatus: HealthFactorStatus | null
}) {
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const minBorrowRiskRatio = currentDeepBookPool?.minBorrowRiskRatio || 1.25

  return (
    <>
      <HStack w="100%" justifyContent="space-between">
        <HStack gap="4px">
          <Text fontSize="12px" lineHeight="16px">
            Margin Risk Level
          </Text>
          <CetusTooltip
            tooltip={
              <Text fontSize="12px" lineHeight="16px">
                This Margin Risk Level reflects your account's risk state after the order execution is completed. Make sure it stays above{' '}
                {minBorrowRiskRatio} to place a margin order
              </Text>
            }
          >
            <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
          </CetusTooltip>
        </HStack>
        {healthFactorValue !== null && healthFactorStatus && (
          <HStack gap="4px">
            <>
              {healthFactorOriginal !== null && healthFactorOriginalStatus && (
                <>
                  <Text fontSize="12px" lineHeight="16px" color={healthFactorOriginalStatus.color}>
                    {d(healthFactorOriginal || '0').gt(d(1000)) ? '1000' : formatNumberFloor(healthFactorOriginal)}
                  </Text>
                  <Icon xlinkHref="#icon-icon_right" fontSize="12px" svgFill="text_caption" />
                </>
              )}
              <Text fontSize="12px" lineHeight="16px" color={healthFactorStatus.color}>
                {healthFactorValue === '∞' ? '∞' : d(healthFactorValue || '0').gt(d(1000)) ? '1000' : formatNumberFloor(healthFactorValue) || '--'}
              </Text>
            </>
            <Text
              as="span"
              fontSize="10px"
              lineHeight="14px"
              p="1px 4px"
              borderRadius="4px"
              color={healthFactorStatus.color}
              bg={healthFactorStatus.bg}
            >
              {healthFactorStatus.status}
            </Text>
          </HStack>
        )}
      </HStack>
      {/* <MarginLeverageRatio /> */}
    </>
  )
}
