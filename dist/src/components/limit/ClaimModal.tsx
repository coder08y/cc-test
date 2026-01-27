import { LimitOrderInfo } from '@/types/limit'
import { Block, SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { Icon, NoData, NumericFormatInput, SingleCoinImage } from '@cetus/ui-kit'
import { cancelBubble, d, formatNumber, timeFormatUTC } from '@cetus/utils'
import {
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { CoinInfoBlock } from './OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from './OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from './OrderItemBlock/FilledSizeBlock'
import { PriceBlock } from './OrderItemBlock/PriceBlock'

interface ClaimModalProps {
  isOpen: boolean
  onClose: () => void
  handleClaim: (claimValue: string | number) => void
  claimLoading: boolean
  orderInfo: LimitOrderInfo
  isClaimHistoryLoading: boolean
  getLimitOrderClaimHistory: () => void
}

const ClaimModal = ({ orderInfo, isOpen, onClose, handleClaim, claimLoading, getLimitOrderClaimHistory, isClaimHistoryLoading }: ClaimModalProps) => {
  const { getExplorerUrl } = useExplorer()
  const [claimValue, setClaimValue] = useState('')
  const [claimHistoryList, setClaimHistoryList] = useState([])

  const [currentTab, setCurrentTab] = useState<Tab>({
    label: 'Claim',
    value: 'claim'
  })
  const tabList: Tab[] = [
    {
      label: 'Claim',
      value: 'claim'
    },
    {
      label: 'History',
      value: 'history'
    }
  ]
  const handleChangeTab = (item: Tab) => {
    setCurrentTab(item)
    if (item?.value == 'history') {
      getClaimHistoryList()
    }
  }
  const getClaimHistoryList = async () => {
    const list: any = await getLimitOrderClaimHistory()
    if (list) {
      setClaimHistoryList(list)
    }
  }

  const btnDisabled = useMemo(() => {
    if (!claimValue || claimLoading) {
      return {
        disabled: true,
        text: 'Claim'
      }
    } else if (d(claimValue).gt(orderInfo.un_claimed_amount) || d(orderInfo.un_claimed_amount).eq(0)) {
      return {
        disabled: true,
        text: 'Maximum amount that can be withdrawn'
      }
    } else {
      return {
        disabled: false,
        text: 'Claim'
      }
    }
  }, [claimValue, orderInfo.un_claimed_amount])
  const [isFirst, setIsFirst] = useState(true)
  useEffect(() => {
    if (isFirst) {
      setIsFirst(false)
      setClaimValue(orderInfo.un_claimed_amount)
    }
  }, [isFirst, orderInfo.un_claimed_amount])

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Claim
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <VStack w="100%" gap="20px" p="16px" pt="0" align="flex-start">
            <Block borderRadius="8px" p="8px">
              <Text lineHeight="20px" textAlign="left" fontSize="12px">
                For a partially filled order, you can manually claim the filled amount if you want. Or you can wait for the auto distribution until
                your order is fully filled, expired or cancelled.
              </Text>
            </Block>
            <CoinInfoBlock info={orderInfo} imgSize="28px" />
            <HStack w="100%" justify="space-between">
              <Text>Price</Text>
              <PriceBlock info={orderInfo} />
            </HStack>
            <HStack w="100%" justify="space-between">
              <Text>Filled Size</Text>
              <FilledSizeBlock info={orderInfo} />
            </HStack>
            <HStack w="100%" justify="space-between">
              <Text>Expiry</Text>
              <ExpiryBlock info={orderInfo} />
            </HStack>
            <SelectTab
              type="outlineTab"
              wrapStyle={{
                w: '100%',
                h: '36px',
                borderRadius: '8px',
                p: '4px',
                mt: '-1px',
                zIndex: '1'
              }}
              itemStyle={{
                w: '50%',
                fontSize: '12px'
              }}
              tabList={tabList}
              currentTab={currentTab.label}
              handleChangeTab={handleChangeTab}
            />

            {currentTab?.value == 'claim' && (
              <>
                <Block w="100%" p="16px" mt="-4px">
                  <VStack gap="16px" align="flex-start">
                    <Text lineHeight="18px">Available to claim</Text>
                    <HStack w="100%" justify="space-between">
                      <NumericFormatInput
                        value={claimValue ? formatNumber(claimValue).toString() : ''}
                        onChange={(value: string) => {
                          setClaimValue(value)
                        }}
                        decimals={18}
                        style={{
                          width: 'calc(100% - 8px)',
                          background: 'none',
                          whiteSpace: 'nowrap',
                          opacity: 1,
                          outline: 'none',
                          color: 'var(--chakra-colors-text_caption)',
                          fontSize: '28px',
                          touchAction: 'manipulation',
                          transition: 'all 0.3s'
                        }}
                      />

                      <HStack>
                        <SingleTokenInfo token={orderInfo?.target_coin} haveName={false} imgBoxStyle={{ w: '28px', h: '28px' }} />
                      </HStack>
                    </HStack>
                  </VStack>
                </Block>
                <Button
                  onClick={() => {
                    handleClaim(claimValue)
                    onClose()
                  }}
                  isDisabled={btnDisabled.disabled}
                  w="calc(100% + 32px)"
                  mb="-30px"
                  ml="-16px"
                  h="52px"
                  fontWeight="500"
                >
                  {btnDisabled.text}
                </Button>
              </>
            )}

            {currentTab?.value == 'history' && (
              <VStack w="100%" gap="12px">
                {isClaimHistoryLoading ? (
                  <Block w="100%" p="16px" mt="-4px" borderRadius="12px">
                    <HStack justify="space-between">
                      <Skeleton height="4" width="150px" />
                      <Skeleton height="4" width="150px" />
                    </HStack>
                    <HStack justify="space-between" mt="16px">
                      <Skeleton height="4" width="150px" />
                      <Skeleton height="4" width="150px" />
                    </HStack>
                  </Block>
                ) : claimHistoryList?.length == 0 ? (
                  <NoData type="nodata" text="No History." p="20px" />
                ) : (
                  claimHistoryList?.map((history: any) => {
                    return (
                      <Block key={history.digest} w="100%" p="16px" mt="-4px" borderRadius="12px">
                        <VStack gap="16px" align="flex-start">
                          <HStack w="100%" justify="space-between">
                            <Text>Amount</Text>
                            <HStack gap="4px">
                              <SingleCoinImage imageUrl={orderInfo?.target_coin?.logo_url} w="20px" h="20px" />
                              <Text color="text_caption" lineHeight="18px">
                                {formatNumber(history?.claimed_amount)} {orderInfo?.target_coin?.symbol}
                              </Text>
                            </HStack>
                          </HStack>
                          <HStack w="100%" justify="space-between">
                            <Text>Time</Text>
                            <HStack
                              gap="4px"
                              cursor="pointer"
                              mr="-4px"
                              onClick={e => {
                                cancelBubble(e)
                                window.open(getExplorerUrl(history.digest, 'tx'))
                              }}
                            >
                              <Text color="text_caption">{timeFormatUTC(Number(history?.timestampMs), '')} (UTC)</Text>
                              <Icon fontSize="16px" xlinkHref="#icon-icon_link3" />
                            </HStack>
                          </HStack>
                        </VStack>
                      </Block>
                    )
                  })
                )}
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ClaimModal
