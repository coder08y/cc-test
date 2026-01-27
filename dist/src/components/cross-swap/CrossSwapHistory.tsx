import { Icon } from '@cetus/ui-kit'
import { Button, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'

export default function CrossSwapHistory({ onClick }: { onClick: () => void }) {
  const [isHover, setIsHover] = useState(false)

  return (
    <HStack bg="bg_secondary" borderRadius="8px" border="1px solid" borderColor="border" padding="6px 8px" height="28px">
      <Button
        variant="unstyled"
        display="flex"
        alignItems="center"
        gap="4px"
        cursor="pointer"
        height="unset"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={onClick}
      >
        <Icon
          xlinkHref="#icon-history"
          svgW="14px"
          svgH="14px"
          svgFill={isHover ? 'text_caption' : 'text_paragraph'} // 可根据 hover 切换颜色
        />
        <Text fontSize="12px" color={isHover ? 'text_caption' : 'text_paragraph'}>
          History
        </Text>
      </Button>
    </HStack>
  )
}
