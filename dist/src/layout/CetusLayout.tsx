import GeneralLoading from '@/components/common/GeneralLoading'
import ProModeContainer from '@/components/common/proModeAndChart/ProModeContainer'
import { SwapWidgetContainer } from '@/components/swap-widget/SwapWidgetContainer'
import useMsafeAutoConnect from '@/hooks/init/useMsafeAutoConnect'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import { Block, Header, TermConditionsModal } from '@cetus/design'
import { MenuItem } from '@cetus/design/src/components/nav/type'
import { useInitSDK, useInviteCodes } from '@cetus/hooks'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useGetFrontConfig from '@cetus/hooks/src/useGetFrontConfig'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'

import { useAccountStore, useTransactionStore } from '@cetus/stores'

import useCryptoStore from '@cetus/stores/src/crypto'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { Icon } from '@cetus/ui-kit'
import { Box, Center, Flex, VStack } from '@chakra-ui/react'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const BuyCryptoAlchemy = lazy(() => import('@cetus/design').then(module => ({ default: module.BuyCryptoAlchemy })))
const BuyCryptoKodo = lazy(() => import('@cetus/design').then(module => ({ default: module.BuyCryptoKodo })))
const BuyCryptoModal = lazy(() => import('@cetus/design').then(module => ({ default: module.BuyCryptoModal })))
const TransactionModal = lazy(() => import('@cetus/design').then(module => ({ default: module.TransactionModal })))
const WalletModal = lazy(() => import('@cetus/design').then(module => ({ default: module.WalletModal })))
const SecurityModal = lazy(() => import('@cetus/design').then(module => ({ default: module.SecurityModal })))

// import registerPhantomWallet from '@cetus/design/src/components/wallet/provider/PhantomWallet'

import TopProgressBar from '@/components/common/TopProgressBar'
import BatchAuthModal from '@/components/common/batchAuth/BatchAuthModal'
import CarouselBlock from '@/components/pro/CarouselBlock'
import ProTokenRiskModal from '@/components/pro/ProTokenRiskModal'
import { useChainTime } from '@/hooks/common/useChainTime'
import useGetBinStepConfig from '@/hooks/dlmm/useGetBinStepConfig'
import useGetRouterConfig from '@/hooks/swap/useGetRouterConfig'
import useCommonGlobalStore from '@/store/common/global'
import useBatchAuthStore from '@/store/common/useBatchAuthStore'
import useDeepBookStore from '@/store/deepbook'
import useProStore from '@/store/pro'
import useProListStore from '@/store/pro/list'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTrack from '@cetus/hooks/src/useTrack'
import { useSdkStore } from '@cetus/sdk-factory'
import useGlobalStore from '@cetus/stores/src/global'
import { d } from '@cetusprotocol/common-sdk'
import { registerSuiSnapWallet } from '@kunalabs-io/sui-snap-wallet'
import { useCurrentWallet } from '@mysten/dapp-kit'

registerSuiSnapWallet()
// registerPhantomWallet()

export default function CetusLayout() {
  const { hasAccessPermission } = useInviteCodes()
  const { isApp } = useWindowWidth()
  const [isShowBuyCryptoModal, setIsShowBuyCryptoModal] = useState(false)
  const [isShowSecurityModal, setIsShowSecurityModal] = useState(false)
  const { isTerm, setIsTerm, isSwapWidgetDisplay } = useWebConfigStore()
  const { isShowAlchemyCrypto, isShowKodoCrypto, setIsShowAlchemyCrypto, setIsShowKodoCrypto } = useCryptoStore()
  const { transactionModalVisible, transactionData, setTransactionModalVisible, setManualCloseId } = useTransactionStore()
  const { currentAccount, isOpenWalletModal, onWalletModal } = useAccountStore()
  const { batchAuthOptions, setBatchAuthOptions, showBatchAuthModal, setShowBatchAuthModal } = useBatchAuthStore()
  const { fetchBinStepConfig } = useGetBinStepConfig()

  // 顶部进度条状态
  const { isShowTokenRickModal, isOpenProTokenRiskModal, setIsOpenProTokenRiskModal } = useProListStore()
  const { isTopProgressLoading, setUserTimeHasChang, verifyInviteCodes } = useCommonGlobalStore()

  const { fetchFrontConfig } = useGetFrontConfig()
  const { fetchTokenPrices } = useTokenPrice()
  const { calculateTimeDiff } = useChainTime()

  const { fetchRouterConfig } = useGetRouterConfig()

  useMsafeAutoConnect()

  useInitSDK()

  const { pathname, state } = useLocation()

  const { currWidgetImg } = useSwapWidgetConfigStore()

  const { currentWallet } = useCurrentWallet()

  const { toTrackDlmmBetaWalletConnect } = useTrack()

  // dlmm beta 邀请码和连接钱包埋点
  useEffect(() => {
    if (currentAccount?.address && currentWallet?.name && verifyInviteCodes) {
      toTrackDlmmBetaWalletConnect({
        walletAddress: currentAccount?.address,
        walletName: currentWallet?.name,
        inviteCodes: verifyInviteCodes
      })
    }
  }, [currentAccount?.address, currentWallet?.name, verifyInviteCodes])

  const setting = useMemo(() => {
    return {
      preferred: true,
      rpc: true,
      swapWidgetDisplay: {
        icon: currWidgetImg
      }
    }
  }, [currWidgetImg])

  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const hStackRef = useRef<HTMLDivElement>(null)
  const handleScroll = () => {
    if (layoutRef.current) {
      setShowScrollToTop(layoutRef.current.scrollTop > 100)
    }
  }

  const scrollToTop = () => {
    if (layoutRef.current) {
      layoutRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  // const { initNotifi } = useInitNotifi()

  useEffect(() => {
    if (pathname) {
      // 如果 location.state 中有 preventScroll 标志，则不滚动到顶部
      if (!(state as any)?.preventScroll) {
        scrollToTop()
      }
    }
    // console.log('🚀 ~ useEffect ~ pathname:', pathname, hasAccessPermission)
    if (!hasAccessPermission) {
      // 跳转到 invite 页面
      navigate('/invite')
    }
  }, [pathname, hasAccessPermission, state])

  useEffect(() => {
    fetchRouterConfig()
    setTimeout(() => {
      fetchFrontConfig()

      // fetchTokenPrices([])
      calculateTimeDiff()
        .then(diff => {
          // 如果当前时间 和 链上时间 相差 5s 以上，则认为用户时间有变化
          setUserTimeHasChang(
            d(diff)
              .abs()
              .gt(5 * 1000)
          )
        })
        .catch(e => {
          setUserTimeHasChang(false)
        })
    }, 1000)

    if (layoutRef.current) {
      // console.log('🚀 ~ useEffect ~ hStack:', layoutRef.current)
      layoutRef.current.addEventListener('scroll', handleScroll)
      return () => layoutRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // useEffect(() => {
  //   if (currentAccount?.address) {
  //     initNotifi(currentAccount?.address)
  //   }
  // }, [currentAccount?.address])

  const { size } = useDocumentSize()
  const layoutRef = useRef<HTMLDivElement>(null)

  const { setScrollYgtZero, dlmmTutorialStep } = useGlobalStore()
  const [scrolling, setScrolling] = useState(false)
  const scrollTimer = useRef<NodeJS.Timeout | null>(null)
  const onScroll = () => {
    setScrolling(true)
    if (layoutRef.current) {
      setScrollYgtZero(layoutRef.current.scrollTop > 0)
    }
  }
  useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.addEventListener('scroll', onScroll)
      return () => {
        layoutRef.current?.removeEventListener('scroll', onScroll)
      }
    }
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current)
        scrollTimer.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (scrolling) {
      scrollTimer.current = setTimeout(() => {
        setScrolling(false)
      }, 1500)
    }
  }, [scrolling])

  const navigate = useNavigate()
  const { setDeepbookTopTab } = useDeepBookStore()
  const menuList: MenuItem[] = [
    {
      title: 'Trade',
      children: [
        {
          title: 'Swap',
          path: '/swap',
          icon: '#icon-a-icon_swap2'
        },
        {
          title: 'Limit Order',
          path: '/limit',
          icon: '#icon-icon_limitorder'
        },
        {
          title: 'DCA',
          path: '/dca',
          icon: '#icon-icon_dca'
        },
        {
          title: 'DeepBook',
          path: '/deepbook',
          // type: '_blank',
          icon: '#icon-icon_deepbook',
          type: 'onClick',
          onClick: () => {
            setDeepbookTopTab('trade')
            navigate('/deepbook')
          }
        }
      ]
    },
    {
      title: 'Pro',
      path: '/pro',
      type: isApp ? 'onClick' : 'reactRouterLink'
      // onClick: () => {
      //   if (isShowTokenRickModal) {
      //     setIsOpenProTokenRiskModal(true)
      //   } else {
      //     navigate('/pro')
      //   }
      // }
    },
    {
      title: 'Earn',
      children: [
        {
          title: 'Pools',
          path: '/pools',
          icon: '#icon-icon_liquiditypools'
        },
        {
          title: 'Farms',
          path: '/farms',
          icon: '#icon-icon_farms'
        },
        {
          title: 'Vaults',
          path: '/vaults',
          icon: '#icon-icon_vaults'
        }
      ]
    },
    {
      title: 'xCETUS',
      path: '/xCetus',
      type: isApp ? 'onClick' : 'reactRouterLink'
    },
    {
      title: 'Bridge',
      children: [
        {
          title: 'Sui Bridge',
          type: '_blank',
          path: 'https://bridge.sui.io/',
          icon: '#icon-icon_sui'
        },
        {
          title: 'Wormhole',
          type: '_blank',
          path: 'https://bridge.cetus.zone/sui',
          icon: '#icon-icon_wormhole'
        },
        {
          title: 'Mayan',
          path: '/cross-swap/mayan',
          icon: '#icon-mayan'
        }
        // {
        //   title: 'LI.FI',
        //   path: '/cross-swap/li.fi',
        //   icon: '#icon-lifi'
        // }
      ]
    },
    // {
    //   title: 'Launch',
    //   children: [
    //     {
    //       title: 'Launchpad',
    //       path: '/launchpad',
    //       icon: '#icon-icon_farms'
    //     },
    //     {
    //       title: 'Cetus Pump',
    //       path: '/home',
    //       icon: '#icon-icon_vaults',
    //       type: '_blank'
    //     }
    //   ]
    // },
    {
      title: 'More',
      children: [
        {
          title: 'Compensation',
          path: '/compensation',
          icon: '#icon-icon_compensation'
        },
        {
          title: 'Buy Crypto',
          type: 'onClick',
          onClick: () => {
            // console.log('Buy Crypto')
            if (currentAccount?.address) {
              setIsShowBuyCryptoModal(true)
            } else {
              onWalletModal(true)
            }
          },
          icon: '#icon-icon_crypto'
        },
        {
          title: 'Launchpad',
          path: 'https://launch.cetus.zone/?chain=sui',
          type: '_blank',
          icon: '#icon-icon_Launchpad'
        },
        {
          title: 'Cetus Terminal',
          path: 'https://terminal.cetus.zone',
          type: '_blank',
          icon: '#icon-icon_terminal'
        },
        {
          title: 'Stats',
          path: '/stats',
          icon: '#icon-icon_stats'
        },
        {
          title: 'Docs',
          path: 'https://cetus-1.gitbook.io/cetus-docs',
          type: '_blank',
          icon: '#icon-icon_docs'
        },
        {
          title: 'Security',
          type: 'onClick',
          onClick: () => {
            setIsShowSecurityModal(true)
          },
          icon: '#icon-icon_security'
        }
      ],
      socials: [
        {
          title: 'X',
          path: 'https://x.com/cetusprotocol',
          icon: '#icon-icon_twitter'
        },
        {
          title: 'Discord',
          path: 'https://discord.com/invite/rQtYGfmcD8',
          icon: '#icon-icon_discord'
        },
        {
          title: 'Telegram',
          path: 'https://t.me/CetusDevNews',
          icon: '#icon-icon_telegram3'
        },
        {
          title: 'Medium',
          path: 'https://medium.com/@CetusProtocol',
          icon: '#icon-icon_medium'
        }
      ]
    }
  ]

  const isDisplayWidget = useMemo(() => {
    if (isSwapWidgetDisplay && !pathname?.includes('/swap') && !pathname?.includes('/merge-swap') && pathname !== '/' && hasAccessPermission) {
      return true
    }
    return false
  }, [pathname, isSwapWidgetDisplay, hasAccessPermission])

  const { tab } = useQueryParams()

  const firstPathPart = pathname.split('/').filter(Boolean)[0]

  const showToTopIcon = useMemo(() => {
    return ['stats', 'pools', 'pro'].some(path => firstPathPart === path)
  }, [pathname])

  const bgBottomIsShow = useMemo(() => {
    return ['swap', 'limit', 'dca', 'pro', 'merge-swap'].some(path => (path == 'pro' ? !isApp && firstPathPart === path : firstPathPart === path))
  }, [pathname])

  const { isProMode } = useProStore()
  const calcMaxW = useMemo(() => {
    if (
      (firstPathPart === 'pools' && (tab == 'pools' || !tab)) ||
      ((firstPathPart === 'swap' || firstPathPart === 'dca' || firstPathPart === 'limit') && isProMode) ||
      ['pro', 'invite', 'deepbook', 'farms', 'vaults', 'compensation'].some(item => item === firstPathPart)
    ) {
      return '100%'
    } else {
      return '1200px'
    }
  }, [tab, pathname, isProMode])

  const isTargetPage = firstPathPart === 'swap' || firstPathPart === 'dca' || firstPathPart === 'limit'
  const isSwapLimitDcaPage = isTargetPage
  const isNoPaddingBottom = isTargetPage && isProMode

  const deepBookPageStyle = {
    pb: '0px',
    mt: '0px'
  }

  const isDeepBookPage = firstPathPart === 'deepbook'
  const isPoolsPage = firstPathPart === 'pools' || firstPathPart === 'clmm' || firstPathPart === 'dlmm'

  const { isInitialized } = useSdkStore()

  useEffect(() => {
    if (isInitialized) {
      fetchBinStepConfig()
    }
  }, [isInitialized])

  return (
    <>
      <Box
        ref={layoutRef}
        h={size?.h}
        background="bg_primary"
        overflowY="scroll"
        overflowX="hidden"
        minW={{
          base: '100%',
          lg: '1200px'
        }}
        className={`scroll-container ${scrolling ? 'scroll-active' : ''}`}
        sx={{
          '::-webkit-scrollbar-thumb': {
            background: scrolling ? 'rgba(88, 90, 92, 1)' : 'rgba(88, 90, 92, 0)', // 控制颜色
            transition: 'background 0.5s ease, opacity 0.5s ease'
            // 移动端：隐藏滚动条，不占用布局空间
            // '@media (max-width: 1024px)': {
            //   '&::-webkit-scrollbar': {
            //     width: '0px',
            //     background: 'transparent'
            //   },
            //   scrollbarWidth: 'none',
            //   msOverflowStyle: 'none'
            // },
            // // 桌面端：显示滚动条
            // '@media (min-width: 1025px)': {
            //   '&::-webkit-scrollbar': {
            //     width: '4px'
            //   },
            //   '&::-webkit-scrollbar-track': {
            //     background: 'transparent'
            //   },
            //   '&::-webkit-scrollbar-thumb': {
            //     background: scrolling ? 'rgba(88, 90, 92, 1)' : 'rgba(88, 90, 92, 0)',
            //     transition: 'background 0.5s ease, opacity 0.5s ease',
            //     borderRadius: '4px'
            //   }
          }
        }}
        bgImage={{
          base: firstPathPart === 'invite' ? 'url(/images/invite_h5.png)' : 'none',
          lg: firstPathPart === 'invite' ? 'url(/images/invita@2x.png)' : 'none'
        }}
        backgroundSize="cover"
        bgPosition="center"
      >
        <Box
          minH="100%"
          position="relative"
          // h={size?.h}
          // minW={{
          //   base: '100%',
          //   lg: '1160px'
          // }}
          pt={{
            base: '10px',
            lg: '0'
          }}
        >
          {/* top progress bar */}
          <TopProgressBar isLoading={isTopProgressLoading} />
          <Header logo={{ image: '/images/logo@2x.png', url: '/' }} menus={menuList} notifications setting={setting} isCetusPump={false} />
          <Box
            as="div"
            pb={firstPathPart === 'invite' ? 0 : isDeepBookPage ? deepBookPageStyle.pb : isNoPaddingBottom ? '16px' : '40px'}
            mt={isDeepBookPage ? deepBookPageStyle.mt : '0px'}
            style={{
              width: '100%',
              position: 'relative',
              height: '100%'
              // overflowY: 'auto',
              // overflowX: 'hidden'
            }}
            ref={hStackRef}
          >
            <Suspense fallback={<GeneralLoading />}>
              <VStack w="100%" gap="0">
                {(isSwapLimitDcaPage || firstPathPart === 'pro') && <CarouselBlock />}
                <Flex
                  w="100%"
                  // maxW="1200px"
                  maxW={calcMaxW}
                  p={{
                    base: isDeepBookPage || isPoolsPage ? '0px' : '0px 12px',
                    lg: '0 20px'
                  }}
                  justifyContent="center"
                  zIndex="1"
                  position="relative"
                >
                  {/* Pro 模式容器组件 - 不会因路由切换而重新渲染 */}
                  <ProModeContainer />
                  <Outlet />
                </Flex>
              </VStack>
            </Suspense>
          </Box>
          {showScrollToTop && showToTopIcon && (
            <Block
              cursor="pointer"
              w={isApp ? '34px' : '40px'}
              h={isApp ? '34px' : '40px'}
              p="0"
              borderRadius="12px"
              zIndex="99"
              position="fixed"
              bottom={isApp ? '90px' : '30px'}
              right={isApp ? '12px' : '20px'}
              onClick={scrollToTop}
              _hover={{
                svg: {
                  fill: 'text_caption'
                }
              }}
            >
              <Center w="100%" h="100%">
                <Icon xlinkHref="#icon-icon_top1" onClick={scrollToTop} />
              </Center>
            </Block>
          )}
          <BgContent tab={tab} bgBottomIsShow={bgBottomIsShow} pathname={pathname} />
        </Box>
      </Box>

      {/* 链接钱包弹窗 */}
      {isOpenWalletModal && (
        <Suspense fallback={<div />}>
          <WalletModal isOpen={isOpenWalletModal} onClose={() => onWalletModal(false)} />
        </Suspense>
      )}
      {/* 交易弹窗 */}
      {transactionModalVisible && transactionData && !transactionData.isSwapWidget && (
        <Suspense fallback={<div />}>
          <TransactionModal
            isOpen={transactionModalVisible}
            onClose={isManual => {
              if (transactionData.transactionId && isManual) {
                setManualCloseId(transactionData.transactionId)
              }
              setTransactionModalVisible(false)
            }}
            {...transactionData}
          />
        </Suspense>
      )}
      {isShowBuyCryptoModal && (
        <Suspense fallback={<div />}>
          <BuyCryptoModal isOpen={isShowBuyCryptoModal} onClose={() => setIsShowBuyCryptoModal(false)} />
        </Suspense>
      )}
      {isShowAlchemyCrypto && (
        <Suspense fallback={<div />}>
          <BuyCryptoAlchemy isOpen={isShowAlchemyCrypto} onClose={() => setIsShowAlchemyCrypto(false)} />
        </Suspense>
      )}
      {isShowKodoCrypto && (
        <Suspense fallback={<div />}>
          <BuyCryptoKodo isOpen={isShowKodoCrypto} onClose={() => setIsShowKodoCrypto(false)} />
        </Suspense>
      )}
      {isShowSecurityModal && (
        <Suspense fallback={<div />}>
          <SecurityModal isOpen={isShowSecurityModal} onClose={() => setIsShowSecurityModal(false)} />
        </Suspense>
      )}

      {/* 用户第一次进入网站许可弹框 */}
      {!isTerm && hasAccessPermission && <TermConditionsModal isOpen={!isTerm} onClose={() => setIsTerm(true)} />}
      {/* {isTerm && <DlmmTutorialModal />} */}
      {/* {dlmmTutorialStep < 2 && isTerm && !isOpenProTokenRiskModal && <DlmmTutorial />} */}
      {/* 用户第一次进入pro list许可弹框 */}
      {isOpenProTokenRiskModal && isTerm && <ProTokenRiskModal isOpen={isOpenProTokenRiskModal} onClose={() => setIsOpenProTokenRiskModal(false)} />}
      {isDisplayWidget && <SwapWidgetContainer />}

      {/* 批量授权弹窗 */}
      {showBatchAuthModal && batchAuthOptions && (
        <BatchAuthModal
          isOpen={showBatchAuthModal}
          onClose={() => {
            setShowBatchAuthModal(false)
            setBatchAuthOptions(undefined)
          }}
          options={batchAuthOptions}
        />
      )}
    </>
  )
}

const BgContent = ({ bgBottomIsShow, pathname, tab }: { bgBottomIsShow: boolean; pathname: string; tab: string }) => {
  const bgColor = useMemo(() => {
    if (pathname !== '/portfolio') return
    if (tab == 'wallet') return 'linear-gradient( 180deg, #000E21 0%, #0E1B2C 49%, #121212 100%)'
    if (tab == 'liquidity') return 'linear-gradient( 180deg, #001A17 0%, #0F211F 53%, #121212 100%)'
    if (tab == 'orders') return 'linear-gradient( 180deg, #03091A 0%, #121624 54%, #121212 100%)'
    if (tab == 'xCetus') return 'linear-gradient( 180deg, #00141A 0%, #0E1D21 52%, #121212 100%);'
  }, [tab, pathname])
  return (
    <>
      {pathname == '/portfolio' && (
        <Box w="100%" pos="absolute" top="0" h={{ base: '272px', lg: '296px' }} background={bgColor}>
          <VStack
            w="100%"
            alignItems="start"
            h="100%"
            sx={{
              backgroundImage: {
                base: "url('/images/bg_profile_h5.png')",
                lg: "url('/images/bg_profile.png')"
              },
              backgroundSize: 'auto 100%',
              backgroundPosition: 'right',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </Box>
      )}
      <Box bg="background">
        {bgBottomIsShow && (
          <Box
            className="bg_img_left"
            w="30%"
            h="208px"
            bg="#005B33"
            filter="blur(150px)"
            position="fixed"
            zIndex="0"
            bottom="-100px"
            left="-10%"
            borderRadius="50%"
          />
        )}
        {bgBottomIsShow && (
          <Box
            className="bg_img_right"
            w="30%"
            h="208px"
            bg="#005B33"
            filter="blur(180px)"
            position="fixed"
            zIndex="0"
            bottom="-100px"
            right="-10%"
            borderRadius="50%"
          />
        )}
      </Box>
    </>
  )
}
