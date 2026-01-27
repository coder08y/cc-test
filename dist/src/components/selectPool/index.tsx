import { isTrustedToken } from '@/utils'
import { ErrorTips } from '@cetus/design'
import { Token } from '@cetus/types'
import { Button, Heading, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLMMSelectFee } from './CLMMSelectFee'
import { DLMMSelectFeeAndBinStep } from './DLMMSelectFeeAndBinStep'
import { SelectToken } from './SelectToken'
import { SelectPoolProps } from './type'

function SelectPool({
  poolType,
  baseToken,
  quoteToken,
  onBaseTokenChange,
  onQuoteTokenChange,
  title,
  description,
  onContinue,
  quoteWhiteTokenList,
  fromSource,
  wrapStyle = {},
  feeTier,
  feeTierList,
  onFeeTierChange,
  baseFee,
  onBaseFeeChange,
  binStep,
  binStepList,
  onBinStepChange,
  getBinStepListLoading,
  children,
  disabled
}: SelectPoolProps) {
  const navigate = useNavigate()

  const handleBaseTokenChange = (token: Token) => {
    if (token?.coin_type === quoteToken?.coin_type) {
      onQuoteTokenChange(undefined)
    }
    onBaseTokenChange(token)
  }
  const handleQuoteTokenChange = (token: Token) => {
    if (token?.coin_type === baseToken?.coin_type) {
      onBaseTokenChange(undefined)
    }
    onQuoteTokenChange(token)
  }

  const showTokenWarn = useMemo(() => {
    return baseToken && quoteToken && !isTrustedToken(baseToken, quoteWhiteTokenList) && !isTrustedToken(quoteToken, quoteWhiteTokenList)
  }, [baseToken?.coin_type, quoteToken?.coin_type, quoteWhiteTokenList])
  const getDisabled = () => {
    if (poolType === 'clmm') {
      return !baseToken || !quoteToken || !feeTier || feeTier?.disabled || showTokenWarn
    } else {
      return !baseToken || !quoteToken || !binStep || showTokenWarn
    }
  }

  return (
    <VStack w="100%" gap={{ base: '16px', lg: '28px' }} bg="bg_fifth" borderRadius="12px" p={{ base: '16px 8px', lg: '24px' }} {...wrapStyle}>
      <VStack gap="8px" w="100%" align="flex-start">
        <Heading fontSize="16px" fontWeight="500">
          {title}
        </Heading>
        <Text fontSize="12px" fontWeight="500">
          {description}
        </Text>
      </VStack>
      <VStack w="100%" gap={{ base: '16px', lg: '32px' }}>
        <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap="12px" justify="space-between">
          <SelectToken
            title="Base token"
            value={baseToken}
            isWhiteSelect={false}
            whiteTokenList={undefined}
            onChange={handleBaseTokenChange}
            fromSource={fromSource}
          />
          <SelectToken
            title="Quote token"
            value={quoteToken}
            isWhiteSelect={true}
            whiteTokenList={quoteWhiteTokenList}
            onChange={handleQuoteTokenChange}
            fromSource={fromSource}
          />
        </Stack>
        {children}
        {poolType === 'clmm' && (
          <CLMMSelectFee fromSource={fromSource} feeTier={feeTier} feeTierList={feeTierList!} onFeeTierChange={onFeeTierChange!}>
            {showTokenWarn && (
              <ErrorTips
                isShowIcon={false}
                p="6px 16px"
                w="100%"
                borderRadius="8px"
                tipsLineHeight="16px"
                tipsFontSize="12px"
                tips="To create a pool, one of the assets needs to be selected as the default token."
              />
            )}
          </CLMMSelectFee>
        )}
        {poolType === 'dlmm' && (
          <DLMMSelectFeeAndBinStep
            fromSource={fromSource}
            binStep={binStep!}
            binStepList={binStepList!}
            baseFee={baseFee}
            onBaseFeeChange={onBaseFeeChange}
            onBinStepChange={onBinStepChange!}
            getBinStepListLoading={getBinStepListLoading}
          >
            {showTokenWarn && (
              <ErrorTips
                isShowIcon={false}
                p="6px 16px"
                w="100%"
                borderRadius="8px"
                tipsLineHeight="16px"
                tipsFontSize="12px"
                tips="To create a pool, one of the assets needs to be selected as the default token."
              />
            )}
          </DLMMSelectFeeAndBinStep>
        )}
        <Button w="100%" borderRadius="12px" h="48px" isDisabled={getDisabled() || disabled} onClick={onContinue}>
          Continue
        </Button>
      </VStack>
    </VStack>
  )
}

export default SelectPool
