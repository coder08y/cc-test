import { Switch, SwitchProps } from '@chakra-ui/react'
import { useTimeout } from 'ahooks'
import { useEffect, useState } from 'react'

function AggregatorSwitch(props: SwitchProps) {
  const [isAnimated, setIsAnimated] = useState(false)

  const clear = useTimeout(() => {
    setIsAnimated(true)
  }, 300)
  useEffect(() => {
    return () => clear()
  }, [])
  return (
    <Switch
      sx={{
        '.chakra-switch__track': {
          p: '0px',
          transitionDuration: isAnimated ? 'var(--chakra-transition-duration-fast) !important' : '0s'
        },
        '.chakra-switch__thumb': {
          transitionDuration: isAnimated ? 'var(--chakra-transition-duration-normal) !important' : '0s'
        }
      }}
      {...props}
    />
  )
}

export default AggregatorSwitch
