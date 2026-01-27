import useGetDlmmPoolList from '@/hooks/pool/useGetDlmmPoolList'
import useWrapPoolData from '@/hooks/pool/useWrapPoolData'
import { getBaseFeeList } from '@/utils/dlmm'
import Loading from '@cetus/design/src/components/common/Loading'
import SelectTab, { Tab } from '@cetus/design/src/components/common/SelectTab'
import { DlmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import { Token } from '@cetus/types'
import { CheckBox, SingleCoinImage } from '@cetus/ui-kit'
import VaulDrawer from '@cetus/ui-kit/src/components/VaulDrawer'
import { Box, Button, Center, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { maxBy } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import TokenSelectList from '../common/TokenSelectList'

interface DlmmTokenFeeDrawerProps {
  isOpen: boolean
  onClose: () => void
  baseToken?: Token
  quoteToken?: Token
  baseFee?: Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'>
  binStep?: any
  onDlmmConfirm: (baseToken: Token, quoteToken: Token, baseFee: Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'>, binStep?: any) => void
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
        <HStack gap="8px">
          <SingleCoinImage showTagWidth={'12px'} showTagHeight={'12px'} imageUrl={token.logo_url} w="20px" h="20px" coinType={token.coin_type} />
          <Text color={isActive ? 'text_caption' : 'text_paragraph'} fontWeight="500" fontSize="14px" h="16px">
            {token.symbol}
          </Text>
        </HStack>
      ) : (
        <Text color="text_paragraph" fontSize="14px" h="16px">
          Select token
        </Text>
      )}
    </Button>
  </VStack>
)

export default function DlmmTokenFeeDrawer({
  isOpen,
  onClose,
  baseToken,
  quoteToken,
  baseFee,
  binStep,
  onDlmmConfirm,
  whiteTokenList,
  isShowSelect,
  loading
}: DlmmTokenFeeDrawerProps) {
  const { isApp } = useWindowWidth()
  // drawer内部的临时工作状态（只有Confirm时才提交）
  const [tempBaseToken, setTempBaseToken] = useState<Token | undefined>(baseToken)
  const [tempQuoteToken, setTempQuoteToken] = useState<Token | undefined>(quoteToken)
  const [tempBaseFee, setTempBaseFee] = useState<Pick<DlmmSelectFeeType, 'fee' | 'feeDisplay'> | undefined>(baseFee)
  const [tempBinStep, setTempBinStep] = useState<any>(binStep)

  const [activeTokenType, setActiveTokenType] = useState<'base' | 'quote' | 'fee'>('base')
  const [tempSelectedToken, setTempSelectedToken] = useState<Token | undefined>(undefined)
  const [dynamicFeeOptions, setDynamicFeeOptions] = useState<DlmmSelectFeeType[]>([])
  const [feeOptionsLoading, setFeeOptionsLoading] = useState(false)
  const [tabIndex, setTabIndex] = useState(0) // 0: Fee, 1: Bin Step
  const [isInitialized, setIsInitialized] = useState(false) // 标记是否已初始化

  const { getDlmmPoolList } = useGetDlmmPoolList()
  const { wrapDLmmPoolData } = useWrapPoolData()
  const { binStepConfig } = useBinStepConfigStore()

  // 统一的 token 获取/设置函数
  const getTempToken = (type: TokenType) => (type === 'base' ? tempBaseToken : tempQuoteToken)
  const setTempToken = (type: TokenType, token: Token | undefined) => {
    if (type === 'base') {
      setTempBaseToken(token)
    } else {
      setTempQuoteToken(token)
    }
  }

  // 获取当前 tempBaseFee 对应的 binStepList
  const currentBinStepList = useMemo(() => {
    if (!tempBaseFee || !dynamicFeeOptions) return []
    const feeOption = dynamicFeeOptions.find(opt => String(opt.fee) === String(tempBaseFee.fee))
    return feeOption?.binStepList || []
  }, [tempBaseFee, dynamicFeeOptions])

  // 初始化状态 - 只在drawer打开时初始化一次，之后不再被父组件的props变化覆盖
  useEffect(() => {
    if (isOpen && !isInitialized) {
      // drawer首次打开时，从父组件初始化临时状态
      setTempBaseToken(baseToken)
      setTempQuoteToken(quoteToken)
      setTempBaseFee(baseFee)
      setTempBinStep(binStep)
      setTempSelectedToken(undefined)
      setIsInitialized(true)
    } else if (!isOpen) {
      // drawer关闭时，重置所有临时状态和初始化标记
      setTempBaseToken(baseToken)
      setTempQuoteToken(quoteToken)
      setTempBaseFee(baseFee)
      setTempBinStep(binStep)
      setTempSelectedToken(undefined)
      setIsInitialized(false)
    }
    // drawer打开期间，即使baseToken/quoteToken/baseFee/binStep变化，也不覆盖用户的选择
  }, [isOpen, baseToken, quoteToken, baseFee, binStep, isInitialized])

  // 当drawer内部的临时token变化时，动态获取新的feeOptions和binStepList
  useEffect(() => {
    const fetchFeeOptions = async () => {
      if (!isOpen || !tempBaseToken?.coin_type || !tempQuoteToken?.coin_type) {
        // drawer未打开或token未完全选择，显示空列表
        setDynamicFeeOptions([])
        setTempBaseFee(undefined)
        setTempBinStep(undefined)
        return
      }

      // drawer打开时，先清空旧数据，然后查询新数据
      setDynamicFeeOptions([])
      setTempBaseFee(undefined)
      setTempBinStep(undefined)
      setFeeOptionsLoading(true)

      // console.log('🔍 [DlmmTokenFeeDrawer] 查询池子:', {
      //   base: tempBaseToken.symbol,
      //   quote: tempQuoteToken.symbol,
      //   coin_type: `${tempBaseToken.coin_type},${tempQuoteToken.coin_type}`
      // })

      try {
        const res = await getDlmmPoolList({
          coin_type: `${tempBaseToken.coin_type},${tempQuoteToken.coin_type}`,
          is_vaults: false,
          display_all_pools: true,
          has_mining: true,
          has_farming: true,
          no_incentives: true,
          order_by: '-vol',
          offset: 0
        })

        // console.log('🔍 [DlmmTokenFeeDrawer] 查询结果:', {
        //   totalGroups: res?.list?.length || 0,
        //   groups: res?.list
        // })

        if (res?.list && res.list.length > 0) {
          // DLMM的数据结构：res.list[0].pools 包含所有池子
          const pools = res?.list?.[0]?.pools?.map((item: any) => wrapDLmmPoolData(item)) || []
          const baseFeeList = getBaseFeeList(pools)

          // console.log('🔍 [DlmmTokenFeeDrawer] 转换后的baseFeeList:', baseFeeList)
          // console.log('🔍 [DlmmTokenFeeDrawer] binStepConfig:', binStepConfig)

          // 构建 feeOptions，每个fee包含其对应的binStepList
          // 注意：要使用 feeRate 而不是 fee 来匹配（与PC端逻辑一致）

          console.log(baseFeeList, binStepConfig, 'baseFeeList, binStepConfig')

          const newFeeOptions =
            (binStepConfig as DlmmSelectFeeType[])?.map(configItem => {
              // console.log('🔍 [DlmmTokenFeeDrawer] 处理 fee:', configItem.fee, configItem.feeDisplay)
              // 使用 feeRate 匹配，与 PC 端逻辑一致
              const matchedFees = baseFeeList?.filter(pool => pool.feeRate + '' === configItem.fee + '')
              // console.log('🔍 [DlmmTokenFeeDrawer] 匹配到的池子:', matchedFees)

              const binStepList = configItem.binStepList?.map(binStepItem => {
                const matchedBinStep = matchedFees?.find(pool => pool.binStep === binStepItem.binStep)
                // console.log('🔍 [DlmmTokenFeeDrawer] binStep 匹配:', {
                //   configBinStep: binStepItem.binStep,
                //   configFee: configItem.fee,
                //   poolFeeRate: matchedBinStep?.feeRate,
                //   matchedBinStep: matchedBinStep?.binStep,
                //   poolAddress: matchedBinStep?.poolAddress
                // })
                binStepItem.poolAddress = ''
                return {
                  ...binStepItem,
                  title: matchedBinStep?.title || binStepItem.title,
                  poolAddress: matchedBinStep?.poolAddress
                }
              })
              return {
                ...configItem,
                binStepList
              }
            }) || []

          // console.log('🔍 [DlmmTokenFeeDrawer] 最终 feeOptions:', newFeeOptions)
          setDynamicFeeOptions(newFeeOptions)

          // 优先尝试匹配传入的 baseFee 和 binStep
          let matchedFee: DlmmSelectFeeType | undefined
          let matchedBinStep: any | undefined

          if (
            baseFee?.fee &&
            ((tempBaseToken?.coin_type === baseToken?.coin_type && tempQuoteToken?.coin_type === quoteToken?.coin_type) ||
              (tempBaseToken?.coin_type === quoteToken?.coin_type && tempQuoteToken?.coin_type === baseToken?.coin_type))
          ) {
            // 查找匹配的 fee，确保类型一致（转换为字符串比较）
            matchedFee = newFeeOptions.find(opt => String(opt.fee) === String(baseFee.fee))
            if (
              matchedFee &&
              binStep?.binStep &&
              ((tempBaseToken?.coin_type === baseToken?.coin_type && tempQuoteToken?.coin_type === quoteToken?.coin_type) ||
                (tempBaseToken?.coin_type === quoteToken?.coin_type && tempQuoteToken?.coin_type === baseToken?.coin_type))
            ) {
              // 在匹配的 fee 的 binStepList 中查找匹配的 binStep
              matchedBinStep = matchedFee.binStepList?.find(bs => String(bs.binStep) === String(binStep.binStep))
            }
          }
          const allList = (res?.list ?? [])?.map(item => item?.list ?? [])?.flat()
          let _pool = maxBy(allList, item => Number(item?.tvl || '0'))
          console.log(res?.list, _pool, '_pool_pool_pool')
          // 如果匹配成功，使用匹配的值
          if (matchedFee && matchedBinStep) {
            setTempBaseFee({ fee: matchedFee.fee, feeDisplay: matchedFee.feeDisplay })
            setTempBinStep(matchedBinStep)
          } else if (matchedFee) {
            // 如果只匹配到 fee，使用该 fee，并尝试匹配 binStep 或选择第一个可用的
            setTempBaseFee({ fee: matchedFee.fee, feeDisplay: matchedFee.feeDisplay })
            if (
              binStep?.binStep &&
              ((tempBaseToken?.coin_type === baseToken?.coin_type && tempQuoteToken?.coin_type === quoteToken?.coin_type) ||
                (tempBaseToken?.coin_type === quoteToken?.coin_type && tempQuoteToken?.coin_type === baseToken?.coin_type))
            ) {
              // 尝试在匹配的 fee 的 binStepList 中查找 binStep（即使没有 poolAddress）
              const foundBinStep = matchedFee.binStepList?.find(bs => String(bs.binStep) === String(binStep.binStep))
              if (foundBinStep) {
                setTempBinStep(foundBinStep)
              } else {
                // 如果找不到匹配的 binStep，选择第一个有池子的 binStep
                const firstAvailableBinStep = matchedFee.binStepList?.find(bs => bs.poolAddress === _pool?.poolAddress)
                if (firstAvailableBinStep) {
                  setTempBinStep(firstAvailableBinStep)
                }
              }
            } else {
              // 如果没有 binStep，选择第一个有池子的 binStep
              const firstAvailableBinStep = matchedFee.binStepList?.find(bs => bs.poolAddress === _pool?.poolAddress)
              if (firstAvailableBinStep) {
                setTempBinStep(firstAvailableBinStep)
              }
            }
          } else {
            // 没有匹配到原有的 fee，自动选择第一个有池子的 fee
            const firstAvailableFee = newFeeOptions.find(opt => opt.binStepList?.some(bs => bs.poolAddress === _pool?.poolAddress))
            if (firstAvailableFee) {
              setTempBaseFee({ fee: firstAvailableFee.fee, feeDisplay: firstAvailableFee.feeDisplay })
              // 自动选择第一个有池子的binStep
              const firstAvailableBinStep = firstAvailableFee.binStepList?.find(bs => bs.poolAddress === _pool?.poolAddress)
              if (firstAvailableBinStep) {
                setTempBinStep(firstAvailableBinStep)
              }
            } else {
              // 没有找到任何池子，使用默认配置
              setTempBaseFee(newFeeOptions[0] ? { fee: newFeeOptions[0].fee, feeDisplay: newFeeOptions[0].feeDisplay } : undefined)
            }
          }
        } else {
          // 没有找到池子，显示默认选项
          setDynamicFeeOptions((binStepConfig as DlmmSelectFeeType[]) || [])
          setTempBaseFee(undefined)
          setTempBinStep(undefined)
        }
      } catch (error) {
        console.error('get feeOptions failed:', error)
        setDynamicFeeOptions((binStepConfig as DlmmSelectFeeType[]) || [])
      } finally {
        setFeeOptionsLoading(false)
      }
    }

    fetchFeeOptions()
  }, [isOpen, tempBaseToken?.coin_type, tempQuoteToken?.coin_type])

  // 初始化tempSelectedToken，根据activeTokenType设置
  useEffect(() => {
    if (!isOpen || (activeTokenType !== 'base' && activeTokenType !== 'quote')) {
      if (activeTokenType === 'base' || activeTokenType === 'quote') {
        setTempSelectedToken(undefined)
      }
      return
    }

    const currentToken = getTempToken(activeTokenType as TokenType)
    if (currentToken) {
      const currentCoinType = currentToken.coin_type?.toLocaleLowerCase()
      setTempSelectedToken((prev: Token | undefined) => {
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
    if (type === 'base' || type === 'quote') {
      setTempSelectedToken(getTempToken(type as TokenType))
    } else {
      setTempSelectedToken(undefined)
    }
  }

  // Token 选择处理
  const handleTokenSelect = (token: Token) => {
    const isSameToken = tempSelectedToken?.coin_type?.toLocaleLowerCase() === token.coin_type?.toLocaleLowerCase()
    const newToken = isSameToken ? undefined : token

    setTempSelectedToken(newToken)
    if (activeTokenType === 'base' || activeTokenType === 'quote') {
      setTempToken(activeTokenType as TokenType, newToken)
    }
  }

  // BaseFee 选择处理
  const handleBaseFeeSelect = (feeOption: DlmmSelectFeeType) => {
    setTempBaseFee({ fee: feeOption.fee, feeDisplay: feeOption.feeDisplay })
    // 选择 baseFee 后，清空 binStep，让用户重新选择
    setTempBinStep(undefined)
    // 自动选择第一个有池子的binStep
    const firstAvailableBinStep = feeOption.binStepList?.find(bs => bs.poolAddress)
    if (firstAvailableBinStep) {
      setTempBinStep(firstAvailableBinStep)
    }
  }

  // BinStep 选择处理
  const handleBinStepSelect = (item: any) => {
    setTempBinStep(item)
  }

  // 确认处理 - 提交临时状态
  const handleConfirm = () => {
    // 使用临时状态，只有Confirm时才真正提交
    if (!tempBaseToken || !tempQuoteToken || !tempBaseFee || !tempBinStep) {
      return
    }

    // 调用 onDlmmConfirm 回调，传递最终选择的值
    onDlmmConfirm(tempBaseToken, tempQuoteToken, tempBaseFee, tempBinStep)
    onClose()
  }

  // 确认按钮是否可用
  const canConfirm = useMemo(() => {
    // 检查临时状态是否完整
    return Boolean(tempBaseToken && tempQuoteToken && tempBaseFee && tempBinStep)
  }, [tempBaseToken, tempQuoteToken, tempBaseFee, tempBinStep])

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
    <VaulDrawer isOpen={isOpen} onClose={onClose} padding="0 0 12px" wrapStyle={{ h: '90vh' }}>
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

            {/* Fee & Bin Step 选择区域 */}
            <VStack w="auto" align="flex-start" gap="8px">
              <Text fontSize="12px">Fee & Bsp</Text>
              <Button
                h="32px"
                p="0 12px"
                borderRadius="16px"
                border="1px solid"
                borderColor={activeTokenType === 'fee' ? 'primary' : 'border'}
                bg={activeTokenType === 'fee' ? 'primary_opacity.10' : 'bg_secondary'}
                onClick={() => handleActiveTokenTypeChange('fee')}
                w="100%"
              >
                {loading ? (
                  <Skeleton h="16px" w="120px" />
                ) : tempBaseFee && tempBinStep ? (
                  <Text
                    as="div"
                    display="flex"
                    alignItems="center"
                    gap="4px"
                    color={activeTokenType === 'fee' ? 'text_caption' : 'text_paragraph'}
                    fontWeight="500"
                    fontSize="14px"
                    h="16px"
                  >
                    {tempBaseFee?.feeDisplay || '--%'}
                    <Box w="1px" h="6px" bg={activeTokenType === 'fee' ? 'text_caption' : '#23252C'} />
                    {tempBinStep?.binStep || '--'} bps
                  </Text>
                ) : (
                  <Text color={activeTokenType === 'fee' ? 'text_caption' : 'text_paragraph'} fontWeight="500" fontSize="14px" h="16px">
                    Select fee & bin step
                  </Text>
                )}
              </Button>
            </VStack>
          </VStack>
        </Box>

        {/* Token列表或Fee列表 */}
        <Box flex="1" overflow="hidden" display="flex" flexDirection="column">
          {activeTokenType === 'fee' ? (
            <Box w="100%" overflow="hidden" display="flex" flexDirection="column">
              {/* Tabs */}
              <Box p="0 12px 0" mt="-4px" borderBottom="1px solid" borderColor="border">
                <SelectTab
                  type="borderTab"
                  currentTab={tabIndex === 0 ? 'fee' : 'binStep'}
                  tabList={[
                    { label: 'Fee', key: 'fee' },
                    { label: 'Bin Step', key: 'binStep' }
                  ]}
                  handleChangeTab={(tab: Tab) => {
                    setTabIndex(tab.key === 'fee' ? 0 : 1)
                  }}
                  wrapStyle={{
                    h: '40px',
                    p: '0',
                    bg: 'transparent',
                    border: 'none'
                  }}
                  itemStyle={{
                    fontSize: '14px',
                    fontWeight: '500',
                    mr: '24px'
                  }}
                />
              </Box>

              {/* Fee List */}
              {tabIndex === 0 && (
                <VStack
                  w="100%"
                  gap="0px"
                  h={{ base: '80vh', lg: '26vh' }}
                  maxH={{ base: 'calc(90vh - 258px)', lg: '350px' }}
                  minH="210px"
                  overflow="auto"
                  p="0"
                  pb="8px"
                  pl="4px"
                  pt="12px"
                  overflowY="scroll"
                >
                  {loading || feeOptionsLoading ? (
                    <Center w="100%" h="200px" position="relative" sx={{ '>div': { bg: 'none' } }}>
                      <Loading positionStyle="absolute" />
                    </Center>
                  ) : dynamicFeeOptions?.length === 0 ? (
                    <VStack w="100%" h="100%" alignItems="center" justify="center" gap="4px">
                      <Text color="text_caption">No fees found</Text>
                    </VStack>
                  ) : (
                    dynamicFeeOptions?.map(item => {
                      const isChecked = String(tempBaseFee?.fee) === String(item?.fee)
                      return (
                        <HStack
                          key={item?.feeDisplay}
                          w="100%"
                          justify="space-between"
                          cursor="pointer"
                          h={isApp ? '36px' : '46px'}
                          minH={isApp ? '36px' : '46px'}
                          p="0 8px"
                          onClick={() => {
                            handleBaseFeeSelect(item)
                          }}
                          sx={{
                            ...(isChecked && {
                              bg: 'primary_opacity.10',
                              borderRadius: '8px'
                            })
                          }}
                        >
                          <Text color="text_caption" fontWeight="500" fontSize="14px">
                            {item?.feeDisplay || '--%'}
                          </Text>
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
              )}

              {/* Bin Step List */}
              {tabIndex === 1 && (
                <VStack
                  w="100%"
                  gap="0px"
                  h={{ base: '80vh', lg: '26vh' }}
                  maxH={{ base: 'calc(90vh - 258px)', lg: '350px' }}
                  minH="210px"
                  overflow="auto"
                  p="0"
                  pb="8px"
                  pl="4px"
                  pt="12px"
                  overflowY="scroll"
                >
                  {loading ? (
                    <Center w="100%" h="200px" position="relative" sx={{ '>div': { bg: 'none' } }}>
                      <Loading positionStyle="absolute" />
                    </Center>
                  ) : currentBinStepList?.length === 0 ? (
                    <VStack w="100%" h="100%" alignItems="center" justify="center" gap="4px">
                      <Text color="text_caption">No bin steps found</Text>
                    </VStack>
                  ) : (
                    currentBinStepList?.map(item => {
                      const isChecked = String(tempBinStep?.binStep) === String(item?.binStep)
                      return (
                        <HStack
                          key={item?.binStep}
                          w="100%"
                          justify="space-between"
                          cursor="pointer"
                          h={isApp ? '36px' : '46px'}
                          minH={isApp ? '36px' : '46px'}
                          p="0 8px"
                          onClick={() => handleBinStepSelect(item)}
                          sx={{
                            ...(isChecked && {
                              bg: 'primary_opacity.10',
                              borderRadius: '8px'
                            })
                          }}
                        >
                          <HStack gap="8px">
                            <Text color="text_caption" fontWeight="500" fontSize="14px">
                              {item?.binStep || '--'} bps
                            </Text>
                            {item?.title && (
                              <Text fontSize="12px" color={item?.title === 'Not Created' ? 'primary_gray' : 'text_caption'}>
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
              )}
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
        <Box p="12px" bg="bg_primary">
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
