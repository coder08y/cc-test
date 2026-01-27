import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { convertScientificToDecimal, formatCurrency, formatNumberWithDown } from '@cetus/utils'
import { Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, TextProps, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

const PendingYieldValue = ({
  yieldList,
  myPosYieldValue: value,
  isProfile = false,
  textStyle,
  placement = 'bottom-end'
}: {
  yieldList: any
  myPosYieldValue: string
  isProfile?: boolean
  textStyle?: TextProps
  placement?: any
}) => {
  const [isShowInfo, setIsShowInfo] = useState(false)

  const myPosYieldValue = useMemo(() => {
    console.log('🚀 ~ PendingYieldValue ~ myPosYieldValue:', value, value.toString())
    const num = value?.toString()
    // 传入的如果是科学计数法的数字需要处理下
    if (num && num?.includes('e')) {
      return convertScientificToDecimal(num, 18)
    }
    return value
  }, [value])

  return (
    <VStack
      gap="4px"
      align="flex-start"
      onClick={e => {
        e.stopPropagation()
        setIsShowInfo(!isShowInfo)
      }}
      onMouseEnter={() => setIsShowInfo(true)}
      onMouseLeave={() => setIsShowInfo(false)}
    >
      <Popover isLazy isOpen={isShowInfo} placement={placement} gutter={2} closeDelay={500}>
        <PopoverTrigger>
          <Center as="button">
            <Text
              cursor={Number(myPosYieldValue) <= 0 ? 'text' : 'help'}
              fontSize={{ base: isProfile ? '16px' : '14px', lg: '20px' }}
              color="primary_green"
              fontWeight="500"
              textDecoration={Number(myPosYieldValue) <= 0 ? 'none' : 'underline dotted'}
              textUnderlineOffset="2px"
              {...textStyle}
            >
              {formatCurrency(myPosYieldValue, 2)}
            </Text>
          </Center>
        </PopoverTrigger>
        {isShowInfo && (Number(myPosYieldValue) > 0 || myPosYieldValue == '--') && yieldList?.length > 0 && (
          <Portal>
            <PopoverContent zIndex="2" w="fit-content" maxH="200px" overflow="auto" p="4px 0">
              <PopoverBody p="0px">
                <VStack w="100%" align="flex-start" bg="bg_secondary" gap="0px">
                  {yieldList?.map((item: any) => {
                    console.log('🚀 ~ {yieldList?.map ~ item:', item)
                    return (
                      <HStack w="100%" key={item?.token?.coin_type} p="4px 12px" minW="280px" justify="space-between">
                        <SingleTokenInfo
                          token={item?.token}
                          imgBoxStyle={{ w: '20px', h: '20px' }}
                          haveName={false}
                          symbolFontSize="12px"
                          warningIcon={{ iconW: '10px', iconH: '10px' }}
                        />
                        <HStack gap="4px">
                          <Text fontSize="12px" color="text_caption">
                            {formatNumberWithDown(item?.amount)}
                          </Text>
                          <Text fontSize="12px">({formatCurrency(item?.amountUSD, 2)})</Text>
                        </HStack>
                      </HStack>
                    )
                  })}
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    </VStack>
  )
}

export default PendingYieldValue
