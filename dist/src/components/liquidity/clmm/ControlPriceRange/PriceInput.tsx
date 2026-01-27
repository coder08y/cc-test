import ActionButton from '@/components/liquidity/common/ActionButton'
import { TickData } from '@/types'
import { InputBox } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d } from '@cetus/utils'
import { HStack, Input, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'

export default function PriceInput({
  title,
  perText,
  data,
  direct,
  loading,
  handleAddPrice,
  handleSubPrice,
  setTickDataBasedOnPrice,
  isFullRange,
  inline
}: {
  title: string
  perText: string
  data: Partial<TickData>
  direct: boolean
  loading?: boolean
  handleAddPrice: (tickData: Partial<TickData>) => void
  handleSubPrice: (tickData: Partial<TickData>) => void
  setTickDataBasedOnPrice: (data: Partial<TickData>, value: string, direct?: boolean) => void
  isFullRange?: boolean
  inline?: boolean
}) {
  const [inputValue, setInputValue] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value && value.startsWith('-')) {
      return
    }
    if (isAllowed(value) || isAllowed(value.split(',').join(''))) {
      setInputValue(value)
    }
  }

  useEffect(() => {
    if (data?.pool) {
      setInputValue((direct ? data.displayPrice : data.displayReversePrice) || '')
    }
  }, [data, direct])

  const handleAdd = useCallback(() => {
    direct ? handleAddPrice(data) : handleSubPrice(data)
  }, [direct, data])

  const handleSub = useCallback(() => {
    direct ? handleSubPrice(data) : handleAddPrice(data)
  }, [direct, data])

  const handleOnBlur = useCallback(() => {
    let value
    if (!inputValue) {
      value = (direct ? data.displayPrice : data.displayReversePrice) || ''
      setInputValue(value)
      return
    }
    try {
      setTickDataBasedOnPrice(data, direct ? inputValue : d(1).div(inputValue).toString(), direct)
    } catch (error) {
      setTickDataBasedOnPrice(data, inputValue, direct)
    }
  }, [inputValue, data, direct])
  const isAllowed = (value: string) => {
    // 允许空字符串、数字、小数或∞
    return value === '' || /^-?\d*\.?\d*$/.test(value) || value === '∞'
  }

  const { isApp } = useWindowWidth()

  return (
    <InputBox
      borderRadius="12px"
      p={inline ? 0 : '12px'}
      sx={{ ...(inline && { bg: 'transparent', border: 'none', boxShadow: 'none', flex: '1', maxWidth: 'calc((100% - 8px) / 2)' }) }}
    >
      <HStack flex="1" justify="center" sx={{ ...(inline && { flexDirection: 'column', alignItems: 'flex-start' }) }}>
        {isFullRange || inline ? null : <ActionButton type="Sub" onClick={handleSub} disabled={inputValue === '0' || isFullRange} />}
        {inline ? (
          <>
            <Text fontSize="12px" color="text_paragraph" maxWidth={'100%'} whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
              {title} ({perText?.replace('/', ' per ')})
            </Text>
          </>
        ) : (
          <></>
        )}
        <VStack
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          gap="4px"
          sx={{
            ...(inline && {
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'border',
              borderRadius: '8px',
              p: '2px',
              bg: 'bg_secondary',
              w: '100%'
            })
          }}
        >
          <VStack sx={{ ...(inline && { flex: '1' }) }}>
            {!inline && (
              <Text fontSize="12px" color="primary_gray">
                {title}
              </Text>
            )}

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
                  textAlign: inline ? 'left' : 'center',
                  fontWeight: '500'
                }}
                onBlur={handleOnBlur}
              />
            )}

            {!inline && (
              <Text textAlign="center" fontSize="12px" color="primary_gray">
                {perText?.replace('/', ' per ')}
              </Text>
            )}
          </VStack>
          {isFullRange ? (
            <Stack h={{ base: '60px', lg: '80px' }} />
          ) : (
            <VStack gap="2px">
              {inline ? (
                <ActionButton
                  type="Sub"
                  onClick={handleSub}
                  disabled={inputValue === '0' || isFullRange}
                  wrapStyle={{
                    ...(inline && { minW: '24px', w: '24px', h: '26px', bg: 'background', borderRadius: '0 8px 8px 0', border: 'none' })
                  }}
                />
              ) : null}
              <ActionButton
                type="Add"
                onClick={handleAdd}
                disabled={inputValue === '∞' || isFullRange}
                wrapStyle={{
                  ...(inline && {
                    minW: '24px',
                    w: '24px',
                    h: '26px',
                    bg: 'background',
                    borderRadius: isApp ? '0 8px 8px 0' : '0 8px 0 0',
                    border: 'none'
                  })
                }}
              />
            </VStack>
          )}
        </VStack>
      </HStack>
    </InputBox>
  )
}
