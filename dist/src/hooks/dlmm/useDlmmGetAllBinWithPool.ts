import { formatBinPriceFromLamport } from '@/utils/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { BinAmount, GetPoolBinInfoOption } from '@cetusprotocol/dlmm-sdk'

export default function useDlmmGetAllBinWithPool() {
  const dlmmSdk = useSdk('dlmm')
  // 从合约拿到所有bin信息r
  const getBinsInfoByPool = async (option: GetPoolBinInfoOption, baseDecimal: number, quoteDecimal: number) => {
    const res = await dlmmSdk!.Pool.getPoolBinInfo(option)
    console.log('getBinsInfoByPool res', res)
    const allBinObj = Object.fromEntries(
      res?.map((item: BinAmount) => [
        String(item.bin_id),
        {
          ...item,
          price: formatBinPriceFromLamport(item.price_per_lamport, baseDecimal, quoteDecimal)
        }
      ])
    )
    // setPoolAllBinObj(allBinObj as Record<string, ChartBinItem>)
    return {
      allBinObj,
      binList: [...res]
    }
  }

  return {
    getBinsInfoByPool
  }
}
