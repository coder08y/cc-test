import { AddressUnderline } from '@cetus/design'
import { ExplorerType } from '@cetus/hooks/src/useExplorer'
import { Icon } from '@cetus/ui-kit'
import { getTimeDifferenceString } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { Amounts } from './components'
import { DataItem, EventEnums } from './type'

const iconMap: Record<EventEnums, { icon: string; color: string; bgColor: string; title: string }> = {
  [EventEnums.add]: {
    icon: '#icon-a-icon_add1',
    color: 'primary_green',
    bgColor: 'primary_green_opacity.10',
    title: 'Add Liquidity'
  },
  [EventEnums.remove]: {
    icon: '#icon-tx_remove',
    color: 'light_coral',
    bgColor: 'primary_red_opacity.10',
    title: 'Remove Liquidity'
  },
  [EventEnums.swap]: {
    icon: '#icon-icon_swap',
    color: 'primary',
    bgColor: 'primary_opacity.10',
    title: 'Swap'
  }
}

interface MobileTransactionCardProps {
  item: DataItem
  getExplorerUrl: (address?: string, type?: ExplorerType) => string
  isReverse?: boolean
}

function MobileTransactionCard({ item, getExplorerUrl, isReverse }: MobileTransactionCardProps) {
  const { type, items, tx, block_time } = item
  const iconInfo = iconMap[type]
  const relativeTime = getTimeDifferenceString(block_time)

  const handleCardClick = () => {
    window.open(getExplorerUrl(tx, 'tx'), '_blank')
  }

  const handleTxClick = () => {
    window.open(getExplorerUrl(tx, 'tx'), '_blank')
  }

  return (
    <Box w="100%" onClick={handleCardClick} borderBottom="1px solid" borderColor="border" pb="12px">
      {/* 顶部：事件类型和时间戳 */}
      <HStack w="100%" justify="space-between" mb="12px" align="center">
        <HStack gap="4px">
          <Box w="20px" h="20px" bg={iconInfo.bgColor} borderRadius="5px" display="flex" alignItems="center" justifyContent="center">
            <Icon fontSize="16px" xlinkHref={iconInfo.icon} svgFill={iconInfo.color} svgHover={iconInfo.color} />
          </Box>

          <Text color={iconInfo.color} fontSize="14px">
            {iconInfo.title}
          </Text>
        </HStack>
        <Text fontSize="12px" textAlign="right">
          {relativeTime}
        </Text>
      </HStack>

      {/* 内容区域 */}
      <VStack align="flex-start" gap="8px">
        {/* Amounts */}
        <HStack justify="space-between" align="flex-start" gap="4px" w="100%">
          <Text fontSize="12px" pt="3px">
            Amounts
          </Text>
          <VStack align="flex-start">
            <Amounts items={items} type={type} isReverse={isReverse || false} />
          </VStack>
        </HStack>

        {/* Transactions */}
        <HStack justify="space-between" align="center" gap="4px" w="100%">
          <Text fontSize="12px">Transactions</Text>
          <Box onClick={e => e.stopPropagation()}>
            <AddressUnderline address={tx} color="primary" fontSize="12px" onClickLink={handleTxClick} />
          </Box>
        </HStack>
      </VStack>
    </Box>
  )
}

export default MobileTransactionCard
