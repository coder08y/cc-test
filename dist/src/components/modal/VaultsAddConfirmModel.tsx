import { VaultsAddModelData } from '@/types/vaults'
import { TradeConfirmAmountInfo } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage } from '@cetus/ui-kit'
import {
  Box,
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react'
import PoolTag from '../common/PoolTag'
import { VaultsAddResult } from '../vaults-v2/detail/VaultsAddResult'
import VaultsZapRoute, { VaultsZapProps } from '../vaults-v2/detail/VaultsZapRoute'

type VaultsAddConfirmModelProps = {
  data: VaultsAddModelData
  isOpen: boolean
  onClose: () => void
  onSubmitClick: () => void
  calculateLpLoading: boolean
  vaultsZapProps?: VaultsZapProps
  reCalculateZapData: () => void
  showPoolTag?: boolean
}

export default function VaultsAddConfirmModel(props: VaultsAddConfirmModelProps) {
  const { isOpen, onClose, data, onSubmitClick, calculateLpLoading, vaultsZapProps, reCalculateZapData, showPoolTag = true } = props
  const { isApp } = useWindowWidth()
  const {
    feeTier,
    displayTokenA,
    displayTokenB,
    displayAmountA,
    displayAmountB,
    totalAmountValue,
    sharePool,
    lpAmountLimit,
    lpDecimals,
    category,
    binStep,
    isDlmm
  } = data

  return (
    <Modal
      autoFocus={false}
      returnFocusOnClose={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      portalProps={{ containerRef: undefined }}
    >
      <ModalOverlay
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1500,
          pointerEvents: 'auto'
        }}
      />
      <ModalContent
        containerProps={{
          style: {
            zIndex: 1501,
            pointerEvents: 'auto'
          }
        }}
      >
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Deposit
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <VStack w="100%" gap="20px" p="16px" pb="0px" pos="relative">
            <HStack w="100%" justifyContent="space-between">
              <HStack w={{ base: '100%', lg: 'auto' }}>
                <CoinPairImage
                  coinAIconUrl={displayTokenA?.logo_url}
                  coinBIconUrl={displayTokenB?.logo_url}
                  imageStyle={{
                    w: '40px',
                    h: '40px'
                  }}
                  imgBoxStyle={{
                    w: '40px',
                    h: '40px'
                  }}
                />
                <VStack w="100%" alignItems="flex-start">
                  <Text fontSize="16px" color="text_caption" maxW={{ base: '100%' }}>
                    {`${displayTokenA?.symbol} - ${displayTokenB?.symbol}`}
                  </Text>
                </VStack>
              </HStack>

              {/* <Block w="unset" p="6px 8px" borderRadius="12px" ml="4px">
                <HStack>
                  <Text>Fee Tier</Text>
                  <Text color="primary">{feeTier}</Text>
                  {binStep && <Text color="primary">{binStep} bps</Text>}
                </HStack>
              </Block> */}
              {showPoolTag && <PoolTag poolType={isDlmm ? 'dlmm' : 'clmm'} binStep={Number(binStep)} displayFee={feeTier} />}
            </HStack>

            {/* 交易数量展示 */}
            <TradeConfirmAmountInfo
              coinA={{
                amount: displayAmountA,
                ...displayTokenA
              }}
              iconParams={{
                xlinkHref: '#icon-icon_add',
                svgFill: 'text_caption'
              }}
              coinB={{
                amount: displayAmountB,
                ...displayTokenB
              }}
            />

            {/* 展示结果 */}

            <VaultsAddResult
              amountLimit={lpAmountLimit}
              inputTotalValue={totalAmountValue}
              preCalculateLoading={false}
              calculateLpLoading={calculateLpLoading}
              lpRate={sharePool}
              lpDecimals={lpDecimals}
              showTotalAmount={!vaultsZapProps}
              poolName={`${displayTokenA?.symbol} - ${displayTokenB?.symbol}`}
              labelColor="primary_gray"
            />
            {vaultsZapProps && (
              <VaultsZapRoute
                warpStyle={{ p: '0px' }}
                zapProgressRef={undefined}
                zapProps={vaultsZapProps}
                zapPreCalcLoading={calculateLpLoading}
                reCalculateZapData={() => {
                  if (reCalculateZapData) {
                    reCalculateZapData()
                  }
                }}
              />
            )}
            <Box h="52px" />
            <Button
              pos="absolute"
              bottom="0px"
              mt="4px"
              w="100%"
              h="52px"
              borderRadius="12px"
              fontSize="16px"
              fontWeight="500"
              onClick={() => {
                onSubmitClick()
              }}
            >
              Deposit
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
