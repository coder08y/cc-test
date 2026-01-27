import { CheckBox, Icon } from '@cetus/ui-kit'
import { Button, HStack, Menu, MenuButton, MenuList, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

interface FilterGroup {
  label: string
  type: string
  setType: (val: string) => void
  filterList: string[]
  singleSelect?: boolean
}

function CombinedFilter({
  filterGroups,
  menuWidth,
  autoApply = false,
  hideLabel = false,
  keepOpenOnSelect = false
}: {
  filterGroups: FilterGroup[]
  menuWidth?: string
  autoApply?: boolean
  hideLabel?: boolean
  keepOpenOnSelect?: boolean
}) {
  const [isHover, setIsHover] = useState(false)
  const [tempStates, setTempStates] = useState<{ [key: string]: string[] }>({})

  // 初始化临时状态 自动刷新会被重新set
  // useEffect(() => {
  //   const initial: { [key: string]: string[] } = {}
  //   filterGroups.forEach(group => {
  //     const isSingleSelect = group?.singleSelect || false
  //     const values = group.type ? group.type.split(',') : []

  //     if (isSingleSelect && values.length > 1) {
  //       // 单选模式下，如果值包含多个选项，优先选择 'All'，否则选择第一个
  //       if (values.includes('All')) {
  //         initial[group.label] = ['All']
  //       } else {
  //         initial[group.label] = [values[0]]
  //       }
  //     } else {
  //       initial[group.label] = values
  //     }
  //   })
  //   setTempStates(initial)
  // }, [filterGroups])

  const initTempStates = () => {
    const initial: Record<string, string[]> = {}

    filterGroups.forEach(group => {
      const isSingleSelect = group.singleSelect || false
      const values = group.type ? group.type.split(',') : []

      if (isSingleSelect && values.length > 1) {
        initial[group.label] = values.includes('All') ? ['All'] : [values[0]]
      } else {
        initial[group.label] = values
      }
    })

    setTempStates(initial)
  }

  const toggleType = (groupLabel: string, item: string, onClose?: () => void) => {
    setTempStates(prev => {
      const group = filterGroups.find(g => g.label === groupLabel)
      const isSingleSelect = group?.singleSelect || false
      const currentValues = prev[groupLabel] || []

      let newValues: string[]
      if (isSingleSelect) {
        // 单选模式：如果点击的是已选中的项，则取消选中（设置为 'All' 如果存在，否则为空）；否则只选中当前项
        if (currentValues.includes(item)) {
          // 如果 filterList 中有 'All'，则设置为 'All'，否则设置为空数组
          const hasAll = group?.filterList.includes('All')
          newValues = hasAll ? ['All'] : []
        } else {
          newValues = [item]
        }
      } else {
        // 多选模式：原有的逻辑
        newValues = currentValues.includes(item) ? currentValues.filter(i => i !== item) : [...currentValues, item]
      }

      // 如果是自动应用模式，立即更新所有筛选条件
      if (autoApply) {
        const updatedStates = {
          ...prev,
          [groupLabel]: newValues
        }
        // 应用所有筛选条件
        filterGroups.forEach(group => {
          const values = updatedStates[group.label] || []
          // 单选模式下，如果值为空数组，设置为空字符串；否则用逗号连接
          group.setType(values.length === 0 ? '' : values.join(','))
        })
        // 如果 keepOpenOnSelect 为 false，延迟关闭，确保状态更新完成
        if (!keepOpenOnSelect) {
          setTimeout(() => {
            onClose?.()
          }, 100)
        }
      }

      return {
        ...prev,
        [groupLabel]: newValues
      }
    })
  }

  const handleSave = (onClose: () => void) => {
    filterGroups.forEach(group => {
      const values = tempStates[group.label] || []
      group.setType(values.join(','))
    })
    onClose()
  }

  const handleCancel = (onClose: () => void) => {
    // 重置为当前值
    const initial: { [key: string]: string[] } = {}
    filterGroups.forEach(group => {
      initial[group.label] = group.type ? group.type.split(',') : []
    })
    setTempStates(initial)
    onClose()
  }

  return (
    <Menu
      isLazy
      // onClose={() => {
      //   // 重置为当前值
      //   const initial: { [key: string]: string[] } = {}
      //   filterGroups.forEach(group => {
      //     initial[group.label] = group.type ? group.type.split(',') : []
      //   })
      //   setTempStates(initial)
      // }}
      onOpen={initTempStates}
      // placement="bottom-end"
      offset={[0, 4]}
    >
      {({ isOpen, onClose }) => (
        <>
          <MenuButton
            as={Button}
            variant="outline"
            h="36px"
            border="none"
            bg="none !important"
            p="0"
            height="16px"
            lineHeight="16px"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <HStack gap="0" justify="center">
              <Icon xlinkHref="#icon-icon_filter" svgW="16px" svgH="16px" svgFill={isHover || isOpen ? 'text_caption' : 'text_paragraph'} />
            </HStack>
          </MenuButton>

          <MenuList zIndex={9999} p={'4px'} borderRadius={autoApply ? '8px' : '12px'} w={menuWidth || '128px'} minW={menuWidth || '128px'}>
            <VStack gap={autoApply ? '4px' : '8px'} align="stretch">
              {filterGroups.map((group, index) => (
                <VStack key={group.label} align="stretch" gap={0}>
                  {!hideLabel && group.label && (
                    <Text fontSize="12px" px={'4px'} py={'4px'} color="text_caption" fontWeight="500">
                      {group.label}
                    </Text>
                  )}
                  <VStack gap="4px" align="stretch">
                    {group.filterList.map(item => (
                      <HStack
                        key={item}
                        h="24px"
                        justify="space-between"
                        w="100%"
                        p={'0 4px'}
                        onClick={() => toggleType(group.label, item, onClose)}
                        cursor="pointer"
                        borderRadius="4px"
                        bg={tempStates[group.label]?.includes(item) ? 'primary_opacity.10' : 'none'}
                        // _hover={{ bg: autoApply ? 'none' : 'bg_hover' }}
                      >
                        <Text fontSize="12px" color={tempStates[group.label]?.includes(item) ? 'primary' : 'text_paragraph'}>
                          {item}
                        </Text>
                        <CheckBox
                          width="16px"
                          height="16px"
                          checkWidth="12px"
                          checkHeight="12px"
                          checked={tempStates[group.label]?.includes(item) || false}
                          onClick={() => {}}
                        />
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              ))}

              {!autoApply && (
                <Button fontSize="12px" w="100%" h="28px" lineHeight="28px" borderRadius="8px" onClick={() => handleSave(onClose)}>
                  Save
                </Button>
              )}
            </VStack>
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export default CombinedFilter
