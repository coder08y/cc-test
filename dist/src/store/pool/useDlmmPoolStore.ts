import { DlmmApiPoolGroupItem } from '@/types/dlmm'
import { Token } from '@cetus/types'
import {
  DLMM_POOL_FAVORITE_LIST,
  DLMM_POOL_SELECT_COIN_LIST,
  IS_DLMM_ALL_POOLS,
  IS_DLMM_INCENTIVIZED_ONLY,
  IS_DLMM_WATCH_LIST,
  VariousTokensTable
} from '@cetus/utils'
import { StateCreator, create } from 'zustand'

interface poolsState {
  dlmmPoolRefreshStatus: string
  setDlmmPoolRefreshStatus: (data: string) => void
  isDlmmWatchList: boolean | undefined
  setIsDlmmWatchList: (isDlmmWatchList: boolean) => void
  isDlmmAllPools: boolean
  setIsDlmmAllPools: (isDlmmAllPools: boolean) => void
  isDlmmIncentivizedOnly: boolean
  setIsDlmmIncentivizedOnly: (isDlmmIncentivizedOnly: boolean) => void
  dlmmPoolFavoriteIds: string[]
  setDlmmPoolFavoriteId: (id: string) => void
  setDlmmPoolFavoriteIds: (ids: string[]) => void
  dlmmPoolFavoriteIdsChange: boolean
  setDlmmPoolFavoriteIdsChange: (data: boolean) => void
  dlmmSelectCoinList: Token[]
  setDlmmSelectCoinList: (list: Token[]) => void
  dlmmPoolList: DlmmApiPoolGroupItem[]
  setDlmmPoolList: (list: DlmmApiPoolGroupItem[]) => void
  dlmmPoolListLength: string
  setDlmmPoolListLength: (data: string) => void
  dlmmPoolListIsLoading: boolean
  setDlmmPoolListIsLoading: (data: boolean) => void
  tutorialOpen: boolean
  setTutorialOpen: (value: boolean) => void
  resetPoolFilterParams: () => void
}

const store: StateCreator<poolsState> = (set, get) => ({
  dlmmPoolRefreshStatus: 'pending', // 'pending'|'success'|'error'|'timeout' 请求池子列表时的状态
  setDlmmPoolRefreshStatus: (data: string) => {
    set(() => ({
      dlmmPoolRefreshStatus: data
    }))
  },
  isDlmmWatchList: undefined,
  setIsDlmmWatchList: (isDlmmWatchList: boolean) => {
    set(() => ({
      isDlmmWatchList
    }))
    VariousTokensTable.setItem(IS_DLMM_WATCH_LIST, isDlmmWatchList)
  },
  isDlmmAllPools: false,
  setIsDlmmAllPools: (isDlmmAllPools: boolean) => {
    set(() => ({
      isDlmmAllPools
    }))
    VariousTokensTable.setItem(IS_DLMM_ALL_POOLS, isDlmmAllPools)
  },
  isDlmmIncentivizedOnly: false,
  setIsDlmmIncentivizedOnly: (isDlmmIncentivizedOnly: boolean) => {
    set(() => ({
      isDlmmIncentivizedOnly
    }))
    VariousTokensTable.setItem(IS_DLMM_INCENTIVIZED_ONLY, isDlmmIncentivizedOnly)
  },
  dlmmPoolFavoriteIds: [],
  setDlmmPoolFavoriteId: (id: string) => {
    const newPoolFavoriteIds = [...get().dlmmPoolFavoriteIds, id]
    set(() => ({
      dlmmPoolFavoriteIds: newPoolFavoriteIds
    }))
    VariousTokensTable.setItem(DLMM_POOL_FAVORITE_LIST, newPoolFavoriteIds)
  },
  setDlmmPoolFavoriteIds: (ids: string[]) => {
    set(() => ({
      dlmmPoolFavoriteIds: ids
    }))
    VariousTokensTable.setItem(DLMM_POOL_FAVORITE_LIST, ids)
  },
  dlmmPoolFavoriteIdsChange: false,
  setDlmmPoolFavoriteIdsChange: (data: boolean) => {
    set(() => ({
      dlmmPoolFavoriteIdsChange: data
    }))
  },
  dlmmPoolListIsLoading: true,
  setDlmmPoolListIsLoading: (value: boolean) => {
    set(() => ({
      dlmmPoolListIsLoading: value
    }))
  },
  dlmmSelectCoinList: [],
  setDlmmSelectCoinList: (dlmmSelectCoinList: Token[]) => {
    set(() => ({
      dlmmSelectCoinList
    }))
    VariousTokensTable.setItem(DLMM_POOL_SELECT_COIN_LIST, dlmmSelectCoinList)
  },
  // toDo: 只是store里加了，等后面对接api数据后再根据filter情况设置
  dlmmPoolList: [],
  setDlmmPoolList: (list: DlmmApiPoolGroupItem[]) => {
    set(() => ({
      dlmmPoolList: list
    }))
  },
  dlmmPoolListLength: '',
  setDlmmPoolListLength: (value: string) => {
    set(() => ({
      dlmmPoolListLength: value
    }))
  },
  tutorialOpen: false,
  setTutorialOpen: (value: boolean) => {
    set(() => ({
      tutorialOpen: value
    }))
  },
  resetPoolFilterParams: () => {
    set(() => ({
      isDlmmWatchList: undefined,
      isDlmmAllPools: false,
      isDlmmIncentivizedOnly: false
    }))
  }
})

const useDlmmPoolsStore = create(store)
export default useDlmmPoolsStore

VariousTokensTable.getItem<any>(DLMM_POOL_FAVORITE_LIST).then(savedPoolFavoriteList => {
  console.log('🚀 ~ file: store/pool/index.ts.ts ~ savedPoolFavoriteList:', savedPoolFavoriteList)
  if (savedPoolFavoriteList?.length > 0) {
    useDlmmPoolsStore.getState().setDlmmPoolFavoriteIds(savedPoolFavoriteList?.filter(Boolean))
  }
})

VariousTokensTable.getItem<any>(IS_DLMM_WATCH_LIST).then(isWatchList => {
  console.log('🚀 ~ VariousTokensTable isWatchList:', isWatchList)
  if (typeof isWatchList === 'boolean') {
    useDlmmPoolsStore.getState().setIsDlmmWatchList(isWatchList)
  } else {
    useDlmmPoolsStore.getState().setIsDlmmWatchList(false)
  }
})

VariousTokensTable.getItem<any>(IS_DLMM_ALL_POOLS).then(isAllPools => {
  console.log('🚀 ~ VariousTokensTable isAllPools:', isAllPools)
  if (typeof isAllPools === 'boolean') {
    useDlmmPoolsStore.getState().setIsDlmmAllPools(isAllPools)
  }
})

VariousTokensTable.getItem<any>(IS_DLMM_INCENTIVIZED_ONLY).then(isIncentivizedOnly => {
  console.log('🚀 ~ VariousTokensTable isIncentivizedOnly:', isIncentivizedOnly)
  if (typeof isIncentivizedOnly === 'boolean') {
    useDlmmPoolsStore.getState().setIsDlmmIncentivizedOnly(isIncentivizedOnly)
  }
})
// 从 localForage 加载数据
VariousTokensTable.getItem<any>(DLMM_POOL_SELECT_COIN_LIST).then(dlmmPoolSelectCoinList => {
  console.log('🚀 ~ VariousTokensTable poolSelectCoinList:', dlmmPoolSelectCoinList)
  if (dlmmPoolSelectCoinList && dlmmPoolSelectCoinList.length > 0) {
    useDlmmPoolsStore.getState().setDlmmSelectCoinList(dlmmPoolSelectCoinList)
  }
})
