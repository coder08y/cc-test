import { AddressCopyLink } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HTextLabelBox, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, formatSmallPrice, fromDecimalsAmountFix, textEllipses } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'

interface TokenCardProps {
  token?: Token
  amount?: string
  amountUSD: string
  loading: boolean
}

const TokenCard = ({ token, amount, amountUSD, loading }: TokenCardProps) => {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()
  return token ? (
    <VStack
      w="100%"
      p={{ base: '12px 8px', lg: '12px' }}
      borderRadius="8px"
      bg={{ base: 'primary_opacity.10', lg: 'background' }}
      gap={{ base: '12px', lg: '16px' }}
    >
      <HStack w="100%" justify="space-between">
        <HStack gap={isApp ? '4px' : '12px'}>
          <SingleCoinImage
            showTagWidth={isApp ? '12px' : '16px'}
            showTagHeight={isApp ? '12px' : '16px'}
            imageUrl={token?.logo_url}
            w={isApp ? '20px' : '28px'}
            h={isApp ? '20px' : '28px'}
            coinType={token ? token?.coin_type : ''}
          />
          <VStack align="flex-start" gap="4px">
            <Text color="text_caption" fontSize={isApp ? '12px' : '16px'}>
              {textEllipses(token?.symbol, 10)}
            </Text>
            {token?.name && <Text fontSize={isApp ? '10px' : '12px'}>{token.name}</Text>}
          </VStack>
        </HStack>
        <AddressCopyLink
          address={token?.coin_type || ''}
          fontSize={isApp ? '12px' : '14px'}
          color="text_caption"
          onClickLink={() => window.open(getExplorerUrl(token?.coin_type, 'coin'))}
          wrapStyle={{ gap: '6px' }}
          iconGap="6px"
        />
      </HStack>
      <VStack w="100%" gap={{ base: '8px', lg: '16px' }}>
        <HTextLabelBox
          label="Amount"
          labelStyle={{
            fontSize: isApp ? '12px' : '14px'
          }}
          value={addComma(fromDecimalsAmountFix(amount || '0', token.decimals)) as string}
          valueStyle={{
            fontSize: isApp ? '12px' : '14px'
          }}
          isLoading={loading}
          wrapStyle={{ h: '14px' }}
          skeletonStyle={{ valueW: '120px' }}
        />
        <HTextLabelBox
          label="Amount (USD)"
          labelStyle={{
            fontSize: isApp ? '12px' : '14px'
          }}
          value={amountUSD && amountUSD !== '--' ? `$${formatSmallPrice(amountUSD)}` : '--'}
          valueStyle={{
            fontSize: isApp ? '12px' : '14px'
          }}
          isLoading={loading}
          wrapStyle={{ h: '14px' }}
          skeletonStyle={{ valueW: '120px' }}
        />
      </VStack>
    </VStack>
  ) : null
}

export default TokenCard
