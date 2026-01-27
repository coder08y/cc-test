import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useEffect, useState } from 'react'

function useIconActive() {
  const [active, setActive] = useState(false)
  const [animate, setAnimate] = useState(false)
  const { isApp } = useWindowWidth()
  const onMouseOver = () => {
    if (isApp) return
    setActive(true)
  }
  const onMouseOut = () => {
    setActive(false)
  }

  useEffect(() => {
    if (active) {
      setAnimate(true)
    }
  }, [active])

  useEffect(() => {
    if (animate) {
      setTimeout(() => {
        setAnimate(false)
      }, 1000)
    } else {
      if (active) {
        setTimeout(() => {
          setAnimate(true)
        }, 3000)
      }
    }
  }, [animate])
  return {
    active,
    animate,
    onMouseOver,
    onMouseOut
  }
}

export default useIconActive
