/**
 * 流动性交互Hook
 * Liquidity Interaction Hook
 */
import { DLMMPoolsIdRangePath } from '@/apis/path'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import useDlmmDepositStore from '@/store/dlmm/dlmmDeposit'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import useDlmmPoolsStore from '@/store/pool/useDlmmPoolStore'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import { isTrustedToken } from '@/utils'
import { getBaseFeeList } from '@/utils/dlmm'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useFetch } from '@cetus/hooks'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { CoinType, Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { cancelBubble } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useQuoteWhiteTokenList from '../create-pool/useQuoteWhiteTokenList'
import useFavoriteDlmmPool from '../pool/useFavoriteDlmmPool'
import useGetDlmmRelatedPools from './useGetDlmmRelatedPools'

/**
 * 标签页枚举
 * Tab enumeration
 */
export enum TabsEnum {
  deposit = 'Provide Liquidity',
  positions = 'My Positions',
  analytics = 'Analytics'
}

/**
 * 默认标签页列表
 * Default tab list
 */
const defaultTabList: { label: TabsEnum; key: keyof typeof TabsEnum }[] = [
  {
    label: TabsEnum.deposit,
    key: 'deposit'
  },
  {
    label: TabsEnum.positions,
    key: 'positions'
  },
  {
    label: TabsEnum.analytics,
    key: 'analytics'
  }
]

/**
 * 流动性交互Hook
 * @param apiPoolInfo - 池子API信息 / Pool API information
 */
function useDlmmLiquidityInteraction() {
  // 获取URL参数和导航函数
  // Get URL parameters and navigation function
  const { tab, poolId } = useQueryParams()
  const navigate = useNavigate()
  const { setCurrentPrice, dlmmApiPoolInfo, setDlmmApiPoolInfo, dlmmApiPoolInfoLoading, netError } = useDlmmLiquidityStore()
  // 状态管理
  // State management

  const [binStep, setBinStep] = useState<any>()
  const [tabList, setTabList] = useState<Tab[]>(defaultTabList)
  const [currentTab, setCurrentTab] = useState<keyof typeof TabsEnum>(defaultTabList?.find(item => item.key === tab)?.key || defaultTabList[0].key)
  const [selectedTokenA, setSelectedTokenA] = useState<Token>()
  const [selectedTokenB, setSelectedTokenB] = useState<Token>()

  // Store hooks
  const { dlmmPosBaseListGroupByPool } = useDlmmPositionStore()
  const { addFavorites, removeFavorites } = useFavoriteDlmmPool()
  const { dlmmPoolFavoriteIds } = useDlmmPoolsStore()
  const { fromToken, toToken } = useAddDlmmLiquidityStore()
  const { binStepConfig } = useBinStepConfigStore()
  // Token price hook
  const { fetchTokenPrices } = useTokenPrice()
  const { currentAccount } = useAccountStore()

  const { setFromCoin, setToCoin } = useSwapWidgetStore()
  const { setIsOpen } = useSwapWidgetConfigStore()
  const { setPoolType, setCurrentStep } = useCreatePoolStore()
  const { quoteWhiteTokenList } = useQuoteWhiteTokenList()
  const [baseFee, setBaseFee] = useState<any>()
  const { getList, relatedPoolList } = useGetDlmmRelatedPools()
  const { getTokenInfo } = useGetToken()
  const { fetchByApi } = useFetch()
  const { setPriceRangeMap } = useDlmmDepositStore()
  const { isSwapWidgetDisplay } = useWebConfigStore()
  const { isApp } = useWindowWidth()
  /**
   * 跳转到swap token页面，PC打开小组件，H5跳转页面
   * Jump to swap token page, PC opens widget, H5 jumps page
   */
  const onJump2Swap = () => {
    if (isSwapWidgetDisplay) {
      setIsOpen(true)
    } else {
      navigate(`/swap/${dlmmApiPoolInfo?.coin_type_a}/${dlmmApiPoolInfo?.coin_type_b}`)
    }
  }

  const onJumpAddIncentive = () => {
    navigate(`/incentive?poolAddress=${dlmmApiPoolInfo?.poolAddress}`)
  }

  /**
   * 切换小组件token与当前池子相同
   */
  useEffect(() => {
    if (fromToken && toToken) {
      setFromCoin(fromToken)
      setToCoin(toToken)
    }
    return () => {
      setFromCoin(envConfigs.clmm_swap.from_coin)
      setToCoin(envConfigs.clmm_swap.to_coin)
    }
  }, [fromToken, toToken])

  /**
   * 计算当前池子的仓位数量
   * Calculate the number of positions for current pool
   */
  const positionNum = useMemo(() => {
    if (poolId && poolId !== 'undefined') {
      const res = dlmmPosBaseListGroupByPool[poolId.toLowerCase() || '']
      if (res && res?.list) {
        return res?.list.length > 0 ? res?.list.length : undefined
      }
      return undefined
    }
    return undefined
  }, [JSON.stringify(dlmmPosBaseListGroupByPool), poolId])

  /**
   * 更新标签页列表中的仓位数量
   * Update position numbers in tab list
   */
  useEffect(() => {
    setTabList(
      defaultTabList?.map(tab => ({
        ...tab,
        num: tab.label === TabsEnum.positions && currentAccount?.address ? positionNum : undefined
      }))
    )
  }, [positionNum, currentAccount?.address])

  /**
   * 同步URL参数中的标签页
   * Synchronize tab from URL parameters
   */
  useLayoutEffect(() => {
    if (tab && tab !== currentTab) {
      setCurrentTab(tab as keyof typeof TabsEnum)
    }
  }, [tab])

  /**
   * 判断当前池子是否被收藏
   * Check if current pool is favorited
   */
  const isFavoritePool = useMemo(() => {
    return dlmmPoolFavoriteIds?.includes(poolId || '')
  }, [JSON.stringify(dlmmPoolFavoriteIds), poolId])

  /**
   * 处理收藏/取消收藏
   * Handle favorite/unfavorite
   */
  const onChangeFavorites = (e: any) => {
    cancelBubble(e)
    if (poolId) {
      // 如果当前池子已经被收藏，则移除收藏
      isFavoritePool ? removeFavorites(poolId) : addFavorites(poolId)
    }
  }

  const favoriteStyle = useMemo(() => {
    return isFavoritePool
      ? {
          tooltip: 'Remove from Watchlist',
          xlinkHref: '#icon-icon_star_sel',
          svgFill: 'primary_blue',
          svgHover: 'primary'
        }
      : {
          tooltip: 'Add to Watchlist',
          xlinkHref: '#icon-icon_star',
          svgFill: 'text_paragraph',
          svgHover: isApp ? 'primary_blue' : 'text_caption'
        }
  }, [isFavoritePool])

  /**
   * 同步选中的代币
   * Synchronize selected tokens
   */

  useEffect(() => {
    if (dlmmApiPoolInfo?.displayTokenA && dlmmApiPoolInfo?.displayTokenB) {
      console.log('dlmmApiPoolInfo?.displayTokenA: ', dlmmApiPoolInfo)
      if (dlmmApiPoolInfo?.displayTokenA?.coin_type !== 'undefined') {
        setSelectedTokenA(dlmmApiPoolInfo?.displayTokenA)
      }
      if (dlmmApiPoolInfo?.displayTokenB?.coin_type !== 'undefined') {
        setSelectedTokenB(dlmmApiPoolInfo?.displayTokenB)
      }
    }
    if (dlmmApiPoolInfo?.displayTokenA?.coin_type && dlmmApiPoolInfo?.displayTokenB?.coin_type) {
      fetchTokenInfo([dlmmApiPoolInfo?.displayTokenA?.coin_type, dlmmApiPoolInfo?.displayTokenB?.coin_type]).then(res => {
        console.log('dlmmApiPoolInfo?.displayTokenA res: ', res)
        if (res && res?.size > 0) {
          setSelectedTokenA(res?.get(dlmmApiPoolInfo?.displayTokenA?.coin_type))
          setSelectedTokenB(res?.get(dlmmApiPoolInfo?.displayTokenB?.coin_type))
        }
      })
    }
  }, [dlmmApiPoolInfo?.displayTokenA?.coin_type, dlmmApiPoolInfo?.displayTokenB?.coin_type])

  /**
   * 确认创建池子
   * Confirm pool creation
   */

  const onConfirm = () => {
    setCurrentStep(2)
    // setPoolType('dlmm')
    navigate(
      `/create-pool/${dlmmApiPoolInfo?.displayTokenA?.coin_type}/${dlmmApiPoolInfo?.displayTokenB?.coin_type}/${baseFee?.fee}?baseFactor=${binStep?.baseFactor}&poolType=dlmm`
    )
  }

  // 刷新市场价格
  const refreshMarketPrice = () => {
    const list = []
    if (fromToken) {
      list.push(fromToken.coin_type)
    }

    if (toToken) {
      list.push(toToken.coin_type)
    }

    if (dlmmApiPoolInfo?.miningRewardList) {
      dlmmApiPoolInfo?.miningRewardList?.forEach((item: any) => {
        if (item.emissionsEveryDay) {
          list.push(item.coinType)
        }
      })
    }

    if (list.length > 0) {
      fetchTokenPrices(Array.from(new Set(list.filter(item => item && item !== 'undefined'))))
    }
  }
  /**
   * 当fromToken或toToken变化时，刷新市场价格
   * When fromToken or toToken changes, refresh market price
   */
  useEffect(() => {
    refreshMarketPrice()
  }, [fromToken?.coin_type, toToken?.coin_type])

  const { fetchTokenInfo } = useGetToken()

  /**
   * 切换代币
   * Switch tokens
   */
  const handleSelectToken = useCallback(
    async (token: Token, self_selected?: Token, other_selected?: Token, self_address?: string, other_address?: string, isDisplayA?: boolean) => {
      const key = Object.keys(TabsEnum).find(tab => tab === currentTab)
      const coinTypeList = [self_address, other_address].filter(Boolean)

      const tokenMap = await fetchTokenInfo<CoinType[]>(coinTypeList as CoinType[])
      if (other_selected?.coin_type || tokenMap?.get((other_address || '') as CoinType)?.coin_type) {
        if (
          extractStructTagFromType(token?.coin_type).full_address ===
          extractStructTagFromType(other_selected?.coin_type || tokenMap?.get((other_address || '') as CoinType)?.coin_type || '').full_address
        ) {
          setSelectedTokenA(selectedTokenB)
          setSelectedTokenB(selectedTokenA)
        } else if (
          extractStructTagFromType(token?.coin_type).full_address ===
          extractStructTagFromType(self_selected?.coin_type || tokenMap?.get((self_address || '') as CoinType)?.coin_type || '').full_address
        ) {
          return
        } else {
          if (isDisplayA) {
            navigate(
              `/dlmm?tab=${key}&from=${token?.coin_type}&to=${other_selected?.coin_type || tokenMap?.get((other_address || '') as CoinType)?.coin_type}`
            )
          } else {
            navigate(
              `/dlmm?tab=${key}&from=${other_selected?.coin_type || tokenMap?.get((other_address || '') as CoinType)?.coin_type}&to=${token?.coin_type}`
            )
          }
          setDlmmApiPoolInfo(null)
        }
      } else {
        if (isDisplayA) {
          navigate(`/dlmm?tab=${key}&from=${token?.coin_type}`)
        } else {
          navigate(`/dlmm?tab=${key}&to=${token?.coin_type}`)
        }
        setDlmmApiPoolInfo(null)
      }
    },
    [selectedTokenA, selectedTokenB, currentTab]
  )

  /**
   * 获取SelectToken组件的props
   * Get props for SelectToken component
   * @param address
   * @param token
   * @returns SelectTokenProps
   */
  const getSelectTokenProps = useCallback(
    async (address?: string, token?: Token) => {
      const tokenInfo = await fetchTokenInfo<CoinType>((address || '') as CoinType)
      return {
        value: token ? token : address ? tokenInfo : undefined,
        isWhiteSelect: false,
        whiteTokenList: undefined,
        disabled: netError,
        tokenStyle: { p: 0, border: 'none' },
        tokenSize: '32px',
        symbolStyle: { fontSize: '20px', fontWeight: '500' },
        wrapStyle: { h: '32px', border: 'none', p: '0', bg: 'background' },
        loading: !token && dlmmApiPoolInfoLoading
      }
    },
    [netError, dlmmApiPoolInfoLoading]
  )

  useEffect(() => {
    if (dlmmApiPoolInfo?.poolAddress) {
      setBaseFee({
        fee: dlmmApiPoolInfo?.fee,
        feeDisplay: dlmmApiPoolInfo?.feeDisplay
      })
      setBinStep({
        binStep: dlmmApiPoolInfo?.binStep,
        poolAddress: dlmmApiPoolInfo?.poolAddress
      })
    }
  }, [dlmmApiPoolInfo?.poolAddress, dlmmApiPoolInfo?.fee, dlmmApiPoolInfo?.feeDisplay])

  const fetchPriceRange = async (poolId: string, binStep: number, tokenA: Token, tokenB: Token) => {
    try {
      const res = await fetchByApi(DLMMPoolsIdRangePath, 'POST', { pools: [poolId] })
      if (res && res?.data && res?.data?.list && res?.data?.list.length > 0) {
        const rangesWithDateTypeMap = Object.fromEntries(
          res?.data?.list[0]?.ranges?.map((item: any) => {
            const min = BinUtils?.getPriceFromBinId(item?.min ?? 0, binStep, tokenA?.decimals, tokenB?.decimals)
            const max = BinUtils?.getPriceFromBinId(item?.max ?? 0, binStep, tokenA?.decimals, tokenB?.decimals)
            return [`${item?.type}-${poolId}`, [min, max]]
          })
        )
        setPriceRangeMap(rangesWithDateTypeMap)
        return {
          rangesWithDateTypeMap
        }
      }
      return {
        rangesWithDateTypeMap: {}
      }
    } catch (error) {
      console.error('Error in fetchPriceRange:', error)
      setPriceRangeMap({})
      return {
        rangesWithDateTypeMap: {}
      }
    }
  }

  const getCurrentPrice = async (poolInfo: any) => {
    if (poolInfo?.activeId !== undefined) {
      let decimalsA, decimalsB
      if (poolInfo?.tokenA) {
        decimalsA = poolInfo?.tokenA?.decimals
      } else {
        const tokenAInfo = await getTokenInfo(poolInfo?.coinTypeA)
        decimalsA = tokenAInfo?.decimals
      }
      if (poolInfo?.tokenB) {
        decimalsB = poolInfo?.tokenB?.decimals
      } else {
        const tokenBInfo = await getTokenInfo(poolInfo?.coinTypeB)
        decimalsB = tokenBInfo?.decimals
      }

      const _price = BinUtils?.getPriceFromBinId(poolInfo?.activeId, poolInfo?.binStep, decimalsA, decimalsB)
      setCurrentPrice(_price)
    }
  }

  const binStepList = useMemo(() => {
    console.log(relatedPoolList, 'relatedPoolList')
    const list = getBaseFeeList(relatedPoolList)
    if (list?.length > 0) {
      if (baseFee) {
        const defaultOptions = binStepConfig?.find(item => item?.fee === baseFee?.fee + '')?.binStepList
        if (defaultOptions) {
          if (dlmmApiPoolInfo?.tokenA && dlmmApiPoolInfo?.tokenB) {
            return defaultOptions?.map(item => {
              const existPool = list.find(l => l.feeRate + '' === baseFee.fee + '' && l.binStep === item?.binStep)
              const title = existPool?.title || item.title
              return {
                ...item,
                title,
                poolAddress: existPool?.poolAddress,
                disabled:
                  title === 'Not Created' &&
                  !isTrustedToken(dlmmApiPoolInfo?.tokenA, quoteWhiteTokenList) &&
                  !isTrustedToken(dlmmApiPoolInfo?.tokenB, quoteWhiteTokenList)
                    ? true
                    : false
              }
            })
          } else {
            return defaultOptions?.map(item => {
              const existPool = list.find(l => l.feeRate + '' === baseFee.fee + '' && l.binStep === item?.binStep)
              const title = existPool?.title || item.title
              return {
                ...item,
                title,
                poolAddress: existPool?.poolAddress,
                disabled:
                  !isTrustedToken(dlmmApiPoolInfo?.displayTokenA, quoteWhiteTokenList) &&
                  !isTrustedToken(dlmmApiPoolInfo?.displayTokenB, quoteWhiteTokenList)
                    ? true
                    : false
              }
            })
          }
        }
      }
    } else {
      if (baseFee) {
        const defaultOptions = binStepConfig?.find(item => item?.fee === baseFee?.fee + '')?.binStepList
        return defaultOptions?.map(item => ({
          ...item,
          title: 'Not Created'
        }))
      }
    }
  }, [
    JSON.stringify(relatedPoolList),
    JSON.stringify(quoteWhiteTokenList),
    dlmmApiPoolInfo?.displayTokenA?.coin_type,
    dlmmApiPoolInfo?.displayTokenB?.coin_type,
    baseFee,
    binStepConfig
  ])
  /**
   * 获取当前池子的费率信息
   * Get the current pool fee rate information
   */

  const currentBaseFee = useMemo(() => {
    const _currentFeeTier = binStepList?.find(item => item.poolAddress === poolId)

    if (_currentFeeTier) {
      return _currentFeeTier
    } else {
      return dlmmApiPoolInfo
    }
  }, [JSON.stringify(binStepList), poolId, JSON.stringify(dlmmApiPoolInfo)])

  return {
    currentTab,
    setCurrentTab,
    tabList,
    favoriteStyle,
    onChangeFavorites,
    selectedTokenA,
    selectedTokenB,
    setSelectedTokenA,
    setSelectedTokenB,
    onConfirm,
    refreshMarketPrice,
    onJump2Swap,
    onJumpAddIncentive,
    handleSelectToken,
    getSelectTokenProps,
    binStep,
    setBinStep,
    getCurrentPrice,
    getList,
    relatedPoolList,
    binStepList,
    currentBaseFee,
    fetchPriceRange,
    baseFee,
    setBaseFee
  }
}

export default useDlmmLiquidityInteraction
