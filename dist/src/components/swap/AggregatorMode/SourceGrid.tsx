import { AggregatorDex, AggregatorProvider } from '@/types'
import { Box, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import AggregatorSwitch from './AggregatorSwitch'
import Item from './Item'
import NumBox from './NumBox'

interface ListProps {
  title: string
  isAllChecked: boolean
  onAllSelect(): void
  onItemSelect: (provider: AggregatorProvider, select: boolean) => void
  list: AggregatorDex[]
  checkedMap: Partial<Record<AggregatorProvider, boolean>>
  checkedNum: number
  totalNum: number
}
const SourceGrid = ({ title, isAllChecked, onAllSelect, onItemSelect, list = [], checkedMap = {}, checkedNum, totalNum }: ListProps) => {
  return (
    <VStack w="100%" justify="flex-start" gap="12px" maxH={{ base: 'max(200px, min(calc(50vh - 120px), 238px))', lg: '238px' }}>
      <HStack justifyContent="space-between" alignItems="center" w="100%" h="16px">
        <Text fontSize="14px" h="16px" margin="0px" lineHeight="16px" color="text_caption" fontWeight="500">
          {title}
        </Text>
        <HStack>
          <NumBox num={checkedNum} total={totalNum} />
          <AggregatorSwitch id={title} onChange={onAllSelect} isChecked={isAllChecked} />
        </HStack>
      </HStack>
      <Box w="100%">
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap="8px"
          maxH={{ base: 'max(140px, min(200px, calc(50vh - 200px)))', lg: '200px' }}
          overflowY="scroll"
          pb="8px"
          className="source-grid"
        >
          {list?.map(item => {
            return <Item key={item?.name} item={item} checkedMap={checkedMap} onSelect={onItemSelect} />
          })}
        </Grid>
        <Box
          w="100%"
          pos="relative"
          h="1px"
          _after={{
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: '8px',
            background: 'aggregator_box_shadow'
          }}
        />
      </Box>
    </VStack>
  )
}

export default SourceGrid
