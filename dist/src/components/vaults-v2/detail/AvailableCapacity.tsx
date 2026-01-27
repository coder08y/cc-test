import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import { formatNumber, formatPercentage, symbolDataDisplayProcessing } from '@cetus/utils'
import { HStack, Skeleton, Slider, SliderFilledTrack, SliderMark, SliderMarkProps, SliderThumb, SliderTrack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

type AvailableCapacityProps = {
  percentage: string | number
  onChange: (value: string | number) => void
  depositRatio: string | number
  hardCapUSD: string | number
  vaultTvl: string | number
  availableCapacityUSD: string | number
  quoteCoin?: Token
  maxCapNum?: string
  availableCapacityWithQuoteCoin?: string
}

// 剩余可用部分 百分比添加操作滑杆
export default function AvailableCapacity({
  percentage,
  onChange,
  quoteCoin,
  availableCapacityWithQuoteCoin,
  availableCapacityUSD
}: AvailableCapacityProps) {
  const [isDragging, setIsDragging] = useState(false)

  const loading = useMemo(() => {
    return !availableCapacityUSD
  }, [availableCapacityUSD])

  const labelStyles = {
    fontSize: 'sm',
    position: 'absolute',
    ml: '-5px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: '100',
    borderRadius: '50%'
  }

  const sliderMarkList = [0, 25, 50, 75, 100]

  const { isApp } = useWindowWidth()

  return (
    <>
      {loading ? (
        <VStack width="100%" maxHeight="164px" justifyContent="space-between">
          <Skeleton width="100%" />
          <Skeleton width="100%" />
          <Skeleton width="100%" />
        </VStack>
      ) : (
        <VStack width="100%" alignItems="start" gap="0px">
          <HStack w={{ base: '100%', lg: 'auto' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
            <Text textAlign="left" fontSize={{ base: '12px', lg: '14px' }}>
              Available Capacity
            </Text>
            {isApp && (
              <AvailableCapacityAmount
                token={quoteCoin}
                availableCapacity={availableCapacityWithQuoteCoin}
                availableCapacityUSD={availableCapacityUSD}
              />
            )}
          </HStack>

          <HStack w="100%" alignItems="center" justifyContent="space-between" mt="12px">
            {!isApp && (
              <AvailableCapacityAmount
                token={quoteCoin}
                availableCapacity={availableCapacityWithQuoteCoin}
                availableCapacityUSD={availableCapacityUSD}
              />
            )}

            <Slider
              aria-label="slider-ex-6"
              min={0}
              max={100}
              focusThumbOnChange={false}
              value={percentage == '--' ? 0 : Number(percentage)}
              onChange={value => onChange(value)}
              onChangeStart={() => setIsDragging(true)}
              onChangeEnd={() => setIsDragging(false)}
              w={{ base: '100%', lg: '210px' }}
              isDisabled={Number(availableCapacityUSD) <= 0}
            >
              {sliderMarkList
                .filter(item => item !== Number(percentage))
                .map((item, index) => (
                  <SliderMark
                    key={index}
                    {...(labelStyles as SliderMarkProps)}
                    value={item}
                    w="8px"
                    h="8px"
                    bg={Number(percentage) >= item ? 'primary' : '#384651'}
                    onClick={() => onChange(item)}
                  />
                ))}
              {isDragging && (
                <SliderMark
                  value={Number(percentage)}
                  textAlign="center"
                  bg="primary_opacity.10"
                  p="2px 4px"
                  borderRadius="4px"
                  fontSize="12px"
                  color="primary"
                  mt="-28px"
                  ml="-15px"
                >
                  {formatPercentage(percentage, 2)}
                </SliderMark>
              )}
              <SliderTrack bg="#384651" height="2px" borderRadius="4px">
                <SliderFilledTrack height="2px" bg="primary" borderRadius="2px" />
              </SliderTrack>
              <SliderThumb
                p="1px"
                w="10px"
                h="10px"
                border="1px solid primary"
                position="relative"
                zIndex="100"
                borderRadius="50%"
                _before={{
                  content: '""',
                  w: '6px',
                  h: '6px',
                  borderRadius: '50%',
                  // bg: [0, 25, 50, 75, 100].includes(Number(percentage)) ? 'primary' : 'bg_secondary',
                  border: '1px solid #2b2e32'
                }}
              />
            </Slider>
          </HStack>
          {!loading && availableCapacityUSD == 0 ? (
            <VStack w="100%" alignItems="start" mt="16px">
              <Text
                color="primary_yellow"
                fontSize="12px"
                textAlign="left"
                w="100%"
                bg="primary_yellow_opacity.10"
                p="12px"
                borderRadius="8px"
                lineHeight="20px"
              >
                The vault has reached its current capacity. New deposits are not accepted at this time.
              </Text>
            </VStack>
          ) : null}
        </VStack>
      )}
    </>
  )
}

interface AvailableCapacityAmountProps {
  token?: Token
  availableCapacity?: string
  availableCapacityUSD: string | number
}
const AvailableCapacityAmount = ({ token, availableCapacityUSD, availableCapacity }: AvailableCapacityAmountProps) => {
  return (
    <CetusTooltip
      tooltip={
        <HStack>
          <SingleCoinImage imageUrl={token?.logo_url} imgBoxStyle={{ w: '20px', h: '20px' }} imageStyle={{ w: '20px', h: '20px' }} />
          <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }}>
            {formatNumber(availableCapacity, 2)}
          </Text>
          <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }}>
            {token?.symbol}
          </Text>
        </HStack>
      }
    >
      <HStack w="100%" alignItems="center" justifyContent="space-between">
        <Text
          color="text_caption"
          height="16px"
          textAlign="left"
          fontSize={{ base: '12px', lg: '16px' }}
          textDecoration="underline dotted"
          textDecorationColor="primary_gray"
        >
          {symbolDataDisplayProcessing(availableCapacityUSD, '$')}
        </Text>
      </HStack>
    </CetusTooltip>
  )
}
