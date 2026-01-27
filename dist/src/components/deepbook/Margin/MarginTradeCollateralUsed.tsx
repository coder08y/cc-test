import { CetusTooltip } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { d, formatNumber } from '@cetus/utils'
import { HStack, Text } from '@chakra-ui/react'

interface MarginTradeCollateralUsedProps {
  activeTab: string
  collateralUsed: { base: string; quote: string }
  currentDeepBookPool: any
}

export default function MarginTradeCollateralUsed({ activeTab, collateralUsed, currentDeepBookPool }: MarginTradeCollateralUsedProps) {
  return (
    <HStack w="100%" justifyContent="space-between">
      {/* 根据实际size计算实际消耗的collateral */}
      <HStack gap="4px">
        <Text fontSize="12px" lineHeight="16px">
          Collateral Used
        </Text>
        <CetusTooltip
          tooltip={
            <Text fontSize="12px" lineHeight="16px">
              The actual collateral used is calculated from this executable order size and may be lower than the collateral input
            </Text>
          }
        >
          <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
        </CetusTooltip>
      </HStack>
      <HStack gap="4px" flexWrap="wrap" justifyContent="flex-end">
        {activeTab === 'base' && d(collateralUsed.base).gt(0) && (
          <Text fontSize="12px" lineHeight="16px" color="text_caption">
            {formatNumber(collateralUsed.base, currentDeepBookPool?.baseAssets?.decimals)} {currentDeepBookPool?.baseAssets?.symbol}
          </Text>
        )}
        {activeTab === 'quote' && d(collateralUsed.quote).gt(0) && (
          <Text fontSize="12px" lineHeight="16px" color="text_caption">
            {formatNumber(collateralUsed.quote, currentDeepBookPool?.quoteAssets?.decimals)} {currentDeepBookPool?.quoteAssets?.symbol}
          </Text>
        )}
        {activeTab === 'mixed' && (
          <>
            {d(collateralUsed.base).gt(0) && (
              <Text fontSize="12px" lineHeight="16px" color="text_caption">
                {formatNumber(collateralUsed.base, currentDeepBookPool?.baseAssets?.decimals)} {currentDeepBookPool?.baseAssets?.symbol}
              </Text>
            )}
            {d(collateralUsed.base).gt(0) && d(collateralUsed.quote).gt(0) && (
              <Text fontSize="12px" lineHeight="16px" color="text_caption">
                +
              </Text>
            )}
            {d(collateralUsed.quote).gt(0) && (
              <Text fontSize="12px" lineHeight="16px" color="text_caption">
                {formatNumber(collateralUsed.quote, currentDeepBookPool?.quoteAssets?.decimals)} {currentDeepBookPool?.quoteAssets?.symbol}
              </Text>
            )}
          </>
        )}
      </HStack>
    </HStack>
  )
}
