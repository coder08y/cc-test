import icon_clmm from '@/assets/images/icon_clmm.png'
import icon_dlmm from '@/assets/images/icon_dlmm.png'
import icon_positions from '@/assets/images/icon_positions@2x.png'
import usePoolsStore from '@/store/pool'
import useDlmmPoolsStore from '@/store/pool/useDlmmPoolStore'
import usePositionStore from '@/store/position'
import { SelectTab } from '@cetus/design'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d } from '@cetus/utils'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function PoolsTabSelector() {
  const { tab } = useQueryParams()
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  const { poolListLength } = usePoolsStore()
  const { dlmmPoolListLength } = useDlmmPoolsStore()
  const { showPosListLength } = usePositionStore()

  const totalPositionsNum = d(showPosListLength?.clmm_position_count ?? 0)
    .plus(showPosListLength?.dlmm_position_count ?? 0)
    .toString()

  const tabList = useMemo(() => {
    return [
      {
        label: 'CLMM',
        value: 'clmm_pools',
        num: tab === undefined || tab === 'clmm_pools' ? poolListLength : '',
        imgInfo: isApp
          ? undefined
          : {
              src: icon_clmm,
              w: isApp ? '16px' : '22px',
              h: isApp ? '16px' : '22px'
            }
      },
      {
        label: 'DLMM',
        value: 'dlmm_pools',
        // beta: true,
        // betaUrl: '/images/icon_beta@2x.png',
        num: tab === 'dlmm_pools' ? dlmmPoolListLength : '',
        imgInfo: isApp
          ? undefined
          : {
              src: icon_dlmm,
              w: isApp ? '16px' : '22px',
              h: isApp ? '16px' : '22px'
            }
      },
      {
        label: isApp ? 'Positions' : 'My Positions',
        value: 'positions',
        num: tab === 'positions' && d(totalPositionsNum).gt(0) ? totalPositionsNum : '',
        imgInfo: isApp
          ? undefined
          : {
              src: icon_positions,
              w: isApp ? '16px' : '22px',
              h: isApp ? '16px' : '22px'
            }
      }
    ]
  }, [poolListLength, dlmmPoolListLength, showPosListLength, tab, isApp])

  return (
    <SelectTab
      type="borderTab"
      wrapStyle={{
        w: {
          base: '100vw',
          lg: '547px'
        },
        h: isApp ? '48px' : '60px',
        ...(isApp && {
          bg: 'transparent',
          border: 'none',
          borderRadius: '0',
          borderBottom: '1px solid',
          borderColor: 'border !important',
          pl: '12px'
        })
      }}
      itemStyle={{
        flex: isApp ? 'none' : '1',
        fontSize: '16px',
        fontWeight: 500,
        ...(isApp && {
          mr: '24px'
        })
      }}
      betaStyle={{
        right: '-10px'
      }}
      tabList={tabList}
      currentTab={(tabList?.find(item => item?.value === tab)?.label as string) || 'CLMM'}
      handleChangeTab={(item: any) => {
        navigate(`/pools?tab=${item.value}`)
      }}
    />
  )
}

export default PoolsTabSelector
