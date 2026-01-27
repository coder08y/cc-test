import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Button, HStack, Switch, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import SearchAssetsInput from './SearchAssetsInput'

type FilterAssetsProps = {
  inputValue: string
  changeInputValue: (value: string) => void
  isShowUnknownCoin: boolean
  handleIsShowUnknownCoin: (event: React.ChangeEvent<HTMLInputElement> | boolean) => void
  isHideLowAsset: boolean
  handleIsHideLowAsset: (event: React.ChangeEvent<HTMLInputElement> | boolean) => void
  unknownCoinCount: number
  filterUnknownCoinCount: number
}

function FilterAssets({
  inputValue,
  changeInputValue,
  isShowUnknownCoin,
  handleIsShowUnknownCoin,
  isHideLowAsset,
  handleIsHideLowAsset,
  unknownCoinCount,
  filterUnknownCoinCount
}: FilterAssetsProps) {
  const { isApp } = useWindowWidth()
  const navigate = useNavigate()
  const baseTextProps = {
    // letterSpacing: '0.3px',
    fontSize: '14px',
    whiteSpace: 'nowrap'
  }

  const renderUnknownCoinCount = () => {
    const showFiltered = isShowUnknownCoin && (isHideLowAsset || inputValue)
    return showFiltered ? (
      <HStack gap="0" ml="-4px">
        <Text {...baseTextProps} color={isApp && isShowUnknownCoin ? 'primary' : 'text_caption'}>
          (
        </Text>
        <Text {...baseTextProps} color="primary">
          {filterUnknownCoinCount}
        </Text>
        <Text {...baseTextProps} color={isApp && isShowUnknownCoin ? 'primary' : 'text_caption'}>
          /{unknownCoinCount})
        </Text>
      </HStack>
    ) : (
      <Text ml="-4px" {...baseTextProps} color={isApp && isShowUnknownCoin ? 'primary' : 'text_caption'}>
        ({unknownCoinCount})
      </Text>
    )
  }

  const renderBlock = (
    label: string,
    isChecked: boolean,
    onChange: (event: React.ChangeEvent<HTMLInputElement> | boolean) => void,
    showCount?: React.ReactNode
  ) => (
    <Block
      w={{ base: label === 'Show Unknown Coin' ? '60%' : '40%', lg: 'unset' }}
      borderRadius="8px"
      p={{ base: '0 4px', lg: '0px 8px' }}
      h="40px"
      onClick={isApp ? () => onChange(!isChecked) : undefined}
      bg={isApp ? (isChecked ? 'card_bg' : 'bg_secondary') : 'background'}
    >
      <HStack h="100%" justify={{ base: 'center', lg: 'space-between' }}>
        <Text {...baseTextProps} color={isApp && isChecked ? 'primary' : 'text_caption'}>
          {label}
        </Text>
        {showCount}
        {!isApp && <Switch isChecked={isChecked} onChange={onChange} />}
      </HStack>
    </Block>
  )

  return (
    <HStack w={{ base: '100%', lg: 'unset' }} gap="8px" flexDirection={{ base: 'column', lg: 'row' }}>
      {!isApp && <SearchAssetsInput inputValue={inputValue} changeInputValue={changeInputValue} />}
      {!isApp && (
        <Button
          h="40px"
          w="124px"
          display="flex"
          alignItems="center"
          gap="0px"
          bg="primary"
          borderRadius="8px"
          color="bg_primary"
          cursor="pointer"
          fontSize="14px"
          textAlign="center"
          fontWeight="medium"
          leftIcon={<Icon mr="-4px" xlinkHref="#icon-icon_merge_swap" fontSize="18px" svgFill="bg_primary" />}
          onClick={() => navigate('/merge-swap')}
        >
          Merge Swap
        </Button>
      )}

      <HStack w={{ base: '100%', lg: 'unset' }} justify="space-between">
        {renderBlock('Show Unknown Coin', isShowUnknownCoin, handleIsShowUnknownCoin, renderUnknownCoinCount())}
        {renderBlock('Hide Low Asset', isHideLowAsset, handleIsHideLowAsset)}
      </HStack>
    </HStack>
  )
}

export default FilterAssets
