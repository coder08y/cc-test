import { CetusTooltip } from '@cetus/design'
import { CoinPairImage, Icon } from '@cetus/ui-kit'
import { abbreviateTokenName, numericAbbreviation } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { TooltipInfo } from '../common/CoinPairInfo'
import { LeverageTag } from './Margin/LeverageTag'

// 排序类型定义
export type SortType = 'none' | 'asc' | 'desc'
export type SortField = '24hChg' | 'vol24h' | null

export const SortIcons = ({ isActive, sortType }: { isActive: boolean; sortType: SortType }) => {
  return (
    <VStack h="16px" gap="0" cursor="pointer">
      <Icon
        xlinkHref="#icon-icon_ascending_nor"
        svgH="8px"
        svgFill={isActive && sortType === 'asc' ? 'primary' : 'text_paragraph'}
        svgHover="primary"
      />
      <Icon
        xlinkHref="#icon-icon_descending_nor"
        svgH="8px"
        svgFill={isActive && sortType === 'desc' ? 'primary' : 'text_paragraph'}
        svgHover="primary"
      />
    </VStack>
  )
}

export function getColumns(
  isApp: boolean,
  handleToggleFavorite?: ((e: React.MouseEvent, poolAddress: string) => void) | null,
  importDeepBookPool?: (pool: any) => void,
  removeDeepBookPool?: (pool: any) => void,
  isSearch?: boolean,
  key?: string,
  loading?: boolean,
  sortField?: SortField,
  sortType?: SortType,
  handleSort?: (field: SortField) => void,
  selectedPoolAddress?: string | null,
  setSelectedPoolAddress?: (address: string | null) => void
) {
  // 移除 actions 列，不再需要 import 功能
  const actionsColumn = null

  if (isApp) {
    const mobileColumns = [
      {
        title: (
          <Text fontSize="10px" display="flex" alignItems="center" gap="4px" onClick={() => handleSort && handleSort('vol24h')}>
            Pools / 24H Vol
            {<SortIcons isActive={sortField === 'vol24h'} sortType={sortType || 'none'} />}
          </Text>
        ),
        thConfig: {
          w: '70%'
        },
        tdConfig: {
          maxW: '0',
          overflow: 'hidden',
          width: '100%'
        },
        key: 'token',
        render: (item: any) => {
          const volumeSymbol = item?.quoteAssets?.symbol || ''
          return (
            <HStack
              justify="flex-start"
              align="flex-start"
              gap="8px"
              m="-12px 0"
              sx={{
                minW: 'unset',
                p: { margin: '0' }
              }}
            >
              <Skeleton isLoaded={true}>
                <HStack alignItems="center" gap="4px">
                  {
                    <Icon
                      xlinkHref={item?.isFavorite ? '#icon-icon_star_sel' : '#icon-icon_star'}
                      fontSize="20px"
                      svgFill={item?.isFavorite ? 'primary' : 'text_paragraph'}
                      svgHover="primary"
                      sx={{
                        position: 'relative'
                        // top: '2px',
                      }}
                      onClick={e => {
                        handleToggleFavorite?.(e, item.address)
                      }}
                    />
                  }
                  <VStack align="flex-start" spacing="4px" flex="1" minW="0">
                    <HStack gap="6px" align="center" w="100%">
                      <HStack gap="6px" align="center" w="100%">
                        <Box filter={item?.isAbandoned ? 'grayscale(100%)' : 'none'}>
                          <CoinPairImage
                            coinACoinType={item?.baseAssets?.coin_type}
                            coinBCoinType={item?.quoteAssets?.coin_type}
                            coinAIconUrl={item?.baseAssets?.icon_url}
                            coinBIconUrl={item?.quoteAssets?.icon_url}
                            showTagWidth={'12px'}
                            showTagHeight={'12px'}
                            w="20px"
                            h="20px"
                            flexShrink={0}
                          />
                        </Box>

                        <VStack align="flex-start" gap="0px">
                          <HStack align="center" gap="4px" minW="0" flex="1">
                            <Text
                              filter={item?.isAbandoned ? 'grayscale(100%)' : 'none'}
                              fontSize="12px"
                              color="text_caption"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {`${abbreviateTokenName(item?.baseAssets?.symbol) || ''} - ${abbreviateTokenName(item?.quoteAssets?.symbol) || ''}`}
                              {item?.enabled && <LeverageTag leverage={item?.marginRate ? item?.marginRate : 2} showTooltip={true} />}
                            </Text>
                            {item?.isAbandoned && (
                              <Text as="span" fontSize="10px" bg="primary_opacity.10" color="primary" p="2px 4px" borderRadius="4px">
                                Dreprecated
                              </Text>
                            )}
                            <Box filter={item?.isAbandoned ? 'grayscale(100%)' : 'none'} className="tooltip-icon" display="flex">
                              <CetusTooltip
                                showTooltip={true}
                                placement="top"
                                tooltip={
                                  <TooltipInfo
                                    poolInfo={{
                                      poolAddress: item?.address,
                                      displayTokenA: item?.baseAssets,
                                      displayTokenB: item?.quoteAssets
                                    }}
                                  />
                                }
                              >
                                <Icon xlinkHref="#icon-icon_tips" fontSize="18px" svgHover="primary" />
                              </CetusTooltip>
                            </Box>
                          </HStack>
                          <Text fontSize="10px" color="text_paragraph" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                            {`Vol ${item?.isAbandoned ? '--' : numericAbbreviation(item?.vol24hUsdDisplay, 0)}${volumeSymbol ? ` ${volumeSymbol}` : ''}`}
                          </Text>
                          {/* min_borrow_risk_ratio / (min_borrow_risk_ratio - 1) */}
                        </VStack>
                      </HStack>
                    </HStack>
                  </VStack>
                </HStack>
              </Skeleton>
            </HStack>
          )
        }
      },
      {
        title: (
          <Text
            fontSize="10px"
            textAlign="right"
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap="4px"
            onClick={() => handleSort && handleSort('24hChg')}
            position={'relative'}
            right={'-6px'}
          >
            Price / 24H Chg
            {<SortIcons isActive={sortField === '24hChg'} sortType={sortType || 'none'} />}
          </Text>
        ),
        thConfig: {
          w: '40%'
        },
        tdConfig: {
          maxW: '0',
          overflow: 'hidden'
        },
        key: 'price24h',
        render: (item: any) => {
          const priceDisplay = item?.priceDisplay ?? '--'
          const priceChange = item?.priceChange ?? '0%'
          const isNegative = priceChange?.includes('-')
          const changeValue = isNegative ? priceChange?.split('-')[1] : priceChange
          const changeColor = isNegative ? 'primary_red' : priceChange === '0%' ? 'text_caption' : 'primary_green'
          return (
            <VStack align="flex-end" spacing="4px">
              <Text color="text_caption" fontSize="12px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                {priceDisplay}
              </Text>
              <HStack gap="4px" align="center">
                {priceChange !== '0%' && (
                  <Icon
                    fontSize="8px"
                    xlinkHref="#icon-icon_arrow"
                    transition="transform 0.5s"
                    transform={isNegative ? 'rotate(0deg)' : 'rotate(180deg)'}
                    svgFill={isNegative ? 'primary_red' : 'primary_green'}
                    flexShrink={0}
                  />
                )}
                <Text fontSize="10px" color={changeColor} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {item?.isAbandoned ? '--' : changeValue}
                </Text>
              </HStack>
            </VStack>
          )
        }
      }
    ]

    return [...mobileColumns, actionsColumn].filter(Boolean) as any[]
  }

  const desktopColumns = [
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Pool
        </Text>
      ),
      thConfig: {
        w: '60%'
      },
      tdConfig: {
        maxW: '0',
        overflow: 'hidden'
      },
      key: 'token',
      render: (item: any) => {
        return (
          <HStack
            justify="flex-start"
            m="-12px 0"
            sx={{
              minW: 'unset',
              p: { margin: '0' }
            }}
          >
            <Skeleton isLoaded={true}>
              <HStack align="center" gap="4px">
                <Icon
                  xlinkHref={item?.isFavorite ? '#icon-icon_star_sel' : '#icon-icon_star'}
                  fontSize="20px"
                  svgFill={item?.isFavorite ? 'primary' : 'text_paragraph'}
                  svgHover="primary"
                  sx={{
                    position: 'relative',
                    top: '2px'
                  }}
                  onClick={e => {
                    handleToggleFavorite?.(e, item.address)
                  }}
                />
                <HStack
                  sx={{
                    position: 'relative',
                    top: '2px'
                  }}
                >
                  <HStack>
                    <Box filter={item?.isAbandoned ? 'grayscale(100%)' : 'none'}>
                      <CoinPairImage
                        coinACoinType={item?.baseAssets?.coin_type}
                        coinBCoinType={item?.quoteAssets?.coin_type}
                        coinAIconUrl={item?.baseAssets?.icon_url}
                        coinBIconUrl={item?.quoteAssets?.icon_url}
                        showTagWidth={'12px'}
                        showTagHeight={'12px'}
                        w="20px"
                        h="20px"
                        flexShrink={0}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap="2px">
                      <Text
                        filter={item?.isAbandoned ? 'grayscale(100%)' : 'none'}
                        fontSize="12px"
                        color="text_caption"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {`${abbreviateTokenName(item?.baseAssets?.symbol) || ''} - ${abbreviateTokenName(item?.quoteAssets?.symbol) || ''}`}
                      </Text>
                      {item?.enabled && <LeverageTag leverage={item?.marginRate ? item?.marginRate : 2} showTooltip={true} />}
                      {item?.isAbandoned && (
                        <Text ml="4px" as="span" fontSize="10px" bg="primary_opacity.10" color="primary" p="2px 4px" borderRadius="4px">
                          Dreprecated
                        </Text>
                      )}
                      <Box
                        // filter={item?.isAbandoned ? 'grayscale(100%)' : 'none'}
                        className="tooltip-icon"
                        display="flex"
                        visibility={isApp ? 'visible' : 'hidden'}
                        pointerEvents={isApp ? 'auto' : 'none'}
                      >
                        <CetusTooltip
                          showTooltip={true}
                          placement="top"
                          tooltip={
                            <TooltipInfo
                              poolInfo={{
                                poolAddress: item?.address,
                                displayTokenA: item?.baseAssets,
                                displayTokenB: item?.quoteAssets
                              }}
                            />
                          }
                        >
                          <Icon xlinkHref="#icon-icon_tips" fontSize="18px" svgHover="text_caption" />
                        </CetusTooltip>
                      </Box>
                    </Box>
                  </HStack>
                </HStack>
              </HStack>
            </Skeleton>
          </HStack>
        )
      }
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500" textAlign="right">
          Price
        </Text>
      ),
      thConfig: {
        w: '20%'
      },
      tdConfig: {
        maxW: '0',
        overflow: 'hidden'
      },
      key: 'price24h',
      render: (item: any) => {
        const priceDisplay = item.priceDisplay ?? '--'
        return (
          <HStack gap="0" justify="flex-end">
            <Text color="text_caption" fontSize="12px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {priceDisplay}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: (
        <Box display="flex" alignItems="center" justifyContent="flex-end" onClick={() => handleSort && handleSort('24hChg')}>
          <Text fontSize="12px" fontWeight="500" textAlign="right">
            24H Chg
          </Text>
          {<SortIcons isActive={sortField === '24hChg'} sortType={sortType || 'none'} />}
        </Box>
      ),
      thConfig: {
        w: '20%'
      },
      tdConfig: {
        maxW: '0',
        overflow: 'hidden'
      },
      key: '24hChg',
      render: (item: any) => {
        const priceChange = item.priceChange
        return (
          <HStack gap="2px" justify="flex-end" pr="4px">
            {priceChange !== '0%' && !item?.isAbandoned && (
              <Icon
                fontSize="12px"
                xlinkHref="#icon-icon_arrow"
                transition="transform 0.5s"
                transform={priceChange?.includes('-') ? 'rotate(0deg)' : 'rotate(180deg)'}
                svgFill={priceChange?.includes('-') ? 'primary_red' : 'primary_green'}
                flexShrink={0}
              />
            )}
            <Text
              fontSize="12px"
              color={priceChange?.includes('-') ? 'primary_red' : priceChange === '0%' ? 'text_caption' : 'primary_green'}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {item?.isAbandoned ? '--' : priceChange?.includes('-') ? priceChange?.split('-')[1] : priceChange}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: (
        <Box display="flex" alignItems="center" justifyContent="flex-end" mr="-2px" onClick={() => handleSort && handleSort('vol24h')}>
          <Text fontSize="12px" fontWeight="500" textAlign="right">
            24H Vol
          </Text>
          {<SortIcons isActive={sortField === 'vol24h'} sortType={sortType || 'none'} />}
        </Box>
      ),
      thConfig: {
        w: '20%'
      },
      tdConfig: {
        maxW: '0',
        overflow: 'hidden'
      },
      key: 'vol24h',
      render: (item: any) => {
        // const vol24h = item.vol24h
        return (
          <HStack pr="4px" gap="2px" justify="flex-end">
            <Text fontSize="12px" color="text_caption" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              ${item?.isAbandoned ? '--' : numericAbbreviation(item?.vol24hUsdDisplay || 0, 0)}
            </Text>
          </HStack>
        )
      }
    }
  ]

  return [...desktopColumns, actionsColumn].filter(Boolean) as any[]
}
