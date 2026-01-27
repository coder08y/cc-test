import useDeepBookStore from '@/store/deepbook'
import { AddressCopyLink, CetusTooltip, TooltipIcon } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { abbreviateTokenName } from '@cetus/utils'
import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack
} from '@chakra-ui/react'
import { Suspense, lazy } from 'react'
const PriceReference = lazy(() => import('../swap/PriceReference'))

type MarketDetailsModalProps = {
  currentDeepBookPool: any
  isOpen: boolean
  onClose: (isManualClose?: boolean) => void
  onCloseDetails: () => void
}
export const MarketDetailsContent = ({ currentDeepBookPool }: { currentDeepBookPool: any }) => {
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  return (
    <VStack w="100%" gap="0px">
      <HStack justify="space-between" w="100%" mb={isApp ? '12px' : '16px'}>
        <Text fontSize={{ base: '12px', lg: '14px' }}>Pool Address</Text>
        <AddressCopyLink
          address={currentDeepBookPool?.address}
          showLink={false}
          fontSize={{ base: '12px', lg: '14px' }}
          color="text_caption"
          onClickLink={() => window.open(getExplorerUrl(currentDeepBookPool?.address, 'poolAddress'), '_blank')}
        />
      </HStack>
      <HStack justify="space-between" w="100%">
        <Text fontSize={{ base: '12px', lg: '14px' }}>Min Order Size</Text>
        <Text fontSize={{ base: '12px', lg: '14px' }} color="text_caption">
          {currentDeepBookPool?.minSize} {currentDeepBookPool?.baseAssets?.symbol}
        </Text>
      </HStack>
      {currentDeepBookPool?.isMarginPool && (
        <VStack gap="16px" alignItems={'flex-start'} w="100%" mt="16px">
          <HStack justify="space-between" w="100%">
            <HStack gap="4px">
              <Text fontSize={{ base: '12px', lg: '14px' }}>{currentDeepBookPool?.baseAssets?.symbol} Margin Pool</Text>
              <TooltipIcon
                tooltipCon={`A shared pool where ${currentDeepBookPool?.baseAssets?.symbol} can be borrowed by Deepbook margin traders.`}
              />
            </HStack>
            <AddressCopyLink
              address={currentDeepBookPool?.baseAssets?.coin_type}
              showLink={false}
              fontSize={{ base: '12px', lg: '14px' }}
              color="text_caption"
              onClickLink={() => window.open(getExplorerUrl(currentDeepBookPool?.baseAssets?.coin_type, 'poolAddress'), '_blank')}
            />
          </HStack>
          <HStack justify="space-between" w="100%">
            <HStack gap="4px">
              <Text fontSize={{ base: '12px', lg: '14px' }}>{currentDeepBookPool?.quoteAssets?.symbol} Margin Pool</Text>
              <TooltipIcon
                tooltipCon={`A shared pool where ${currentDeepBookPool?.quoteAssets?.symbol} can be borrowed by Deepbook margin traders.`}
              />
            </HStack>

            <AddressCopyLink
              address={currentDeepBookPool?.quoteAssets?.coin_type}
              showLink={false}
              fontSize={{ base: '12px', lg: '14px' }}
              color="text_caption"
              onClickLink={() => window.open(getExplorerUrl(currentDeepBookPool?.quoteAssets?.coin_type, 'poolAddress'), '_blank')}
            />
          </HStack>
        </VStack>
      )}

      <Suspense
        fallback={
          <VStack w="100%" align="flex-start" mt="20px">
            <VStack w="100%" align="flex-start">
              <HStack w="100%">
                <SkeletonCircle w="28px" h="28px" />
                <Skeleton h="16px" w="60px" borderRadius="4px" />
              </HStack>
              <Skeleton h="16px" w="120px" borderRadius="4px" />
            </VStack>
            <VStack w="100%" align="flex-start" mt="20px">
              <HStack w="100%">
                <SkeletonCircle w="28px" h="28px" />
                <Skeleton h="16px" w="60px" borderRadius="4px" />
              </HStack>
              <Skeleton h="16px" w="120px" borderRadius="4px" />
            </VStack>
          </VStack>
        }
      >
        <PriceReference
          fromCoin={currentDeepBookPool?.baseAssets}
          toCoin={currentDeepBookPool?.quoteAssets}
          wrapStyle={{ gap: '16px' }}
          titleStyle={{ height: 'auto', m: isApp ? '-2px 0 4px' : '16px 0 4px', sx: { '>p': { color: 'primary_gray' } } }}
          itemStyle={{ bg: 'bg_secondary', p: '16px', borderRadius: '8px' }}
          chartStyle={{ flex: isApp ? '0 0 150px' : '' }}
          type="deepbook"
        />
      </Suspense>
    </VStack>
  )
}
export default function MarketDetailsModal({ currentDeepBookPool, isOpen, onClose, onCloseDetails }: MarketDetailsModalProps) {
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={() => onClose(false)} isCentered>
      <ModalOverlay />
      <ModalContent w={{ base: '100%', lg: '416px' }}>
        <ModalHeader>
          {abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)}-{abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)} Market
          Details
        </ModalHeader>
        <ModalCloseButton sx={{ mt: '-1px' }} />
        <ModalBody textAlign="center" pb="20px">
          <MarketDetailsContent currentDeepBookPool={currentDeepBookPool} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
