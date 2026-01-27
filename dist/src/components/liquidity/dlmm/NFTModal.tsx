import { PoolType } from '@/components/pools/createPool/SelectPoolType'
import useAddDlmmLiquidityStore, { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { CoinPairImage, Icon, VaulDrawer } from '@cetus/ui-kit'
import { cancelBubble, formatPrice, textEllipses } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Button, Divider, HStack, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const poolConfigMap: Record<PoolType, { title: string; color: string }> = {
  clmm: {
    title: 'Fee tier',
    color: 'text_highlight'
  },
  dlmm: {
    title: 'Base Fee',
    color: 'primary_green'
  }
}

interface NFTModalProps {
  onClose: () => void
  poolId: string
  posId: string
  tokenA: Token
  tokenB: Token
  fee: string
  isReverse?: boolean
  poolType?: PoolType
  direct?: boolean
  binStep?: number
  positionCount: number
}
function NFTModal({ onClose, poolId, posId, tokenA, tokenB, fee, isReverse, poolType = 'dlmm', binStep, positionCount, direct }: NFTModalProps) {
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()

  const [isDirect, setIsDirect] = useState(direct)
  const { minPriceData, maxPriceData } = useAddDlmmLiquidityStore()

  const onViewDetail = () => {
    if (d(positionCount).eq(1)) {
      navigate(`/dlmm-position-detail/${posId}`)
    } else {
      navigate(`/dlmm?tab=positions&poolId=${poolId}`)
    }
    onClose()
  }

  return isApp ? (
    <VaulDrawer isOpen={true} onClose={onClose} padding="12px 12px 24px">
      <VStack>
        <NFTHeader onClose={onClose} />
        <NFTContent
          tokenA={tokenA}
          tokenB={tokenB}
          fee={fee}
          binStep={binStep}
          isDirect={isDirect}
          setIsDirect={setIsDirect}
          isReverse={isReverse}
          minPriceData={minPriceData}
          maxPriceData={maxPriceData}
        />
        <NFTFooter onViewDetail={onViewDetail} />
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
            binStep={binStep}
            isDirect={isDirect}
            setIsDirect={setIsDirect}
            isReverse={isReverse}
            minPriceData={minPriceData}
            maxPriceData={maxPriceData}
          />
        </ModalBody>

        <ModalFooter p="20px 0 0">
          <NFTFooter onViewDetail={onViewDetail} />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NFTModal

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

interface NFTContentProps {
  tokenA?: Token
  tokenB?: Token
  fee: string
  binStep?: number
  isDirect?: boolean
  setIsDirect: (isDirect?: boolean) => void
  isReverse?: boolean
  minPriceData: RangePriceType | null
  maxPriceData: RangePriceType | null
}

const NFTContent = ({ tokenA, tokenB, fee, binStep, isDirect, setIsDirect, isReverse, minPriceData, maxPriceData }: NFTContentProps) => {
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

        <Block w="unset" p="4px 8px" borderRadius="12px">
          <HStack gap={{ base: '4px', lg: '8px' }}>
            <Text fontSize={{ base: '10px', lg: '12px' }} color="primary" lineHeight="1" fontWeight="500">
              {fee}
            </Text>
            <Divider orientation="vertical" h="10px" />
            <Text fontSize={{ base: '10px', lg: '12px' }} color="primary">
              {binStep} bps
            </Text>
          </HStack>
        </Block>
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
        <Text color="text_caption" wordBreak="break-all" fontSize={{ base: '12px', lg: '14px' }}>
          {isDirect !== isReverse ? formatPrice(minPriceData?.price) : formatPrice(maxPriceData?.reversePrice)} -&nbsp;
          {isDirect !== isReverse ? formatPrice(maxPriceData?.price) : formatPrice(minPriceData?.reversePrice)}
        </Text>
        <HStack>
          <HStack gap="0">
            <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
              {textEllipses(isDirect ? tokenB?.symbol : tokenA?.symbol, 10)}
            </Text>
            <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
              &nbsp;per&nbsp;
            </Text>
            <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
              {textEllipses(isDirect ? tokenA?.symbol : tokenB?.symbol, 10)}
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

const NFTFooter = ({ onViewDetail }: { onViewDetail: () => void }) => {
  return (
    <Button
      w="100%"
      onClick={onViewDetail}
      h={{ base: '42px', lg: '52px' }}
      borderRadius={{ base: '8px', lg: '12px' }}
      fontSize={{ base: '14px', lg: '16px' }}
      fontWeight="500"
    >
      View Detail
    </Button>
  )
}
