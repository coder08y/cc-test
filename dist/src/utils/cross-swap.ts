import { defaultLifiOptions, defaultMayanOptions } from '@/config/cross-swap/chain'
import { CurrentChainOptions } from '@/types/cross_swap'
import { VITE_SOLANA_RPC_URL } from '@cetus/types/src/env'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Chain, ChainId, CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import { SolanaTransactionSigner } from '@mayanfinance/swap-sdk'
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base'
import { Connection, Transaction as SolanaTransaction, VersionedTransaction } from '@solana/web3.js'
import { Signer, ethers } from 'ethers'
import { WalletClient } from 'viem'

export function getDefaultChainOptions(platform: CrossSwapPlatform): CurrentChainOptions {
  if (platform === CrossSwapPlatform.MAYAN) {
    return { ...defaultMayanOptions }
  }
  return { ...defaultLifiOptions }
}

export async function parseEvmForEthers(walletClient: WalletClient, evmAddress?: string): Promise<Signer> {
  const provider = new ethers.BrowserProvider(walletClient?.transport)
  const signer = await provider.getSigner(evmAddress)
  return signer
}

export function parseSvmForMayan(
  chain: Chain,
  signSvmTransaction: SignerWalletAdapterProps['signTransaction']
): { signer: SolanaTransactionSigner; connection: Connection } {
  const signer: SolanaTransactionSigner = (async (
    trx: SolanaTransaction | VersionedTransaction
  ): Promise<SolanaTransaction | VersionedTransaction> => {
    const signedTrx = await signSvmTransaction<SolanaTransaction | VersionedTransaction>(trx)
    return signedTrx
  }) as SolanaTransactionSigner
  const connection = new Connection(VITE_SOLANA_RPC_URL)
  return {
    signer,
    connection
  }
}

/**
 * 生成余额缓存键
 * @param chainId 链ID
 * @param tokenAddress 代币地址
 * @returns 缓存键
 */
export const generateBalanceCacheKey = (chainId: ChainId, tokenAddress: string): string => {
  if (chainId === ChainId.SUI_LI_FI || chainId === ChainId.SUI_MAYAN) {
    return `${chainId}-${fixCoinType(tokenAddress, false)}`
  }
  return `${chainId}-${tokenAddress}`
}
