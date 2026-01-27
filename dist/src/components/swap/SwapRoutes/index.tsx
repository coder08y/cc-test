import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { Box, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import OverView from './OverView'
import RoutesModal from './RoutesModal'

type SwapRoutesProps = {
  data: any
  findRouterLoading: boolean
  allProviders?: string[]
  fromAmount: string
  toAmount: string
  fromCoin?: Token
  toCoin?: Token
  isSwapWidget?: boolean
  handleSwapWidgetRouterClick?: () => void
}

function SwapRoutes(props: SwapRoutesProps) {
  const { data, allProviders, findRouterLoading, fromAmount, toAmount, fromCoin, toCoin, isSwapWidget = false, handleSwapWidgetRouterClick } = props
  const [open, setOpen] = useState(false)
  return (
    <>
      <HStack w="100%" justify="space-between" align="flex-start" p="0 8px" mt="2px">
        <Text fontSize={isSwapWidget ? '12px' : '14px'} fontWeight="500" whiteSpace="nowrap">
          Auto Router
        </Text>
        <Box
          mt="-2px"
          onClick={e => {
            cancelBubble(e)
            if (isSwapWidget) {
              if (handleSwapWidgetRouterClick) {
                handleSwapWidgetRouterClick()
              }
            } else {
              setOpen(!open)
            }
          }}
          cursor="pointer"
        >
          <OverView allProviders={allProviders} loading={findRouterLoading} isSwapWidget={isSwapWidget}>
            <Icon xlinkHref="#icon-icon_spread" fontSize="16px" />
          </OverView>
        </Box>
      </HStack>
      {open && !isSwapWidget && (
        <RoutesModal
          isOpen={open}
          onClose={() => setOpen(false)}
          fromCoin={fromCoin}
          toCoin={toCoin}
          allProviders={allProviders}
          data={data}
          fromAmount={fromAmount}
          toAmount={toAmount}
        />
      )}
    </>
  )
}

export default SwapRoutes
