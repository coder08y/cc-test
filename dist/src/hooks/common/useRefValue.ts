import { useEffect, useState } from 'react'

/**
 * Hook to track changes in a ref value
 * @param ref The ref to track (can be undefined)
 * @param checkInterval The interval in milliseconds to check for changes (default: 1000ms)
 * @returns The current value of the ref or undefined if ref is undefined
 */
export function useRefValue<T>(ref: { current: T } | undefined, checkInterval: number = 1000): T | undefined {
  const [value, setValue] = useState<T | undefined>(ref?.current)

  useEffect(() => {
    if (!ref) {
      setValue(undefined)
      return
    }

    const checkValue = () => {
      const currentValue = ref.current
      if (currentValue !== value) {
        setValue(currentValue)
      }
    }

    // Check immediately
    checkValue()

    // Set up interval to check periodically
    const interval = setInterval(checkValue, checkInterval)

    return () => clearInterval(interval)
  }, [ref, value, checkInterval])

  return value
}
