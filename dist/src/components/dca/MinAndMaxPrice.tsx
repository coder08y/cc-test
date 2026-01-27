import useDcaStore from '@/store/dca'
import { InputBox } from '@cetus/design'
import { NumericFormatInput } from '@cetus/ui-kit'
import { HStack, Text, VStack } from '@chakra-ui/react'

interface InvestAndOrdersProps {
  text?: string
  inputValue: string
  inputChange: (value: string) => void
  align: string
  direct: boolean
}

export default function MinAndMaxPrice({ direct, text, align, inputValue, inputChange = () => {} }: InvestAndOrdersProps) {
  const { sellCoin, buyCoin } = useDcaStore()
  return (
    <InputBox w="unset" borderRadius="8px">
      <HStack>
        <VStack align={align}>
          <NumericFormatInput
            value={inputValue}
            placeholder="0.0"
            decimals={18}
            onChange={value => inputChange(value)}
            style={{
              width: 'calc(100% - 8px)',
              textAlign: align == 'flex-start' ? 'left' : 'right',
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
          <HStack w="100%" justify="space-between">
            <Text fontSize="12px" fontWeight="500">
              {direct ? `${buyCoin?.symbol} per ${sellCoin?.symbol}` : `${sellCoin?.symbol} per ${buyCoin?.symbol}`}
            </Text>
            {text && (
              <Text fontSize="12px" fontWeight="500">
                {text}
              </Text>
            )}
          </HStack>
        </VStack>
      </HStack>
    </InputBox>
  )
}
