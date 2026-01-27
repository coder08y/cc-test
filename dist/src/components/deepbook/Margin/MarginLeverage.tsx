import useDeepBookStore from '@/store/deepbook'
import useDeepBookMarginStore from '@/store/deepbook/margin'
import { Icon } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'

export default function MarginLeverage() {
  const { setMarginLeverageModalOpen } = useDeepBookMarginStore()
  const { currentDeepBookPool } = useDeepBookStore()
  const poolAddress = currentDeepBookPool?.address || ''
  // 使用 selector 订阅杠杆率变化，确保组件能响应 store 更新
  const marginLeverageRatio = useDeepBookMarginStore(state => (poolAddress ? state.marginLeverageRatioByPool[poolAddress] || '1.1' : '1.1'))
  return (
    <HStack
      w="100%"
      h="36px"
      justify="space-between"
      cursor="pointer"
      border="1px solid"
      borderColor="border"
      borderRadius="8px"
      px="12px"
      onClick={() => setMarginLeverageModalOpen(true)}
    >
      <Text fontSize="12px" fontWeight="500" lineHeight="16px">
        Leverage
      </Text>
      <HStack gap="4px">
        <Text fontSize="12px" fontWeight="500" lineHeight="16px" color="text_caption">
          {marginLeverageRatio}x
        </Text>
        <Icon fontSize="12px" xlinkHref="#icon-icon_arrow" />
      </HStack>
    </HStack>
  )
}
