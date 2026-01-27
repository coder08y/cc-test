import { cancelBubble } from '@cetus/utils'
import {
  Center,
  CircularProgress,
  CircularProgressProps,
  HTMLChakraProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger
} from '@chakra-ui/react'
import { useInterval } from 'ahooks'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface FreshProgressProps extends HTMLChakraProps<'div'> {
  callbackInterval?: number
  min: number
  max: number
  onClick: () => void
  size?: string
  noBg?: boolean
  thickness?: CircularProgressProps['thickness']
}

export interface FreshProgressRef {
  reset: () => void
}

const FreshProgressV2 = forwardRef<FreshProgressRef, FreshProgressProps>(
  ({ callbackInterval = 20, min, max, onClick, size = '18px', noBg, thickness = '10px', ...rest }, ref) => {
    const [refreshCount, setRefreshCount] = useState<number>(0)

    // Expose reset method to parent via ref
    useImperativeHandle(ref, () => ({
      reset: () => setRefreshCount(0)
    }))

    // Interval for auto-increment

    const clear = useInterval(() => {
      setRefreshCount(prev => {
        const newCount = prev + 1
        if (newCount >= callbackInterval) {
          onClick()
          return 0 // Reset after calling onClick
        }
        return newCount
      })
    }, 1000)

    useEffect(() => {
      return () => {
        clear()
      }
    }, [])

    return (
      <>
        {noBg ? (
          <Center
            p="2px"
            cursor="pointer"
            onClick={e => {
              cancelBubble(e)
              setRefreshCount(0) // Reset on manual click
              onClick()
            }}
          >
            <CircularProgress
              min={min}
              max={max}
              value={refreshCount}
              size={size}
              color="text_highlight"
              trackColor="circle_progress_track_color"
              thickness={thickness}
            />
          </Center>
        ) : (
          <Popover isLazy trigger="hover" autoFocus={false} returnFocusOnClose={false} gutter={4}>
            <PopoverTrigger>
              <Center
                w="28px"
                h="28px"
                border="1px solid"
                borderColor="border"
                borderRadius="8px"
                bg="bg_secondary"
                cursor="pointer"
                {...rest}
                onClick={() => {
                  setRefreshCount(0) // Reset on manual click
                  onClick()
                }}
              >
                <CircularProgress
                  min={min}
                  max={max}
                  value={callbackInterval == 5 ? 0 : refreshCount}
                  size={size}
                  color="text_highlight"
                  trackColor="circle_progress_track_color"
                />
              </Center>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverBody p="12px" lineHeight="20px" fontSize="12px">
                Auto refresh in {callbackInterval} seconds, you can click to update manually.
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )}
      </>
    )
  }
)

export default FreshProgressV2
