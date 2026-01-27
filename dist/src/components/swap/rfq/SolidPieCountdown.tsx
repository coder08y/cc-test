import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

type SolidPieCountdownProps = {
  totalSeconds: number
  text_color?: string
  text_size?: string
  text_width?: string
  angle_color?: string
  outer_size?: string
  inner_size?: string
  rftCountdownFlag?: number
}

export default function SolidPieCountdown({
  totalSeconds,
  text_color = 'circle_progress_color',
  text_size = '14px',
  text_width = '32px',
  angle_color = '#76C8FF',
  outer_size = '16px',
  inner_size = '10px',
  rftCountdownFlag
}: SolidPieCountdownProps) {
  const percentage = useMemo(() => {
    if (rftCountdownFlag === undefined || totalSeconds <= 0) {
      return 0
    }
    if (rftCountdownFlag <= 0) {
      return 0
    }
    return ((totalSeconds - rftCountdownFlag) / totalSeconds) * 100
  }, [rftCountdownFlag])

  const angle = useMemo(() => `${Math.min(100, Math.max(0, percentage))}%`, [percentage])

  return (
    <HStack gap="0px" justifyContent="center">
      {rftCountdownFlag && rftCountdownFlag > 0 && (
        <Stack
          w={outer_size}
          h={outer_size}
          border="1px solid rgba(118, 200, 255, 0.5)"
          borderRadius="50%"
          overflow="hidden"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            w={inner_size}
            h={inner_size}
            borderRadius="50%"
            background={`conic-gradient(transparent ${angle}, ${angle_color} 0%)`}
            transition="background 0.5s ease"
            filter="blur(0.3px)"
            style={{
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: 'translateZ(0)',
              WebkitPerspective: '1000',
              WebkitFontSmoothing: 'antialiased'
            }}
          />
        </Stack>
      )}

      {rftCountdownFlag && rftCountdownFlag > 0 && (
        <Text w={text_width} lineHeight="24px" textAlign="center" fontSize={text_size} color={text_color}>
          {`${rftCountdownFlag === undefined ? '' : Math.max(0, rftCountdownFlag || 0)}s`}
        </Text>
      )}
    </HStack>
  )
}
