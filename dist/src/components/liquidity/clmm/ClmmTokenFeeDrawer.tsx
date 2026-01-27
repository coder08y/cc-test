import useGetPoolList from '@/hooks/pool/useGetPoolList'
import { getFeeTierList } from '@/utils/clmm'
import Loading from '@cetus/design/src/components/common/Loading'
import { clmmDefaultFeeOptions } from '@cetus/design/src/components/common/feeSelect/config'
import { ClmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { CheckBox, SingleCoinImage } from '@cetus/ui-kit'
import VaulDrawer from '@cetus/ui-kit/src/components/VaulDrawer'
import { Box, Button, Center, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { maxBy } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import TokenSelectList from '../common/TokenSelectList'

interface ClmmTokenFeeDrawerProps {
  isOpen: boolean
  onClose: () => void
  baseToken?: Token
  quoteToken?: Token
  currentFeeTier?: ClmmSelectFeeType
  onConfirm: (baseToken: Token, quoteToken: Token, feeTier: ClmmSelectFeeType) => void
  whiteTokenList?: Token[]
  isShowSelect?: boolean
  loading?: boolean
}

type TokenType = 'base' | 'quote'

// Token 选择按钮组件
interface TokenSelectButtonProps {
  label: string
  token: Token | undefined
  isActive: boolean
  onClick: () => void
}

const TokenSelectButton = ({ label, token, isActive, onClick }: TokenSelectButtonProps) => (
  <VStack align="flex-start" gap="8px">
    <Text fontSize="12px">{label}</Text>
    <Button
      h="32px"
      p="0 12px 0 6px"
      borderRadius="16px"
      border="1px solid"
      borderColor={isActive ? 'primary' : 'border'}
      bg={isActive ? 'primary_opacity.10' : 'bg_secondary'}
      onClick={onClick}
      justifyContent="flex-start"
    >
      {token ? (
        <HStack gap="4px">
          <SingleCoinImage showTagWidth={'12px'} showTagHeight={'12px'} imageUrl={token.logo_url} w="20px" h="20px" coinType={token.coin_type} />
          <Text fontWeight="500" color={isActive ? 'text_caption' : 'text_paragraph'} fontSize="14px" h="16px">
            {token.symbol}
          </Text>
        </HStack>
      ) : (
        <Text fontWeight="500" color="text_paragraph" fontSize="14px" h="16px">
          Select token
        </Text>
      )}
    </Button>
  </VStack>
)

export default function ClmmTokenFeeDrawer({
  isOpen,
  onClose,
  baseToken,
  quoteToken,
  currentFeeTier,
  onConfirm,
  whiteTokenList,
  isShowSelect,
  loading
}: ClmmTokenFeeDrawerProps) {
  const { isApp } = useWindowWidth()
  // drawer内部的临时工作状态（只有Confirm时才提交）
  const [tempBaseToken, setTempBaseToken] = useState<Token | undefined>(baseToken)
  const [tempQuoteToken, setTempQuoteToken] = useState<Token | undefined>(quoteToken)
  const [tempFeeTier, setTempFeeTier] = useState<ClmmSelectFeeType | undefined>(currentFeeTier)

  const [activeTokenType, setActiveTokenType] = useState<'base' | 'quote' | 'fee'>('base')
  const [tempSelectedToken, setTempSelectedToken] = useState<Token | undefined>(undefined)
  const [dynamicFeeTierList, setDynamicFeeTierList] = useState<ClmmSelectFeeType[]>([])
  const [feeTierLoading, setFeeTierLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // 标记是否已初始化

  const { getPoolList } = useGetPoolList()

  // 统一的 token 获取/设置函数
  const getTempToken = (type: TokenType) => (type === 'base' ? tempBaseToken : tempQuoteToken)
  const setTempToken = (type: TokenType, token: Token | undefined) => {
    if (type === 'base') {
      setTempBaseToken(token)
    } else {
      setTempQuoteToken(token)
    }
  }

  // 初始化状态 - 只在drawer打开时初始化一次，之后不再被父组件的props变化覆盖
  useEffect(() => {
    if (isOpen && !isInitialized) {
      // drawer首次打开时，从父组件初始化临时状态
      setTempBaseToken(baseToken)
      setTempQuoteToken(quoteToken)
      setTempFeeTier(currentFeeTier)
      setTempSelectedToken(undefined)
      setIsInitialized(true)
    } else if (!isOpen) {
      // drawer关闭时，重置所有临时状态和初始化标记
      setTempBaseToken(baseToken)
      setTempQuoteToken(quoteToken)
      setTempFeeTier(currentFeeTier)
      setTempSelectedToken(undefined)
      setIsInitialized(false)
    }
    // drawer打开期间，即使baseToken/quoteToken/currentFeeTier变化，也不覆盖用户的选择
  }, [isOpen, baseToken, quoteToken, currentFeeTier, isInitialized])

  // 当drawer内部的临时token变化时，动态获取新的feeTierList
  useEffect(() => {
    const fetchFeeTierList = async () => {
      if (!isOpen || !tempBaseToken?.coin_type || !tempQuoteToken?.coin_type) {
        // drawer未打开或token未完全选择，显示空列表
        setDynamicFeeTierList([])
        setTempFeeTier(undefined)
        return
      }

      // drawer打开时，先清空旧数据，然后查询新数据
      setDynamicFeeTierList([])
      setTempFeeTier(undefined)
      setFeeTierLoading(true)

      // console.log('🔍 [ClmmTokenFeeDrawer] 查询池子:', {
      //   base: tempBaseToken.symbol,
      //   quote: tempQuoteToken.symbol,
      //   coin_type: `${tempBaseToken.coin_type},${tempQuoteToken.coin_type}`
      // })

      try {
        const res = await getPoolList({
          coin_type: `${tempBaseToken.coin_type},${tempQuoteToken.coin_type}`,
          is_vaults: false,
          display_all_pools: true,
          has_mining: true,
          has_farming: true,
          no_incentives: true,
          order_by: '-vol',
          offset: 0
        })

        // console.log('🔍 [ClmmTokenFeeDrawer] 查询结果:', {
        //   totalPools: res?.list?.length || 0,
        //   pools: res?.list?.map(p => ({ fee: p.feeRate, poolAddress: p.poolAddress }))
        // })

        if (res?.list && res.list.length > 0) {
          const list = getFeeTierList(res.list)
          // console.log('🔍 [ClmmTokenFeeDrawer] 转换后的feeTierList:', list)
          const newFeeTierList = clmmDefaultFeeOptions?.map(item => {
            const matchedPool = list?.find(feeTier => feeTier.feeRate === item.feeRate)
            return {
              fee: item?.fee,
              feeDisplay: item?.feeDisplay,
              tickSpacing: item?.tickSpacing,
              feeRate: item?.feeRate,
              title: matchedPool?.title || item.title,
              poolAddress: matchedPool?.poolAddress,
              disabled: matchedPool ? false : !isShowSelect
            }
          })
          // 过滤掉 0.001% 且没有 poolAddress 的选项
          const filteredFeeTierList = newFeeTierList?.filter((ele, index) => {
            const feeIndex = newFeeTierList.findIndex((item: any) => item.feeDisplay === '0.001%' && !item.poolAddress)
            return Number(index) !== feeIndex
          })
          setDynamicFeeTierList(filteredFeeTierList || [])

          // 优先尝试匹配传入的 currentFeeTier
          let matchedFeeTier: ClmmSelectFeeType | undefined

          if (
            currentFeeTier?.fee &&
            ((tempBaseToken?.coin_type === baseToken?.coin_type && tempQuoteToken?.coin_type === quoteToken?.coin_type) ||
              (tempBaseToken?.coin_type === quoteToken?.coin_type && tempQuoteToken?.coin_type === baseToken?.coin_type))
          ) {
            // 查找匹配的 feeTier，确保类型一致（转换为字符串比较）
            matchedFeeTier = filteredFeeTierList?.find(item => String(item.fee) === String(currentFeeTier.fee))
          }
          // 如果匹配成功，使用匹配的值
          if (matchedFeeTier) {
            setTempFeeTier(matchedFeeTier)
          } else {
            let _pool = maxBy(res?.list, item => Number(item?.tvl || '0'))
            const firstAvailable = filteredFeeTierList?.find(item => item.poolAddress === _pool?.poolAddress)
            if (firstAvailable) {
              setTempFeeTier(firstAvailable)
            } else {
              // 如果都没有poolAddress，选择第一个（用于创建池子的场景）
              setTempFeeTier(filteredFeeTierList?.[0])
            }
          }
        } else {
          // 没有找到池子，显示默认选项
          const defaultList = clmmDefaultFeeOptions
            .filter(o => o.feeDisplay !== '0.001%')
            .map(item => ({
              ...item,
              title: 'Not Created',
              poolAddress: undefined,
              disabled: !isShowSelect
            }))
          setDynamicFeeTierList(defaultList)
          // 选择第一个默认选项
          setTempFeeTier(defaultList[0])
        }
      } catch (error) {
        console.error('获取feeTierList失败:', error)
        // 查询失败，显示默认选项
        const defaultList = clmmDefaultFeeOptions
          .filter(o => o.feeDisplay !== '0.001%')
          .map(item => ({
            ...item,
            title: 'Not Created',
            poolAddress: undefined,
            disabled: !isShowSelect
          }))
        setDynamicFeeTierList(defaultList)
        setTempFeeTier(defaultList[0])
      } finally {
        setFeeTierLoading(false)
      }
    }

    fetchFeeTierList()
  }, [isOpen, tempBaseToken?.coin_type, tempQuoteToken?.coin_type])

  // 初始化tempSelectedToken，根据activeTokenType设置
  useEffect(() => {
    if (!isOpen || activeTokenType === 'fee') {
      if (activeTokenType !== 'fee') {
        setTempSelectedToken(undefined)
      }
      return
    }

    const currentToken = getTempToken(activeTokenType as TokenType)
    if (currentToken) {
      const currentCoinType = currentToken.coin_type?.toLocaleLowerCase()
      setTempSelectedToken(prev => {
        if (prev?.coin_type?.toLocaleLowerCase() !== currentCoinType) {
          return currentToken
        }
        return prev
      })
    } else {
      setTempSelectedToken(undefined)
    }
  }, [isOpen, activeTokenType, tempBaseToken?.coin_type, tempQuoteToken?.coin_type])

  // 切换 token 类型
  const handleActiveTokenTypeChange = (type: 'base' | 'quote' | 'fee') => {
    setActiveTokenType(type)
    if (type === 'fee') {
      setTempSelectedToken(undefined)
    } else {
      setTempSelectedToken(getTempToken(type as TokenType))
    }
  }

  // Token 选择处理
  const handleTokenSelect = (token: Token) => {
    const isSameToken = tempSelectedToken?.coin_type?.toLocaleLowerCase() === token.coin_type?.toLocaleLowerCase()
    const newToken = isSameToken ? undefined : token

    setTempSelectedToken(newToken)
    if (activeTokenType !== 'fee') {
      setTempToken(activeTokenType as TokenType, newToken)
    }
  }

  // 确认处理 - 提交临时状态
  const handleConfirm = () => {
    // 使用临时状态，只有Confirm时才真正提交
    if (!tempBaseToken || !tempQuoteToken || !tempFeeTier) {
      return
    }

    // 调用 onConfirm 回调，传递最终选择的值
    onConfirm(tempBaseToken, tempQuoteToken, tempFeeTier)
    onClose()
  }

  // 确认按钮是否可用
  const canConfirm = useMemo(() => {
    // 检查临时状态是否完整
    return Boolean(tempBaseToken && tempQuoteToken && tempFeeTier)
  }, [tempBaseToken, tempQuoteToken, tempFeeTier])

  // 计算需要排除的coinType列表
  const excludeCoinTypes = useMemo(() => {
    if (activeTokenType === 'base' && tempQuoteToken?.coin_type) {
      return [tempQuoteToken.coin_type]
    }
    if (activeTokenType === 'quote' && tempBaseToken?.coin_type) {
      return [tempBaseToken.coin_type]
    }
    return []
  }, [activeTokenType, tempBaseToken?.coin_type, tempQuoteToken?.coin_type])

  return (
    <VaulDrawer isOpen={isOpen} onClose={onClose} padding="0" wrapStyle={{ h: '90vh' }}>
      <VStack w="100%" spacing={0} align="stretch" h="100%" maxH="90vh" display="flex" flexDirection="column">
        {/* Base和Quote选择区域 */}
        <Box p="12px">
          <VStack gap="12px" align="flex-start">
            <HStack w="100%" gap="20px">
              <TokenSelectButton
                label="Base"
                token={tempBaseToken}
                isActive={activeTokenType === 'base'}
                onClick={() => handleActiveTokenTypeChange('base')}
              />
              <TokenSelectButton
                label="Quote"
                token={tempQuoteToken}
                isActive={activeTokenType === 'quote'}
                onClick={() => handleActiveTokenTypeChange('quote')}
              />
            </HStack>

            {/* Fee & Bsp选择区域 */}
            <VStack w="100%" align="flex-start" gap="8px">
              <Text fontSize="12px">Fee Tier</Text>
              <Button
                h="32px"
                p="0 12px"
                borderRadius="16px"
                border="1px solid"
                borderColor={activeTokenType === 'fee' ? 'primary' : 'border'}
                bg={activeTokenType === 'fee' ? 'primary_opacity.10' : 'bg_secondary'}
                onClick={() => handleActiveTokenTypeChange('fee')}
                justifyContent="space-between"
              >
                {loading ? (
                  <Skeleton h="16px" w="120px" />
                ) : tempFeeTier ? (
                  <HStack gap="8px">
                    <Text color="text_caption" fontWeight="500" fontSize="14px" h="16px">
                      {tempFeeTier?.feeDisplay || '--%'}
                    </Text>
                    {/* <Box w="1px" h="8px" bg="text_paragraph" /> */}
                    {/* <Text color="text_caption" fontSize="14px" h="16px">
                      {tempFeeTier?.tickSpacing || '--'} bps
                    </Text> */}
                  </HStack>
                ) : (
                  <Text color="text_paragraph" fontSize="14px" h="16px">
                    Select fee
                  </Text>
                )}
              </Button>
            </VStack>
          </VStack>
        </Box>

        {/* Token列表或Fee列表 */}
        <Box flex="1" overflow="hidden" display="flex" flexDirection="column">
          {/* borderTop="1px solid" borderColor="border" */}
          {activeTokenType === 'fee' ? (
            <Box w="100%" overflow="hidden">
              <Text fontSize="14px" px="12px" fontWeight="500" borderBottom="1px solid" borderColor="border" py="8px" color="text_caption">
                Fee
              </Text>
              <VStack
                w="100%"
                gap="0px"
                h={{ base: '80vh', lg: '26vh' }}
                maxH={{ base: 'calc(90vh - 242px)', lg: '350px' }}
                minH="210px"
                overflow="auto"
                p="0"
                pb="8px"
                pl="4px"
                pt="12px"
                overflowY="scroll"
              >
                {loading || feeTierLoading ? (
                  <Center w="100%" h="200px" position="relative" sx={{ '>div': { bg: 'none' } }}>
                    <Loading positionStyle="absolute" />
                  </Center>
                ) : dynamicFeeTierList?.length === 0 ? (
                  <VStack w="100%" h="100%" alignItems="center" justify="center" gap="4px">
                    <Text color="text_caption">No fees found</Text>
                  </VStack>
                ) : (
                  dynamicFeeTierList?.map(item => {
                    const isChecked = String(tempFeeTier?.fee) === String(item?.fee)
                    return (
                      <HStack
                        key={item?.feeDisplay}
                        w="100%"
                        justify="space-between"
                        cursor={item?.disabled ? 'not-allowed' : 'pointer'}
                        h={isApp ? '36px' : '46px'}
                        minH={isApp ? '36px' : '46px'}
                        p="0 8px"
                        onClick={() => {
                          if (!item?.disabled) {
                            setTempFeeTier(item)
                          }
                        }}
                        sx={{
                          ...(isChecked && {
                            bg: 'primary_opacity.10',
                            borderRadius: '8px'
                          })
                        }}
                      >
                        <HStack gap="8px">
                          <Text color="text_caption" fontWeight="500" fontSize="14px">
                            {item?.feeDisplay}
                          </Text>
                          {/* <Text color="text_caption" fontSize="12px">
                            {item?.tickSpacing} bps
                          </Text> */}
                          {item?.title && (
                            <Text fontSize="12px" color="text_caption">
                              {item?.title}
                            </Text>
                          )}
                        </HStack>
                        <CheckBox
                          checked={isChecked}
                          onClick={() => {}}
                          wrapStyle={{
                            ...(isApp && {
                              width: '16px',
                              height: '16px',
                              sx: {
                                '& svg': {
                                  w: '12px',
                                  h: '12px',
                                  fill: isChecked ? '#000 !important' : 'transparent !important'
                                }
                              }
                            })
                          }}
                        />
                      </HStack>
                    )
                  })
                )}
              </VStack>
            </Box>
          ) : (
            <Box flex="1" overflow="hidden">
              <TokenSelectList
                selectToken={tempSelectedToken}
                onClickToken={handleTokenSelect}
                whiteTokenList={whiteTokenList}
                excludeCoinTypes={excludeCoinTypes}
              />
            </Box>
          )}
        </Box>

        {/* Confirm按钮 */}
        <Box p="12px 12px 24px" bg="bg_primary">
          <Button
            w="100%"
            h="42px"
            borderRadius="8px"
            variant="solid"
            colorScheme="blue"
            onClick={handleConfirm}
            fontSize="14px"
            isDisabled={!canConfirm}
          >
            Confirm
          </Button>
        </Box>
      </VStack>
    </VaulDrawer>
  )
}
