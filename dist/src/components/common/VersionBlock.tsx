import { CetusTooltip } from '@cetus/design'
import { Text } from '@chakra-ui/react'
import { useState } from 'react'
type VersionBlockProps = {
  blockSize?: 'small' | 'medium' | 'large'
}

const sizeStyles = {
  small: {
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '8px'
  },
  medium: {
    fontSize: '14px',
    padding: '4px 10px',
    borderRadius: '10px'
  },
  large: {
    fontSize: '14px',
    padding: '4px 10px',
    borderRadius: '14px'
  }
}
export default function VersionBlock({ blockSize = 'small' }: VersionBlockProps) {
  const styles = sizeStyles[blockSize]

  const [isOpen, setIsOpen] = useState(false)
  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(true)
  }
  const isTrue = true
  return (
    <CetusTooltip
      showTooltip={isOpen}
      maxW="340px"
      children={
        <Text
          onMouseEnter={(e: React.MouseEvent) => handleMouseEnter(e)}
          bg="primary_opacity.10"
          lineHeight="1"
          fontSize={styles.fontSize}
          color="primary"
          p={styles.padding}
          borderRadius={styles.borderRadius}
        >
          Frozen
        </Text>
      }
      tooltip={
        <Text fontSize="12px" lineHeight="20px">
          The pool is currently frozen pending further processing.
        </Text>
      }
    />
  )
}
