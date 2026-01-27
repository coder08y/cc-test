import '@/assets/css/mining_style.css'
import useIconActive from '@/hooks/common/useIconActive'
import { CetusTooltip } from '@cetus/design'
import { cancelBubble } from '@cetus/utils'
import { Box, BoxProps, Center, HStack, StackProps, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

interface MiningIconProps extends StackProps {
  tooltip?: string
  size?: number
}
const MiningIcon = (props: MiningIconProps) => {
  const { tooltip = 'Mining rewards available', size } = props
  return (
    <HStack
      w="16px"
      h="16px"
      onClick={e => {
        cancelBubble(e)
      }}
      {...props}
    >
      <CetusTooltip
        placement="top"
        tooltip={
          <Text lineHeight="16px" color="primary_gray" fontSize="12px">
            {tooltip}
          </Text>
        }
      >
        <Center>
          <MiningImage size={size} />
        </Center>
      </CetusTooltip>
    </HStack>
  )
}

const MiningImage = ({ size = 20, ...props }: BoxProps & { size?: number }) => {
  const { active, animate, onMouseOver, onMouseOut } = useIconActive()

  const scale = useMemo(() => {
    return (size * 1.26) / 56
  }, [size])

  return (
    <Box as="div" w="20px" h="20px" pos="relative" cursor="pointer" onMouseEnter={onMouseOver} onMouseLeave={onMouseOut} {...props}>
      <Box as="div" className="mining_composition" transform={`translate3D(0, 0, 0) scale(${scale}, ${scale})`}>
        <Box as="div" className={`mining_class3 mining_bg3 ${active && animate ? 'mining_ani3' : ''} `} />
        <Box as="div" className={`mining_class2 mining_bg2 ${active && animate ? 'mining_ani2' : ''} `} />
        <Box as="div" className={`mining_class1 mining_bg1 ${active && animate ? 'mining_ani1' : ''} `} />
      </Box>
    </Box>
  )
}

export default MiningIcon

export { MiningImage }
