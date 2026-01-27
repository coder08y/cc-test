import Slippage from '@/components/common/Slippage'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { BothAndZapTabAction } from '@/types/dlmm'
import { SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { BinLiquidityInfo } from '@cetusprotocol/dlmm-sdk'
import { HStack, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import DlmmPositionAdd from './DlmmPositionAdd'
import DlmmPositionRemove from './DlmmPositionRemove'

export default function DlmmPositionAction() {
  const { isApp } = useWindowWidth()
  const {
    setBinInfos,
    setZapLiquidityInfo,
    currentPosDetailTab,
    setCurrentPosDetailTab,
    currAddTabMode,
    setCurrAddTabMode,
    useZapOut,
    setUseZapOut
  } = useDlmmPosDetailStore()
  const { dlmmCurrentPosBaseInfo } = useDlmmPositionStore()
  const tabList = [
    {
      label: 'Add',
      value: 'increase'
    },
    {
      label: 'Remove',
      value: 'remove'
    }
  ]

  useEffect(() => {
    setBinInfos({} as BinLiquidityInfo)
    if (currentPosDetailTab === 'remove') {
      setCurrAddTabMode(BothAndZapTabAction.useBoth)
    } else {
      setUseZapOut(false)
    }
  }, [currentPosDetailTab])

  return (
    <VStack w="100%" p={{ base: '0 8px 16px', lg: '0px 16px 16px' }} borderRadius="16px" bg="card_bg" gap="16px">
      <HStack w="100%" justifyContent="space-between">
        <SelectTab
          type="borderTab"
          bg="none"
          wrapStyle={{
            w: { base: 'auto', lg: '100%' },
            h: '60px',
            border: 'none',
            bg: 'none'
          }}
          itemStyle={{
            w: { base: '50%', lg: 'unset' },
            fontSize: '16px',
            mr: '28px'
          }}
          tabList={tabList}
          currentTab={currentPosDetailTab == 'increase' ? 'Add' : 'Remove'}
          handleChangeTab={(item: any) => {
            setCurrentPosDetailTab(item?.value)
          }}
        />
        {
          <Slippage
            slippageType="liquidity"
            poolType="dlmm"
            tokenA={dlmmCurrentPosBaseInfo?.tokenA || dlmmCurrentPosBaseInfo?.displayTokenA}
            tokenB={dlmmCurrentPosBaseInfo?.tokenB || dlmmCurrentPosBaseInfo?.displayTokenB}
            showNewTolerance={
              (currentPosDetailTab == 'increase' && currAddTabMode === BothAndZapTabAction.zapIn) || (currentPosDetailTab === 'remove' && useZapOut)
            }
          />
        }
      </HStack>
      {currentPosDetailTab == 'increase' ? <DlmmPositionAdd /> : <DlmmPositionRemove />}
    </VStack>
  )
}
