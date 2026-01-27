import BurnLockIcon from '@/components/common/BurnLockIcon'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { cancelBubble, d, formatCurrency, formatNumberWithDown } from '@cetus/utils'
import {
  Box,
  Center,
  HStack,
  HTMLChakraProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react'
import { useMemo } from 'react'
interface LiquidityValueBlockProps extends HTMLChakraProps<'div'> {
  positionInfo: PosBaseInfo
  haveTooltip?: boolean
  isPosList?: boolean
}
const LiquidityValueBlock = ({ positionInfo, haveTooltip = true, isPosList = false, ...rest }: LiquidityValueBlockProps) => {
  const { getTokenAmountValue } = useTokenPrice()
  const { posLiquidityData, posLiquidityDataLoading } = usePositionStore()

  const currentPosData = posLiquidityData[positionInfo?.posId]

  const amountValueA = getTokenAmountValue(positionInfo?.displayTokenA?.coin_type, currentPosData?.displayCoinAmountA, '--')

  const amountValueB = getTokenAmountValue(positionInfo?.displayTokenB?.coin_type, currentPosData?.displayCoinAmountB, '--')

  const amountValue = useMemo(() => {
    if (amountValueA !== '--' && amountValueB !== '--') {
      return formatCurrency(d(amountValueA).plus(amountValueB).toString(), 2)
    }
    return '$--'
  }, [amountValueA, amountValueB])

  const { isApp } = useWindowWidth()
  return (
    <HStack gap="4px">
      {positionInfo?.posType == 'burn' && <BurnLockIcon />}
      <Box p={{ base: 0, lg: '12px 0' }} onClick={e => cancelBubble(e)}>
        <Popover isLazy trigger={isApp ? 'click' : 'hover'} placement="top-start">
          <PopoverTrigger>
            <Center as="button" cursor={!haveTooltip ? 'text' : 'help'}>
              <Skeleton isLoaded={!!amountValue && !!posLiquidityData && !posLiquidityDataLoading}>
                <Text
                  color="text_caption"
                  fontSize="16px"
                  h="16px"
                  textDecoration={isPosList || !haveTooltip ? 'none' : 'underline dashed'}
                  textUnderlineOffset="3px"
                  {...rest}
                  textDecorationColor="primary_gray"
                  lineHeight="16px"
                >
                  {amountValue}
                </Text>
              </Skeleton>
            </Center>
          </PopoverTrigger>
          {haveTooltip && (
            <Portal>
              <PopoverContent zIndex="2" minW="unset" w="unset" p="4px ">
                <PopoverBody borderRadius="12px" p="8px">
                  <VStack align="flex-start" minW="200px">
                    <HStack
                      w="100%"
                      justify="space-between"
                      borderBottom="1px solid"
                      borderColor="border"
                      pb="8px"
                      sx={{
                        _last: {
                          borderBottom: 'none',
                          pb: '0px'
                        }
                      }}
                    >
                      <SingleTokenInfo
                        token={positionInfo?.displayTokenA}
                        imgBoxStyle={{ w: '20px', h: '20px' }}
                        haveName={false}
                        symbolFontSize="12px"
                        warningIcon={{ iconW: '10px', iconH: '10px' }}
                      />
                      <VStack align="flex-end" gap="4px">
                        <Text fontSize="12px" color="text_caption">
                          {formatNumberWithDown(currentPosData?.displayCoinAmountA)}
                        </Text>
                        <Text fontSize="12px">{formatCurrency(amountValueA, 2)}</Text>
                      </VStack>
                    </HStack>
                    <HStack w="100%" justify="space-between">
                      <SingleTokenInfo
                        token={positionInfo?.displayTokenB}
                        imgBoxStyle={{ w: '20px', h: '20px' }}
                        haveName={false}
                        symbolFontSize="12px"
                        warningIcon={{ iconW: '10px', iconH: '10px' }}
                      />
                      <VStack align="flex-end" gap="4px">
                        <Text fontSize="12px" color="text_caption">
                          {formatNumberWithDown(currentPosData?.displayCoinAmountB)}
                        </Text>
                        <Text fontSize="12px">{formatCurrency(amountValueB, 2)}</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          )}
        </Popover>
      </Box>
    </HStack>
  )
}

export default LiquidityValueBlock
