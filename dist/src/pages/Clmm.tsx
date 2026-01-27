import Slippage from '@/components/common/Slippage'
import VersionBlock from '@/components/common/VersionBlock'
import MyPositions from '@/components/liquidity/clmm/MyPositions'
import PoolsStats from '@/components/liquidity/clmm/PoolsStats'
import PoolsAnalytics from '@/components/liquidity/clmm/analytics/PoolsAnalytics'
import ProvideLiquidity from '@/components/liquidity/clmm/deposit'
import PoolCurrentPrice from '@/components/liquidity/common/PoolCurrentPrice'
import PoolTokenFeeSkeleton from '@/components/liquidity/common/PoolTokenFeeSkeleton'
import SelectTokenAndFeeConfirm from '@/components/liquidity/common/SelectTokenAndFeeConfirm'
import TokenFeeSelect from '@/components/liquidity/common/TokenFeeSelect'
import Back from '@/components/pools/Back'
import { SelectToken } from '@/components/selectPool/SelectToken'
import useGetTvlInfo from '@/hooks/clmm/useGetTvlInfo'
import useLiquidity from '@/hooks/clmm/useLiquidity'
import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import useGetPoolList from '@/hooks/pool/useGetPoolList'
import { useTopButtonStyle } from '@/hooks/pool/useTopButtonStyle'
import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import useGlobalStore from '@/store/common/global'
import { isTrustedToken } from '@/utils'
import { CetusTooltip, CopyButton, CurrentPrice, FeeSelectBlock, SelectTab } from '@cetus/design'
import WarningTokenTipsModal from '@cetus/design/src/components/common/WarningTokenTipModal'
import { ClmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon, NoData, RefreshButton } from '@cetus/ui-kit'
import { d, formatNumberWithDown, isAvailableObject } from '@cetus/utils'
import { Box, Button, Center, HStack, Spinner, Stack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabsEnum } from '../hooks/clmm/useLiquidityInteraction'

function CLMM() {
  const navigate = useNavigate()
  const { apiPoolInfo, apiPoolInfoLoading, currentPriceData, netError } = useLiquidityStore()
  const { useZapIn } = useAddLiquidityStore()
  const { poolAddress, from, to } = useQueryParams()
  const {
    feeTierList,
    currentFeeTier,
    rangeTabList,
    quoteWhiteTokenList,
    warningTokenList,
    currentTab,
    setCurrentTab,
    tabList,
    favoriteStyle,
    onChangeFavorites,
    selectedTokenA,
    selectedTokenB,
    onConfirm,
    setFeeTier,
    handleRefresh,
    handleGetPrice,
    onJump2Swap,
    handleSelectToken,
    getSelectTokenProps
  } = useLiquidity()

  const { isApp } = useWindowWidth()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { totalAmountUSD: totalTvl, tvlLoading } = useGetTvlInfo()

  const showContent = poolAddress && apiPoolInfo?.tokenA && apiPoolInfo?.tokenB

  const { tooltip, xlinkHref, svgFill, svgHover } = favoriteStyle

  const [selectTokenAProps, setSelectTokenAProps] = useState<any>({})
  const [selectTokenBProps, setSelectTokenBProps] = useState<any>({})
  const [isGettingTokenProps, setIsGettingTokenProps] = useState<boolean>(false)

  const { fetchIsSupportZap, isSupportZap } = useIsSupportZap(selectedTokenA?.coin_type, selectedTokenB?.coin_type)
  useEffect(() => {
    if (selectedTokenA?.coin_type && selectedTokenB?.coin_type) {
      fetchIsSupportZap(selectedTokenA.coin_type, selectedTokenB.coin_type)
    }
  }, [selectedTokenA?.coin_type, selectedTokenB?.coin_type])
  const { getPoolList } = useGetPoolList()

  const fetchSelectTokenProps = useCallback(async () => {
    try {
      const tokenAProps = await getSelectTokenProps(from, selectedTokenA)
      const tokenBProps = await getSelectTokenProps(to, selectedTokenB)
      setSelectTokenAProps(tokenAProps)
      setSelectTokenBProps(tokenBProps)
    } catch (error) {
      setIsGettingTokenProps(false)
    } finally {
      setIsGettingTokenProps(false)
    }
  }, [from, to, selectedTokenA, selectedTokenB, getSelectTokenProps])

  useDebounceEffect(
    () => {
      fetchSelectTokenProps()
    },
    [fetchSelectTokenProps],
    {
      wait: 300
    }
  )
  const { backUrl } = useGlobalStore()
  const [priceDirect, setPriceDirect] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [shouldShowPoolsStats, setShouldShowPoolsStats] = useState(true)
  const prevScrollYRef = useRef(0)
  const lastUpdateTimeRef = useRef(0)

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

  const isTokenAndFeeLoading = useMemo(() => {
    return (
      (from !== undefined && to !== undefined && !apiPoolInfo && apiPoolInfoLoading) ||
      isGettingTokenProps ||
      (!isAvailableObject(selectTokenAProps) && !isAvailableObject(selectTokenBProps))
    )
  }, [from, to, apiPoolInfo, apiPoolInfoLoading, isGettingTokenProps, selectTokenAProps, selectTokenBProps])

  const topButtonStyle = useTopButtonStyle(isApp)

  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-container')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0 })
    }
  }, [currentTab])

  return (
    <>
      <Box w="100%" mt={{ base: '12px', lg: '20px' }}>
        <Box
          position={{ base: 'sticky', lg: 'relative' }}
          top={{ base: '48px', lg: 'auto' }}
          zIndex={{ base: 99999999, lg: 'auto' }}
          bg={{ base: 'bg_primary', lg: '' }}
          pb={{ base: '0', lg: '0px' }}
        >
          <HStack w="100%" minW={{ base: '100%', lg: '1024px' }} justify="space-between" px={{ base: '12px', lg: '0px' }}>
            <Back backUrl={backUrl} backText="CLMM Pools" type="clmm" />

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
                    <CopyButton text={poolAddress} />
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
                <CetusTooltip placement="top" tooltip="Refresh" fontSize="12px">
                  <Box>
                    <RefreshButton
                      key={poolAddress}
                      handleRefresh={handleRefresh}
                      isAutoRefresh
                      refreshInterval={60}
                      innerStyle={{ bg: 'bg_secondary' }}
                      w="32px"
                      h="32px"
                      borderRadius="8px"
                      bg="bg_secondary"
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
            // px="12px"
          >
            <Stack
              px={{ base: '12px', lg: '0px' }}
              flexDir={{ base: 'column', lg: 'row' }}
              gap={{ base: '16px', lg: '12px' }}
              align={{ base: 'flex-start', lg: 'center' }}
            >
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
                      poolType="clmm"
                      baseToken={selectedTokenA}
                      quoteToken={selectedTokenB}
                      currentFeeTier={currentFeeTier as ClmmSelectFeeType}
                      onConfirm={async (baseToken, quoteToken, feeTier) => {
                        // console.log('✅ [Clmm] onConfirm 接收到:', {
                        //   base: baseToken.symbol,
                        //   quote: quoteToken.symbol,
                        //   fee: feeTier.fee,
                        //   feeDisplay: feeTier.feeDisplay,
                        //   poolAddress: feeTier.poolAddress
                        // })

                        const key = Object.keys(TabsEnum).find(tab => tab === currentTab)

                        // 检查token是否有变化
                        const isTokenChanged = baseToken.coin_type !== selectedTokenA?.coin_type || quoteToken.coin_type !== selectedTokenB?.coin_type

                        if (isTokenChanged) {
                          setIsGettingTokenProps(true)
                        }

                        // 统一逻辑：都查询一次池子来确保准确性
                        try {
                          // 如果feeTier已经有poolAddress，且token没变，可以直接跳转
                          if (!isTokenChanged && feeTier?.poolAddress) {
                            // console.log('✅ [Clmm] 直接跳转到:', feeTier.poolAddress)
                            navigate(`/clmm?tab=deposit&poolAddress=${feeTier.poolAddress}`)
                            return
                          }

                          // 否则，查询该token对的所有池子
                          setIsGettingTokenProps(true)
                          // console.log('🔍 [Clmm] 查询池子:', `${baseToken.coin_type},${quoteToken.coin_type}`)

                          const res = await getPoolList({
                            coin_type: `${baseToken.coin_type},${quoteToken.coin_type}`,
                            is_vaults: false,
                            display_all_pools: true,
                            has_mining: true,
                            has_farming: true,
                            no_incentives: true,
                            order_by: '-vol',
                            offset: 0
                          })

                          // console.log('🔍 [Clmm] 查询结果:', {
                          //   totalPools: res?.list?.length || 0,
                          //   pools: res?.list?.map(p => ({ fee: p.feeRate, poolAddress: p.poolAddress }))
                          // })

                          // 查找匹配fee的池子（使用feeRate而不是fee）
                          const matchedPool = res?.list?.find(item => d(item?.feeRate).eq(feeTier.feeRate))
                          // console.log('🔍 [Clmm] 匹配结果:', {
                          //   searchFeeRate: feeTier.feeRate,
                          //   searchFee: feeTier.fee,
                          //   matched: matchedPool ? { feeRate: matchedPool.feeRate, poolAddress: matchedPool.poolAddress } : null
                          // })
                          if (matchedPool?.poolAddress) {
                            navigate(`/clmm?tab=deposit&poolAddress=${matchedPool.poolAddress}`)
                          } else {
                            setFeeTier(feeTier as any)
                            onOpen()
                            navigate(`/clmm?tab=deposit&from=${baseToken?.coin_type}&to=${quoteToken?.coin_type}`)
                          }
                        } catch (error) {
                          console.error('❌ [Clmm] 查询池子失败:', error)
                        } finally {
                          // 重置loading状态
                          setIsGettingTokenProps(false)
                        }
                      }}
                      loading={selectTokenAProps.loading || selectTokenBProps.loading}
                      disabled={netError}
                      isShowSelect={!apiPoolInfo?.isFrozen}
                      whiteTokenList={undefined}
                      isTokenAndFeeLoading={isTokenAndFeeLoading}
                      apiPoolInfoLoading={apiPoolInfoLoading}
                    />
                  )}
                  {showContent && (
                    <PoolCurrentPrice
                      poolType="clmm"
                      clmmPoolInfo={apiPoolInfo}
                      clmmPriceData={currentPriceData}
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
                        handleSelectToken(token, selectedTokenA, selectedTokenB, from, to, true)
                      }}
                      {...selectTokenAProps}
                      loading={selectTokenAProps.loading || isTokenAndFeeLoading || selectedTokenA?.symbol === undefined}
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

                  <FeeSelectBlock<'clmm'>
                    poolType="clmm"
                    value={currentFeeTier as ClmmSelectFeeType}
                    loading={(!currentFeeTier && apiPoolInfoLoading) || isTokenAndFeeLoading}
                    options={feeTierList}
                    disabled={netError}
                    isShowSelect={!apiPoolInfo?.isFrozen}
                    onChange={item => {
                      if (item?.poolAddress) {
                        navigate(`/clmm?poolAddress=${item?.poolAddress}`)
                      } else {
                        setFeeTier(item as any)
                        onOpen()
                      }
                    }}
                  />
                </>
              )}
              {isApp && apiPoolInfo?.isFrozen ? <VersionBlock blockSize="large" /> : null}
              {!isApp && apiPoolInfo?.isFrozen ? <VersionBlock blockSize="large" /> : null}
            </Stack>
            {showContent && (
              <Box
                sx={{
                  ...(isApp && { w: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, px: '12px' }),
                  display: isApp ? (shouldShowPoolsStats ? 'block' : 'none') : 'block'
                }}
              >
                <PoolsStats apiPoolInfo={apiPoolInfo} totalTvl={totalTvl} apiPoolInfoLoading={apiPoolInfoLoading} tvlLoading={tvlLoading} />
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

                  if (poolAddress) {
                    navigate(`/clmm?tab=${key}&poolAddress=${poolAddress}`)
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
                {currentTab === 'deposit' && !isApp && (
                  <Box mt="24px">
                    <Slippage
                      slippageType="liquidity"
                      poolType="clmm"
                      showNewTolerance={isSupportZap && useZapIn}
                      tokenA={apiPoolInfo?.displayTokenA}
                      tokenB={apiPoolInfo?.displayTokenB}
                    />
                  </Box>
                )}
                {currentTab !== 'deposit' && !isApp && apiPoolInfo && (
                  <Stack
                    w={isApp ? '100%' : 'auto'}
                    mt={{ base: '4px', lg: '12px' }}
                    gap="12px"
                    flexDir={{ base: 'column', lg: 'row' }}
                    justify={{ base: 'center', lg: 'space-between' }}
                    align={{ base: 'flex-start', lg: 'center' }}
                  >
                    <Text>Current Pool Price</Text>

                    {apiPoolInfo?.displayTokenA && apiPoolInfo?.displayTokenB && (
                      <CurrentPrice
                        noCenter={isApp ? true : false}
                        fromToken={apiPoolInfo.displayTokenA}
                        toToken={apiPoolInfo.displayTokenB}
                        fromValue="1"
                        toValue={formatNumberWithDown(
                          apiPoolInfo?.isReverse ? currentPriceData?.reverseCurrentPrice : currentPriceData?.currentPrice,
                          6,
                          true
                        ).toString()}
                        color="text_caption"
                        wrapStyle={isApp ? { w: '100%' } : {}}
                        handlePageToggleDirect={() => setPriceDirect(!priceDirect)}
                      />
                    )}
                  </Stack>
                )}
              </>
            </Stack>
          )}
        </Box>
        {showContent ? (
          <>
            {!isApp && <Box h={{ base: '20px', lg: '12px' }} />}

            {currentTab === 'deposit' && (
              <ProvideLiquidity
                rangeTabList={rangeTabList as any}
                getList={handleRefresh}
                getPrice={handleGetPrice}
                currentFeeTier={currentFeeTier as any}
              />
            )}
            {currentTab === 'positions' && <MyPositions priceDirect={priceDirect} />}
            {currentTab === 'analytics' && <PoolsAnalytics />}
          </>
        ) : (
          <Box mt="20px">
            {!apiPoolInfo && apiPoolInfoLoading ? (
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
      {apiPoolInfo?.displayTokenA && apiPoolInfo?.displayTokenB && (
        <WarningTokenTipsModal
          tokensInfo={warningTokenList}
          waringModalCancel={(tokenInfo: Token[]) => {
            navigate('/pools')
          }}
        />
      )}
      <SelectTokenAndFeeConfirm
        title="This Pool has not been initialized"
        subTitle="Do you want to initialize it?"
        btnText="Initialized Pool"
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </>
  )
}

export default CLMM
