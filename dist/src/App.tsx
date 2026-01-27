import GeneralLoading from '@/components/common/GeneralLoading'
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'

// import { registerWalletConnectWallet } from '@mysten/walletconnect-wallet'
import { registerWalletConnectWallet } from '@/utils/walletconnect'
// import { useEffect } from 'react'
import envConfigs from '@cetus/types/src/config/envConfigs'
// import { createPhantom, Position } from '@phantom/wallet-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') }
})
const queryClient = new QueryClient()

try {
  registerWalletConnectWallet({
    projectId: '02101275643ee97e3556d518114d3918',
    getClient: chain => new SuiClient({ network: chain, url: getFullnodeUrl(chain) }),
    metadata: {
      walletName: 'Wallet Connect',
      icon: 'https://walletconnect.org/walletconnect-logo.png',
      enabled: true,
      id: 'walletconnect'
    }
  })
} catch (error) {
  console.log('🚀 ~ error:', error)
}

function App() {
  // const { setPhantomInstance } = useGlobalStore()

  // const initPhantomInstance = async () => {
  //   console.log('🚀 ~ initPhantomInstance ~ phantomInstance start init')
  //   const phantomInstance = await createPhantom({
  //     position: Position.bottomRight,
  //     hideLauncherBeforeOnboarded: true,
  //     namespace: 'embed_phantom',
  //     colorScheme: 'dark'
  //   })
  //   console.log('🚀 ~ initPhantomInstance ~ phantomInstance:', phantomInstance)

  //   setPhantomInstance(phantomInstance)
  // }
  // useEffect(() => {
  //   if (!(window as any)?.phantom?.sui) {
  //     initPhantomInstance()
  //   }
  // }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={envConfigs.env === 'testnet' ? 'testnet' : 'mainnet'}>
        <WalletProvider
          autoConnect
          slushWallet={{
            name: 'Cetus'
          }}
        >
          <Suspense fallback={<GeneralLoading />}>
            <RouterProvider router={router} />
          </Suspense>

          {/* <div style={{ color: 'red' }}>this is test</div> */}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}

export default App
