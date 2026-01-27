import { Icon } from '@cetus/ui-kit'
import { Flex, HStack, Text, VStack } from '@chakra-ui/react'

type PriceDiffWarnProps = {
  confirmPriceDiff: boolean
  handleConfirmPriceDiffClick: (confirm: boolean) => void
}
export function PriceDiffWarn(props: PriceDiffWarnProps) {
  const { confirmPriceDiff, handleConfirmPriceDiffClick } = props
  return (
    <VStack bg="primary_red_opacity.10" w="100%" borderRadius="12px" p="12px" alignItems="start" gap="8px">
      <Text color="primary_red" fontSize="12px" lineHeight="15px" fontWeight="400">
        The exchange rate of this order deviates from the market price by a large percentage. Are you sure you want to continue the swap?
      </Text>
      <HStack
        gap="8px"
        cursor="pointer"
        onClick={() => {
          handleConfirmPriceDiffClick(!confirmPriceDiff)
        }}
      >
        <Flex
          align="center"
          justifyContent="center"
          background={confirmPriceDiff ? 'primary_red' : 'checked_bg'}
          border="1px solid"
          borderColor={confirmPriceDiff ? 'primary_red' : 'text_paragraph'}
          width={'16px'}
          height={'16px'}
          borderRadius={'4px'}
          onClick={() => {
            handleConfirmPriceDiffClick(!confirmPriceDiff)
          }}
          sx={{
            svg: {
              fill: '#000000 !important'
            }
          }}
        >
          {confirmPriceDiff ? <Icon xlinkHref="#icon-icon_check" svgW="14px" svgH="14px" /> : null}
        </Flex>
        <Text fontSize="12px" fontFamily="400" color={confirmPriceDiff ? 'primary_red' : 'text_paragraph'}>
          Yes, I want to continue.
        </Text>
      </HStack>
    </VStack>
  )
}
