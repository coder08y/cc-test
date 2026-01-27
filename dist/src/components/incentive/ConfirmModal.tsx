import useTransaction from '@/hooks/common/useTransaction'
import useAddIncentive from '@/hooks/incentive/useAddIncentive'
import useIncentiveStore from '@/store/incentive'
import { IncentiveRewardInfo } from '@/types/incentive'
import { Block, TooltipIcon } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CommonTypeInfo } from '@cetus/types'
import { HTextLabelBox } from '@cetus/ui-kit'
import { addComma, amountToBN, d, formatNumber, removeComma, textEllipses, utcTimeFormattedWithSeconds } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Button, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { Transaction } from '@mysten/sui/transactions'
import { useState } from 'react'
import { formatEpoch } from './RewardTokenAndDuration'

type ConfirmModalProps = {
  totalAmount: string | number
  rewardList: IncentiveRewardInfo[]
  isOpen: boolean
  onClose: () => void
}

export default function ConfirmModal({ totalAmount, rewardList, isOpen, onClose }: ConfirmModalProps) {
  const textStyle = { fontSize: '14px' }
  const { size } = useDocumentSize()
  const modalH = rewardList?.length * 209 + (rewardList?.length - 1) * 8 > size?.h - 236 ? size?.h - 236 : 'unset'

  const { incentiveContractPoolInfo, incentiveApiPoolInfo } = useIncentiveStore()
  const [addLoading, setAddLoading] = useState(false)
  const { getInitIncentivePayload, getAddIncentivePayload } = useAddIncentive()
  const { signAndExecuteTransaction } = useTransaction()

  const toAddIncentive = async () => {
    console.log('🚀 ~ ConfirmModal ~ incentiveContractPoolInfo:', incentiveContractPoolInfo)
    setAddLoading(true)
    try {
      let tx = new Transaction()

      const existingRewards = incentiveContractPoolInfo?.reward_manager?.rewards || []
      console.log('🚀 ~ toAddIncentive ~ existingRewards:', existingRewards)

      // 获取链上已初始化过的 coin_type 列表
      const initializedCoinTypes = new Set<string>(existingRewards.map(r => fixCoinType(r?.reward_coin)))
      // 当前 tx 中准备初始化的 coin_type，防止重复初始化
      const alreadyInitSet = new Set<string>()

      for (const rewardInfo of rewardList) {
        const coinType = fixCoinType(rewardInfo?.rewardCoin?.coin_type)

        const params: any = {
          pool_id: incentiveContractPoolInfo?.id,
          reward_coin_type: rewardInfo?.rewardCoin?.coin_type,
          reward_amount: amountToBN(rewardInfo?.rewardNum, rewardInfo?.rewardCoin?.decimals).toString(),
          end_time_seconds: Math.floor(rewardInfo?.endTime / 1000),
          coin_type_a: incentiveContractPoolInfo?.coin_type_a,
          coin_type_b: incentiveContractPoolInfo?.coin_type_b,
          reward_coin_types: [rewardInfo?.rewardCoin?.coin_type]
        }
        if (!rewardInfo?.startIsNow) {
          params['start_time_seconds'] = Math.floor(rewardInfo?.startTime / 1000)
        }

        if (!initializedCoinTypes.has(coinType) && !alreadyInitSet.has(coinType)) {
          console.log('🚀 ~ toAddIncentive ~ params:', params)
          tx = getInitIncentivePayload(params, tx)
          alreadyInitSet.add(coinType)
        }
        console.log('🚀 ~ toAddIncentive ~ tx:', params, tx)

        tx = getAddIncentivePayload(params, tx)
      }

      console.log('🚀 ~ toAddIncentive ~ tx:', JSON.stringify(tx), tx)

      const res = await signAndExecuteTransaction(tx, {
        getShowInfo: status => {
          const info: CommonTypeInfo = {
            modalDescriptionText: `Add Incentives`,
            toastTitleText: 'Add Incentives'
          }
          console.log('🚀 ~ toAddIncentive ~ status:', status)
          return info
        }
      })

      console.log('🚀 ~ toAddIncentive ~ res:', res)

      if (res) {
        onClose()
      }
    } catch (error) {
      console.log('🚀 ~ toAddIncentive ~ error:', error)
      setAddLoading(false)
    } finally {
      setAddLoading(false)
    }
  }

  const { isApp } = useWindowWidth()

  return (
    <Modal autoFocus={false} closeOnOverlayClick={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px" ml={{ base: '-4px', lg: '0' }}>
            Add Incentives
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={{ base: '0px 0px 16px !important', lg: '0  0px 16px !important' }}>
          <VStack w="100%" p={{ base: '0 12px', lg: '0 16px' }} align="flex-start" userSelect="none" minH="180px" h={modalH} overflow="auto">
            {rewardList?.map((rewardInfo: IncentiveRewardInfo, index: number) => {
              const releaseRate = rewardInfo?.releaseRate
                ? d(removeComma(rewardInfo?.releaseRate + ''))
                    .mul(24 * 60 * 60)
                    .toString()
                : '--'
              return (
                <Block borderRadius="16px" p="16px" key={index}>
                  <HStack w="100%" justify="space-between" borderBottom="1px solid" borderColor="border" pb="16px">
                    <SingleTokenInfo
                      symbolFontSize="16px"
                      token={rewardInfo?.rewardCoin}
                      imgBoxStyle={{ w: isApp ? '28px' : '32px', h: isApp ? '28px' : '32px' }}
                    />
                    <Text fontSize="20px" fontWeight="500" color="text_caption">
                      {rewardInfo?.rewardNum ? addComma(rewardInfo?.rewardNum) : '--'}
                    </Text>
                  </HStack>

                  <VStack mt="16px" gap="12px">
                    <HTextLabelBox
                      label="Start Time (UTC)"
                      isLoading={false}
                      labelStyle={textStyle}
                      value={rewardInfo?.startIsNow ? 'Now' : utcTimeFormattedWithSeconds(rewardInfo?.startTime || 0)}
                      valueStyle={textStyle}
                      wrapStyle={{ h: '20px', lineHeight: '20px' }}
                    />
                    <HTextLabelBox
                      label="End Time (UTC)"
                      isLoading={false}
                      labelStyle={textStyle}
                      value={utcTimeFormattedWithSeconds(rewardInfo?.endTime || 0)}
                      valueStyle={textStyle}
                      wrapStyle={{ h: '20px', lineHeight: '20px' }}
                    />
                    <HTextLabelBox
                      label="Vesting Period"
                      isLoading={false}
                      labelStyle={textStyle}
                      value={formatEpoch(rewardInfo?.startTime, rewardInfo?.endTime) as string}
                      valueStyle={textStyle}
                      wrapStyle={{ h: '20px', lineHeight: '20px' }}
                    />

                    <HStack w="100%" justify="space-between" h="20px" lineHeight="20px">
                      <HStack gap="4px">
                        <Text>Emission Rate</Text>
                        <TooltipIcon tooltipCon="Rewards emitted to the pool per day" />
                      </HStack>
                      <Text color="text_caption">
                        {releaseRate ? formatNumber(releaseRate, rewardInfo?.rewardCoin?.decimal) : '--'}{' '}
                        {textEllipses(rewardInfo?.rewardCoin?.symbol, 10) || ''} per day
                      </Text>
                    </HStack>
                  </VStack>
                </Block>
              )
            })}
          </VStack>
          <HStack p={{ base: '16px 12px', lg: '16px' }} w="100%" justify="space-between">
            <Text>Total Amount</Text>
            <Text>{totalAmount}</Text>
          </HStack>
          <Button
            isDisabled={addLoading}
            isLoading={addLoading}
            m={{ base: '0 12px', lg: '0 16px' }}
            w={{ base: 'calc(100% - 24px)', lg: 'calc(100% - 32px)' }}
            h="48px"
            fontSize="18px"
            fontWeight="500"
            onClick={toAddIncentive}
          >
            Confirm
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
