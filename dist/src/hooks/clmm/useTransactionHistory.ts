import { TransactionsHistory } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { PageQuery } from '@cetusprotocol/common-sdk'

export type getTransactionsHistoryParams = {
  limit?: number
  offset?: number
  timestamp_ms?: string | number
  address?: string
}

function useTransactionHistory() {
  const clmmSdk = useSdk('clmm')
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
    const rpcUrls = ['https://rpc-mainnet.suiscan.xyz:443', 'https://cetus-mainnet-endpoint.blockvision.org']

    for (const rpcUrl of rpcUrls) {
      try {
        const res = await clmmSdk!.Pool.getPoolTransactionList({
          pool_id: poolId,
          pagination_args: paginationArgs,
          full_rpc_url: rpcUrl
        })
        console.log(res, `getTransactionsHistoryBySDK with ${rpcUrl}`)

        return res
      } catch (error) {
        console.error(error, `getTransactionsHistoryBySDK ~ error with ${rpcUrl}`)
      }
    }

    return undefined
  }

  return { getTransactionsHistory, getTransactionsHistoryBySDK }
}

export default useTransactionHistory
