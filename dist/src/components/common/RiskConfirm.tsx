// src/components/RiskConfirmation.tsx
import { Box, Checkbox, Flex, Text } from '@chakra-ui/react'
import React, { useMemo } from 'react'

interface RiskConfirmProps {
  checked: boolean
  onChange: (checked: boolean) => void
  slippage: string | number
  tipType?: 'warning' | 'error'
}

const RiskConfirm: React.FC<RiskConfirmProps> = ({ checked, onChange, slippage, tipType = 'warning' }) => {
  const color = useMemo(() => (tipType === 'warning' ? 'primary_yellow' : 'primary_red'), [tipType])
  const bg = useMemo(() => (tipType === 'warning' ? 'primary_yellow_opacity.10' : 'primary_red_opacity.10'), [tipType])
  return (
    <Box w="100%" p="12px" borderRadius="12px" bg={bg}>
      <Text fontSize="12px" lineHeight="16px" color={color}>
        You are about to execute a large swap with a high slippage tolerance.
      </Text>
      <Text fontSize="12px" lineHeight="16px" color={color}>
        In the worst case, you may lose up to {slippage}% of the output amount if price moves unfavorably during execution.
      </Text>

      <Text fontSize="12px" lineHeight="16px" mb="8px" color={color}>
        Please confirm that you understand the risks involved.
      </Text>

      <Flex align="center" _hover={{ '.chakra-checkbox__label': { color: checked ? color : 'text_caption' } }}>
        <Checkbox
          isChecked={checked}
          onChange={e => onChange(e.target.checked)}
          iconColor="block_color"
          sx={{
            'span.chakra-checkbox__label': {
              color: checked ? color : 'text_paragraph',
              fontSize: '12px'
            },
            // 未选中状态
            '.chakra-checkbox__control': {
              color: 'text_paragraph',
              backgroundColor: 'transparent',
              border: '1px solid'
            },
            // 选中状态
            '&[data-checked] .chakra-checkbox__control': {
              backgroundColor: color,
              borderColor: color
            },
            // 可选：悬停效果
            '&:hover .chakra-checkbox__control': {
              borderColor: checked ? color : 'text_caption'
            }
          }}
        >
          I Understand the Risks, Proceed
        </Checkbox>
      </Flex>
    </Box>
  )
}

export default RiskConfirm
