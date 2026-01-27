import useDeepBookStore from '@/store/deepbook'
import { CetusTooltip } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { abbreviateTokenName, addressAbridge, d, formatUSDPrice } from '@cetus/utils'
import { Button, Checkbox, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

type WithdrawAllModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedAccounts: string[]) => void
  isLoading?: boolean
}

export default function WithdrawAllModal({ isOpen, onClose, onConfirm, isLoading = false }: WithdrawAllModalProps) {
  const { balanceManagerList, managerBalanceListObjs, currentDeepBookPool } = useDeepBookStore()
  const { getTokenAmountValue } = useTokenPrice()
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])

  // 获取某个 balance manager 的 USD 总价值
  const getManagerTotalUSD = (balanceManagerAddress: string) => {
    const balances = (managerBalanceListObjs as Record<string, any>)[balanceManagerAddress]
    if (!balances || !currentDeepBookPool) return '0'

    const baseBalance = balances[currentDeepBookPool.baseAssets.coin_type]?.adjusted_balance || '0'
    const quoteBalance = balances[currentDeepBookPool.quoteAssets.coin_type]?.adjusted_balance || '0'

    const baseUSD = getTokenAmountValue(currentDeepBookPool.baseAssets.coin_type, baseBalance)
    const quoteUSD = getTokenAmountValue(currentDeepBookPool.quoteAssets.coin_type, quoteBalance)

    return d(baseUSD).add(quoteUSD).toString()
  }

  // 管理员余额 USD 映射
  const managerUSDMap = useMemo(() => {
    const map: Record<string, string> = {}
    balanceManagerList?.forEach((manager: any) => {
      map[manager.balanceManager] = getManagerTotalUSD(manager.balanceManager)
    })
    return map
  }, [balanceManagerList, managerBalanceListObjs, currentDeepBookPool, getTokenAmountValue])

  // 可选账户（余额 > 0）
  const selectableAccounts = useMemo(
    () =>
      Object.entries(managerUSDMap)
        .filter(([, totalUSD]) => !d(totalUSD || '0').isZero())
        .map(([address]) => address),
    [managerUSDMap]
  )

  // 当前选中账户剔除余额为 0 的
  useEffect(() => {
    setSelectedAccounts(prev => {
      const filtered = prev.filter(address => selectableAccounts.includes(address))
      if (filtered.length === prev.length) {
        const isSame = filtered.every((address, index) => address === prev[index])
        if (isSame) {
          return prev
        }
      }
      return filtered
    })
  }, [selectableAccounts])

  // 计算总的 Free Balance (USD)
  const totalFreeBalance = useMemo(() => {
    return Object.values(managerUSDMap).reduce(
      (acc, usd) =>
        d(acc)
          .add(usd || '0')
          .toString(),
      '0'
    )
  }, [managerUSDMap])

  // 计算选中账户的总金额 (USD)
  const selectedAmount = useMemo(() => {
    let total = '0'
    selectedAccounts.forEach(account => {
      const managerUSD = managerUSDMap[account] || '0'
      total = d(total).add(managerUSD).toString()
    })
    return total
  }, [selectedAccounts, managerUSDMap])

  // 切换账户选中状态
  const toggleAccount = (address: string) => {
    if (!selectableAccounts.includes(address)) {
      return
    }
    setSelectedAccounts(prev => {
      if (prev.includes(address)) {
        return prev.filter(a => a !== address)
      } else {
        return [...prev, address]
      }
    })
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectableAccounts.length === 0) {
      return
    }
    if (selectedAccounts.length === selectableAccounts.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(selectableAccounts)
    }
  }

  const isSelectAll = selectedAccounts.length === selectableAccounts.length && selectableAccounts.length > 0

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="480px">
        <ModalHeader>Withdraw All</ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0 16px 16px">
          <VStack w="100%" gap="16px" align="flex-start">
            {/* Total Free Balance */}
            <VStack w="100%" align="center" gap="4px" h="78px" justifyContent="center" bg="#192129" borderRadius="12px">
              <Text fontSize="20px" fontWeight="600" color="primary">
                ${formatUSDPrice(totalFreeBalance, true)}
              </Text>
              <HStack gap="4px">
                <Text fontSize="14px" color="text_paragraph">
                  Total Free Balance
                </Text>
                <CetusTooltip
                  tooltip={
                    <Text fontSize="12px" lineHeight={'16px'}>
                      Total balance is the sum of the free balance in all Deepbook account
                    </Text>
                  }
                  placement="bottom"
                >
                  <Icon xlinkHref="#icon-icon_tips" svgW="16px" svgH="16px" />
                </CetusTooltip>
              </HStack>
            </VStack>

            {/* Account List */}
            <VStack w="100%" gap="8px" maxH="300px" overflow="auto" mb="152px">
              {balanceManagerList
                ?.filter((manager: any) => {
                  // 只显示余额大于 0 的账户
                  const totalUSD = managerUSDMap[manager.balanceManager] || '0'
                  return !d(totalUSD).isZero()
                })
                ?.map((manager: any) => {
                  const isSelected = selectedAccounts.includes(manager.balanceManager)
                  const balances = (managerBalanceListObjs as Record<string, any>)[manager.balanceManager] || {}

                  // 获取 base 和 quote 资产余额
                  const baseBalance = balances[currentDeepBookPool?.baseAssets?.coin_type]?.adjusted_balance || '0'
                  const quoteBalance = balances[currentDeepBookPool?.quoteAssets?.coin_type]?.adjusted_balance || '0'

                  // 计算 USD 价值
                  const baseUSD = getTokenAmountValue(currentDeepBookPool?.baseAssets?.coin_type, baseBalance)
                  const quoteUSD = getTokenAmountValue(currentDeepBookPool?.quoteAssets?.coin_type, quoteBalance)
                  const totalUSD = managerUSDMap[manager.balanceManager] ?? d(baseUSD).add(quoteUSD).toString()
                  const isZeroBalance = d(totalUSD).isZero()

                  return (
                    <HStack
                      key={manager.balanceManager}
                      w="100%"
                      border="1px solid"
                      borderColor="border"
                      borderRadius="8px"
                      bg="bg_secondary"
                      justify="space-between"
                      cursor={isZeroBalance ? 'not-allowed' : 'pointer'}
                      onClick={() => {
                        if (!isZeroBalance) {
                          toggleAccount(manager.balanceManager)
                        }
                      }}
                    >
                      <VStack align="flex-start" flex={1} gap="0px">
                        <HStack w="100%" p="12px" borderRadius="12px" justify="space-between" bg="background">
                          <Text fontSize="14px" color="text_caption">
                            {addressAbridge(manager.balanceManager)}
                          </Text>
                          <Checkbox
                            isChecked={isSelected}
                            isDisabled={isZeroBalance}
                            onChange={e => {
                              e.stopPropagation()
                              if (!isZeroBalance) {
                                toggleAccount(manager.balanceManager)
                              }
                            }}
                            sx={{
                              '& .chakra-checkbox__control[data-checked]:hover, & .chakra-checkbox__control[data-checked][data-hover]': {
                                background: 'checked_bg'
                              }
                            }}
                          />
                        </HStack>
                        <HStack w="100%" p="12px" justify="space-between">
                          <Text fontSize="12px" lineHeight="16px" color="text_paragraph">
                            Free Balance
                          </Text>
                          <CetusTooltip
                            placement="top"
                            tooltip={
                              <VStack gap="8px" w="240px" alignItems="flex-start">
                                {/* Base Asset */}
                                <VStack gap="4px" w="100%" alignItems="flex-start">
                                  <Text fontSize="12px" color="text_paragraph">
                                    {currentDeepBookPool?.baseAssets?.symbol}
                                  </Text>
                                  <HStack gap="4px" bg="background" w="100%" justifyContent="space-between" p="8px" borderRadius="6px">
                                    <HStack>
                                      <SingleCoinImage
                                        imageUrl={currentDeepBookPool?.baseAssets?.logo_url}
                                        imgBoxStyle={{ w: '16px', h: '16px' }}
                                        imageStyle={{ w: '16px', h: '16px' }}
                                      />
                                      <Text color="text_caption" fontSize="12px">
                                        {currentDeepBookPool?.baseAssets?.symbol}
                                      </Text>
                                    </HStack>
                                    <Text fontSize="12px" lineHeight="16px">
                                      <Text as="span" color="text_caption" mr="2px" fontSize="12px" lineHeight="16px">
                                        {formatUSDPrice(baseBalance, true)}
                                      </Text>
                                      (${formatUSDPrice(baseUSD, true)})
                                    </Text>
                                  </HStack>
                                </VStack>
                                {/* Quote Asset */}
                                <VStack gap="4px" w="100%" alignItems="flex-start">
                                  <Text fontSize="12px" color="text_paragraph">
                                    {abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)}
                                  </Text>
                                  <HStack gap="4px" bg="background" w="100%" justifyContent="space-between" p="8px" borderRadius="6px">
                                    <HStack>
                                      <SingleCoinImage
                                        imageUrl={currentDeepBookPool?.quoteAssets?.logo_url}
                                        imgBoxStyle={{ w: '16px', h: '16px' }}
                                        imageStyle={{ w: '16px', h: '16px' }}
                                      />
                                      <Text color="text_caption" fontSize="12px">
                                        {abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)}
                                      </Text>
                                    </HStack>
                                    <Text fontSize="12px" lineHeight="16px">
                                      <Text as="span" color="text_caption" mr="2px" fontSize="12px" lineHeight="16px">
                                        {formatUSDPrice(quoteBalance, true)}
                                      </Text>
                                      (${formatUSDPrice(quoteUSD, true)})
                                    </Text>
                                  </HStack>
                                </VStack>
                              </VStack>
                            }
                          >
                            <Text
                              textDecoration={'underline dotted'}
                              fontSize="12px"
                              lineHeight="16px"
                              cursor={isZeroBalance ? 'not-allowed' : 'pointer'}
                            >
                              ${formatUSDPrice(totalUSD, true)}
                            </Text>
                          </CetusTooltip>
                        </HStack>
                      </VStack>
                    </HStack>
                  )
                })}
            </VStack>

            <VStack position={'absolute'} bottom="0" left="0" p="16px" borderRadius="16px" w="100%" gap="16px" bg="bg_secondary">
              {/* Amount Selected & Select All */}
              <HStack w="100%" justify="space-between" p="12px" bg="#192129" borderRadius="8px">
                <VStack align="flex-start" gap="4px">
                  <Text fontSize="20px" fontWeight="600" color="text_caption">
                    ${formatUSDPrice(selectedAmount, true)}
                  </Text>
                  <Text fontSize="12px" color="text_paragraph">
                    Amount Selected
                  </Text>
                </VStack>
                <HStack gap="8px" cursor={selectableAccounts.length === 0 ? 'not-allowed' : 'pointer'}>
                  <Text
                    onClick={toggleSelectAll}
                    color={isSelectAll ? 'text_caption' : 'text_paragraph'}
                    fontSize="12px"
                    cursor={selectableAccounts.length === 0 ? 'not-allowed' : 'pointer'}
                  >
                    Select All
                  </Text>
                  <Checkbox
                    onClick={toggleSelectAll}
                    isChecked={isSelectAll}
                    isDisabled={selectableAccounts.length === 0}
                    onChange={e => {
                      e.stopPropagation()
                      if (e.target.checked) {
                        setSelectedAccounts(selectableAccounts)
                      } else {
                        setSelectedAccounts([])
                      }
                    }}
                    sx={{
                      '& .chakra-checkbox__control[data-checked]:hover, & .chakra-checkbox__control[data-checked][data-hover]': {
                        background: 'checked_bg'
                      }
                    }}
                  />
                </HStack>
              </HStack>

              {/* Withdraw Button */}
              <Button
                w="100%"
                h="44px"
                fontWeight="500"
                onClick={() => onConfirm(selectedAccounts)}
                isDisabled={selectedAccounts.length === 0}
                isLoading={isLoading}
              >
                Withdraw
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
