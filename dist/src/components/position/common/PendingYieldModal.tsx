import useTransaction from '@/hooks/common/useTransaction'
import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import usePosClaimFeeAndReward from '@/hooks/position/usePosClaimFeeAndReward'
import usePositionList from '@/hooks/position/usePositionList'
import useGlobalStore from '@/store/common/global'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import { PosReward } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { spitClaimDlmmPosList } from '@/utils/dlmm'
import { Block, SelectTab } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { useAccountBalance } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { CheckBox, Icon, NoData, VaulDrawer } from '@cetus/ui-kit'
import { d, formatCurrency, formatNumber } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Switch,
  Text,
  VStack
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LpBurnLoading } from './LpBurnPrevContent'
import ModalItem from './ModalItem'

interface PendingYieldModalProps {
  isOpen: boolean
  claimLoading: boolean
  showLoading: boolean
  onClose: () => void
  changeClaimLoading: (status: boolean) => void
}

const poolTabList = [
  {
    label: 'All',
    key: 'all'
  },
  {
    label: 'CLMM',
    key: 'clmm'
  },
  {
    label: 'DLMM',
    key: 'dlmm'
  }
]
export default function PendingYieldModal({ isOpen, claimLoading, onClose, changeClaimLoading, showLoading }: PendingYieldModalProps) {
  const [isConfirm, setIsConfirm] = useState(false)
  const { coinPriceObj } = useTokenPriceStore()
  const { getPosRelatedData, getPositionBaseList } = usePositionList()
  const { batchSignAndExecuteTransaction } = useTransaction()
  const { currentAccount } = useAccountStore()
  const { getBatchHarvestFeeAndRewardsTxPayload } = usePosClaimFeeAndReward()
  const { getTokenAmountValue } = useTokenPrice()

  const [showList, setShowList] = useState([])
  const [showListLoading, setShowListLoading] = useState(true)
  const [isHide, setIsHide] = useState(true)
  const [inputValue, setInputValue] = useState(0.01)

  const [gtZeroList, setGtZeroList] = useState([])
  const [selectList, setSelectList] = useState([])
  const [selectType, setSelectType] = useState('')

  const [totalYield, setTotalYield] = useState<string>('')
  const [yieldList, setYieldList] = useState<any>([])
  const [poolTab, setPoolTab] = useState<'All' | 'CLMM' | 'DLMM'>('All')
  const { myPosYieldValue, myClmmPosYieldValue, myDlmmPosYieldValue, posBaseList, posFeeData, posRewardsData, farmsPosRewardsData } =
    usePositionStore()

  const { dlmmPosBaseList, dlmmPosRewardsData, dlmmPosFeeData } = useDlmmPositionStore()
  const userNotSelected = useRef<string[]>([])

  const handleChange = (e: any) => {
    const reg = new RegExp('[^\\d-]*(\\d*(?:\\.\\d{0,4})?).*$')
    e.target.value = e.target.value.replace(reg, '$1')
    setInputValue(e.target.value)
  }
  const handleBlur = () => {
    if (!inputValue || inputValue < 0.01) {
      setInputValue(0.01)
    }
  }

  const processPositionList = (positionList: any[], feeData: any, rewardsData: any, farmsData?: any, isDlmm: boolean = false) => {
    const result: any = []
    let totalAmount: string = '0'
    const amountGtZeroList: any = []

    positionList.forEach(ele => {
      let feeOwedAmount: string = '0'
      let rewarderAmount: string = '0'
      let farmsAmount: string = '0'
      let feeOwedUsd: string = '0'
      let rewarderUsd: string = '0'
      let farmsUsd: string = '0'
      const pendingRewarderList: any = []
      const pendingFeesList: any = []
      const pendingFarmsList: any = []

      let posId = isDlmm ? ele.id : ele.posId

      if (Object.values(feeData)?.length > 0) {
        const currentFeesData = feeData[posId]
        const amountValueA = getTokenAmountValue(ele?.displayTokenA?.coin_type, currentFeesData?.displayFeeOwedA, '--')
        const amountValueB = getTokenAmountValue(ele?.displayTokenB?.coin_type, currentFeesData?.displayFeeOwedB, '--')
        feeOwedAmount = d(feeOwedAmount)
          .plus(currentFeesData?.displayFeeOwedA || 0)
          .plus(currentFeesData?.displayFeeOwedB || 0)
          .toString()
        if (amountValueA !== '--' && amountValueB !== '--') {
          feeOwedUsd = d(amountValueA).plus(amountValueB).toString()
        }

        pendingFeesList.push(
          {
            coin_address: fixCoinType(ele?.displayTokenA?.coin_type, false),
            amount: currentFeesData?.displayFeeOwedA,
            amountUSD: amountValueA,
            token: ele?.displayTokenA
          },
          {
            coin_address: fixCoinType(ele?.displayTokenB?.coin_type, false),
            amount: currentFeesData?.displayFeeOwedB,
            amountUSD: amountValueB,
            token: ele?.displayTokenB
          }
        )
      }

      if (Object.values(rewardsData)?.length > 0) {
        const currentPosRewardsData = rewardsData[posId]
        if (currentPosRewardsData?.length > 0) {
          currentPosRewardsData.forEach((reward: any) => {
            rewarderAmount = d(rewarderAmount)
              .plus(reward.display_amount_owed || 0)
              .toString()
            if (Number(reward?.display_amount_owed) > 0) {
              const amountUSD = getTokenAmountValue(reward?.token?.coin_type, reward.display_amount_owed)
              if (amountUSD !== '--') {
                rewarderUsd = d(rewarderUsd).plus(amountUSD).toString()
              }
              pendingRewarderList.push({
                coin_address: fixCoinType(reward?.token?.coin_type, false),
                amount: reward.display_amount_owed,
                amountUSD,
                token: reward?.token
              })
            }
          })
        }
      }

      if (farmsData && Object.values(farmsData)?.length > 0) {
        posId = ele.id
        const currentPosFarmsData = farmsData[posId]
        if (currentPosFarmsData?.length > 0) {
          currentPosFarmsData.forEach((reward: any) => {
            farmsAmount = d(farmsAmount)
              .plus(reward.display_amount_owed || 0)
              .toString()
            if (Number(reward?.display_amount_owed) > 0) {
              const amountUSD = getTokenAmountValue(reward?.token.coin_type, reward.display_amount_owed)
              if (amountUSD !== '--') {
                farmsUsd = d(farmsUsd).plus(amountUSD).toString()
              }
              pendingFarmsList.push({
                coin_address: fixCoinType(reward?.token?.coin_type || '', false),
                amount: reward.display_amount_owed,
                amountUSD,
                token: reward?.token
              })
            }
          })
        }
      }

      const total = d(rewarderUsd).plus(feeOwedUsd).plus(farmsUsd).toString()
      const totalRewardUsd = (d(feeOwedAmount).gt(0) || d(rewarderAmount).gt(0) || d(farmsAmount).gt(0)) && Number(total) == 0 ? '--' : total

      totalAmount = d(totalAmount).plus(rewarderUsd).plus(feeOwedUsd).plus(farmsUsd).toString()
      if (Number(totalRewardUsd) !== 0) {
        amountGtZeroList.push(ele)
      }

      if (isHide && Number(totalRewardUsd) > Number(inputValue)) {
        result.push({
          ...ele,
          totalRewardUsd,
          pendingRewarderList,
          pendingFeesList,
          pendingFarmsList,
          rewarderUsd,
          feeOwedUsd,
          farmsUsd
        })
      }
      if (!isHide) {
        result.push({
          ...ele,
          totalRewardUsd,
          pendingRewarderList,
          pendingFeesList,
          pendingFarmsList,
          rewarderUsd,
          feeOwedUsd,
          farmsUsd
        })
      }
    })

    return { result, totalAmount, amountGtZeroList }
  }
  useEffect(() => {
    let finalResult: any = []
    let finalTotalAmount: string = '0'
    let finalAmountGtZeroList: any = []

    if (!showLoading) {
      // Process DLMM positions
      if (['DLMM', 'All'].includes(poolTab)) {
        const dlmmResult = processPositionList(dlmmPosBaseList, dlmmPosFeeData, dlmmPosRewardsData, undefined, true)
        finalResult = [...dlmmResult.result]
        finalTotalAmount = dlmmResult.totalAmount
        finalAmountGtZeroList = [...dlmmResult.amountGtZeroList]
      }
      if (['CLMM', 'All'].includes(poolTab)) {
        // Process CLMM positions
        const posResult = processPositionList(posBaseList, posFeeData, posRewardsData, farmsPosRewardsData)
        console.log(posResult, 'posResult')
        finalResult = [...finalResult, ...posResult.result]
        finalTotalAmount = d(finalTotalAmount).plus(posResult.totalAmount).toString()
        finalAmountGtZeroList = [...finalAmountGtZeroList, ...posResult.amountGtZeroList]
      }
    }

    setGtZeroList(finalAmountGtZeroList)
    const updatedList = finalResult
      .filter((ele: any) => Number(ele.totalRewardUsd) !== 0)
      .filter((u: any) => !userNotSelected.current?.includes(u?.posType === 'clmm' ? u?.posId : u?.id))
    setSelectList(updatedList)

    if (isHide) {
      setSelectType(updatedList?.length === finalResult.length ? 'all' : '')
    } else {
      setSelectType(updatedList?.length === finalAmountGtZeroList.length ? 'all' : '')
    }

    const posList = finalResult.sort((a: any, b: any) => b.totalRewardUsd - a.totalRewardUsd)

    setShowList(posList)
    setShowListLoading(false)
  }, [
    inputValue,
    isHide,
    showLoading,
    coinPriceObj,
    dlmmPosBaseList,
    posBaseList,
    dlmmPosFeeData,
    posFeeData,
    dlmmPosRewardsData,
    posRewardsData,
    farmsPosRewardsData,
    poolTab
  ])

  const { calculatePendingYield } = useCalculatePendingYield()

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ selectList: ~ clickSelectAll ~ updatedList:', {
      selectList,
      dlmmPosBaseList
    })
    if (selectList?.length > 0) {
      if (poolTab === 'All') {
        const { total, rewardAndFeeList }: any = calculatePendingYield(
          selectList,
          posFeeData,
          posRewardsData,
          farmsPosRewardsData,
          dlmmPosFeeData,
          dlmmPosRewardsData
        )
        console.log('🚀 ~ useEffect ~ total:', selectList, total, rewardAndFeeList)
        setTotalYield(total)
        setYieldList(rewardAndFeeList)
      }
      if (poolTab === 'CLMM') {
        const { total, rewardAndFeeList }: any = calculatePendingYield(selectList, posFeeData, posRewardsData, farmsPosRewardsData)
        console.log('🚀 ~ useEffect ~ total:', selectList, total, rewardAndFeeList)
        setTotalYield(total)
        setYieldList(rewardAndFeeList)
      }
      if (poolTab === 'DLMM') {
        const { total, rewardAndFeeList }: any = calculatePendingYield(selectList, {}, {}, {}, dlmmPosFeeData, dlmmPosRewardsData)
        setTotalYield(total)
        setYieldList(rewardAndFeeList)
      }
    } else {
      setTotalYield('')
      setYieldList([])
    }
  }, [selectList, posFeeData, posRewardsData, farmsPosRewardsData, dlmmPosBaseList, dlmmPosFeeData, dlmmPosRewardsData, poolTab])

  const selectItem = (item: any) => {
    console.log('🚀 ~ selectItem ~ item:', selectList, item)
    if (Number(item?.totalRewardUsd) <= 0) return
    const list = [...selectList]
    const index = list?.findIndex((el: any) => (el?.posType == 'clmm' ? el?.posId === item?.posId : el?.id === item?.id))
    let updatedList = [...selectList]
    console.log(userNotSelected.current, 'userNotSelected.current')
    if (index > -1) {
      updatedList = list?.filter((el: any) => (el?.posType == 'clmm' ? el?.posId !== item?.posId : el?.id !== item?.id)) || []
      userNotSelected.current.push(item?.posType === 'clmm' ? item?.posId : item?.id)
    } else {
      updatedList.push(item)
      userNotSelected.current = userNotSelected.current.filter(i => (item?.posType === 'clmm' ? i !== item?.posId : i !== item?.id))
    }

    console.log('🚀 ~ selectItem ~ updatedList:', updatedList)
    setSelectList(updatedList)

    if (isHide) {
      if (updatedList?.length !== showList?.length) {
        setSelectType('')
      } else {
        setSelectType('all')
      }
    } else {
      if (updatedList?.length !== gtZeroList?.length) {
        setSelectType('')
      } else {
        setSelectType('all')
      }
    }
  }

  useEffect(() => {
    setInputValue(0.01)
    setIsConfirm(false)
    setIsHide(true)
  }, [isOpen])

  const clickSelectAll = () => {
    console.log(selectType, 'selectType')
    if (selectType == 'all') {
      setSelectType('')
      setSelectList([])
      console.log(showList, 'clickSelectAll')
      userNotSelected.current = showList?.map((item: any) => {
        return item?.posType === 'clmm' ? item?.posId : item?.id
      })
    } else {
      setSelectType('all')
      const updatedList: any = [...selectList]
      const listObj = Object.fromEntries(selectList.map((item: any) => [item?.posType == 'clmm' ? item?.posId : item?.id, item]))

      showList.forEach((item: any) => {
        if (!listObj[item?.posType == 'clmm' ? item?.posId : item?.id] && Number(item.totalRewardUsd) !== 0) {
          updatedList.push(item)
        }
      })
      console.log('🚀 ~ clickSelectAll ~ updatedList:', listObj, updatedList)
      setSelectList(updatedList)
      userNotSelected.current = []
    }
  }
  const { fetchAccountBalance } = useAccountBalance()

  const [isDlmmSpitClaimOpen, setIsDlmmSpitClaimOpen] = useState(false)
  const { remindDlmmClaimRewardTips, setRemindDlmmClaimRewardTips } = useGlobalStore()

  const isNeedSpitDlmmClaim = useMemo(() => {
    if (remindDlmmClaimRewardTips) {
      const dlmmPosIdList = selectList.filter((item: any) => item.posType === 'dlmm').map((item: any) => item) as DlmmPosBaseInfo[]
      const batchDlmmPosList = spitClaimDlmmPosList(dlmmPosIdList, 1800)
      console.log('🚀 ~ isNeedSpitDlmmClaim ~ batchDlmmPosList:', batchDlmmPosList)
      return batchDlmmPosList.length > 1
    }
    return false
  }, [remindDlmmClaimRewardTips, selectList])

  const toClaimYield = async () => {
    changeClaimLoading(true)
    try {
      const rewardsObj: Record<string, PosReward[]> = Object.fromEntries(
        selectList.map((item: any) => [
          item?.posType == 'dlmm' ? item?.id : item?.posId,
          item?.posType == 'dlmm' ? item?.pendingRewarderList : [...item?.pendingFarmsList, ...item?.pendingRewarderList]
        ])
      )
      const { txs } = await getBatchHarvestFeeAndRewardsTxPayload(selectList, rewardsObj, currentAccount?.address)
      console.log('🚀 ~ toClaimYield ~ tx:', txs)
      const res = await batchSignAndExecuteTransaction(txs, {
        getShowInfo: (status: TransactionStatusType, _a, _b, otherParams: any) => {
          if (status === 'rejected') {
            const isPartialSuccess = otherParams?.failedResults && otherParams.failedResults.length > 0 && otherParams.successResults.length > 0
            // 部分成功
            if (isPartialSuccess) {
              if (otherParams.failedResults.length > 0) {
                const info: CommonTypeInfo = {
                  modalTitleText: 'Partial claim failed',
                  modalDescriptionText: 'Claim again to collect the remaining rewards.',
                  toastTitleText: 'Partial claim failed',
                  toastDescriptionContent: `Failed transactions ${otherParams.failedResults.length} /${otherParams.successResults.length + otherParams.failedResults.length} `
                }
                return info
              }
            }
          }

          // 全部成功
          if (status === 'success' && otherParams?.successResults && otherParams.successResults.length > 1) {
            const info: CommonTypeInfo = {
              modalDescriptionText: 'Claim Yield',
              toastTitleText: 'Claim',
              toastDescriptionContent: `Completed transactions ${txs.length} /${txs.length} `
            }
            return info
          }

          const info: CommonTypeInfo = {
            modalDescriptionText: 'Claim Yield',
            toastTitleText: 'Claim'
          }
          return info
        }
      })
      console.log('🚀 ~ toClaimYield ~ res:', res)

      if (res) {
        // 重新拿列表数据
        fetchAccountBalance()
        await getPositionBaseList(currentAccount?.address)
        // onClose()
      }
      changeClaimLoading(false)
    } catch (error) {
      changeClaimLoading(false)
      console.log('🚀 ~ toClaimYield ~ error:', error)
    } finally {
      onClose()
    }
  }

  const { isApp } = useWindowWidth()

  const posYieldValue = useMemo(() => {
    return {
      All: myPosYieldValue,
      CLMM: myClmmPosYieldValue,
      DLMM: myDlmmPosYieldValue
    }[poolTab]
  }, [poolTab, myPosYieldValue, myClmmPosYieldValue, myDlmmPosYieldValue])

  return isApp ? (
    <VaulDrawer isOpen={isOpen} onClose={onClose} padding="12px 12px 24px" wrapStyle={{ maxH: '90vh' }}>
      <PendingYieldHeader isConfirm={isConfirm} />
      <Box mt="12px">
        <VStack w="100%" gap="12px">
          <Box w="100%">
            <VStack justify="center" w="100%" h="66px" borderRadius="16px" bg="pending_yield_bg">
              <Skeleton isLoaded={!showLoading}>
                <VStack gap="4px" align="center">
                  <Text color="primary" fontSize="14px" fontWeight="500">
                    {formatCurrency(!isConfirm ? posYieldValue : totalYield, 2)}
                  </Text>
                  <Text color="primary_gray" fontSize="12px">
                    {isConfirm ? 'Total Claim' : 'Claimable Yield'}
                  </Text>
                </VStack>
              </Skeleton>
            </VStack>
          </Box>

          {!isConfirm && (
            <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" justify="space-between">
              <SelectTab
                type="outlineTab"
                tabList={poolTabList}
                currentTab={poolTab}
                handleChangeTab={tab => {
                  setPoolTab(tab?.label)
                }}
                isActive={(currentTab, tab) => currentTab === tab.label}
                wrapStyle={{
                  h: '30px',
                  p: '2px',
                  borderRadius: '8px',
                  gap: '8px',
                  w: 'min-content',
                  border: 'none',
                  bg: 'transparent'
                }}
                itemStyle={{
                  flex: 1,
                  minW: isApp ? 'auto' : '54px',
                  h: '24px',
                  p: '4px 6px',
                  fontSize: '14px',
                  borderRadius: '6px'
                }}
              />
              {/* <Text color="text_caption">Position</Text> */}
              <HStack justify="space-between">
                <HStack>
                  <Text fontSize="12px">{'Hide yield <'}</Text>

                  <Block borderRadius="8px" w="72px" h="24px" p="0" lineHeight="20px">
                    <Input textAlign="center" fontSize="12px" p="0px 12px" value={`$${inputValue}`} onChange={handleChange} onBlur={handleBlur} />
                  </Block>
                  <Switch isChecked={isHide} onChange={() => setIsHide(!isHide)} />
                </HStack>
                <HStack onClick={clickSelectAll}>
                  <CheckBox checked={selectType == 'all'} onClick={clickSelectAll} />
                  <Text color={selectType === 'all' ? 'primary' : 'text_caption'} fontSize="12px" fontWeight="500">
                    Select All
                  </Text>
                </HStack>
              </HStack>
            </Stack>
          )}

          <VStack w="100%" p="0" maxH="280px" overflow="auto" mr="-4px">
            {!isConfirm ? (
              showList?.length > 0 ? (
                showList?.map((item: any) => {
                  return (
                    <ModalItem
                      key={item?.posId || item?.id}
                      posInfo={item}
                      onClickCheckBox={item => selectItem(item)}
                      pageFrom="pendingYieldModal"
                      cursor={Number(item?.totalRewardUsd) <= 0 ? 'not-allowed' : 'pointer'}
                      checked={selectList.some((el: any) => (el?.posType == 'clmm' ? el?.posId === item?.posId : el?.id === item?.id))}
                    />
                  )
                })
              ) : showListLoading ? (
                [{}, {}]?.map((item: any, index) => {
                  return <LpBurnLoading key={index} />
                })
              ) : (
                <NoData type="nodata" />
              )
            ) : (
              yieldList?.map((item: any) => {
                console.log('🚀 ~ :[yieldList]?.map ~ item:', item)
                return (
                  <Block
                    key={item?.coin_address}
                    w="100%"
                    p="16px"
                    borderRadius="12px"
                    sx={{
                      _first: {
                        mt: '12px'
                      }
                    }}
                  >
                    <HStack w="100%" justify="space-between">
                      <SingleTokenInfo
                        token={item?.token}
                        imgBoxStyle={{ w: '32px', h: '32px' }}
                        haveName={false}
                        symbolFontSize="14px"
                        warningIcon={{ iconW: '16px', iconH: '16px' }}
                      />
                      <VStack align="flex-end" gap="4px">
                        <Text color="text_caption">{formatNumber(item?.amount, 6)}</Text>
                        <Text>({formatCurrency(item?.amountUSD, 2)})</Text>
                      </VStack>
                    </HStack>
                  </Block>
                )
              })
            )}
          </VStack>

          {!isConfirm ? (
            <Box w="100%" p="0">
              <HStack justify="space-between" w="100%" borderRadius="16px" p="0 0 12px 0">
                <Text color="primary_gray" fontSize="14px">
                  Amount selected
                </Text>
                <Text color="primary" fontSize="14px" fontWeight="500">
                  {formatCurrency(totalYield, 2)}
                </Text>
              </HStack>
            </Box>
          ) : (
            <HStack w="100%" p="12px 16px 20px" bg="bg_secondary" justify="center" mt="-8px">
              <Block
                cursor="pointer"
                w="168px"
                h="36px"
                lineHeight="34px"
                mt="12px"
                p="0"
                borderRadius="8px"
                onClick={() => setIsConfirm(false)}
                sx={{
                  _hover: {
                    p: {
                      color: 'text_caption'
                    },
                    svg: {
                      fill: 'text_caption'
                    }
                  }
                }}
              >
                <HStack justify="center" gap="4px">
                  <Icon xlinkHref="#icon-icon_ascending_nor" transform="rotate(-90deg)" />
                  <Text>Back</Text>
                </HStack>
              </Block>
            </HStack>
          )}
        </VStack>
        {!isConfirm ? (
          <Button
            isDisabled={Number(totalYield) <= 0}
            w="100%"
            h="42px"
            fontSize="14px"
            fontWeight="500"
            onClick={() => setIsConfirm(true)}
            borderRadius="8px"
          >
            Claim Yield
          </Button>
        ) : (
          <Button
            borderRadius="8px"
            mb="-1px"
            isLoading={claimLoading}
            isDisabled={yieldList?.length == 0 || claimLoading}
            w="100%"
            h="42px"
            fontWeight="500"
            onClick={() => {
              if (isNeedSpitDlmmClaim) {
                setIsDlmmSpitClaimOpen(true)
              } else {
                toClaimYield()
              }
            }}
          >
            Confirm
          </Button>
        )}
      </Box>
    </VaulDrawer>
  ) : (
    <>
      <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent minWidth={isApp ? '300px' : '446px'}>
          <ModalHeader>
            <PendingYieldHeader isConfirm={isConfirm} />
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p="16px 0px 0" textAlign="center">
            <Box>
              <VStack w="100%">
                <Box w="100%" p="0 16px">
                  <VStack justify="center" w="100%" h="90px" borderRadius="16px" bg="pending_yield_bg">
                    <Skeleton isLoaded={!showLoading}>
                      <VStack gap="4px" align="center">
                        <Text color="primary_gray">{isConfirm ? 'Total Claim' : 'Claimable Yield'}</Text>
                        <Text color="primary" fontSize="20px" fontWeight="500">
                          {formatCurrency(!isConfirm ? posYieldValue : totalYield, 2)}
                        </Text>
                      </VStack>
                    </Skeleton>
                  </VStack>
                </Box>

                {!isConfirm && (
                  <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" p="0 16px" justify="space-between" mt="12px">
                    <SelectTab
                      type="outlineTab"
                      tabList={poolTabList}
                      currentTab={poolTab}
                      handleChangeTab={tab => {
                        setPoolTab(tab?.label)
                      }}
                      isActive={(currentTab, tab) => currentTab === tab.label}
                      wrapStyle={{
                        h: '30px',
                        p: '2px',
                        borderRadius: '8px',
                        gap: '0px',
                        w: 'auto'
                      }}
                      itemStyle={{
                        flex: 1,
                        minW: isApp ? 'auto' : '54px',
                        h: '24px',
                        p: '2px 8px',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}
                    />
                    {/* <Text color="text_caption">Position</Text> */}
                    <HStack justify="flex-end">
                      <Switch isChecked={isHide} onChange={() => setIsHide(!isHide)} />
                      <Text color="text_caption" fontSize="12px">
                        {'Hide yield <'}
                      </Text>
                      <Block borderRadius="8px" w="72px" h="24px" p="0" lineHeight="20px">
                        <Input textAlign="center" fontSize="12px" p="0px 12px" value={`$${inputValue}`} onChange={handleChange} onBlur={handleBlur} />
                      </Block>
                    </HStack>
                  </Stack>
                )}

                <VStack w="100%" p="0 16px 16px" maxH="370px" overflow="auto" pr={showList?.length > 2 ? '16px' : '20px'} mr="-4px">
                  {!isConfirm ? (
                    showList?.length > 0 ? (
                      showList?.map((item: any) => {
                        return (
                          <ModalItem
                            key={item?.posId || item?.id}
                            posInfo={item}
                            onClickCheckBox={item => selectItem(item)}
                            pageFrom="pendingYieldModal"
                            cursor={Number(item?.totalRewardUsd) <= 0 ? 'not-allowed' : 'pointer'}
                            checked={selectList.some((el: any) => (el?.posType == 'clmm' ? el?.posId === item?.posId : el?.id === item?.id))}
                          />
                        )
                      })
                    ) : showListLoading ? (
                      [{}, {}]?.map((item: any, index) => {
                        return <LpBurnLoading key={index} />
                      })
                    ) : (
                      <NoData type="nodata" />
                    )
                  ) : (
                    yieldList?.map((item: any) => {
                      console.log('🚀 ~ :[yieldList]?.map ~ item:', item)
                      return (
                        <Block
                          key={item?.coin_address}
                          w="100%"
                          p="16px"
                          borderRadius="12px"
                          sx={{
                            _first: {
                              mt: '12px'
                            }
                          }}
                        >
                          <HStack w="100%" justify="space-between">
                            <SingleTokenInfo
                              token={item?.token}
                              imgBoxStyle={{ w: '32px', h: '32px' }}
                              haveName={false}
                              symbolFontSize="14px"
                              warningIcon={{ iconW: '16px', iconH: '16px' }}
                            />
                            <VStack align="flex-end" gap="4px">
                              <Text color="text_caption">{formatNumber(item?.amount, 6)}</Text>
                              <Text>({formatCurrency(item?.amountUSD, 2)})</Text>
                            </VStack>
                          </HStack>
                        </Block>
                      )
                    })
                  )}
                </VStack>

                {!isConfirm ? (
                  <Box w="100%" p="12px 16px 20px" bg="bg_secondary" mt="-8px">
                    <HStack justify="space-between" w="100%" h="90px" borderRadius="16px" bg="pending_yield_bg" p="20px 16px">
                      <VStack gap="4px" align="flex-start">
                        <Text color="primary_gray">Amount selected</Text>
                        <Text color="primary" fontSize="18px" fontWeight="500">
                          {formatCurrency(totalYield, 2)}
                        </Text>
                      </VStack>
                      <HStack>
                        <Text color="text_caption">Select All</Text>
                        <CheckBox checked={selectType == 'all'} onClick={clickSelectAll} />
                      </HStack>
                    </HStack>
                  </Box>
                ) : (
                  <HStack w="100%" p="12px 16px 20px" bg="bg_secondary" justify="center" mt="-8px">
                    <Block
                      cursor="pointer"
                      w="168px"
                      h="36px"
                      lineHeight="34px"
                      mt="12px"
                      p="0"
                      borderRadius="8px"
                      onClick={() => setIsConfirm(false)}
                      sx={{
                        _hover: {
                          p: {
                            color: 'text_caption'
                          },
                          svg: {
                            fill: 'text_caption'
                          }
                        }
                      }}
                    >
                      <HStack justify="center" gap="4px">
                        <Icon xlinkHref="#icon-icon_ascending_nor" transform="rotate(-90deg)" />
                        <Text>Back</Text>
                      </HStack>
                    </Block>
                  </HStack>
                )}
              </VStack>
              {!isConfirm ? (
                <Button mb="-1px" isDisabled={Number(totalYield) <= 0} w="100%" h="52px" fontWeight="500" onClick={() => setIsConfirm(true)}>
                  Claim Yield
                </Button>
              ) : (
                <Button
                  mb="-1px"
                  isLoading={claimLoading}
                  isDisabled={yieldList?.length == 0 || claimLoading}
                  w="100%"
                  h="52px"
                  fontWeight="500"
                  onClick={() => {
                    if (isNeedSpitDlmmClaim) {
                      setIsDlmmSpitClaimOpen(true)
                    } else {
                      toClaimYield()
                    }
                  }}
                >
                  Confirm
                </Button>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      {remindDlmmClaimRewardTips && (
        <DlmmSpitClaimModal
          isOpen={isDlmmSpitClaimOpen}
          onClose={() => setIsDlmmSpitClaimOpen(false)}
          handleContinue={isChecked => {
            toClaimYield()
            setRemindDlmmClaimRewardTips(!isChecked)
          }}
        />
      )}
    </>
  )
}

const PendingYieldHeader = ({ isConfirm }: { isConfirm: boolean }) => {
  return (
    <Heading fontWeight="500" fontSize="16px">
      {!isConfirm ? 'Details' : 'Claim Yield'}
    </Heading>
  )
}

type DlmmSpitClaimModalProps = {
  isOpen: boolean
  onClose: () => void
  handleContinue: (isChecked: boolean) => void
}

function DlmmSpitClaimModal({ isOpen, onClose, handleContinue }: DlmmSpitClaimModalProps) {
  const { isApp } = useWindowWidth()
  const [checked, setChecked] = useState(false)
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minWidth={isApp ? '300px' : '446px'}>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Tips
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p="16px" textAlign="center">
          <VStack w="100%" gap="16px">
            <Text color="text_caption" fontSize="14px" lineHeight="20px" textAlign="start">
              Because your DLMM positions span a large number of bins, some actions may require multiple transaction approvals in your wallet.
            </Text>

            <Block borderRadius="12px" p="12px">
              <HStack
                sx={{
                  div: {
                    svg: { fill: '#000 !important', width: '16px', height: '16px' }
                  }
                }}
              >
                <CheckBox
                  height="16px"
                  width="16px"
                  wrapStyle={{
                    border: '1px solid',
                    borderColor: !checked ? 'primary' : 'transparent',
                    bg: checked ? 'primary' : 'transparent'
                  }}
                  checked={checked}
                  onClick={() => {
                    const newChecked = !checked
                    setChecked(newChecked)
                  }}
                />
                <Text fontSize="12px">Don't remind me again.</Text>
              </HStack>
            </Block>

            <HStack w="100%" gap="16px">
              <Button
                w="100%"
                fontSize="14px"
                variant="outline"
                onClick={() => {
                  onClose()
                }}
              >
                Cancel
              </Button>
              <Button
                w="100%"
                fontSize="14px"
                onClick={() => {
                  handleContinue(checked)
                  onClose()
                }}
              >
                Continue
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
