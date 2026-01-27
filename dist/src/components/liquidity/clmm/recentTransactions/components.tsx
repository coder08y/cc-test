import { AddressUnderline } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { ColumnsType } from '@cetus/ui-kit/src/components/Table'
import { addComma, getTimeDifferenceString, textEllipses } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { DataItem, EventEnums, IconProps, Item } from './type'

const iconMap: Record<EventEnums, IconProps> = {
  [EventEnums.add]: {
    icon: '#icon-a-icon_add1',
    color: 'primary_green',
    title: 'Add Liquidity'
  },
  [EventEnums.remove]: {
    icon: '#icon-tx_remove',
    color: 'light_coral',
    title: 'Remove Liquidity'
  },
  [EventEnums.swap]: {
    icon: '#icon-icon_swap',
    color: 'primary',
    title: 'Swap'
  }
}

const Event = ({ type }: { type: EventEnums }) => {
  return (
    <HStack>
      <Icon xlinkHref={iconMap[type]?.icon} svgFill={iconMap[type]?.color} svgHover={iconMap[type]?.color} />
      <Text color="text_caption">{iconMap[type]?.title}</Text>
    </HStack>
  )
}

const Amounts = ({ items, type, isReverse }: Pick<DataItem, 'items' | 'type'> & { isReverse: boolean }) => {
  const { isApp } = useWindowWidth()
  return items ? (
    type === EventEnums.swap ? (
      isApp ? (
        <VStack align="flex-end" gap="8px">
          <AmountItem item={items?.[0]} />
          <HStack justify="flex-end" gap="4px">
            <Icon xlinkHref="#icon-icon_right" fontSize="14px" svgFill="text_caption" svgHover="text_caption" />
            <AmountItem item={items?.[1]} />
          </HStack>
        </VStack>
      ) : (
        <HStack justify="flex-end" gap="8px">
          <AmountItem item={items?.[0]} />
          <Icon xlinkHref="#icon-icon_right" svgFill="text_caption" svgHover="text_caption" />
          <AmountItem item={items?.[1]} />
        </HStack>
      )
    ) : isApp ? (
      <VStack align="flex-end" gap="8px 16px" flexDir={isReverse ? 'column-reverse' : 'column'}>
        {items
          ?.filter(item => !!+item.amount)
          ?.map(item => (
            <AmountItem item={item} key={item?.address} />
          ))}
      </VStack>
    ) : (
      <HStack justify={isReverse ? 'flex-start' : 'flex-end'} gap="8px 16px" flexDir={isReverse ? 'row-reverse' : 'row'}>
        {items
          ?.filter(item => !!+item.amount)
          ?.map(item => (
            <AmountItem item={item} key={item?.address} />
          ))}
      </HStack>
    )
  ) : null
}

const AmountItem = ({ item }: { item: Item }) => {
  const { isApp } = useWindowWidth()
  return (
    <HStack gap="4px" flexDirection={isApp ? 'row-reverse' : 'row'}>
      <SingleCoinImage imageUrl={item?.url} w={isApp ? '16px' : '20px'} h={isApp ? '16px' : '20px'} />
      <HStack gap="4px">
        <Text fontSize={isApp ? '12px' : '14px'} color="text_caption">
          {addComma(item?.amount)}
        </Text>
        <Text fontSize={isApp ? '12px' : '14px'} color="text_caption">
          {textEllipses(item?.symbol, 10)}
        </Text>
      </HStack>
    </HStack>
  )
}

const getColumns = (getExplorerUrl: any, isReverse: boolean = false): ColumnsType<DataItem>[] => {
  const { isApp } = useWindowWidth()
  return [
    {
      title: isApp ? <></> : <Text>Event</Text>,
      key: 'type',
      render: ({ type }) => {
        return <Event type={type} />
      },
      thConfig: { h: '52px', p: '0 !important' },
      tdConfig: { p: '0 !important' }
    },
    {
      title: <Text textAlign="right">Amounts</Text>,
      key: 'amounts',
      render: ({ items, type }) => {
        return <Amounts items={items} type={type} isReverse={isReverse} />
      },
      thConfig: { h: '52px', p: '0 8px !important' },
      tdConfig: { p: '0 !important' }
    },
    {
      title: <Text textAlign="right">Transactions</Text>,
      key: 'tx',
      render: ({ tx }) => {
        return (
          <AddressUnderline
            address={tx}
            color="primary"
            fontSize="14px"
            onClickLink={() => {
              window.open(getExplorerUrl(tx, 'tx'), '_blank')
            }}
          />
        )
      },
      thConfig: { h: '52px', p: '0 8px !important' },
      tdConfig: { p: '0 !important' }
    },
    {
      title: <Text textAlign="right">Time</Text>,
      key: 'block_time',
      render: ({ block_time }) => {
        return <Text color="text_caption">{getTimeDifferenceString(block_time)}</Text>
      },
      thConfig: { h: '52px', p: '0 !important' },
      tdConfig: { p: '0 !important' }
    }
  ]
}

export { AmountItem, Amounts, Event, getColumns }
