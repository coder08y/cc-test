import { Block } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { HStack, Menu, MenuButton, MenuItem, MenuList, VStack } from '@chakra-ui/react'
import { useState } from 'react'

type ChartSelectProps = {
  type: {
    type: string
    key: string
  }
  onTypeChange: (item: { label: string; key: string }) => void
  list: {
    label: string
    key: string
  }[]
  buttonStyle?: any
}
export function ChartSelect({ type, onTypeChange, list, buttonStyle = { color: 'text_caption' } }: ChartSelectProps) {
  const [isHover, setIsHover] = useState(false)
  return (
    <Menu isLazy placement="bottom-end">
      {({ isOpen, onClose }) => (
        <>
          <MenuButton cursor="pointer" bg="none" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
            <Block p="5px 8px" borderRadius="8px" {...buttonStyle}>
              <HStack width="100%" justifyContent="space-between" gap="2px">
                <Icon xlinkHref={type?.key} fontSize="16px" />
                <Icon
                  transition="transform 0.5s"
                  transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                  xlinkHref="#icon-icon_descending_nor"
                  svgFill={isOpen || isHover ? 'text_caption' : buttonStyle?.color}
                  svgW="26px"
                  svgH="26px"
                />
              </HStack>
            </Block>
          </MenuButton>

          <MenuList bg="bg_secondary" mt="-8px" borderRadius="8px" p="4px" opacity="1" minW="56px">
            <VStack gap="4px" align="flex-start">
              {list.map(item => (
                <MenuItem
                  key={item.key}
                  fontSize="14px"
                  textAlign="center"
                  borderRadius="8px"
                  color={type?.key === item.key ? 'primary' : '#909CA4'}
                  onClick={() => onTypeChange(item)}
                  bg="menu_item_bg"
                  _hover={{ color: 'primary', svg: { fill: 'primary' } }}
                >
                  <Icon xlinkHref={item?.key} svgFill={type?.key === item.key ? 'primary' : '#909CA4'} fontSize="16px" mr="8px" />
                  {item?.label}
                </MenuItem>
              ))}
            </VStack>
          </MenuList>
        </>
      )}
    </Menu>
  )
}
