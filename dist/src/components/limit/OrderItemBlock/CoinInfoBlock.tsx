import { LimitOrderInfo } from '@/types/limit'
import { CoinPairImage } from '@cetus/ui-kit'
import { formatNumber } from '@cetus/utils'
import { HStack, Text } from '@chakra-ui/react'

export const CoinInfoBlock = ({ info, imgSize = '32px', isProfile = false }: { info: LimitOrderInfo; imgSize?: string; isProfile?: boolean }) => {
  const { pay_coin, target_coin, total_pay_amount, expect_obtain_amount } = info
  return (
    <HStack>
      <CoinPairImage w={imgSize} h={imgSize} coinAIconUrl={pay_coin?.logo_url} coinBIconUrl={target_coin?.logo_url} />
      <HStack flexWrap="wrap">
        <HStack>
          {!isProfile && <Text color="text_caption">{formatNumber(total_pay_amount)}</Text>}
          <Text color="text_caption">{pay_coin?.symbol} → </Text>
        </HStack>
        <HStack>
          {!isProfile && <Text color="text_caption">{formatNumber(expect_obtain_amount)}</Text>}
          <Text color="text_caption">{target_coin?.symbol}</Text>
        </HStack>
      </HStack>
    </HStack>
  )
}
