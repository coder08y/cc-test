import { TooltipIcon } from '@cetus/design'
import { NumericFormatInput } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useRef, useState } from 'react'

export default function CreateInputBlock(props: {
  title: string
  symbol: undefined | string
  value: undefined | string
  decimals: undefined | number
  placeholder: string
  onChange: (val: string) => void
  tooltipCon?: any
  inputAllowed?: boolean
}) {
  const { title, symbol, value, decimals, placeholder, onChange, tooltipCon, inputAllowed = true } = props
  const fromRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState<boolean>(false)

  // 处理用户输入变化
  const handleChange = (newValue: string) => {
    onChange(newValue)
  }

  const currentValue = value ?? ''

  /**
   * 统一的「是否允许插入」判断
   * 支持光标选中替换
   */
  const canInsert = (insertText: string, target: HTMLInputElement) => {
    const { selectionStart = 0, selectionEnd = 0 } = target
    const next = currentValue.slice(0, selectionStart) + insertText + currentValue.slice(selectionEnd)

    return isValidPowerOfTenCandidate(next)
  }

  return (
    <VStack w="100%" alignItems="flex-start" zIndex="0" justifyContent="space-between">
      <HStack gap="2px" h="16px">
        <Text fontSize="12px" fontWeight="500" lineHeight="16px">
          {title}
        </Text>
        {tooltipCon && <TooltipIcon tooltipCon={tooltipCon} iconSize="18px" />}
      </HStack>
      <HStack
        borderRadius="8px"
        border="1px solid"
        bg="var(--chakra-colors-bg_secondary)"
        p="0 12px"
        w="100%"
        ref={fromRef}
        onFocus={() => {
          setFocused(true)
        }}
        onBlur={() => {
          setFocused(false)
        }}
        borderColor={focused ? 'var(--chakra-colors-token_active_border)' : 'border'}
        boxShadow={focused ? '0px 0px 6px 0px #0067AD' : ''}
        sx={{
          input: {
            '&::placeholder': {
              color: '#909CA4'
            }
          }
        }}
      >
        <NumericFormatInput
          value={currentValue}
          onChange={handleChange}
          decimals={decimals}
          placeholder={placeholder}
          inputAllowed={inputAllowed}
          /** ✅ 核心：字符级拦截 */
          onBeforeInput={e => {
            const ie = e as InputEvent

            // 忽略输入法组合态
            if (ie.isComposing) return

            const text = ie.data
            if (!text) return

            if (!canInsert(text, e.target as HTMLInputElement)) {
              e.preventDefault()
            }
          }}
          /** ✅ 粘贴兜底 */
          onPaste={e => {
            const text = e.clipboardData.getData('text')
            if (!canInsert(text, e.target as HTMLInputElement)) {
              e.preventDefault()
            }
          }}
          style={{
            width: '100%',
            background: 'var(--chakra-colors-bg_secondary)',
            opacity: 1,
            outline: 'none',
            color: 'var(--chakra-colors-text_caption)',
            fontSize: '14px',
            height: '40px',
            lineHeight: '40px',
            touchAction: 'manipulation',
            transition: 'all 0.3s',
            fontWeight: '500'
          }}
        />
        <Text whiteSpace="nowrap">{textEllipses(symbol, 12)}</Text>
      </HStack>
    </VStack>
  )
}

/** 预编译正则（避免重复创建） */
const INT_POWER_RE = /^1(0*)$/
const DECIMAL_PREFIX_RE = /^0(\.(0*)?)?$/
const DECIMAL_DONE_RE = /^0\.0*1$/

/**
 * 判断：next 是否仍可能是 10^n
 */
function isValidPowerOfTenCandidate(next: string) {
  return INT_POWER_RE.test(next) || DECIMAL_PREFIX_RE.test(next) || DECIMAL_DONE_RE.test(next)
}
