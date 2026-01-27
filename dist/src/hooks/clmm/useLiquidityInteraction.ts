/**
 * 流动性交互Hook
 * Liquidity Interaction Hook
 */
import { FeeTier } from '@/components/selectPool/type'
import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import usePoolsStore from '@/store/pool'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import usePositionStore from '@/store/position'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import { PoolApiInfo } from '@/types'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { CoinType, Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { cancelBubble } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFavoritePool from '../pool/useFavoritePool'
import useGetTvlInfo from './useGetTvlInfo'

/**
 * 流动性交互接口定义
 * Interface definition for liquidity interaction
 */
type LiquidityInteraction = {
  apiPoolInfo: PoolApiInfo | null
}

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
function useLiquidityInteraction({ apiPoolInfo }: LiquidityInteraction) {
  const { currentAccount } = useAccountStore()
  // 获取URL参数和导航函数
  // Get URL parameters and navigation function
  const { tab, poolAddress } = useQueryParams()
  const navigate = useNavigate()

  // 状态管理
  // State management
  const [feeTier, setFeeTier] = useState<FeeTier>()
  const [tabList, setTabList] = useState<Tab[]>(defaultTabList)
  const [currentTab, setCurrentTab] = useState<keyof typeof TabsEnum>(defaultTabList?.find(item => item.key === tab)?.key || defaultTabList[0].key)
  const [selectedTokenA, setSelectedTokenA] = useState<Token>()
  const [selectedTokenB, setSelectedTokenB] = useState<Token>()
  // Store hooks
  const { posBaseListGroupByPool, posBaseListLoading } = usePositionStore()
  const { addFavorites, removeFavorites } = useFavoritePool()
  const { poolFavoriteIds } = usePoolsStore()
  const { fromToken, toToken } = useAddLiquidityStore()

  // Token price hook
  const { fetchTokenPrices } = useTokenPrice()

  const { setFromCoin, setToCoin } = useSwapWidgetStore()
  const { setIsOpen } = useSwapWidgetConfigStore()
  const { setPoolType, setCurrentStep } = useCreatePoolStore()
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
      navigate(`/swap/${apiPoolInfo?.displayTokenA?.coin_type}/${apiPoolInfo?.displayTokenB?.coin_type}`)
    }
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
    if (poolAddress && poolAddress !== 'undefined') {
      const res = posBaseListGroupByPool[poolAddress.toLowerCase() || '']
      if (res && res?.list) {
        return res?.list.length > 0 ? res?.list.length : undefined
      }
      return undefined
    }
    return undefined
  }, [JSON.stringify(posBaseListGroupByPool), poolAddress])

  /**
   * 更新标签页列表中的仓位数量
   * Update position numbers in tab list
   */
  useEffect(() => {
    setTabList(
      defaultTabList?.map(tab => ({
        ...tab,
        num: tab.label === TabsEnum.positions && currentAccount?.address ? positionNum : undefined
        // num: tab.label === TabsEnum.positions && currentTab === 'positions' && !posBaseListLoading ? positionNum : undefined
      }))
    )
    // }, [positionNum, currentTab, posBaseListLoading])
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
    return poolFavoriteIds?.includes(poolAddress || '')
  }, [JSON.stringify(poolFavoriteIds), poolAddress])

  /**
   * 处理收藏/取消收藏
   * Handle favorite/unfavorite
   */
  const onChangeFavorites = (e: any) => {
    cancelBubble(e)
    if (poolAddress) {
      // 如果当前池子已经被收藏，则移除收藏
      isFavoritePool ? removeFavorites(poolAddress) : addFavorites(poolAddress)
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
    setSelectedTokenA(apiPoolInfo?.displayTokenA)
    setSelectedTokenB(apiPoolInfo?.displayTokenB)
  }, [apiPoolInfo?.displayTokenA?.coin_type, apiPoolInfo?.displayTokenB?.coin_type])

  /**
   * 确认创建池子
   * Confirm pool creation
   */
  const onConfirm = () => {
    setCurrentStep(2)
    // setPoolType('clmm')
    navigate(`/create-pool/${apiPoolInfo?.displayTokenA?.coin_type}/${apiPoolInfo?.displayTokenB?.coin_type}/${feeTier?.feeRate}?poolType=clmm`)
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

    if (apiPoolInfo?.miningRewardList) {
      apiPoolInfo?.miningRewardList?.forEach((item: any) => {
        list.push(extractStructTagFromType(item?.coinType).full_address)
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
  const { setApiPoolInfo, apiPoolInfoLoading, netError } = useLiquidityStore()
  const { setTotalAmountUSD } = useGetTvlInfo()

  /**
   * 切换代币
   * Switch tokens
   */
  const handleSelectToken = useCallback(
    async (token: Token, self_selected?: Token, other_selected?: Token, self_address?: string, other_address?: string, isDisplayA?: boolean) => {
      const key = Object.keys(TabsEnum).find(tab => tab === currentTab)
      const coinTypeList = [self_address, other_address].filter(Boolean)
      try {
        const tokenMap = await fetchTokenInfo<string[]>(coinTypeList as string[])
        if (other_selected?.coin_type || tokenMap?.get((other_address || '') as CoinType)?.coin_type) {
          if (
            extractStructTagFromType(token?.coin_type).full_address ===
            extractStructTagFromType(other_selected?.coin_type || tokenMap?.get(other_address || '')?.coin_type || '').full_address
          ) {
            setSelectedTokenA(selectedTokenB)
            setSelectedTokenB(selectedTokenA)
          } else if (
            extractStructTagFromType(token?.coin_type).full_address ===
            extractStructTagFromType(self_selected?.coin_type || tokenMap?.get(self_address || '')?.coin_type || '').full_address
          ) {
            return
          } else {
            if (isDisplayA) {
              navigate(`/clmm?tab=${key}&from=${token?.coin_type}&to=${other_selected?.coin_type || tokenMap?.get(other_address || '')?.coin_type}`)
            } else {
              navigate(`/clmm?tab=${key}&from=${other_selected?.coin_type || tokenMap?.get(other_address || '')?.coin_type}&to=${token?.coin_type}`)
            }
            setApiPoolInfo(null)
            setTotalAmountUSD('')
          }
        } else {
          if (isDisplayA) {
            navigate(`/clmm?tab=${key}&from=${token?.coin_type}`)
          } else {
            navigate(`/clmm?tab=${key}&to=${token?.coin_type}`)
          }
          setApiPoolInfo(null)
          setTotalAmountUSD('')
        }
      } catch (error) {
        console.error('🚀 ~ handleSelectToken ~ error:', error)
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
        loading: !token && apiPoolInfoLoading
      }
    },
    [netError, apiPoolInfoLoading]
  )

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
    feeTier,
    setFeeTier,
    refreshMarketPrice,
    onJump2Swap,
    handleSelectToken,
    getSelectTokenProps
  }
}

export default useLiquidityInteraction
