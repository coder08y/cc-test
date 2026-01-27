import useProStore from '@/store/pro'
import { CetusTooltip, useTokenSelect } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Icon, Table } from '@cetus/ui-kit'
import { toLongCoinType } from '@cetus/utils'
import { Center, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

function FilterTable({
  isShowDelete,
  isLoading,
  data,
  onRowClick
}: {
  isShowDelete: boolean
  isLoading: boolean
  data: any
  onRowClick: (item: any) => void
}) {
  const { isApp } = useWindowWidth()
  const { userCollectObj, userCollectList } = useTokenSelectStore()
  const { delUserCollectToken, addUserCollectToken, delImportTokenList } = useTokenSelect()
  const { proTokenMap, proTokenStatsMap } = useProStore()
  const [pageLoading, setPageLoading] = useState(false)
  useEffect(() => {
    changeIsLoading(isLoading)
  }, [isLoading])

  const changeIsLoading = (loading: boolean) => {
    setPageLoading(loading)
  }
  return (
    <VStack w="100%" position="relative" gap="16px">
      <Table
        // rowKey="coin_type"
        columns={getColumns({
          proTokenStatsMap,
          proTokenMap,
          isApp,
          userCollectObj,
          userCollectList,
          delUserCollectToken,
          addUserCollectToken,
          delImportTokenList,
          changeIsLoading,
          isShowDelete
        })}
        dataSource={data}
        skeletonLength={3}
        loading={isLoading || pageLoading}
        isFlexStart={true}
        trPadding="8px"
        onRowClick={(item: any) => {
          onRowClick(item)
        }}
        rowStyle={{
          h: '40px',
          cursor: 'pointer'
        }}
      />
    </VStack>
  )
}

const getColumns = ({
  proTokenStatsMap,
  proTokenMap,
  isApp,
  userCollectObj,
  userCollectList,
  delUserCollectToken,
  addUserCollectToken,
  delImportTokenList,
  changeIsLoading,
  isShowDelete
}: {
  proTokenStatsMap: any
  proTokenMap: any
  isApp: boolean
  userCollectObj: any
  userCollectList: any
  delUserCollectToken: (token: any) => void
  addUserCollectToken: (token: any) => void
  delImportTokenList: (token: any) => void
  changeIsLoading: (loading: boolean) => void
  isShowDelete?: boolean
}) => {
  return [
    {
      title: (
        <Text color="primary_gray" fontSize="12px">
          Token
        </Text>
      ),
      key: 'token',
      render: (item: any) => {
        // const tokenInfo = item?.coin_type ? item : proTokenMap?.get(item?.coinType)
        const tokenInfo = item
        return (
          <HStack mr="-16px" justify="flex-start" sx={{ minW: 'unset', p: { margin: '0' } }}>
            <Skeleton isLoaded={!!tokenInfo}>
              <SingleTokenInfo
                haveVerified
                warningIcon={{ isNeedShow: tokenInfo?.isNotBv ? true : false }}
                token={tokenInfo}
                nameEllipsesDecimals={10}
                symbolEllipsesDecimals={8}
                imgBoxStyle={{ w: '24px', h: '24px' }}
                symbolFontSize="14px"
              />
            </Skeleton>
          </HStack>
        )
      }
    },
    {
      title: (
        <Text textAlign="right" color="primary_gray" fontSize="12px">
          Price / 24H%
        </Text>
      ),
      key: 'price24h',
      render: (item: any) => {
        const price = item?.coinType && item?.price ? item?.price : proTokenStatsMap?.get(item?.coin_type || item?.coinType)?.price || '--'
        const priceChange = item?.priceChange ? item?.priceChange : proTokenStatsMap?.get(item?.coin_type || item?.coinType)?.priceChange || '--'
        return (
          <VStack align="flex-end" gap="0">
            <Text fontSize="12px" color="text_caption">
              {price}
            </Text>
            <Text
              fontSize="12px"
              color={priceChange == '--' || Number(priceChange) === 0 ? 'text_caption' : priceChange?.includes('-') ? 'primary_red' : 'primary_green'}
            >
              {priceChange}
            </Text>
          </VStack>
        )
      }
    },
    {
      title: (
        <Text textAlign="right" color="primary_gray" fontSize="12px">
          VOL(24H)
        </Text>
      ),
      key: 'vol24h',
      render: (item: any) => {
        const vol = item?.vol ? item?.vol : proTokenStatsMap?.get(item?.coin_type || item?.coinType)?.vol || '--'
        return (
          <HStack justify="flex-end">
            <Text fontSize="12px" color="text_caption">
              {vol}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: <></>,
      key: 'action',
      render: (item: any) => (
        <HStack justify="flex-end" gap="4px" mr="-2px">
          {item?.coin_type && userCollectObj[toLongCoinType(item?.coin_type)] ? (
            <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Remove from Watchlisit</Text>}>
              <Center>
                <Icon
                  xlinkHref="#icon-icon_star_sel"
                  svgFill="primary"
                  svgHover="primary"
                  onClick={e => {
                    e.stopPropagation()
                    if (item?.coin_type) {
                      delUserCollectToken(item)
                    }
                  }}
                />
              </Center>
            </CetusTooltip>
          ) : (
            <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Add to Watchlisit</Text>}>
              <Center>
                <Icon
                  xlinkHref="#icon-icon_star"
                  variant="primary"
                  cursor={userCollectList?.length >= 100 ? 'not-allowed' : 'pointer'}
                  onClick={e => {
                    e.stopPropagation()
                    if (item?.coin_type && userCollectList?.length < 100) {
                      addUserCollectToken(item)
                    }
                  }}
                />
              </Center>
            </CetusTooltip>
          )}
          {isShowDelete && (
            <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Remove</Text>}>
              <Center>
                <Icon
                  xlinkHref="#icon-icon_del"
                  svgHover="primary"
                  onClick={e => {
                    e.stopPropagation()
                    changeIsLoading(true)
                    delImportTokenList([item])
                  }}
                />
              </Center>
            </CetusTooltip>
          )}
        </HStack>
      )
    }
  ]
}
export default FilterTable
