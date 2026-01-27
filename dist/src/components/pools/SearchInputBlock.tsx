import { Block, PoolsDropSelect } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import Icon from '@cetus/ui-kit/src/components/Icon'
import VaulDrawer from '@cetus/ui-kit/src/components/VaulDrawer'
import { cancelBubble, textEllipses } from '@cetus/utils'
import {
  Center,
  Flex,
  HStack,
  HTMLChakraProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverContentProps,
  PopoverTrigger,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

interface SearchInputProps {
  selectCoinList: Token[]
  onClickSelectCoinList: (tokenInfo: Token) => void
  onDeleteSelectCoinList: (tokenInfo: Token) => void
  onSetSelectCoinList?: (tokens: Token[]) => void
  whiteTokenList?: Token[]
  isProfile?: boolean
  wrapStyle?: PopoverContentProps
  isSmall?: boolean
  setIsSmall?: (status: boolean) => void
  isVault?: boolean
  triggerStyle?: HTMLChakraProps<'div'>
  selectTokenLength?: number
}
export default function SearchInputBlock({
  whiteTokenList,
  selectCoinList,
  onClickSelectCoinList,
  onDeleteSelectCoinList,
  onSetSelectCoinList,
  wrapStyle = { width: { base: 'calc(100vw - 20px)', lg: '292px' } },
  isSmall,
  setIsSmall,
  isVault,
  isProfile = false,
  triggerStyle = {},
  selectTokenLength = 2
}: SearchInputProps) {
  const { isApp } = useWindowWidth()
  const firstItemRef = useRef(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // 监听全局点击，关闭 Popover（仅桌面端）
  useEffect(() => {
    // 移动端使用 VaulDrawer，不需要这个监听器
    if (isApp) {
      return
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
        if (selectCoinList.length == 0) {
          setIsSmall?.(true)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, selectCoinList, isApp])

  useEffect(() => {
    if (isVault && selectCoinList.length == 0 && isApp) {
      onClose()
    }
  }, [isVault, selectCoinList])

  const handleSelectCoinList = (item: any) => {
    onClickSelectCoinList(item)
    if (isApp) {
      onClose()
    }
  }

  // 移动端确认选中 token
  const handleConfirmSelect = (tokens: Token[]) => {
    // 如果提供了直接设置列表的方法，使用它（更可靠）
    if (onSetSelectCoinList) {
      onSetSelectCoinList(tokens)
      onClose()
      if (tokens.length == 0) {
        setIsSmall?.(true)
      }
      return
    }

    // 否则使用逐个添加的方式（兼容旧代码）
    // 找出需要删除的 token（在旧列表中但不在新列表中）
    const tokensToDelete = selectCoinList.filter(
      oldToken => !tokens.some(newToken => newToken.coin_type?.toLocaleLowerCase() === oldToken.coin_type?.toLocaleLowerCase())
    )
    // 找出需要添加的 token（在新列表中但不在旧列表中）
    const tokensToAdd = tokens.filter(
      newToken => !selectCoinList.some(oldToken => oldToken.coin_type?.toLocaleLowerCase() === newToken.coin_type?.toLocaleLowerCase())
    )

    // 先删除需要删除的 token
    tokensToDelete.forEach(token => {
      onDeleteSelectCoinList(token)
    })

    // 然后逐个添加需要添加的 token，使用递归确保每次添加都在状态更新后
    // 使用变量来跟踪当前应该添加到的列表，避免闭包问题
    let currentList = [...selectCoinList]
    tokensToDelete.forEach(token => {
      currentList = currentList.filter(t => t.coin_type !== token.coin_type)
    })

    const addTokenRecursively = (index: number, prevList: Token[]) => {
      if (index >= tokensToAdd.length) {
        onClose()
        if (tokens.length == 0) {
          setIsSmall?.(true)
        }
        return
      }

      // 基于前一个列表来构建新列表
      const newList = [...prevList, tokensToAdd[index]]
      // 直接调用 setSelectCoinList 如果可能，否则使用 onClickSelectCoinList
      onClickSelectCoinList(tokensToAdd[index])

      // 使用更长的延迟确保状态更新
      setTimeout(() => {
        addTokenRecursively(index + 1, newList)
      }, 100)
    }

    if (tokensToAdd.length > 0) {
      // 延迟一下确保删除操作完成
      setTimeout(() => {
        addTokenRecursively(0, currentList)
      }, 100)
    } else {
      onClose()
      if (tokens.length == 0) {
        setIsSmall?.(true)
      }
    }
  }
  const triggerButton = (
    <Center
      ref={firstItemRef}
      as="button"
      minW={{
        base: isProfile ? '100%' : isSmall ? '40px' : '100%',
        lg: '292px'
      }}
      width={{
        base: isSmall ? '40px' : '100%'
        // lg: '292px'
      }}
    >
      <Block
        cursor={selectCoinList.length >= selectTokenLength ? 'not-allowed' : 'pointer'}
        h="40px"
        borderRadius="12px"
        minW="100%"
        w="unset"
        p={!isSmall && isApp ? '0px 4px 0 8px' : '0px 4px 0 8px'}
        onClick={() => {
          setIsSmall?.(false)
          onOpen()
        }}
        {...triggerStyle}
      >
        <HStack gap={isApp ? '4px' : '8px'} w={isSmall ? '40px' : '100%'} justify="space-between" h="100%" align="center">
          <Flex align="center" h="100%" w={isSmall ? '40px' : '100%'}>
            <Icon xlinkHref="#icon-icon_search" svgHover="text_paragraph" />
            {(!isSmall || !isApp) && (
              <Text ml="4px" whiteSpace="nowrap">
                {isApp && selectCoinList.length >= selectTokenLength ? '' : 'Filter by token'}
              </Text>
            )}
          </Flex>
          <HStack gap={isApp ? '4px' : '8px'}>
            {selectCoinList?.map((item: Token) => {
              return (
                <HStack
                  gap={isApp ? '2px' : '4px'}
                  align="center"
                  bg="button_ghost_bg"
                  borderRadius={isApp ? '6px' : '8px'}
                  p={isApp ? '2px 4px' : '5px 8px'}
                  key={item?.coin_type}
                >
                  <SingleCoinImage imageUrl={item?.logo_url} w={isApp ? '16px' : '20px'} h={isApp ? '16px' : '20px'} />
                  <Text ml="2px" color="text_caption">
                    {isApp ? textEllipses(item?.symbol || '', 5) : textEllipses(item?.symbol || '', 10)}
                  </Text>
                  <Icon
                    xlinkHref="#icon-icon_close"
                    onClick={(e: any) => {
                      cancelBubble(e)
                      onDeleteSelectCoinList(item)
                      onClose()
                    }}
                  />
                </HStack>
              )
            })}
          </HStack>
        </HStack>
      </Block>
    </Center>
  )

  return (
    <div
      style={{
        width: '100%'
      }}
      ref={popoverRef}
    >
      {isApp ? (
        <>
          {triggerButton}
          <VaulDrawer
            isOpen={isOpen && selectCoinList?.length < selectTokenLength}
            onClose={() => {
              onClose()
              if (selectCoinList.length == 0) {
                setIsSmall?.(true)
              }
            }}
            placement="bottom"
            padding="12px 0 0"
          >
            <PoolsDropSelect
              whiteTokenList={whiteTokenList}
              selectTokenList={selectCoinList}
              onDeleteToken={onDeleteSelectCoinList}
              onClickToken={handleSelectCoinList}
              isVault={isVault}
              onClose={onClose}
              onConfirmSelect={handleConfirmSelect}
              showSearchIcon={true}
            />
          </VaulDrawer>
        </>
      ) : (
        <Popover
          isLazy
          placement="bottom-start"
          modifiers={[
            {
              name: 'flip',
              enabled: false // Disable automatic flip
            },
            {
              name: 'shift',
              enabled: false // Disable automatic shift
            }
          ]}
          initialFocusRef={firstItemRef}
          isOpen={isOpen}
          trigger="click"
          onClose={() => {
            onClose()
            if (selectCoinList.length == 0) {
              setIsSmall?.(true)
            }
          }}
          onOpen={onOpen}
        >
          <PopoverTrigger>{triggerButton}</PopoverTrigger>
          {isOpen && selectCoinList?.length < selectTokenLength && (
            <PopoverContent
              w={{
                base: isProfile ? 'calc(100vw - 24px)' : 'calc(100vw - 68px)',
                lg: '292px'
              }}
              {...wrapStyle}
            >
              <PopoverBody p="0px">
                <PoolsDropSelect
                  whiteTokenList={whiteTokenList}
                  selectTokenList={selectCoinList}
                  onDeleteToken={onDeleteSelectCoinList}
                  onClickToken={handleSelectCoinList}
                  isVault={isVault}
                />
              </PopoverBody>
            </PopoverContent>
          )}
        </Popover>
      )}
    </div>
  )
}
