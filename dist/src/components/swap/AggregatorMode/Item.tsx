import Lock from '@/assets/images/cetus_lock.png'
import { AggregatorDex, AggregatorProvider } from '@/types/swap'
import { CheckBox, Icon, SingleCoinImage } from '@cetus/ui-kit'
import { cancelBubble, d } from '@cetus/utils'
import { Center, GridItem, HStack, Image, Menu, MenuButton, MenuList, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useScroll } from 'ahooks'
import { useEffect, useMemo, useRef } from 'react'
const MAX_CLICK_COUNT = 5
const TIMEOUT = 2000

interface ItemProps {
  item: AggregatorDex
  checkedMap: Partial<Record<AggregatorProvider, boolean>>
  onSelect: (provider: AggregatorProvider, select: boolean) => void
}

const Item = (props: ItemProps) => {
  const { item } = props

  if (item?.subItems) {
    return <ItemWithChildren {...props} />
  }

  if (item?.id === AggregatorProvider?.CETUS) {
    return <CetusItem {...props} />
  }

  return <RegularItem {...props} />
}

const ItemWithChildren = ({ item, checkedMap, onSelect }: ItemProps) => {
  const getIsChecked = (id: AggregatorProvider) => {
    return !!checkedMap?.[id]
  }

  const isAllChecked = item?.subItems?.every(child => getIsChecked(child?.id as AggregatorProvider))
  const onSelectAll = (e: any) => {
    if (isDisabled) return
    if (item?.subItems?.every(child => getIsChecked(child?.id as AggregatorProvider))) {
      item?.subItems?.forEach(child => onSelect(child?.id as AggregatorProvider, false))
    } else {
      item?.subItems?.forEach(child => onSelect(child?.id as AggregatorProvider, true))
    }
  }

  const { isOpen, onClose, onOpen, onToggle } = useDisclosure()
  const checkedNum = useMemo(() => {
    return item?.subItems?.reduce(
      (sum, child) =>
        d(sum)
          .plus(getIsChecked(child?.id as AggregatorProvider) ? 1 : 0)
          .toNumber(),
      0
    )
  }, [JSON.stringify(item?.subItems), checkedMap])
  const ref = useRef(null)

  const isDisabled = item?.groupId === 'CETUS'

  // 添加连续点击彩蛋功能
  const countRef = useRef(0)
  const timer = useRef<any>(null)

  const resetCount = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      countRef.current = 0
    }
  }

  const handleEasterEggClick = (targetChild?: AggregatorDex) => {
    if (!isDisabled) return

    countRef.current = countRef.current + 1
    if (countRef.current === 1) {
      timer.current = setTimeout(resetCount, TIMEOUT)
    }

    if (countRef.current === MAX_CLICK_COUNT) {
      // 触发彩蛋
      if (targetChild) {
        // 如果指定了目标子项，直接选择该子项
        onSelect(targetChild?.id as AggregatorProvider, !getIsChecked(targetChild?.id as AggregatorProvider))
      }
      resetCount()
    }
  }

  const scroll = useScroll(document.querySelector('.source-grid'))

  useEffect(() => {
    if (isOpen && scroll) {
      onClose()
    }
  }, [scroll?.top])

  return (
    <GridItem>
      <HStack
        ref={ref}
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        gap={{ base: '0px', lg: '8px' }}
        bg={isAllChecked ? 'checked_bg' : 'bg_primary'}
        boxShadow={isAllChecked ? 'aggregator_shadow' : 'unset'}
        border="1px solid"
        borderColor={isAllChecked ? 'position_status_bg' : 'border'}
        borderRadius="8px"
        p="0 0 0 12px"
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        onClick={onSelectAll}
        sx={{
          _hover: {
            '.source_name': {
              color: 'primary'
            }
          }
        }}
      >
        <HStack gap="8px">
          <SingleCoinImage imageUrl={item?.logo} w="24px" h="24px" />
          <Text
            className="source_name"
            color={isAllChecked ? 'primary' : 'text_paragraph'}
            whiteSpace="nowrap"
            fontSize="13px"
            h="20px"
            lineHeight="20px"
          >
            {item?.name}
          </Text>
          {isDisabled && <Image src={Lock} w="16px" h="16px" />}
        </HStack>
        <Menu gutter={4} placement="bottom-end" isLazy isOpen={isOpen} onOpen={() => {}} onClose={onClose}>
          <MenuButton
            margin="-1px"
            bg={isAllChecked ? 'checked_bg' : 'bg_primary'}
            boxShadow={isAllChecked ? 'aggregator_shadow' : 'unset'}
            border="1px solid"
            borderColor={isAllChecked ? 'position_status_bg' : 'border'}
            flex="0 0 58px"
            h="50px"
            borderRadius="8px"
            className="arrow_box"
            onClick={e => {
              cancelBubble(e)
              onToggle()
            }}
            _hover={{
              svg: {
                fill: 'primary'
              }
            }}
          >
            <Center gap="4px">
              <Text fontSize="10px" color="primary">
                {checkedNum}
              </Text>
              <Text fontSize="10px">/ {item?.subItems?.length || 0}</Text>
              <Icon
                xlinkHref="#icon-icon_arrow"
                fontSize="12px"
                variant="gray"
                transition="transform 0.5s"
                transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
              />
            </Center>
          </MenuButton>
          <MenuList
            minW="unset"
            w={(ref?.current as any)?.offsetWidth}
            borderRadius="8px"
            p="12px 8px 12px 12px"
            bg="checked_bg"
            boxShadow="aggregator_shadow"
            borderColor="position_status_bg"
            onClick={e => {
              cancelBubble(e)
            }}
          >
            <VStack w="100%" gap="20px">
              {item?.subItems?.map(child => (
                <HStack
                  key={child.name}
                  justifyContent="space-between"
                  w="100%"
                  h="20px"
                  cursor={isDisabled ? 'not-allowed' : 'pointer'}
                  onClick={e => {
                    cancelBubble(e)
                    if (isDisabled) {
                      // 如果被禁用，尝试触发彩蛋，传入当前子项
                      handleEasterEggClick(child)
                      return
                    }
                    onSelect(child?.id as AggregatorProvider, !getIsChecked(child?.id as AggregatorProvider))
                  }}
                >
                  <Text color="text_caption" fontSize="12px">
                    {child?.name}
                  </Text>
                  <CheckBox isDisabled={isDisabled} checked={getIsChecked(child?.id as AggregatorProvider)} onClick={() => {}} />
                </HStack>
              ))}
            </VStack>
          </MenuList>
        </Menu>
      </HStack>
    </GridItem>
  )
}

const CetusItem = ({ item, checkedMap, onSelect }: ItemProps) => {
  const countRef = useRef(0)
  const timer = useRef<any>(null)
  const isChecked = !!(checkedMap as any)?.[item?.id]
  const resetCount = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      countRef.current = 0
    }
  }

  const handleChange = () => {
    countRef.current = countRef.current + 1
    if (countRef.current === 1) {
      timer.current = setTimeout(resetCount, TIMEOUT)
    }

    if (countRef.current === MAX_CLICK_COUNT) {
      onSelect(item?.id as AggregatorProvider, !(checkedMap as any)?.[item?.id])
      resetCount()
    }
  }
  return (
    <GridItem>
      <HStack
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        onClick={handleChange}
        cursor="not-allowed"
        bg={isChecked ? 'checked_bg' : 'bg_primary'}
        boxShadow={isChecked ? 'aggregator_shadow' : 'unset'}
        border="1px solid"
        borderColor={isChecked ? 'position_status_bg' : 'border'}
        borderRadius="8px"
        p="12px"
        _hover={{
          p: {
            color: 'primary'
          }
        }}
      >
        <HStack gap="8px">
          <SingleCoinImage imageUrl={item?.logo} w="24px" h="24px" />
          <Text color={isChecked ? 'primary' : 'text_paragraph'} whiteSpace="nowrap" fontSize="13px" h="20px" lineHeight="20px">
            {item?.name}
          </Text>
        </HStack>
        {isChecked && <Image src={Lock} w="16px" h="16px" />}
      </HStack>
    </GridItem>
  )
}

const RegularItem = ({ item, checkedMap, onSelect }: ItemProps) => {
  const isChecked = !!(checkedMap as any)?.[item?.id]
  return (
    <GridItem>
      <HStack
        w="100%"
        gap="8px"
        cursor="pointer"
        p="12px"
        onClick={() => onSelect(item?.id as AggregatorProvider, !(checkedMap as any)?.[item?.id])}
        border="1px solid"
        borderRadius="8px"
        borderColor={isChecked ? 'position_status_bg' : 'border'}
        bg={isChecked ? 'checked_bg' : 'bg_primary'}
        boxShadow={isChecked ? 'aggregator_shadow' : 'unset'}
        _hover={{
          p: {
            color: 'primary'
          }
        }}
      >
        <SingleCoinImage imageUrl={item?.logo} w="24px" h="24px" />
        <Text color={isChecked ? 'primary' : 'text_paragraph'} whiteSpace="nowrap" fontSize="13px" h="20px" lineHeight="20px">
          {item?.name}
        </Text>
      </HStack>
    </GridItem>
  )
}

export default Item
