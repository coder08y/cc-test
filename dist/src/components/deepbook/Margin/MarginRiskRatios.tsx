import { colorMap } from '@/constant/deepbook'
import { CetusTooltip } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { HStack, Text, VStack } from '@chakra-ui/react'

export type RiskRatioItem = {
  label: string
  value: number
  tooltipTitle: string
  tooltipContent: string
}

type MarginRiskRatiosProps = {
  riskRatios: RiskRatioItem[]
}

export default function MarginRiskRatios({ riskRatios }: MarginRiskRatiosProps) {
  return (
    <HStack w="100%" gap="6px">
      {riskRatios.map((item, index) => (
        <HStack key={item.label} w="100%" h="24px" bg={colorMap[index + 1].bg} gap="4px" rounded="12px" justifyContent="center" alignItems="center">
          <Text fontSize="12px" lineHeight="16px" color={colorMap[index + 1].color}>
            {item.label}:
          </Text>
          <Text fontSize="12px" lineHeight="16px" color={colorMap[index + 1].color}>
            {item.value}
          </Text>
          <CetusTooltip
            tooltip={
              <VStack gap="4px" alignItems="flex-start">
                <Text fontSize="12px" lineHeight="16px">
                  {item.tooltipTitle}
                </Text>
                <Text fontSize="12px" lineHeight="16px">
                  {item.tooltipContent}
                </Text>
              </VStack>
            }
          >
            <Icon xlinkHref="#icon-icon_tips" fontSize="16px" svgFill={colorMap[index + 1].color} svgHover={colorMap[index + 1].color} />
          </CetusTooltip>
        </HStack>
      ))}
    </HStack>
  )
}
