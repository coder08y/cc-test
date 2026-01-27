import { CetusTooltip } from '@cetus/design'
import { Text } from '@chakra-ui/react'
export const LeverageTag = ({ leverage, showTooltip = false }: { leverage: number; showTooltip?: boolean }) => {
  return showTooltip ? (
    <CetusTooltip
      placement="top"
      tooltip={
        <Text fontSize="12px" lineHeight="16px">
          Margin trading mode available
        </Text>
      }
      triggerStyle={{
        display: 'inline-block',
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 10
      }}
    >
      <Text fontSize="12px" color="primary" bg="primary_opacity.10" borderRadius="4px" px="4px" ml="2px !important" h="20px" lineHeight="20px">
        {leverage}x
      </Text>
    </CetusTooltip>
  ) : (
    <Text fontSize="12px" color="primary" bg="primary_opacity.10" borderRadius="4px" px="4px" ml="2px !important" h="20px" lineHeight="20px">
      {leverage}x
    </Text>
  )
}
