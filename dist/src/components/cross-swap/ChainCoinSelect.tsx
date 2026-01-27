import { ChainCoinSelectProps } from '@/types/cross_swap'
import { TokenAvatar } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { Button, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { memo, useState } from 'react'

export const chainPlaceholderImg = '/images/chain/chain-place-holder.svg'

function ChainCoinSelect({
  value,
  loading,
  tokenStyle = {},
  tokenSize = '38px',
  symbolStyle = {},
  wrapStyle = {},
  disabled = false,
  openSelectChainAndTokenModal,
  currentChain
}: ChainCoinSelectProps) {
  const [hover, setHover] = useState(false)

  return (
    <>
      <Button
        w="100%"
        variant="unstyled"
        display="flex"
        alignItems="center"
        gap="8px"
        height="38px"
        onClick={() => {
          openSelectChainAndTokenModal?.()
        }}
        cursor="pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        isDisabled={disabled}
        {...wrapStyle}
      >
        {loading ? (
          <HStack>
            <SkeletonCircle w={tokenSize} h={tokenSize} />
            <Skeleton h={symbolStyle.fontSize || '16px'} />
          </HStack>
        ) : value ? (
          <HStack>
            <TokenAvatar
              variant="border"
              src={value?.logo_url || ''}
              coin_type={value?.address}
              size={tokenSize}
              style={hover ? { ...tokenStyle, borderColor: 'token_active_border', boxShadow: '0px 0px 6px 0px #0067AD' } : tokenStyle}
              showTag={currentChain !== undefined}
              tag_url={currentChain?.logo_url}
              placeholderTagImg={chainPlaceholderImg}
            />
            <VStack alignItems="flex-start" gap="2px">
              <Text color="text_caption" fontSize="16px" fontWeight="600" {...symbolStyle}>
                {textEllipses(value?.symbol || '', 10)}
              </Text>
              <Text fontSize="14px" fontWeight="regular">
                {textEllipses(currentChain?.chain_name || '', 10)}
              </Text>
            </VStack>
          </HStack>
        ) : (
          <Text color="text_caption" fontSize="14px" fontWeight="600">
            Select a token
          </Text>
        )}

        <Icon xlinkHref="#icon-icon_arrow" fontSize="12px" svgFill={hover ? 'text_caption' : 'text_paragraph'} />
      </Button>
    </>
  )
}

export default memo(ChainCoinSelect)
