import { Block, ErrorTips } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { Flex, HStack, Text } from '@chakra-ui/react'

type ConfirmPriceDiffTipsProps = {
  confirmPriceDiff: any
  changeConfirmPriceDiff: () => void
}

function ConfirmPriceDiffTips({ confirmPriceDiff, changeConfirmPriceDiff }: ConfirmPriceDiffTipsProps) {
  return (
    <Block bg="primary_red_opacity.10" border="none" borderRadius="12px" p="12px">
      <ErrorTips
        tipsFontSize="12px"
        isShowIcon={false}
        tips="High price difference! Check the route for swap details. Are you sure you want to continue?"
        p="0px"
        gap="4px"
        bg="none"
      />
      <HStack
        gap="8px"
        cursor="pointer"
        onClick={() => {
          changeConfirmPriceDiff()
        }}
        mt="8px"
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
            changeConfirmPriceDiff()
          }}
          sx={{
            svg: {
              fill: '#000000 !important'
            }
          }}
        >
          {confirmPriceDiff ? <Icon xlinkHref="#icon-icon_check" svgW="14px" svgH="14px" /> : null}
        </Flex>
        <Text fontSize="12px" color={confirmPriceDiff ? 'primary_red' : 'text_paragraph'}>
          Yes, I want to continue.
        </Text>
      </HStack>
    </Block>
  )
}

export default ConfirmPriceDiffTips
