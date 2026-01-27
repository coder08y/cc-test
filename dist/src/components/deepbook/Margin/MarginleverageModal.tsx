import useDeepBookStore from '@/store/deepbook'
import useDeepBookMarginStore from '@/store/deepbook/margin'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage, Icon, VaulDrawer } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LeverageTag } from './LeverageTag'

export default function MarginLeverageModal() {
  const { marginLeverageModalOpen, setMarginLeverageModalOpen, setMarginLeverageRatio } = useDeepBookMarginStore()
  const { currentDeepBookPool } = useDeepBookStore()
  const { isApp } = useWindowWidth()
  const poolAddress = currentDeepBookPool?.address || ''

  const maxLeverage = currentDeepBookPool?.marginRate ? currentDeepBookPool?.marginRate : 2
  const minLeverage = 1.1

  // 杠杆标记点：1.1x, 2x, 3x, 4x, 5x (或 maxLeverage)
  const leverageMarks = useMemo(() => {
    const marks = [1.1]
    if (Number(maxLeverage) >= 2) marks.push(2)
    if (Number(maxLeverage) >= 3) marks.push(3)
    if (Number(maxLeverage) >= 4) marks.push(4)
    if (Number(maxLeverage) >= 5) marks.push(5)
    // 如果 maxLeverage 不在标记点中，添加它
    if (!marks.includes(Number(maxLeverage)) && Number(maxLeverage) > 5) {
      marks.push(Number(maxLeverage))
    }
    return marks.sort((a, b) => a - b)
  }, [maxLeverage])

  // 将杠杆值转换为 slider 的百分比 (0-100)
  const leverageToSliderValue = useCallback(
    (leverage: number) => {
      return ((leverage - minLeverage) / (Number(maxLeverage) - minLeverage)) * 100
    },
    [minLeverage, maxLeverage]
  )

  // 将 slider 百分比转换为杠杆值
  const sliderValueToLeverage = useCallback(
    (value: number) => {
      return minLeverage + (value / 100) * (Number(maxLeverage) - minLeverage)
    },
    [minLeverage, maxLeverage]
  )

  // 使用 selector 订阅杠杆率变化，确保组件能响应 store 更新
  const marginLeverageRatio = useDeepBookMarginStore(state => (poolAddress ? state.marginLeverageRatioByPool[poolAddress] || '1.1' : '1.1'))
  const currentLeverage = useMemo(() => {
    return d(marginLeverageRatio || '1.1').toNumber()
  }, [marginLeverageRatio])

  const [inputLeverage, setInputLeverage] = useState(currentLeverage.toString())
  const [slideValue, setSlideValue] = useState(leverageToSliderValue(currentLeverage))
  const [isDragging, setIsDragging] = useState(false)

  // 当 modal 打开时，同步输入值和滑块值
  useEffect(() => {
    if (marginLeverageModalOpen) {
      const leverage = currentLeverage
      setInputLeverage(leverage.toFixed(1))
      setSlideValue(leverageToSliderValue(leverage))
    }
  }, [marginLeverageModalOpen, currentLeverage, leverageToSliderValue])

  const handleSliderChange = useCallback(
    (value: number) => {
      setSlideValue(value)
      const leverage = sliderValueToLeverage(value)
      setInputLeverage(leverage.toFixed(1))
    },
    [sliderValueToLeverage]
  )

  const handleSliderChangeStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleSliderChangeEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMarkClick = useCallback(
    (leverage: number) => {
      const sliderValue = leverageToSliderValue(leverage)
      setSlideValue(sliderValue)
      setInputLeverage(leverage.toFixed(1))
    },
    [leverageToSliderValue]
  )

  // const handleInputChange = useCallback(
  //   (value: string) => {
  //     setInputLeverage(value)
  //     const numValue = d(value || '0').toNumber()
  //     if (numValue >= minLeverage && numValue <= Number(maxLeverage)) {
  //       setSlideValue(leverageToSliderValue(numValue))
  //     }
  //   },
  //   [minLeverage, maxLeverage, leverageToSliderValue]
  // )

  const handleDecrement = useCallback(() => {
    const current = d(inputLeverage || currentLeverage.toString()).toNumber()
    const newValue = Math.max(minLeverage, current - 0.1)
    const formatted = newValue.toFixed(1)
    setInputLeverage(formatted)
    setSlideValue(leverageToSliderValue(newValue))
  }, [inputLeverage, currentLeverage, minLeverage, leverageToSliderValue])

  const handleIncrement = useCallback(() => {
    const current = d(inputLeverage || currentLeverage.toString()).toNumber()
    const newValue = Math.min(Number(maxLeverage), current + 0.1)
    const formatted = newValue.toFixed(1)
    setInputLeverage(formatted)
    setSlideValue(leverageToSliderValue(newValue))
  }, [inputLeverage, currentLeverage, maxLeverage, leverageToSliderValue])

  const handleSave = useCallback(() => {
    const leverage = d(inputLeverage || '1.1').toNumber()
    const clampedLeverage = Math.max(minLeverage, Math.min(Number(maxLeverage), leverage))
    if (poolAddress) {
      setMarginLeverageRatio(poolAddress, clampedLeverage.toFixed(1))
    }
    setMarginLeverageModalOpen(false)
  }, [inputLeverage, minLeverage, maxLeverage, poolAddress, setMarginLeverageRatio, setMarginLeverageModalOpen])

  const handleCancel = useCallback(() => {
    setMarginLeverageModalOpen(false)
    // 恢复原始值
    setInputLeverage(currentLeverage.toFixed(1))
    setSlideValue(leverageToSliderValue(currentLeverage))
  }, [setMarginLeverageModalOpen, currentLeverage, leverageToSliderValue])

  const handleClose = useCallback(() => {
    handleCancel()
  }, [handleCancel])

  // 公共内容部分
  const renderContent = () => (
    <VStack gap="16px" alignItems="flex-start" w="100%">
      <HStack w="100%" justifyContent="space-between" alignItems="center">
        <HStack gap="0px" alignItems="center">
          <CoinPairImage
            coinACoinType={currentDeepBookPool?.baseAssets?.coin_type}
            coinBCoinType={currentDeepBookPool?.quoteAssets?.coin_type}
            coinAIconUrl={currentDeepBookPool?.baseAssets?.icon_url}
            coinBIconUrl={currentDeepBookPool?.quoteAssets?.icon_url}
            w="24px"
            h="24px"
          />
          <Text fontSize="16px" ml="8px" mr="4px" fontWeight="500" color="text_caption">
            {currentDeepBookPool?.baseAssets?.symbol}-{currentDeepBookPool?.quoteAssets?.symbol}
          </Text>
          {Number(maxLeverage) && <LeverageTag leverage={Number(maxLeverage)} />}
        </HStack>
        {/* <HStack gap="4px">
          <SideBadge side={tradeType === DeepBookPoolMarginTabs.Long ? 'Long' : 'Short'} />
        </HStack> */}
      </HStack>

      {/* Leverage Input */}
      <VStack w="100%" gap="8px" alignItems="flex-start">
        <Text fontSize="12px">Leverage</Text>
        <HStack w="100%" alignItems="center" h="40px" bg="bg_secondary" border="1px solid" borderColor="border" borderRadius="8px" gap="0px">
          <Button
            variant="outline"
            size="sm"
            minW="40px"
            h="40px"
            p="0"
            onClick={handleDecrement}
            disabled={d(inputLeverage || '1.1').lte(minLeverage)}
            border="none"
            bg="transparent"
            _hover={{
              bg: 'transparent'
            }}
            _disabled={{
              opacity: 0.5,
              cursor: 'not-allowed'
            }}
          >
            <Icon fontSize="14px" svgFill="text_caption" xlinkHref="#icon-tx_remove" />
          </Button>
          <HStack flex="1" justifyContent="center">
            <Text fontSize="14px" lineHeight="24px" color="text_caption">
              {inputLeverage}x
            </Text>
          </HStack>
          <Button
            variant="outline"
            size="sm"
            minW="40px"
            h="40px"
            p="0"
            onClick={handleIncrement}
            disabled={d(inputLeverage || '1.1').gte(maxLeverage)}
            border="none"
            bg="transparent"
            _hover={{
              bg: 'transparent'
            }}
            _disabled={{
              opacity: 0.5,
              cursor: 'not-allowed'
            }}
          >
            <Icon fontSize="20px" svgFill="text_caption" xlinkHref="#icon-icon_add" />
          </Button>
        </HStack>

        {/* Slider */}
        <Box p="0 8px 0 4px" w="100%" position="relative">
          <Slider
            aria-label="leverage-slider"
            min={0}
            max={100}
            step={0.1}
            focusThumbOnChange={false}
            value={slideValue}
            onChange={handleSliderChange}
            onChangeStart={handleSliderChangeStart}
            onChangeEnd={handleSliderChangeEnd}
          >
            {leverageMarks.map((leverage, index) => {
              const markValue = leverageToSliderValue(leverage)
              return (
                <SliderMark
                  key={`mark-${index}`}
                  value={markValue}
                  ml="-1.5px"
                  mt="-4px"
                  w="8px"
                  h="8px"
                  zIndex="100"
                  borderRadius="50%"
                  bg={slideValue >= markValue && slideValue > 0 ? 'primary' : '#0F0F0F'}
                  border={slideValue >= markValue && slideValue > 0 ? '1px solid primary' : '1px solid #2A3238'}
                  cursor="pointer"
                  transition="all 0.2s"
                  onClick={() => handleMarkClick(leverage)}
                />
              )
            })}
            <SliderTrack h="2px" bg="#23252C">
              <SliderFilledTrack h="2px" bg="primary" />
            </SliderTrack>
            {isDragging && (
              <SliderMark
                value={slideValue}
                textAlign="center"
                bg="#0F0F0F"
                border="1px solid #2A3238"
                p="4px 6px"
                borderRadius="4px"
                fontSize="12px"
                color="primary"
                mt="-32px"
                ml="-18px"
                zIndex="1000001"
              >
                {d(sliderValueToLeverage(slideValue).toFixed(1)).toString()}x
              </SliderMark>
            )}
            {leverageMarks.map((leverage, index) => {
              const markValue = leverageToSliderValue(leverage)
              return (
                <SliderMark
                  key={`label-${index}`}
                  value={markValue}
                  pt="12px"
                  ml="0"
                  color="text_paragraph"
                  fontSize="12px"
                  transform="translateX(-35%)"
                >
                  {leverage}x
                </SliderMark>
              )
            })}
            <SliderThumb
              w="12px"
              h="12px"
              bg="primary"
              border="0"
              ml="2px"
              zIndex="101"
              sx={{ '&:before': { w: '8px', h: '8px', ml: '-4px', mt: '-4px' } }}
            />
          </Slider>
        </Box>
      </VStack>

      {/* Info Text */}
      <VStack w="100%" gap="8px" alignItems="flex-start" mt="12px">
        <Text fontSize="12px" lineHeight="16px">
          • Higher leverage allows you to open larger orders with your collateral, but it also increases the liquidation risk
        </Text>
        <Text fontSize="12px" lineHeight="16px">
          • The maximum leverage is {maxLeverage}x. Actual leverage may vary based on execution price and position changes, and may fall below the
          leverage you selected
        </Text>
      </VStack>
    </VStack>
  )

  // 公共按钮部分
  const renderFooter = () => (
    <HStack w="100%" gap="8px" pt={isApp ? '16px' : '0px'}>
      <Button
        variant="outline"
        flex="1"
        onClick={handleCancel}
        borderColor="border"
        color="text_caption"
        _hover={{
          borderColor: '0',
          bg: 'transparent'
        }}
        fontSize="14px"
        fontWeight="500"
        borderRadius="8px"
      >
        Cancel
      </Button>
      <Button
        flex="1"
        h="40px"
        borderRadius="8px"
        fontSize="14px"
        fontWeight="500"
        onClick={handleSave}
        bg="primary"
        color="bg_secondary"
        _hover={{ bg: 'primary_hover' }}
      >
        Save
      </Button>
    </HStack>
  )

  // 移动端使用抽屉
  if (isApp) {
    return (
      <VaulDrawer
        isOpen={marginLeverageModalOpen}
        onClose={handleClose}
        placement="bottom"
        padding="16px"
        wrapStyle={{
          bg: 'bg_secondary'
        }}
      >
        <VStack gap="16px" w="100%">
          <HStack w="100%" alignItems="center" gap="4px">
            <Icon xlinkHref="#icon-detail" fontSize="18px" transform={'rotate(180deg)'} color="text_caption" onClick={handleClose} />
            <Text fontSize="16px" color="text_caption" fontWeight="500">
              Adjust Leverage
            </Text>
          </HStack>
          {renderContent()}
          {renderFooter()}
        </VStack>
      </VaulDrawer>
    )
  }

  // 桌面端使用 Modal
  return (
    <Modal isOpen={marginLeverageModalOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="448px" w="90%" borderRadius="16px">
        <ModalHeader
          sx={{
            p: '16px 16px 0'
          }}
        >
          <Text fontSize="16px" color="text_caption" fontWeight="500">
            Adjust Leverage
          </Text>
        </ModalHeader>
        <ModalCloseButton h="28px" />
        <ModalBody p="16px">{renderContent()}</ModalBody>
        <ModalFooter p="16px" pt="0px !important" gap="8px">
          {renderFooter()}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
