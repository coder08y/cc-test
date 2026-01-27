import MergeSwapTrade from '@/components/merge-swap/MergeSwapTrade'
import { MergeSwapRoute } from '@/components/merge-swap/route/MergeSwapRoute'
import useMergeSwapStore from '@/store/merge-swap/useMergeSwapStore'
import { MergeSwapQuote } from '@/types/merge_swap'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, HStack, VStack } from '@chakra-ui/react'

function MergeSwap() {
  const { isApp } = useWindowWidth()
  const { isShowSelectRouter, findRouterLoading, mergeSwapQuote } = useMergeSwapStore(state => ({
    isShowSelectRouter: state.isShowSelectRouter,
    mergeSwapQuote: state.mergeSwapQuote,
    findRouterLoading: state.findRouterLoading
  }))

  return (
    <VStack w={isApp ? '100%' : '1200px'}>
      {isApp ? (
        <MergeSwapContentMobile isShowSelectRouter={isShowSelectRouter} mergeSwapQuoteData={mergeSwapQuote} findRouterLoading={findRouterLoading} />
      ) : (
        <MergeSwapContentPc isShowSelectRouter={isShowSelectRouter} mergeSwapQuoteData={mergeSwapQuote} findRouterLoading={findRouterLoading} />
      )}
    </VStack>
  )
}

type MergeSwapContentProps = {
  isShowSelectRouter: boolean
  mergeSwapQuoteData?: MergeSwapQuote
  findRouterLoading: boolean
}

function MergeSwapContentPc({ isShowSelectRouter, mergeSwapQuoteData, findRouterLoading }: MergeSwapContentProps) {
  return (
    <Box
      transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      willChange="transform"
      transform={isShowSelectRouter ? 'calc(50% - 235px))' : 'translateX(calc(50% - 235px))'}
    >
      <HStack alignItems="start" gap="16px" position="relative">
        {/* 交易组件 */}
        <MergeSwapTrade />
        {/* 选择路由 */}
        <Box
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          opacity={isShowSelectRouter ? 1 : 0}
          transform={isShowSelectRouter ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.95)'}
          pointerEvents={isShowSelectRouter ? 'auto' : 'none'}
          willChange="transform, opacity"
          visibility={isShowSelectRouter ? 'visible' : 'hidden'}
        >
          <MergeSwapRoute routerData={mergeSwapQuoteData?.data} findRouterLoading={findRouterLoading} />
        </Box>
      </HStack>
    </Box>
  )
}

function MergeSwapContentMobile({ isShowSelectRouter, mergeSwapQuoteData, findRouterLoading }: MergeSwapContentProps) {
  return (
    <VStack w="100%" maxW="100%" gap="0px">
      {/* 交易组件 */}
      <MergeSwapTrade />
      {/* 选择路由 */}
      {isShowSelectRouter && mergeSwapQuoteData && !mergeSwapQuoteData?.data?.error && (
        <MergeSwapRoute routerData={mergeSwapQuoteData?.data} findRouterLoading={findRouterLoading} />
      )}
    </VStack>
  )
}

export default MergeSwap
