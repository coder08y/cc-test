import VaulDrawer from '@cetus/ui-kit/src/components/VaulDrawer'
import { cancelBubble } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const SortSvg = ({ fill }: { fill: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" fill={fill}>
      <path fill={fill} d="m3.293 11.293 1.414 1.414L11 6.414V20h2V6.414l6.293 6.293 1.414-1.414L12 2.586l-8.707 8.707z" />
    </svg>
  )
}

export type SortOption = {
  label: string
  value: string
}

interface MobileSortDrawerProps {
  isOpen: boolean
  onClose: () => void
  sortText?: string
  currentSort: SortOption
  currentSortRule: 'asc' | 'desc'
  sortByList: SortOption[]
  onConfirm: (item: SortOption, rule: 'asc' | 'desc') => void
}

function MobileSortDrawer({ isOpen, onClose, sortText = 'Sort by', currentSort, currentSortRule, sortByList, onConfirm }: MobileSortDrawerProps) {
  const [selectedSort, setSelectedSort] = useState<SortOption>(currentSort)
  const [selectedSortRule, setSelectedSortRule] = useState<'asc' | 'desc'>(currentSortRule)

  // 当抽屉打开或外部状态变化时，更新内部状态
  useEffect(() => {
    if (isOpen) {
      setSelectedSort(currentSort)
      setSelectedSortRule(currentSortRule)
    }
  }, [isOpen, currentSort, currentSortRule])

  const handleItemClick = (item: SortOption) => {
    setSelectedSort(item)
    // 如果选择的是当前已选中的项，保持当前排序规则；否则重置为降序
    if (item.value === currentSort.value) {
      setSelectedSortRule(currentSortRule)
    } else {
      setSelectedSortRule('desc')
    }
  }

  const handleSortRuleClick = (e: React.MouseEvent, item: SortOption, rule: 'asc' | 'desc') => {
    cancelBubble(e)
    setSelectedSort(item)
    setSelectedSortRule(rule)
  }

  const handleConfirm = () => {
    onConfirm(selectedSort, selectedSortRule)
    onClose()
  }

  return (
    <VaulDrawer isOpen={isOpen} onClose={onClose} padding="0 0 12px">
      <VStack w="100%" spacing={0} align="stretch">
        {/* 标题 */}
        <Box p="12px">
          <Text fontSize="14px" fontWeight="500" color="white">
            {sortText}
          </Text>
        </Box>

        {/* 选项列表 */}
        <VStack w="100%" spacing={0} gap="4px" align="stretch" px="12px">
          {sortByList.map(item => {
            const isSelected = selectedSort?.value === item.value
            const isAscSelected = isSelected && selectedSortRule === 'asc'
            const isDescSelected = isSelected && selectedSortRule === 'desc'
            return (
              <HStack
                key={item.value}
                w="100%"
                h="36px"
                justify="space-between"
                cursor="pointer"
                onClick={() => handleItemClick(item)}
                _hover={{
                  bg: 'primary_opacity.10'
                }}
                bg={isSelected ? 'primary_opacity.10' : 'transparent'}
                borderRadius="8px"
                px="8px"
              >
                <Text fontSize="12px" fontWeight="500" color={isSelected ? 'primary' : 'text_paragraph'}>
                  {item.label}
                </Text>
                <HStack gap="4px" onClick={e => cancelBubble(e)}>
                  <Box
                    onClick={e => {
                      handleSortRuleClick(e, item, 'asc')
                    }}
                    cursor="pointer"
                    bg={isAscSelected ? 'primary_opacity.10' : 'transparent'}
                    borderRadius="6px"
                    h="24px"
                    w="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <SortSvg fill={isAscSelected ? '#75C8FF' : '#909CA4'} />
                  </Box>
                  <Box
                    onClick={e => {
                      handleSortRuleClick(e, item, 'desc')
                    }}
                    cursor="pointer"
                    bg={isDescSelected ? 'primary_opacity.10' : 'transparent'}
                    borderRadius="6px"
                    h="24px"
                    w="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    transform="rotate(180deg)"
                  >
                    <SortSvg fill={isDescSelected ? '#75C8FF' : '#909CA4'} />
                  </Box>
                </HStack>
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
            onClick={handleConfirm}
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
  )
}

export default MobileSortDrawer
