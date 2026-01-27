import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CheckBox, Icon } from '@cetus/ui-kit'
import { Button, HStack, Menu, MenuButton, MenuList, Text, TextProps, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

function TypeCon({
  type,
  setType,
  filterList,
  labelText,
  labelStyle = {},
  autoApply = false,
  menuWidth = '156px'
}: {
  type: string
  setType: (val: string) => void
  filterList?: string[]
  labelText?: string
  labelStyle?: TextProps
  autoApply?: boolean
  menuWidth?: string
}) {
  const { isApp } = useWindowWidth()
  const list = filterList || ['Buy', 'Sell', 'Add', 'Remove']

  const [tempTypes, setTempTypes] = useState<string[]>(type ? type.split(',') : [])

  const toggleType = (item: string, onClose?: () => void) => {
    const newTypes = tempTypes.includes(item) ? tempTypes.filter(i => i !== item) : [...tempTypes, item]
    setTempTypes(newTypes)

    // 如果是自动应用模式，立即更新并关闭弹窗
    if (autoApply) {
      setType(newTypes.join(','))
      // 延迟关闭，确保状态更新完成
      setTimeout(() => {
        onClose?.()
      }, 100)
    }
  }

  useEffect(() => {
    setTempTypes(type ? type.split(',') : [])
  }, [type])

  const [isHover, setIsHover] = useState(false)

  return (
    <Menu
      isLazy
      onClose={() => {
        setTempTypes(type ? type.split(',') : [])
      }}
    >
      {({ onClose }) => (
        <>
          <MenuButton
            as={Button}
            variant="outline"
            h="36px"
            border="none"
            bg="none"
            p="0"
            height="16px"
            lineHeight="16px"
            w={{ base: '156px', lg: 'unset' }}
            _hover={{ bg: 'none' }}
            _active={{ bg: 'none' }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <HStack gap="0" justify="center">
              <Text color="primary_gray" fontSize="13px" {...labelStyle}>
                {labelText || 'Type'}
              </Text>
              {/* {!isApp && ( */}
              <Icon mt="1px" xlinkHref="#icon-icon_filter" svgW="16px" svgH="16px" />
              {/* )} */}
            </HStack>
          </MenuButton>

          <MenuList
            zIndex={9999}
            p="4px"
            sx={{
              position: 'absolute',
              left: 0,
              top: '8px',
              borderRadius: autoApply ? '8px' : '12px'
            }}
            w={menuWidth}
            minW={menuWidth}
          >
            <VStack gap={autoApply ? '4px' : '8px'}>
              {list.map(item => (
                <HStack
                  bg={autoApply && tempTypes.includes(item) ? 'primary_opacity.10' : 'none'}
                  borderRadius="4px"
                  key={item}
                  h="30px"
                  justify="space-between"
                  w="100%"
                  p="0 12px"
                  onClick={() => toggleType(item, onClose)}
                  cursor="pointer"
                >
                  <Text fontSize="12px" color={autoApply && tempTypes.includes(item) ? 'primary' : 'text_caption'}>
                    {item}
                  </Text>
                  <CheckBox width="16px" height="16px" checkWidth="12px" checkHeight="12px" checked={tempTypes.includes(item)} onClick={() => {}} />
                </HStack>
              ))}

              {!autoApply && (
                <HStack w="100%" justify="space-between" mt="8px" p="0">
                  <Button
                    fontSize="12px"
                    h="28px"
                    lineHeight="28px"
                    borderRadius="8px"
                    variant="outline"
                    w="50%"
                    onClick={() => {
                      setTempTypes(type ? type.split(',') : [])
                      onClose()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fontSize="12px"
                    w="50%"
                    h="28px"
                    lineHeight="28px"
                    borderRadius="8px"
                    onClick={() => {
                      setType(tempTypes.join(','))
                      onClose()
                    }}
                  >
                    Apply
                  </Button>
                </HStack>
              )}
            </VStack>
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export default TypeCon
