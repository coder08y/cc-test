import { d } from '@cetusprotocol/common-sdk'
import { PeriodInfo, VaultVestNFT } from '@cetusprotocol/vaults-sdk'

export function mapVaultListToObject(vaultPoolsList: any[]) {
  return vaultPoolsList.reduce((acc: Record<string, any>, curr: any) => {
    acc[curr.vaultId] = curr
    return acc
  }, {})
}

export function wrapPeriodInfos(periodInfos: PeriodInfo[]) {
  console.log('🚀🚀🚀 ~ wrapVaultVestList.ts:12 ~ wrapPeriodInfos ~ periodInfos:', periodInfos)
  return periodInfos.map(itemPeriod => {
    return {
      period: itemPeriod.period,
      amount: itemPeriod.cetus_amount,
      isRedeemed: itemPeriod.is_redeemed
    }
  })
}

export async function wrapVaultVestList(nftList: VaultVestNFT[], vaultListObj: Record<string, any>) {
  return nftList.map(nftItem => {
    console.log('🚀🚀🚀 ~ wrapVaultVestList.ts:22 ~ wrapVaultVestList ~ nftItem:', nftItem)
    console.log('🚀🚀🚀 ~ wrapVaultVestList.ts:22 ~ wrapVaultVestList ~ vaultListObj:', vaultListObj)
    const vaultInfo = vaultListObj[nftItem.vault_id]
    const { isReverse, tokenA, tokenB } = vaultInfo

    const impairedA = d(nftItem.impaired_a)
      .div(10 ** tokenA.decimals)
      .toString()
    const impairedB = d(nftItem.impaired_b)
      .div(10 ** tokenB.decimals)
      .toString()

    return {
      ...vaultInfo,
      id: nftItem.id,
      index: nftItem.index,
      lpAmount: nftItem.lp_amount,
      redeemedAmount: nftItem.redeemed_amount,
      displayImpairedA: isReverse ? impairedB : impairedA,
      displayImpairedB: isReverse ? impairedA : impairedB,
      vestData: {
        ...nftItem,
        periodInfos: wrapPeriodInfos(nftItem.period_infos)
      }
    }
  })
}
