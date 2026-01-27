import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { parseEvmForEthers, parseSvmForMayan } from '@/utils/cross-swap'
import { useAccount as useBigmiAccount } from '@bigmi/react'
import { useGlobalToast } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores/src/useAccountStore'
import { Chain, CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'
import { useCurrentWallet, useDisconnectWallet } from '@mysten/dapp-kit'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEffect } from 'react'
import { useAccount, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi'

export function useCrossWallet(platform: CrossSwapPlatform, chain?: Chain) {
  const crossSwapSdk = useSdk('crossSwap')
  const { openConnectModal: openEvmWalletModal } = useConnectModal()
  const { disconnect: disconnectEvmWallet } = useDisconnect()
  const { data: evmWalletClient } = useWalletClient()
  const { address: evmAddress } = useAccount()
  const { switchChain, switchChainAsync } = useSwitchChain()
  const { showCommonToast } = useGlobalToast()
  const { isApp } = useWindowWidth()

  const { setVisible: openSvmWalletModal } = useWalletModal()
  const {
    disconnect: disconnectSvmWallet,
    wallet: svmWallet,
    signTransaction: signSvmTransaction,
    connected: svmConnected,
    connecting: svmConnecting,
    wallets: svmWallets
  } = useWallet()

  const { currentAccount: mvmAccount, onWalletModal: openMvmWalletModal } = useAccountStore()
  const { mutate: disconnectMvmWallet } = useDisconnectWallet()

  const { setIsOpenBtcWalletModal } = useCrossSwapWalletStore()
  const { address: bigmiAddress, connector: bigmiConnector } = useBigmiAccount()

  const { setFromAddressObj, setToAddressObj, setSwitchChainLoading } = useCrossSwapWalletStore()

  const { currentWallet: suiWallet } = useCurrentWallet()

  // solana wallet init
  useEffect(() => {
    if (!chain || chain.type !== ChainType.SVM || !crossSwapSdk) return
    const svmAddress = svmWallet?.adapter.publicKey?.toString()
    setFromAddressObj(ChainType.SVM, { chain_address: svmAddress })
    setToAddressObj(ChainType.SVM, { chain_address: svmAddress })

    if (platform === CrossSwapPlatform.MAYAN) {
      if (signSvmTransaction) {
        const { signer, connection } = parseSvmForMayan(chain, signSvmTransaction)
        crossSwapSdk!.setCrossSwapConfigs(CrossSwapPlatform.MAYAN, {
          solana: {
            signer,
            connection
          }
        })
      }
    } else if (platform === CrossSwapPlatform.LI_FI) {
      if (svmWallet) {
        crossSwapSdk!.setCrossSwapConfigs(CrossSwapPlatform.LI_FI, {
          solana: {
            wallet: svmWallet.adapter as SignerWalletAdapter
          }
        })
      }
    }
  }, [chain?.id, svmConnected, svmConnecting, svmWallet, svmWallets, crossSwapSdk, platform])

  // EVM wallet init
  useEffect(() => {
    if (!chain || chain.type !== ChainType.EVM || !crossSwapSdk) return
    setFromAddressObj(ChainType.EVM, { chain_address: evmAddress })
    setToAddressObj(ChainType.EVM, { chain_address: evmAddress })
    console.log('init wallet  evm walletClient:', evmAddress, evmWalletClient)
    if (evmWalletClient) {
      if (platform === CrossSwapPlatform.MAYAN) {
        parseEvmForEthers(evmWalletClient, evmAddress).then(signer => {
          crossSwapSdk!.setCrossSwapConfigs(CrossSwapPlatform.MAYAN, {
            evm: {
              evm_signer: signer
            }
          })
        })
      } else if (platform === CrossSwapPlatform.LI_FI) {
        crossSwapSdk!.setCrossSwapConfigs(CrossSwapPlatform.LI_FI, {
          evm: {
            wallet: evmWalletClient
          }
        })
      }
    }
  }, [chain?.id, evmAddress, evmWalletClient?.chain?.id, crossSwapSdk, platform])

  // MVM wallet init
  useEffect(() => {
    if (!chain || chain.type !== ChainType.MVM || !crossSwapSdk) return
    console.log('init wallet mvm walletClient:', {
      mvmAccount,
      suiWallet
    })

    setFromAddressObj(ChainType.MVM, { chain_address: mvmAccount?.address })
    setToAddressObj(ChainType.MVM, { chain_address: mvmAccount?.address })

    if (platform === CrossSwapPlatform.LI_FI) {
      if (suiWallet) {
        crossSwapSdk!.setCrossSwapConfigs(CrossSwapPlatform.LI_FI, {
          sui: {
            wallet: suiWallet
          }
        })
      }
    }
  }, [chain?.id, mvmAccount, crossSwapSdk, platform, suiWallet])

  // UTXO wallet init
  useEffect(() => {
    if (!chain || chain.type !== ChainType.UTXO) return
    setFromAddressObj(ChainType.UTXO, { chain_address: bigmiAddress })
    setToAddressObj(ChainType.UTXO, { chain_address: bigmiAddress })
  }, [chain?.id, bigmiAddress])

  /**
   * 连接钱包
   * @returns
   */
  const handleConnectWallet = async () => {
    if (!chain) return
    switch (chain.type) {
      case ChainType.EVM:
        // 如果已经连接但不在目标链上，先切换链
        console.log('handleConnectWallet evmWalletClient:', {
          evmWalletClient,
          evmAddress,
          chainId: evmWalletClient?.chain.id,
          chainId2: chain.id
        })
        if (evmWalletClient && evmWalletClient?.chain.id !== chain.id) {
          console.log('🚀🚀🚀 ~ handleConnectWallet ~ switchChainAsync:', {
            chainId: chain.id
          })
          setSwitchChainLoading(true)
          switchChainAsync({
            chainId: chain.id,
            addEthereumChainParameter: {
              chainName: chain.chain_name,
              nativeCurrency: {
                name: chain.native_token.name,
                symbol: chain.native_token.symbol,
                decimals: chain.native_token.decimals
              },
              rpcUrls: chain.rpc_urls
            }
          })
            .then(e => {
              console.log('🚀🚀🚀 ~ handleConnectWallet ~ e:', e)
              // 切换成功后的处理逻辑
              showCommonToast('Network switched successfully', 'success')
            })
            .catch(error => {
              console.log('🚀🚀🚀 ~ handleConnectWallet ~ error:', error)
              // 切换失败后的处理逻辑
              showCommonToast('Network switched failed', 'rejected')
            })
            .finally(() => {
              setSwitchChainLoading(false)
            })
        } else {
          // 打开连接模态框
          openEvmWalletModal?.()
        }
        break
      case ChainType.SVM:
        openSvmWalletModal(true)
        break
      case ChainType.MVM:
        openMvmWalletModal(true)
        break
      case ChainType.UTXO:
        setIsOpenBtcWalletModal(true)
        break
      default:
        break
    }
  }

  /**
   * 断开钱包
   * @returns
   */
  const handleDisconnectWallet = async () => {
    if (!chain) return
    switch (chain.type) {
      case ChainType.EVM:
        disconnectEvmWallet()
        setFromAddressObj(ChainType.EVM, { chain_address: undefined })
        setToAddressObj(ChainType.EVM, { chain_address: undefined })
        if (isApp) {
          return
        }
        // 清除所有可能的 wagmi 相关状态
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('wagmi.')) {
            localStorage.removeItem(key)
          }
        })
        // 强制清除钱包插件的授权状态，强制下次连接时弹出确认窗口
        try {
          // 尝试清除 OKX 钱包的授权状态
          if ((window as any).okxwallet?.bitcoin?.disconnect) {
            await (window as any).okxwallet.bitcoin.disconnect()
          }
          // 尝试清除其他钱包的授权状态
          if (window.ethereum?.request) {
            try {
              await window.ethereum.request({
                method: 'wallet_revokePermissions',
                params: [{ eth_accounts: {} }]
              })
            } catch (error) {
              console.log('Failed to revoke permissions:', error)
            }
          }
        } catch (error) {
          console.log('Failed to disconnect wallet plugin:', error)
        }

        break
      case ChainType.SVM:
        await disconnectSvmWallet()
        break
      case ChainType.MVM:
        disconnectMvmWallet()
        break
      case ChainType.UTXO:
        bigmiConnector?.disconnect()
        setFromAddressObj(ChainType.UTXO, { chain_address: undefined })
        setToAddressObj(ChainType.UTXO, { chain_address: undefined })
        break
      default:
        break
    }
  }

  return {
    handleConnectWallet,
    handleDisconnectWallet
  }
}
