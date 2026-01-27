import useGetPythLastPrice from '@/hooks/vault-v2/pyth-price/useGetPythLastPrice'
import useCurrentVaultDetail from '@/hooks/vault-v2/useCurrentVaultDetail'
import useVaultAvaiableCapacity from '@/hooks/vault-v2/useVaultAvaiableCapacity'
import useVaultHoadings from '@/hooks/vault-v2/useVaultsHoldings'
import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import useGetVaultsFarmingApiInfo from '@/hooks/vaults-farming/useGetVaultsFarmingApiInfo'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPoolStore from '@/store/vaults-v2/useVaultsPool'
import useVaultsPoolContractStore from '@/store/vaults-v2/useVaultsPoolContract'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { Block } from '@cetus/design'
import { useAccountBalance } from '@cetus/hooks'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useSdkStore } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { BackButton, NoData, RefreshButton } from '@cetus/ui-kit'
import { isAvailableObject } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import VaultsAction from '../detail/VaultsAction'
import VaultsPoolSelect from '../detail/VaultsPoolSelect'
import FarmingOverview from '../farming/FarmingOverview'
import VaultsChartPage from './VaultsChartPage'
import VaultsInfo from './VaultsInfo'
import VaultsLpBreakdown from './VaultsLpBreakdown'
import VaultsPoolDetailInfo from './VaultsPoolDetailInfo'
import VaultsStatsInfo from './VaultsStatsInfo'
import VaultsStrategyBreakdown from './VaultsStrategyBreakdown'
import VaultsYourHoldings from './VaultsYourHoldings'

export default function VaultsDetailPage() {
  const navigate = useNavigate()
  const { vaultId } = useParams()
  const { getCurrentVaultDetail } = useCurrentVaultDetail()
  const { currentAccount } = useAccountStore()
  const { clearVaultsActionData, setFromToken, setToToken } = useVaultsActionStore()
  const { currentVaultPosition, currentVaultPositionLoading, clearVaultsPositionObj, setCurrentVaultPosition } = useVaultsPositionStore()
  const { vaultsPoolObj } = useVaultsPoolStore()
  const { vaultListObj, lpTokenInfoObj, vaultsList } = useVaultsListV2Store()
  const { haedalFarmSdk } = usePeripherySDKStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { getCurrentVaultContractInfo } = useCurrentVaultDetail()
  const [isAvailableVaultId, setIsAvailableVaultId] = useState(true)
  const { setFromCoin, setToCoin } = useSwapWidgetStore()

  const currentVaultPool = useMemo(() => {
    return vaultsPoolObj[vaultId as string]
  }, [vaultsPoolObj, vaultId])
  const { isInitialized } = useSdkStore()

  const { vaultsFarmObj, clearVaultsFarmingInfo } = useVaultsFarmingStore()

  useEffect(() => {
    if (!currentAccount?.address) {
      clearVaultsPositionObj()
      setCurrentVaultPosition({})
    }
  }, [currentAccount?.address])

  useEffect(() => {
    if (vaultId && isAvailableObject(vaultListObj)) {
      const res = Object.values(vaultListObj)?.filter((item: any) => {
        return item.vaultId == vaultId
      })
      if (res?.length > 0) {
        console.log('🚀 ~ res ~ res:', res)
        setIsAvailableVaultId(true)
      } else {
        setIsAvailableVaultId(false)
      }
    }
  }, [vaultId, vaultListObj])

  const apiVaultInfo = useMemo(() => {
    if (isAvailableObject(vaultListObj) && vaultId) {
      return vaultListObj[vaultId]
    }
    return
  }, [vaultListObj, vaultId])

  const category = useMemo(() => {
    return apiVaultInfo?.category || 'cetus'
  }, [apiVaultInfo])

  useEffect(() => {
    if (
      vaultId &&
      isInitialized &&
      isAvailableObject(vaultsFarmObj) &&
      (currentAccount?.address == haedalFarmSdk?.senderAddress || !currentAccount?.address)
    ) {
      console.log('1202### vault detail getCurrentVaultDetail: ', vaultId)
      getCurrentVaultDetail(vaultId as string, false)
      autoRefresh()
    }
  }, [currentAccount?.address, vaultId, isInitialized, vaultsFarmObj, haedalFarmSdk?.senderAddress])

  const lpTokenInfo = useMemo(() => {
    return lpTokenInfoObj[apiVaultInfo?.lpTokenType]
  }, [apiVaultInfo?.lpTokenType, JSON.stringify(lpTokenInfoObj)])

  console.log('1202###🚀 ~ VaultsDetailPage ~ lpTokenInfo:', apiVaultInfo)

  const vaultTabList = [
    {
      label: 'Overview',
      value: 'Overview'
    },
    {
      label: 'Analytics',
      value: 'Analytics'
    }
  ]

  const [vaultCurrTab, setVaultCurrTab] = useState('Overview')

  const { holdingAmountDisplay, holdCoinAValue, holdCoinBValue } = useVaultHoadings(
    currentVaultPosition?.displayAmountA,

    currentVaultPosition?.displayAmountB,
    currentVaultPosition?.displayCoinTypeA,
    currentVaultPosition?.displayCoinTypeB,
    undefined,
    undefined,
    category as string
  )

  const {
    holdingAmount: vaultTvl,
    holdCoinAValue: poolHoldCoinAValue,
    holdCoinBValue: poolHoldCoinBValue
  } = useVaultHoadings(
    currentVaultPool?.displayAmountA,
    currentVaultPool?.displayAmountB,
    currentVaultPool?.displayCoinTypeA,
    currentVaultPool?.displayCoinTypeB,
    undefined,
    undefined,
    category as string
  )

  const [chartRefresh, setChartRefresh] = useState(false)
  const { getPythLastPrice } = useGetPythLastPrice()

  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    clearVaultsActionData()

    return () => {
      isMountedRef.current = false
      clearVaultsActionData()
      setFromToken({})
      setToToken({})
      setCurrentVaultPosition({})
    }
  }, [])

  const autoRefresh = () => {
    if (currentAccount?.address) {
      // 刷新余额
      fetchAccountBalance()
      getCurrentVaultDetail(vaultId as string, true)
    } else {
      getCurrentVaultContractInfo(vaultId as string)
    }

    // 刷新价格
    if (
      isMountedRef.current &&
      currentVaultPool?.displayCoinTypeA &&
      currentVaultPool?.displayCoinTypeB &&
      (category == 'haedal' || category == 'haevault_v2')
    ) {
      getPythLastPrice([currentVaultPool?.displayCoinTypeA, currentVaultPool?.displayCoinTypeB], category)
    }

    if (vaultCurrTab !== 'Overview') {
      setChartRefresh(true)
      setTimeout(() => {
        setChartRefresh(false)
      }, 1000)
    }
  }

  const avaiableCapacityInfo = useVaultAvaiableCapacity(currentVaultPool)

  const { isApp } = useWindowWidth()

  useEffect(() => {
    if (apiVaultInfo) {
      setFromCoin(apiVaultInfo?.displayTokenA)
      setToCoin(apiVaultInfo?.displayTokenB)
    }
    return () => {
      setFromCoin(envConfigs.clmm_swap.from_coin)
      setToCoin(envConfigs.clmm_swap.to_coin)
    }
  }, [apiVaultInfo?.vaultsId, vaultId])

  const [isRefresh, setIsRefresh] = useState(false)

  const handleRefresh = () => {
    autoRefresh()
    setIsRefresh(prev => !prev)
  }

  const { getHaedalFarmingList } = useGetVaultsFarmingApiInfo()
  // 页面刷新重新获取
  useEffect(() => {
    if (!isAvailableObject(vaultsFarmObj)) {
      getHaedalFarmingList()
    }
  }, [vaultsFarmObj])

  const { isVaultsFarming, currentVaultsFarm } = useCurrentVaultsFarm(vaultId)

  useEffect(() => {
    if (!currentAccount?.address) {
      clearVaultsFarmingInfo()
    }
  }, [currentAccount?.address])

  const { volatileVaultsSdk } = usePeripherySDKStore()

  const { dlmmVaultContractInfoObj, vaultDlmmPoolContractInfoObj } = useVaultsPoolContractStore()

  const vaultContractInfo = useMemo(() => {
    return dlmmVaultContractInfoObj[vaultId as string]
  }, [dlmmVaultContractInfoObj, vaultId])

  const poolContractInfo = useMemo(() => {
    return vaultDlmmPoolContractInfoObj[currentVaultPool?.dlmmPoolAddress as string]
  }, [vaultDlmmPoolContractInfoObj, currentVaultPool?.dlmmPoolAddress])

  // useEffect(() => {
  //   // TODO 给测试临时打印
  //   if (currentVaultPool && vaultContractInfo && poolContractInfo) {
  //     buildVaultsBalanceV2(volatileVaultsSdk, currentVaultPool.totalSupply, vaultContractInfo as Vault, poolContractInfo, '').then(res => {
  //       const { original_lower_bin_id, original_upper_bin_id } = res

  //       const original_lower_bin_id_price = BinUtils.getPricePerLamportFromBinId(original_lower_bin_id, poolContractInfo.bin_step)
  //       const original_upper_bin_id_price = BinUtils.getPricePerLamportFromBinId(original_upper_bin_id, poolContractInfo.bin_step)

  //       console.log('🚀🚀🚀 ~ VaultsDetailPage.tsx:246 ~ VaultsDetailPage ~ res:', {
  //         ...res,
  //         original_lower_bin_id_price,
  //         original_upper_bin_id_price
  //       })
  //     })
  //   }
  // }, [vaultContractInfo, poolContractInfo, currentVaultPool])

  const { size } = useDocumentSize()

  return (
    <Box p="32px 0 20px" w={{ base: '100%', lg: '1160px' }}>
      {isAvailableVaultId ? (
        <VStack gap="0px" w="100%" align="flex-start">
          <HStack w="100%" justify="space-between" gap="20px">
            <BackButton borderColor="border_secondary" onClick={() => navigate('/vaults')} />
            {isApp && (
              <RefreshButton
                handleRefresh={() => handleRefresh()}
                isAutoRefresh={true}
                refreshInterval={20}
                innerStyle={{ bg: 'bg_secondary' }}
                w="30px"
                h="30px"
                borderRadius="8px"
                bg="bg_secondary"
              />
            )}
          </HStack>
          <HStack w="100%" justify="space-between" gap="20px" alignItems="flex-end">
            <VaultsPoolSelect
              isVaultsFarming={isVaultsFarming}
              apiVaultInfo={apiVaultInfo}
              vaultsList={vaultsList}
              setVaultCurrTab={setVaultCurrTab}
            />

            {!isApp && (
              <RefreshButton
                handleRefresh={() => handleRefresh()}
                isAutoRefresh={true}
                refreshInterval={20}
                innerStyle={{ bg: 'bg_secondary' }}
                w="30px"
                h="30px"
                borderRadius="8px"
                bg="bg_secondary"
                mb="4px"
              />
            )}
          </HStack>
          <HStack
            align="flex-start"
            gap={{ base: '12px', lg: '16px' }}
            mt={{ base: '12px', lg: '16px' }}
            w="100%"
            flexDirection={{ base: 'column-reverse', lg: 'row' }}
          >
            <VStack w={{ base: '100%', lg: '684px' }} gap={{ base: '12px', lg: '16px' }}>
              {!isApp && (
                <VaultsStatsInfo
                  apiVaultInfo={apiVaultInfo}
                  vaultTvl={vaultTvl}
                  performanceFee={currentVaultPool?.disPlayProtocolFeeRate}
                  currentVaultPool={currentVaultPool}
                />
              )}
              {apiVaultInfo?.category !== 'haevault_v2' && (
                <VaultsPoolDetailInfo
                  currentVaultPool={currentVaultPool}
                  apiVaultInfo={apiVaultInfo}
                  depositRatio={avaiableCapacityInfo?.depositRatio}
                  hardCapUSD={avaiableCapacityInfo?.hardCapUSD}
                  vaultTvl={vaultTvl}
                  vaultsCoinAValue={currentVaultPool?.displayAmountA ? poolHoldCoinAValue : ''}
                  vaultsCoinBValue={currentVaultPool?.displayAmountB ? poolHoldCoinBValue : ''}
                />
              )}

              {apiVaultInfo?.category === 'haevault_v2' && (
                <VaultsLpBreakdown
                  currentVaultPool={currentVaultPool}
                  apiVaultInfo={apiVaultInfo}
                  vaultsCoinAValue={currentVaultPool?.displayAmountA ? poolHoldCoinAValue : ''}
                  vaultsCoinBValue={currentVaultPool?.displayAmountB ? poolHoldCoinBValue : ''}
                  lpTokenInfo={lpTokenInfo}
                />
              )}

              {apiVaultInfo?.category === 'haevault_v2' && (
                <VaultsStrategyBreakdown currentVaultPool={currentVaultPool} apiVaultInfo={apiVaultInfo} />
              )}

              <VaultsChartPage
                apiVaultInfo={apiVaultInfo}
                chartRefresh={chartRefresh}
                currentVaultPool={currentVaultPool}
                vaultContractInfo={vaultContractInfo}
                category={category}
                vaultTvl={vaultTvl}
              />

              <VaultsInfo
                apiVaultInfo={apiVaultInfo}
                lpTokenInfo={lpTokenInfo}
                vaultsCoinAValue={currentVaultPool?.displayAmountA ? poolHoldCoinAValue : ''}
                vaultsCoinBValue={currentVaultPool?.displayAmountB ? poolHoldCoinBValue : ''}
              />
            </VStack>
            <Box
              flexShrink={0}
              w={{ base: '100%', lg: '460px' }}
              position={{ base: 'static', lg: size.h < 1000 ? 'static' : 'sticky' }}
              top={{ base: 0, lg: '80px' }}
              alignSelf="flex-start"
            >
              <VStack align="flex-start" gap={{ base: '12px', lg: '16px' }} w={{ base: '100%', lg: '460px' }}>
                {isApp && (
                  <VaultsStatsInfo
                    apiVaultInfo={apiVaultInfo}
                    vaultTvl={vaultTvl}
                    performanceFee={currentVaultPool?.disPlayProtocolFeeRate}
                    currentVaultPool={currentVaultPool}
                  />
                )}
                {currentAccount?.address && (
                  <VaultsYourHoldings
                    balanceDisplay={currentVaultPositionLoading ? '' : currentVaultPosition?.balanceDisplay || '0'}
                    totalHolding={currentVaultPositionLoading ? '' : holdingAmountDisplay || ''}
                    sharePoolRate={currentVaultPositionLoading ? '' : currentVaultPosition?.shartOfPoolDisplay || 0}
                    apiVaultInfo={apiVaultInfo}
                    holdCoinAmounts={{
                      displayCoinA: currentVaultPositionLoading ? '' : currentVaultPosition?.displayAmountA || '0',
                      displayCoinB: currentVaultPositionLoading ? '' : currentVaultPosition?.displayAmountB || '0'
                    }}
                    holdCoinAValue={holdCoinAValue}
                    holdCoinBValue={holdCoinBValue}
                    isNotMatch={currentVaultPosition?.vaultId !== vaultId}
                    posVaultId={currentVaultPosition?.vaultId}
                  />
                )}

                <Block borderRadius="16px" border="none" p={{ base: '0px 16px 16px', lg: '0 16px 20px' }} bg="card_bg">
                  <VaultsAction autoRefresh={autoRefresh} vaultId={vaultId as string} isRefresh={isRefresh} isModal={false} />
                </Block>
                {isVaultsFarming && <FarmingOverview vaultId={apiVaultInfo?.vaultId} />}
              </VStack>
            </Box>
          </HStack>
        </VStack>
      ) : (
        <NoData type="custom" imgUrl="/images/img_pool@2x.png" h="480px">
          <VStack>
            <Text h="20px" lineHeight="20px" fontSize="14px" color="text_caption">
              Pool address not found
            </Text>
            <Button
              mt="12px"
              w="120px"
              h="32px"
              borderRadius="8px"
              colorScheme="blue"
              fontSize="14px"
              fontWeight="500"
              onClick={() => {
                navigate('/vaults')
              }}
            >
              Back to Vault
            </Button>
          </VStack>
        </NoData>
      )}
    </Box>
  )
}
