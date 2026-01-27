import { useEffect, useRef } from 'react'

const GeneralLoading = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current.style
      container.setProperty('--size-loader', '50px')
      container.setProperty('--size-orbe', '10px')
      // Any other custom properties you need to set
    }
  }, [])

  const spotStyle = (index: number): React.CSSProperties => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    animation: `webLoading ease-in-out 1.5s calc(${index} * 0.1s) infinite`,
    opacity: `calc(1 - calc(0.2 * ${index}))`
  })

  const spotAfterStyle: React.CSSProperties = {
    position: 'absolute',
    content: "''",
    top: 0,
    left: 0,
    width: 'var(--size-orbe)',
    height: 'var(--size-orbe)',
    backgroundColor: '#75C8FF', // Use CSS variable or replace with your theme color
    boxShadow: '0px 0px 20px 2px #75C8FF', // Use theme color
    borderRadius: '50%'
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#161616', position: 'relative' }}>
      {/* <div
        ref={containerRef}
        style={{
          width: 'var(--size-loader)',
          height: 'var(--size-loader)',
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-25px',
          marginLeft: '-25px',
          transform: 'rotate(45deg)'
        }}
      >
        {[...Array(5)].map((_, index) => (
          <div key={index} style={spotStyle(index)}>
            <div style={spotAfterStyle} />
          </div>
        ))}
      </div> */}

      <div
        ref={containerRef}
        style={{
          width: '100px',
          height: '100px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-50px',
          marginLeft: '-50px'
        }}
      >
        <img
          src="/images/img-bg-loading.gif"
          alt="icon"
          style={{
            width: '100px',
            height: '100px'
          }}
        />
      </div>
    </div>
  )
}

export default GeneralLoading
