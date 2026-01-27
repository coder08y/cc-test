import { AllTransactionTxPath, TransactionTxPath } from '@/apis/path'
import { bnAmountNumericAbbreviation } from '@/utils/api-data-utils'
import { useFetch } from '@cetus/hooks'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { getTimeDifferenceString } from '@cetus/utils'

export type GetTransactionsTxParams = {
  coin: string
  tx_type?: 'all' | 'swap' | 'add' | 'remove'
  offset?: number
  limit?: number
}
export default function useTransactionsTx() {
  const { fetchByApi } = useFetch()

  const getClmmTransactionsTx = async (params: GetTransactionsTxParams) => {
    console.log('🚀🚀🚀 ~ useTransactionsTx.ts:16 ~ getTransactionsTx ~ params:', params)
    const wrapParams = {
      tx_type: params.tx_type,
      offset: params.offset,
      limit: params.limit
    }
    const res = await fetchByApi(TransactionTxPath, 'GET', params)
    console.log('🚀 ~ file: useTransactionsTx.ts:14 ~ getTransactionsTx ~ res:', res)

    if (res?.tx_list) {
      const txData = res?.tx_list?.map((item: any) => {
        const decimalsA = item?.coinA?.decimal
        const decimalsB = item?.coinB?.decimal
        const a2b = item?.tx_type === 'swap' ? item?.a2b : true
        return {
          tokenA: a2b ? item?.coinA : item?.coinB,
          tokenB: a2b ? item?.coinB : item?.coinA,
          account: item?.account, // UI层可用addressAbridge处理
          tokenAmountA: a2b ? item?.coinA?.amount : item?.coinB.amount, // UI层展示处理精度后可用bnAmountNumericAbbreviation处理
          tokenAmountB: a2b ? item?.coinB.amount : item?.coinA.amount, // UI层展示处理精度后可用bnAmountNumericAbbreviation处理
          displayTokenAmountA: a2b
            ? bnAmountNumericAbbreviation(item?.coinA?.amount, decimalsA)
            : bnAmountNumericAbbreviation(item?.coinB?.amount, decimalsB),
          displayTokenAmountB: a2b
            ? bnAmountNumericAbbreviation(item?.coinB?.amount, decimalsB)
            : bnAmountNumericAbbreviation(item?.coinA?.amount, decimalsA),
          txType: item?.txType,
          tx: item?.tx,
          event_seq: item?.event_seq,
          uniq_id: item?.uniq_id,
          timeDisplay: getTimeDifferenceString(item?.timestamp * 1000)
        }
      })

      return {
        data: txData,
        total: res?.total
      }
    }

    return null
  }

  const getAllTransactionsTx = async (params: GetTransactionsTxParams) => {
    console.log('🚀🚀🚀 ~ useTransactionsTx.ts:16 ~ getTransactionsTx ~ params:', params)
    const wrapParams = {
      tx_type: params.tx_type,
      offset: params.offset,
      limit: params.limit
    }
    const res = await fetchByApi(AllTransactionTxPath, 'GET', params)
    console.log('🚀 ~ file: useTransactionsTx.ts:14 ~ getTransactionsTx ~ res:', res)

    if (res?.tx_list) {
      const txData = res?.tx_list?.map((item: any) => {
        const decimalsA = item?.coinA?.decimal
        const decimalsB = item?.coinB?.decimal
        const a2b = item?.tx_type === 'swap' ? item?.a2b : true
        const tokenA =
          item?.coinA?.coin_type === '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
            ? { ...item?.coinA, icon_url: envConfigs.sui_coin?.logo_url }
            : item?.coinA
        const tokenB =
          item?.coinB?.coin_type === '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
            ? { ...item?.coinB, icon_url: envConfigs.sui_coin?.logo_url }
            : item?.coinB
        return {
          tokenA: a2b ? tokenA : tokenB,
          tokenB: a2b ? tokenB : tokenA,
          account: item?.account, // UI层可用addressAbridge处理
          tokenAmountA: a2b ? item?.coinA?.amount : item?.coinB.amount, // UI层展示处理精度后可用bnAmountNumericAbbreviation处理
          tokenAmountB: a2b ? item?.coinB.amount : item?.coinA.amount, // UI层展示处理精度后可用bnAmountNumericAbbreviation处理
          displayTokenAmountA: a2b
            ? bnAmountNumericAbbreviation(item?.coinA?.amount, decimalsA)
            : bnAmountNumericAbbreviation(item?.coinB?.amount, decimalsB),
          displayTokenAmountB: a2b
            ? bnAmountNumericAbbreviation(item?.coinB?.amount, decimalsB)
            : bnAmountNumericAbbreviation(item?.coinA?.amount, decimalsA),
          txType: item?.txType,
          tx: item?.tx,
          event_seq: item?.event_seq,
          uniq_id: item?.uniq_id,
          timeDisplay: getTimeDifferenceString(item?.timestamp * 1000)
        }
      })

      return {
        data: txData,
        total: res?.total
      }
    }

    return null
  }

  return {
    getClmmTransactionsTx,
    getAllTransactionsTx
  }
}
