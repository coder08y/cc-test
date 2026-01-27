import { Token } from '@cetus/types'
import { IS_ALL_POOLS, IS_INCENTIVIZED_ONLY, IS_WATCH_LIST, POOL_FAVORITE_LIST, POOL_SELECT_COIN_LIST, VariousTokensTable } from '@cetus/utils'
import { StateCreator, create } from 'zustand'

interface poolsState {
  poolListLength: string
  setPoolListLength: (data: string) => void
  poolRefreshStatus: string
  setPoolRefreshStatus: (data: string) => void
  isWatchList: boolean | undefined
  setIsWatchList: (isWatchList: boolean) => void
  isAllPools: boolean
  setIsAllPools: (isAllPools: boolean) => void
  isIncentivizedOnly: boolean
  setIsIncentivizedOnly: (isIncentivizedOnly: boolean) => void
  poolFavoriteIds: string[]
  setPoolFavoriteId: (id: string) => void
  setPoolFavoriteIds: (ids: string[]) => void
  poolFavoriteIdsChange: boolean
  setPoolFavoriteIdsChange: (data: boolean) => void
  showClmmPositionList: boolean
  setShowClmmPositionList: (data: boolean) => void
  showDlmmPositionList: boolean
  setShowDlmmPositionList: (data: boolean) => void
  selectCoinList: Token[]
  setSelectCoinList: (list: Token[]) => void

  // 是否展开所有持仓
  isExpandAllPosition: boolean
  setIsExpandAllPosition: (status: boolean) => void
  isExpendPositionMap: Record<string, boolean>
  setIsExpendPosition: (poolAddresses: string[], status: boolean) => void
  clearIsExpendPositionMap: () => void
  resetPoolFilterParams: () => void
  showFilterButton: boolean
  setShowFilterButton: (value: boolean) => void
}

const store: StateCreator<poolsState> = (set, get) => ({
  poolListLength: '',
  setPoolListLength: (data: string) => {
    set(() => ({
      poolListLength: data
    }))
  },
  poolRefreshStatus: 'pending', // 'pending'|'success'|'error'|'timeout' 请求池子列表时的状态
  setPoolRefreshStatus: (data: string) => {
    set(() => ({
      poolRefreshStatus: data
    }))
  },
  isWatchList: undefined,
  setIsWatchList: (isWatchList: boolean) => {
    set(() => ({
      isWatchList
    }))
    VariousTokensTable.setItem(IS_WATCH_LIST, isWatchList)
  },
  isAllPools: false,
  setIsAllPools: (isAllPools: boolean) => {
    set(() => ({
      isAllPools
    }))
    VariousTokensTable.setItem(IS_ALL_POOLS, isAllPools)
  },

  isIncentivizedOnly: false,
  setIsIncentivizedOnly: (isIncentivizedOnly: boolean) => {
    set(() => ({
      isIncentivizedOnly
    }))
    VariousTokensTable.setItem(IS_INCENTIVIZED_ONLY, isIncentivizedOnly)
  },

  poolFavoriteIds: [],
  setPoolFavoriteId: (id: string) => {
    const newPoolFavoriteIds = [...get().poolFavoriteIds, id]
    set(() => ({
      poolFavoriteIds: newPoolFavoriteIds
    }))
    VariousTokensTable.setItem(POOL_FAVORITE_LIST, newPoolFavoriteIds)
  },
  setPoolFavoriteIds: (ids: string[]) => {
    set(() => ({
      poolFavoriteIds: ids
    }))
    VariousTokensTable.setItem(POOL_FAVORITE_LIST, ids)
  },
  poolFavoriteIdsChange: false,
  setPoolFavoriteIdsChange: (data: boolean) => {
    set(() => ({
      poolFavoriteIdsChange: data
    }))
  },

  showClmmPositionList: true,
  setShowClmmPositionList: (value: boolean) => {
    set(() => ({
      showClmmPositionList: value
    }))
  },
  showDlmmPositionList: true,
  setShowDlmmPositionList: (value: boolean) => {
    set(() => ({
      showDlmmPositionList: value
    }))
  },
  selectCoinList: [],
  setSelectCoinList: (selectCoinList: Token[]) => {
    set(() => ({
      selectCoinList
    }))
    VariousTokensTable.setItem(POOL_SELECT_COIN_LIST, selectCoinList)
  },

  // toDo: 只是store里加了，等后面对接api数据后再根据filter情况设置

  isExpandAllPosition: false,
  setIsExpandAllPosition: (status: boolean) => {
    set(() => ({
      isExpandAllPosition: status
    }))
  },
  isExpendPositionMap: {},
  setIsExpendPosition: (poolAddresses: string[], status: boolean) => {
    set(() => {
      const currentMap = get().isExpendPositionMap
      const newMap = { ...currentMap }
      poolAddresses.forEach(address => {
        newMap[address] = status
      })
      return {
        isExpendPositionMap: newMap
      }
    })
  },
  clearIsExpendPositionMap: () => {
    set(() => ({
      isExpendPositionMap: {}
    }))
  },
  resetPoolFilterParams: () => {
    set(() => ({
      isWatchList: undefined,
      isAllPools: false,
      isIncentivizedOnly: false
    }))
  },
  showFilterButton: true,
  setShowFilterButton: (value: boolean) => {
    set(() => ({
      showFilterButton: value
    }))
  }
})

const usePoolsStore = create(store)
export default usePoolsStore

// 从 localForage 加载数据
VariousTokensTable.getItem<any>(POOL_FAVORITE_LIST).then(savedPoolFavoriteList => {
  // console.log('🚀 ~ file: store/pool/index.ts.ts ~ savedPoolFavoriteList:', savedPoolFavoriteList)
  if (savedPoolFavoriteList?.length > 0) {
    usePoolsStore.getState().setPoolFavoriteIds(savedPoolFavoriteList)
  }
})

// 从 localForage 加载数据
VariousTokensTable.getItem<any>(IS_WATCH_LIST).then(isWatchList => {
  // console.log('🚀 ~ VariousTokensTable isWatchList:', isWatchList)
  if (typeof isWatchList === 'boolean') {
    usePoolsStore.getState().setIsWatchList(isWatchList)
  } else {
    usePoolsStore.getState().setIsWatchList(false)
  }
})

// 从 localForage 加载数据
VariousTokensTable.getItem<any>(IS_ALL_POOLS).then(isAllPools => {
  // console.log('🚀 ~ VariousTokensTable isAllPools:', isAllPools)
  if (typeof isAllPools === 'boolean') {
    usePoolsStore.getState().setIsAllPools(isAllPools)
  }
})

// 从 localForage 加载数据
VariousTokensTable.getItem<any>(IS_INCENTIVIZED_ONLY).then(isIncentivizedOnly => {
  // console.log('🚀 ~ VariousTokensTable isIncentivizedOnly:', isIncentivizedOnly)
  if (typeof isIncentivizedOnly === 'boolean') {
    usePoolsStore.getState().setIsIncentivizedOnly(isIncentivizedOnly)
  }
})

// 从 localForage 加载数据
VariousTokensTable.getItem<any>(POOL_SELECT_COIN_LIST).then(poolSelectCoinList => {
  // console.log('🚀 ~ VariousTokensTable poolSelectCoinList:', poolSelectCoinList)
  if (poolSelectCoinList && poolSelectCoinList.length > 0) {
    usePoolsStore.getState().setSelectCoinList(poolSelectCoinList)
  }
})
