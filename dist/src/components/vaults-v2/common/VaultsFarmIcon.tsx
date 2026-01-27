import { FarmingImage } from '@/components/common/FarmingIcon'
import { CetusTooltip } from '@cetus/design'
import { ImageProps, Text, VStack } from '@chakra-ui/react'

type VaultsFarmIconProps = {
  imageStyle?: ImageProps
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}
export default function VaultsFarmIcon(props: VaultsFarmIconProps) {
  const { imageStyle, onMouseEnter, onMouseLeave } = props
  return (
    <CetusTooltip
      tooltip={
        <VStack p="4px 4px 0" alignItems="flex-start">
          <Text fontSize="12px" color="text_caption">
            3rd party incentives available.
          </Text>
          <Text fontSize="12px">Powered by Haedal</Text>
        </VStack>
      }
    >
      <FarmingImage {...imageStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
    </CetusTooltip>
  )
}
