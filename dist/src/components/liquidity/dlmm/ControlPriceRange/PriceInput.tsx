import ActionButton from '@/components/liquidity/common/ActionButton'
import { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { Block, InputBox } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { addComma, d, removeComma } from '@cetus/utils'
import { HStack, Input, NumberInput, NumberInputField, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function PriceInput({
  title,
  perText,
  data,
  direct,
  loading,
  handleAddPrice,
  handleSubPrice,
  onPriceChange,
  minPrice = '0',
  maxPrice = '∞',
  subDisabled,
  addDisabled,
  verifyAction = true,
  percentageInput
}: {
  title: string
  perText: string
  data: RangePriceType
  direct: boolean
  loading?: boolean
  handleAddPrice: (price: RangePriceType) => void
  handleSubPrice: (price: RangePriceType) => void
  onPriceChange: (currentPrice: RangePriceType, value: string) => any
  minPrice?: string
  maxPrice?: string
  subDisabled?: boolean
  addDisabled?: boolean
  verifyAction?: boolean
  percentageInput?: {
    value: string
    inputRef: React.RefObject<any>
    isActive: boolean
    showWarning: boolean
    onBlur: (value: string) => void
    onChange: (stringValue: string, numberValue: number) => void
    onInput: (e: any) => void
    onFocus: () => void
  }
}) {
  const { isApp } = useWindowWidth()
  const [inputValue, setInputValue] = useState('')
  const inputValueRef = useRef<string>()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value && value.startsWith('-')) {
      return
    }
    console.log(value, isAllowed(value) || isAllowed(value.split(',').join('')), 'handleChange')
    if (isAllowed(value) || isAllowed(value.split(',').join(''))) {
      setInputValue(value)
    }
  }
  useEffect(() => {
    if (!data || !data.price) return

    const value = direct ? data.displayPrice : data.displayReversePrice
    setInputValue((value as string) || '')
    inputValueRef.current = value.toString()
  }, [data?.price, direct, data?.changeCount])

  const handleAdd = useCallback(() => {
    if (verifyAction) {
      direct ? handleAddPrice(data) : handleSubPrice(data)
    } else {
      handleAddPrice(data)
    }
  }, [direct, data?.price])

  const handleSub = useCallback(() => {
    if (verifyAction) {
      direct ? handleSubPrice(data) : handleAddPrice(data)
    } else {
      handleSubPrice(data)
    }
  }, [direct, data?.price])

  const handleOnBlur = useCallback(() => {
    if (inputValueRef.current === inputValue) {
      return
    }
    let value: string
    console.log(inputValue, typeof inputValue, !inputValue, data, 'handleOnBlur')
    if (!inputValue) {
      value = String((direct ? data.displayPrice : data.displayReversePrice) ?? '')
      setInputValue(value)
      return
    }
    let res
    try {
      res = onPriceChange(data, direct ? removeComma(inputValue) : d(1).div(removeComma(inputValue)).toString())
    } catch (error) {
      res = onPriceChange(data, inputValue)
    }
    console.log(res, 'handleOnBlur')
    if (res) {
      setInputValue(direct ? res?.displayPrice : res?.displayReversePrice)
    }
  }, [inputValue, data, direct])

  const isAllowed = (value: string) => {
    // 允许空字符串、数字、小数或∞
    return value === '' || /^-?\d*\.?\d*$/.test(value) || value === '∞'
  }

  // 确保光标不会出现在 % 后面
  const adjustCursorPosition = (
    e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement> | any
  ) => {
    const input = e.target as HTMLInputElement
    if (!input) return

    const value = input.value || ''
    // 建议寻找 " %" 整体，或者只寻找 "%"
    const suffix = ' %'
    const suffixIndex = value.lastIndexOf(suffix)

    if (suffixIndex !== -1 && input.selectionStart! > suffixIndex) {
      // 只有当光标真的越过了空格进入了 % 区域，才强行拉回
      setTimeout(() => {
        input.setSelectionRange(suffixIndex, suffixIndex)
      }, 0)
    }
  }

  if (isApp && percentageInput) {
    return (
      <VStack gap="8px" align="stretch" w="100%" flex="1" maxWidth="calc((100% - 8px) / 2)">
        <Text fontSize="12px" color="text_paragraph" whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
          {title} ({perText.replace('/', ' per ')})
        </Text>
        <InputBox
          sx={{
            ...(isApp && {
              border: '1px solid',
              borderColor: 'border',
              borderRadius: '8px',
              bg: 'bg_secondary',
              justifyContent: 'space-between',
              p: 0,
              boxShadow: 'none'
            })
          }}
        >
          <HStack flex="1" w="100%">
            <VStack flex="1">
              {loading ? (
                <Skeleton w="100px" h="14px" />
              ) : (
                <Input
                  value={inputValue}
                  onChange={handleChange}
                  placeholder="0.0"
                  style={{
                    width: 'calc(100% - 8px)',
                    background: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    opacity: 1,
                    outline: 'none',
                    color: 'var(--chakra-colors-text_caption)',
                    fontSize: '14px',
                    height: '14px',
                    lineHeight: '14px',
                    textAlign: 'left',
                    fontWeight: '500',
                    paddingLeft: '4px'
                  }}
                  onBlur={handleOnBlur}
                />
              )}

              <Block h="12px" display="flex" p="4px" border="0" borderRadius="12px" justifyContent="center" alignItems="center">
                <Tooltip
                  label={
                    <Text fontSize="12px" lineHeight="20px">
                      Percentage Min: -99.99%
                    </Text>
                  }
                  isOpen={percentageInput.showWarning}
                  placement="top"
                >
                  <NumberInput
                    value={percentageInput.value}
                    precision={2}
                    inputMode="numeric"
                    clampValueOnBlur
                    variant="unstyled"
                    format={value => (value ? addComma(value) + ' %' : '')}
                    onBlur={e => percentageInput.onBlur(removeComma(e.target.value))}
                    onChange={(valueString, valueNumber) => {
                      const stringValue = valueString || ''
                      percentageInput.onChange(removeComma(stringValue), typeof valueNumber === 'number' ? valueNumber : 0)
                    }}
                    color="text_paragraph"
                    w="100%"
                  >
                    <NumberInputField
                      fontSize="12px"
                      paddingInlineStart="4px"
                      paddingInlineEnd="4px"
                      textAlign="left"
                      ref={percentageInput.inputRef}
                      onFocus={e => {
                        adjustCursorPosition(e)
                        percentageInput.onFocus()
                      }}
                      onClick={adjustCursorPosition}
                      onInput={e => {
                        adjustCursorPosition(e)
                        percentageInput.onInput(e)
                      }}
                      onKeyDown={e => {
                        const input = e.target as HTMLInputElement
                        const { selectionStart, value } = input

                        // 如果按下的是删除键，且光标紧贴在 " %" 前面
                        if (e.key === 'Backspace' && selectionStart === value.indexOf(' %')) {
                          // 这里可以手动触发一次删除数值末尾的操作，或者干脆不处理让 onChange 自己对齐
                        }
                        adjustCursorPosition(e)
                        percentageInput.onInput(e)
                      }}
                      onMouseUp={e => {
                        adjustCursorPosition(e)
                        percentageInput.onInput(e)
                      }}
                    />
                  </NumberInput>
                </Tooltip>
              </Block>
            </VStack>
            <VStack gap="2px">
              <ActionButton
                type="Sub"
                onClick={handleSub}
                disabled={(minPrice !== '∞' ? d(removeComma(inputValue)).lte(removeComma(minPrice)) : inputValue === '∞') || subDisabled}
                wrapStyle={{ minW: '24px', w: '24px', h: '26px', bg: 'background', borderRadius: '0 8px 8px 0', border: 'none' }}
              />
              <ActionButton
                type="Add"
                onClick={handleAdd}
                disabled={(maxPrice !== '∞' ? d(removeComma(inputValue)).gte(removeComma(maxPrice)) : inputValue === '∞') || addDisabled}
                wrapStyle={{ minW: '24px', w: '24px', h: '26px', bg: 'background', borderRadius: '0 8px 8px 0', border: 'none' }}
              />
            </VStack>
          </HStack>
        </InputBox>
      </VStack>
    )
  }

  return (
    <InputBox borderRadius="12px" p="12px">
      <HStack flex="1" justify="space-between">
        <ActionButton
          type="Sub"
          onClick={handleSub}
          disabled={(minPrice !== '∞' ? d(removeComma(inputValue)).lte(removeComma(minPrice)) : inputValue === '∞') || subDisabled}
        />
        <VStack>
          <Text fontSize="12px" color="primary_gray">
            {title}
          </Text>
          {loading ? (
            <Skeleton w="100px" h="14px" />
          ) : (
            <Input
              value={inputValue}
              onChange={handleChange}
              placeholder="0.0"
              style={{
                width: 'calc(100% - 8px)',
                background: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                opacity: 1,
                outline: 'none',
                color: 'var(--chakra-colors-text_caption)',
                fontSize: '14px',
                height: '14px',
                lineHeight: '14px',
                textAlign: 'center',
                fontWeight: '500'
              }}
              onBlur={handleOnBlur}
            />
          )}
          {loading ? (
            <Skeleton w="100px" h="12px" />
          ) : (
            <Text fontSize="12px" color="primary_gray">
              {perText.replace('/', ' per ')}
            </Text>
          )}
        </VStack>

        <ActionButton
          type="Add"
          onClick={handleAdd}
          disabled={(maxPrice !== '∞' ? d(removeComma(inputValue)).gte(removeComma(maxPrice)) : inputValue === '∞') || addDisabled}
        />
      </HStack>
    </InputBox>
  )
}
