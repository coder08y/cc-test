import { InputBox } from '@cetus/design'
import { HStack, Input, Text, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import MenuDropBlock from '../common/MenuDropBlock'

interface InvestAndOrdersProps {
  title: string | ReactNode
  label: string
  inputValue: string
  inputChange?: (value: string) => void
  list?: string[]
  onListItemClick?: (item: string) => void
}

export default function InvestAndOrders({
  title,
  label,
  inputValue,
  inputChange = () => {},
  list = [],
  onListItemClick = () => {}
}: InvestAndOrdersProps) {
  // 处理输入值的变化
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^\d]/g, '') // 去掉非数字字符
    inputChange(value)
  }
  return (
    <InputBox w="50%" borderRadius="16px">
      <VStack gap="16px" align="flex-start">
        {typeof title === 'string' ? (
          <Text fontWeight="500" lineHeight="18px" fontSize="13px">
            {title}
          </Text>
        ) : (
          title
        )}
        <HStack w="100%" justify="space-between">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            style={{
              width: 'calc(100% - 8px)',
              background: 'none',
              whiteSpace: 'nowrap',
              opacity: 1,
              outline: 'none',
              color: 'var(--chakra-colors-text_caption)',
              fontSize: '20px',
              fontWeight: '500',
              touchAction: 'manipulation',
              transition: 'all 0.3s'
            }}
          />

          {list.length > 0 ? (
            <MenuDropBlock label={label} list={list} onListItemClick={onListItemClick} />
          ) : (
            <Text color="text_caption">{label}</Text>
          )}
        </HStack>
      </VStack>
    </InputBox>
  )
}
