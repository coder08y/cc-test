import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { BackButton, Icon } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function Back({ backUrl, backText, type = 'pools' }: { backUrl: string; backText: string; type?: 'pools' | 'dlmm' | 'clmm' }) {
  const { isApp } = useWindowWidth()
  const navigate = useNavigate()
  return isApp ? (
    <HStack ml="-4px" gap="4px" onClick={() => (backUrl ? navigate(backUrl) : navigate(`/pools?tab=${type}_pools`))}>
      <Icon xlinkHref="#icon-detail" transform="rotate(180deg)" fontSize="16px" />
      <Text fontSize="14px">{backText}</Text>
    </HStack>
  ) : (
    <BackButton text={'Back'} onClick={() => (backUrl ? navigate(backUrl) : navigate(`/pools?tab=${type}_pools`))} />
  )
}
