export const useTopButtonStyle = (isApp: boolean) => {
  return {
    variant: 'outline',
    bg: 'bg_secondary',
    w: isApp ? '18px' : '32px',
    h: isApp ? '18px' : '32px',
    borderRadius: '8px',
    p: '0 6px',
    color: 'text_paragraph',
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    sx: {
      _hover: {
        color: 'text_caption'
        // svg: {
        //   fill: 'text_caption'
        // }
      },
      ...(isApp && {
        border: 'none',
        bg: 'transparent'
      })
    }
  }
}
