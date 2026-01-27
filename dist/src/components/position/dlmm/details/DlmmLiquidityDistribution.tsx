import FunnelPrice from '@/components/common/FunnelPrice'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { CetusTooltip } from '@cetus/design'
import SelectTab from '@cetus/design/src/components/common/SelectTab'
import { Icon } from '@cetus/ui-kit'
import { formatSmallPrice, isAvailableObject, removeComma, textEllipses } from '@cetus/utils'
import { BinAmount } from '@cetusprotocol/dlmm-sdk'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import DlmmPosChart from '../chart/DlmmPosChart'

export default function DlmmLiquidityDistribution({ positionApr, isAprLoading }: { positionApr: string; isAprLoading: boolean }) {
  const { dlmmCurrentPosBaseInfo, dlmmPosPoolsRelatedData, dlmmPosLiquidityData } = useDlmmPositionStore()
  const { setDlmmPosDetailDirect, dlmmPosDetailDirect } = useDlmmPosDetailStore()
  const { dlmmApiPoolInfo } = useDlmmLiquidityStore()
  const [poolBinList, setPoolBinList] = useState<BinAmount[]>([])
  const [currentType, setCurrentType] = useState<'24H' | '7D' | '30D'>('30D')

  const displayQuoteToken = useMemo(() => {
    return dlmmPosDetailDirect ? dlmmCurrentPosBaseInfo?.displayTokenB : dlmmCurrentPosBaseInfo?.displayTokenA
  }, [dlmmCurrentPosBaseInfo, dlmmPosDetailDirect])

  const displayBaseToken = useMemo(() => {
    return dlmmPosDetailDirect ? dlmmCurrentPosBaseInfo?.displayTokenA : dlmmCurrentPosBaseInfo?.displayTokenB
  }, [dlmmCurrentPosBaseInfo, dlmmPosDetailDirect])

  const currentPosRelatedData = useMemo(() => {
    return dlmmPosPoolsRelatedData?.[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosPoolsRelatedData])

  const currentPosLiquidityData = useMemo(() => {
    return dlmmPosLiquidityData?.[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosLiquidityData])

  const [currentRangeTab, setCurrentRangeTab] = useState<string>()

  useEffect(() => {
    if (displayBaseToken) {
      const coinType = displayBaseToken?.coin_type
      setCurrentRangeTab(coinType)
    }
  }, [displayBaseToken?.coin_type])

  const rangeTabList = useMemo(() => {
    if (isAvailableObject(dlmmCurrentPosBaseInfo?.displayTokenA) && isAvailableObject(dlmmCurrentPosBaseInfo?.displayTokenB)) {
      return [dlmmCurrentPosBaseInfo.displayTokenA, dlmmCurrentPosBaseInfo.displayTokenB]?.filter(Boolean).map((item, index) => ({
        label: item?.symbol,
        key: item?.coin_type,
        isToken: true,
        imgInfo: {
          src: item?.logo_url,
          w: '16px',
          h: '16px',
          coinType: item ? item?.coin_type : '',
          showTagWidth: '8px',
          showTagHeight: '8px'
        },
        legend: {
          w: '8px',
          h: '8px',
          borderRadius: '2px',
          bg: index === 0 ? 'dlmm_blue' : 'dlmm_green'
        }
      }))
    } else {
      return []
    }
  }, [dlmmCurrentPosBaseInfo?.displayTokenA, dlmmCurrentPosBaseInfo?.displayTokenB])

  const currentPrice = useMemo(() => {
    return dlmmPosDetailDirect ? currentPosRelatedData?.currentPrice : currentPosRelatedData?.currentPriceReverse
  }, [currentPosRelatedData, dlmmPosDetailDirect])

  const minPrice = useMemo(() => {
    return dlmmPosDetailDirect ? currentPosRelatedData?.minPrice : currentPosRelatedData?.minPriceResever
  }, [currentPosRelatedData, dlmmPosDetailDirect])

  const maxPrice = useMemo(() => {
    return dlmmPosDetailDirect ? currentPosRelatedData?.maxPrice : currentPosRelatedData?.maxPriceResever
  }, [currentPosRelatedData, dlmmPosDetailDirect])

  const shouldLineBreak = useMemo(() => {
    return [currentPrice, minPrice, maxPrice].some(item => item?.length > 10)
  }, [currentPrice, minPrice, maxPrice])

  // const { estimateApr, loading: aprLoading } = useDlmmApr(
  //   poolBinList,
  //   currentPosLiquidityData?.binInfos?.bins || [],
  //   currentType,
  //   currentPosRelatedData?.currentTickIndex,
  //   dlmmApiPoolInfo
  // )

  const poolAllBinObjCallback = (binList: BinAmount[]) => {
    setPoolBinList(binList)
  }

  return (
    <VStack width="100%" bg="bg_secondary" borderRadius="16px" p={{ base: '16px 8px ', lg: '16px' }} gap="16px">
      <HStack width="100%" justifyContent="space-between" align={{ base: 'fle-start', lg: 'center' }} flexDirection={{ base: 'column', lg: 'row' }}>
        <Text color="text_caption" fontSize="16px" mb={{ base: '8px', lg: '0' }}>
          Liquidity Distribution
        </Text>
        <HStack gap="20px" flexDirection={{ base: 'column-reverse', lg: 'row' }} align={{ base: 'fle-start', lg: 'center' }}>
          {!rangeTabList || !rangeTabList.length ? (
            <Skeleton h="32px" borderRadius="8px" w="180px" />
          ) : (
            <SelectTab<any, any>
              type="outlineTab"
              tabList={rangeTabList}
              currentTab={currentRangeTab}
              isActive={(current, tab) => current === tab.key}
              handleChangeTab={() => setDlmmPosDetailDirect(!dlmmPosDetailDirect)}
              wrapStyle={{
                h: '32px',
                p: '3px',
                border: '1px solid',
                borderColor: 'border',
                borderRadius: '8px',
                gap: '4px',
                zIndex: '99'
              }}
              itemStyle={{
                flex: '1',
                h: '24px',
                p: '4px 12px',
                borderRadius: '4px',
                gap: '4px'
              }}
            />
          )}
        </HStack>
      </HStack>
      <HStack w="100%" justify={{ base: 'flex-start', lg: 'center' }}>
        <FunnelPrice
          price={currentPrice}
          perText={`${textEllipses(displayQuoteToken?.symbol, 8)}/${textEllipses(displayBaseToken?.symbol, 8)} `}
          showIcon={false}
        />
      </HStack>
      <DlmmPosChart direct={dlmmPosDetailDirect} isReverse={dlmmCurrentPosBaseInfo?.isReverse} poolAllBinObjCallback={poolAllBinObjCallback} />
      <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
        <VStack
          w={{ base: '100%', lg: '50%' }}
          flexDirection={{ base: 'row', lg: 'column' }}
          justify={{ base: 'space-between', lg: 'center' }}
          alignItems={{ base: 'center', lg: 'flex-start' }}
          flex="1"
          p="12px"
          bg="card_bg"
          borderRadius="8px"
        >
          <Text fontSize="14px" h="20px" lineHeight="20px" whiteSpace="nowrap">
            Price Range
          </Text>
          <Skeleton h="14px" isLoaded={minPrice !== undefined && maxPrice !== undefined}>
            <HStack flexDir={shouldLineBreak ? 'column' : 'row'} alignItems={shouldLineBreak ? 'flex-start' : 'center'}>
              <Text fontSize="14px" color="text_caption">
                {minPrice == maxPrice
                  ? formatSmallPrice(removeComma(minPrice))
                  : `${formatSmallPrice(removeComma(minPrice))} - ${formatSmallPrice(removeComma(maxPrice))}`}
              </Text>
              {/* <Text>
              {displayQuoteToken?.symbol}/{displayBaseToken?.symbol}
            </Text> */}
            </HStack>
          </Skeleton>
        </VStack>
        <VStack
          w={{ base: '100%', lg: '50%' }}
          flexDirection={{ base: 'row', lg: 'column' }}
          justify={{ base: 'space-between', lg: 'center' }}
          alignItems={{ base: 'center', lg: 'flex-start' }}
          flex="1"
          p="12px"
          bg="card_bg"
          borderRadius="8px"
        >
          <HStack w={{ base: 'unset', lg: '100%' }} justify="space-between">
            <CetusTooltip
              tooltip={
                <Text fontSize="12px" lineHeight="20px">
                  APR based on the daily yield accrued by this position. Past performance is not indicative of future results. Calculations are an
                  estimate and only for reference.
                </Text>
              }
            >
              <HStack gap="4px">
                <Text fontSize="14px" h="20px" lineHeight="20px">
                  APR
                </Text>
                <Icon xlinkHref="#icon-icon_tips" fontSize="20px" />
              </HStack>
            </CetusTooltip>
            {/* <HStack pos="relative" h="100%" alignItems="start">
              <DlmmAprSelect currentType={currentType} setCurrentType={setCurrentType} />
            </HStack> */}
          </HStack>
          {/* <EstimatedApr
            loading={aprLoading}
            estimateApr={estimateApr?.fee_apr}
            haveMining={(estimateApr?.miningAprList?.length || 0) > 0}
            miningAprList={estimateApr?.miningAprList}
          /> */}
          <Skeleton isLoaded={!!currentPosRelatedData} h="14px">
            <Text color="primary">{positionApr ?? '--'}</Text>
          </Skeleton>
        </VStack>
        {/* <HStack h="100%" w="100%" padding="8px 12px" bg="card_bg" borderRadius="8px" justifyContent="space-between">
          <VStack align="flex-start" gap="8px" />

          <HStack pos="relative" h="100%" pt="8px" alignItems="start" />
        </HStack> */}
      </HStack>
    </VStack>
  )
}

// const typeByList = [
//   {
//     label: '24H',
//     value: '24H'
//   },
//   {
//     label: '7D',
//     value: '7D'
//   },
//   {
//     label: '30D',
//     value: '30D'
//   }
// ]

// type DlmmAprSelectProps = {
//   currentType: '24H' | '7D' | '30D'
//   setCurrentType: (type: '24H' | '7D' | '30D') => void
// }

// function DlmmAprSelect({ currentType, setCurrentType }: DlmmAprSelectProps) {
//   return (
//     <Menu isLazy placement="bottom-end">
//       {({ isOpen, onClose }) => (
//         <>
//           <MenuButton cursor="pointer" bg="none">
//             <HStack width="100%" justifyContent="space-between" gap="2px">
//               <Text color="text_caption" fontSize="14px">
//                 {currentType}
//               </Text>
//               <Icon
//                 transition="transform 0.5s"
//                 transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
//                 xlinkHref="#icon-icon_descending_nor"
//                 svgFill="text_caption"
//                 svgW="26px"
//                 svgH="26px"
//               />
//             </HStack>
//           </MenuButton>

//           <MenuList bg="bg_secondary" borderRadius="8px" p="4px" opacity="1" overflow="hidden" minW="56px">
//             <VStack w="100%" gap="4px">
//               {typeByList.map(item => (
//                 <MenuItem
//                   key={item.value}
//                   fontSize="12px"
//                   textAlign="center"
//                   borderRadius="4px"
//                   color={currentType === item.value ? 'primary' : '#909CA4'}
//                   onClick={() => setCurrentType(item.value as '24H' | '7D' | '30D')}
//                 >
//                   {item.label}
//                 </MenuItem>
//               ))}
//             </VStack>
//           </MenuList>
//         </>
//       )}
//     </Menu>
//   )
// }
