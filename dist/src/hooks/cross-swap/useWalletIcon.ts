import { useAccount as useBigmiAccount } from '@bigmi/react'
import { ChainType } from '@lifi/sdk'
import { useCurrentWallet } from '@mysten/dapp-kit'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'

export function useWalletIcon(chainType: ChainType) {
  const { wallet: svmWallet } = useWallet()
  const { currentWallet: suiWallet } = useCurrentWallet()
  const { connector: bigmiConnector } = useBigmiAccount()
  const { connector: evmConnector } = useAccount()

  const walletIcon = useMemo(() => {
    switch (chainType) {
      case ChainType.EVM:
        if (evmConnector?.name === 'MetaMask') {
          return '/images/wallet/metamask.png'
        }
        return evmConnector?.icon || null

      case ChainType.SVM:
        return svmWallet?.adapter.icon || null

      case ChainType.MVM:
        return suiWallet?.icon || null

      case ChainType.UTXO:
        return bigmiConnector?.icon || null

      default:
        return null
    }
  }, [chainType, evmConnector, svmWallet, suiWallet, bigmiConnector])

  return walletIcon
}

export function useWalletIconFromChain(chain: { type: ChainType; logo_url?: string }) {
  const walletIcon = useWalletIcon(chain.type)

  return useMemo(() => {
    // 优先返回钱包图标，如果没有则返回链的 logo
    return walletIcon || chain?.logo_url || null
  }, [walletIcon, chain?.logo_url])
}
