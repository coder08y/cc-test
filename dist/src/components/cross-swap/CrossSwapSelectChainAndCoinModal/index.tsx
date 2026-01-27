import { isSuiChain } from '@/hooks/cross-swap/useCrossHelper'
import useSelectChain from '@/hooks/cross-swap/useSelectChain'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Chain, ChainId, CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import SelectChainCard from './SelectChainCard'
import { SelectChainRow } from './SelectChainRow'
import SelectCoinCard from './SelectCoinCard'

type CrossSwapSelectChainAndCoinModalProps = {
  isOpen: boolean
  onClose: () => void
  isPay: boolean
  crossPlatform: CrossSwapPlatform
  fromChain: Chain
  toChain: Chain
  fromToken?: CrossSwapToken
  toToken?: CrossSwapToken
  onChangeChainAndCoin: (chain: Chain, token: CrossSwapToken) => void
}

type crossSwapPageStatus = 'default' | 'select_chain'

export default function CrossSwapSelectChainAndCoinModal(props: CrossSwapSelectChainAndCoinModalProps) {
  const { isApp } = useWindowWidth()
  const [pageStatus, setPageStatus] = useState<crossSwapPageStatus>('default')
  const { isOpen, onClose, isPay, crossPlatform, fromChain, toChain, fromToken, toToken, onChangeChainAndCoin } = props

  const [currentChain, setCurrentChain] = useState<Chain>(isPay ? fromChain : toChain)
  const { chainList } = useSelectChain(crossPlatform)
  const [sortedChainList, setSortedChainList] = useState<Chain[]>([])

  const isShowSelectChainCard = useMemo(() => {
    const isFromChainSui = isSuiChain(fromChain)
    const isToChainSui = isSuiChain(toChain)
    // 如果两边都是 SUI 链，则显示选择链卡片
    if (isFromChainSui && isToChainSui) {
      return true
    } else if (isPay && isFromChainSui) {
      return false
    } else if (!isPay && isToChainSui) {
      return false
    }
    return true
  }, [fromChain, toChain, isPay])

  useEffect(() => {
    setCurrentChain(isPay ? fromChain : toChain)
    return () => {
      setPageStatus('default')
    }
  }, [isOpen])

  const currentToken = isPay ? fromToken : toToken

  useEffect(() => {
    setSortedChainList([])
    setCurrentChain(isPay ? fromChain : toChain)
  }, [crossPlatform])

  const sortChainList = useCallback((chainList: Chain[], priorityChain?: Chain, excludeChainIds?: ChainId[]): Chain[] => {
    if (!chainList || chainList.length === 0) return chainList

    // 首先过滤掉要排除的链
    let filteredChainList = chainList
    if (excludeChainIds && excludeChainIds.length > 0) {
      filteredChainList = chainList.filter(chain => chain && !excludeChainIds.includes(chain.id))
    }

    // 如果没有优先级链，直接返回过滤后的列表
    if (!priorityChain) return filteredChainList

    // 查找 priorityChain 在过滤后列表中的索引
    const idx = filteredChainList.findIndex(chain => chain && chain.id === priorityChain.id)
    if (idx !== -1 && idx < 9) {
      return filteredChainList
    }

    // 如果 priorityChain 在第9个及以后，则将其移到最前面，其余保持原顺序（去重）
    const result: Chain[] = []
    if (idx !== -1) {
      result.push(priorityChain)
    }
    filteredChainList.forEach(chain => {
      if (!priorityChain || chain.id !== priorityChain.id) {
        result.push(chain)
      }
    })
    return result
  }, [])

  useEffect(() => {
    setSortedChainList(
      sortChainList(sortedChainList.length > 0 && sortedChainList.length === chainList.length ? sortedChainList : chainList, currentChain, [])
    )
  }, [chainList, currentChain?.id, isShowSelectChainCard])

  const [maxHeight, setMaxHeight] = useState<string>('400px') // 设置默认值

  // 获取窗口高度
  const calculateMaxHeight = () => {
    const windowHeight = window.innerHeight // 获取窗口的高度

    // 计算剩余高度并设置为最大高度
    const remainingHeight = windowHeight - 120

    setMaxHeight(`${remainingHeight}px`)
  }

  // 监听窗口大小变化，动态更新maxHeight
  useEffect(() => {
    calculateMaxHeight()
    window.addEventListener('resize', calculateMaxHeight) // 监听窗口大小变化

    return () => {
      window.removeEventListener('resize', calculateMaxHeight) // 清理事件监听器
    }
  }, [])

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={isApp ? '100%' : '476px'}>
        <ModalHeader>
          {pageStatus === 'default' && (
            <Heading fontWeight="500" fontSize="16px">
              {isPay ? 'You Pay' : 'You Receive'}
            </Heading>
          )}
          {pageStatus === 'select_chain' && (
            <HStack position="relative" w="100%" justify="space-between">
              <Icon
                xlinkHref="#icon-icon_descending_nor"
                cursor="pointer"
                fontSize="26px"
                transform="rotate(90deg)"
                onClick={() => setPageStatus('default')}
              />
              <Heading fontWeight="500" fontSize="16px" position="absolute" left="50%" transform="translateX(-50%)">
                Select a chain
              </Heading>
            </HStack>
          )}
        </ModalHeader>
        <ModalCloseButton onClick={onClose} />
        <ModalBody textAlign="center" p="0px 0 16px" minH="300px" overflow="hidden" maxH={maxHeight}>
          {pageStatus === 'default' && isShowSelectChainCard && (
            <SelectChainCard
              chainList={sortedChainList}
              currentChain={currentChain}
              openChainModal={() => {
                setPageStatus('select_chain')
              }}
              onChangeChain={(chain: Chain) => {
                setCurrentChain(chain)
              }}
            />
          )}

          {pageStatus === 'default' && (
            <SelectCoinCard
              isFrom={isPay}
              crossPlatform={crossPlatform}
              currentChain={currentChain}
              currentToken={currentToken}
              selectCoin={(coin: CrossSwapToken) => {
                onChangeChainAndCoin(currentChain, coin)
              }}
            />
          )}

          {pageStatus === 'select_chain' && (
            <SelectChainRow
              crossPlatform={crossPlatform}
              currentChain={isPay ? fromChain : toChain}
              onChangeChain={(chain: Chain) => {
                setCurrentChain(chain)
                setPageStatus('default')
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
