import { VStack } from '@chakra-ui/react'
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider } from 'wagmi'
import {
  abstract,
  apeChain,
  arbitrum,
  aurora,
  avalanche,
  base,
  berachain,
  blast,
  bob,
  boba,
  bsc,
  celo,
  corn,
  cronos,
  fantom,
  fuse,
  gnosis,
  gravity,
  immutableZkEvm,
  ink,
  kaia,
  lens,
  linea,
  lisk,
  mainnet,
  mantle,
  metis,
  mode,
  moonbeam,
  moonriver,
  opBNB,
  optimism,
  polygon,
  polygonZkEvm,
  rootstock,
  scroll,
  sei,
  soneium,
  sonic,
  superposition,
  swellchain,
  taiko,
  unichain,
  worldchain,
  xdc,
  zksync
} from 'wagmi/chains'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import {
  AlphaWalletAdapter,
  CloverWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'

import CrossSwapCard from '@/components/cross-swap'
import AllowanceRequiredModal from '@/components/cross-swap/common/AllowanceRequiredModal'
import ConnectBtcWalletModal from '@/components/cross-swap/common/ConnectBtcWalletModal'
import { DefaultBigmiConfigResult, createDefaultBigmiConfig } from '@/config/cross-swap/createDefaultBigmiConfig'
import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { Config } from '@bigmi/client'
import { BigmiProvider, useReconnect } from '@bigmi/react'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VITE_SOLANA_RPC_URL } from '@cetus/types'
import {
  backpackWallet,
  binanceWallet,
  bitgetWallet,
  bybitWallet,
  coin98Wallet,
  coinbaseWallet,
  gateWallet,
  imTokenWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  omniWallet,
  oneInchWallet,
  oneKeyWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  tokenPocketWallet,
  trustWallet,
  walletConnectWallet
} from '@rainbow-me/rainbowkit/wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { useRef } from 'react'

// const wagmiConfig = getDefaultConfig({
//   appName: 'cetus cross swap',
//   wallets: [
//     {
//       groupName: 'Recommended',
//       wallets: [
//         okxWallet,
//         rainbowWallet,
//         metaMaskWallet,
//         coinbaseWallet,
//         bybitWallet,
//         binanceWallet,
//         bitgetWallet,
//         coin98Wallet,
//         imTokenWallet,
//         backpackWallet,
//         oneInchWallet,
//         ledgerWallet,
//         omniWallet,
//         trustWallet,
//         oneKeyWallet,
//         gateWallet,
//         tokenPocketWallet,
//         phantomWallet,
//         rabbyWallet,
//         walletConnectWallet
//       ]
//     }
//   ],
//   chains: [
//     mainnet,
//     arbitrum,
//     optimism,
//     scroll,
//     polygon,
//     bsc,
//     base,
//     blast,
//     avalanche,
//     scroll,
//     optimism,
//     linea,
//     zksync,
//     polygonZkEvm,
//     gnosis,
//     fantom,
//     moonriver,
//     moonbeam,
//     fuse,
//     boba,
//     mode,
//     metis,
//     lisk,
//     unichain,
//     aurora,
//     sei,
//     immutableZkEvm,
//     sonic,
//     gravity,
//     taiko,
//     soneium,
//     swellchain,
//     opBNB,
//     corn,
//     lens,
//     cronos,
//     abstract,
//     rootstock,
//     apeChain,
//     celo,
//     worldchain,
//     xdc,
//     mantle,
//     superposition,
//     ink,
//     bob,
//     berachain,
//     kaia
//   ],
//   projectId: '9016542fb0fe0b2f92d1b4df56f29f33',
//   ssr: false
// })

const solanaRpcUrl = VITE_SOLANA_RPC_URL || WalletAdapterNetwork.Mainnet

// 创建 Solana 钱包适配器列表
// const wallets = [
//   new PhantomWalletAdapter(),
//   new SolflareWalletAdapter(),
//   new CoinbaseWalletAdapter(),
//   new TorusWalletAdapter(),
//   new LedgerWalletAdapter(),
//   new CloverWalletAdapter(),
//   new AlphaWalletAdapter(),
//   new MathWalletAdapter()
// ]

export default function CrossSwap() {
  const bigmi = useRef<DefaultBigmiConfigResult | null>(null)
  const wallets = useRef<any[] | null>(null)
  const wagmiConfig = useRef<any>(null)

  if (!bigmi.current) {
    bigmi.current = createDefaultBigmiConfig({
      bigmiConfig: {
        ssr: true,
        multiInjectedProviderDiscovery: false
      }
    })
  }

  if (!wallets.current) {
    wallets.current = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new CloverWalletAdapter(),
      new AlphaWalletAdapter(),
      new MathWalletAdapter()
    ]
  }

  if (!wagmiConfig.current) {
    wagmiConfig.current = getDefaultConfig({
      appName: 'cetus cross swap',
      wallets: [
        {
          groupName: 'Recommended',
          wallets: [
            okxWallet,
            rainbowWallet,
            metaMaskWallet,
            coinbaseWallet,
            bybitWallet,
            binanceWallet,
            bitgetWallet,
            coin98Wallet,
            imTokenWallet,
            backpackWallet,
            oneInchWallet,
            ledgerWallet,
            omniWallet,
            trustWallet,
            oneKeyWallet,
            gateWallet,
            tokenPocketWallet,
            phantomWallet,
            rabbyWallet,
            walletConnectWallet
          ]
        }
      ],
      chains: [
        mainnet,
        arbitrum,
        optimism,
        scroll,
        polygon,
        bsc,
        base,
        blast,
        avalanche,
        scroll,
        optimism,
        linea,
        zksync,
        polygonZkEvm,
        gnosis,
        fantom,
        moonriver,
        moonbeam,
        fuse,
        boba,
        mode,
        metis,
        lisk,
        unichain,
        aurora,
        sei,
        immutableZkEvm,
        sonic,
        gravity,
        taiko,
        soneium,
        swellchain,
        opBNB,
        corn,
        lens,
        cronos,
        abstract,
        rootstock,
        apeChain,
        celo,
        worldchain,
        xdc,
        mantle,
        superposition,
        ink,
        bob,
        berachain,
        kaia
      ],
      projectId: '9016542fb0fe0b2f92d1b4df56f29f33',
      ssr: false
    })
  }

  useReconnect(bigmi.current.config as Config)

  return (
    <BigmiProvider config={bigmi.current.config as Config} reconnectOnMount={false}>
      <ConnectionProvider endpoint={solanaRpcUrl}>
        <WalletProvider wallets={wallets.current} autoConnect>
          <WagmiProvider config={wagmiConfig.current} reconnectOnMount>
            <RainbowKitProvider theme={darkTheme()} modalSize="compact">
              <WalletModalProvider>
                <CrossSwapContent />
              </WalletModalProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BigmiProvider>
  )
}

function CrossSwapContent() {
  const { isOpenBtcWalletModal, setIsOpenBtcWalletModal } = useCrossSwapWalletStore()
  const { approveData, setApproveData } = useCrossSwapStore()
  const { isApp } = useWindowWidth()
  return (
    <VStack w={isApp ? '100%' : '1200px'} className={isApp ? '' : 'bg_img'}>
      <CrossSwapCard />
      {/* btc钱包选择弹窗 */}
      {isOpenBtcWalletModal && (
        <ConnectBtcWalletModal
          isOpen={isOpenBtcWalletModal}
          onClose={() => {
            setIsOpenBtcWalletModal(false)
          }}
        />
      )}
      {/* EVM授权弹窗 */}
      {approveData && (
        <AllowanceRequiredModal
          isOpen={true}
          approveSymbol={approveData.approveSymbol}
          onClose={() => {
            setApproveData(undefined)
          }}
          step={approveData.step}
          swapText={approveData.swapText}
        />
      )}
    </VStack>
  )
}
