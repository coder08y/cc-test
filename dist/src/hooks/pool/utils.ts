import { GetPoolListApiParamsV2, GetPoolListParams } from './type'

export const wrapGetPoolParams = (params: GetPoolListParams) => {
  const wrapParams: GetPoolListApiParamsV2 = {
    filter: 'verified',
    sortBy: 'vol',
    sortOrder: 'asc',
    limit: 20,
    offset: 0,
    coinTypes: []
  }
  const { display_all_pools, has_mining, has_farming, no_incentives, order_by, limit, offset, coin_type, pools, pool } = params
  if (has_farming) {
    wrapParams.filter = 'farming'
  }
  if (display_all_pools) {
    wrapParams.filter = 'all'
  }
  if (!display_all_pools && has_mining && has_farming && !no_incentives) {
    wrapParams.filter = 'incentivized'
  }
  if (!display_all_pools && has_mining && has_farming && no_incentives) {
    wrapParams.filter = 'verified'
  }
  if (display_all_pools && has_mining && has_farming && !no_incentives) {
    wrapParams.filter = 'incentivized'
  }
  if (order_by) {
    const orderBy = order_by.replace('-', '').toLowerCase()
    wrapParams.sortBy = orderBy == 'fees' ? 'fee' : orderBy == 'totalapr' ? 'totalApr' : orderBy
  }
  if (order_by && order_by?.indexOf('-') > -1) {
    wrapParams.sortOrder = 'desc'
  }
  if (limit) {
    wrapParams.limit = limit
  }
  if (offset) {
    wrapParams.offset = offset
  }
  if (coin_type) {
    wrapParams.coinTypes = coin_type.split(',')
  }
  if (pools) {
    wrapParams['pools'] = pools
  }

  if (pool) {
    wrapParams['pools'] = [pool]
  }

  return wrapParams
}

export const wrapGetDlmmPoolParams = (params: GetPoolListParams) => {
  const wrapParams: GetPoolListApiParamsV2 = {
    filter: 'verified',
    sortBy: 'vol',
    sortOrder: 'asc',
    limit: 20,
    offset: 0,
    coinTypes: []
  }
  const { display_all_pools, has_mining, has_farming, no_incentives, order_by, limit, offset, coin_type, pools, pool } = params
  if (has_farming) {
    wrapParams.filter = 'farming'
  }
  if (display_all_pools) {
    wrapParams.filter = 'all'
  }
  if (!display_all_pools && has_mining && has_farming && !no_incentives) {
    wrapParams.filter = 'incentivized'
  }
  if (!display_all_pools && has_mining && has_farming && no_incentives) {
    wrapParams.filter = 'verified'
  }
  if (display_all_pools && has_mining && has_farming && !no_incentives) {
    wrapParams.filter = 'incentivized'
  }
  if (order_by) {
    const orderBy = order_by.replace('-', '').toLowerCase()
    wrapParams.sortBy = orderBy == 'fees' ? 'fee' : orderBy == 'totalapr' ? 'totalApr' : orderBy
  }
  if (order_by && order_by?.indexOf('-') > -1) {
    wrapParams.sortOrder = 'desc'
  }
  if (limit) {
    wrapParams.limit = limit
  }
  if (offset) {
    wrapParams.offset = offset
  }
  if (coin_type) {
    wrapParams.coinTypes = coin_type.split(',')
    wrapParams.limit = 20
    wrapParams.offset = offset
    // wrapParams.filter = 'all'
  }
  if (pools) {
    wrapParams['pools'] = pools
  }

  if (pool) {
    wrapParams['pools'] = [pool]
  }

  return wrapParams
}
