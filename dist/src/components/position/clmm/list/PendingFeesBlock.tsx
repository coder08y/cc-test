import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { cancelBubble, d, formatCurrency, formatNumber } from '@cetus/utils'
import { Box, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

const PendingFeesBlock = ({ positionInfo, onFeesChange }: { positionInfo: PosBaseInfo; onFeesChange: (value: any) => void }) => {
  const [isShowInfo, setIsShowInfo] = useState(false)

  const { getTokenAmountValue } = useTokenPrice()
  const { posFeeData, posFeeDataLoading } = usePositionStore()

  const currentPosData = posFeeData[positionInfo?.posId]

  const amountValueA = getTokenAmountValue(positionInfo?.displayTokenA?.coin_type, currentPosData?.displayFeeOwedA, '--')
  const amountValueB = getTokenAmountValue(positionInfo?.displayTokenB?.coin_type, currentPosData?.displayFeeOwedB, '--')

  const amountValue = useMemo(() => {
    if (amountValueA !== '--' && amountValueB !== '--') {
      return formatCurrency(d(amountValueA).plus(amountValueB).toString(), 2)
    }
    return '$--'
  }, [amountValueA, amountValueB])

  const { isApp } = useWindowWidth()
  useEffect(() => {
    onFeesChange?.(amountValue) // 调用回调将数据传回父组件
  }, [amountValue])

  const onMouseEnter = Number(amountValueA) == 0 && Number(amountValueB) == 0 ? () => {} : () => setIsShowInfo(true)
  const onMouseLeave = () => setIsShowInfo(false)
  return (
    <VStack
      w={{ base: 'unset', lg: 'unset' }}
      justify={{ base: 'space-between', lg: 'unset' }}
      align="flex-end"
      flexDirection={{ base: 'row', lg: 'column' }}
    >
      <PendingFees
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        positionInfo={positionInfo}
        amountValueA={amountValueA}
        amountValueB={amountValueB}
        amountValue={amountValue}
        isShowInfo={isShowInfo}
        currentPosData={currentPosData}
      />
    </VStack>
  )
}

type PendingFeesProps = {
  onMouseEnter: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave: React.MouseEventHandler<HTMLDivElement>
  positionInfo: PosBaseInfo
  amountValueA: string
  amountValueB: string
  amountValue: string
  isShowInfo: boolean
  currentPosData: any
}
const PendingFees = ({
  onMouseEnter,
  onMouseLeave,
  positionInfo,
  amountValueA,
  amountValueB,
  amountValue,
  currentPosData,
  isShowInfo
}: PendingFeesProps) => {
  const { isApp } = useWindowWidth()
  return (
    <Box p="12px 0" onClick={e => cancelBubble(e)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Popover isLazy trigger={isApp ? 'click' : 'hover'} placement="top-start">
        <PopoverTrigger>
          <Center as="button" cursor={Number(amountValueA) == 0 && Number(amountValueB) == 0 ? 'default' : 'help'}>
            <Skeleton isLoaded={!!amountValue}>
              <Text
                color="text_caption"
                // textDecoration={Number(amountValueA) == 0 && Number(amountValueB) == 0 ? 'none' : 'underline dotted'}
                // textUnderlineOffset="3px"
                borderColor="text_caption"
              >
                {amountValue}
              </Text>
            </Skeleton>
          </Center>
        </PopoverTrigger>
        {isShowInfo && amountValue !== '--' && (
          <Portal>
            <PopoverContent zIndex="2" w="fit-content" p="4px ">
              <PopoverBody p="8px">
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
                        {formatNumber(currentPosData?.displayFeeOwedA)}
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
                        {formatNumber(currentPosData?.displayFeeOwedB)}
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
  )
}

export default PendingFeesBlock
