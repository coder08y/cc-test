import { TokenAvatar } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, BoxProps, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

function DropSelectToken({
  list,
  currentToken,
  changeCurrentToken,
  dropSelectTokenListConfig
}: {
  list: Token[]
  currentToken: any
  changeCurrentToken: (token: any) => void
  dropSelectTokenListConfig?: {
    noFilter?: boolean
    style?: BoxProps['sx']
    tokenItemHasBgColor?: boolean
  }
}) {
  const [isHover, setIsHover] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { isApp } = useWindowWidth()

  return (
    <Box ref={ref} position="relative" zIndex="99999">
      <Button
        variant="outline"
        h="28px"
        minH="28px"
        border="none"
        bg="none"
        p="0"
        height="16px"
        lineHeight="16px"
        w={{ base: '100%', lg: 'unset' }}
        _hover={{ bg: 'none' }}
        _active={{ bg: 'none' }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HStack justify="center" gap="8px">
          <TokenAvatar
            showTag={false}
            src={currentToken?.logo_url || ''}
            coin_type={currentToken?.coin_type}
            size="20px"
            style={isHover ? { borderColor: 'token_active_border', boxShadow: '0px 0px 6px 0px #0067AD' } : {}}
          />
          <Text color="text_caption">{textEllipses(currentToken?.symbol || '', 10)}</Text>
          <Icon
            transition="transform 0.5s"
            transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
            mt="1px"
            xlinkHref="#icon-icon_arrow"
            fontSize="12px"
            svgFill={isHover ? 'text_caption' : 'text_paragraph'}
          />
        </HStack>
      </Button>

      {/* 下拉列表 */}
      {isOpen && list?.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          right="0"
          mt="3px"
          minW="100px"
          maxH="160px"
          overflowY="auto"
          p="4px"
          borderRadius="12px"
          border="1px solid"
          borderColor="border"
          bg="bg_secondary"
          backdropFilter="blur(20px)"
          zIndex="999999"
          sx={dropSelectTokenListConfig?.style}
        >
          <VStack spacing="2px" align="stretch">
            {list
              .filter(item => (dropSelectTokenListConfig?.noFilter ? true : fixCoinType(currentToken?.coin_type) !== fixCoinType(item?.coin_type)))
              .map(item => (
                <HStack
                  key={item?.coin_type}
                  justify="space-between"
                  w="100%"
                  p="4px 8px"
                  cursor="pointer"
                  bg={
                    dropSelectTokenListConfig?.tokenItemHasBgColor
                      ? currentToken?.coin_type === item?.coin_type
                        ? 'primary_opacity.10'
                        : 'transparent'
                      : 'transparent'
                  }
                  onClick={() => {
                    changeCurrentToken(item)
                    setIsOpen(false)
                  }}
                >
                  <SingleTokenInfo haveVerified imgBoxStyle={{ w: '20px', h: '20px' }} symbolFontSize="14px" token={item} haveName={false} />
                </HStack>
              ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default DropSelectToken
