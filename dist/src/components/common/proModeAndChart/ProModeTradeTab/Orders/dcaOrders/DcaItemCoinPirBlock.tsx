import { CoinPairImage } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'

export default function DcaItemCoinPirBlock({ orderInfo }: { orderInfo: any }) {
  const { inCoin: sellCoin, outCoin: buyCoin } = orderInfo
  return (
    <HStack>
      <CoinPairImage
        coinAIconUrl={sellCoin?.logo_url}
        coinBIconUrl={buyCoin?.logo_url}
        coinACoinType={sellCoin?.coin_type}
        coinBCoinType={buyCoin?.coin_type}
        w="20px"
        h="20px"
      />
      <Text color="text_caption" fontSize="13px">
        {sellCoin?.symbol} → {buyCoin?.symbol}
      </Text>
    </HStack>
  )
}
