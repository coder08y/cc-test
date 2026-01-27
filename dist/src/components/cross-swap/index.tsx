import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import { Box, HStack, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import CrossSelectRouter from './CrossSelectRouter'
import CrossSelectRouterModal from './CrossSelectRouter/CrossSelectRouterModal'
import CrossSwapTrade from './CrossSwapTrade'

export default function CrossSwapCard() {
  const location = useLocation()
  const { isApp } = useWindowWidth()

  // Determine platform from URL path
  const platform = useMemo(() => {
    const pathname = location.pathname
    if (pathname.includes('/cross-swap/li.fi')) {
      return 'li.fi' as CrossSwapPlatform
    } else if (pathname.includes('/cross-swap/mayan')) {
      return 'mayan' as CrossSwapPlatform
    }
    return 'li.fi' as CrossSwapPlatform // default fallback
  }, [location.pathname])

  const [isShowCrossSelectRouter, setIsShowCrossSelectRouter] = useState(false)
  return isApp ? (
    <CrossSwapContentMobile
      platform={platform}
      isShowCrossSelectRouter={isShowCrossSelectRouter}
      setIsShowCrossSelectRouter={setIsShowCrossSelectRouter}
    />
  ) : (
    <CrossSwapContentPc
      platform={platform}
      isShowCrossSelectRouter={isShowCrossSelectRouter}
      setIsShowCrossSelectRouter={setIsShowCrossSelectRouter}
    />
  )
}

type CrossSwapContentProps = {
  platform: CrossSwapPlatform
  isShowCrossSelectRouter: boolean
  setIsShowCrossSelectRouter: (isShow: boolean) => void
}

function CrossSwapContentMobile({ platform, isShowCrossSelectRouter, setIsShowCrossSelectRouter }: CrossSwapContentProps) {
  return (
    <VStack w="100%" maxW="100%" alignItems="stretch">
      <CrossSwapTrade
        platform={platform}
        isShowCrossSelectRouter={isShowCrossSelectRouter}
        handleShowCrossSelectRouter={(isShow: boolean) => {
          setIsShowCrossSelectRouter(isShow)
        }}
      />

      {/* 选择路由 */}
      {platform === 'li.fi' && isShowCrossSelectRouter && (
        <CrossSelectRouterModal
          isOpenSelectRouter={isShowCrossSelectRouter}
          onClose={() => {
            setIsShowCrossSelectRouter(false)
          }}
        />
      )}
    </VStack>
  )
}

function CrossSwapContentPc({ platform, isShowCrossSelectRouter, setIsShowCrossSelectRouter }: CrossSwapContentProps) {
  return (
    <Box
      transition="all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      willChange="transform"
      transform={isShowCrossSelectRouter ? 'calc(50% - 235px))' : 'translateX(calc(50% - 235px))'}
    >
      <HStack alignItems="start" gap="16px" position="relative">
        {/* 交易组件 */}
        <CrossSwapTrade
          platform={platform}
          isShowCrossSelectRouter={isShowCrossSelectRouter}
          handleShowCrossSelectRouter={(isShow: boolean) => {
            setIsShowCrossSelectRouter(isShow)
          }}
        />
        {/* 选择路由 */}
        {platform === 'li.fi' && (
          <Box
            transition="all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            opacity={isShowCrossSelectRouter ? 1 : 0}
            transform={isShowCrossSelectRouter ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.95)'}
            pointerEvents={isShowCrossSelectRouter ? 'auto' : 'none'}
            willChange="transform, opacity"
            visibility={isShowCrossSelectRouter ? 'visible' : 'hidden'}
          >
            <CrossSelectRouter
              isOpenSelectRouter={isShowCrossSelectRouter}
              onClose={() => {
                setIsShowCrossSelectRouter(false)
              }}
            />
          </Box>
        )}
      </HStack>
    </Box>
  )
}
