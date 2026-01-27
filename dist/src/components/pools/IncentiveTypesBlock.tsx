import { FilterItem } from '@/types'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CheckBox, Icon } from '@cetus/ui-kit'
import { Button, HStack, Menu, MenuButton, MenuList, Text } from '@chakra-ui/react'
import { useState } from 'react'

interface FilterItemsBlockProps {
  incentiveTypesArr: string[]
  onClickIncentiveTypes: (item: FilterItem) => void
}

const IncentiveTypesBlock = ({ incentiveTypesArr, onClickIncentiveTypes }: FilterItemsBlockProps) => {
  const list = [
    {
      label: 'Mining',
      value: 'mining'
    },
    {
      label: 'Farming',
      value: 'farming'
    },
    {
      label: 'No incentives',
      value: 'noIncentives'
    }
  ]

  const [isOpen, setIsOpen] = useState(false)
  const { isApp } = useWindowWidth()
  return (
    <Menu
      isLazy
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
      }}
    >
      <MenuButton
        w={{
          base: '50%',
          lg: '200px'
        }}
        isActive={isOpen}
        as={Button}
        bg="bg_secondary"
        borderRadius="12px"
        border="1px solid"
        borderColor="border"
        h="40px"
        p="0px 10px"
        sx={{
          _hover: {
            bg: 'bg_secondary',
            '.drop-icon': {
              svg: {
                fill: 'text_caption'
              }
            }
          },
          _active: {
            bg: 'bg_secondary'
          }
        }}
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <HStack align="center" justifyContent="space-between">
          <HStack gap="8px">
            {!isApp && <Icon xlinkHref="#icon-icon_type_1" variant="gray" />}
            <Text color="text_paragraph">Incentive types</Text>
          </HStack>
          <HStack gap="8px">
            <Block p="1px 14px" borderRadius="8px" fontSize="12px" color="primary">
              {incentiveTypesArr?.length}
            </Block>
          </HStack>
        </HStack>
      </MenuButton>
      <MenuList
        p="0 16px 16px"
        opacity="1"
        overflow="hidden"
        w={{
          base: '175px',
          lg: '200px'
        }}
        minW={{
          base: '175px',
          lg: '200px'
        }}
      >
        {list.map((item: FilterItem, index: number) => {
          return (
            <HStack key={item.value} mt="16px">
              <CheckBox checked={incentiveTypesArr?.includes(item.value)} onClick={() => onClickIncentiveTypes(item)} />
              <Text>{item?.label}</Text>
            </HStack>
          )
        })}
      </MenuList>
    </Menu>
  )
}

export default IncentiveTypesBlock
