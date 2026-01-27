import useXCetusStore from '@/store/xcetus/useXCetus'
import { ErrorBoundary } from '@cetus/design'
import { useGetTokens } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { theme } from '@cetus/ui-kit'
import { ChakraProvider } from '@chakra-ui/react'
import { lazy, useEffect } from 'react'

const CetusLayout = lazy(() => import('./CetusLayout'))
export default function Layout() {
  const { currentAccount, addressChangeVersion } = useAccountStore()
  const { clearData: clearXCetusData } = useXCetusStore()
  const { getVerifiedCoins } = useGetTokens()
  const { isApp } = useWindowWidth()
  useEffect(() => {
    getVerifiedCoins()
  }, [])
  // 断开钱包链接 清空数据
  useEffect(() => {
    if (currentAccount === undefined || addressChangeVersion > 0) {
      clearXCetusData()
    }
  }, [currentAccount, addressChangeVersion])

  return (
    <ErrorBoundary isApp={isApp}>
      <ChakraProvider theme={theme}>
        {/* <NotifiContextProvider
          tenantId="cetus"
          env="Production"
          cardId="0195188dba9175d19a73310a385c1303"
          signMessage={signMessage}
          walletBlockchain="SUI"
          accountAddress={currentAccount?.address}
          walletPublicKey={currentAccount?.address}
        > */}
        <CetusLayout />
        {/* </NotifiContextProvider> */}
      </ChakraProvider>
    </ErrorBoundary>
  )
}
