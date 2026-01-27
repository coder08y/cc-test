import useRedeem from '@/hooks/compensation/useRedeem'
import usePosHelper from '@/hooks/position/usePosHelper'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { formatNumberWithDown } from '@cetus/utils'
import { Button, HStack, Progress, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CompensationDetailModal from './CompensationDetailModal'

function PositionItemContent({
  positionInfo,
  positionItemWidth = [],
  isVault = false
}: {
  positionInfo: PosBaseInfo
  positionItemWidth?: string[]
  isVault?: boolean
}) {
  const { getExplorerUrl } = useExplorer()
  const { getClmmPosName } = usePosHelper()
  const navigate = useNavigate()
  const { posPoolsOriginalData } = usePositionStore()

  const tokenName = useMemo(() => {
    if (isVault) {
      return `#${positionInfo?.vestData?.index}`
    } else {
      console.log('🚀🚀🚀 ~ CompensationPositionItemContent.tsx:34 ~ tokenName ~ positionInfo:', positionInfo)
      if (positionInfo?.tokenName) {
        return positionInfo?.tokenName
      } else {
        const position_index = posPoolsOriginalData?.[positionInfo?.clmmPool]?.index
        return getClmmPosName(Number(positionInfo?.index), position_index)?.split('|')[1]
      }
    }
  }, [positionInfo?.tokenName, positionInfo?.index, positionInfo?.clmmPool, posPoolsOriginalData, isVault])

  const clickDetail = () => {
    navigate(`/position-detail/${positionInfo?.id}`)
  }

  const [isOpen, setIsOpen] = useState(false)
  const { isApp } = useWindowWidth()

  const { handleRedeem, redeemLoading } = useRedeem(isVault ? 'vault' : 'positions')

  const positionId = useMemo(() => {
    if (isVault) {
      return positionInfo?.vestData?.id
    } else {
      if (positionInfo.posType == 'clmm') {
        return positionInfo.posId
      }
      if (positionInfo.posType == 'farms') {
        return positionInfo.id
      }
      if (positionInfo.posType == 'burn') {
        return positionInfo.id
      }
    }
  }, [positionInfo, isVault])

  return (
    <VStack w="100%" bg="position_bg" border="none" p={{ base: '20px 8px 16px', lg: '20px 16px 12px' }} borderRadius="16px" gap="12px">
      <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '20px', lg: '8px' }}>
        <VStack alignItems="flex-start" w={{ base: '100%', lg: positionItemWidth[0] }} gap={{ base: '20px', lg: '8px' }}>
          <HStack w={{ base: '100%', lg: '100%' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
            <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
              ID
            </Text>
            <Skeleton isLoaded={true}>
              <Text fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                {tokenName}
              </Text>
            </Skeleton>
          </HStack>
          <HStack w={{ base: '100%', lg: '100%' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
            <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
              Address
            </Text>
            <AddressCopyLink
              fontWeight="500"
              color="text_caption"
              address={positionId}
              showLink={false}
              fontSize={{ base: '14px', lg: '12px' }}
              onClickLink={() => {
                window.open(getExplorerUrl(positionId, 'nftAddress'), '_blank')
              }}
            />
          </HStack>
        </VStack>
        <HStack w={{ base: '100%', lg: positionItemWidth[1] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
          {isApp && (
            <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
              Total Compensation
            </Text>
          )}
          <Text color="text_caption">
            {formatNumberWithDown(positionInfo?.vestData?.cetusAmount)}
            {isApp ? ' CETUS' : ''}
          </Text>
        </HStack>
        <HStack w={{ base: '100%', lg: positionItemWidth[2] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
          {isApp && (
            <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
              Released Amount
            </Text>
          )}
          <VStack alignItems="flex-end" gap="2px">
            <Text color="text_caption">
              {formatNumberWithDown(positionInfo?.vestData?.releasedAmount)}
              {isApp ? ' CETUS' : ''}
            </Text>
            <HStack gap="4px">
              <Text fontSize="12px" color="primary">
                {positionInfo?.vestData?.releasedAmountRatio}%
              </Text>
              <Progress
                w="60px"
                h="4px"
                value={positionInfo?.vestData?.releasedAmountRatio}
                bg="primary_opacity.10"
                sx={{
                  'div[role="progressbar"]': {
                    bg: 'primary'
                  }
                }}
              />
            </HStack>
          </VStack>
        </HStack>
        <HStack w={{ base: '100%', lg: positionItemWidth[3] }} justify={{ base: 'space-between', lg: 'flex-end' }} gap="12px">
          {isApp && (
            <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
              Avl. to Claim
            </Text>
          )}
          <HStack>
            <Text color="text_caption">
              {formatNumberWithDown(positionInfo?.vestData?.availableAmount)}
              {isApp ? ' CETUS' : ''}
            </Text>
            <Button
              fontSize="12px"
              w="64px"
              h="24px"
              borderRadius="8px"
              onClick={() => handleRedeem(positionInfo.posId || positionInfo.id)}
              isLoading={redeemLoading}
              isDisabled={!positionInfo?.vestData?.availableAmount || Number(positionInfo?.vestData?.availableAmount) == 0 || redeemLoading}
            >
              Claim
            </Button>
          </HStack>
        </HStack>
      </HStack>
      <HStack
        w={{ base: '100%', lg: '100%' }}
        justify={{ base: 'space-between', lg: 'space-between' }}
        borderTop="1px solid"
        borderColor="border"
        pt={{ base: '16px', lg: '12px' }}
        mt={{ base: '4px', lg: '0' }}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <HStack justifyContent="space-between" w={{ base: '100%', lg: 'unset' }}>
          <CetusTooltip
            placement="top"
            children={
              <HStack alignItems="center" gap="0px">
                <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
                  Position Loss
                </Text>
                <Icon xlinkHref="#icon-icon_tips" svgW="16px" svgH="16px" />
              </HStack>
            }
            tooltip={
              <Text lineHeight="20px" fontSize="12px">
                {isVault
                  ? 'Your loss in your vault liquidity according to the post-attack snapshot of your LP token share.'
                  : 'Position loss calculated based on its pre-attack state and the resumed state.'}
              </Text>
            }
          />
          <Skeleton isLoaded={true}>
            <HStack flexDirection={{ base: 'column', lg: 'row' }} alignItems="flex-end">
              <Text fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                {formatNumberWithDown(positionInfo?.vestData?.impairedA)} {positionInfo?.displayTokenA?.symbol}
              </Text>
              <Text fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                {formatNumberWithDown(positionInfo?.vestData?.impairedB)} {positionInfo?.displayTokenB?.symbol}
              </Text>
            </HStack>
          </Skeleton>
        </HStack>
        <Text
          color="primary_gray"
          fontSize={{ base: '14px', lg: '12px' }}
          cursor="pointer"
          userSelect="none"
          _hover={{
            color: 'primary'
          }}
          onClick={() => setIsOpen(true)}
          mt={{ base: '20px', lg: '0' }}
        >
          {`Compensation Details >`}
        </Text>
      </HStack>
      <CompensationDetailModal isOpen={isOpen} setIsOpen={setIsOpen} periodDetails={positionInfo?.vestData?.periodDetails} />
    </VStack>
  )
}

export default PositionItemContent
