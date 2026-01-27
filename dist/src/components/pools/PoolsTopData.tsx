import pool_bg from '@/assets/images/pool_bg.png'
import useStatistics from '@/hooks/stats/useStatistics'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import useStatsStore from '@/store/stats'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, VTextLabelBox } from '@cetus/ui-kit'
import { Box, Button, HStack, Portal, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LpBurnModal from '../position/common/LpBurnModal'
import VolChartPageBlock from '../stats/VolChartPageBlock'
import PoolsTabSelector from './PoolsTabSelector'

interface PoolsTopDataProps {
  isRefreshed: boolean
  onRefreshHandlerRegistered?: (handler: () => Promise<void>) => void
}

function PoolsTopData({ isRefreshed, onRefreshHandlerRegistered }: PoolsTopDataProps) {
  const { tab } = useQueryParams()
  const navigate = useNavigate()
  const [isOpenLpBurnModal, setIsOpenLpBurnModal] = useState<boolean>(false)
  const { statisticsData } = useStatsStore()
  const { setCurrentStep } = useCreatePoolStore()
  const { isApp } = useWindowWidth()
  const { getStatistics } = useStatistics()
  const [isChartRefreshing, setIsChartRefreshing] = useState(false)

  useEffect(() => {
    if (onRefreshHandlerRegistered) {
      const handler = async () => {
        try {
          await getStatistics()
          setIsChartRefreshing(true)
          setTimeout(() => {
            setIsChartRefreshing(false)
          }, 100)
        } catch (error) {
          console.error('Auto refresh top data error:', error)
        }
      }
      onRefreshHandlerRegistered(handler)
    }
  }, [onRefreshHandlerRegistered])

  const [isTooltipOpen, setTooltipOpen] = useState(false)
  const [isMobileButtonsOpen, setIsMobileButtonsOpen] = useState(false)

  const onCreatePool = () => {
    // if (tab === 'dlmm_pools') {
    //   setPoolType('dlmm')
    //   setCurrentStep(2)
    // } else {
    //   setPoolType('clmm')
    //   setCurrentStep(2)
    // }
    setCurrentStep(2)
    navigate(`/create-pool?poolType=${tab === 'dlmm_pools' ? 'dlmm' : 'clmm'}`)
  }

  const onAddLiquidity = () => {
    // if (tab === 'dlmm_pools') {
    //   setPoolType('dlmm')
    // } else {
    //   setPoolType('clmm')
    // }
    navigate(`/select-pool?poolType=${tab === 'dlmm_pools' ? 'dlmm' : 'clmm'}`)
  }

  // 渲染按钮组的通用逻辑
  const renderActionButtons = (buttonWidth: string, onButtonClick?: () => void) => {
    const handleLpBurnClick = () => {
      setTooltipOpen(false)
      setIsOpenLpBurnModal(true)
      onButtonClick?.()
    }

    const handleCreatePoolClick = () => {
      onCreatePool()
      onButtonClick?.()
    }

    const handleAddLiquidityClick = () => {
      onAddLiquidity()
      onButtonClick?.()
    }

    const lpBurnButton = (
      <Tooltip
        isOpen={isTooltipOpen}
        label={
          <Text fontSize="12px" lineHeight="20px">
            Permanently burn/lock liquidity for an existing position. Trading fees and mining rewards earned remain claimable.
          </Text>
        }
        aria-label="Yield"
        placement="top"
      >
        <Button
          w={buttonWidth}
          fontWeight={isApp ? '400' : '500'}
          variant="outline"
          as="div"
          borderRadius={isApp ? '10px' : '8px'}
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          onClick={handleLpBurnClick}
          h={isApp ? '32px' : '40px'}
          fontSize={isApp ? '12px' : '16px'}
        >
          LP Burn
        </Button>
      </Tooltip>
    )

    const createPoolButton = (
      <Button
        borderRadius={isApp ? '10px' : '8px'}
        w={buttonWidth}
        h={isApp ? '32px' : '40px'}
        fontSize={isApp ? '12px' : '16px'}
        fontWeight={'500'}
        variant="outline"
        onClick={handleCreatePoolClick}
      >
        Create a new pool
      </Button>
    )

    const addLiquidityButton = (
      <Button
        borderRadius={isApp ? '10px' : '8px'}
        fontWeight={'500'}
        h={isApp ? '32px' : '40px'}
        fontSize={isApp ? '12px' : '16px'}
        w={buttonWidth}
        onClick={handleAddLiquidityClick}
      >
        Add Liquidity
      </Button>
    )

    return (
      <>
        {tab == 'positions' ? lpBurnButton : createPoolButton}
        {addLiquidityButton}
      </>
    )
  }

  return (
    <VStack w={{ base: '100%', lg: '1160px' }}>
      <HStack
        w="100%"
        gap={{
          base: '12px',
          lg: '32px'
        }}
        p={isApp ? '0 12px' : '0px'}
        flexDirection={{
          base: 'column',
          lg: 'row'
        }}
      >
        <VStack
          w={{
            base: '100%',
            lg: '395px'
          }}
          justify="space-between"
          align="flex-start"
          gap={{
            base: '24px',
            lg: '40px'
          }}
        >
          <Text m={{ base: '4px 0', lg: '0' }} fontSize={isApp ? '22px' : '24px'} fontWeight={isApp ? '600' : '500'} color="text_caption">
            Liquidity Pools
          </Text>
          <VStack
            borderBottom={isApp ? '1px solid' : 'none'}
            borderColor={isApp ? 'border' : 'transparent'}
            gap={isApp ? '0px' : '68px'}
            p={isApp ? '0 0 12px' : '32px 40px'}
            align={{
              base: 'center',
              lg: 'flex-start'
            }}
            borderRadius={isApp ? '0' : '16px'}
            bgImage={isApp ? undefined : pool_bg}
            bgPosition="center"
            w="100%"
            h={isApp ? 'auto' : '240px'}
            backgroundSize="100% 100%"
            flexDirection={isApp ? 'row' : 'column'}
          >
            {[
              {
                title: 'Total Value Locked',
                value: statisticsData?.summary?.totalTvl || '',
                isLoading: !statisticsData
              },
              {
                title: 'Cumulative Volume',
                value: statisticsData?.summary?.cumulativeVol || '',
                isLoading: !statisticsData
              }
            ].map(item => (
              <VTextLabelBox
                key={item.title}
                wrapStyle={{
                  alignItems: 'flex-start',
                  gap: isApp ? '4px' : '12px',
                  flexDirection: isApp ? 'column-reverse' : 'column',
                  ...(isApp && {
                    flex: 1
                  })
                }}
                titleStyle={{
                  fontSize: isApp ? '12px' : '16px',
                  lineHeight: isApp ? '16px' : '1',
                  color: 'text_paragraph'
                }}
                valueStyle={{
                  fontSize: isApp ? '14px' : '20px',
                  lineHeight: isApp ? '18px' : '1',
                  fontWeight: '500'
                }}
                title={item.title}
                value={item.value}
                isLoading={item.isLoading}
              />
            ))}
          </VStack>
        </VStack>
        <Box
          h="100%"
          mb="-4px"
          w={{
            base: '100%',
            lg: 'calc(100% - 395px - 32px)'
          }}
        >
          <VolChartPageBlock
            statisticsData={statisticsData}
            pageFrom="pools"
            isRefresh={!isRefreshed || isChartRefreshing}
            isAutoRefresh={isChartRefreshing}
          />
        </Box>
      </HStack>
      <HStack
        w="100%"
        mt={isApp ? '4px' : '32px'}
        p="0px"
        justify="space-between"
        flexDirection={{
          base: 'column-reverse',
          lg: 'row'
        }}
        // sx={{
        //   ...(isApp && {
        //     top: '48px',
        //     zIndex: 1000,
        //     bg: 'bg_primary',
        //     position: 'sticky'
        //   })
        // }}
      >
        {/* PC端显示 SelectTab */}
        {!isApp && <PoolsTabSelector />}
        {/* 桌面端按钮组 */}
        <HStack w={{ base: '100%', lg: 'unset' }} display={{ base: 'none', lg: 'flex' }}>
          {renderActionButtons('168px')}
        </HStack>
        {/* 移动端按钮组（点击后显示） */}
        {isMobileButtonsOpen && (
          <Portal>
            <>
              {/* 遮罩层 */}
              <Box
                position="fixed"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="rgba(0, 0, 0, 0.75)"
                zIndex={999}
                display={{ base: 'block', lg: 'none' }}
                onClick={() => setIsMobileButtonsOpen(false)}
                opacity={0}
                animation="fadeIn 0.2s ease-in-out forwards"
                sx={{
                  '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 }
                  }
                }}
              />
              {/* 按钮组 */}
              <VStack
                position="fixed"
                bottom="88px"
                right="12px"
                zIndex={1000}
                w="calc(100vw - 32px)"
                maxW="400px"
                gap="8px"
                align="flex-end"
                display={{ base: 'flex', lg: 'none' }}
                opacity={0}
                transform="translateY(20px)"
                animation="slideUp 0.3s ease-out forwards"
                sx={{
                  '@keyframes slideUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)'
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                {renderActionButtons('128px', () => setIsMobileButtonsOpen(false))}
              </VStack>
            </>
          </Portal>
        )}
        {/* 移动端固定右下角的 + 图标按钮 */}
        <Portal>
          <Button
            position="fixed"
            bottom="48px"
            right="12px"
            zIndex={1001}
            w="32px"
            h="32px"
            borderRadius="12px"
            bg={isMobileButtonsOpen ? '#161616' : 'primary'}
            border="1px solid"
            borderColor={isMobileButtonsOpen ? 'border' : 'transparent'}
            color="#000"
            display={{ base: 'flex', lg: 'none' }}
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
            p="0"
            _hover={{
              bg: isMobileButtonsOpen ? '#161616' : 'primary'
            }}
            _active={{
              bg: isMobileButtonsOpen ? '#161616' : 'primary',
              transform: 'scale(0.95)'
            }}
            onClick={() => setIsMobileButtonsOpen(!isMobileButtonsOpen)}
          >
            <Box transform={isMobileButtonsOpen ? 'rotate(45deg)' : 'rotate(0deg)'} transition="transform 0.2s ease-in-out">
              <Icon xlinkHref="#icon-a-icon_add1" svgFill={isMobileButtonsOpen ? 'text_paragraph' : '#000'} fontSize="18px" svgW="18px" svgH="18px" />
            </Box>
          </Button>
        </Portal>
      </HStack>
      {isOpenLpBurnModal && <LpBurnModal isOpen={isOpenLpBurnModal} onClose={() => setIsOpenLpBurnModal(false)} />}
    </VStack>
  )
}

export default PoolsTopData

// const PoolTabs = ({
//   tabList
// }: {
//   tabList: {
//     label: string
//     value: string
//     num: string
//     imgInfo: {
//       src: string
//       w: string
//       h: string
//     }
//   }[]
// }) => {
//   const { tab } = useQueryParams()
//   const { isApp } = useWindowWidth()
//   const navigate = useNavigate()
//   return isApp ? (
//     <HStack w="100%" gap="0" h="58px" borderRadius="12px" bg="bg_secondary" border="1px solid" borderColor="border">
//       {tabList?.map(item => {
//         const isActive = (tab ?? 'clmm_pools') === item?.value
//         return (
//           <VStack
//             key={item?.label}
//             justify="flex-start"
//             flex="1"
//             gap="4px"
//             cursor="pointer"
//             onClick={() => {
//               navigate(`/pools?tab=${item.value}`)
//             }}
//             position="relative"
//             sx={{
//               _before: isActive
//                 ? {
//                     content: "''",
//                     width: '20px',
//                     height: '2px',
//                     background: 'primary',
//                     position: 'absolute',
//                     left: 'calc(50% - 10px)',
//                     bottom: '-10px'
//                   }
//                 : {}
//             }}
//           >
//             <HStack>
//               <Image src={item?.imgInfo?.src} w="16px" h="16px" />
//               <Text fontSize="13px" color={isActive ? 'primary' : 'text_paragraph'}>
//                 {item?.label}
//               </Text>
//             </HStack>
//             {item?.num ? (
//               <Block w="unset" lineHeight="1" ml="8px" p="2px 6px" borderRadius="8px" fontSize="12px" color="primary">
//                 {item?.num}
//               </Block>
//             ) : (
//               <Box as="div" h="18px" />
//             )}
//             <Box pos="absolute" w="20px" h="2px" bg="" />
//           </VStack>
//         )
//       })}
//     </HStack>
//   ) : (
//     <SelectTab
//       type="borderTab"
//       wrapStyle={{
//         w: {
//           base: '100%',
//           lg: '547px'
//         },
//         h: '60px'
//       }}
//       itemStyle={{
//         flex: isApp ? 'auto' : '1',
//         fontSize: isApp ? '13px' : '16px'
//       }}
//       tabList={tabList}
//       currentTab={(tabList?.find(item => item?.value === tab)?.label as string) || 'CLMM'}
//       handleChangeTab={(item: any) => {
//         // if (item.value == 'positions') {
//         //   navigate('/pools?tab=positions')
//         // } else {
//         //   navigate('/pools?tab=pools')
//         // }
//         navigate(`/pools?tab=${item.value}`)
//       }}
//     />
//   )
// }
