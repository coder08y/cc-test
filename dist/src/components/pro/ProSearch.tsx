import useProHelper from '@/hooks/pro/useProHelper'
import useProListStore from '@/store/pro/list'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, SearchInput } from '@cetus/ui-kit'
import { Box } from '@chakra-ui/react'
import ProTokenSelectModal from './ProTokenSelectModal'

export default function ProSearch() {
  const { isApp } = useWindowWidth()
  const { quickCoin, searchText, setSearchText } = useProListStore()
  const handleInputChange = (value: string) => {
    setSearchText(value)
  }
  const { goToken } = useProHelper()
  return (
    <Box
      w={{ base: 'calc(100vw - 68px)', lg: '260px' }}
      position="relative"
      sx={{
        input: {
          w: '100%',
          cursor: 'pointer',
          borderColor: 'border !important'
        },
        button: {
          w: '100%'
        }
      }}
    >
      <ProTokenSelectModal
        children={
          <SearchInput
            h="36px"
            iconMt="8px"
            borderRadius="8px"
            placeholder="Search tokens"
            searchText={searchText}
            haveDeleteIcon={false}
            onChange={(value: string) => handleInputChange(value)}
          />
        }
        onCoinSelect={(item: any) => goToken(quickCoin?.coin_type, item?.coin_type)}
      />
      {searchText ? (
        <Box w="16px" position="absolute" top="6px" right="10px" onClick={() => handleInputChange('')}>
          <Icon xlinkHref="#icon-icon_close" />
        </Box>
      ) : null}
    </Box>
  )
}
