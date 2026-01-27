import CoinPairInfo from '@/components/common/CoinPairInfo'
import useGlobalStore from '@/store/common/global'
import usePoolsStore from '@/store/pool'
import usePositionStore from '@/store/position'
import { showNewVersionApr } from '@/types/position'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble, d } from '@cetus/utils'
import { Box, Button, Collapse, HStack, Image, Stack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileSortButton from '../../common/MobileSortButton'
import MobileSortDrawer, { SortOption } from '../../common/MobileSortDrawer'
import PositionCurrentPrice from '../../common/PositionCurrentPrice'
import PositionItem from './PositionItem'

function CLMMPoolItem({ poolInfo, showDivider }: { poolInfo: any; showDivider?: boolean }) {
  const navigate = useNavigate()
  const { posPoolsRelatedData, posApiPoolData } = usePositionStore()
  const { isExpendPositionMap, setIsExpendPosition } = usePoolsStore()

  const haveFarming = posApiPoolData[poolInfo?.clmmPoolAddress]?.haveFarming
  const feeDisplay = (posPoolsRelatedData[poolInfo?.list?.[0]?.posId]?.displayFee || '--') + '%'

  const { setBackUrl } = useGlobalStore()

  const [priceDirect, setPriceDirect] = useState(true)
  const { isApp } = useWindowWidth()

  const isExpand = useMemo(() => {
    return isExpendPositionMap[poolInfo?.clmmPoolAddress] ?? false
  }, [isExpendPositionMap])

  const onExpand = () => {
    setIsExpendPosition([poolInfo?.clmmPoolAddress], !isExpand)
  }

  // 移动端排序相关逻辑
  const SORT_BY_LIST = showNewVersionApr
    ? [
        { label: 'APR', value: 'apr' },
        { label: 'Liquidity', value: 'liquidity' },
        { label: 'Claimable Yield', value: 'yield' },
        { label: 'Est. Daily Yield', value: 'dailyEarn' },
        { label: 'Actions', value: 'actions' }
      ]
    : [
        { label: 'APR', value: 'apr' },
        { label: 'Liquidity', value: 'liquidity' },
        { label: 'Pending Fees', value: 'fees' },
        { label: 'Pending Rewards', value: 'rewards' },
        { label: 'Actions', value: 'actions' }
      ]

  // 从 poolInfo.list 计算初始的 mining 和 farming 状态（用于初始化排序列表）
  const hasPositiveAmountFromPool = useCallback(
    (key: 'totalMiningAmount' | 'totalFarmingAmount') => {
      return (poolInfo?.list || []).some((item: any) => d(item[key]).gt(0))
    },
    [poolInfo?.list]
  )

  const initialShowMiningIcon = useMemo(() => hasPositiveAmountFromPool('totalMiningAmount'), [hasPositiveAmountFromPool])
  const initialShowFarmingIcon = useMemo(() => hasPositiveAmountFromPool('totalFarmingAmount'), [hasPositiveAmountFromPool])

  // 统一的排序项过滤函数：判断某个排序项是否应该显示
  const shouldShowSortItem = useCallback(
    (item: SortOption, hasMining: boolean, hasFarming: boolean) => {
      // 排除 actions 项（不可排序）
      if (item.value === 'actions') {
        return false
      }
      // 对于 rewards（旧版本）或 yield（新版本），只有当有 mining 或 farming icon 时才显示
      if (showNewVersionApr) {
        if (item.value === 'yield') {
          return hasMining || hasFarming
        }
      } else {
        if (item.value === 'rewards') {
          return hasMining || hasFarming
        }
      }
      return true
    },
    [showNewVersionApr]
  )

  // 移动端排序列表：排除 actions，并根据条件过滤 rewards/yield
  const [mobileSortByList, setMobileSortByList] = useState<SortOption[]>(() => {
    return SORT_BY_LIST.filter(item => shouldShowSortItem(item, initialShowMiningIcon, initialShowFarmingIcon))
  })

  // 接收子组件传递的动态更新的排序列表
  const handleSortListChange = useCallback((list: SortOption[]) => {
    setMobileSortByList(list)
  }, [])

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const firstAvailable =
      mobileSortByList.length > 0 ? mobileSortByList[0] : SORT_BY_LIST.find(item => item.value !== 'actions') || { label: '', value: '' }
    return firstAvailable
  })

  const [sortRule, setSortRule] = useState<'asc' | 'desc'>('desc')
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false)

  const handleSortConfirm = (item: SortOption, rule: 'asc' | 'desc') => {
    setSortBy(item)
    setSortRule(rule)
  }

  // PC端排序变化时的回调
  const handlePCSortChange = (item: SortOption, rule: 'asc' | 'desc') => {
    setSortBy(item)
    setSortRule(rule)
  }

  return (
    <Block
      w="100%"
      p={{ base: '0', lg: isExpand ? '12px 16px 16px' : '12px 16px 8px' }}
      borderRadius={{ base: '0', lg: '16px' }}
      border={{ base: 'none', lg: '1px solid' }}
      borderColor={{ base: 'transparent', lg: 'border' }}
    >
      <VStack w="100%" gap="12px">
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          w="100%"
          gap={{ base: '0px', lg: '8px' }}
          cursor="pointer"
          onClick={onExpand}
          bg={{ base: isExpand ? 'primary_opacity.10' : 'background', lg: 'transparent' }}
          p={{ base: '0 12px 12px', lg: 0 }}
          margin={{}}
        >
          {/* <PoolShowInfo
            symbolFontWeight="500"
            symbolFontSize="16px"
            symbolEllipsesDecimals={10}
            nameEllipsesDecimals={20}
            poolInfo={{ feeDisplay, ...poolInfo }}
            haveName
            haveFarming={haveFarming}
          /> */}
          <HStack justify={{ base: 'space-between', lg: 'flex-start' }} align={{ base: 'start', lg: 'center' }}>
            <CoinPairInfo
              type="column"
              poolType="clmm"
              symbolFontWeight="500"
              symbolFontSize={isApp ? '12px' : '16px'}
              symbolEllipsesDecimals={10}
              nameEllipsesDecimals={20}
              poolInfo={{ feeDisplay, ...poolInfo, poolAddress: poolInfo?.clmmPoolAddress }}
              haveFarming={haveFarming}
              versionBlockPosition="right"
              showPoolTypeTag
              moreDetails
              clickFun={() => navigate(`/clmm?poolAddress=${poolInfo?.clmmPoolAddress}`)}
              imgStyle={{
                w: { base: '24px', lg: '32px' },
                h: { base: '24px', lg: '32px' },
                showTagHeight: isApp ? '12px' : '16px',
                showTagWidth: isApp ? '12px' : '16px'
              }}
            />
            {/* 加个排序触发图标按钮 */}
            {isApp && <MobileSortButton sortBy={sortBy} sortRule={sortRule} onClick={() => setIsSortDrawerOpen(true)} />}
            {/* 加个排序触发图标按钮 -end */}
          </HStack>
          <HStack flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '12px', lg: '8px' }}>
            <PositionCurrentPrice
              symbolEllipsesDecimals={10}
              posId={poolInfo?.list?.[0]?.posId}
              displayTokenA={poolInfo?.displayTokenA}
              displayTokenB={poolInfo?.displayTokenB}
              handleDirect={() => setPriceDirect(!priceDirect)}
              iconStyle={{
                w: { base: '20px', lg: '32px' },
                h: { base: '20px', lg: '32px' }
              }}
              wrapStyle={{
                mr: '0px',
                w: { base: '100%', lg: 'unset' },
                justify: 'flex-start',
                flexWrap: 'nowrap',
                gap: '8px'
              }}
            />

            <HStack w={{ base: '100%', lg: 'unset' }} flexDirection="row" justify="space-between">
              <Button
                onClick={e => {
                  cancelBubble(e)
                  setBackUrl('/pools?tab=positions')
                  navigate(`/clmm?poolAddress=${poolInfo?.clmmPoolAddress}`)
                }}
                borderRadius={{ base: '10px', lg: '8px' }}
                w="unset"
                p={{ base: '0 8px', lg: '0 12px' }}
                h={{ base: '20px', lg: '32px' }}
                fontWeight="500"
                variant="outline"
                bg="primary_opacity.10"
                fontSize={{ base: '10px', lg: '12px' }}
                borderColor={{ base: 'transparent', lg: 'border' }}
              >
                {isApp && <Image w="14px" h="14px" src="/images/icon_add.png" mr="4px" />}Create Position
              </Button>
              <Block
                cursor="pointer"
                w="unset"
                p={{ base: '0', lg: '4px 0 4px 8px' }}
                h={{ base: '20px', lg: '32px' }}
                borderRadius={{ base: '10px', lg: '8px' }}
                bg="none"
                border="none"
                _hover={{
                  svg: { fill: 'text_caption' },
                  p: { color: 'text_caption' }
                }}
              >
                <HStack justify="center" w="100%" h="100%" gap="4px">
                  <Box
                    p={{ base: '3px 8px', lg: '0' }}
                    bg={{ base: 'primary_opacity.10', lg: 'transparent' }}
                    borderRadius={{ base: '10px', lg: '8px' }}
                  >
                    <Text fontSize={{ base: '10px', lg: '12px' }} color={{ base: 'text_caption', lg: 'text_paragraph' }}>
                      {poolInfo?.list?.length} {poolInfo?.list?.length > 1 ? 'Positions' : 'Position'}
                    </Text>
                  </Box>

                  <Icon
                    xlinkHref="#icon-icon_descending_nor"
                    fontSize="20px"
                    transition="transform 0.5s"
                    transform={isExpand ? 'rotate(-180deg)' : 'rotate(0deg)'}
                  />
                </HStack>
              </Block>
            </HStack>
          </HStack>
        </Stack>
        <Collapse
          unmountOnExit
          animateOpacity
          in={isExpand}
          style={{ width: '100%' }}
          transition={{
            enter: { duration: 0.2, ease: 'easeOut' },
            exit: { duration: 0.2, ease: 'easeIn' }
          }}
        >
          <PositionItem
            poolInfo={poolInfo}
            priceDirect={priceDirect}
            sortBy={sortBy}
            sortRule={sortRule}
            onSortChange={handlePCSortChange}
            onSortListChange={handleSortListChange}
          />
        </Collapse>
      </VStack>
      {isExpand || !showDivider ? null : <Box h="1px" bg="border" />}
      {/* 移动端排序抽屉 */}
      {isApp && (
        <MobileSortDrawer
          isOpen={isSortDrawerOpen}
          onClose={() => setIsSortDrawerOpen(false)}
          sortText="Sort by"
          currentSort={sortBy}
          currentSortRule={sortRule}
          sortByList={mobileSortByList}
          onConfirm={handleSortConfirm}
        />
      )}
    </Block>
  )
}

export default CLMMPoolItem
