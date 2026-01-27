import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox, VTextLabelBox } from '@cetus/ui-kit'

interface StatsInfoProps {
  label: string
  value: string | JSX.Element
  loading?: boolean
}

function StatsInfo({ label, value, loading }: StatsInfoProps) {
  const { isApp } = useWindowWidth()
  return isApp ? (
    <HTextLabelBox
      label={label}
      value={value}
      labelStyle={{ fontSize: '12px' }}
      valueStyle={{ fontSize: '14px', h: '14px', fontWeight: '500' }}
      isLoading={loading}
      skeletonStyle={{ valueW: '60px', valueH: '14px' }}
      wrapStyle={{
        bg: 'rgba(180,216,240,0.06)',
        flexDirection: 'column',
        w: 'auto',
        minW: '100px',
        justifyContent: 'center',
        alignItems: 'flex-start',
        h: '48px',
        p: '8px',
        borderRadius: '8px',
        gap: '6px',
        sx: {
          '& >div:first-of-type p': {
            fontSize: '10px'
          },
          '&  p': {
            fontSize: '12px'
          }
        }
      }}
    />
  ) : (
    <VTextLabelBox
      wrapStyle={{
        gap: '8px',
        alignItems: 'flex-end'
      }}
      titleStyle={{
        fontSize: '12px'
      }}
      valueStyle={{
        fontSize: '14px',
        fontWeight: '500'
      }}
      title={label}
      value={value}
      isLoading={loading}
      skeletonStyle={{ valueW: '60px', valueH: '14px' }}
    />
  )
}

export default StatsInfo
