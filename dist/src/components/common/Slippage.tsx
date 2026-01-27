import useSlippageTolerance from '@/hooks/common/useSlippageTolerance'
import useGlobalStore from '@/store/common/global'
import type { TransactionMode } from '@/types'
import { getPercentage } from '@/utils'
import { Block, CetusTooltip, SlippageSetting } from '@cetus/design'
import { type PoolType, SlippageSettingContent, type SlippageType } from '@cetus/design/src/components/common/SlippageSetting'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import type { Token } from '@cetus/types'
import { Icon, VaulDrawer } from '@cetus/ui-kit'
import { cancelBubble, d } from '@cetus/utils'
import { Box, HStack, Popover, PopoverContent, PopoverTrigger, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

type SlippageProps = {
  slippageType?: SlippageType
  poolType?: PoolType
  toolTipText?: string
  compact?: boolean
  isWidget?: boolean
  maxSlippage?: number
  showFastMode?: boolean
  isModal?: boolean
  onClick?: () => void
  tokenA?: Token
  tokenB?: Token
  showNewTolerance?: boolean
}

const SlippageButton = (commonProps: any, showSlippage: string | number) => {
  return (
    <HStack {...commonProps}>
      <Text fontWeight="500" fontSize="12px" lineHeight="18px" h="18px">
        {getPercentage(showSlippage)}
      </Text>
      <Block bg={commonProps.bg} p="0" h="28px" w="28px" borderRadius="8px" mr="-9px">
        <HStack align="center" justify="center" mt="3px">
          <Icon xlinkHref="#icon-icon_verticalslider" />
        </HStack>
      </Block>
    </HStack>
  )
}

export function Slippage(props: SlippageProps) {
  const { isModal = true, onClick, toolTipText, maxSlippage, poolType, showFastMode, tokenA, tokenB, showNewTolerance = false } = props
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
    showMevProtect,
    handleChangeMevProtect,
    customGasPrice,
    handleChangeCustomGasPrice
  } = useSlippage(props)
  const { isRegularTokenPair, slippageColor, getSlippageColor } = useSlippageTolerance(tokenA, tokenB, showSlippage, showNewTolerance, slippageType)

  const { isApp } = useWindowWidth()
  const commonProps = {
    h: '28px',
    padding: '4px 8px',
    p: {
      color: showNewTolerance ? slippageColor?.color : 'text_paragraph'
    },
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border',
    bg: isWidget ? 'swap_bg_secondary' : 'bg_secondary',
    cursor: 'pointer',
    gap: '6px',
    onClick: (e: any) => {
      cancelBubble(e)
      if (isWidget) onClick?.()
      else onSlippageVisible()
    },
    sx: {
      _hover: {
        p: showNewTolerance
          ? {
              color: slippageColor?.noTip ? 'text_caption' : slippageColor?.color
            }
          : 'text_caption',
        svg: { fill: 'text_caption' }
      }
    }
  }
  // 提取重复按钮组件

  if (isModal) {
    return (
      <>
        <CetusTooltip tooltip={<Text fontSize="12px">{toolTipText || 'Settings'}</Text>}>{SlippageButton(commonProps, showSlippage)}</CetusTooltip>

        {!isWidget && (
          <SlippageSetting
            showFastMode={showFastMode}
            maxSlippage={maxSlippage}
            isWidget={isWidget}
            compact={compact}
            isOpen={settingOpen}
            onClose={onClose}
            value={d(showSlippage).mul(100).toNumber()}
            onChange={onChange}
            slippageType={slippageType}
            poolType={poolType}
            transactionMode={transactionMode}
            onChangeTransactionMode={handleChangeTransactionMode}
            maxCapForGas={maxCapForGas}
            onChangeMaxCapForGas={handleChangeMaxCapForGas}
            mevProtect={showMevProtect}
            onChangeMevProtect={handleChangeMevProtect}
            customGasPrice={customGasPrice}
            onChangeCustomGasPrice={handleChangeCustomGasPrice}
            getSlippageColor={getSlippageColor}
          />
        )}
      </>
    )
  }
  if (isApp) {
    return (
      <>
        <HStack {...commonProps}>
          <Text fontWeight="500" fontSize="12px">
            {getPercentage(showSlippage)}
          </Text>
          <Block bg={commonProps.bg} p="0" h="28px" w="28px" borderRadius="8px" mr="-9px">
            <HStack align="center" justify="center" mt="3px">
              <Icon xlinkHref="#icon-icon_verticalslider" />
            </HStack>
          </Block>
        </HStack>
        {settingOpen && (
          <VaulDrawer isOpen={settingOpen} onClose={onClose} padding="12px 12px 24px">
            <Box transformOrigin="top right" borderRadius="12px" sx={{ button: { h: '32px' } }}>
              <SlippageSettingContent
                isOpen={true}
                onClose={onClose}
                value={d(showSlippage).mul(100).toNumber()}
                onChange={onChange}
                slippageType={slippageType}
                getSlippageColor={getSlippageColor}
                poolType={props.poolType}
                transactionMode={transactionMode}
                onChangeTransactionMode={handleChangeTransactionMode}
                maxCapForGas={maxCapForGas}
                onChangeMaxCapForGas={handleChangeMaxCapForGas}
                mevProtect={showMevProtect}
                onChangeMevProtect={handleChangeMevProtect}
                customGasPrice={customGasPrice}
                onChangeCustomGasPrice={handleChangeCustomGasPrice}
                compact={compact}
                isWidget={isWidget}
                showFastMode={props.showFastMode}
                maxSlippage={props.maxSlippage}
              />
            </Box>
          </VaulDrawer>
        )}
      </>
    )
  }

  return (
    <Popover placement="bottom-end" isLazy trigger="click">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <HStack {...commonProps}>
              <Text fontWeight="500" fontSize="12px">
                {getPercentage(showSlippage)}
              </Text>
              <Block bg={commonProps.bg} p="0" h="28px" w="28px" borderRadius="8px" mr="-9px">
                <HStack align="center" justify="center" mt="3px">
                  <Icon xlinkHref="#icon-icon_verticalslider" />
                </HStack>
              </Block>
            </HStack>
          </PopoverTrigger>
          <PopoverContent w={{ base: 'calc(100vw - 32px)', lg: '378px' }} borderRadius="12px" p="0" sx={{ bg: 'transparent', border: 'none' }}>
            <Box transform="scale(0.9)" transformOrigin="top right" p="16px" borderRadius="12px" bg="bg_secondary" sx={{ button: { h: '32px' } }}>
              <SlippageSettingContent
                isOpen={true}
                onClose={onClose}
                value={d(showSlippage).mul(100).toNumber()}
                onChange={onChange}
                slippageType={slippageType}
                getSlippageColor={getSlippageColor}
                poolType={props.poolType}
                transactionMode={transactionMode}
                onChangeTransactionMode={handleChangeTransactionMode}
                maxCapForGas={maxCapForGas}
                onChangeMaxCapForGas={handleChangeMaxCapForGas}
                mevProtect={showMevProtect}
                onChangeMevProtect={handleChangeMevProtect}
                customGasPrice={customGasPrice}
                onChangeCustomGasPrice={handleChangeCustomGasPrice}
                compact={compact}
                isWidget={isWidget}
                showFastMode={props.showFastMode}
                maxSlippage={props.maxSlippage}
              />
            </Box>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

export function useSlippage(props: SlippageProps) {
  const { slippageType = 'global', compact, poolType, isWidget = false, showFastMode = true } = props
  const {
    slippage,
    setSlippage,
    liquiditySlippage,
    setLiquiditySlippage,
    // settingOpen,
    // setSettingOpen,
    mevProtect,
    dlmmMevProtect,
    setDlmmMevProtect,
    setMevProtect,
    setTransactionMode,
    setMaxCapForGas,
    transactionMode,
    maxCapForGas,
    customGasPrice,
    setCustomGasPrice,
    deepBookSlippage,
    setDeepBookSlippage,
    crossSwapSlippage,
    setCrossSwapSlippage,
    mergeSwapSlippage,
    setMergeSwapSlippage
  } = useGlobalStore()
  const [settingOpen, setSettingOpen] = useState(false)
  const onSlippageVisible = () => {
    setSettingOpen(!settingOpen)
  }

  const onClose = () => {
    setSettingOpen(false)
  }

  const { pathname } = useLocation()

  const firstPathPart = pathname.split('/').filter(Boolean)[0]

  const onChange = (value: number) => {
    console.log('Slippage 🚀 ~ onChange ~ value:', value)
    console.log('Slippage 🚀 ~ onChange ~ slippageType:', slippageType)
    const saveSlippageValue = d(value).div(100).toNumber()
    if (slippageType === 'liquidity') {
      setLiquiditySlippage(saveSlippageValue)
    } else if (slippageType === 'deepbook') {
      setDeepBookSlippage(saveSlippageValue)
    } else if (slippageType === 'cross') {
      setCrossSwapSlippage(saveSlippageValue)
    } else if (slippageType === 'merge_swap') {
      setMergeSwapSlippage(saveSlippageValue)
    } else {
      setSlippage(saveSlippageValue)
    }
  }

  const slippageMap = {
    global: slippage,
    liquidity: liquiditySlippage,
    cross: crossSwapSlippage,
    deepbook: deepBookSlippage,
    merge_swap: mergeSwapSlippage
  }

  const showSlippage = useMemo(() => {
    return slippageMap[slippageType]
  }, [slippageType, slippage, liquiditySlippage, crossSwapSlippage, deepBookSlippage, mergeSwapSlippage])

  const showMevProtect = useMemo(() => {
    return poolType === 'dlmm' || !showFastMode ? dlmmMevProtect : mevProtect
  }, [poolType, dlmmMevProtect, mevProtect])

  const handleChangeTransactionMode = (value: TransactionMode) => {
    setTransactionMode(value)
  }

  const handleChangeMaxCapForGas = (value: string) => {
    setMaxCapForGas(value)
  }

  const handleChangeCustomGasPrice = (value: string) => {
    setCustomGasPrice(value)
  }

  const handleChangeMevProtect = (value: boolean) => {
    // 如果不打开fast mode，则存储在单独的DlmmMevProtect
    if (poolType === 'dlmm' || !showFastMode) {
      setDlmmMevProtect(value)
    } else {
      setMevProtect(value)
    }
  }

  return {
    onSlippageVisible,
    onClose,
    onChange,
    showSlippage,
    isWidget,
    compact,
    settingOpen,
    slippageType,
    transactionMode,
    handleChangeTransactionMode,
    maxCapForGas,
    handleChangeMaxCapForGas,
    showMevProtect,
    handleChangeMevProtect,
    customGasPrice,
    handleChangeCustomGasPrice
  }
}

export default Slippage
