import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { formatNumberWithDown, textEllipses } from '@cetus/utils'
import { Box, HStack, Skeleton, Text } from '@chakra-ui/react'

type TokenAmountItemProps = {
  token: Token
  isLoading?: boolean
  amount: string
}
export default function TokenAmountItem(props: TokenAmountItemProps) {
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  const { token, isLoading, amount } = props

  return (
    <HStack>
      <Box onClick={isApp ? () => window.open(getExplorerUrl(token?.coin_type, 'coin')) : () => {}}>
        <SingleTokenInfo
          haveTooltip={!isApp}
          coinType={token ? token?.coin_type : ''}
          haveName={false}
          haveSymbol={false}
          warningIcon={{ iconW: '12px', iconH: '12px' }}
          imgBoxStyle={{ w: '24px', h: '24px' }}
        />
      </Box>
      <Skeleton isLoaded={!isLoading && !!amount}>
        <Text color="text_caption" fontSize={{ base: '14px', lg: '16px' }}>
          {formatNumberWithDown(amount)}
        </Text>
      </Skeleton>
      <Text color="text_caption" fontSize={{ base: '14px', lg: '16px' }}>
        {textEllipses(token?.symbol)}
      </Text>
    </HStack>
  )
}
