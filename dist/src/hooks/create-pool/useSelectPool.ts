import { PoolType } from '@/components/pools/createPool/SelectPoolType'
import { FeeTier } from '@/components/selectPool/type'
import useCreatePoolHelper from '@/hooks/create-pool/useCreatePoolHelper'
import useQuoteWhiteTokenList from '@/hooks/create-pool/useQuoteWhiteTokenList'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import { isTrustedToken } from '@/utils'
import { clmmDefaultFeeOptions } from '@cetus/design/src/components/common/feeSelect/config'
import { BinStepType, DlmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import { useSdk } from '@cetus/sdk-factory'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useDisclosure } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function useSelectPool() {
  const navigate = useNavigate()
  const [baseToken, setBaseToken] = useState<Token | undefined>()
  const [quoteToken, setQuoteToken] = useState<Token | undefined>(envConfigs.sui_coin)
  const [feeTier, setFeeTier] = useState<FeeTier | undefined>(undefined)
  const [feeTierList, setFeeTierList] = useState<FeeTier[]>([])
  const { fetchFeeTierList, getBinStepConfigs } = useCreatePoolHelper()
  const { quoteWhiteTokenList } = useQuoteWhiteTokenList()
  const { poolType, setPoolType, setCurrentStep } = useCreatePoolStore()
  const { binStepConfig } = useBinStepConfigStore()
  const [baseFee, setBaseFee] = useState<Pick<BinStepType, 'fee' | 'feeDisplay'> | undefined>(undefined)
  const [feeOptions, setFeeOptions] = useState<any[]>([])
  const [binStep, setBinStep] = useState<any>(undefined)
  const dlmmSdk = useSdk('dlmm')
  const [searchParams, setSearchParams] = useSearchParams()
  const paramsPoolType = searchParams.get('poolType')
  const [getBinStepListLoading, setGetBinStepListLoading] = useState<boolean>(false)
  const onPoolTypeChange = (type: PoolType) => {
    // const newSearchParams = new URLSearchParams(searchParams)
    // newSearchParams.set('poolType', type)
    // navigate(`/select-pool?${newSearchParams.toString()}`)
    // setPoolType(type)
    setSearchParams({ poolType: type })
  }

  useEffect(() => {
    setPoolType(paramsPoolType === 'dlmm' ? 'dlmm' : 'clmm')
  }, [paramsPoolType])
  const updateFeeTierList = () => {
    if (baseToken && quoteToken) {
      fetchFeeTierList(baseToken.coin_type, quoteToken.coin_type).then(res => {
        setFeeTierList(
          res?.map(item => {
            const title = res.find(feeTier => feeTier.feeRate === item.feeRate)?.title || item.title
            return {
              ...item,
              description: undefined,
              disabled:
                title === 'Not Created' && !isTrustedToken(baseToken, quoteWhiteTokenList) && !isTrustedToken(quoteToken, quoteWhiteTokenList)
                  ? true
                  : false
            }
          }) as any
        )
      })
    } else {
      setFeeTierList(
        clmmDefaultFeeOptions?.map(item => ({
          ...item,
          description: undefined,
          title: ''
        })) as any
      )
    }
  }

  const updateBinStepList = () => {
    if (baseFee) {
      if (baseToken && quoteToken) {
        const binStepList = binStepConfig?.find(item => item?.fee === baseFee.fee)?.binStepList
        if (binStepList) {
          setFeeOptions(
            binStepList?.map(item => ({
              ...item,
              description: undefined,
              title: ''
            }))
          )
        }
        setGetBinStepListLoading(true)

        getBinStepConfigs(baseFee, baseToken?.coin_type, quoteToken?.coin_type)
          .then(res => {
            if (res) {
              setFeeOptions(
                res?.map(item => {
                  const title = res.find(feeTier => feeTier.fee === item.fee)?.title || item.title
                  return {
                    ...item,
                    description: undefined,
                    disabled:
                      title === 'Not Created' && !isTrustedToken(baseToken, quoteWhiteTokenList) && !isTrustedToken(quoteToken, quoteWhiteTokenList)
                        ? true
                        : false
                  }
                })
              )
            }
            setGetBinStepListLoading(false)
          })
          .catch(() => {
            setGetBinStepListLoading(false)
          })
      } else {
        const binStepList = binStepConfig?.find(item => item?.fee === baseFee.fee)?.binStepList
        if (binStepList) {
          setFeeOptions(
            binStepList?.map(item => ({
              ...item,
              description: undefined,
              title: ''
            }))
          )
        }
      }
    }
  }

  useEffect(() => {
    if (poolType === 'clmm') {
      updateFeeTierList()
    }
    if (baseFee && poolType === 'dlmm') {
      updateBinStepList()
    }
  }, [baseToken?.coin_type, quoteToken?.coin_type, poolType, baseFee])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const onContinue = async () => {
    if (feeTier && poolType === 'clmm') {
      if (feeTier.poolAddress) {
        navigate(`/clmm?tab=deposit&poolAddress=${feeTier.poolAddress}`)
      } else {
        onOpen()
      }
    }
    if (binStep && poolType === 'dlmm') {
      if (binStep?.poolAddress) {
        navigate(`/dlmm?tab=deposit&poolId=${binStep.poolAddress}`)
      } else {
        if (baseToken?.coin_type && quoteToken?.coin_type) {
          try {
            const address = await dlmmSdk?.Pool?.getPoolAddress(
              fixCoinType(baseToken?.coin_type, true),
              fixCoinType(quoteToken?.coin_type, true),
              binStep?.binStep,
              binStep?.baseFactor
            )
            if (address) {
              setBinStep({ ...binStep, poolAddress: address })
              navigate(`/dlmm?tab=deposit&poolId=${address}`)
            } else {
              onOpen()
            }
          } catch (error) {
            onOpen()
          }
        }
      }
    }
  }

  const onConfirm = () => {
    if (baseToken && quoteToken && feeTier && poolType === 'clmm') {
      // create pool
      setCurrentStep(2)
      navigate(`/create-pool/${baseToken?.coin_type}/${quoteToken?.coin_type}/${feeTier?.feeRate}?poolType=clmm`)
    }
    if (baseToken && quoteToken && binStep && poolType === 'dlmm') {
      setCurrentStep(2)
      navigate(`/create-pool/${baseToken?.coin_type}/${quoteToken?.coin_type}/${binStep?.fee}?poolType=dlmm`)
    }
  }

  const handleBaseFeeChange = async (baseFee: DlmmSelectFeeType | undefined) => {
    if (baseFee) {
      setBaseFee({ fee: baseFee.fee, feeDisplay: baseFee.feeDisplay })
    } else {
      setBaseFee(undefined)
    }
    setBinStep(undefined)
  }
  const handleBinStepChange = async (binStep: any, baseCoinType?: string, quoteCoinType?: string) => {
    if (!binStep?.poolAddress && baseCoinType && quoteCoinType) {
      try {
        const address = await dlmmSdk?.Pool?.getPoolAddress(
          fixCoinType(baseCoinType, true),
          fixCoinType(quoteCoinType, true),
          binStep?.binStep,
          binStep?.baseFactor
        )
        if (address) {
          setBinStep({ ...binStep, poolAddress: address })
        } else {
          setBinStep(binStep)
        }
      } catch (error) {
        setBinStep(binStep)
      }
    } else {
      setBinStep(binStep)
    }
  }

  return {
    poolType,
    onContinue,
    baseToken,
    quoteToken,
    setBaseToken,
    setQuoteToken,
    feeTier,
    setFeeTier,
    feeTierList,
    onPoolTypeChange,
    isOpen,
    onClose,
    onConfirm,
    handleBinStepChange,
    feeOptions,
    binStep,
    baseFee,
    handleBaseFeeChange,
    getBinStepListLoading
  }
}

export default useSelectPool
