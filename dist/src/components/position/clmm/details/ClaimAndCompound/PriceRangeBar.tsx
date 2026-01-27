import { formatNumberWithKMB } from '@cetus/utils'
import { removeComma } from '@cetus/utils/src/common'
import { d } from '@cetusprotocol/common-sdk'
import { Box, BoxProps, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  minPrice: string
  maxPrice: string
  currPrice: string
  isActive: boolean
  wrapStyle?: BoxProps
  isShowActive?: boolean
  priceDirect?: boolean
  showRatio?: boolean
  infinityW?: string
  commonH?: string
  commonW?: string
  moveLength?: string
}

export default function PriceRangeBar({
  infinityW = '88px',
  commonW = '56px',
  commonH = '6px',
  moveLength = '6px',
  showRatio = false,
  minPrice,
  maxPrice,
  currPrice,
  isActive,
  wrapStyle,
  isShowActive = false,
  priceDirect = true
}: Props) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [elementWidth, setElementWidth] = useState(0)

  // ⛳ 自动计算宽度
  useEffect(() => {
    const updateWidth = () => {
      if (elementRef.current) setElementWidth(elementRef.current.offsetWidth)
    }
    const observer = new ResizeObserver(updateWidth)
    if (elementRef.current) observer.observe(elementRef.current)
    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current)
    }
  }, [minPrice, maxPrice, currPrice])

  // --- 通用工具 ---
  const safeRemoveComma = (v: string) => (v && v !== '∞' ? removeComma(v) : v)

  // --- 显示价格 ---
  const displayMinPrice = useMemo(() => {
    if (!minPrice || !maxPrice) return ''
    return priceDirect ? safeRemoveComma(minPrice) : maxPrice === '∞' ? '∞' : d(1).div(safeRemoveComma(maxPrice)).toString()
  }, [priceDirect, minPrice, maxPrice])

  const displayMaxPrice = useMemo(() => {
    if (!minPrice || !maxPrice) return ''
    return priceDirect ? safeRemoveComma(maxPrice) : d(1).div(safeRemoveComma(minPrice)).toString()
  }, [priceDirect, minPrice, maxPrice])

  const displayCurrPrice = useMemo(() => {
    if (!currPrice) return ''
    return priceDirect ? safeRemoveComma(currPrice) : d(1).div(safeRemoveComma(currPrice)).toString()
  }, [currPrice, priceDirect])

  // --- 百分比计算 ---
  const calcRatio = (target: string, current: string) => {
    if (!target || !current) return ''
    return formatNumberWithKMB(d(target).sub(current).div(current).mul(100).toString(), 2, true) + '%'
  }

  const displayMinPriceRatio = useMemo(() => {
    if (!maxPrice || !minPrice || !currPrice) return ''
    if (maxPrice === '∞' || minPrice == '0') return '0'
    const min = priceDirect ? safeRemoveComma(minPrice) : d(1).div(safeRemoveComma(maxPrice)).toString()
    const current = priceDirect ? safeRemoveComma(currPrice) : d(1).div(safeRemoveComma(currPrice)).toString()
    return calcRatio(min, current)
  }, [priceDirect, minPrice, maxPrice, currPrice])

  const displayMaxPriceRatio = useMemo(() => {
    if (!maxPrice || !minPrice || !currPrice) return ''
    if (maxPrice === '∞' || minPrice == '0') return '∞'
    const max = priceDirect ? safeRemoveComma(maxPrice) : d(1).div(safeRemoveComma(minPrice)).toString()
    const current = priceDirect ? safeRemoveComma(currPrice) : d(1).div(safeRemoveComma(currPrice)).toString()
    return calcRatio(max, current)
  }, [priceDirect, minPrice, maxPrice, currPrice])

  // --- 滑块位置计算 ---
  const sliderML = useMemo(() => {
    if (displayMaxPrice === '∞' || displayMinPrice === '∞') return '0px'
    if (displayCurrPrice && displayMinPrice && displayMaxPrice && elementWidth) {
      const curr = d(displayCurrPrice)
      const min = d(displayMinPrice)
      const max = d(displayMaxPrice)

      if (curr.gte(min) && curr.lte(max)) {
        const ratio = curr.sub(min).div(max.sub(min))
        return `${ratio.mul(elementWidth).toFixed(0)}px`
      }
      if (curr.lt(min)) return `-${moveLength}`
      if (curr.gt(max)) return `calc(100% + ${moveLength})`
    }
    return '0px'
  }, [displayCurrPrice, displayMinPrice, displayMaxPrice, elementWidth])

  // --- 中心偏移 ---
  const lengthLeft = useMemo(() => `calc((${infinityW} - ${commonW}) / 2)`, [infinityW, commonW])

  return (
    <VStack w={isShowActive ? 'unset' : infinityW} h="100%" justifyContent="space-between" {...wrapStyle}>
      <Skeleton w={infinityW} h={commonH} isLoaded={!!currPrice} borderRadius="4px">
        <Box
          w={infinityW}
          h={commonH}
          bgImage={maxPrice === '∞' ? 'none' : "url('/images/img_inactive_bg.png')"}
          bgSize={`${infinityW} ${commonH}`}
          {...wrapStyle}
        >
          <Box
            ref={elementRef}
            w={maxPrice === '∞' ? infinityW : commonW}
            h={maxPrice === '∞' ? '4px' : commonH}
            position="relative"
            background={maxPrice === '∞' ? 'linear-gradient(135deg, #68FFD8 0%, #0091FF 100%)' : isActive ? "url('/images/img_range.png')" : 'none'}
            ml={maxPrice === '∞' ? '0px' : lengthLeft}
            bgSize={`100% ${commonH}`}
            bgPosition="center"
            bgRepeat="no-repeat"
          >
            {/* ✅ 居中对齐的 ratio 文本 */}
            {showRatio && (
              <Text
                color="text_caption"
                position="absolute"
                top="-32px"
                left="0"
                transform={displayMinPriceRatio == '0' ? '0' : 'translateX(-50%)'} // 让文本以自身宽度为基准居中
                whiteSpace="nowrap"
              >
                {displayMinPriceRatio}
              </Text>
            )}
            {showRatio && (
              <Text
                color="text_caption"
                position="absolute"
                top="-32px"
                right="0"
                transform={displayMaxPriceRatio == '∞' ? '0' : 'translateX(50%)'} // 同理右侧文本居中
                whiteSpace="nowrap"
              >
                {displayMaxPriceRatio}
              </Text>
            )}

            {maxPrice !== '∞' && (
              <Box
                w="3px"
                h="12px"
                bg="#fff"
                borderRadius="8px"
                position="absolute"
                top="50%"
                left={sliderML}
                transform="translateY(-50%)"
                zIndex="5"
              />
            )}
          </Box>
        </Box>
      </Skeleton>

      {isShowActive && (
        <Text fontSize="12px" color={isActive ? 'primary' : 'primary_gray'} fontWeight="500">
          {isActive ? 'Active' : 'Inactive'}
        </Text>
      )}
    </VStack>
  )
}
