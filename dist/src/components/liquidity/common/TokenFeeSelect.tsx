import { ClmmSelectFeeType, DlmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { Box, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useCallback } from 'react'
import ClmmTokenFeeDrawer from '../clmm/ClmmTokenFeeDrawer'
import DlmmTokenFeeDrawer from '../dlmm/DlmmTokenFeeDrawer'

type PoolType = 'clmm' | 'dlmm'

interface TokenFeeSelectProps {
  poolType?: PoolType
  baseToken?: Token
  quoteToken?: Token
  onBothTokensChange?: (baseToken: Token, quoteToken: Token) => void
  // CLMM props
  currentFeeTier?: ClmmSelectFeeType
  feeTierList?: ClmmSelectFeeType[]
  onFeeTierChange?: (fee: ClmmSelectFeeType) => void
  onConfirm?: (baseToken: Token, quoteToken: Token, feeTier: ClmmSelectFeeType) => void
  // DLMM props
  baseFee?: Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'>
  binStep?: any
  binStepList?: any[]
  onBaseFeeChange?: (value: Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'>) => void
  onBinStepChange?: (item: any, hasEffect: boolean) => void
  onDlmmConfirm?: (baseToken: Token, quoteToken: Token, baseFee: Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'>, binStep?: any) => void
  feeOptions?: DlmmSelectFeeType[]
  changeBinStepLoading?: boolean
  // Common props
  loading?: boolean
  disabled?: boolean
  isShowSelect?: boolean
  whiteTokenList?: Token[]
  isTokenAndFeeLoading?: boolean
  apiPoolInfoLoading?: boolean
}

export default function TokenFeeSelect({
  poolType = 'clmm',
  baseToken,
  quoteToken,
  onBothTokensChange,
  // CLMM props
  currentFeeTier,
  feeTierList,
  onFeeTierChange,
  onConfirm,
  // DLMM props
  baseFee,
  binStep,
  binStepList,
  onBaseFeeChange,
  onBinStepChange,
  onDlmmConfirm,
  feeOptions,
  changeBinStepLoading,
  // Common props
  loading,
  disabled,
  isShowSelect,
  whiteTokenList,
  isTokenAndFeeLoading,
  apiPoolInfoLoading
}: TokenFeeSelectProps) {
  const { isApp } = useWindowWidth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  if (!isApp) {
    // 桌面端保持原有逻辑，这里不处理
    return null
  }

  // 截断Token名称，超过8个字符显示省略号
  const truncateTokenSymbol = (symbol?: string) => {
    if (!symbol) return ''
    return symbol.length > 8 ? `${symbol.slice(0, 8)}...` : symbol
  }

  // 渲染 fee 显示内容
  const renderFeeDisplay = useCallback(() => {
    if (poolType === 'clmm') {
      if (currentFeeTier) {
        return (
          <HStack gap="2px">
            <Text color="primary" fontSize="12px" fontWeight="500">
              {currentFeeTier?.feeDisplay || '--%'}
            </Text>
          </HStack>
        )
      }
      return (
        <Text color="primary" fontSize="14px" fontWeight="500">
          Select fee
        </Text>
      )
    } else {
      // DLMM
      if (baseFee && binStep) {
        return (
          <HStack gap="2px">
            <Text color="primary" fontSize="12px" fontWeight="500">
              {baseFee?.feeDisplay || '--%'}
            </Text>
            <Box w="1px" h="6px" bg="primary" opacity="0.3" />
            <Text color="primary" fontSize="12px">
              {binStep?.binStep || '--'} bps
            </Text>
          </HStack>
        )
      } else if (baseFee) {
        return (
          <Text color="primary" fontSize="12px" fontWeight="500">
            {baseFee?.feeDisplay || '--%'}
          </Text>
        )
      }
      return (
        <Text color="primary" fontSize="14px" fontWeight="500">
          Select fee
        </Text>
      )
    }
  }, [poolType, baseFee, binStep, currentFeeTier?.feeDisplay])

  return (
    <>
      <VStack w="100%" gap="12px" align="flex-start" flex="1.5">
        {/* Base和Quote选择按钮 */}
        <HStack w="100%" gap="4px" onClick={onOpen}>
          {/* Base按钮 */}
          <HStack gap="0px">
            <SingleCoinImage
              showTagWidth="14px"
              showTagHeight="14px"
              imageUrl={baseToken?.logo_url}
              w="26px"
              h="26px"
              coinType={baseToken?.coin_type}
            />
            <SingleCoinImage
              showTagWidth="14px"
              showTagHeight="14px"
              imageUrl={quoteToken?.logo_url}
              w="26px"
              h="26px"
              coinType={quoteToken?.coin_type}
            />
          </HStack>
          <VStack align="flex-start" gap="4px">
            <Text fontSize="14px" fontWeight="500" color="text_caption">
              {truncateTokenSymbol(baseToken?.symbol)}-{truncateTokenSymbol(quoteToken?.symbol)}
            </Text>
            <Box>{renderFeeDisplay()}</Box>
          </VStack>
          <Icon xlinkHref="#icon-icon_arrow" fontSize="12px" />
        </HStack>
      </VStack>
      {/* Drawer */}
      {poolType === 'clmm' ? (
        <ClmmTokenFeeDrawer
          isOpen={isOpen}
          onClose={onClose}
          baseToken={baseToken}
          quoteToken={quoteToken}
          currentFeeTier={currentFeeTier}
          onConfirm={onConfirm!}
          whiteTokenList={whiteTokenList}
          isShowSelect={isShowSelect}
          loading={isTokenAndFeeLoading || apiPoolInfoLoading}
        />
      ) : (
        <DlmmTokenFeeDrawer
          isOpen={isOpen}
          onClose={onClose}
          baseToken={baseToken}
          quoteToken={quoteToken}
          baseFee={baseFee}
          binStep={binStep}
          onDlmmConfirm={onDlmmConfirm!}
          whiteTokenList={whiteTokenList}
          isShowSelect={isShowSelect}
          loading={isTokenAndFeeLoading || apiPoolInfoLoading}
        />
      )}
    </>
  )
}
