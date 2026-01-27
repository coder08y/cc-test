import usePriceRangeStore from '@/store/clmm/priceRange'
import { TickData } from '@/types'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { CoinPairImage, Icon, VaulDrawer } from '@cetus/ui-kit'
import { cancelBubble, formatPrice, textEllipses } from '@cetus/utils'
import { Button, HStack, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface NFTModalProps {
  onClose: () => void
  posId: string
  tokenA: Token
  tokenB: Token
  fee: string
  isReverse: boolean
}
function NFTModal({ onClose, posId, tokenA, tokenB, fee, isReverse }: NFTModalProps) {
  const [isDirect, setIsDirect] = useState(true)
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const { isApp } = useWindowWidth()

  useLayoutEffect(() => {
    if (isReverse) {
      setIsDirect(false)
    }
  }, [isReverse])

  return isApp ? (
    <VaulDrawer isOpen={true} onClose={onClose} padding="12px 12px 24px">
      <VStack>
        <NFTHeader onClose={onClose} />
        <NFTContent
          tokenA={tokenA}
          tokenB={tokenB}
          fee={fee}
          isDirect={isDirect}
          setIsDirect={setIsDirect}
          isReverse={isReverse}
          lowerTickData={lowerTickData}
          upperTickData={upperTickData}
        />
        <NFTFooter posId={posId} />
      </VStack>
    </VaulDrawer>
  ) : (
    <Modal isOpen={true} autoFocus={false} returnFocusOnClose={false} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent w="400px">
        <ModalHeader>
          <NFTHeader onClose={onClose} />
        </ModalHeader>

        <ModalBody>
          <NFTContent
            tokenA={tokenA}
            tokenB={tokenB}
            fee={fee}
            isDirect={isDirect}
            setIsDirect={setIsDirect}
            isReverse={isReverse}
            lowerTickData={lowerTickData}
            upperTickData={upperTickData}
          />
        </ModalBody>

        <ModalFooter p="20px 0 0">
          <NFTFooter posId={posId} />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NFTModal

interface NFTContentProps {
  tokenA?: Token
  tokenB?: Token
  fee: string
  isDirect: boolean
  setIsDirect: (isDirect: boolean) => void
  isReverse: boolean
  lowerTickData: Partial<TickData>
  upperTickData: Partial<TickData>
}

const NFTContent = ({ tokenA, tokenB, fee, isDirect, setIsDirect, isReverse, lowerTickData, upperTickData }: NFTContentProps) => {
  const { isApp } = useWindowWidth()
  return (
    <VStack gap={{ base: '4px', lg: '36px' }} mt={{ base: '12px', lg: '0' }}>
      <VStack
        gap="16px"
        bg="center / contain no-repeat url('/images/active-sui.gif') "
        w={{ base: '160px', lg: '240px' }}
        h={{ base: '160px', lg: '240px' }}
        justify="center"
        border="1px solid"
        borderColor="border"
        borderRadius="16px"
      >
        <CoinPairImage
          coinAIconUrl={tokenA?.logo_url}
          coinBIconUrl={tokenB?.logo_url}
          coinACoinType={tokenA?.coin_type}
          coinBCoinType={tokenB?.coin_type}
          w={{ base: '32px', lg: '48px' }}
          h={{ base: '32px', lg: '48px' }}
        />
        <Text fontSize={{ base: '14px', lg: '20px' }} fontWeight="500" color="text_caption" lineHeight={{ base: '20px', lg: '28px' }}>
          {textEllipses(tokenA?.symbol, 10)} - {textEllipses(tokenB?.symbol, 10)}
        </Text>

        <HStack bg="bg_secondary" p={{ base: '4px 8px', lg: '8px 12px' }} border="1px solid" borderColor="border" borderRadius="12px">
          <Text fontSize={{ base: '12px', lg: '14px' }}>Fee tier</Text>
          <Text fontSize={{ base: '12px', lg: '14px' }} color="text_highlight">
            {fee}
          </Text>
        </HStack>
      </VStack>
      <VStack
        w="100%"
        justify="center"
        borderRadius="8px"
        border="1px solid"
        borderColor={{ base: 'transparent', lg: 'border' }}
        bg={{ base: 'transparent', lg: 'input_bg' }}
        p="16px 8px"
      >
        <Text color="text_caption" whiteSpace="nowrap" fontSize={{ base: '12px', lg: '14px' }}>
          {isDirect ? formatPrice(lowerTickData?.price, 6) : formatPrice(upperTickData?.reversePrice, 6)} -&nbsp;
          {isDirect ? formatPrice(upperTickData?.price, 6) : formatPrice(lowerTickData?.reversePrice, 6)}
        </Text>
        <HStack>
          <HStack gap="0">
            <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
              {textEllipses(isDirect ? (isReverse ? tokenA?.symbol : tokenB?.symbol) : isReverse ? tokenB?.symbol : tokenA?.symbol, 10)}
            </Text>
            <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
              &nbsp;per&nbsp;
            </Text>
            <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
              {textEllipses(isDirect ? (isReverse ? tokenB?.symbol : tokenA?.symbol) : isReverse ? tokenA?.symbol : tokenB?.symbol, 10)}
            </Text>
          </HStack>
          <Icon
            xlinkHref="#icon-icon_swap1"
            fontSize={isApp ? '14px' : '16px'}
            onClick={(e: any) => {
              cancelBubble(e)
              setIsDirect(!isDirect)
            }}
          />
        </HStack>
      </VStack>
    </VStack>
  )
}

const NFTHeader = ({ onClose }: { onClose: () => void }) => {
  const { isApp } = useWindowWidth()
  return (
    <HStack justify="space-between" w="100%">
      <Text fontSize={{ base: '14px', lg: '16px' }} fontWeight="500" color="text_caption">
        Open position successful
      </Text>
      {!isApp && (
        <Button onClick={onClose} variant="unstyled" p="0" minW="unset" minH="unset" w="20px" h="20px">
          <Icon xlinkHref="#icon-icon_close" />
        </Button>
      )}
    </HStack>
  )
}

const NFTFooter = ({ posId }: { posId: string }) => {
  const navigate = useNavigate()
  return (
    <Button
      w="100%"
      onClick={() => navigate(`/position-detail/${posId}`)}
      h={{ base: '42px', lg: '52px' }}
      borderRadius={{ base: '8px', lg: '12px' }}
      fontSize={{ base: '14px', lg: '16px' }}
      fontWeight="500"
    >
      View Detail
    </Button>
  )
}
