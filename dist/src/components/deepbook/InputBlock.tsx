import { NumericFormatInput } from '@cetus/ui-kit'
import { HStack, Input, Text, VStack } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { InputBlockProps } from './InputBlockGroup'

export default function InputBlock(props: InputBlockProps) {
  const { title, symbol, value, onChange, isMarket, decimals, onUserInput } = props
  const fromRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState<boolean>(false)

  // 处理用户输入变化
  const handleChange = (newValue: string) => {
    onChange(newValue)
    // 当用户手动输入时，触发锁定价格回调
    if (onUserInput && !isMarket) {
      onUserInput()
    }
  }

  return (
    <VStack
      w="100%"
      ref={fromRef}
      p="12px"
      border="1px solid"
      borderRadius="8px"
      bg="bg_secondary"
      alignItems="flex-start"
      gap="0px"
      position="relative"
      zIndex="5"
      onFocus={() => {
        setFocused(true)
      }}
      onBlur={() => {
        setFocused(false)
      }}
      borderColor={focused ? 'token_active_border' : 'border'}
      boxShadow={focused ? '0px 0px 6px 0px #0067AD' : ''}
      flexDirection="row"
      justifyContent="space-between"
      h="42px"
    >
      <Text fontSize="14px" fontWeight="500" lineHeight="16px">
        {title}
      </Text>
      <HStack w="100%" alignItems="baseline">
        {isMarket ? (
          <Input value="Market" textAlign="right" disabled placeholder="Market" color="text_secondary !important" fontSize="14px" fontWeight="500" />
        ) : (
          <NumericFormatInput
            value={value}
            onChange={handleChange}
            decimals={decimals}
            placeholder="0.0"
            style={{
              width: 'calc(100% - 8px)',
              background: 'none',
              whiteSpace: 'nowrap',
              opacity: 1,
              outline: 'none',
              color: 'var(--chakra-colors-text_caption)',
              fontSize: '14px',
              height: '16px',
              lineHeight: '16px',
              touchAction: 'manipulation',
              transition: 'all 0.3s',
              fontWeight: '500',
              textAlign: 'right'
            }}
          />
        )}
        {!isMarket && (
          <Text mt="-8px" fontWeight="500" color="text_caption">
            {symbol}
          </Text>
        )}
      </HStack>
    </VStack>
  )
}
