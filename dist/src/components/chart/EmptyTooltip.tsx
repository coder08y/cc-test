import { Block } from '@cetus/design'
import React from 'react'

const EmptyTooltip = ({ value }: { value?: string | React.ReactNode }) => {
  return (
    <Block fontSize="12px" display={!value ? 'none' : 'block'} p="8px 12px" borderRadius="12px">
      {value}
    </Block>
  )
}

export default EmptyTooltip
