import { Icon } from '@cetus/ui-kit'
import { cancelBubble, textEllipses } from '@cetus/utils'
import { Button, Center, Menu, MenuButton, MenuItem, MenuList, Portal, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

interface MenuDropBlockProps {
  label: string
  showLabel?: boolean
  list?: string[]
  onListItemClick?: (item: string) => void
}

export default function MenuDropBlock({ label, showLabel = true, list = [], onListItemClick = () => {} }: MenuDropBlockProps) {
  const [isShowList, setIsShowList] = useState(false)

  return (
    <Menu isLazy placement="bottom-end" onClose={() => setIsShowList(false)}>
      <MenuButton
        as={Button}
        bg="none"
        p="0"
        h="14px"
        _hover={{ bg: 'none', p: { color: 'text_caption' }, svg: { fill: 'text_caption' } }}
        _active={{ bg: 'none' }}
        onClick={e => {
          cancelBubble(e)
          setIsShowList(!isShowList)
        }}
      >
        <Center>
          {showLabel && <Text color="text_caption">{textEllipses(label)}</Text>}
          <Icon
            svgW="12px"
            svgH="12px"
            xlinkHref="#icon-icon_arrow"
            transform={isShowList ? 'rotate(180deg)' : 'rotate(0deg)'}
            transition="transform 0.5s"
            mr="-4px"
          />
        </Center>
      </MenuButton>
      <Portal>
        <MenuList p="4px" borderRadius="8px" minW="144px" position="relative" zIndex={9}>
          <VStack gap="4px">
            {list.map(item => (
              <MenuItem
                key={item}
                w="100%"
                minW="144px"
                p="8px"
                bg="menu_item_bg"
                borderRadius="4px"
                cursor="pointer"
                color={label === item ? 'primary' : 'text_caption'}
                _hover={{ color: 'primary' }}
                onClick={() => {
                  onListItemClick(item)
                  setIsShowList(false)
                }}
              >
                {item}
              </MenuItem>
            ))}
          </VStack>
        </MenuList>
      </Portal>
    </Menu>
  )
}
