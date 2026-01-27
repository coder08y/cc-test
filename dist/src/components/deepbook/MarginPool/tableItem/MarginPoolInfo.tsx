import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { SingleCoinImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'

export default function MarginPoolInfo({ item }: { item: any }) {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()
  return (
    <CetusTooltip
      placement="top-start"
      tooltip={
        <VStack align="flex-start">
          <HStack w="100%" justify="space-between">
            <HStack>
              {/* <Image src={pool_img} w="20px" h="20px" /> */}
              <Text fontSize="12px" color="text_caption">
                Pool
              </Text>
            </HStack>
            <AddressCopyLink
              address={item?.objectId || ''}
              color="text_caption"
              showLink={isApp ? true : false}
              onClickLink={() => {
                window.open(getExplorerUrl(item?.objectId || '', 'poolAddress'), '_blank')
              }}
            />
          </HStack>
          <Box h="1px" w=" 100%" bg="border" />
          <HStack w="100%" justify="space-between">
            <HStack>
              <SingleCoinImage
                imageUrl={item?.tokenInfo?.logo_url}
                w="20px"
                h="20px"
                coinType={item?.tokenInfo?.coin_type || ''}
                showTagWidth="10px"
                showTagHeight="10px"
              />

              <Text fontSize="12px" color="text_caption">
                {textEllipses(item?.tokenInfo?.symbol, 8)}
              </Text>
            </HStack>
            <AddressCopyLink
              address={item?.tokenInfo?.coin_type || ''}
              showLink={isApp ? true : false}
              onClickLink={() => {
                window.open(getExplorerUrl(item?.tokenInfo?.coin_type || '', 'coin'))
              }}
            />
          </HStack>
        </VStack>
      }
      needPortal={true}
    >
      <SingleTokenInfo token={item?.tokenInfo} haveName={false} imgBoxStyle={isApp ? { width: '20px', height: '20px' } : {}} />
    </CetusTooltip>
  )
}
