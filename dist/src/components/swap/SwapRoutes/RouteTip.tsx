import { AddressCopyLink } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { Divider, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
interface RouteTipProps {
  children: React.ReactNode
  fromToken?: Token
  toToken?: Token
  poolAddress?: string
}

function RouteTip({ children, fromToken, toToken, poolAddress }: RouteTipProps) {
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  return (
    <Popover isLazy trigger={isApp ? 'click' : 'hover'}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <Portal>
        <PopoverContent w="unset" minW="unset">
          <PopoverBody p="12px">
            <VStack w="100%" gap="12px" className="no-close-widget-flag">
              {poolAddress && (
                <>
                  <HStack w="100%" justify="space-between" h="20px" p="0">
                    <HStack>
                      {/* <Image src={pool_img} w="20px" h="20px" /> */}
                      <Text fontSize="12px" color="text_caption">
                        Pool
                      </Text>
                    </HStack>
                    <AddressCopyLink
                      address={poolAddress as string}
                      color="text_caption"
                      showLink={isApp ? true : false}
                      onClickLink={() => {
                        window.open(getExplorerUrl(poolAddress, 'poolAddress'), '_blank')
                      }}
                    />
                  </HStack>
                  <Divider orientation="horizontal" borderColor="border" />
                </>
              )}
              {[fromToken, toToken].map(token => (
                <HStack w="100%" key={token?.coin_type} justify="space-between" gap="12px">
                  <HStack>
                    <SingleCoinImage
                      imageUrl={token?.logo_url}
                      w="24px"
                      h="24px"
                      coinType={token ? token?.coin_type : ''}
                      showTagWidth="10px"
                      showTagHeight="10px"
                    />
                    <VStack align="flex-start" gap="0px">
                      <Text fontSize="12px" color="text_caption" fontWeight="500">
                        {textEllipses(token?.symbol || '', 10)}
                      </Text>
                      {/* <Text fontSize="12px">{token?.name}</Text> */}
                    </VStack>
                  </HStack>
                  <AddressCopyLink
                    // showAddress={false}
                    color="primary_gray"
                    showLink={isApp ? true : false}
                    address={token?.coin_type as string}
                    onClickLink={() => window.open(getExplorerUrl(token?.coin_type, 'coin'))}
                  />
                </HStack>
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

export default RouteTip
