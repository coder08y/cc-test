// import GeneralLoading from '@/components/common/GeneralLoading'

import Layout from '@/layout'

// import TestData from '@/pages/TestData'

// import TestPosition from '@/pages/TestPosition'
// import TestTokenSelectModal from '@/pages/TestTokenSelectModal'
// import ToastTest from '@/pages/ToastTest'
// import WalletTest from '@/pages/WalletTest'

import { lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'

const Stats = lazy(() => import('@/pages/Stats'))
const Swap = lazy(() => import('@/pages/Swap'))
const Dca = lazy(() => import('@/pages/Dca'))
const Pools = lazy(() => import('@/pages/Pools'))
const Clmm = lazy(() => import('@/pages/Clmm'))
const Dlmm = lazy(() => import('@/pages/Dlmm'))
const PositionDetail = lazy(() => import('@/pages/PositionDetail'))
const Farms = lazy(() => import('@/pages/Farms'))
const CreatePool = lazy(() => import('@/pages/CreatePool'))
const Limit = lazy(() => import('@/pages/Limit'))
const SelectForLiquidity = lazy(() => import('@/pages/SelectForLiquidity'))
const VaultsV2 = lazy(() => import('@/pages/VaultsV2'))
const XCetus = lazy(() => import('@/pages/XCetus'))
const VaultsDetailPage = lazy(() => import('@/components/vaults-v2/detail/VaultsDetailPage'))
const DlmmPositionDetail = lazy(() => import('@/pages/DlmmPositionDetail'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const Compensation = lazy(() => import('@/pages/Compensation'))
// import CrossSwap from '@/pages/CrossSwap'
const CrossSwap = lazy(() => import('@/pages/CrossSwap'))
const MergeSwap = lazy(() => import('@/pages/MergeSwap'))
const Pro = lazy(() => import('@/pages/Pro'))
const Incentive = lazy(() => import('@/pages/Incentive'))
const DeepBook = lazy(() => import('@/pages/DeepBook'))
const Invitation = lazy(() => import('@/pages/Invitation'))

const Notfound = lazy(() => import('@/pages/404'))
const ErrorPage = lazy(() => import('@/pages/Error'))

// Test
const TestCoin = lazy(() => import('@/pages/TestCoin'))
const TestNotifi = lazy(() => import('@/pages/TestNotifi'))
const TestDlmm = lazy(() => import('@/pages/TestDlmm'))
const Test = lazy(() => import('@/pages/Test'))
const TestPro = lazy(() => import('@/pages/TestPro'))

const RedirectToPools = () => {
  return <Navigate to="/pools" replace />
}

const router = [
  {
    path: '/index.html',
    element: <Navigate to="/swap" replace />
  },
  {
    path: '/',
    element: (
      // <Suspense fallback={<GeneralLoading />}>
      <Layout />
      // </Suspense>
    ),
    children: [
      {
        path: 'swap',
        element: <Swap />,
        children: [
          {
            path: ':from/:to',
            element: <Swap />
          }
        ]
      },
      {
        path: 'limit',
        element: <Limit />,
        children: [
          {
            path: ':pay/:target',
            element: <Limit />
          }
        ]
      },
      {
        path: 'dca',
        element: <Dca />,
        children: [
          {
            path: ':from/:to',
            element: <Dca />
          }
        ]
      },
      {
        path: 'pools/*',
        element: <Pools />
      },
      {
        path: 'incentive/*',
        element: <Incentive />
      },
      {
        path: 'portfolio/*',
        element: <ProfilePage />
      },
      {
        path: 'pool/list',
        element: <RedirectToPools />
      },
      {
        path: 'position-detail',
        element: <PositionDetail />,
        children: [
          {
            path: ':position_nft_id/:posTab',
            element: <PositionDetail />
          },
          {
            path: ':position_nft_id',
            element: <PositionDetail />
          }
        ]
      },
      {
        path: 'dlmm-position-detail',
        element: <DlmmPositionDetail />,
        children: [
          {
            path: ':position_nft_id',
            element: <DlmmPositionDetail />
          }
        ]
      },
      {
        path: 'select-pool',
        element: <SelectForLiquidity />
      },
      {
        path: 'clmm/*',
        element: <Clmm />
      },
      {
        path: 'dlmm/*',
        element: <Dlmm />
      },
      {
        path: 'create-pool',
        element: <CreatePool />,
        children: [
          {
            path: ':base/:quote/:fee',
            element: <CreatePool />
          },
          {
            path: ':base/:quote/',
            element: <CreatePool />
          }
        ]
      },
      {
        path: 'farms',
        element: <Farms />
      },
      {
        path: 'vaults',
        element: <VaultsV2 />
      },
      {
        path: 'vaults-v2',
        element: <VaultsV2 />
      },
      {
        path: 'vaults/:vaultId',
        element: <VaultsDetailPage />
      },
      {
        path: 'xCetus',
        element: <XCetus />
      },

      {
        path: 'buy-crypto',
        element: <div>buy-crypto</div>
      },
      {
        path: 'stats',
        element: <Stats />
      },
      {
        path: 'compensation',
        element: <Compensation />
      },
      {
        path: 'merge-swap',
        element: <MergeSwap />
      },

      {
        path: 'cross-swap',
        element: <CrossSwap />,
        children: [
          {
            path: ':crossPlatform/:platform?',
            element: <CrossSwap />
          }
        ]
      },

      {
        path: 'pro',
        element: <Pro />
      },
      {
        path: 'deepbook',
        element: <DeepBook />,
        children: [
          {
            path: ':address',
            element: <DeepBook />
          }
        ]
      },
      {
        path: 'invite',
        element: <Invitation />
      },
      {
        path: 'error',
        element: <ErrorPage />
      },
      // {
      //   path: 'wallet-test',
      //   element: <WalletTest />
      // },
      // {
      //   path: 'test-toast',
      //   element: <ToastTest />
      // },
      // {
      //   path: 'test-data',
      //   element: <TestData />
      // },
      // {
      //   path: 'test-position',
      //   element: <TestPosition />
      // },
      // {
      //   path: 'test-notifi',
      //   element: <TestNotifi />
      // },
      // {
      //   path: 'test-coin',
      //   element: <TestCoin />
      // },
      // {
      //   path: 'test-token-select-modal',
      //   element: <TestTokenSelectModal />
      // // },
      // {
      //   path: 'test',
      //   element: <Test />
      // },
      // {
      //   path: 'test-pro',
      //   element: <TestPro />
      // },
      // {
      //   path: 'test-bridge',
      //   element: <TestBridge />
      // },
      {
        path: '/',
        element: <Navigate to="/swap" />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/404" />
  },
  {
    path: '/404',
    element: <Notfound />
  }
]

export default createBrowserRouter(router)
