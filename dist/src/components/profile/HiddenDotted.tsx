import useGlobalStore from '@/store/common/global'
import { Icon } from '@cetus/ui-kit'
import { HStack } from '@chakra-ui/react'
import React from 'react'
import { useLocation } from 'react-router-dom'
type HiddenDottedProps = {
  size?: 's' | 'l'
  children: React.ReactNode
}
function HiddenDotted({ size = 's', children }: HiddenDottedProps) {
  const { isShowProfileAssets } = useGlobalStore()
  const { pathname } = useLocation()
  return isShowProfileAssets || pathname !== '/portfolio' ? (
    children
  ) : size === 'l' ? (
    <HStack gap="0">
      <Icon xlinkHref="#icon-icon_more1" fontSize="32px" svgFill="text_caption" />
      <Icon xlinkHref="#icon-icon_more1" fontSize="32px" svgFill="text_caption" />
    </HStack>
  ) : (
    <Icon xlinkHref="#icon-icon_more1" fontSize="20px" svgFill="text_caption" />
  )
}

export default HiddenDotted
