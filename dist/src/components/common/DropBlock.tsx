import { Icon } from '@cetus/ui-kit' // 如果你是用这个组件库的话
import { Button, ButtonProps, HStack, Menu, MenuButton, MenuList, Text, VStack } from '@chakra-ui/react'
import React from 'react'

interface TradeTabItem {
  label: string
  [key: string]: any // 可扩展字段
}

interface DropBlockProps {
  currenTab: string
  tabList: TradeTabItem[]
  onChange: (tab: string) => void
  wrapStyle?: ButtonProps
}

const DropBlock: React.FC<DropBlockProps> = ({ currenTab, tabList, onChange, wrapStyle }) => {
  return (
    <Menu isLazy>
      {({ isOpen, onClose }) => (
        <>
          <MenuButton
            as={Button}
            variant="outline"
            h="32px"
            border="none"
            height="32px"
            bg="none"
            p="0px"
            lineHeight="16px"
            _hover={{ bg: 'none' }}
            _active={{ bg: 'none' }}
            onClick={() => {
              console.log('Menu opened or toggled')
            }}
            {...wrapStyle}
          >
            <HStack gap="0" justify="center">
              <Text color="primary_gray" fontSize={{ base: '14px', lg: '13px' }}>
                {currenTab}
              </Text>
              <Icon
                mt="1px"
                xlinkHref="#icon-icon_arrow"
                svgW="14px"
                transition="transform 0.5s"
                svgH="14px"
                transform={isOpen ? 'rotate(180deg)' : 'none'}
              />
            </HStack>
          </MenuButton>

          <MenuList zIndex={9999} p="4px" minW="100px">
            <VStack gap="0px">
              {tabList?.map(item => (
                <HStack
                  key={item.label}
                  h="30px"
                  justify="flex-start"
                  w="100%"
                  p="0 12px"
                  cursor="pointer"
                  onClick={() => {
                    onChange(item.label)
                    onClose()
                  }}
                >
                  <Text fontSize="12px" color={item.label == currenTab ? 'text_caption' : 'text_paragraph'}>
                    {item.label}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export default DropBlock
