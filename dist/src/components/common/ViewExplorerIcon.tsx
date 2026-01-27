import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Center, Text } from '@chakra-ui/react'

export default function ViewExplorerIcon({ onClick }: { onClick?: () => void }) {
  const { isApp } = useWindowWidth()
  return (
    <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">View on Explorer</Text>}>
      <Center>
        <Icon xlinkHref="#icon-icon_link3" onClick={onClick} fontSize="16px" />
      </Center>
    </CetusTooltip>
  )
}
