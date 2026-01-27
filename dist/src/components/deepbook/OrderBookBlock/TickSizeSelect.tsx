import useGetDeepBookOrderBook, { OrderType } from '@/hooks/deepbook/useGetDeepBookOrderBook'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Box, HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

const TickSizeChangeButton = {
  width: '20px',
  height: '20px',
  borderRadius: '4px',
  backgroundColor: 'primary_opacity.10',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'text_paragraph',
  fontSize: '16px',
  fontWeight: '500'
}

const TickSizeSelect = ({
  orderBookTab,
  tickSizeList,
  defaultTickSize,
  setDefaultTickSize
}: {
  orderBookTab: OrderType
  tickSizeList: string[]
  defaultTickSize: string
  setDefaultTickSize: (tickSize: string) => void
}) => {
  const { isApp } = useWindowWidth()
  const { getOrderBook } = useGetDeepBookOrderBook()
  const [isOpen, setIsOpen] = useState(false)
  const [buttonWidth, setButtonWidth] = useState<number>(0)
  const buttonRef = useRef<HTMLDivElement>(null)

  const selectTickSize = (tickSize: string) => {
    setDefaultTickSize(tickSize)
    getOrderBook(orderBookTab, tickSize, false, 9)
  }

  // 获取当前 tickSize 的索引
  const currentIndex = tickSizeList.findIndex(item => item === defaultTickSize)

  // 处理减少 tickSize
  const handleDecrease = () => {
    if (currentIndex > 0) {
      const newTickSize = tickSizeList[currentIndex - 1]
      selectTickSize(newTickSize)
    }
  }

  // 处理增加 tickSize
  const handleIncrease = () => {
    if (currentIndex < tickSizeList.length - 1) {
      const newTickSize = tickSizeList[currentIndex + 1]
      selectTickSize(newTickSize)
    }
  }

  // 获取按钮宽度
  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth)
    }
  }, [defaultTickSize])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {!isApp && (
        <Box
          onClick={handleDecrease}
          sx={{
            ...TickSizeChangeButton,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            '& svg': {
              opacity: currentIndex === 0 ? 0.3 : 1
            }
          }}
        >
          <svg stroke="#fff" fill="#fff" strokeWidth="1.5" width={'12px'} height={'14px'} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path height="10px" width="10px" fill="#fff" d="M4.5 12.75a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Z" />
          </svg>
        </Box>
      )}

      <Menu onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
        <MenuButton w="85px">
          <HStack
            ref={buttonRef}
            // border="1px solid"
            borderRadius="4px"
            p="4px 8px"
            cursor="pointer"
            minW="72px"
            w="auto"
            h="20px"
            justifyContent="space-between"
            bg="primary_opacity.10"
            // borderColor="border"
            gap="4px"
          >
            <Text fontSize="12px" color={isOpen ? 'text_caption' : 'text_paragraph'}>
              {defaultTickSize}
            </Text>
            <Icon
              xlinkHref="#icon-icon_arrow"
              boxW="12px"
              boxH="12px"
              transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="transform 0.2s ease-in-out"
              svgFill={isOpen ? 'text_caption' : 'text_paragraph'}
            />
          </HStack>
        </MenuButton>
        <MenuList
          p="0"
          minW="unset"
          zIndex={9999999999}
          borderRadius="8px"
          border="1px solid"
          borderColor="border"
          w={`${buttonWidth}px`} // 使用按钮的实际宽度
        >
          {tickSizeList.map((item, index) => (
            <MenuItem
              key={`tickSizeList-${item}-${index}`}
              onClick={() => selectTickSize(item)}
              p="8px"
              bg="none"
              justifyContent="flex-start"
              cursor="pointer"
              _hover={{ color: 'text_caption' }}
            >
              {item}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      {!isApp && (
        <Box
          onClick={handleIncrease}
          sx={{
            ...TickSizeChangeButton,
            sor: currentIndex === tickSizeList.length - 1 ? 'not-allowed' : 'pointer',
            '& svg': {
              opacity: currentIndex === tickSizeList.length - 1 ? 0.3 : 1
            }
          }}
        >
          <Icon xlinkHref="#icon-icon_add" svgFill="text_caption" fontSize={'18px'} />
        </Box>
      )}
    </Box>
  )
}

export default TickSizeSelect
