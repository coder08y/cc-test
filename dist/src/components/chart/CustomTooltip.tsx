import { formatCurrency, formatNumber, formatPercentage } from '@cetus/utils'
import { Divider, HStack, Text, VStack } from '@chakra-ui/react'

function CustomTvlTooltip({ payload, label }) {
  return (
    payload &&
    payload.length && (
      <VStack
        padding="16px"
        bg="bg_secondary"
        borderRadius="12px"
        border="1px"
        borderColor="border"
        borderStyle="solid"
        justifyContent="flex-start"
        alignItems="left"
        gap="12px"
      >
        <Text fontSize="12px" color="#8BABBE">
          {payload[0]?.payload?.tooltipTime}
        </Text>

        <HStack>
          <Text color="text_caption" fontSize="12px">
            TVL
          </Text>
          <Text color="text_caption" fontSize="12px">
            ${formatNumber(payload[0]?.payload?.num, 2)}
          </Text>
        </HStack>
        {/* <HStack>
        <Image src="/images/wallet/binance.png" borderRadius="50%" width="16px" height="16px" />
        <Text fontSize="12px" color="text_caption">
          20,000 SUI
        </Text>
      </HStack>
      <HStack>
        <Image src="/images/wallet/binance.png" borderRadius="50%" width="16px" height="16px" />
        <Text fontSize="12px" color="text_caption">
          20,000 SUI
        </Text>
      </HStack> */}
      </VStack>
    )
  )
}

function CustomAllTvlTooltip({ payload, label, currentTime }) {
  console.log(payload, label, currentTime, 'CustomAllTvlTooltip')
  const { total, clmm, dlmm } = payload?.[0]?.payload ?? {}
  return (
    payload &&
    payload.length && (
      <VStack
        padding="12px 8px 8px"
        bg="bg_secondary"
        borderRadius="8px"
        border="1px solid"
        borderColor="border"
        justifyContent="flex-start"
        alignItems="left"
        gap="12px"
      >
        <Text fontSize="14px">{currentTime}</Text>
        <VStack w="100%" gap="4px">
          <HStack w="100%" gap="16px" justify="space-between">
            <Text h="20px" lineHeight="20px" fontSize="12px" color="primary_gray">
              Total TVL
            </Text>
            <Text h="20px" lineHeight="20px" fontSize="12px" color="text_caption">
              ${formatNumber(total)}
            </Text>
          </HStack>
          <Divider orientation="horizontal" />
          <HStack gap="16px" justify="space-between">
            <VStack align="flex-start" gap="4px">
              <Text h="20px" lineHeight="20px" fontSize="12px" color="primary_gray">
                CLMM TVL
              </Text>
              <Text h="20px" lineHeight="20px" fontSize="12px" color="primary_gray">
                DLMM TVL
              </Text>
            </VStack>
            <VStack align="flex-end" gap="4px">
              <Text h="20px" lineHeight="20px" fontSize="12px" color="text_caption">
                ${formatNumber(clmm)}
              </Text>
              <Text h="20px" lineHeight="20px" fontSize="12px" color="text_caption">
                ${formatNumber(dlmm)}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    )
  )
}

function ApyAndFeesChartTooltip({ payload, symbol }) {
  return (
    payload &&
    payload.length && (
      <VStack
        padding="16px"
        bg="bg_secondary"
        borderRadius="12px"
        border="1px"
        borderStyle="solid"
        borderColor="border"
        justifyContent="flex-start"
        alignItems="left"
      >
        <Text fontSize="12px">{payload[0].payload.tooltipTime}</Text>
        <HStack>
          <Text color="primary_green" fontSize="12px">
            Cumulative Yields
          </Text>
          <Text color="primary_green" fontSize="12px">
            {formatNumber(payload[0].payload.lp_fee, 6)} {symbol}
          </Text>
        </HStack>
        <HStack textAlign="left">
          <Text color="primary" fontSize="12px">
            APY
          </Text>
          <Text color="primary" fontSize="12px">
            {formatPercentage(payload[0].payload.apy, 2)}
          </Text>
        </HStack>
      </VStack>
    )
  )
}

export { ApyAndFeesChartTooltip, CustomAllTvlTooltip, CustomTvlTooltip }
