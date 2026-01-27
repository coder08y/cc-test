import { useSlippage } from '@/components/common/Slippage'
import useSlippageTolerance from '@/hooks/common/useSlippageTolerance'
import { SlippageSettingContent } from '@cetus/design'
import { Token } from '@cetus/types'
import { d } from '@cetus/utils'
import { Box, VStack } from '@chakra-ui/react'
import SwapWidgetBack from './SwapWidgetBack'

type SlippageProps = {
  onCloseModal: () => void
  slippageType?: 'global'
  compact?: boolean
  isWidget?: boolean
  tokenA?: Token
  tokenB?: Token
}

export default function SwapWidgetSlippageSetting(props: SlippageProps) {
  const { onCloseModal, tokenA, tokenB } = props
  const {
    onSlippageVisible,
    showSlippage,
    isWidget,
    compact,
    settingOpen,
    onClose,
    onChange,
    slippageType,
    transactionMode,
    handleChangeTransactionMode,
    maxCapForGas,
    handleChangeMaxCapForGas,
    customGasPrice,
    handleChangeCustomGasPrice,
    showMevProtect,
    handleChangeMevProtect
  } = useSlippage(props)

  const { getSlippageColor } = useSlippageTolerance(tokenA, tokenB, showSlippage, true)

  return (
    <VStack w="100%" gap="12px" pb="16px">
      <SwapWidgetBack title="Settings" onBackClick={onCloseModal} />
      <Box p="0px 16px">
        <Box borderRadius="12px" bg="swap_bg_secondary" p="16px 12px">
          <SlippageSettingContent
            isWidget={isWidget}
            compact={compact}
            isOpen={settingOpen}
            onClose={onCloseModal}
            value={d(showSlippage).mul(100).toNumber()}
            onChange={onChange}
            slippageType={slippageType}
            transactionMode={transactionMode}
            onChangeTransactionMode={handleChangeTransactionMode}
            maxCapForGas={maxCapForGas}
            onChangeMaxCapForGas={handleChangeMaxCapForGas}
            mevProtect={showMevProtect}
            onChangeMevProtect={handleChangeMevProtect}
            customGasPrice={customGasPrice}
            onChangeCustomGasPrice={handleChangeCustomGasPrice}
            showNewTolerance
            getSlippageColor={getSlippageColor}
          />
        </Box>
      </Box>
    </VStack>
  )
}
