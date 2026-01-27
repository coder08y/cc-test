import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Box, FormControl, FormLabel, Switch, Text } from '@chakra-ui/react'

function AutoFillSwitch({ disabled = false }: { disabled?: boolean }) {
  const { isAutoFill, setIsAutoFill } = useDlmmLiquidityStore()
  const { fromAmount, toAmount, setByAmountIn } = useAddDlmmLiquidityStore()
  const { isApp } = useWindowWidth()
  const onChange = () => {
    if (fromAmount !== '' && toAmount === '') {
      setByAmountIn(true)
    }
    if (fromAmount === '' && toAmount !== '') {
      setByAmountIn(false)
    }
    setIsAutoFill(!isAutoFill)
  }
  return (
    <Box cursor="pointer">
      {isApp ? (
        <FormControl display="flex" alignItems="center">
          <FormLabel
            htmlFor="auto-fill"
            mb="0"
            fontSize={{ base: '12px', lg: '14px' }}
            fontWeight="500"
            color={disabled ? 'text_paragraph' : isAutoFill ? 'text_highlight' : 'text_paragraph'}
          >
            <CetusTooltip
              maxW="320px"
              tooltip={
                <Text fontSize="12px" lineHeight="20px">
                  <Text fontSize="12px" as="span" color="text_caption">
                    ON:
                  </Text>{' '}
                  Enter one token amount, the other is calculated automatically.
                  <br />
                  <Text fontSize="12px" as="span" color="text_caption">
                    OFF:
                  </Text>{' '}
                  Enter custom amounts for both tokens manually.
                  <Box h="8px" />
                  <Box
                    as="div"
                    lineHeight="20px"
                    cursor="pointer"
                    _hover={{ svg: { fill: 'text_caption' } }}
                    onClick={() => window.open('https://cetus-1.gitbook.io/cetus-docs/dlmm/dynamic-fee/fee-structure#composition-fee')}
                  >
                    A composition fee may be applied during DLMM liquidity provision if the deposited token ratio into a bin differs from the bin’s
                    current ratio. <Icon xlinkHref="#icon-icon_link3" display="inline-block" fontSize="16px" verticalAlign="middle" />
                  </Box>
                </Text>
              }
            >
              Auto Fill
            </CetusTooltip>
          </FormLabel>

          <Switch id="auto-fill" isDisabled={disabled} isChecked={isAutoFill} onChange={onChange} />
        </FormControl>
      ) : (
        <CetusTooltip
          maxW="400px"
          tooltip={
            <Text fontSize="12px" lineHeight="20px">
              <Text fontSize="12px" as="span" color="text_caption">
                ON:
              </Text>{' '}
              Enter one token amount, the other is calculated automatically.
              <br />
              <Text fontSize="12px" as="span" color="text_caption">
                OFF:
              </Text>{' '}
              Enter custom amounts for both tokens manually.
              <Box h="8px" />
              <Box
                as="div"
                lineHeight="20px"
                cursor="pointer"
                _hover={{ svg: { fill: 'text_caption' } }}
                onClick={() => window.open('https://cetus-1.gitbook.io/cetus-docs/dlmm/dynamic-fee/fee-structure#composition-fee')}
              >
                A composition fee may be applied during DLMM liquidity provision if the deposited token ratio into a bin differs from the bin’s
                current ratio. <Icon xlinkHref="#icon-icon_link3" display="inline-block" fontSize="16px" verticalAlign="middle" />
              </Box>
            </Text>
          }
        >
          <FormControl display="flex" alignItems="center">
            <FormLabel
              htmlFor="auto-fill"
              mb="0"
              fontSize={{ base: '12px', lg: '14px' }}
              fontWeight="500"
              color={disabled ? 'text_paragraph' : isAutoFill ? 'text_highlight' : 'text_paragraph'}
            >
              Auto Fill
            </FormLabel>

            <Switch id="auto-fill" isDisabled={disabled} isChecked={isAutoFill} onChange={onChange} />
          </FormControl>
        </CetusTooltip>
      )}
    </Box>
  )
}

export default AutoFillSwitch
