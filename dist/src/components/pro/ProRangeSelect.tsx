import useProHelper from '@/hooks/pro/useProHelper'
import useProListStore from '@/store/pro/list'
import { ErrorTips, SelectTab } from '@cetus/design'
import { NumericFormatInput } from '@cetus/ui-kit'
import Icon from '@cetus/ui-kit/src/components/Icon'
import { d, formatNumberWithKMB } from '@cetus/utils'
import { Box, Button, HStack, Menu, MenuButton, MenuList, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

const McTabList = [
  {
    label: '≥ 10K',
    value: '10000'
  },
  {
    label: '≥ 100K',
    value: '100000'
  },
  {
    label: '≥ 500K',
    value: '500000'
  },
  {
    label: '≥ 2M',
    value: '2000000'
  }
]

const LiquidityTabList = [
  {
    label: '≥ 10K',
    value: '10000'
  },
  {
    label: '≥ 50K',
    value: '50000'
  },
  {
    label: '≥ 100K',
    value: '100000'
  },
  {
    label: '≥ 500K',
    value: '500000'
  }
]

const VolumeTabList = [
  {
    label: '≥ 10K',
    value: '10000'
  },
  {
    label: '≥ 20K',
    value: '20000'
  },
  {
    label: '≥ 50K',
    value: '50000'
  },
  {
    label: '≥ 100K',
    value: '100000'
  }
]
export default function ProRangeSelect({ isApp }: { isApp?: boolean }) {
  const {
    currentProTab,
    currentSortTab,
    dateType,
    setLiquidityMin,
    setLiquidityMax,
    setMcMin,
    setMcMax,
    setVolumeMin,
    setVolumeMax,
    liquidityMin,
    liquidityMax,
    mcMin,
    mcMax,
    volumeMin,
    volumeMax,
    setProListParams
  } = useProListStore()
  const { getVolumeMin } = useProHelper()

  const handleLiquidityChage = (min: string, max: string) => {
    setLiquidityMin(min)
    setLiquidityMax(max)
    setProListParams({
      liqidity_min: min,
      liqidity_max: max
    })
  }

  const handleMcChage = (min: string, max: string) => {
    setMcMin(min)
    setMcMax(max)
    setProListParams({
      market_cap_min: min,
      market_cap_max: max
    })
  }

  const handleVolumeChage = (min: string, max: string) => {
    setVolumeMin(min)
    setVolumeMax(max)
    let volumeMin = getVolumeMin(min, dateType)
    setProListParams({
      volume_min: currentProTab == 'Top' ? volumeMin : min,
      volume_max: max
    })
  }

  useEffect(() => {
    if (currentProTab == 'Top' || currentProTab == 'Gainers' || currentProTab == 'Losers') {
      setMcMin('10000')
      setMcMax('')
      setLiquidityMin('10000')
      setLiquidityMax('')
      setVolumeMin('')
      setVolumeMax('')
    } else {
      setMcMin('')
      setMcMax('')
      setLiquidityMin('')
      setLiquidityMax('')
      setVolumeMin('')
      setVolumeMax('')
    }
  }, [currentProTab])

  // 切换currentSortTab不恢复默认值
  // useEffect(() => {
  //   // if (currentSortTab == 'HotTrading') {
  //   setMcMin('10000')
  //   setMcMax('')
  //   setLiquidityMin('10000')
  //   setLiquidityMax('')
  //   setVolumeMin('')
  //   setVolumeMax('')
  //   // }
  // }, [currentSortTab])

  return (
    <HStack m={isApp ? '8px 0' : '0px'} ml={isApp || currentProTab == 'New' ? '0px' : '8px'} gap="0px">
      <SelectBlock label="Liquidity" defaultMin={liquidityMin} defaultMax={liquidityMax} onChange={handleLiquidityChage} tabList={LiquidityTabList} />
      <SelectBlock label="Market Cap" defaultMin={mcMin} defaultMax={mcMax} onChange={handleMcChage} tabList={McTabList} />
      <SelectBlock label="Volume" defaultMin={volumeMin} defaultMax={volumeMax} onChange={handleVolumeChage} tabList={VolumeTabList} />
    </HStack>
  )
}

function SelectBlock({
  label,
  tabList,
  defaultMin,
  defaultMax,
  onChange
}: {
  label: string
  tabList: any
  defaultMin: string
  defaultMax: string
  onChange: (min: string, max: string) => void
}) {
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [tabValue, setTabValue] = useState('')
  const [currentTab, setCurrentTab] = useState('')

  const handleChangeTab = (item: any) => {
    console.log('🚀 ~ handleChangeTab ~ item:', item)
    setCurrentTab(item.label)
    setTabValue(item.value)
  }

  const handleChangeMin = (value: string) => {
    setMin(value)
  }

  const handleChangeMax = (value: string) => {
    setMax(value)
  }

  const setDefaultData = () => {
    if (defaultMin && defaultMax) {
      setMin(defaultMin)
      setMax(defaultMax)
      setCurrentTab('')
      setTabValue('')
    } else if (defaultMin) {
      const value = tabList?.filter((item: any) => item?.value === defaultMin)?.[0]?.label
      if (value) {
        setCurrentTab(value)
        setTabValue(defaultMin)
        setMin('')
        setMax('')
      }
    } else {
      setCurrentTab('')
      setTabValue('')
      setMin('')
      setMax('')
    }
  }

  useEffect(() => {
    setDefaultData()
  }, [defaultMin, defaultMax])

  const handleApply = () => {
    if (min || max) {
      setCurrentTab('')
      setTabValue('')
      onChange(min, max)
    } else if (tabValue) {
      onChange(tabValue, '')
    }
    return
  }

  const handleClear = () => {
    setMin('')
    setMax('')
    // 点击clear时要求清空筛选
    setTabValue('')
    setCurrentTab('')
    onChange('', '')
    // if (label === 'Volume') {
    //   setTabValue('')
    //   setCurrentTab('')
    //   onChange('', '')
    // } else {
    //   setTabValue('10000')
    //   setCurrentTab('≥ 10K')
    //   onChange('10000', '')
    // }
  }

  const showErrorTips = useMemo(() => {
    return min && max && d(min).gte(max)
  }, [min, max])

  return (
    <Box>
      <Menu
        isLazy
        onClose={() => {
          setDefaultData()
        }}
      >
        {({ isOpen, onClose }) => (
          <>
            <MenuButton bg="none" sx={{ h: '20px', p: '0px 2px 0 8px', _hover: { bg: 'card_bg', borderRadius: '4px' } }}>
              <HStack gap="0px">
                {defaultMax && <Text fontSize="12px" color="text_caption" mr="4px">{`${formatNumberWithKMB(defaultMax)}≥`}</Text>}
                <Text fontSize={{ base: '12px', lg: '13px' }} color="text_paragraph">
                  {label}
                </Text>
                {defaultMin && <Text fontSize="12px" color="text_caption" ml="4px">{`≥${formatNumberWithKMB(defaultMin)}`}</Text>}
                <Icon
                  xlinkHref="#icon-icon_descending_nor"
                  svgW="14px"
                  svgH="14px"
                  transition="transform 0.5s"
                  transform={isOpen ? 'rotate(180deg)' : 'none'}
                />
              </HStack>
            </MenuButton>
            <MenuList zIndex={9999} p="4px" minW="100px">
              <VStack gap="0px" w="296px" p="12px 8px">
                <HStack justify="space-between" w="100%">
                  <Text color="text_caption" fontSize="14px">
                    {label}
                  </Text>
                  <Icon xlinkHref="icon-icon-icon_close" svgW="14px" svgH="14px" onClick={onClose} />
                </HStack>
                <VStack w="100%" align="flex-start" mt="16px" borderBottom="1px solid" borderColor="border" pb="12px">
                  <Text fontSize="12px" color="primary_gray">
                    Pinned
                  </Text>
                  <Box w="100%">
                    <SelectTab<any, any>
                      type="outlineTab"
                      wrapStyle={{
                        h: '32px',
                        p: '3px',
                        borderRadius: '8px',
                        flex: '0 0 128px'
                      }}
                      itemStyle={{
                        fontSize: '12px',
                        flex: 1,
                        borderRadius: '6px',
                        w: '56px'
                      }}
                      tabList={tabList}
                      currentTab={currentTab}
                      handleChangeTab={handleChangeTab}
                    />
                  </Box>
                </VStack>
                <VStack w="100%" align="flex-start" mt="12px">
                  <Text fontSize="12px" color="primary_gray">
                    Selection Min-Max
                  </Text>
                  <HStack>
                    <InputBlock label="Min" onChange={handleChangeMin} value={min} />
                    <InputBlock label="Max" onChange={handleChangeMax} value={max} />
                  </HStack>
                  {showErrorTips && (
                    <ErrorTips tips="Max should be higher than Min." isShowIcon={false} bg="none" h="20px" pl="0" tipsFontSize="12px" />
                  )}
                </VStack>
                <HStack w="100%" mt="12px">
                  <Button variant="outline" h="28px" borderRadius="8px" flex="1" fontSize="12px" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button isDisabled={!!showErrorTips} fontWeight="500" flex="1" h="28px" borderRadius="8px" fontSize="12px" onClick={handleApply}>
                    Apply
                  </Button>
                </HStack>
              </VStack>
            </MenuList>
          </>
        )}
      </Menu>
    </Box>
  )
}

function InputBlock({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const handleInputValueChange = (value: string) => {
    onChange(value)
  }
  return (
    <VStack h="44px" w="136px" borderRadius="8px" border="1px solid" borderColor="border" gap="4px" flex="1" align="center">
      <Text fontSize="12px" color="primary_gray" mt="6px">
        {label}
      </Text>
      <NumericFormatInput
        style={{
          height: '16px',
          width: '100%',
          paddingLeft: '8px',
          paddingRight: '8px',
          variant: 'outline',
          fontSize: '14px',
          border: 'none',
          borderRadius: '0px',
          textAlign: 'center',
          outline: 'none',
          background: 'none'
        }}
        decimals={4}
        placeholder="0.0"
        value={value}
        onChange={handleInputValueChange}
      />
    </VStack>
  )
}
