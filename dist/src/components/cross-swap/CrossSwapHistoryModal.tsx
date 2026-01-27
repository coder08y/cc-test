import { getChainLink, getRouteLink, useGetHistoryFee } from '@/hooks/cross-swap/useCrossHelper'
import { useCrossTradeHistory } from '@/hooks/cross-swap/useCrossTradeHistory'
import { CrossSwapHistoryItem } from '@/types/cross_swap'
import { AddressCopyLink } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox, Icon, NoData } from '@cetus/ui-kit'
import { formatCurrency, formatNumber, timeFormatUTC } from '@cetus/utils'
import { CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import {
  Box,
  HStack,
  Heading,
  Image,
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
import { useState } from 'react'
import ChainBlock from './common/ChainBlock'

type CrossSwapHistoryModalProps = {
  platform: CrossSwapPlatform
  isOpen: boolean
  fromChainAddress?: string
  onClose: () => void
}

const statusMap: Record<string, { color: string; bg: string; text?: string }> = {
  DONE: { color: 'primary', bg: 'primary_opacity.15', text: 'Completed' },
  PENDING: { color: 'primary_yellow', bg: 'primary_yellow_opacity.10', text: 'Pending' },
  FAILED: { color: 'primary_red', bg: 'primary_red_opacity.10', text: 'Failed' },
  REFUNDED: { color: 'primary_red', bg: 'primary_red_opacity.10', text: 'Refunded' },
  INVALID: { color: 'primary_gray', bg: 'primary_gray_opacity.10', text: 'Invalid' },
  'Not Found': { color: 'primary_gray', bg: 'primary_gray_opacity.10', text: 'Not Found' }
}

const CrossSwapHistorySkeleton = () => {
  return (
    <VStack w="100%" alignItems="flex-start" gap="16px" mt="4px">
      {[1, 2, 3].map(item => (
        <VStack key={item} w="100%" alignItems="flex-start" gap="16px" mt="4px">
          <HStack w="100%" justifyContent="space-between">
            <HStack>
              <SkeletonCircle size="5" />
              <Skeleton height="4" width="200px" />
              <SkeletonCircle size="5" />
              <Skeleton height="4" width="60px" borderRadius="4px" />
            </HStack>
            <Skeleton height="4" width="16px" />
          </HStack>
        </VStack>
      ))}
    </VStack>
  )
}

export default function CrossSwapHistoryModal(props: CrossSwapHistoryModalProps) {
  const { isOpen, onClose, platform, fromChainAddress } = props
  const { isApp } = useWindowWidth()

  const { historyList = [], isLoading } = useCrossTradeHistory(platform, fromChainAddress, isOpen)

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={isApp ? '100%' : '460px'} minH={'130px'} maxH={`calc(100vh - 64px)`}>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            History
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px 16px 16px" minH={'130px'} overflowY={'auto'}>
          <VStack w="100%" alignItems="flex-start" gap="16px" mt="4px">
            {isLoading && historyList.length === 0 && <CrossSwapHistorySkeleton />}
            {!isLoading && historyList.length === 0 && <NoData type={'nodata'} noBorder={true} bg="transparent" text="No recent transactions" />}
            {historyList.map(item => {
              return <CrossSwapHistoryRow key={item.tx_link} item={item} platform={platform} />
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const HistoryStatus = ({ status }: { status: string }) => {
  const styleObj = statusMap[status] ?? { color: 'text_caption', bg: 'transparent' }

  return (
    <Text {...styleObj} p="2px 8px" borderRadius="4px" ml="8px" fontSize="12px">
      {statusMap?.[status]?.text || status}
    </Text>
  )
}

const CrossSwapHistoryRow = ({ item, platform }: { item: CrossSwapHistoryItem; platform: CrossSwapPlatform }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { fee } = useGetHistoryFee(item)
  return (
    <VStack w="100%" alignItems="flex-start" gap="16px" mt="4px">
      <HStack w="100%" justifyContent="space-between" cursor="pointer" onClick={() => setIsOpen(!isOpen)}>
        <HStack>
          <Box
            key={item.fromToken.logo_url}
            w="24px"
            h="24px"
            borderRadius="50%"
            backgroundImage={item.fromToken.logo_url}
            backgroundSize="cover"
            backgroundRepeat="no-repeat"
            backgroundPosition="center"
            position="relative"
          >
            <Image bg="#232323" borderRadius="50%" w="12px" h="12px" src={item.fromChain.logo_url} position="absolute" bottom="0" right="0" />
          </Box>

          <HStack>
            <Text>
              {formatNumber(item.amountIn)} {item.fromToken.symbol} →
            </Text>
            {item.status !== 'PENDING' && <Text>{formatNumber(item.amountOut)}</Text>}
            {item.status === 'PENDING' && <Skeleton isLoaded={false} h="14px" w="18px" />}
            <Text>{item.toToken.symbol}</Text>
          </HStack>

          <Box
            key={item.toToken.logo_url}
            w="24px"
            h="24px"
            borderRadius="50%"
            backgroundImage={item.toToken.logo_url}
            backgroundSize="cover"
            backgroundRepeat="no-repeat"
            backgroundPosition="center"
            position="relative"
          >
            <Image bg="#232323" borderRadius="50%" w="12px" h="12px" src={item.toChain.logo_url} position="absolute" bottom="0" right="0" />
          </Box>
          <HistoryStatus status={item.status} />
        </HStack>
        <Icon xlinkHref="#icon-icon_descending" cursor="pointer" transform={isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'} />
      </HStack>
      {isOpen && (
        <VStack bg="bg_secondary" borderRadius="8px" border="1px solid" borderColor="border" p="16px" w="100%" gap="12px" userSelect="none">
          <HTextLabelBox
            label="Created Time"
            value={`${timeFormatUTC(item.send_time * 1000)} (UTC)`}
            wrapStyle={{
              w: '100%',
              height: '20px'
            }}
            labelStyle={{
              fontSize: '14px'
            }}
            valueStyle={{
              fontSize: '14px'
            }}
          />
          {item.send_time}
          <HTextLabelBox
            label="Source Address"
            value={
              <HStack>
                <ChainBlock chainLogo={item.fromChain.logo_url} chainName={item.fromChain.chain_name} type="default" />
                <AddressCopyLink
                  address={item.source_address}
                  onClickLink={() => window.open(getChainLink(item.source_address, item.fromChain, 'address'), '_blank')}
                  showLink={false}
                  fontSize="14px"
                  color="text_caption"
                />
              </HStack>
            }
            wrapStyle={{
              w: '100%',
              height: '20px'
            }}
            labelStyle={{
              fontSize: '14px'
            }}
            valueStyle={{
              fontSize: '14px'
            }}
          />
          <HTextLabelBox
            label="Destination Address"
            value={
              <HStack>
                <ChainBlock chainLogo={item.toChain.logo_url} chainName={item.toChain.chain_name} type="default" />
                <AddressCopyLink
                  address={item.destination_address}
                  onClickLink={() => window.open(getChainLink(item.destination_address, item.toChain, 'address'), '_blank')}
                  showLink={false}
                  fontSize="14px"
                  color="text_caption"
                />
              </HStack>
            }
            wrapStyle={{
              w: '100%',
              height: '20px'
            }}
            labelStyle={{
              fontSize: '14px'
            }}
            valueStyle={{
              fontSize: '14px'
            }}
          />
          <HTextLabelBox
            label={platform === CrossSwapPlatform.LI_FI ? 'Gas Fee' : 'Relayer Fee'}
            value={formatCurrency(fee.combinedFeesUSD, 2)}
            wrapStyle={{
              w: '100%',
              height: '20px'
            }}
            labelStyle={{
              fontSize: '14px'
            }}
            valueStyle={{
              fontSize: '14px'
            }}
          />
          <HStack
            w="100%"
            justifyContent="center"
            mt="4px"
            cursor="pointer"
            onClick={() => window.open(getRouteLink(item.tx_link, platform), '_blank')}
          >
            <Text color="primary">View on Explorer</Text>
            <Icon fontSize="16px" xlinkHref="#icon-icon_link3" svgFill="primary" ml="-5px" mt="2px" />
          </HStack>
        </VStack>
      )}
    </VStack>
  )
}
