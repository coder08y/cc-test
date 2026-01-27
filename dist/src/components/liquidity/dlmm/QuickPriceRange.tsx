import WithTooltipInfo from '@/components/common/WithTooltipInfo'
import { DLMM_MAX_BIN_NUMBER } from '@/constant/dlmm'
import useQuickPriceRangeChange from '@/hooks/dlmm/useQuickPriceRangeChange'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { Block, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, NumericFormatInput, VaulDrawer } from '@cetus/ui-kit'
import { addComma, removeComma } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Box, Button, Center, HStack, NumberInput, NumberInputField, Stack, Text, Tooltip } from '@chakra-ui/react'
import { useSize } from 'ahooks'
import React, { useMemo, useState } from 'react'

const quickTabs = [
  {
    label: '19',
    value: '19'
  },
  {
    label: '49',
    value: '49'
  },
  {
    label: '79',
    value: '79'
  }
]

function QuickPriceRange({
  direct = false,
  children,
  onNumBinsBlur,
  onNumBinsChange
}: {
  direct: boolean
  children?: React.ReactNode[]
  onNumBinsBlur?: () => void
  onNumBinsChange?: (input: string) => void
}) {
  const {
    isMinInput,
    minValue,
    minInputRef,
    onMinInputBlur,
    onMinInputChange,
    handleMinInput,
    isMaxInput,
    maxValue,
    maxInputRef,
    onMaxInputChange,
    onMaxInputBlur,
    currentNumBins,
    handleChangeTab,
    setActiveInput,
    showMaxWarning,
    showMinWarning,
    handleMaxInput,
    editNumBins,
    setEditNumBins
  } = useQuickPriceRangeChange({ direct })

  const { numBins, setNumBins } = useAddDlmmLiquidityStore()
  const { isApp } = useWindowWidth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const size = useSize(document?.querySelector('.controlPriceRange'))
  const appH = useMemo(() => {
    return d(size?.height).sub(8).div(2).toNumber()
  }, [size?.height])

  // 当 numBins 变化时，同步更新编辑值
  React.useEffect(() => {
    setEditNumBins(numBins.toString())
  }, [numBins])

  return (
    <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap="8px" h={{ base: 'auto', lg: '32px' }} justify="space-between">
      {isApp ? (
        <>
          {React.cloneElement(children?.[0] as React.ReactElement, {
            percentageInputs: {
              min: {
                value: minValue,
                inputRef: minInputRef,
                isActive: isMinInput,
                showWarning: showMinWarning,
                onBlur: onMinInputBlur,
                onChange: onMinInputChange,
                onInput: handleMinInput,
                onFocus: () => setActiveInput('min')
              },
              max: {
                value: maxValue,
                inputRef: maxInputRef,
                isActive: isMaxInput,
                showWarning: showMaxWarning,
                onBlur: onMaxInputBlur,
                onChange: onMaxInputChange,
                onInput: handleMaxInput,
                onFocus: () => setActiveInput('max')
              }
            }
          })}
          <HStack justify="space-between" w="100%" mt={isApp ? '4px' : '8px'}>
            <WithTooltipInfo
              label="Num Bins"
              tooltip="The number of bins in your position. A wider price range usually requires more bins. A position with more bins may consume higher gas during liquidity-related txns."
              wrapStyle={{
                width: 'auto',
                flexDir: 'column',
                align: 'center',
                sx: {
                  'div > p:first-of-type': {
                    fontSize: '12px'
                  }
                },
                gap: '4px'
              }}
              w="320px"
              p="8px"
            />

            <HStack gap="4px">
              <Text fontSize="12px" color="text_caption">
                {numBins}
              </Text>
              <Icon
                xlinkHref="#icon-icon_edit1"
                fontSize="14px"
                cursor="pointer"
                onClick={() => {
                  setEditNumBins(numBins.toString())
                  setIsDrawerOpen(true)
                }}
              />
            </HStack>
          </HStack>
          <VaulDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} padding="12px 12px 24px">
            <Text fontSize="14px" color="text_caption" fontWeight="500">
              Num Bins
            </Text>
            <HStack gap="2px" border="1px solid" borderColor="border" borderRadius="8px" pl="8px" py="2px" pr="2px" my="12px">
              <NumericFormatInput
                value={editNumBins}
                onChange={value => {
                  if (value !== undefined && value !== null) {
                    const stringValue = value.toString()
                    setEditNumBins(stringValue)
                    // if (onNumBinsChange) {
                    //   onNumBinsChange(stringValue)
                    // }
                  }
                }}
                onBlur={onNumBinsBlur}
                decimals={0}
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
                  fontWeight: '500'
                }}
              />
              <Box h="12px" w="1px" bg="border" />
              <HStack gap="2px">
                {quickTabs.map(item => (
                  <Text
                    key={item.value}
                    fontSize="12px"
                    fontWeight="500"
                    w="48px"
                    h="32px"
                    lineHeight="32px"
                    textAlign="center"
                    cursor="pointer"
                    onClick={() => handleChangeTab(item)}
                    sx={{ ...(currentNumBins === item.value ? { color: 'text_caption', bg: 'primary_opacity.10', borderRadius: '6px' } : {}) }}
                  >
                    {item.label}
                  </Text>
                ))}
              </HStack>
            </HStack>
            {d(editNumBins.trim() || 0).gt(DLMM_MAX_BIN_NUMBER) && (
              <Center p="8px" w="100%" bg="primary_yellow_opacity.10" borderRadius="8px" mb={{ base: '12px', lg: '16px' }}>
                <Text color="primary_yellow" fontSize="12px" lineHeight="16px" fontWeight="400">
                  You have reached the maximum limit of {addComma(DLMM_MAX_BIN_NUMBER)} bins. Please adjust your price range to reduce the number of
                  bins.
                </Text>
              </Center>
            )}
            <Box>
              <Button
                w="100%"
                h="42px"
                bg="primary"
                color="#0F0F0F"
                borderRadius="8px"
                fontSize="14px"
                fontWeight="500"
                disabled={d(editNumBins.trim() || 0).gt(DLMM_MAX_BIN_NUMBER)}
                onClick={() => {
                  const numBinsValue = editNumBins.trim()
                  if (numBinsValue && /^[1-9][0-9]*$/.test(numBinsValue)) {
                    setNumBins(numBinsValue)
                    // 触发 blur 事件来更新价格范围
                    if (onNumBinsBlur) {
                      onNumBinsBlur()
                    }
                    setIsDrawerOpen(false)
                  }
                }}
                sx={{
                  _hover: {
                    bg: 'primary_hover'
                  },
                  _active: {
                    bg: 'primary_hover'
                  }
                }}
              >
                Confirm
              </Button>
            </Box>
          </VaulDrawer>

          {/* {children?.[1]} */}
        </>
      ) : (
        <>
          <Block
            flex={{ base: '0 0 32px', lg: '1' }}
            h="100%"
            border="1px solid"
            borderColor={isMinInput ? 'token_active_border' : 'border'}
            boxShadow={isMinInput ? '0px 0px 8px 0px #0067AD' : ''}
            display="flex"
            p="6px"
            borderRadius="12px"
            justifyContent="center"
            alignItems="center"
          >
            <Tooltip
              label={
                <Text fontSize="12px" lineHeight="20px">
                  Percentage Min: -99.99%
                </Text>
              }
              isOpen={showMinWarning}
              placement="top"
            >
              <NumberInput
                value={minValue}
                precision={2}
                // min={-99.99}
                inputMode="numeric"
                clampValueOnBlur
                variant="unstyled"
                format={value => (value ? addComma(value) + ' %' : '')}
                onFocus={() => {
                  setActiveInput('min')
                }}
                onBlur={e => onMinInputBlur(removeComma(e.target.value))}
                onChange={(valueString, valueNumber) => onMinInputChange(removeComma(valueString), valueNumber)}
                color={isMinInput ? 'text_caption' : 'text_paragraph'}
                w="100%"
              >
                <NumberInputField
                  fontSize="14px"
                  color="text_caption"
                  paddingInlineStart="4px"
                  paddingInlineEnd="4px"
                  textAlign="center"
                  ref={minInputRef}
                  onInput={handleMinInput}
                  onKeyDown={handleMinInput}
                  onMouseUp={handleMinInput}
                />
              </NumberInput>
            </Tooltip>
          </Block>
          <Block
            flex={{ base: '0 0 32px', lg: '1' }}
            h="100%"
            border="1px solid"
            borderColor={isMaxInput ? 'token_active_border' : 'border'}
            boxShadow={isMaxInput ? '0px 0px 6px 0px #0067AD' : ''}
            display="flex"
            p="6px"
            borderRadius="12px"
            justifyContent="center"
            alignItems="center"
          >
            <Tooltip
              label={
                <Text fontSize="12px" lineHeight="20px">
                  Percentage Min: -99.99%
                </Text>
              }
              isOpen={showMaxWarning}
              placement="top"
            >
              <NumberInput
                value={maxValue}
                precision={2}
                // min={-99.99}
                variant="unstyled"
                format={value => (value ? addComma(value) + ' %' : '')}
                clampValueOnBlur
                onFocus={() => {
                  setActiveInput('max')
                }}
                onChange={(valueString, valueNumber) => onMaxInputChange(removeComma(valueString), valueNumber)}
                onBlur={e => onMaxInputBlur(removeComma(e.target.value))}
                color={isMaxInput ? 'text_caption' : 'text_paragraph'}
                w="100%"
              >
                <NumberInputField
                  fontSize="14px"
                  color="text_caption"
                  paddingInlineStart="4px"
                  paddingInlineEnd="4px"
                  textAlign="center"
                  ref={maxInputRef}
                  onInput={handleMaxInput}
                  onKeyDown={handleMaxInput}
                  onMouseUp={handleMaxInput}
                />
              </NumberInput>
            </Tooltip>
          </Block>
        </>
      )}

      {!isApp && (
        <SelectTab<any, string>
          tabList={quickTabs}
          currentTab={currentNumBins}
          handleChangeTab={handleChangeTab}
          type="outlineTab"
          wrapStyle={{ flex: { base: '0 0 32px', lg: '0 0 160px' }, h: '32px', gap: 0, p: '3px', borderRadius: '12px' }}
          itemStyle={{
            flex: 1,
            borderRadius: '8px'
          }}
        />
      )}
    </Stack>
  )
}

export default QuickPriceRange
