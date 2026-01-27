import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { SelectTab } from '@cetus/design'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useEffect } from 'react'

type PriceRangeBlockProps = {
  wrapStyle?: any
  itemStyle?: any
}

function RangeTab({ wrapStyle, itemStyle }: PriceRangeBlockProps) {
  const { currentRangeTab, setCurrentRangeTab, isDirect, setIsDirect, isPriceDirect, setIsPriceDirect, rangeTabList, setRangeTabList } =
    usePositionDetailStore()
  const { currentPosBaseInfo } = usePositionStore()

  // 计算方向 Calculate direction
  useEffect(() => {
    setIsDirect(fixCoinType(currentRangeTab) === fixCoinType(currentPosBaseInfo?.tokenA?.coin_type || ''))
  }, [currentRangeTab, currentPosBaseInfo?.tokenA?.coin_type])

  useEffect(() => {
    let result: any
    if (currentPosBaseInfo) {
      result = [currentPosBaseInfo?.displayTokenA, currentPosBaseInfo?.displayTokenB]?.filter(Boolean).map(item => ({
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
        }
      }))
    } else {
      result = []
    }
    setRangeTabList(result)
  }, [currentPosBaseInfo?.displayTokenA?.symbol, currentPosBaseInfo?.displayTokenB?.symbol])

  // 初始化当前选中coin标签 Initialize current coin tab
  useEffect(() => {
    if (currentPosBaseInfo) {
      const coinType = currentPosBaseInfo?.displayTokenA?.coin_type
      setCurrentRangeTab(coinType)
    }
  }, [currentPosBaseInfo?.clmmPool])

  // 处理tab反转点击 Handle tab reverse click
  const onReverseClick = (item?: any) => {
    setIsDirect(!isDirect)
    setIsPriceDirect(isPriceDirect == undefined ? false : !isPriceDirect)
    if (item && item?.coin_type) {
      setCurrentRangeTab(item?.coin_type)
    } else {
      setCurrentRangeTab(rangeTabList?.find(tab => tab.key !== currentRangeTab)?.key)
    }
  }

  return (
    <>
      {rangeTabList?.length > 0 && (
        <SelectTab<any, any>
          type="outlineTab"
          tabList={rangeTabList}
          currentTab={currentRangeTab}
          handleChangeTab={tab => onReverseClick(tab)}
          wrapStyle={{
            h: '32px',
            p: '3px',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: '8px',
            gap: '4px',
            zIndex: '99',
            ...wrapStyle
          }}
          itemStyle={{
            h: '24px',
            p: '4px 8px',
            borderRadius: '4px',
            gap: '4px',
            ...itemStyle
          }}
        />
      )}
    </>
  )
}

export default RangeTab
