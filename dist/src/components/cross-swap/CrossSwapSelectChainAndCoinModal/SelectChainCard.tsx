import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Chain } from '@cetusprotocol/cross-swap-sdk'
import { Box, Grid, GridItem, Image, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { chainPlaceholderImg } from '../ChainCoinSelect'

type SelectChainCardProps = {
  currentChain: Chain
  chainList: Chain[]
  openChainModal: () => void
  onChangeChain: (chain: Chain) => void
}

export default function SelectChainCard(props: SelectChainCardProps) {
  const { chainList, currentChain, openChainModal, onChangeChain } = props

  return (
    <Box p="0px 16px">
      <Box w="100%" mt="4px">
        <Grid templateColumns="repeat(5, 1fr)" gap="8px" w="100%">
          {chainList?.slice(0, 9)?.map((chain, index) => (
            <GridItem key={chain.id}>
              <ChainItem chain={chain} currentChain={currentChain} onChangeChain={onChangeChain} />
            </GridItem>
          ))}
          <GridItem>
            <Box
              bg="bg_secondary"
              borderRadius="8px"
              border="1px solid"
              borderColor="border"
              cursor="pointer"
              userSelect="none"
              onClick={() => openChainModal()}
              display="flex"
              justifyContent="center"
              alignItems="center"
              h="62px"
            >
              <Text color="text_caption" fontSize="20px">
                +{chainList.length - 9}
              </Text>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  )
}

function ChainItem(props: { chain: Chain; currentChain: Chain; onChangeChain: (chain: Chain) => void }) {
  const { chain, currentChain, onChangeChain } = props
  const [imageUrl, setImageUrl] = useState(chain.logo_url)
  useEffect(() => {
    setImageUrl(chain.logo_url)
  }, [chain.logo_url])
  const { isApp } = useWindowWidth()
  return (
    <Box
      bg="bg_secondary"
      borderRadius="8px"
      border="1px solid"
      borderColor={chain.id == currentChain.id ? 'primary' : 'border'}
      cursor="pointer"
      onClick={() => onChangeChain(chain)}
      display="flex"
      justifyContent="center"
      alignItems="center"
      h="62px"
    >
      <CetusTooltip tooltip={chain.chain_name} placement="top" showTooltip={!isApp}>
        <Image
          key={chain.id}
          loading="lazy"
          src={imageUrl}
          borderRadius="50%"
          w="32px"
          h="32px"
          onError={() => setImageUrl(chainPlaceholderImg)}
          fallbackSrc={chainPlaceholderImg}
        />
      </CetusTooltip>
    </Box>
  )
}
