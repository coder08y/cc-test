import { Box, Progress } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

interface TopProgressBarProps {
  isLoading?: boolean
}

/**
 * TopProgressBar
 * auto simulate progress, from 0 to 90%, then jump to 100% and reset
 * @param isLoading - is loading
 * @returns TopProgressBar component
 */
export default function TopProgressBar({ isLoading = false }: TopProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentProgressRef = useRef(0)

  useEffect(() => {
    if (isLoading) {
      currentProgressRef.current = 0
      setProgress(0)

      const simulateProgress = () => {
        if (currentProgressRef.current < 90) {
          const increment = 8 + Math.random() * 4
          currentProgressRef.current = Math.min(currentProgressRef.current + increment, 90)
          setProgress(currentProgressRef.current)

          progressTimerRef.current = setTimeout(simulateProgress, 100)
        }
      }

      simulateProgress()
    } else {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current)
        progressTimerRef.current = null
      }

      if (currentProgressRef.current > 0 && currentProgressRef.current < 100) {
        currentProgressRef.current = 100
        setProgress(100)

        progressTimerRef.current = setTimeout(() => {
          currentProgressRef.current = 0
          setProgress(0)
          progressTimerRef.current = null
        }, 200)
      } else if (currentProgressRef.current === 0) {
        setProgress(0)
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [isLoading])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '2px',
        width: '100vw',
        opacity: progress > 0 ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
      }}
    >
      <Progress
        value={progress}
        w="100%"
        h="100%"
        sx={{
          '& > div': {
            bg: 'transparent'
          },
          '& > div[role="progressbar"]': {
            background: 'linear-gradient(90deg, #0095FF 0%, rgba(0, 217, 255, 0.4) 100%)',
            transition: 'width 0.1s linear'
          }
        }}
      />
    </Box>
  )
}
