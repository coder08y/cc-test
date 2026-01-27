import { CetusTooltip } from '@cetus/design'
import useGetTokenSource from '@cetus/hooks/src/useGetTokenSource'
import useTokenStore from '@cetus/stores/src/token'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { cancelBubble } from '@cetus/utils'
import { Center, HStack, Image, StackProps, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import IconTipsTriangle from '/images/token-warning@2x.png'

interface WarningIconProps extends StackProps {
  coinTypeA?: string
  coinTypeB?: string
  mt?: string
}

const WarningIcon = ({ coinTypeA, coinTypeB, mt, ...rest }: WarningIconProps) => {
  const { getShowCoinTag } = useGetTokenSource()
  const { importTokenList } = useTokenSelectStore()
  const { verifiedTokenMap } = useTokenStore()
  const isShowCoinTag = useMemo(() => {
    if ((coinTypeA || coinTypeB) && verifiedTokenMap?.size > 0) {
      return getShowCoinTag(coinTypeA as string) || getShowCoinTag(coinTypeB as string)
    }
    return false
  }, [coinTypeA, coinTypeB, verifiedTokenMap, importTokenList])

  return (
    <>
      {isShowCoinTag && (
        <HStack
          mt={mt}
          w="16px"
          h="16px"
          {...rest}
          onClick={e => {
            cancelBubble(e)
          }}
        >
          <CetusTooltip
            placement="top"
            tooltip={
              <Text lineHeight="20px" fontSize="12px" w="240px">
                This pool contains tokens that are not on the Frequently Traded List. Please check the Coin Type of these coins before interacting
                with this pool!
              </Text>
            }
          >
            <Center>
              <Image w="100%" h="100%" src={IconTipsTriangle} />
            </Center>
          </CetusTooltip>
        </HStack>
      )}
    </>
  )
}

export default WarningIcon
