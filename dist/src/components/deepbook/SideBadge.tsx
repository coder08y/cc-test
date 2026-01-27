import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HStack, Text } from '@chakra-ui/react'

interface SideBadgeProps {
  side: 'Buy' | 'Sell' | 'Long' | 'Short'
}

const SideBadge = ({ side }: SideBadgeProps) => {
  const colorMap: any = {
    Buy: { color: 'primary_green', bg: 'primary_green_opacity.10' },
    Sell: { color: 'primary_red', bg: 'primary_red_opacity.10' },
    Long: { color: 'primary_green', bg: 'primary_green_opacity.10' },
    Short: { color: 'primary_red', bg: 'primary_red_opacity.10' }
  }

  const { color, bg } = colorMap[side] || { color: 'text_caption', bg: 'transparent' }

  const { isApp } = useWindowWidth()

  const renderText = () => {
    if (isApp) {
      return side?.[0]?.toUpperCase() == 'B' ? 'B' : 'S'
    } else {
      return side?.[0]?.toUpperCase() == 'B' ? 'Buy' : 'Sell'
    }
  }

  return (
    <HStack w="100%" justify="flex-start">
      <Text
        fontSize="12px"
        color={color}
        bg={bg}
        h="20px"
        w={isApp ? '20px' : 'auto'}
        p={!isApp ? '0 8px' : '0'}
        textAlign="center"
        borderRadius="4px"
        lineHeight="20px"
      >
        {renderText()}
      </Text>
    </HStack>
  )
}

export default SideBadge
