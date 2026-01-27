import { CoinDetail, CoinDexPoolItem, CoinHolderItem, CoinMarketData, CoinTradeItem, CoinTransactionBlockItem, ProCoinItem } from '@/types/pro'
import { getTradesAmountSymbol } from '@/utils/pro'
import { useGetToken } from '@cetus/hooks/src/useToken'
import {
  bnToAmount,
  d,
  formatCurrency,
  formatNumber,
  formatNumberWithDown,
  formatNumberWithKMB,
  formatPercentage,
  formatPrice,
  formatTimeDifference,
  formatUSDPrice,
  getTimeDifferenceAbbr,
  symbolDataDisplayProcessing
} from '@cetus/utils'
import dayjs from 'dayjs'
import { v4 } from 'uuid'

export default function useWrapProData() {
  const { getTokenInfo } = useGetToken()

  const wrapCoinDexPoolsData = (list: any[]): CoinDexPoolItem[] => {
    return list?.map((item: any) => {
      return {
        apr: `${formatNumberWithDown(item?.apr, 2)}%`,
        dex: item?.dex,
        coinList: item?.coinList,
        price: `$${formatNumberWithDown(item?.price, 6)}`,
        tvl: `$${formatNumberWithDown(item?.tvl)}`,
        link: item?.link
      }
    })
  }

  const wrapCoinDetailData = (data: any): CoinDetail => {
    return {
      coinType: data?.coinType,
      cratedTime: dayjs(data?.createdTime).format('MMM-DD-YYYY hh:mm:ss A'),
      creator: data?.creator,
      packageId: data?.packageID,
      decimals: data?.decimals,
      website: data?.website,
      totalSupply: data?.totalSupply,
      totalSupplyDisplay: formatNumberWithKMB(data?.totalSupply, 2, true),
      cirSupply: !Number(data?.circulating) ? data?.totalSupply : data?.circulating,
      cirSupplyDisplay: formatNumberWithKMB(!Number(data?.circulating) ? data?.totalSupply : data?.circulating, 2, true),
      verified: data?.verified,
      scamFlag: data?.scamFlag == 0,
      holders: data?.holders
    }
  }

  const wrapCoinTransactionBlocksData = (list: any[]): CoinTransactionBlockItem[] => {
    return list?.map((item: any) => {
      return {
        txDigest: item?.txDigest,
        payload: item?.payload ? item?.payload : 'TransferObjects',
        payloadPackage: item?.payload ? item?.payload?.split('::')?.[0] || '' : '',
        sender: item?.sender,
        txns: item?.txns,
        status: item?.status,
        timestamp: item?.timestamp,
        gas: bnToAmount(item?.gas, 9),
        // dexImages: item?.transactionLabels?.map((info: any) => info?.image)
        labels: item?.transactionLabels?.map((info: any) => {
          return {
            image: info?.image,
            name: info?.name
          }
        })
      }
    })
  }

  const wrapCoinMarketData = (data: any): CoinMarketData => {
    const market: any = {}
    for (const key in data?.market) {
      const info = data?.market?.[key]
      const isPositive = d(info?.priceChange).gt(0)
      const price24HChangePercentage = formatNumber(info?.priceChange, 4, true)
      market[key] = {
        txn: formatNumberWithKMB(info?.txn, 2, true),
        buys: info?.buys || '0',
        sells: info?.sells || '0',
        buysDisplay: formatNumberWithKMB(info?.buys, 2, true),
        sellsDisplay: formatNumberWithKMB(info?.sells, 2, true),
        buyVolume: info?.buyVolume || '0',
        sellVolume: info?.sellVolume || '0',
        buyVolumeDisplay: `$${formatNumberWithKMB(info?.buyVolume, 2, true)}`,
        sellVolumeDisplay: `$${formatNumberWithKMB(info?.sellVolume, 2, true)}`,
        buyers: info?.buyers || '0',
        sellers: info?.sellers || '0',
        buyersDisplay: formatNumberWithKMB(info?.buyers, 2, true),
        sellersDisplay: formatNumberWithKMB(info?.sellers, 2, true),
        // priceChange: (isPositive ? '+' : '') + symbolDataDisplayProcessing(price24HChangePercentage, '%'),
        priceChange: (isPositive ? '+' : '') + formatNumberWithKMB(price24HChangePercentage, 2) + '%',
        label: key?.toUpperCase(),
        markers: `${formatNumberWithKMB(info?.markers, 2, true)}`,
        volume: `$${formatNumberWithKMB(info?.volume, 2, true)}`
      }
    }
    return {
      liquidityInUsd: `$${formatNumberWithKMB(data?.liquidityInUsd, 2)}`,
      liquidity: data?.liquidityInUsd,
      market
    }
  }

  const wrapTopHolders = (list: any[]): CoinHolderItem[] => {
    console.log('🚀 ~ useWrapProData wrapTopHolders ~ list:', list)
    return list?.map((item: any) => {
      return {
        holder: item?.account,
        balance: item?.balance,
        balanceDisplay: formatNumberWithDown(item?.balance, 0),
        percentage: !item?.percentage
          ? '-'
          : `${Number(item?.percentage) ? formatPercentage(d(item?.percentage).mul(100).toString(), 4) : '<0.0001%'}`,
        name: item?.name,
        website: item?.website,
        image: item?.image
      }
    })
  }

  const wrapCoinTrades = (list: any[], isWsData?: boolean): CoinTradeItem[] => {
    return list?.map((item: any) => {
      return {
        type: item?.type,
        price: item?.price,
        coinChanges: item?.coinChanges?.map((info: any, index: number) => {
          return {
            amount: getTradesAmountSymbol(item?.type, info?.balance, index, info?.decimals),
            coinType: info?.coinType,
            symbol: info?.symbol,
            logo: info?.logo
          }
        }),
        dex: item?.dex,
        sender: item?.sender,
        txDigest: item?.txDigest,
        // usdValue: `${formatCurrency(item?.usdValue, 4)}`,
        usdValue: Number(item?.usdValue) ? `${formatCurrency(item?.usdValue, 2)}` : '<$0.01',
        // 虾米，海豚，巨鲸
        iconName: d(item?.usdValue).lt(1000) ? 'shrimp' : d(item?.usdValue).lt(10000) ? 'dolphin' : 'whale',
        timestamp: item?.timestamp,
        time: getTimeDifferenceAbbr(item?.timestamp),
        haveAnimation: false,
        isWsData: !!isWsData,
        id: v4()
      }
    })
  }

  const wrapBvTokenList = (list: any[]) => {
    const data = list?.map((item: any) => {
      const price24HChangePercentage = formatNumber(item?.priceChangePercentage24H, 2, true)
      return {
        coinType: item?.coinType,
        coin_type: item?.coinType,
        priceChange: `${d(price24HChangePercentage).gte(0) ? '+' : ''}${symbolDataDisplayProcessing(price24HChangePercentage, '%')}`,
        vol: '$' + formatNumberWithKMB(item?.volume24H),
        price: '$' + formatPrice(item?.price),
        logo_url: item?.iconUrl,
        symbol: item?.symbol,
        name: item?.name
      }
    })
    return data
  }

  // bv接口wrap
  // const wrapProCoinList = (list: any[]): ProCoinItem[] => {
  //   const data = list?.map((item: any) => {
  //     const price24HChangePercentage = formatNumber(item?.priceChangePercentage24H, 2, true)
  //     return {
  //       coinType: item?.coinType,
  //       coin_type: item?.coinType,
  //       priceChange: `${d(price24HChangePercentage).gte(0) ? '+' : ''}${symbolDataDisplayProcessing(price24HChangePercentage, '%')}`,
  //       volume: '$' + formatNumberWithKMB(item?.volume24H),
  //       price: '$' + formatPrice(item?.price),
  //       logo_url: item?.iconUrl,
  //       symbol: item?.symbol,
  //       name: item?.name,
  //       mc: formatNumberWithKMB(item?.marketCap, 2, true),
  //       fdv: `$${formatNumberWithKMB(d(item?.totalSupply)?.mul(item?.price).toString(), 2, true)}`,
  //       liquidity: item?.liquidity,
  //       holders: formatNumberWithKMB(item?.holders, 2, true),
  //       age: `${daysFromTimestamp(item?.createdTime)}d`,
  //       decimals: item?.decimals
  //     }
  //   })
  //   return data
  // }

  const wrapProCoinList = (list: any[], dateType = 'hour24'): ProCoinItem[] => {
    console.log('🚀 ~ wrapProCoinList ~ list:', list)
    const data = list?.map((item: any) => {
      if (item?.isWrapProCoinWithNoData) return item
      const marketData = item?.marketData?.[dateType]
      // const priceChangePercentage = formatNumber(marketData?.priceChange, 2, true)
      const priceChangePercentage = marketData?.priceChange
      const volume = marketData?.volume
      const buyVolume = marketData?.buyVolume
      const sellVolume = marketData?.sellVolume
      const audit = item?.audit
      const auditTotal = Object.keys(audit ?? {}).length
      let auditWarningNum = 0

      if (audit?.isHoneypot) auditWarningNum += 1
      if (audit?.mintAuthority !== 'Disable') auditWarningNum += 1
      if (audit?.top10Holder !== '--' && d(audit?.top10Holder).mul(100).gt(15)) auditWarningNum += 1

      return {
        coinType: item?.coinType,
        coin_type: item?.coinType,
        priceChange: `${d(priceChangePercentage).gte(0) ? '+' : ''}${symbolDataDisplayProcessing(priceChangePercentage, '%')}`,
        volume: '$' + formatNumberWithKMB(volume),
        vol: '$' + formatNumberWithKMB(volume),
        buyVolume: '$' + formatNumberWithKMB(buyVolume),
        sellVolume: '$' + formatNumberWithKMB(sellVolume),
        // price: '$' + formatPrice(item?.price),
        price: item?.price == '0' ? '-' : '$' + formatUSDPrice(item?.price),
        logo_url: item?.logoURI,
        symbol: item?.symbol,
        name: item?.name,
        mc: item?.marketCap !== '--' && d(item?.marketCap).gt(0) ? `$${formatNumberWithKMB(item?.marketCap, 2, true)}` : '--',
        fdv: item?.fdv !== '--' && d(item?.fdv).gt(0) ? `$${formatNumberWithKMB(item?.fdv, 2, true)}` : '--',
        liquidity: `$${formatNumberWithKMB(item?.liquidity, 2, true)}`,
        holders: formatNumberWithKMB(item?.holders, 2, true),
        age: formatTimeDifference(item?.age),
        decimals: item?.decimals,
        isHoneypot: audit?.isHoneypot,
        mintAuthority: audit?.mintAuthority,
        top10Holder: audit?.top10Holder == '--' ? '--' : d(audit?.top10Holder).mul(100).toString(),
        auditTotal,
        auditWarningNum,
        marketData: item?.marketData
      }
    })
    return data
  }

  const wrapProCoinMarketData = (rowData: any, dateType = 'hour24') => {
    if (rowData?.isWrapProCoinWithNoData) return rowData

    const marketData = rowData?.marketData?.[dateType]
    const priceChangePercentage = marketData?.priceChange
    const volume = marketData?.volume
    const buyVolume = marketData?.buyVolume
    const sellVolume = marketData?.sellVolume

    return {
      coinType: rowData?.coinType,
      coin_type: rowData?.coinType,
      priceChange: `${d(priceChangePercentage).gte(0) ? '+' : ''}${symbolDataDisplayProcessing(priceChangePercentage, '%')}`,
      volume: '$' + formatNumberWithKMB(volume),
      buyVolume: '$' + formatNumberWithKMB(buyVolume),
      sellVolume: '$' + formatNumberWithKMB(sellVolume)
    }
  }

  const wrapProCoinWithNoData = async (coinType?: string) => {
    const coinInfo = await getTokenInfo(coinType)
    // if coin not found on chain, return null
    if (!coinInfo) {
      return null
    }
    return {
      isWrapProCoinWithNoData: true,
      coinType,
      coin_type: coinType,
      priceChange: '--',
      volume: '--',
      vol: '--',
      buyVolume: '--',
      sellVolume: '--',
      price: '--',
      logo_url: coinInfo?.logo_url,
      symbol: coinInfo?.symbol,
      name: coinInfo?.name,
      mc: '--',
      fdv: '--',
      liquidity: '--',
      holders: '--',
      age: '--',
      decimals: coinInfo?.decimals,
      isHoneypot: '--',
      mintAuthority: '--',
      top10Holder: '--',
      auditTotal: '--',
      auditWarningNum: '--'
    }
  }

  const wrapProCoinListInModal = (list: any[], dateType = 'hour24') => {
    const data = list?.map((item: any) => {
      const marketData = item?.marketData?.[dateType]
      // const priceChangePercentage = formatNumber(marketData?.priceChange, 2, true)
      const priceChangePercentage = marketData?.priceChange
      const volume = marketData?.volume

      return {
        coinType: item?.coinType,
        coin_type: item?.coinType,
        priceChange: `${d(priceChangePercentage).gte(0) ? '+' : ''}${symbolDataDisplayProcessing(priceChangePercentage, '%')}`,
        vol: '$' + formatNumberWithKMB(volume),
        price: item?.price == '0' ? '-' : '$' + formatUSDPrice(item?.price),
        logo_url: item?.logoURI,
        symbol: item?.symbol,
        name: item?.name,
        mc: `$${formatNumberWithKMB(item?.marketCap, 2, true)}`,
        fdv: `$${formatNumberWithKMB(item?.fdv, 2, true)}`,
        liquidity: `$${formatNumberWithKMB(item?.liquidity, 2, true)}`,
        holders: formatNumberWithKMB(item?.holders, 2, true),
        age: formatTimeDifference(item?.age),
        decimals: item?.decimals
      }
    })
    return data
  }

  return {
    wrapCoinDexPoolsData,
    wrapCoinDetailData,
    wrapCoinTransactionBlocksData,
    wrapCoinMarketData,
    wrapTopHolders,
    wrapCoinTrades,
    wrapBvTokenList,
    wrapProCoinList,
    wrapProCoinWithNoData,
    wrapProCoinListInModal,
    wrapProCoinMarketData
  }
}
