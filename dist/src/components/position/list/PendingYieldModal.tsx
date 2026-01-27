import useTransaction from '@/hooks/common/useTransaction'
import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import usePosClaimFeeAndReward from '@/hooks/position/usePosClaimFeeAndReward'
import usePositionList from '@/hooks/position/usePositionList'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { Block } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { useAccountBalance } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { CommonTypeInfo } from '@cetus/types'
import { CheckBox, Icon, NoData } from '@cetus/ui-kit'
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
  Switch,
  Text,
  VStack
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LpBurnLoading } from '../LpBurnPrevContent'
import ModalItem from '../ModalItem'

interface PendingYieldModalProps {
  isOpen: boolean
  claimLoading: boolean
  onClose: () => void
  changeClaimLoading: (status: boolean) => void
}
export default function PendingYieldModal({ isOpen, claimLoading, onClose, changeClaimLoading }: PendingYieldModalProps) {
  const [isConfirm, setIsConfirm] = useState(false)
  const { coinPriceObj } = useTokenPriceStore()
  const { getPosRelatedData, getPositionBaseList } = usePositionList()
  const { signAndExecuteTransaction } = useTransaction()
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

  const {
    myPosYieldValue,
    posBaseList,
    posBaseListLoading,
    posFeeDataLoading,
    posRewardsDataLoading,
    farmsPosRewardsDataLoading,
    posFeeData,
    posRewardsData,
    farmsPosRewardsData
  } = usePositionStore()

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

  const showLoading = posBaseListLoading || posFeeDataLoading || posRewardsDataLoading || farmsPosRewardsDataLoading

  useEffect(() => {
    const result: any = []
    let totalAmount: string = '0'
    const amountGtZeroList: any = []
    // Object.values(coinPriceObj).length > 0 &&
    if (posBaseList?.length > 0 && !posBaseListLoading && !posFeeDataLoading && !posRewardsDataLoading && !farmsPosRewardsDataLoading) {
      posBaseList.forEach((ele: any, index) => {
        let feeOwedAmount: string = '0'
        let rewarderAmount: string = '0'
        let farmsAmount: string = '0'
        let feeOwedUsd: string = '0'
        let rewarderUsd: string = '0'
        let farmsUsd: string = '0'
        const pendingRewarderList: any = []
        const pendingFeesList: any = []
        const pendingFarmsList: any = []

        if (Object.values(posFeeData)?.length > 0) {
          const currentFeesData = posFeeData[ele?.posId]
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

        if (Object.values(posRewardsData)?.length > 0) {
          const currentPosRewardsData = posRewardsData[ele?.posId]
          if (currentPosRewardsData?.length > 0) {
            currentPosRewardsData.forEach((reward: any) => {
              rewarderAmount = d(rewarderAmount)
                .plus(reward.display_amount_owed || 0)
                .toString()
              if (Number(reward?.display_amount_owed) > 0) {
                const amountUSD = getTokenAmountValue(reward?.token.coin_type, reward.display_amount_owed)
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

        if (Object.values(farmsPosRewardsData)?.length > 0) {
          const currentPosFarmsData = farmsPosRewardsData[ele?.id]
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
      // console.log('🚀 ~ constshowListposBaseList.forEach ~ result:', selectList, result)
      setGtZeroList(amountGtZeroList)
      const updatedList = result.filter((ele: any) => Number(ele.totalRewardUsd) !== 0)
      setSelectList(updatedList)

      console.log('🚀 ~ constshowListposBaseList:any=useMemo ~ selectList:', updatedList, selectList)
      if (isHide) {
        if (updatedList?.length !== result.length) {
          setSelectType('')
        } else {
          setSelectType('all')
        }
      } else {
        if (updatedList?.length !== amountGtZeroList.length) {
          setSelectType('')
        } else {
          setSelectType('all')
        }
      }
      const posList = result.sort((a, b) => {
        return b.totalRewardUsd - a.totalRewardUsd
      })
      setShowList(posList)
      setShowListLoading(false)
    }
  }, [inputValue, posBaseList, isHide, posBaseListLoading, posFeeDataLoading, posRewardsDataLoading, farmsPosRewardsDataLoading, coinPriceObj])

  const { calculatePendingYield } = useCalculatePendingYield()

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ selectList: ~ clickSelectAll ~ updatedList:', selectList)
    if (selectList?.length > 0) {
      const { total, rewardAndFeeList }: any = calculatePendingYield(selectList, posFeeData, posRewardsData, farmsPosRewardsData)
      console.log('🚀 ~ useEffect ~ total:', selectList, total, rewardAndFeeList)
      setTotalYield(total)
      setYieldList(rewardAndFeeList)
    } else {
      setTotalYield('')
      setYieldList([])
    }
  }, [selectList?.length, posFeeData, posRewardsData, farmsPosRewardsData])

  const selectItem = (item: any) => {
    console.log('🚀 ~ selectItem ~ item:', item)
    if (Number(item?.totalRewardUsd) <= 0) return
    const list = selectList
    const updatedList = list?.filter((el: any) => el?.posId !== item?.posId) || []
    if (!list?.some((el: any) => el?.posId === item?.posId)) {
      updatedList.push(item)
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
    if (selectType == 'all') {
      setSelectType('')
      setSelectList([])
    } else {
      setSelectType('all')
      const updatedList: any = selectList
      const listObj = Object.fromEntries(selectList.map((item: any) => [item?.posId, item]))

      showList.forEach((item: any) => {
        if (!listObj[item?.posId] && Number(item.totalRewardUsd) !== 0) {
          updatedList.push(item)
        }
      })
      console.log('🚀 ~ clickSelectAll ~ updatedList:', listObj, updatedList)
      setSelectList(updatedList)
    }
  }
  const { fetchAccountBalance } = useAccountBalance()
  const toClaimYield = async () => {
    changeClaimLoading(true)
    try {
      const rewardsObj = Object.fromEntries(selectList.map((item: any) => [item?.posId, item?.pendingRewarderList]))
      const { tx, txb } = await getBatchHarvestFeeAndRewardsTxPayload(selectList, rewardsObj, currentAccount?.address)
      console.log('🚀 ~ toClaimYield ~ tx:', tx)
      const res = await signAndExecuteTransaction(txb, {
        getShowInfo: () => {
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
        const list = await getPositionBaseList(currentAccount?.address)
        getPosRelatedData(list as PosBaseInfo[])
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

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minWidth={isApp ? '300px' : '446px'}>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            {!isConfirm ? 'Details' : 'Claim Yield'}
          </Heading>
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
                        {formatCurrency(!isConfirm ? myPosYieldValue : totalYield, 2)}
                      </Text>
                    </VStack>
                  </Skeleton>
                </VStack>
              </Box>

              {!isConfirm && (
                <HStack w="100%" p="0 16px" justify="space-between" mt="12px">
                  <Text color="text_caption">Position</Text>
                  <HStack w="calc(100% - 50px)" justify="flex-end">
                    <Switch isChecked={isHide} onChange={() => setIsHide(!isHide)} />
                    <Text color="text_caption" fontSize="12px">
                      {'Hide yield <'}
                    </Text>
                    <Block borderRadius="8px" w="72px" h="24px" p="0" lineHeight="20px">
                      <Input textAlign="center" fontSize="12px" p="0px 12px" value={`$${inputValue}`} onChange={handleChange} onBlur={handleBlur} />
                    </Block>
                  </HStack>
                </HStack>
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
                          checked={selectList.some((el: any) => el?.posId === item?.posId)}
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
                onClick={toClaimYield}
              >
                Confirm
              </Button>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
