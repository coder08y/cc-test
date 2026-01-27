import '@/assets/css/farming_style.css'
import useIconActive from '@/hooks/common/useIconActive'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { cancelBubble } from '@cetus/utils'
import { Box, BoxProps, Center, HStack, StackProps, Text } from '@chakra-ui/react'
import { ReactNode, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
interface FarmingIcon extends StackProps {
  tooltip?: ReactNode
  size?: number
}

const FarmingIcon = ({ tooltip, size, ...rest }: FarmingIcon) => {
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  return (
    <HStack
      w="20px"
      h="20px"
      onClick={e => {
        cancelBubble(e)
        isApp ? '' : navigate('/farms')
      }}
      {...rest}
    >
      <CetusTooltip placement="top" tooltip={tooltip ? tooltip : <Text fontSize="12px">Farm rewards available</Text>}>
        <Center>
          <FarmingImage size={size} />
        </Center>
      </CetusTooltip>
    </HStack>
  )
}

const FarmingImage = ({ size = 20, ...props }: BoxProps & { size?: number }) => {
  const { active, animate, onMouseOver, onMouseOut } = useIconActive()

  const scale = useMemo(() => {
    return (size * 1.26) / 56
  }, [size])

  return (
    <Box as="div" onMouseEnter={onMouseOver} onMouseLeave={onMouseOut} pos="relative" w="20px" h="20px" cursor="pointer" {...props}>
      <Box as="div" className="farming_composition" transform={`translate3D(0, 0, 0) scale(${scale}, ${scale})`}>
        <Box as="div" className={`farming_class2 farming_bg2 ${active && animate ? 'farming_ani2' : ''} `} />
        <Box as="div" className={`farming_class1 farming_bg1 ${active && animate ? 'farming_ani1' : ''} `} />
      </Box>
    </Box>
  )
}

export default FarmingIcon
export { FarmingImage }
