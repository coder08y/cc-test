import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox } from '@cetus/ui-kit'
import { StackProps } from '@chakra-ui/react'

const InfoItem = ({ label, value, wrapStyle = {} }: { label: string | JSX.Element; value: string | JSX.Element; wrapStyle?: StackProps }) => {
  const { isApp } = useWindowWidth()
  return (
    <HTextLabelBox
      wrapStyle={{
        p: isApp ? '4px 0' : '10px',
        bg: 'background',
        borderRadius: '8px',
        ...wrapStyle
      }}
      label={label}
      labelStyle={{
        fontSize: isApp ? '12px' : '14px',
        whiteSpace: 'nowrap'
      }}
      value={value}
      valueStyle={{
        fontSize: isApp ? '12px' : '14px'
      }}
    />
  )
}

export default InfoItem
