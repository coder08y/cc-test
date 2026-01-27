import Slippage from '@/components/common/Slippage'
import PoolCurrentPrice from '@/components/liquidity/common/PoolCurrentPrice'
import PoolTokenFeeSkeleton from '@/components/liquidity/common/PoolTokenFeeSkeleton'
import SelectTokenAndFeeConfirm from '@/components/liquidity/common/SelectTokenAndFeeConfirm'
import TokenFeeSelect from '@/components/liquidity/common/TokenFeeSelect'
import MyPositions from '@/components/liquidity/dlmm/MyPositions'
import PoolsStats from '@/components/liquidity/dlmm/PoolsStats'
import PoolsAnalytics from '@/components/liquidity/dlmm/analytics/PoolsAnalytics'
import DLMMDeposit from '@/components/liquidity/dlmm/deposit'
import Back from '@/components/pools/Back'
import { SelectToken } from '@/components/selectPool/SelectToken'
import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import useDlmmLiquidity from '@/hooks/dlmm/useDlmmLiquidity'
import useGetDlmmTvlInfo from '@/hooks/dlmm/useGetDlmmTvlInfo'
import useMyDlmmPositions from '@/hooks/dlmm/useMyDlmmPositions'
import useGetDlmmPoolList from '@/hooks/pool/useGetDlmmPoolList'
import { useTopButtonStyle } from '@/hooks/pool/useTopButtonStyle'
import useGetVaultsFarmingApiInfo from '@/hooks/vaults-farming/useGetVaultsFarmingApiInfo'
import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import useVaultsFarmingStore from '@/store/vaults-farming'
import { BothAndZapTabAction } from '@/types/dlmm'
import { isTrustedToken } from '@/utils'
import { CetusTooltip, CopyButton, CurrentPrice, DlmmFeeAndBinStepSelect, SelectTab } from '@cetus/design'
import WarningTokenTipsModal from '@cetus/design/src/components/common/WarningTokenTipModal'
import { DlmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useSdk } from '@cetus/sdk-factory'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { Icon, NoData, RefreshButton } from '@cetus/ui-kit'
import { isAvailableObject, removeComma } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, Button, Center, HStack, Spinner, Stack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabsEnum } from '../hooks/clmm/useLiquidityInteraction'

function Dlmm() {
  const navigate = useNavigate()
  const { poolId, from, to, type } = useQueryParams()

  const { dlmmApiPoolInfoLoading, currentPrice, reverseCurrentPrice, dlmmContractPoolInfo } = useDlmmLiquidityStore()

  const {
    dlmmApiPoolInfo,
    selectedTokenA,
    selectedTokenB,
    setCurrentBinStep,
    currentBinStep,
    currentTab,
    setCurrentTab,
    tabList,
    favoriteStyle,
    onChangeFavorites,
    setSelectedTokenA,
    setSelectedTokenB,
    onConfirm,
    refreshMarketPrice,
    onJump2Swap,
    onJumpAddIncentive,
    handleSelectToken,
    getSelectTokenProps,
    rangeTabList,
    quoteWhiteTokenList,
    onBinStepChange,
    binStepList,
    currentBaseFee,
    baseFee,
    setBaseFee,
    handleRefresh,
    handleGetPrice,
    binStep,
    setBinStep
  } = useDlmmLiquidity()
  // 获取个人所有仓位列表, 用于计算流动性占比
  useMyDlmmPositions()

  const { fetchIsSupportZap } = useIsSupportZap(selectedTokenA?.coin_type, selectedTokenB?.coin_type)
  useEffect(() => {
    if (selectedTokenA?.coin_type && selectedTokenB?.coin_type) {
      fetchIsSupportZap(selectedTokenA.coin_type, selectedTokenB.coin_type)
    }
  }, [selectedTokenA?.coin_type, selectedTokenB?.coin_type])

  // console.log('0926##🚀 dlmmApiPoolInfo:', {
  //   dlmmApiPoolInfo,
  //   dlmmApiPoolInfoLoading,
  //   poolId
  // })

  const { isApp } = useWindowWidth()
  const dlmmSdk = useSdk('dlmm')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { setFromAmount, setToAmount, currTabMode } = useAddDlmmLiquidityStore()
  const { binStepConfig } = useBinStepConfigStore()
  const { totalAmountUSD: totalTvl, tvlLoading } = useGetDlmmTvlInfo()
  const showContent = poolId && dlmmApiPoolInfo?.tokenA && dlmmApiPoolInfo?.tokenB
  const { tooltip, xlinkHref, svgFill, svgHover } = favoriteStyle

  const [selectTokenAProps, setSelectTokenAProps] = useState<any>({})
  const [selectTokenBProps, setSelectTokenBProps] = useState<any>({})
  const [isGettingTokenProps, setIsGettingTokenProps] = useState<boolean>(false)
  const [changeBinStepLoading, setChangeBinStepLoading] = useState<boolean>(false)
  const [priceDirect, setPriceDirect] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [shouldShowPoolsStats, setShouldShowPoolsStats] = useState(true)
  const prevScrollYRef = useRef(0)
  const lastUpdateTimeRef = useRef(0)

  const { getDlmmPoolList } = useGetDlmmPoolList()

  const fetchSelectTokenProps = useCallback(async () => {
    try {
      const tokenAProps = await getSelectTokenProps(from, selectedTokenA)
      const tokenBProps = await getSelectTokenProps(to, selectedTokenB)

      if (
        (tokenAProps?.value?.coin_type !== selectTokenAProps?.value?.coin_type &&
          tokenAProps?.value?.coin_type !== selectTokenBProps?.value?.coin_type) ||
        (tokenBProps?.value?.coin_type !== selectTokenBProps?.value?.coin_type &&
          tokenBProps?.value?.coin_type !== selectTokenAProps?.value?.coin_type)
      ) {
        setIsGettingTokenProps(false)
      }
      setSelectTokenAProps(tokenAProps)
      setSelectTokenBProps(tokenBProps)
    } catch (error) {
      console.log(error, 'fetchSelectTokenProps')
    } finally {
    }
  }, [from, to, selectedTokenA, selectedTokenB, getSelectTokenProps])
  useDebounceEffect(
    () => {
      fetchSelectTokenProps()
    },
    [fetchSelectTokenProps],
    { wait: 300 }
  )

  useEffect(() => {
    setFromAmount('')
    setToAmount('')
  }, [currentTab])

  const handleBinStepChange = useCallback(
    async (value: any) => {
      if (value?.poolAddress) {
        navigate(`/dlmm?poolId=${value?.poolAddress}`)
      } else {
        if (selectedTokenA?.coin_type && selectedTokenB?.coin_type) {
          onBinStepChange(value)
          try {
            setChangeBinStepLoading(true)
            const address = await dlmmSdk?.Pool?.getPoolAddress(
              fixCoinType(selectedTokenA?.coin_type, true),
              fixCoinType(selectedTokenB?.coin_type, true),
              value?.binStep,
              value?.baseFactor as number
            )
            // console.log(
            //   address,
            //   fixCoinType(selectedTokenA?.coin_type, true),
            //   fixCoinType(selectedTokenB?.coin_type, true),
            //   selectedTokenA,
            //   selectedTokenB,
            //   'onFeeChange'
            // )
            setChangeBinStepLoading(false)
            if (address) {
              navigate(`/dlmm?poolId=${address}`)
            } else {
              setBinStep(value)
              onOpen()
            }
          } catch (error) {
            setBinStep(value)
            onOpen()
            setChangeBinStepLoading(false)
          }
        } else {
          setBinStep(value)
          onOpen()
        }
      }
    },
    [selectedTokenA, selectedTokenB]
  )
  const { backUrl } = useGlobalStore()

  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
    if (!scrollContainer) return

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop
      const prevScrollY = prevScrollYRef.current
      const now = Date.now()

      // 节流：每 100ms 最多更新一次，减少状态更新频率
      if (now - lastUpdateTimeRef.current < 100) {
        prevScrollYRef.current = currentScrollY
        return
      }

      lastUpdateTimeRef.current = now
      const isScrollingDown = currentScrollY > prevScrollY
      prevScrollYRef.current = currentScrollY
      setScrollY(currentScrollY)

      // 使用更大的阈值范围，避免频繁切换
      // 向下滚动：> 150 隐藏
      // 向上滚动：< 100 显示
      setShouldShowPoolsStats(prev => {
        if (isScrollingDown && currentScrollY > 150 && prev) {
          return false
        } else if (!isScrollingDown && currentScrollY < 100 && !prev) {
          return true
        }
        return prev
      })
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  const onCloseInitializedPoolModal = () => {
    if (!type || type !== 'create') {
      setBaseFee({ fee: dlmmApiPoolInfo?.fee, feeDisplay: dlmmApiPoolInfo?.feeDisplay })
      setBinStep({ binStep: dlmmApiPoolInfo?.binStep, poolAddress: dlmmApiPoolInfo?.poolAddress })
    }

    onClose()
  }

  const isTokenAndFeeLoading = useMemo(() => {
    return (
      (from !== undefined && to !== undefined && !dlmmApiPoolInfo && dlmmApiPoolInfoLoading) ||
      isGettingTokenProps ||
      (!isAvailableObject(selectTokenAProps) && !isAvailableObject(selectTokenBProps))
    )
  }, [from, to, dlmmApiPoolInfo, dlmmApiPoolInfoLoading, isGettingTokenProps, selectTokenAProps, selectTokenBProps])

  const topButtonStyle = useTopButtonStyle(isApp)
  const { getHaedalFarmingList } = useGetVaultsFarmingApiInfo()
  const { vaultsFarmObj } = useVaultsFarmingStore()
  // 页面刷新重新获取
  useEffect(() => {
    if (!isAvailableObject(vaultsFarmObj)) {
      getHaedalFarmingList()
    }
  }, [vaultsFarmObj])

  return (
    <>
      <Box w="100%" mt={{ base: '12px', lg: '20px' }}>
        <Box
          position={{ base: 'sticky', lg: 'relative' }}
          top={{ base: '48px', lg: 'auto' }}
          zIndex={{ base: 99999999, lg: 'auto' }}
          bg="bg"
          pb={{ base: '0', lg: '0px' }}
          sx={{
            ...(isApp && {
              bg: 'bg_primary'
            })
          }}
        >
          <HStack w="100%" minW={{ base: '100%', lg: '1024px' }} justify="space-between" px="12px">
            <Back backUrl={backUrl} backText="DLMM Pools" type="dlmm" />

            {showContent && (
              <HStack gap="8px">
                <CetusTooltip placement="top" tooltip="Copy the Pool Address" fontSize="12px">
                  <Button
                    variant="outline"
                    bg="bg_secondary"
                    h="32px"
                    w="32px"
                    onClick={onJump2Swap}
                    borderRadius="8px"
                    p="0 6px"
                    color="text_paragraph"
                    display="flex"
                    justifyContent="center"
                    gap="4px"
                    sx={{
                      _hover: {
                        color: 'text_caption',
                        svg: {
                          fill: 'text_caption'
                        }
                      }
                    }}
                  >
                    <CopyButton text={poolId} />
                  </Button>
                </CetusTooltip>
                <CetusTooltip placement="top" tooltip={tooltip} fontSize="12px">
                  <Button
                    variant="outline"
                    w="32px"
                    h="32px"
                    lineHeight="32px"
                    onClick={onChangeFavorites}
                    p="0 6px"
                    borderRadius="8px"
                    color="text_paragraph"
                    bg="bg_secondary"
                    display="flex"
                    justifyContent="center"
                    gap="4px"
                    sx={{
                      _hover: {
                        color: 'text_caption',
                        svg: {
                          fill: svgHover
                        }
                      }
                    }}
                  >
                    <Icon xlinkHref={xlinkHref} svgFill={svgFill} svgHover={svgHover} fontSize="18px" />
                  </Button>
                </CetusTooltip>
                <CetusTooltip placement="top" tooltip="Trade" fontSize="12px">
                  <Button
                    variant="outline"
                    bg="bg_secondary"
                    h="32px"
                    w="32px"
                    onClick={onJump2Swap}
                    borderRadius="8px"
                    p="0 6px"
                    color="text_paragraph"
                    display="flex"
                    justifyContent="center"
                    gap="4px"
                    sx={{
                      _hover: {
                        color: 'text_caption',
                        svg: {
                          fill: 'text_caption'
                        }
                      }
                    }}
                  >
                    <Icon xlinkHref="#icon-icon_swap1" fontSize="16px" />
                  </Button>
                </CetusTooltip>
                {envConfigs.show_incentive_page && (
                  <CetusTooltip placement="top" tooltip="Add Incentive" fontSize="12px">
                    <Button
                      variant="outline"
                      bg="bg_secondary"
                      h="32px"
                      w="32px"
                      onClick={onJumpAddIncentive}
                      borderRadius="8px"
                      p="0 6px"
                      color="text_paragraph"
                      display="flex"
                      justifyContent="center"
                      gap="4px"
                      sx={{
                        _hover: {
                          color: 'text_caption',
                          svg: {
                            fill: 'text_caption'
                          }
                        }
                      }}
                    >
                      <Icon xlinkHref="#icon-icon_rewards" fontSize="16px" />
                    </Button>
                  </CetusTooltip>
                )}
                <CetusTooltip placement="top" tooltip="Refresh" fontSize="12px">
                  <Box>
                    <RefreshButton
                      key={poolId}
                      handleRefresh={handleRefresh}
                      isAutoRefresh
                      refreshInterval={30}
                      innerStyle={{ bg: 'background' }}
                      w="32px"
                      h="32px"
                      borderRadius="8px"
                      bg="background"
                    />
                  </Box>
                </CetusTooltip>
              </HStack>
            )}
          </HStack>
          <Stack
            flexDir={{ base: 'column', lg: 'row' }}
            w="100%"
            minW={{ base: '100%', lg: '1024px' }}
            justify="space-between"
            mt={isApp ? '16px' : '20px'}
            gap={{ base: '16px', lg: '8px' }}
          >
            <Stack px="12px" flexDir={{ base: 'column', lg: 'row' }} gap={{ base: '16px', lg: '12px' }} align={{ base: 'flex-start', lg: 'center' }}>
              {isApp ? (
                <HStack w="100%">
                  {isTokenAndFeeLoading ||
                  selectTokenAProps.loading ||
                  selectTokenBProps.loading ||
                  selectedTokenA?.symbol === undefined ||
                  selectedTokenB?.symbol === undefined ? (
                    <PoolTokenFeeSkeleton />
                  ) : (
                    <TokenFeeSelect
                      poolType="dlmm"
                      baseToken={selectedTokenA}
                      quoteToken={selectedTokenB}
                      baseFee={baseFee}
                      binStep={binStep}
                      onDlmmConfirm={async (baseToken, quoteToken, baseFee, binStep) => {
                        console.log('✅ [Dlmm] onDlmmConfirm 接收到:', {
                          base: baseToken,
                          quote: quoteToken,
                          baseFee,
                          binStep,
                          poolAddress: binStep?.poolAddress
                        })

                        const key = Object.keys(TabsEnum).find(tab => tab === currentTab)

                        // 检查token是否有变化
                        const isTokenChanged = baseToken.coin_type !== selectedTokenA?.coin_type || quoteToken.coin_type !== selectedTokenB?.coin_type

                        if (isTokenChanged) {
                          setIsGettingTokenProps(true)
                        }

                        try {
                          // 如果binStep已经有poolAddress，直接跳转（无论token是否变化）
                          if (binStep?.poolAddress) {
                            // console.log('✅ [Dlmm] 直接跳转到:', binStep.poolAddress)
                            navigate(`/dlmm?tab=deposit&poolId=${binStep.poolAddress}`)
                            return
                          }

                          // 如果有binStep但没有poolAddress，通过SDK查询池子地址
                          if (binStep?.binStep && binStep?.baseFactor) {
                            // console.log('🔍 [Dlmm] 通过SDK查询池子地址')
                            setIsGettingTokenProps(true)
                            const address = await dlmmSdk?.Pool?.getPoolAddress(
                              fixCoinType(baseToken.coin_type, true),
                              fixCoinType(quoteToken.coin_type, true),
                              binStep.binStep,
                              binStep.baseFactor as number
                            )

                            console.log('🔍 [Dlmm] SDK查询结果:', address)

                            if (address) {
                              // 找到池子地址，跳转
                              // console.log('✅ [Dlmm] 找到池子，跳转到:', address)
                              navigate(`/dlmm?tab=deposit&poolId=${address}`)
                            } else {
                              // 没找到池子，弹窗提示创建
                              // console.warn('⚠️ [Dlmm] 没有找到池子，弹窗提示')
                              setBinStep(binStep)
                              setBaseFee(baseFee)
                              navigate(`/dlmm?tab=deposit&from=${baseToken.coin_type}&to=${quoteToken.coin_type}&type=create`)
                              onOpen()
                            }
                          } else {
                            // 没有选择binStep，只有token和baseFee，直接跳转到token页面
                            // console.log('ℹ️ [Dlmm] 没有binStep，跳转到token页面')
                            navigate(`/dlmm?tab=deposit&from=${baseToken.coin_type}&to=${quoteToken.coin_type}&type=create`)
                          }
                        } catch (error) {
                          console.error('get pool failed:', error)
                          // 查询失败，弹窗提示创建
                          setBinStep(binStep)
                          setBaseFee(baseFee)
                          navigate(`/dlmm?tab=deposit&from=${baseToken.coin_type}&to=${quoteToken.coin_type}&type=create`)
                          onOpen()
                        } finally {
                          // 重置loading状态
                          setIsGettingTokenProps(false)
                        }
                      }}
                      loading={selectTokenAProps.loading || selectTokenBProps.loading || selectedTokenA?.symbol === undefined}
                      isShowSelect={true}
                      whiteTokenList={undefined}
                      isTokenAndFeeLoading={isTokenAndFeeLoading}
                      apiPoolInfoLoading={dlmmApiPoolInfoLoading}
                    />
                  )}
                  {dlmmApiPoolInfo && showContent && (
                    <PoolCurrentPrice
                      poolType="dlmm"
                      dlmmPoolInfo={dlmmApiPoolInfo as any}
                      dlmmCurrentPrice={currentPrice}
                      dlmmReverseCurrentPrice={reverseCurrentPrice}
                      priceDirect={priceDirect}
                      onPriceDirectChange={setPriceDirect}
                    />
                  )}
                </HStack>
              ) : (
                <>
                  <HStack gap="12px">
                    <SelectToken
                      onChange={token => {
                        if (token?.coin_type !== selectedTokenB?.coin_type && token?.coin_type !== selectedTokenA?.coin_type) {
                          setIsGettingTokenProps(true)
                        }
                        // console.log(token, selectedTokenA, selectedTokenB, 'Dlmm handleSelectToken')
                        handleSelectToken(token, selectedTokenA, selectedTokenB, from, to, true)
                      }}
                      {...selectTokenAProps}
                      loading={selectTokenAProps.loading || isTokenAndFeeLoading}
                    />
                    <SelectToken
                      onChange={token => {
                        if (token?.coin_type !== selectedTokenB?.coin_type && token?.coin_type !== selectedTokenA?.coin_type) {
                          setIsGettingTokenProps(true)
                        }
                        handleSelectToken(token, selectedTokenB, selectedTokenA, to, from, false)
                      }}
                      {...selectTokenBProps}
                      loading={selectTokenBProps.loading || isTokenAndFeeLoading || selectedTokenB?.symbol === undefined}
                    />
                  </HStack>
                  <DlmmFeeAndBinStepSelect
                    key={poolId}
                    feeOptions={(binStepConfig as DlmmSelectFeeType[]) || []}
                    baseFee={baseFee}
                    onBaseFeeChange={value => {
                      if (value) {
                        setBaseFee({ fee: value.fee, feeDisplay: value.feeDisplay })
                        setBinStep(undefined)
                      }
                    }}
                    binStep={binStep}
                    binStepList={binStepList}
                    changeLoading={changeBinStepLoading}
                    loading={!currentBaseFee || isTokenAndFeeLoading}
                    onBinStepChange={(item, hasEffect) => {
                      if (hasEffect) {
                        handleBinStepChange(item)
                      } else {
                        setBinStep(item)
                      }
                    }}
                  />
                </>
              )}
            </Stack>
            {showContent && dlmmApiPoolInfo && (
              <Box
                sx={{
                  ...(isApp && { w: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, px: '12px' }),
                  display: isApp ? (shouldShowPoolsStats ? 'block' : 'none') : 'block'
                }}
              >
                <PoolsStats
                  apiPoolInfo={dlmmApiPoolInfo as any}
                  totalTvl={totalTvl}
                  apiPoolInfoLoading={dlmmApiPoolInfoLoading}
                  tvlLoading={tvlLoading}
                />
              </Box>
            )}
          </Stack>
          {showContent && (
            <Stack
              w="100%"
              flexDir={{ base: 'column', lg: 'row' }}
              justify={{ base: 'center', lg: 'space-between' }}
              align={{ base: 'flex-start', lg: 'center' }}
              minW={{ base: '100%', lg: '1024px' }}
              gap={isApp ? '0px' : '8px'}
              mt={isApp ? '12px' : '0px'}
            >
              {isApp && <Box h="4px" w="100%" bg="bg_secondary" />}
              <SelectTab<any, any>
                type="borderTab"
                tabList={tabList}
                currentTab={currentTab}
                handleChangeTab={item => {
                  const key = Object.keys(TabsEnum).find(tab => TabsEnum[tab as keyof typeof TabsEnum] === item.label)
                  if (poolId) {
                    navigate(`/dlmm?tab=${key}&poolId=${poolId}`)
                  }
                  setCurrentTab(key as keyof typeof TabsEnum)
                }}
                wrapStyle={{
                  w: { base: '100%', lg: 'auto' },
                  justify: { base: 'flex-start', lg: 'flex-start' },
                  p: { base: '0px', lg: '0' },
                  bg: { base: 'transparent', lg: 'transparent' },
                  h: isApp ? '48px' : '58px',
                  gap: { base: '8px', lg: '45px' },
                  border: { base: '1px solid', lg: 'none' },
                  borderColor: { base: 'transparent', lg: 'transparent' },
                  borderRadius: { base: '16px', lg: 'unset' },
                  mt: { base: '0px', lg: '12px' },
                  sx: {
                    ...(isApp && {
                      border: 'none',
                      borderBottom: '1px solid',
                      borderRadius: '0',
                      borderColor: 'border !important',
                      px: '12px',
                      '& div:last-child': {
                        mr: 0
                      }
                      // bg: 'transparent'
                    })
                  }
                }}
                itemStyle={{
                  fontSize: isApp ? '14px' : '16px',
                  fontWeight: '500',
                  ...(isApp && {
                    mr: '16px'
                  })
                }}
              />
              <>
                {currentTab !== 'deposit' && dlmmApiPoolInfo && !isApp && (
                  <Stack
                    w={isApp ? '100%' : 'auto'}
                    mt={{ base: '4px', lg: '12px' }}
                    gap="12px"
                    flexDir={{ base: 'column', lg: 'row' }}
                    justify={{ base: 'center', lg: 'space-between' }}
                    align={{ base: 'flex-start', lg: 'center' }}
                  >
                    <Text>Current Pool Price</Text>

                    {dlmmApiPoolInfo?.displayTokenA && dlmmApiPoolInfo?.displayTokenB && (
                      <CurrentPrice
                        noCenter={isApp ? true : false}
                        fromToken={dlmmApiPoolInfo.displayTokenA}
                        toToken={dlmmApiPoolInfo.displayTokenB}
                        fromValue="1"
                        toValue={removeComma(dlmmApiPoolInfo?.isReverse ? reverseCurrentPrice : currentPrice).toString()}
                        color="text_caption"
                        wrapStyle={isApp ? { w: '100%' } : {}}
                        pageDirect={priceDirect}
                        handlePageToggleDirect={() => setPriceDirect(!priceDirect)}
                      />
                    )}
                  </Stack>
                )}
                {currentTab === 'deposit' && !isApp && (
                  <Box mt={{ base: '4px', lg: '12px' }}>
                    <Slippage
                      slippageType="liquidity"
                      poolType="dlmm"
                      showNewTolerance={currTabMode === BothAndZapTabAction.zapIn}
                      tokenA={dlmmApiPoolInfo?.displayTokenA}
                      tokenB={dlmmApiPoolInfo?.displayTokenB}
                    />
                  </Box>
                )}
              </>
            </Stack>
          )}
        </Box>
        {showContent ? (
          <>
            {!isApp && <Box h={{ base: '12px', lg: '8px' }} />}

            {currentTab === 'deposit' && (
              <DLMMDeposit
                rangeTabList={rangeTabList as any}
                getList={() => handleRefresh(true)}
                getPrice={handleGetPrice}
                binStep={dlmmContractPoolInfo?.binStep}
                baseFeeDisplay={dlmmApiPoolInfo?.feeDisplay || ''}
              />
            )}
            {currentTab === 'positions' && <MyPositions priceDirect={priceDirect} />}
            {currentTab === 'analytics' && <PoolsAnalytics priceDirect={priceDirect} />}
          </>
        ) : (
          <Box mt="20px">
            {(!dlmmApiPoolInfo && dlmmApiPoolInfoLoading) || isGettingTokenProps ? (
              <Center w="100%" h="480px" background="bg_secondary" borderRadius="12px" border="1px solid" borderColor="border">
                <Spinner />
              </Center>
            ) : (
              <NoData type="custom" imgUrl="/images/img_pool@2x.png" h="480px">
                <VStack>
                  {selectedTokenA && selectedTokenB ? (
                    isTrustedToken(selectedTokenA, quoteWhiteTokenList) || isTrustedToken(selectedTokenB, quoteWhiteTokenList) ? (
                      <>
                        <Text h="20px" lineHeight="20px" fontSize="14px" color="text_caption" fontWeight="500">
                          This Pool has not been initialized
                        </Text>
                        <Text fontSize="14px">Do you want to initialize it?</Text>
                        <Button
                          mt="12px"
                          w="120px"
                          h="32px"
                          borderRadius="8px"
                          colorScheme="blue"
                          fontSize="14px"
                          fontWeight="500"
                          onClick={() => {
                            onClose()
                            onConfirm()
                          }}
                        >
                          Initialized Pool
                        </Button>
                      </>
                    ) : (
                      <Text h="20px" lineHeight="20px" fontSize="14px" color="text_caption">
                        No Liquidity Data
                      </Text>
                    )
                  ) : (
                    <Text h="20px" lineHeight="20px" fontSize="14px" color="text_caption">
                      Select the token you want to provide liquidity for.
                    </Text>
                  )}
                </VStack>
              </NoData>
            )}
          </Box>
        )}
      </Box>
      {/* Token 警告弹窗 */}
      {selectedTokenA && selectedTokenB && (
        <WarningTokenTipsModal
          tokensInfo={[selectedTokenA, selectedTokenB]}
          waringModalCancel={(tokenInfo: Token[]) => {
            navigate('/pools?tab=dlmm_pools')
          }}
        />
      )}
      <SelectTokenAndFeeConfirm
        title="This Pool has not been initialized"
        subTitle="Do you want to initialize it?"
        btnText="Initialized Pool"
        isOpen={isOpen}
        onClose={onCloseInitializedPoolModal}
        onConfirm={onConfirm}
      />
    </>
  )
}

export default Dlmm
