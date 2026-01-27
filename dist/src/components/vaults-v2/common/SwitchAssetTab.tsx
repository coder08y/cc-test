import { useGetSuiStakeProtocol } from '@/hooks/vault-v2/useVaultsHelper'
import { AssetActionType } from '@/types/vaults'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { Token } from '@cetus/types'
import { isAvailableObject } from '@cetus/utils'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import ZapSwitch from '../common/ZapSwitch'

const hoverCoinTips =
  'You can also choose to deposit in only one asset type. In that case, the vault will convert your asset to the required propositions using Cetus. Please note that trading fees & slippage will be applied. When slippage is involved, a certain amount of post-swap dust (no loss of funds) will be returned to you.'

const hoverSuiTips = (stakeProtocolName?: string, symbol?: string) =>
  `When you deposit in only SUI tokens, a part of your SUI amount will be converted to ${symbol} via ${stakeProtocolName} liquid staking services to match required liquidity compositions of the liquidity pool on Cetus. A certain amount of dust (no loss of funds) will be returned to you if slippage is involved.`

const ActionTabEnum = {
  Deposit: 'Deposit',
  Withdraw: 'Withdraw'
} as const

// deposit withdraw 切换
export function SwitchAssetTab(props: {
  displayTokenA?: Token
  displayTokenB?: Token
  onSelectAssetTab: (assetTab: AssetActionType) => void
  label?: string
  setAssetAction: (value: string) => void
  assetAction: string
  isCheckedZAP: boolean
  setIsCheckedZAP: (value: boolean) => void
  category?: string
  currentActionTab?: string
}) {
  const {
    displayTokenA,
    displayTokenB,
    onSelectAssetTab,
    label = 'Deposit Amounts',
    isCheckedZAP,
    setIsCheckedZAP,
    assetAction,
    setAssetAction,
    category,
    currentActionTab
  } = props

  const { stakeProtocolName } = useGetSuiStakeProtocol(displayTokenA?.coin_type)

  const isUnstableVault = useMemo(() => category === 'haedal' || category === 'haevault_v2', [category])

  const generateTabList = (): Tab<{ action: AssetActionType }>[] => {
    if (!displayTokenA || !displayTokenB) return []

    const baseTabs: Tab<{ action: AssetActionType }>[] = [
      {
        label: `${displayTokenA.symbol} only`,
        action: displayTokenA.coin_type
        // afterIcon:
        //   stakeProtocolName && isCheckedZAP && currentActionTab === ActionTabEnum.Deposit && !isUnstableVault
        //     ? { xlinkHref: '#icon-icon_tips' }
        //     : undefined,
        // tooltip: stakeProtocolName
        //   ? isUnstableVault
        //     ? currentActionTab === ActionTabEnum.Deposit
        //       ? `You can add liquidity in this pool with only ${displayTokenA.symbol}.`
        //       : ''
        //     : hoverCoinTips
        //   : undefined
      },
      {
        label: `${displayTokenB.symbol} only`,
        action: displayTokenB.coin_type
        // afterIcon:
        //   stakeProtocolName && isCheckedZAP && currentActionTab === ActionTabEnum.Deposit && !isUnstableVault
        //     ? { xlinkHref: '#icon-icon_tips' }
        //     : undefined,
        // tooltip: stakeProtocolName
        //   ? isUnstableVault
        //     ? currentActionTab === ActionTabEnum.Deposit
        //       ? `You can add liquidity in this pool with only ${displayTokenB.symbol}.`
        //       : ''
        //     : hoverSuiTips(stakeProtocolName, displayTokenA?.symbol)
        //   : undefined
      }
    ]

    // if (isUnstableVault && currentActionTab === ActionTabEnum.Deposit && category !== 'haevault_v2') {
    //   baseTabs.splice(1, 0, {
    //     label: `${displayTokenA.symbol}+${displayTokenB.symbol}`,
    //     action: 'both',
    //     tooltip: 'You can add any value you want from both assets.'
    //   })
    // }

    return baseTabs
  }

  const tabList = useMemo(generateTabList, [displayTokenA, displayTokenB, isCheckedZAP, stakeProtocolName, isUnstableVault, currentActionTab])

  const currentTab = useMemo(() => {
    if (tabList.length === 0) return undefined

    if (assetAction === displayTokenA?.coin_type) return tabList[0].label

    // if (assetAction === displayTokenB?.coin_type) {
    //   if (isUnstableVault && currentActionTab === ActionTabEnum.Deposit && category !== 'haevault_v2') {
    //     return tabList[2]?.label
    //   }
    //   return tabList[1]?.label
    // }

    return tabList[1]?.label
  }, [assetAction, tabList, isUnstableVault, currentActionTab, displayTokenA?.coin_type, displayTokenB?.coin_type])

  const tooltipType = useMemo(() => {
    if (currentActionTab === ActionTabEnum.Deposit) {
      return isUnstableVault ? 'customDeposit' : 'deposit'
    }
    return 'withdraw'
  }, [currentActionTab, isUnstableVault])

  return (
    <VStack w="100%" gap="16px">
      <HStack w="100%" justifyContent="space-between">
        <Text fontWeight="500" fontSize={{ base: '12px', lg: '14px' }}>
          {label}
        </Text>
        {!isAvailableObject(displayTokenA) || !isAvailableObject(displayTokenB) ? (
          <Skeleton w="100px" h="18px" />
        ) : (
          <ZapSwitch
            isCheckedZAP={isCheckedZAP}
            zapText={currentActionTab === ActionTabEnum.Deposit ? 'Zap In' : 'Zap Out'}
            tooltipType={tooltipType}
            zapSwitchChange={(status: boolean) => {
              setIsCheckedZAP(!isCheckedZAP)
              setAssetAction(status ? (displayTokenA?.coin_type ?? '') : 'both')
            }}
          />
        )}
      </HStack>

      {isCheckedZAP && tabList.length > 0 && (
        <SelectTab
          wrapStyle={{
            w: '100%',
            h: { base: '36px', lg: '48px' },
            borderRadius: { base: '8px', lg: '12px' },
            p: { base: '1px', lg: '3px' }
          }}
          itemStyle={{
            w: '50%',
            fontSize: { base: '12px', lg: '14px' },
            borderRadius: { base: '6px', lg: '8px' },
            fontWeight: '500'
          }}
          type="outlineTab"
          currentTab={currentTab}
          tabList={tabList}
          handleChangeTab={(item: Tab<{ action: AssetActionType }>) => {
            setAssetAction(item.action)
            onSelectAssetTab(item.action)
          }}
        />
      )}
    </VStack>
  )
}
