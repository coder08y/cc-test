import { AggregatorDexGroup, AggregatorDexMap } from '@/config/aggregator'
import useSwapConfigStore from '@/store/swap/swapConfig'
import { AggregatorDex, AggregatorProvider } from '@/types/swap'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { useDeepCompareEffect } from 'ahooks'
import { useMemo, useState } from 'react'

const getSourceNum = (providerList: AggregatorDex[]) => {
  return providerList.reduce((acc, item) => {
    return acc + (item?.subItems ? item.subItems.length : 1)
  }, 0)
}

const getCheckedNum = (providerList: AggregatorDex[], selected: Partial<Record<AggregatorProvider, boolean>>) => {
  return providerList.reduce((acc, item) => {
    if (item?.subItems) {
      return (
        acc +
        item.subItems.reduce((subAcc, subItem) => {
          return subAcc + ((selected as any)[subItem.id] ? 1 : 0)
        }, 0)
      )
    }
    return acc + ((selected as any)[item.id] ? 1 : 0)
  }, 0)
}

// HAWAL与HAEDAL LSD同步，单独处理
const hiddenAggregators = [AggregatorProvider.HAWAL, AggregatorProvider.HAEDALHMMV2]
const mergeAggregators = [
  {
    parent: AggregatorProvider.HAEDAL,
    child: AggregatorProvider.HAWAL
  },
  {
    parent: AggregatorProvider.HAEDALPMM,
    child: AggregatorProvider.HAEDALHMMV2
  }
]
export default function useCustomizeRouting(showRfqSwitch: boolean) {
  console.log('showRfqSwitch: ', showRfqSwitch)

  const { providersSwitchStates, setProvidersSwitchStates, isOpenRfqSwitch, setIsOpenRfqSwitch, rfqConfigs } = useSwapConfigStore()
  const { providers } = useWebConfigStore()
  const [currProvidersSwitchStates, setCurrProvidersSwitchStates] = useState<Partial<Record<AggregatorProvider, boolean>>>({
    ...providersSwitchStates
  })

  // 是否打开RFQ开关
  const [isOpenRfq, setIsOpenRfq] = useState(isOpenRfqSwitch)

  // 其他Provider 列表
  const [otherProviderList, setOtherProviderList] = useState<AggregatorDex[]>([])
  // Dex Provider 列表
  const [dexProviderList, setDexProviderList] = useState<AggregatorDex[]>([])
  useDeepCompareEffect(() => {
    setCurrProvidersSwitchStates({ ...providersSwitchStates })
    setIsOpenRfq(isOpenRfqSwitch)
  }, [providersSwitchStates, isOpenRfqSwitch])

  // 初始化UI显示列表， 并分组
  useDeepCompareEffect(() => {
    const groupedList: Record<string, AggregatorDex[]> = {}
    const otherList: AggregatorDex[] = []
    const dexList: AggregatorDex[] = []

    const providersMap: Partial<Record<AggregatorProvider, boolean>> = {}
    // const newProviders = providers.filter(item => item !== 'VOLO')
    const newProviders = providers.filter(item => !hiddenAggregators.includes(item as AggregatorProvider))
    console.log('🚀🚀🚀 ~ useCustomizeRouting.ts:64 ~ useCustomizeRouting ~ newProviders:', newProviders)

    // 如接口没返回dlmm ， 追加dlmm
    // if (!newProviders.includes(AggregatorProvider.CETUSDLMM)) {
    //   newProviders.push(AggregatorProvider.CETUSDLMM)
    // }

    newProviders.forEach(provider => {
      const dex = AggregatorDexMap[provider]
      if (dex) {
        const selected = providersSwitchStates[dex.id as AggregatorProvider]

        // 初始化时 如果用户没设置过，则默认选中
        if (selected === undefined) {
          providersMap[dex.id as AggregatorProvider] = true
        } else {
          providersMap[dex.id as AggregatorProvider] = selected
        }

        const groupDex = findGroupDex(provider as AggregatorProvider)
        if (groupDex) {
          //找到分组 暂存groupedList
          const list = groupedList[groupDex.groupName] || []
          list.push(dex)
          groupedList[groupDex.groupName] = list
        } else {
          if (dex.type === 'dex') {
            dexList.push(dex)
          } else {
            otherList.push(dex)
          }
        }
      } else {
        //TODO 本地配置没找到 如何处理？
      }
    })
    // 处理完毕，将分组数据 放入对应List中
    console.log('🚀🚀🚀 ~ useCustomizeRouting.ts:97 ~ useCustomizeRouting ~ groupedList:', groupedList)
    for (const [key, value] of Object.entries(groupedList)) {
      if (value.length > 0) {
        const dex = value[0]
        const groupDex: AggregatorDex = {
          ...dex,
          id: dex.groupId as string,
          name: key, // 修改分组显示的name
          subItems: value.sort((a, b) => b.sort - a.sort)
        }

        if (dex.type === 'dex') {
          dexList.push(groupDex)
        } else {
          otherList.push(groupDex)
        }
      }
    }
    console.log('🚀🚀🚀 ~ useCustomizeRouting.ts:108 ~ useCustomizeRouting ~ otherList:', otherList)
    // 所有数据处理完毕，进行排序
    otherList.sort((a, b) => b.sort - a.sort)
    dexList.sort((a, b) => b.sort - a.sort)
    setOtherProviderList([...otherList])
    setDexProviderList([...dexList])
    console.log('🚀🚀🚀 ~ useCustomizeRouting.ts:121 ~ useCustomizeRouting ~ providersMap:', providersMap)
    setProvidersSwitchStates(providersMap)
  }, [providers])

  const findGroupDex = (provider: AggregatorProvider) => {
    return AggregatorDexGroup.find(group => group.items.includes(provider))
  }

  /**
   * 处理选择全部Provider点击
   * @param selectAll
   */
  const handleSelectAllProviderClick = (selectAll: boolean) => {
    if (selectAll) {
      setIsOpenRfq(true)
      const providersMap: Partial<Record<AggregatorProvider, boolean>> = {}
      providers.forEach(item => (providersMap[item as AggregatorProvider] = true))

      hiddenAggregators.forEach(item => {
        if (providers.includes(item)) {
          providersMap[item] = true
        }
      })

      setCurrProvidersSwitchStates(providersMap)
    } else {
      setIsOpenRfq(false)
      const providersMap: Partial<Record<AggregatorProvider, boolean>> = {}
      providers.forEach(item => (providersMap[item as AggregatorProvider] = false))

      hiddenAggregators.forEach(item => {
        if (providers.includes(item)) {
          providersMap[item] = false
        }
      })

      setCurrProvidersSwitchStates({
        ...providersMap,
        [AggregatorProvider.CETUS]: true,
        [AggregatorProvider.CETUSDLMM]: true
      })
    }
  }

  /**
   * 处理选择全部Dex Provider点击
   * @param selectAll
   */
  const handleSelectAllDexProviderClick = (selectAll: boolean) => {
    if (selectAll) {
      dexProviderList.forEach(item => {
        if (item?.subItems) {
          item.subItems.forEach(subItem => {
            currProvidersSwitchStates[subItem.id as AggregatorProvider] = true
          })
        } else {
          currProvidersSwitchStates[item.id as AggregatorProvider] = true
        }
      })
    } else {
      dexProviderList.forEach(item => {
        if (item.id === AggregatorProvider.CETUS || item.id === AggregatorProvider.CETUSDLMM) {
          currProvidersSwitchStates[item.id] = true
        } else if (item?.subItems) {
          item.subItems.forEach(subItem => {
            currProvidersSwitchStates[subItem.id as AggregatorProvider] = false
          })
        } else {
          currProvidersSwitchStates[item.id as AggregatorProvider] = false
        }
      })
    }

    setCurrProvidersSwitchStates({
      ...currProvidersSwitchStates
    })
  }

  /**
   * 处理选择全部Other Provider点击
   * @param selectAll
   */
  const handleSelectAllOtherProviderClick = (selectAll: boolean) => {
    otherProviderList.forEach(item => {
      if (item?.subItems) {
        item.subItems.forEach(subItem => {
          currProvidersSwitchStates[subItem.id as AggregatorProvider] = selectAll
        })
      } else {
        currProvidersSwitchStates[item.id as AggregatorProvider] = selectAll
      }
    })

    // HAWAL与HAEDAL LSD同步，单独处理

    hiddenAggregators.forEach(item => {
      if (providers.includes(item)) {
        currProvidersSwitchStates[item] = selectAll
      }
    })

    setCurrProvidersSwitchStates({
      ...currProvidersSwitchStates
    })
  }

  /**
   * 单个Provider点击
   * @param provider
   * @param select
   */
  const handleProviderClick = (provider: AggregatorProvider, select: boolean) => {
    currProvidersSwitchStates[provider] = select

    mergeAggregators.forEach(item => {
      if (provider === item.parent && providers.includes(item.child)) {
        currProvidersSwitchStates[item.child] = select
      }
    })

    setCurrProvidersSwitchStates({ ...currProvidersSwitchStates })
  }

  // 是否选择全部Dex
  const selectAllDexProviders = useMemo(
    () =>
      dexProviderList.every(item => {
        if (item?.subItems) {
          return item.subItems.every(subItem => currProvidersSwitchStates[subItem.id as AggregatorProvider])
        }
        return currProvidersSwitchStates[item.id as AggregatorProvider]
      }),
    [JSON.stringify(dexProviderList), JSON.stringify(currProvidersSwitchStates)]
  )
  // 是否选择全部Other
  const selectAllOtherProviders = useMemo(
    () =>
      otherProviderList.every(item => {
        if (item?.subItems) {
          return item.subItems.every(subItem => currProvidersSwitchStates[subItem.id as AggregatorProvider])
        }
        return currProvidersSwitchStates[item.id as AggregatorProvider]
      }),
    [JSON.stringify(otherProviderList), JSON.stringify(currProvidersSwitchStates)]
  )

  // 是否选择全部Providers
  const selectAllProviders = useMemo(() => {
    return selectAllDexProviders && selectAllOtherProviders
  }, [selectAllDexProviders, selectAllOtherProviders])

  /**
   * 只选择cetus 才能输入对向amount
   */
  const isAllowInputReceiveSide = useMemo(() => {
    return (
      providers?.filter(item => {
        return item !== AggregatorProvider.CETUS && !!currProvidersSwitchStates[item as AggregatorProvider]
      }).length === 0
    )
  }, [currProvidersSwitchStates])

  // 是否打开了AggregatorMode
  const isOpenAggregatorMode = useMemo(() => {
    return (
      providers?.filter(item => {
        return item !== AggregatorProvider.CETUS && item !== AggregatorProvider.CETUSDLMM && !!currProvidersSwitchStates[item as AggregatorProvider]
      }).length >= 1 ||
      (isOpenRfqSwitch && showRfqSwitch)
    )
  }, [currProvidersSwitchStates, providers, isOpenRfqSwitch])
  // 点击保存确认
  const handleSaveClick = () => {
    if (showRfqSwitch) {
      setIsOpenRfqSwitch(isOpenRfq)
    }

    setProvidersSwitchStates({ ...currProvidersSwitchStates })
  }

  const hasRfqProvider = useMemo(() => {
    // return rfqConfigs?.enable || false
    // 默认始终展示rfq 开关
    return true
  }, [rfqConfigs])

  const allSourceNum = useMemo(() => {
    const allSourceNum = providers?.filter(item => !hiddenAggregators.includes(item as AggregatorProvider))?.length
    return hasRfqProvider && showRfqSwitch ? allSourceNum + 1 : allSourceNum
  }, [providers?.length, hasRfqProvider])

  const dexSourceNumMap = useMemo(() => {
    return {
      checked: getCheckedNum(dexProviderList, currProvidersSwitchStates),
      total: getSourceNum(dexProviderList)
    }
  }, [dexProviderList, currProvidersSwitchStates])

  const otherSourceNumMap = useMemo(() => {
    return {
      checked: getCheckedNum(otherProviderList, currProvidersSwitchStates),
      total: getSourceNum(otherProviderList)
    }
  }, [otherProviderList, currProvidersSwitchStates])

  return {
    handleSelectAllProviderClick,
    handleSelectAllDexProviderClick,
    handleSelectAllOtherProviderClick,
    handleProviderClick,
    selectAllProviders,
    selectAllDexProviders,
    otherProviderList,
    selectAllOtherProviders,
    dexProviderList,
    currProvidersSwitchStates,
    providersSwitchStates,
    isOpenAggregatorMode,
    handleSaveClick,
    allSourceNum,
    dexSourceNumMap,
    otherSourceNumMap,
    isOpenRfq,
    setIsOpenRfq,
    hasRfqProvider,
    isAllowInputReceiveSide
  }
}
