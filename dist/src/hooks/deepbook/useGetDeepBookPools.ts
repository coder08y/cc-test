import { DeepBookPoolInfoPath, DeepBookPoolsPath } from '@/apis/path'
import useDeepBookStore from '@/store/deepbook'
import { useFetch } from '@cetus/hooks'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { d, formatNumber, formatPercentage } from '@cetus/utils'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
const abandonedPools = [
  '0xde096bb2c59538a25c89229127fe0bc8b63ecdbe52a3693099cc40a1d8a2cfd4',
  '0xe9aecf5859310f8b596fbe8488222a7fb15a55003455c9f42d1b60fab9cca9ba',
  '0xc69f7755fec146583e276a104bcf91e0c9f0cab91dcdb1c202e8d76a5a5a1101',
  '0x52f9bf16d9e7eff79da73d5e3dea39fe1ef8c77684bf4ec2c6566b41396404d0'
]

export const testnetCoins = {
  DEEP: {
    address: `0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8`,
    type: `0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP`,
    scalar: 1000000,
    feed: '0x99137a18354efa7fb6840889d059fdb04c46a6ce21be97ab60d9ad93e91ac758', // DEEP uses HFT feed on testnet
    currencyId: '0xbf1b77e244f649c736a44898585cc8ac939fbb0bbdf1d8d2a183978cc312e613',
    priceInfoObjectId: '0x3d52fffa2cd9e54b39bb36d282bdda560b15b8b4fdf4766a3c58499ef172bafc',
    // coin info
    coin_type: '0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP',
    id: '0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8',
    name: 'DeepBook Token',
    symbol: 'DEEP',
    description: 'The DEEP token secures the DeepBook protocol, the premier wholesale liquidity venue for on-chain trading.',
    icon_url: 'https://images.deepbook.tech/icon.svg',
    decimals: 6,
    max_utilization_rate: 0.9,
    min_borrow: 0.1,
    coinType: '0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP',
    supply_cap: 1000000
  },
  SUI: {
    address: `0x0000000000000000000000000000000000000000000000000000000000000002`,
    type: `0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI`,
    scalar: 1000000000,
    feed: '0x50c67b3fd225db8912a424dd4baed60ffdde625ed2feaaf283724f9608fea266',
    currencyId: '0xf256d3fb6a50eaa748d94335b34f2982fbc3b63ceec78cafaa29ebc9ebaf2bbc',
    priceInfoObjectId: '0x1ebb295c789cc42b3b2a1606482cd1c7124076a0f5676718501fda8c7fd075a0',
    // coin info
    coin_type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    id: '0x0000000000000000000000000000000000000000000000000000000000000002',
    name: 'Sui',
    symbol: 'SUI',
    description: '',
    icon_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
    decimals: 9,
    max_utilization_rate: 0.9,
    min_borrow: 0.1,
    coinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    supply_cap: 1000000
  },
  DBUSDC: {
    address: `0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7`,
    type: `0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::DBUSDC::DBUSDC`,
    scalar: 1000000,
    feed: '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    currencyId: '0x509db0f9283c9ee4fdc5b99028a439d3639f49e9709e3d7a6de14b3bfdb0c784',
    priceInfoObjectId: '0x9c4dd4008297ffa5e480684b8100ec21cc934405ed9a25d4e4d7b6259aad9c81',
    // coin info
    coin_type: '0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::DBUSDC::DBUSDC',
    coinType: '0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::DBUSDC::DBUSDC',
    id: '0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7',
    name: 'DBUSDC',
    symbol: 'DBUSDC',
    description: '',
    icon_url: 'https://archive.cetus.zone/assets/image/sui/dbusdc.png',
    decimals: 6,
    max_utilization_rate: 0.95,
    min_borrow: 0.1,
    supply_cap: 1000000
  },
  DBTC: {
    address: `0x6502dae813dbe5e42643c119a6450a518481f03063febc7e20238e43b6ea9e86`,
    type: `0x6502dae813dbe5e42643c119a6450a518481f03063febc7e20238e43b6ea9e86::dbtc::DBTC`,
    scalar: 100000000,
    feed: '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
    currencyId: '0x3ef2afa2126704bf721b9c8495d94288f6bd090fc454fe3e1613eb765a8a348f',
    priceInfoObjectId: '0x72431a238277695d3f31e4425225a4462674ee6cceeea9d66447b210755fffba',
    // coin info
    coin_type: '0x6502dae813dbe5e42643c119a6450a518481f03063febc7e20238e43b6ea9e86::dbtc::DBTC',
    id: '0x6502dae813dbe5e42643c119a6450a518481f03063febc7e20238e43b6ea9e86',
    name: 'DBTC',
    symbol: 'DBTC',
    description: '',
    icon_url: 'https://archive.cetus.zone/assets/image/sui/dbtc.png',
    decimals: 8
  },
  DBUSDT: {
    address: `0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7`,
    type: `0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::DBUSDT::DBUSDT`,
    scalar: 1000000,
    // coin info
    coin_type: '0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::DBUSDT::DBUSDT',
    id: '0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7',
    name: 'DBUSDT',
    symbol: 'DBUSDT',
    description: '',
    icon_url: 'https://archive.cetus.zone/assets/image/sui/dbusdt.png',
    decimals: 6
  },
  WAL: {
    address: `0x9ef7676a9f81937a52ae4b2af8d511a28a0b080477c0c2db40b0ab8882240d76`,
    type: `0x9ef7676a9f81937a52ae4b2af8d511a28a0b080477c0c2db40b0ab8882240d76::wal::WAL`,
    scalar: 1000000000,
    // coin info
    coin_type: '0x9ef7676a9f81937a52ae4b2af8d511a28a0b080477c0c2db40b0ab8882240d76::wal::WAL',
    id: '0x9ef7676a9f81937a52ae4b2af8d511a28a0b080477c0c2db40b0ab8882240d76',
    name: 'WAL',
    symbol: 'WAL',
    description: '',
    icon_url: 'https://archive.cetus.zone/assets/image/sui/wal.png',
    decimals: 9
  }
}

export const testnetPools = [
  {
    address: '0xe86b991f8632217505fd859445f9803967ac84a9d4a1219065bf191fcb74b622',
    base_asset: testnetCoins.DEEP,
    quote_asset: testnetCoins.DBUSDC,
    baseCoin: testnetCoins.DEEP,
    quoteCoin: testnetCoins.DBUSDC,
    base_margin: '0x610640613f21d9e688d6f8103d17df22315c32e0c80590ce64951a1991378b55',
    quote_margin: '0xf08568da93834e1ee04f09902ac7b1e78d3fdf113ab4d2106c7265e95318b14d',
    min_withdraw_risk_ratio: 2 * 1000000000,
    min_borrow_risk_ratio: 1.25 * 1000000000,
    liquidation_risk_ratio: 1.1 * 1000000000,
    target_liquidation_risk_ratio: 1.25 * 1000000000,
    user_liquidation_reward: 20000000,
    pool_liquidation_reward: 30000000,
    whitelisted_pool: true,
    tick_size: '1000000',
    lot_size: '1000000',
    min_size: '10000000',
    taker_fee_rate: '0',
    maker_rebate_rate: '0',
    price_status: false,
    enabled: true,
    margin_rate: '1.000000000800064'
  },
  {
    address: '0x48c95963e9eac37a316b7ae04a0deb761bcdcc2b67912374d6036e7f0e9bae9f',
    base_asset: testnetCoins.DEEP,
    quote_asset: testnetCoins.SUI,
    baseCoin: testnetCoins.DEEP,
    quoteCoin: testnetCoins.SUI,
    base_margin: '0x610640613f21d9e688d6f8103d17df22315c32e0c80590ce64951a1991378b55',
    quote_margin: '0xcdbbe6a72e639b647296788e2e4b1cac5cea4246028ba388ba1332ff9a382eea',
    min_withdraw_risk_ratio: 2 * 1000000000,
    min_borrow_risk_ratio: 1.25 * 1000000000,
    liquidation_risk_ratio: 1.1 * 1000000000,
    target_liquidation_risk_ratio: 1.25 * 1000000000,
    user_liquidation_reward: 30000000,
    pool_liquidation_reward: 20000000,
    lot_size: '1000000', // 1 DEEP
    maker_fee: '0',
    min_size: '10000000', // 10 DEEP
    taker_fee: '1000000',
    tick_size: '10000000',
    treasury_address: '0xb3d277c50f7b846a5f609a8d13428ae482b5826bb98437997373f3a0d60d280e',
    whitelisted_pool: true,
    taker_fee_rate: '0',
    maker_rebate_rate: '0',
    price_status: true,
    reduce_only: false,
    enabled: true,
    margin_rate: '1.000000000800064'
  },
  {
    address: '0x1c19362ca52b8ffd7a33cee805a67d40f31e6ba303753fd3a4cfdfacea7163a5',
    base_asset: testnetCoins.SUI,
    quote_asset: testnetCoins.DBUSDC,
    baseCoin: testnetCoins.SUI,
    quoteCoin: testnetCoins.DBUSDC,
    base_margin: '0xcdbbe6a72e639b647296788e2e4b1cac5cea4246028ba388ba1332ff9a382eea',
    quote_margin: '0xf08568da93834e1ee04f09902ac7b1e78d3fdf113ab4d2106c7265e95318b14d',
    min_withdraw_risk_ratio: 2 * 1000000000,
    min_borrow_risk_ratio: 1.25 * 1000000000,
    liquidation_risk_ratio: 1.1 * 1000000000,
    target_liquidation_risk_ratio: 1.25 * 1000000000,
    user_liquidation_reward: 20000000,
    pool_liquidation_reward: 30000000,
    tick_size: '10',
    lot_size: '100000000',
    min_size: '1000000000',
    taker_fee_rate: '10',
    maker_rebate_rate: '10',
    price_status: true,
    reduce_only: false,
    enabled: true,
    margin_rate: '1.000000000800064'
  },
  {
    address: '4',
    base_asset: testnetCoins.WAL,
    quote_asset: testnetCoins.DBUSDC
  },
  {
    address: '5',
    base_asset: testnetCoins.WAL,
    quote_asset: testnetCoins.SUI,
    base_margin: '',
    quote_margin: '0xcdbbe6a72e639b647296788e2e4b1cac5cea4246028ba388ba1332ff9a382eea'
  },
  {
    address: '6',
    base_asset: testnetCoins.DBTC,
    quote_asset: testnetCoins.DBUSDC,
    base_margin: '0xf3440b4aafcc8b12fc4b242e9590c52873b8238a0d0e52fbf9dae61d2970796a',
    quote_margin: '0xf08568da93834e1ee04f09902ac7b1e78d3fdf113ab4d2106c7265e95318b14d'
  }
]

const mainnetPoolsObj: any = {
  '0xf948981b806057580f91622417534f491da5f61aeaf33d0ed8e69fd5691c95ce': {
    address: '0xf948981b806057580f91622417534f491da5f61aeaf33d0ed8e69fd5691c95ce',
    base_margin: '0x1d723c5cd113296868b55208f2ab5a905184950dd59c48eb7345607d6b5e6af7',
    quote_margin: '0xba473d9ae278f10af75c50a8fa341e9c6a1c087dc91a3f23e8048baf67d0754f',
    min_withdraw_risk_ratio: 2 * 1000000000,
    min_borrow_risk_ratio: 1.4999 * 1000000000,
    liquidation_risk_ratio: 1.2 * 1000000000,
    target_liquidation_risk_ratio: 1.5 * 1000000000,
    user_liquidation_reward: 30000000,
    pool_liquidation_reward: 20000000,
    supply_cap: 1000000,
    whitelisted_pool: true,
    tick_size: '10000',
    lot_size: '1000000',
    min_size: '10000000',
    taker_fee_rate: '0',
    maker_rebate_rate: '0',
    price_status: false,
    base_feed: '0x29bdd5248234e33bd93d3b81100b5fa32eaa5997843847e2c2cb16d7c6d9f7ff',
    quote_feed: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
  }
}

// 必须保持deepcoin在index0的位置 useGetDeepBookMarginBalance引用了
export const mainnetCoins = [
  {
    coin_type: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
    id: '0x6e60b051a08fa836f5a7acd7c464c8d9825bc29c44657fe170fe9b8e1e4770c0',
    name: 'DeepBook Token',
    symbol: 'DEEP',
    description: 'The DEEP token secures the DeepBook protocol, the premier wholesale liquidity venue for on-chain trading.',
    icon_url: 'https://images.deepbook.tech/icon.svg',
    decimals: 6,
    feed: '0x29bdd5248234e33bd93d3b81100b5fa32eaa5997843847e2c2cb16d7c6d9f7ff'
  },
  {
    coin_type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    id: '0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3',
    name: 'Sui',
    symbol: 'SUI',
    description: '',
    icon_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
    decimals: 9,
    feed: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744'
  },
  {
    coin_type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    id: '',
    name: 'USDC',
    symbol: 'USDC',
    description:
      'USDC is a US dollar-backed stablecoin issued by Circle. USDC is designed to provide a faster, safer, and more efficient way to send, spend, and exchange money around the world.',
    icon_url: 'https://circle.com/usdc-icon',
    decimals: 6,
    feed: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
  },
  {
    coin_type: '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
    id: '0xcf8a31804ae40cb3e7183fe57320f87467a7750d4fa701bca1ffbb1edd37781e',
    name: 'WAL Token',
    symbol: 'WAL',
    description: 'The native token for the Walrus Protocol.',
    icon_url: 'https://www.walrus.xyz/wal-icon.svg',
    decimals: 9,
    feed: '0xeba0732395fae9dec4bae12e52760b35fc1c5671e2da8b449c9af4efe5d54341'
  }
]

export default function useGetDeepBookPools() {
  const { fetchByApi } = useFetch()
  const { deepBookSDK } = usePeripherySDKStore()

  const {
    setDeepBookPools,
    setDeepBookPoolLoading,
    setCurrentDeepBookPool,
    setQueryDeepBookPoolLoading,
    setQueryDeepBookPools,
    setDeepBookPoolsObj,
    localDeepBookPools,
    setLocalDeepBookPools,
    setDeepbookPrice,
    deepBookPoolFavoriteIds,
    currentDeepBookPool,
    searchText,
    isAllPools
  } = useDeepBookStore()
  const navigate = useNavigate()

  // 获取池子列表
  const getDeepBookPools = async (address?: string, isAutoRefresh = false, text = '', allPools = false) => {
    //目前搜索框有内容时即便走这个方法页面也不会更新数据因为输入框有数据时用的store中的queryDeepBookPools 所以输入框有内容时先不调用
    if (searchText) return

    try {
      if (envConfigs.env === 'testnet') {
        throw new Error('testnet no data')
      }
      const targetAddress = address

      // 自动刷新模式下，如果未传入 text 和 allPools，从 store 中读取
      const finalText = isAutoRefresh && !text ? searchText : text
      const finalAllPools = isAutoRefresh && !allPools ? isAllPools : allPools

      // 构建池子 ID 列表，用于标记本地池子（包括通过地址栏打开的池子）
      const poolIds = localDeepBookPools.map((item: any) => item.address)
      if (targetAddress && !poolIds.includes(targetAddress)) {
        poolIds.push(targetAddress)
      }
      // 使用新 API，参数名改为 all_pool（单数）
      const params = new URLSearchParams()
      if (finalText) {
        params.append('text', finalText)
      }
      if (finalAllPools) {
        params.append('all_pool', 'true')
      }
      const queryString = params.toString()
      const url = queryString ? `${DeepBookPoolsPath}?${queryString}` : DeepBookPoolsPath
      // console.log('🚀 ~ getDeepBookPools ~ queryString:', queryString)
      const res = await fetchByApi(url, 'GET')
      // console.log('🚀🚀🚀 ~ useGetDeepBookPools.ts:getDeepBookPools ~ res:', res)
      if (res && res?.list && res.list.length > 0) {
        const result = res.list.map((item: any) => {
          return wrapDeepBookPool({ ...item, ...mainnetPoolsObj[item.address] }, poolIds as any)
        })

        let currentPool = null
        const targetPool = result.find((item: any) => item.address === targetAddress)
        if (targetPool) {
          currentPool = targetPool
        } else if (result.length > 0) {
          // 如果过滤后没有结果，从全部结果中选择第一个（兜底）
          // 默认sui-usdc池子
          currentPool =
            result?.find((item: any) => item?.address === '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407') || result[0]
        }

        // 只有当 currentPool 存在时才继续处理
        if (currentPool) {
          // import里没有 是通过地址栏拼接打开的
          const importPoolIds = localDeepBookPools.map((item: any) => item.address)
          if (targetAddress && !importPoolIds.includes(targetAddress) && !currentPool?.inWhiteList) {
            const importPool = { ...currentPool, isLocal: true }
            const newLocalPools = [importPool, ...localDeepBookPools]
            setLocalDeepBookPools(newLocalPools)
          }

          setDeepBookPools(result)
          setDeepBookPoolsObj(
            result.reduce((acc: Record<string, any>, item: any) => {
              acc[item.address] = item
              return acc
            }, {})
          )
          setDeepBookPoolLoading(false)

          // 自动刷新模式下，只在池子地址变化时才更新 currentDeepBookPool 和导航
          if (isAutoRefresh) {
            // 只更新当前池子的数据，但保持引用稳定性
            if (currentDeepBookPool?.address && currentPool?.address === currentDeepBookPool.address) {
              setCurrentDeepBookPool(currentPool)
              setDeepbookPrice({ poolId: currentPool.address, price: currentPool.price })
            }
          } else {
            setCurrentDeepBookPool(currentPool)
            setDeepbookPrice({ poolId: currentPool.address, price: currentPool.price })
            navigate(`/deepbook/${currentPool.address}`)
          }
        } else {
          // 如果没有找到任何池子，仍然设置列表和加载状态
          setDeepBookPools(result)
          setDeepBookPoolsObj(
            result.reduce((acc: Record<string, any>, item: any) => {
              acc[item.address] = item
              return acc
            }, {})
          )
          setDeepBookPoolLoading(false)
        }
        return result
      } else {
        setDeepBookPools([])
        setDeepBookPoolLoading(false)
        return []
      }
    } catch (error) {
      // console.log('🚀🚀🚀 ~ useGetDeepBookPools.ts:259 ~ getDeepBookPools ~ error:', error)
      if (envConfigs.env === 'testnet') {
        let result = []
        for (let i = 0; i < testnetPools.length; i++) {
          const pool = testnetPools[i]
          // console.log('🚀🚀🚀 ~ useGetDeepBookPools.ts:382 ~ getDeepBookPools ~ pool:', pool)
          // if (pool?.isMarginPool) {
          const price = await deepBookSDK.DeepbookUtils.getMarketPrice(pool)
          result.push(wrapDeepBookPool({ ...pool, price }))
          // }
        }
        // console.log('🚀🚀🚀 ~ useGetDeepBookPools.ts:380 ~ getDeepBookPools ~ result:', result)
        setDeepBookPools(result)
        setDeepBookPoolsObj(
          result.reduce((acc: Record<string, any>, item: any) => {
            acc[item.address] = item
            return acc
          }, {})
        )

        // 优先从过滤后的结果中选择，如果没有则使用第一个
        const targetAddress = address
        const targetPool = result.find((item: any) => item.address === targetAddress)
        let currentPool = null
        if (targetPool) {
          currentPool = targetPool
        } else if (result.length > 0) {
          // 如果过滤后没有结果，从全部结果中选择第一个（兜底）
          currentPool = result[0]
        }
        if (isAutoRefresh) {
          // 只更新当前池子的数据，但保持引用稳定性
          if (currentDeepBookPool?.address && currentPool?.address === currentDeepBookPool.address) {
            setCurrentDeepBookPool(currentPool)
            setDeepbookPrice({ poolId: currentPool?.address, price: currentPool?.price })
          }
        } else {
          setCurrentDeepBookPool(currentPool)
          setDeepbookPrice({ poolId: currentPool?.address, price: currentPool?.price })
          navigate(`/deepbook/${currentPool?.address}`)
        }
        console.error('🚀🚀🚀 ~ useGetDeepBookPools.ts:14 ~ getDeepBookPools ~ error:', error)
        setDeepBookPoolLoading(false)
      } else {
        setDeepBookPools([])
        setDeepBookPoolLoading(false)
      }
      return []
    }
  }

  // 获取当前池子信息
  const getCurrentDeepBookPool = async (address?: string) => {
    const { data } = await fetchByApi(DeepBookPoolInfoPath, 'POST', { pool_id: address })
    if (data) {
      const result = wrapDeepBookPool({ ...data, ...mainnetPoolsObj[address as string] })
      return result
    }
  }
  // 从 mainnetCoins 中根据 coin_type 查找对应的 feed
  const getFeedFromMainnetCoins = (coinType: string): string | undefined => {
    const coin = mainnetCoins.find(c => c.coin_type === coinType)
    return coin?.feed
  }

  const wrapDeepBookPool = (
    item: any,
    poolIds: string[] = [],
    currentLocalPools = localDeepBookPools,
    currentFavoriteIds = deepBookPoolFavoriteIds
  ) => {
    // console.log('🚀🚀🚀 ~ useGetDeepBookPools.ts:448 ~ wrapDeepBookPool ~ item:', item)
    const {
      base_asset,
      quote_asset,
      address,
      high,
      low,
      vol_usd_day,
      price,
      in_white_list,
      price_change,
      lot_size,
      tick_size,
      min_size,
      vol_24h,
      vol_24h_usd,
      taker_fee_rate,
      maker_rebate_rate,
      maker_fee_rate,
      verified,
      price_status,
      isMarginPool,
      base_margin,
      quote_margin,
      min_withdraw_risk_ratio,
      min_borrow_risk_ratio,
      liquidation_risk_ratio,
      target_liquidation_risk_ratio,
      user_liquidation_reward,
      pool_liquidation_reward,
      reduce_only,
      max_leverage,
      base_feed,
      quote_feed,
      enabled
      // margin_rate
    } = item
    const baseDecimals = base_asset.decimals
    const quoteDecimals = quote_asset.decimals
    const lotSize = d(lot_size).div(Math.pow(10, base_asset.decimals)).toString()
    const tickSize = d(tick_size)
      .div(d(Math.pow(10, quoteDecimals - baseDecimals + 9)))
      .toString()
    const minSize = d(min_size).div(Math.pow(10, base_asset.decimals)).toString()

    // 使用 API 返回的 verified 字段，如果不存在则默认为 true
    const isVerified = verified !== undefined ? verified : true

    // 获取 base_asset 和 quote_asset 的 feed，优先级：base_feed/quote_feed > mainnetCoins 匹配 > base_asset.feed/quote_asset.feed
    const baseFeed = getFeedFromMainnetCoins(base_asset?.coin_type) || base_feed || base_asset?.feed
    const quoteFeed = getFeedFromMainnetCoins(quote_asset?.coin_type) || quote_feed || quote_asset?.feed

    return {
      address,
      baseAssets: { ...base_asset, is_verified: isVerified, logo_url: base_asset.icon_url, feed: baseFeed },
      quoteAssets: { ...quote_asset, is_verified: isVerified, logo_url: quote_asset.icon_url, feed: quoteFeed },
      high,
      low,
      volUsdDay: vol_usd_day,
      price,
      priceDisplay: formatNumber(price),
      inWhiteList: in_white_list,
      priceStatus: price_status,
      priceChange: formatPercentage(price_change),
      lotSize,
      tickSize,
      minSize,
      vol24h: vol_24h,
      vol24hDisplay: formatNumber(vol_24h),
      vol24hUsdDisplay: vol_24h_usd,
      isAbandoned: abandonedPools.includes(address),
      takerFeeRate: taker_fee_rate,
      makerRebateRate: maker_rebate_rate,
      makerFeeRate: maker_fee_rate,
      sort: abandonedPools.includes(address) ? 0 : 1,
      isLocal: currentLocalPools.some((localDeepBookPool: any) => localDeepBookPool.address === address) || poolIds.includes(address),
      isFavorite: currentFavoriteIds.includes(address),
      isMarginPool: isMarginPool || !!(base_margin && quote_margin),
      baseMarginPool: base_margin,
      quoteMarginPool: quote_margin,
      minWithdrawRiskRatio: min_withdraw_risk_ratio ? d(min_withdraw_risk_ratio).div(1000000000).toNumber() : undefined,
      minBorrowRiskRatio: min_borrow_risk_ratio ? d(min_borrow_risk_ratio).div(1000000000).toNumber() : undefined,
      liquidationRiskRatio: liquidation_risk_ratio ? d(liquidation_risk_ratio).div(1000000000).toNumber() : undefined,
      targetLiquidationRiskRatio: target_liquidation_risk_ratio ? d(target_liquidation_risk_ratio).div(1000000000).toNumber() : undefined,
      userLiquidationReward: user_liquidation_reward ? d(user_liquidation_reward).div(1000000000).toNumber() : undefined,
      poolLiquidationReward: pool_liquidation_reward ? d(pool_liquidation_reward).div(1000000000).toNumber() : undefined,
      reduceOnly: reduce_only,
      enabled,
      marginRate: min_borrow_risk_ratio
        ? d(min_borrow_risk_ratio).div(1000000000).div(d(min_borrow_risk_ratio).div(1000000000).sub(1)).toFixed(0)
        : null
    }
  }

  //这里订单记录和池子下拉搜索有数据时共用了一个方法 临时增加两个变量 防止互相影响 自动刷新如果没有value的话直接返回 isFilter表示池子下拉框搜索 订单记录不需要loading
  const queryDeepBookPoolByValue = useCallback(
    async (value: string, isFilter: boolean = false, isLoading: boolean = false) => {
      if (!value) return

      try {
        if (isLoading) {
          setQueryDeepBookPoolLoading(true)
        }
        // 使用新 API，通过 GET 方法传递 text 参数
        const params = new URLSearchParams()
        if (value) {
          params.append('text', value)
        }
        const queryString = params.toString()
        // console.log('🚀 ~ useGetDeepBookPools ~ queryString:', queryString)
        const url = queryString ? `${DeepBookPoolsPath}?${queryString}` : DeepBookPoolsPath
        const res: any = await fetchByApi(url, 'GET')

        // console.log('🚀🚀🚀 ~ useGetDeepBookPools.ts:158 ~ queryDeepBookPoolByValue ~ res:', res)

        if (res && res?.list && res.list.length > 0) {
          const currentLocalPools = localDeepBookPools
          const currentFavoriteIds = deepBookPoolFavoriteIds
          const result = res.list
            .map((item: any) => {
              return {
                ...wrapDeepBookPool({ ...item, ...mainnetPoolsObj[item.address as string] }, [], currentLocalPools, currentFavoriteIds),
                isLocal: currentLocalPools.some((localDeepBookPool: any) => localDeepBookPool.address === item.address)
              }
            })
            .sort((a: any, b: any) => b.sort - a.sort)
          // console.log(result, 'result##')
          if (isFilter) {
            setQueryDeepBookPools(result)
          }
          setTimeout(() => {
            setQueryDeepBookPoolLoading(false)
          }, 500)
          return result
        } else {
          // 没有结果时也要设置空数组
          if (isFilter) {
            setQueryDeepBookPools([])
          }
          setTimeout(() => {
            setQueryDeepBookPoolLoading(false)
          }, 300)
          return []
        }
      } catch (error) {
        // console.error('🚀🚀🚀 ~ useGetDeepBookPools.ts:96 ~ queryDeepBookPoolByValue ~ error:', error)
        if (isFilter) {
          setQueryDeepBookPools([])
        }
        setQueryDeepBookPoolLoading(false)
        return []
      }
    },
    [localDeepBookPools, deepBookPoolFavoriteIds, setQueryDeepBookPoolLoading, setQueryDeepBookPools]
  )

  // 获取 testnet 环境下的池子数据
  const getTestnetPoolsData = useCallback(async () => {
    try {
      // 获取价格
      let result = []
      for (let i = 0; i < testnetPools.length; i++) {
        const pool = testnetPools[i]
        // if (pool?.isMarginPool) {
        const price = (await deepBookSDK.DeepbookUtils.getMarketPrice(pool)) || '0'
        result.push(wrapDeepBookPool({ ...pool, price }, [], localDeepBookPools, deepBookPoolFavoriteIds))
        // }
      }

      // 在函数内部获取最新的状态值
      const currentLocalPools = localDeepBookPools
      const currentFavoriteIds = deepBookPoolFavoriteIds

      const sortResult = result.sort((a: any, b: any) => b.sort - a.sort)

      setDeepBookPools(sortResult)
      setDeepBookPoolsObj(
        result.reduce((acc: Record<string, any>, item: any) => {
          acc[item.address] = item
          return acc
        }, {})
      )
      return result
    } catch (error) {
      console.error('🚀🚀🚀 ~ useGetDeepBookPools.ts:getTestnetPoolsData ~ testnet error:', error)
      // 即使获取价格失败，也使用 testnetPools（不带价格）
      const currentLocalPools = localDeepBookPools
      const currentFavoriteIds = deepBookPoolFavoriteIds

      const result = testnetPools
        .map((item: any) => {
          return wrapDeepBookPool(item, [], currentLocalPools, currentFavoriteIds)
        })
        .sort((a: any, b: any) => b.sort - a.sort)

      setDeepBookPools(result)
      setDeepBookPoolsObj(
        result.reduce((acc: Record<string, any>, item: any) => {
          acc[item.address] = item
          return acc
        }, {})
      )
      return result
    }
  }, [localDeepBookPools, deepBookPoolFavoriteIds, setDeepBookPools, setDeepBookPoolsObj, deepBookSDK])

  // 获取所有池子列表
  // 注意：此函数只更新列表数据，不设置 deepBookPoolLoading，避免影响当前池子的显示
  const getAllDeepBookPools = useCallback(
    async (allPools = false) => {
      // 在 testnet 环境下，直接使用 testnetPools，不调用 API
      if (envConfigs.env === 'testnet') {
        return await getTestnetPoolsData()
      }

      try {
        // 使用新 API，支持 all_pool 参数
        const params = new URLSearchParams()
        if (allPools) {
          params.append('all_pool', 'true')
        }
        const queryString = params.toString()
        const url = queryString ? `${DeepBookPoolsPath}?${queryString}` : DeepBookPoolsPath
        // console.log('🚀 ~ useGetDeepBookPools ~ queryString:', queryString)
        const res = await fetchByApi(url, 'GET')
        // console.log('🚀🚀🚀 ~ useGetDeepBookPools.ts:getAllDeepBookPools ~ res:', res)

        if (res && res?.list && res.list.length > 0) {
          // 在函数内部获取最新的状态值
          const currentLocalPools = localDeepBookPools
          const currentFavoriteIds = deepBookPoolFavoriteIds
          const result = res.list
            .map((item: any) => {
              return wrapDeepBookPool({ ...item, ...mainnetPoolsObj[item.address as string] }, [], currentLocalPools, currentFavoriteIds)
            })
            .sort((a: any, b: any) => b.sort - a.sort)

          setDeepBookPools(result)
          setDeepBookPoolsObj(
            result.reduce((acc: Record<string, any>, item: any) => {
              acc[item.address] = item
              return acc
            }, {})
          )
          return result
        } else {
          setDeepBookPools([])
          return []
        }
      } catch (error) {
        console.error('🚀🚀🚀 ~ useGetDeepBookPools.ts:getAllDeepBookPools ~ error:', error)
        // 非 testnet 环境下的错误处理
        setDeepBookPools([])
        return []
      }
    },
    [localDeepBookPools, deepBookPoolFavoriteIds, setDeepBookPools, setDeepBookPoolsObj, getTestnetPoolsData]
  )

  return { getDeepBookPools, queryDeepBookPoolByValue, getCurrentDeepBookPool, getAllDeepBookPools }
}
