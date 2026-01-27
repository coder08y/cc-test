import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { AddressCopyLink } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { Icon } from '@cetus/ui-kit'
import { addressAbridge, d } from '@cetus/utils'
import { Badge, HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

interface BalanceManagerSelectorProps {
  isMarginPool?: boolean
  // onWithdrawAll: () => void
  mb?: string
}

export default function BalanceManagerSelector({ isMarginPool = false, mb = '0' }: BalanceManagerSelectorProps) {
  const { currentAccount } = useAccountStore()
  const { deepBookSDK } = usePeripherySDKStore()
  const { balanceManagerList, currentBalanceManagerInfoMap, setCurrentBalanceManagerInfo, managerBalanceListObjs, currentDeepBookPool } =
    useDeepBookStore()

  const { marginManagerByAccount, currentMarginManagerInfoMap, setCurrentMarginManagerInfo } = useMarginStore()

  const { getExplorerUrl } = useExplorer()

  // Margin Manager 余额缓存（用于快速检查是否有余额）
  const [marginManagerBalanceCache, setMarginManagerBalanceCache] = useState<Record<string, { base: string; quote: string }>>({})

  // 根据 isMarginPool 决定使用哪个数据源
  const marginManagerList = useMemo(() => {
    if (!isMarginPool || !currentDeepBookPool?.address || !marginManagerByAccount || marginManagerByAccount.length === 0) {
      return []
    }
    // 筛选出与当前池子相关的 margin manager
    return (marginManagerByAccount as any[]).filter((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
  }, [isMarginPool, currentDeepBookPool?.address, marginManagerByAccount])

  const currentBalanceManagerInfo = useMemo(() => {
    const address = currentAccount?.address
    if (!address) return null
    if (isMarginPool) {
      const storedInfo = (currentMarginManagerInfoMap as Record<string, any>)[address]
      // 验证存储的 margin manager 是否属于当前池子
      if (storedInfo && currentDeepBookPool?.address) {
        const belongsToCurrentPool = (marginManagerByAccount as any[])?.some(
          (m: any) => m?.margin_manager_id === storedInfo?.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPool.address
        )
        if (belongsToCurrentPool) {
          return storedInfo
        }
      }
      return null
    }
    return (currentBalanceManagerInfoMap as Record<string, any>)[address] || null
  }, [
    currentAccount?.address,
    currentBalanceManagerInfoMap,
    currentMarginManagerInfoMap,
    isMarginPool,
    currentDeepBookPool?.address,
    marginManagerByAccount
  ])

  // 判断指定 balance manager 是否有可用余额（有资产返回 true，没资产返回 false）
  const checkManagerHasFreeBalance = (balanceManagerAddress: string) => {
    const balances = (managerBalanceListObjs as Record<string, any>)[balanceManagerAddress]
    if (!balances || !currentDeepBookPool) {
      return false // 如果没有数据或者没有当前池子，认为没有余额
    }
    const baseBalance = balances[currentDeepBookPool?.baseAssets?.coin_type]?.adjusted_balance || '0'
    const quoteBalance = balances[currentDeepBookPool?.quoteAssets?.coin_type]?.adjusted_balance || '0'
    // 只要有一个币种有余额就返回 true
    return d(baseBalance).gt(0) || d(quoteBalance).gt(0)
  }

  // 检查 margin manager 是否有余额
  const checkMarginManagerHasBalance = (manager: any) => {
    return manager?.content?.BalanceManager?.Fields?.Balances?.Fields?.Size > 0
  }

  // 获取 margin manager 的余额（用于检查是否有余额）
  // toDo: 这里暂时注释了，感觉和useGetDeepBookMarginBalance中的fetchMarginBalances触发重复了
  // useDeepCompareEffect(() => {
  //   // 当切换池子时，清空余额缓存
  //   if (!isMarginPool || !currentDeepBookPool?.address) {
  //     setMarginManagerBalanceCache({})
  //     return
  //   }

  //   if (!currentAccount?.address || marginManagerList.length === 0) {
  //     return
  //   }

  //   const fetchMarginBalances = async () => {
  //     const marginUtils = (deepBookSDK as any)?.MarginUtils || (deepBookSDK as any)?._marginUtils
  //     if (!marginUtils || !currentDeepBookPool?.baseAssets?.coin_type || !currentDeepBookPool?.quoteAssets?.coin_type) {
  //       return
  //     }

  //     const baseDecimals = currentDeepBookPool.baseAssets.decimals || 0
  //     const quoteDecimals = currentDeepBookPool.quoteAssets.decimals || 0
  //     const newCache: Record<string, { base: string; quote: string }> = {}

  //     // 使用提取的工具函数获取每个 margin manager 的余额
  //     const balancePromises = marginManagerList.map(async (marginManager: any) => {
  //       const managerId = marginManager?.margin_manager_id
  //       if (!managerId) {
  //         return null
  //       }
  //       const balance = await fetchSingleMarginManagerBalance(
  //         marginUtils,
  //         currentAccount.address,
  //         managerId,
  //         currentDeepBookPool.baseAssets.coin_type,
  //         currentDeepBookPool.quoteAssets.coin_type,
  //         baseDecimals,
  //         quoteDecimals,
  //         9
  //       )

  //       return { managerId, balance }
  //     })

  //     const results = await Promise.all(balancePromises)
  //     results.forEach(result => {
  //       if (result) {
  //         newCache[result.managerId] = result.balance
  //       }
  //     })

  //     setMarginManagerBalanceCache(newCache)
  //   }

  //   fetchMarginBalances()
  // }, [isMarginPool, currentAccount?.address, currentDeepBookPool?.address, marginManagerList])

  // 根据 isMarginPool 决定使用哪个列表
  const managerList = isMarginPool ? marginManagerList : balanceManagerList

  // 获取当前显示的地址（balance manager 地址或 margin manager 地址）
  const getDisplayAddress = (item: any) => {
    if (isMarginPool) {
      return item?.margin_manager_id || ''
    }
    return item?.balanceManager || ''
  }

  // 获取当前选中项的地址（如果没有选择，默认使用第一个）
  // 注意：这个 useMemo 必须在早期返回之前，以保持 hooks 调用顺序一致
  const currentSelectedAddress = useMemo(() => {
    if (isMarginPool) {
      if (currentBalanceManagerInfo?.margin_manager_id) {
        return currentBalanceManagerInfo.margin_manager_id
      }
      // 如果没有选择，默认使用第一个 margin manager
      return marginManagerList.length > 0 ? (marginManagerList[0] as any)?.margin_manager_id || '' : ''
    }
    if (currentBalanceManagerInfo?.balanceManager) {
      return currentBalanceManagerInfo.balanceManager
    }
    // 如果没有选择，默认使用第一个 balance manager
    return balanceManagerList && balanceManagerList.length > 0 ? (balanceManagerList[0] as any)?.balanceManager || '' : ''
  }, [isMarginPool, currentBalanceManagerInfo, marginManagerList, balanceManagerList])

  // 如果没有多个账户，不显示选择器（必须在所有 hooks 之后）
  if (!managerList || managerList.length <= 1) {
    return null
  }

  return (
    <Menu>
      {({ isOpen, onClose }) => (
        <>
          <MenuButton bg={{ base: 'transparent' }} mb={mb}>
            <HStack gap="2px" alignItems={'center'} bg="primary_opacity.10" p="4px 6px" borderRadius="6px">
              <Text fontSize="12px" color="primary">
                {addressAbridge(currentSelectedAddress)}
              </Text>
              <Icon
                xlinkHref="#icon-icon_descending"
                fontSize="16px"
                sx={{
                  position: 'relative',
                  top: isOpen ? '2px' : '-2px',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </HStack>
          </MenuButton>
          <MenuList p="8px" w="260px" borderRadius="8px" maxH="280px" overflowY="scroll">
            {managerList?.map((item: any, index: number) => {
              const displayAddress = getDisplayAddress(item)
              const isSelected = displayAddress === currentSelectedAddress
              const hasBalance = isMarginPool ? checkMarginManagerHasBalance(item || '') : checkManagerHasFreeBalance(item.balanceManager)
              return (
                <MenuItem
                  key={`${isMarginPool ? 'margin' : 'balance'}-manager-${index}`}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  p="8px"
                  borderRadius="6px"
                  bg={isSelected ? 'primary_opacity.10' : ''}
                  border={isSelected ? '1px solid #000' : 'none'}
                  borderColor={isSelected ? 'primary' : 'transparent'}
                  onClick={() => {
                    if (currentAccount?.address) {
                      if (isMarginPool) {
                        setCurrentMarginManagerInfo(currentAccount.address, item)
                      } else {
                        setCurrentBalanceManagerInfo(currentAccount.address, item)
                      }
                    }
                    onClose()
                  }}
                >
                  <HStack gap="4px">
                    <AddressCopyLink
                      address={displayAddress}
                      showLink={false}
                      color="text_caption"
                      onClickLink={() => {
                        if (currentAccount?.address) {
                          if (isMarginPool) {
                            setCurrentMarginManagerInfo(currentAccount.address, item)
                          } else {
                            setCurrentBalanceManagerInfo(currentAccount.address, item)
                          }
                        }
                        onClose()
                      }}
                      textDecoration="none !important"
                      wrapStyle={{
                        w: '100%'
                      }}
                    />
                  </HStack>
                  {hasBalance ? (
                    <Badge
                      textTransform={'capitalize'}
                      fontSize="10px"
                      fontWeight="400"
                      color="primary"
                      bg="primary_opacity.10"
                      borderRadius="100px"
                      p="4px 8px"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      textTransform={'capitalize'}
                      fontSize="10px"
                      fontWeight="400"
                      color="text_paragraph"
                      bg="text_paragraph_opacity.10"
                      borderRadius="100px"
                      p="4px 8px"
                    >
                      No Free Balance
                    </Badge>
                  )}
                </MenuItem>
              )
            })}
            {/* <Button
              variant="unstyled"
              h="28px"
              w="100%"
              mt={'4px'}
              fontSize="12px"
              onClick={() => {
                onWithdrawAll()
                onClose()
              }}
              isDisabled={withdrawAllDisabled}
              _disabled={{
                color: 'text_paragraph',
                opacity: 0.4,
                cursor: 'not-allowed'
              }}
              color={withdrawAllDisabled ? 'text_paragraph' : 'primary'}
            >
              Withdraw All
            </Button> */}
          </MenuList>
        </>
      )}
    </Menu>
  )
}
