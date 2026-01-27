import Loading from '@cetus/design/src/components/common/Loading'
import SelectTab from '@cetus/design/src/components/common/SelectTab'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { SearchInput } from '@cetus/design/src/components/common/tokenSelectModal/SearchInput'
import useTokenSelect from '@cetus/design/src/hook/useTokenSelect'
import { useDebounceFunction } from '@cetus/hooks'
import useGetTokenSource from '@cetus/hooks/src/useGetTokenSource'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenStore from '@cetus/stores/src/token'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Token } from '@cetus/types'
import { CheckBox, NoData } from '@cetus/ui-kit'
import { Box, Center, HStack, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

interface TokenSelectListProps {
  selectToken?: Token // 当前选中的token（单选）
  onClickToken: (token: Token) => void
  whiteTokenList?: Token[]
  excludeTokens?: Token[] // 需要排除的token列表（例如对方已选中的token）
  excludeCoinTypes?: string[] // 需要排除的coin_type列表（字符串数组，更稳定）
}

export default function TokenSelectList({
  selectToken,
  onClickToken,
  whiteTokenList,
  excludeTokens = [],
  excludeCoinTypes: excludeCoinTypesProp
}: TokenSelectListProps) {
  const [inputValue, setInputValue] = useState('')
  const { verifiedTokenMap } = useTokenStore()
  const { isApp } = useWindowWidth()
  const { getTokenSource } = useGetTokenSource()

  const [tokenList, setTokenList] = useState<Token[]>()
  const { sortWithTokenList, filterTokenListFun } = useTokenSelect()
  const { setFilterTokenLoading, importTokenList, filterTokenLoading, filterTokenList } = useTokenSelectStore()

  const debouncedFilter = useDebounceFunction((value: string) => {
    filterTokenListFun(
      value,
      whiteTokenList ? whiteTokenList : Array.from(verifiedTokenMap?.values()),
      whiteTokenList ? [] : importTokenList,
      false,
      whiteTokenList ? false : true
    )
  }, 300)

  const changeInputValue = (value: string) => {
    const regValue = value.replace(/[^[a-zA-Z0-9\s]+$/g, '')
    setInputValue(regValue)
    if (regValue) {
      setFilterTokenLoading(true)
      debouncedFilter(regValue)
    }
  }

  const tabList: Array<{ label: string; value: string }> = [
    {
      label: 'Default',
      value: 'Default'
    },
    {
      label: 'Imported',
      value: 'Imported'
    }
  ]
  const [currentTab, setCurrentTab] = useState('Default')
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    if (!hasTriggered && verifiedTokenMap && verifiedTokenMap.size > 0) {
      setHasTriggered(true)
      // getDefaultTokenList()
      // getImportTokenList()
    }
  }, [hasTriggered, verifiedTokenMap?.size]) // , getDefaultTokenList, getImportTokenList

  // 优先使用 excludeCoinTypesProp（如果提供），否则从 excludeTokens 计算
  // 这样可以避免 excludeTokens 数组引用变化导致的问题
  // 使用字符串化的方式稳定依赖项
  const excludeCoinTypesPropStr = useMemo(() => {
    if (!excludeCoinTypesProp || excludeCoinTypesProp.length === 0) {
      return ''
    }
    return excludeCoinTypesProp
      .map((t: string) => t.toLocaleLowerCase())
      .sort()
      .join(',')
  }, [excludeCoinTypesProp?.length, excludeCoinTypesProp?.sort().join(',')])

  const excludeTokensStr = useMemo(() => {
    if (!excludeTokens || excludeTokens.length === 0) {
      return ''
    }
    return excludeTokens
      .map(t => t.coin_type?.toLocaleLowerCase())
      .filter(Boolean)
      .sort()
      .join(',')
  }, [
    excludeTokens?.length,
    excludeTokens
      ?.map(t => t.coin_type?.toLocaleLowerCase())
      .filter(Boolean)
      .sort()
      .join(',')
  ])

  const excludeCoinTypes = useMemo(() => {
    // 优先使用 excludeCoinTypesProp
    if (excludeCoinTypesPropStr) {
      return excludeCoinTypesPropStr.split(',').filter(Boolean)
    }
    // 否则使用 excludeTokens
    if (excludeTokensStr) {
      return excludeTokensStr.split(',').filter(Boolean)
    }
    return []
  }, [excludeCoinTypesPropStr, excludeTokensStr])

  // 过滤掉需要排除的token
  const filterExcludedTokens = (tokens: Token[]) => {
    if (excludeCoinTypes.length === 0) {
      return tokens
    }
    return tokens.filter(token => {
      const coinType = token.coin_type?.toLocaleLowerCase()
      return !excludeCoinTypes.includes(coinType)
    })
  }

  useEffect(() => {
    if (filterTokenLoading) {
      setTokenList([])
      return
    }

    let result: Token[] = []
    if (inputValue) {
      result = filterExcludedTokens(filterTokenList || [])
    } else {
      const defaultList =
        currentTab === 'Default' ? (whiteTokenList ? whiteTokenList : Array.from(verifiedTokenMap?.values() || [])) : importTokenList || []
      const sortedList = sortWithTokenList(defaultList, '', false)
      result = filterExcludedTokens(sortedList)
    }

    console.log(result, 'filterTokenLoading')
    // 只有当列表真正改变时才更新
    setTokenList(prevList => {
      const prevIds = prevList?.map(t => t.coin_type).join(',') || ''
      const newIds = result?.map(t => t.coin_type).join(',') || ''
      if (prevIds === newIds && prevList && prevList.length > 0) {
        return prevList
      }
      return result
    })
  }, [inputValue, filterTokenLoading, currentTab, filterTokenList, importTokenList, whiteTokenList, verifiedTokenMap, excludeCoinTypes])

  return (
    <VStack w="100%" gap="0">
      <VStack w="100%" p="0" borderRadius="12px">
        <Box
          px="12px"
          w="100%"
          sx={{
            '>div': {
              w: '100%',
              '> div': {
                p: 0,
                border: 'none'
              }
            }
          }}
        >
          <Box
            bg="bg_primary"
            p={'0px'}
            borderRadius="8px"
            border="1px solid"
            borderColor="border"
            sx={{
              '& input': {
                ml: '32px'
              },
              '& div > div > div > svg': {
                w: '16px',
                h: '16px'
              }
            }}
          >
            <SearchInput
              h="32px"
              inputValue={inputValue}
              inputFontSize="12px"
              placeholder="Search by token or address"
              changeInputValue={(value: string) => changeInputValue(value)}
              showSearchIcon={true}
            />
          </Box>
        </Box>
        {/* && (!whiteTokenList || (whiteTokenList && whiteTokenList.length == 0)) */}
        {!inputValue && (
          <Box
            w="100%"
            onClick={(e: any) => {
              if (isApp) {
                e.stopPropagation()
              }
            }}
          >
            <SelectTab
              type="borderTab"
              wrapStyle={{
                w: {
                  base: '100%'
                },
                h: '34px',
                bg: 'none',
                border: 'none',
                ...(isApp && {
                  borderBottom: '1px solid',
                  borderColor: 'border !important',
                  borderRadius: '0',
                  px: '12px'
                })
              }}
              itemStyle={{
                marginRight: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}
              tabList={tabList as any}
              currentTab={currentTab}
              handleChangeTab={item => {
                setCurrentTab(item.value || item.label)
                setFilterTokenLoading(true)
                setTimeout(() => {
                  setFilterTokenLoading(false)
                }, 300)
              }}
            />
          </Box>
        )}
      </VStack>

      <Box w="100%" overflow="hidden">
        <VStack
          w="100%"
          gap="0px"
          h={{ base: 'calc(100vh - 360px)', lg: '26vh' }}
          maxH={{ base: 'calc(90vh - 288px)', lg: '350px' }}
          // maxH={isApp ? '45vh' : '350px'}
          minH="210px"
          overflow="auto"
          p="0"
          pb="8px"
          pl="4px"
          pt={{ base: '12px', lg: '0px' }}
          overflowY="scroll"
        >
          {filterTokenLoading ? (
            <Center w="100%" h="200px" position="relative" sx={{ '>div': { bg: 'none' } }}>
              <Loading positionStyle="absolute" />
            </Center>
          ) : tokenList?.length == 0 ? (
            <NoData type="nodata" text="No tokens found" />
          ) : (
            tokenList?.map((token: Token) => {
              const coinType = token?.coin_type
              const isChecked: boolean = selectToken?.coin_type?.toLocaleLowerCase() === coinType?.toLocaleLowerCase()

              const isNeedShowTag = getTokenSource([token]).length > 0
              return (
                <HStack
                  w="100%"
                  justify="space-between"
                  key={token?.coin_type}
                  cursor="pointer"
                  h="46px"
                  minH="46px"
                  p="0 8px"
                  onClick={() => onClickToken(token)}
                  sx={{
                    ...(isChecked && {
                      bg: 'primary_opacity.10',
                      borderRadius: '8px'
                    })
                  }}
                >
                  <SingleTokenInfo
                    haveVerified
                    token={token}
                    imgBoxStyle={isApp ? { w: '20px', h: '20px' } : { w: '28px', h: '28px' }}
                    symbolFontSize="14px"
                    symbolEllipsesDecimals={8}
                    nameEllipsesDecimals={20}
                    warningIcon={{ isNeedShow: isNeedShowTag }}
                    // haveName={isApp ? false : true}
                  />
                  <CheckBox
                    checked={isChecked}
                    onClick={() => {}}
                    wrapStyle={{
                      ...(isApp && {
                        width: '16px',
                        height: '16px',
                        sx: {
                          '& svg': {
                            width: '12px',
                            height: '12px',
                            fill: isChecked ? '#000 !important' : 'transparent !important'
                          }
                        }
                      })
                    }}
                  />
                </HStack>
              )
            })
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
