import { Token } from '@cetus/types'
import { CoinPairImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import CompletedBlock from '../CompletedBlock'

type CompletedSelectTokenProps = {
  onEdit: () => void
  baseToken?: Token
  quoteToken?: Token
  children?: React.ReactNode
}
function CompletedSelectToken({ onEdit, baseToken, quoteToken, children }: CompletedSelectTokenProps) {
  return (
    <CompletedBlock onEdit={onEdit}>
      <HStack gap="12px">
        <CoinPairImage
          coinAIconUrl={baseToken?.logo_url}
          coinBIconUrl={quoteToken?.logo_url}
          coinACoinType={baseToken?.coin_type}
          coinBCoinType={quoteToken?.coin_type}
          w="36px"
          h="36px"
        />
        <VStack align="flex-start" gap="4px">
          <Text color="text_caption" fontWeight="500">{`${textEllipses(baseToken?.symbol)}-${textEllipses(quoteToken?.symbol)}`}</Text>
          {children}
        </VStack>
      </HStack>
    </CompletedBlock>
  )
}

export default CompletedSelectToken
