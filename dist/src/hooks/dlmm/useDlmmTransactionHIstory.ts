import { TransactionsHistory } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { APP_ENV } from '@cetus/types'
import { PageQuery } from '@cetusprotocol/common-sdk'

export type getTransactionsHistoryParams = {
  limit?: number
  offset?: number
  timestamp_ms?: string | number
  address?: string
}

function useDlmmTransactionHistory() {
  const dlmmSdk = useSdk('dlmm')
  const { fetchByApi } = useFetch()

  const getTransactionsHistory = async (params: getTransactionsHistoryParams) => {
    try {
      const res = await fetchByApi(TransactionsHistory, 'GET', params)
      console.log(res, 'getTransactionsHistory')
      if (res) {
        return res
      } else {
        throw new Error('no data')
      }
    } catch (error) {
      console.error(error, 'getTransactionsHistory ~ error')
    }
  }

  const getTransactionsHistoryBySDK = async (poolId: string, paginationArgs: PageQuery) => {
    try {
      const res = await dlmmSdk?.Pool?.getPoolTransactionList({
        pool_id: poolId,
        pagination_args: paginationArgs,
        full_rpc_url: APP_ENV === 'testnet' ? 'https://rpc-testnet.suiscan.xyz:443' : 'https://rpc-mainnet.suiscan.xyz:443'
      })
      console.log(res, 'getTransactionsHistoryBySDK')
      if (res) {
        return res
      } else {
        throw new Error('no data')
      }
    } catch (error) {
      console.error(error, 'getTransactionsHistoryBySDK ~ error')
    }

    return undefined
  }

  return { getTransactionsHistory, getTransactionsHistoryBySDK }
}

export default useDlmmTransactionHistory
