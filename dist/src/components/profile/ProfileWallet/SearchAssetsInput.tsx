import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react'
import { useRef, useState } from 'react'
type SearchAssetsInputProps = {
  inputValue: string | number | readonly string[] | undefined
  changeInputValue: (value: string) => void
}
function SearchAssetsInput({ inputValue, changeInputValue }: SearchAssetsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputFocus, setInputFocus] = useState(false)
  const { isApp } = useWindowWidth()
  // useEffect(() => {
  //   if (!isApp) {
  //     // 页面加载后自动聚焦
  //     inputRef.current.focus()
  //   }
  // }, [isApp])
  return (
    <InputGroup
      w={isApp ? '100%' : inputFocus ? '203px' : '40px'}
      h="40px"
      transition="width 0.1s ease"
      border="1px solid"
      borderColor="border"
      borderRadius="8px"
    >
      <InputLeftElement top="calc(50% - 10px)" left="9px">
        <Icon
          xlinkHref="#icon-icon_search"
          svgHover="text_paragraph"
          onClick={e => {
            inputRef.current?.focus()
            setInputFocus(true)
          }}
        />
      </InputLeftElement>
      <Input
        bg={{ base: 'bg_secondary', lg: 'background' }}
        ref={inputRef}
        h="38px"
        lineHeight="38px"
        variant="unstyled"
        outline="none"
        borderRadius="8px"
        value={inputValue}
        onChange={e => {
          changeInputValue(e.target.value)
        }}
        onFocus={() => {
          setInputFocus(true)
        }}
        onBlur={() => {
          if (!inputValue) {
            changeInputValue('')
            setInputFocus(false)
          }
        }}
        fontWeight="500"
        textAlign="left"
        fontSize="14px"
        placeholder={isApp ? 'Search tokens' : !inputFocus ? '' : 'Search tokens'}
        _placeholder={{
          color: 'text_paragraph',
          fontSize: '12px'
        }}
        pr={inputFocus || isApp ? '28px' : '8px'}
        pl={inputFocus || isApp ? '36px' : '8px'}
      />
      {inputValue ? (
        <InputRightElement right="5px">
          <Icon
            xlinkHref="#icon-icon_close"
            onMouseDown={e => e.preventDefault()}
            onClick={e => {
              changeInputValue('') // 直接操作 DOM 清空值
              setInputFocus(false)
              inputRef.current?.blur()
              // setTimeout(() => {
              //   inputRef.current?.focus() // 延迟聚焦，确保焦点不丢失
              // }, 0)
            }}
          />
        </InputRightElement>
      ) : null}
    </InputGroup>
  )
}

export default SearchAssetsInput
