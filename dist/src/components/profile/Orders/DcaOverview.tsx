import DcaItemCoinPirBlock from '@/components/dca/DcaItemBlock/DcaItemCoinPirBlock'
import { WarningDetails, getAmountWithdrawn, getBuyCoinBalance, getSellCoinBalance } from '@/components/dca/OverviewOrders'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { d, utcTimeFormatted } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

export default function DcaOverview({
  orderInfo,
  isActiveOrder,
  pageDirect,
  isClaimLoading = false,
  toClaim
}: {
  orderInfo: any
  isActiveOrder?: boolean
  pageDirect: boolean
  isClaimLoading?: boolean
  toClaim?: (orderInfo: any) => void
}) {
  const { inCoin: sellCoin, outCoin: buyCoin } = orderInfo
  return (
    <VStack pb="24px">
      {orderInfo?.isShowTradeTips && orderInfo?.orderStatus == 'Active' && isActiveOrder && <WarningText />}
      <HStack w="100%" justify="space-between">
        <DcaItemCoinPirBlock orderInfo={orderInfo} />
        {isActiveOrder && toClaim && (
          <Button
            isLoading={isClaimLoading}
            onClick={() => toClaim(orderInfo)}
            isDisabled={orderInfo?.outBalance <= 0 || isClaimLoading}
            h="32px"
            fontSize="12px"
            borderRadius="8px"
            lineHeight="32px"
            p="0 8px"
            fontWeight="500"
          >
            Claim
          </Button>
        )}
      </HStack>

      <Text fontSize="16px" color="text_caption">
        {getAmountWithdrawn(orderInfo, isActiveOrder, true)}
      </Text>
      <Text fontSize="12px">Amount Withdrawn</Text>

      <HStack w="100%" justify="space-around">
        <VStack>
          <Text fontSize="16px" color="text_caption">
            {getSellCoinBalance(orderInfo)}
          </Text>
          <Text fontSize="12px">DCA {sellCoin?.symbol} Balance</Text>
        </VStack>
        <Box as="span" display="inline-block" w="1px" h="20px" bg="border" />
        <VStack>
          <Text color="text_caption" fontSize="16px">
            {getBuyCoinBalance(orderInfo)}
          </Text>
          <Text fontSize="12px">DCA {buyCoin?.symbol} Balance </Text>
        </VStack>
      </HStack>
      <VStack mt="28px" w="100%" gap="20px">
        <HTextLabelBox label="Invest Every" value={orderInfo?.investEvery} />
        {d(orderInfo?.ofOrderLeft).gt('0') && <HTextLabelBox label="Orders Left" value={orderInfo?.ofOrderLeft} />}

        <HTextLabelBox label="Each Order Size" value={`${orderInfo?.eachOrderSize} ${sellCoin?.symbol}`} />
        {isActiveOrder &&
          ((orderInfo?.currentAvgPrice && orderInfo?.currentAvgPrice !== '--') ||
            (orderInfo?.currentAvgPriceResever && orderInfo?.currentAvgPriceResever !== '--')) && (
            <HTextLabelBox
              label="Current Avg. Price"
              value={
                pageDirect
                  ? `${orderInfo?.currentAvgPrice} ${sellCoin?.symbol} per ${buyCoin?.symbol}`
                  : `${orderInfo?.currentAvgPriceResever} ${buyCoin?.symbol} per ${sellCoin?.symbol}`
              }
            />
          )}
        {!isActiveOrder && orderInfo?.currentAvgPrice !== '--' && (
          <HTextLabelBox
            label="Avg. Price"
            value={
              pageDirect
                ? `${orderInfo?.currentAvgPrice} ${sellCoin?.symbol} per ${buyCoin?.symbol}`
                : `${orderInfo?.currentAvgPriceResever} ${buyCoin?.symbol} per ${sellCoin?.symbol}`
            }
          />
        )}
        {isActiveOrder && <HTextLabelBox label="Next Order (UTC)" value={utcTimeFormatted(orderInfo?.nextCycleAtTimeStamp) || ''} />}
        <HTextLabelBox label="Created (UTC)" value={utcTimeFormatted(orderInfo?.created_at * 1000) || ''} />
      </VStack>
    </VStack>
  )
}

const WarningText = () => {
  const [isDetail, setIsDetail] = useState(false)
  return (
    <VStack p="12px" align="flex-start" bg="primary_yellow_opacity.10" borderRadius="8px">
      <HStack align="center" w="100%" cursor="pointer" onClick={() => setIsDetail(!isDetail)}>
        <Text fontSize="12px" color="primary_yellow" lineHeight="20px" textAlign="left">
          The system tried to execute your order multiple times but did not get it through. This is possibly because:
        </Text>
        <Icon
          transform={isDetail ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.5s"
          svgW="12px"
          svgH="12px"
          variant="warning"
          xlinkHref="#icon-icon_arrow"
        />
      </HStack>
      {isDetail && (
        <VStack align="flex-start" w="100%">
          <Box w="100%" h="1px" bg="primary_yellow_opacity.10" m="4px 0" />
          <WarningDetails />
        </VStack>
      )}
    </VStack>
  )
}
