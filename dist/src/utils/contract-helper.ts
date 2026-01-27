import { asIntN } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'

export const deleteOx = (address: string) => {
  if (address.startsWith('0x')) {
    return address.slice(2)
  }
  return address
}

export function getTickDataFromUrlData(ticks: any) {
  const tickdatas: any[] = []
  for (const tick of ticks) {
    const item = {
      objectId: tick?.objectId || tick?.object_id,
      index: tick?.index,
      sqrtPrice: tick?.sqrtPrice || tick?.sqrt_price,
      liquidityNet: tick?.liquidityNet || tick?.liquidity_net,
      liquidityGross: tick?.liquidityGross || tick?.liquidity_gross,
      feeGrowthOutsideA: tick?.feeGrowthOutsideA || tick?.fee_growth_outside_a,
      feeGrowthOutsideB: tick?.feeGrowthOutsideB || tick?.fee_growth_outside_b,
      rewardersGrowthOutside: tick?.rewardersGrowthOutside || tick?.rewarders_growth_outside
    }
    const td: any = {
      objectId: item.objectId,
      index: Number(asIntN(BigInt(item.index)).toString()),
      sqrtPrice: item.sqrtPrice,
      liquidityNet: new BN(BigInt.asIntN(128, BigInt(BigInt(item.liquidityNet.toString()))).toString()),
      liquidityGross: item.liquidityGross,
      feeGrowthOutsideA: item.feeGrowthOutsideA,
      feeGrowthOutsideB: item.feeGrowthOutsideB,
      rewardersGrowthOutside: [new BN(item.rewardersGrowthOutside[0]), new BN(item.rewardersGrowthOutside[1]), new BN(item.rewardersGrowthOutside[2])]
    }
    tickdatas.push(td)
  }
  return tickdatas
}
