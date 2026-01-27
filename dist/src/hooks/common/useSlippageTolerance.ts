import { isTrustedToken } from '@/utils'
import { SlippageType } from '@cetus/design/src/components/common/SlippageSetting'
import useTokenStore from '@cetus/stores/src/token'
import { Token } from '@cetus/types'
import { d } from '@cetus/utils'
import React, { useCallback } from 'react'

function useSlippageTolerance(
  tokenA: Token | undefined,
  tokenB: Token | undefined,
  slippage: string | number,
  showNewTolerance: boolean,
  slippageType?: SlippageType
) {
  const { verifiedTokenMap } = useTokenStore()

  const isRegularTokenPair = React.useCallback(
    (tokenA: Token | undefined, tokenB: Token | undefined) => {
      const trustedList = Array.from(verifiedTokenMap.values())
      return isTrustedToken(tokenA, trustedList) && isTrustedToken(tokenB, trustedList)
    },
    [verifiedTokenMap]
  )

  const getNormalColor = () => {
    return { color: 'text_paragraph', bg: 'transparent', noTip: true }
  }

  const getWarningColor = () => {
    return { color: 'primary_yellow', bg: 'primary_yellow_opacity.10', noTip: false }
  }

  const getDangerColor = () => {
    return { color: 'primary_red', bg: 'primary_red_opacity.10', noTip: false }
  }
  const getRegularSlippageColor = (slippage: number) => {
    if (slippage <= 2) {
      return getNormalColor()
    } else if (slippage < 10) {
      return getWarningColor()
    } else {
      return getDangerColor()
    }
  }

  const getUnRegularSlippageColor = (slippage: number) => {
    if (slippage <= 5) {
      return getNormalColor()
    } else if (slippage < 10) {
      return getWarningColor()
    } else {
      return getDangerColor()
    }
  }

  const getCrossSlippageColor = (slippage: number) => {
    if (slippage <= 3) {
      return getNormalColor()
    } else if (slippage < 10) {
      return getWarningColor()
    } else {
      return getDangerColor()
    }
  }

  const getSlippageColor = useCallback(
    (slippage: string | number) => {
      const slippageValue = d(slippage).mul(100).toNumber()
      if (slippageValue > 0 && slippageValue < 0.05) return getWarningColor()
      if (showNewTolerance) {
        if (isRegularTokenPair(tokenA, tokenB)) {
          return getRegularSlippageColor(slippageValue)
        }
        return getUnRegularSlippageColor(slippageValue)
      }
      if (slippageType === 'cross') {
        return getCrossSlippageColor(slippageValue)
      }
      return getRegularSlippageColor(slippageValue)
    },
    [isRegularTokenPair, tokenA, tokenB, showNewTolerance, slippageType]
  )

  const slippageColor = getSlippageColor(slippage)

  const isRegular = isRegularTokenPair(tokenA, tokenB)

  return {
    isRegularTokenPair: isRegular,
    slippageColor,
    getSlippageColor
  }
}

export default useSlippageTolerance
