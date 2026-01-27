import { CurrentChainOptions } from '@/types/cross_swap'
import { ChainId, CrossSwapPlatform, supportChainLifiList, supportChainMayanList } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'

export const defaultLifiOptions: CurrentChainOptions = {
  fromChain: supportChainLifiList[1],
  toChain: supportChainLifiList[0],
  fromToken: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'ETH',
    type: 'EVM' as ChainType,
    symbol: 'ETH',
    decimals: 18,
    chain_id: 1,
    coingecko_id: 'weth',
    logo_url:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
  },
  toToken: {
    address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    name: 'SUI',
    type: 'MVM' as ChainType,
    symbol: 'SUI',
    decimals: 9,
    chain_id: 9270000000000000,
    logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
    coingecko_id: 'sui'
  },
  platform: CrossSwapPlatform.LI_FI
}

export const defaultMayanOptions: CurrentChainOptions = {
  fromChain: supportChainMayanList[1],
  toChain: supportChainMayanList[0],
  fromToken: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'ETH',
    type: 'EVM' as ChainType,
    symbol: 'ETH',
    decimals: 18,
    chain_id: 1,
    logo_url: 'https://statics.mayan.finance/eth.png',
    supports_permit: false,
    coingecko_id: 'weth'
  },
  toToken: {
    address: '0x2::sui::SUI',
    name: 'SUI',
    type: 'MVM' as ChainType,
    symbol: 'SUI',
    decimals: 9,
    chain_id: 1999,
    logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
    coingecko_id: 'sui'
  },
  platform: CrossSwapPlatform.LI_FI
}

export const mayanChainConfig: Partial<Record<ChainId, { logo_url: string }>> = {
  [ChainId.ARB]: {
    logo_url: '/images/chain/arb.png'
  },
  [ChainId.AVA]: {
    logo_url: '/images/chain/avalanche.png'
  },
  [ChainId.BAS]: {
    logo_url: '/images/chain/base.png'
  },
  [ChainId.BSC]: {
    logo_url: '/images/chain/bsc.png'
  },
  [ChainId.LNA]: {
    logo_url: '/images/chain/linea.png'
  },
  [ChainId.OPT]: {
    logo_url: '/images/chain/opt.png'
  },
  [ChainId.POL]: {
    logo_url: '/images/chain/polygon.png'
  },
  [ChainId.SOL_MAYAN]: {
    logo_url: '/images/chain/solana.png'
  },
  [ChainId.UNI]: {
    logo_url: '/images/chain/unichain.png'
  },
  [ChainId.SUI_MAYAN]: {
    logo_url: '/images/chain/sui-logo.png'
  },
  [ChainId.SUI_LI_FI]: {
    logo_url: '/images/chain/sui-logo.png'
  }
}
