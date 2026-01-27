import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { isAvailableObject } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import CompensationPositionItemContent from './CompensationPositionItemContent'

const itemWidth = ['30%', '25%', '25%', '25%']

const tableHeaderList = [
  { label: 'NFT Info', value: 'NFT Info' },
  { label: 'Total  Compensation  (CETUS)', value: 'Total  Compensation  (CETUS)' },
  { label: 'Released Amount (CETUS)', value: 'Released Amount (CETUS)' },
  { label: 'Avl. to Claim  (CETUS)', value: 'Avl. to Claim  (CETUS)' }
]

export default function CompensationPositionItem({ poolInfo, isVault }: { poolInfo: any; isVault: boolean }) {
  const positionList = useMemo(() => {
    if (!isAvailableObject(poolInfo)) return []
    return poolInfo.list
  }, [poolInfo?.list])

  const { isApp } = useWindowWidth()
  return (
    <VStack gap="12px" w="100%">
      {!isApp && (
        <HStack w="100%" p="0 16px">
          {tableHeaderList.map((item, idx) => {
            return (
              <HStack key={item.value} gap="4px" w={itemWidth[idx]} justify={idx == 0 ? 'flex-start' : 'flex-end'}>
                <Text>{item.value}</Text>
              </HStack>
            )
          })}
        </HStack>
      )}
      <VStack w="100%" maxH="440px" overflow="auto" gap={{ base: '8px', lg: '12px' }}>
        {positionList.map((item: any) => (
          <CompensationPositionItemContent key={item?.id} positionInfo={item} positionItemWidth={itemWidth} isVault={isVault} />
        ))}
      </VStack>
    </VStack>
  )
}
