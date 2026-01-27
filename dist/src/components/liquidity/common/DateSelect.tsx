import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CheckBox, Icon } from '@cetus/ui-kit'
import VaulDrawer from '@cetus/ui-kit/src/components/VaulDrawer'
import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

type DateSelectProps = {
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
  useDrawer?: boolean
}
export function DateSelect({ type, onTypeChange, list, buttonStyle = { color: 'text_caption' }, useDrawer = false }: DateSelectProps) {
  const [isHover, setIsHover] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<{ type: string; key: string }>(type)
  const { isApp } = useWindowWidth()

  useEffect(() => {
    setSelectedType(type)
  }, [type])

  const handleDrawerConfirm = () => {
    onTypeChange({ label: selectedType.type, key: selectedType.key })
    setIsOpen(false)
  }

  const handleDrawerItemClick = (item: { label: string; key: string }) => {
    setSelectedType({ type: item.label, key: item.key })
  }

  // 使用 Drawer 模式
  if (useDrawer && isApp) {
    return (
      <>
        <Button
          cursor="pointer"
          bg="none"
          p="0"
          h="auto"
          onClick={() => {
            setSelectedType(type)
            setIsOpen(true)
          }}
          sx={{
            _hover: {
              bg: 'none'
            },
            _active: {
              bg: 'none'
            }
          }}
        >
          <Block borderRadius="8px" {...buttonStyle} {...(isApp ? { border: 'none', bg: 'transparent', p: '0' } : { p: '5px 8px' })}>
            <HStack width="100%" justifyContent="space-between" gap="2px">
              <Text color={buttonStyle?.color} fontSize={{ base: '12px', lg: '14px' }}>
                {type?.type}
              </Text>
              <Icon
                transition="transform 0.5s"
                transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                xlinkHref="#icon-icon_descending_nor"
                svgFill={buttonStyle?.color}
                svgW="26px"
                svgH="26px"
              />
            </HStack>
          </Block>
        </Button>

        <VaulDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} padding="0 0 12px">
          <VStack w="100%" spacing={0} align="stretch">
            {/* 选项列表 */}
            <VStack w="100%" spacing={0} gap="4px" align="stretch" px="12px" pt="12px">
              {list.map(item => {
                const isSelected = selectedType?.key === item.key
                return (
                  <HStack
                    key={item.key}
                    w="100%"
                    h="36px"
                    justify="space-between"
                    cursor="pointer"
                    onClick={() => handleDrawerItemClick(item)}
                    bg={isSelected ? 'primary_opacity.10' : 'transparent'}
                    borderRadius="8px"
                    px="8px"
                  >
                    <Text fontSize="12px" fontWeight="500" color={isSelected ? 'primary' : 'text_paragraph'}>
                      {item.label}
                    </Text>
                    <CheckBox
                      checked={isSelected}
                      onClick={() => handleDrawerItemClick(item)}
                      wrapStyle={{
                        width: '16px',
                        height: '16px',
                        sx: {
                          '& svg': {
                            w: '12px',
                            h: '12px',
                            fill: isSelected ? '#000 !important' : 'transparent !important'
                          }
                        }
                      }}
                    />
                  </HStack>
                )
              })}
            </VStack>

            {/* Confirm 按钮 */}
            <Box p="12px">
              <Button
                w="100%"
                h="42px"
                bg="primary"
                color="#0F0F0F"
                borderRadius="8px"
                fontSize="14px"
                fontWeight="500"
                onClick={handleDrawerConfirm}
                sx={{
                  _hover: {
                    bg: 'primary_hover'
                  },
                  _active: {
                    bg: 'primary_hover'
                  }
                }}
              >
                Confirm
              </Button>
            </Box>
          </VStack>
        </VaulDrawer>
      </>
    )
  }

  // 原有的 Menu 模式
  return (
    <Menu isLazy placement="bottom-end" isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {() => (
        <>
          <MenuButton
            cursor="pointer"
            bg="none"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={() => setIsOpen(true)}
          >
            <Block borderRadius="8px" {...buttonStyle} {...(isApp ? { border: 'none', bg: 'transparent', p: '0' } : { p: '5px 8px' })}>
              <HStack width="100%" justifyContent="space-between" gap="2px">
                <Text color={buttonStyle?.color} fontSize={{ base: '12px', lg: '14px' }}>
                  {type?.type}
                </Text>
                <Icon
                  transition="transform 0.5s"
                  transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                  xlinkHref="#icon-icon_descending_nor"
                  svgFill={isOpen || isHover ? buttonStyle?.color : buttonStyle?.color}
                  svgW="26px"
                  svgH="26px"
                />
              </HStack>
            </Block>
          </MenuButton>

          <MenuList bg="bg_secondary" mt="-8px" borderRadius="8px" p="4px" opacity="1" overflow="hidden" minW="56px">
            <VStack w="54px" gap="4px">
              {list.map(item => (
                <MenuItem
                  key={item.key}
                  fontSize="14px"
                  textAlign="center"
                  borderRadius="8px"
                  color={type?.key === item.key ? 'primary' : '#909CA4'}
                  onClick={() => {
                    onTypeChange(item)
                    setIsOpen(false)
                  }}
                  bg="menu_item_bg"
                  justifyContent="center"
                  _hover={{ color: 'primary' }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </VStack>
          </MenuList>
        </>
      )}
    </Menu>
  )
}
