import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import TokenGoplusCard from '@cetus/design/src/components/common/tokenSelectModal/TokenGoplusCard'
import TokenSelectCard from '@cetus/design/src/components/common/tokenSelectModal/TokenSelectCard'
import { Token } from '@cetus/types'
import { BackButton } from '@cetus/ui-kit'
import { Box, HStack, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import SwapWidgetBack from './SwapWidgetBack'

type SwapWidgetSelectTokenProps = {
  currToken?: Token
  onSelectCall: (value: Token) => void
  onClose: () => void
}

export default function SwapWidgetSelectToken(props: SwapWidgetSelectTokenProps) {
  const { onClose, currToken, onSelectCall } = props
  const [goplusToken, setGoplusToken] = useState<Token | undefined>(undefined)

  return (
    <VStack w="100%" gap="12px">
      {!goplusToken && <SwapWidgetBack title="Select Token" onBackClick={onClose} />}
      {goplusToken && (
        <HStack mt="12px" gap="12px" alignContent="start" w="100%">
          <BackButton
            bg="swap_bg_secondary"
            ml="12px"
            onClick={() => {
              setGoplusToken(undefined)
            }}
          />
          <SingleTokenInfo token={goplusToken} imgBoxStyle={{ w: '28px', h: '28px' }} />
        </HStack>
      )}
      <Box w="100%">
        {!goplusToken && (
          <TokenSelectCard
            bg="swap_bg_primary"
            isOpen={true}
            isWidget={true}
            isShowHotList={false}
            isShowCollectListBox={true}
            value={currToken?.coin_type || ''}
            noDataHaveImg={false}
            noClickImportItem={true}
            // tokenListMaxHeight="270px"
            onSelectToken={token => {
              onSelectCall(token)
            }}
            onGoplusTokenClick={token => {
              setGoplusToken(token)
            }}
            onClose={function (): void {}}
          />
        )}

        {goplusToken && <TokenGoplusCard tokenInfo={goplusToken} />}
      </Box>
    </VStack>
  )
}
