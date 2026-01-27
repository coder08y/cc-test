import { SingleCoinImage } from '@cetus/ui-kit'
import { fixRounding, formatNumber, fromDecimalsAmountFix, textEllipses } from '@cetus/utils'
import { Box, HStack, Text } from '@chakra-ui/react'
function RewardsTooltip({ item }: { item: any }) {
  return (
    <HStack key={item?.coinType} gap="4px">
      <Box>
        <SingleCoinImage imageUrl={item?.tokenInfo?.logo_url} w="24px" h="24px" />
      </Box>
      {item?.isMining && (
        <Text color="primary" display="inline-block">
          {/* 处理精度后向上取整展示位隔符 */}
          {formatNumber(fixRounding(fromDecimalsAmountFix(item?.emissionsEveryDay, item?.tokenInfo?.decimals), 2))}{' '}
          {textEllipses(item?.tokenInfo?.symbol, 8)} per day in Mining
        </Text>
      )}
      {item?.isFarming && (
        <Text color="primary" display="inline-block">
          {/* 处理精度后向上取整展示位隔符 */}
          {formatNumber(fixRounding(item?.emissionsEveryDay, 2))} {textEllipses(item?.tokenInfo?.symbol, 8)} per day in Farming
        </Text>
      )}
    </HStack>
  )
}

export default RewardsTooltip
