import useTransaction from '@/hooks/common/useTransaction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { MsafeTransactionSubType } from '@/types'
import { isDecimalWithZeros } from '@/utils'
import { useAccountBalance } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo, TransactionStatusType } from '@cetus/types/src/common-types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { Decimal, addComma, d, fromDecimalsAmountFix } from '@cetus/utils'
import { toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { RedeemLockParams } from '@cetusprotocol/xcetus-sdk'
import { useMemo, useState } from 'react'
import { useGetOwnerVeNFT } from './useXCetusHelper'

export default function useXCetusRedeemAction(availableXCetusAmount: string) {
  const { fetchAccountBalance } = useAccountBalance()
  const { signAndExecuteTransaction } = useTransaction()
  const { currentAccount } = useAccountStore()
  const { fetchOwnerVeNFT } = useGetOwnerVeNFT()

  const xCetusSdk = useSdk('xcetus')
  const { veNFT } = useXCetusStore()

  const [inputAmountFrom, setInputAmountFrom] = useState<string>('')
  const [inputAmountTo, setInputAmountTo] = useState<string>('')
  const [day, setDay] = useState<number>(180)
  const [percent, setPercent] = useState<string>('')
  const [fixInputFrom, setFixInputFrom] = useState<boolean>(true)

  const { balanceInfo: balanceInfoTo } = useGetTokenBalance(envConfigs.cetus_coin)

  // 处理输入
  const handleInputChange = (amount: string, fixInputFrom: boolean) => {
    setFixInputFrom(fixInputFrom)
    if (fixInputFrom) {
      setInputAmountFrom(amount)
    } else {
      setInputAmountTo(amount)
    }

    calculateAmount(amount, fixInputFrom, day)
  }

  // 处理day 输入
  const handleDayChange = (day: number) => {
    setDay(day)
    calculateAmount(fixInputFrom ? inputAmountFrom : inputAmountTo, fixInputFrom, day)
  }

  const calculateAmount = async (amount: string, fixInputFrom: boolean, day: number) => {
    if (+amount) {
      const amountF = toDecimalsAmount(amount, 9)
      if (fixInputFrom) {
        const amountInfo = await xCetusSdk!.XCetusModule.redeemNum(amountF, day)

        setInputAmountTo(fromDecimalsAmountFix(amountInfo.amount_out, 9))
        setPercent(d(amountInfo.percent).mul(100).toFixed(2, Decimal.ROUND_DOWN))
      } else {
        const amountInfo = await xCetusSdk!.XCetusModule.reverseRedeemNum(amountF, day)
        setInputAmountFrom(fromDecimalsAmountFix(amountInfo.amount_out, 9))
        setPercent(d(amountInfo.percent).mul(100).toFixed(2, Decimal.ROUND_DOWN))
      }
    } else {
      if (!amount && isDecimalWithZeros(amount)) {
        setInputAmountFrom('')
        setInputAmountTo('')
        setPercent('')
      } else {
        fixInputFrom ? setInputAmountTo('') : setInputAmountFrom('')
        setPercent('')
      }
    }
  }

  const [convertLoading, setConvertLoading] = useState<boolean>(false)
  const handleConvertClick = async () => {
    if (!veNFT) {
      return
    }
    setConvertLoading(true)

    const params: RedeemLockParams = {
      venft_id: veNFT.id,
      amount: toDecimalsAmount(inputAmountFrom, 9),

      lock_day: day
    }
    const txb = xCetusSdk!.XCetusModule.redeemLockPayload(params)

    const res = await signAndExecuteTransaction(
      txb,
      {
        getShowInfo: (status: TransactionStatusType) => {
          const descriptionText = `Redeeming ${addComma(inputAmountFrom)} xCETUS to ${addComma(inputAmountTo)} CETUS`
          const info: CommonTypeInfo = {
            modalTitleText: 'Redeem',
            modalDescriptionText: descriptionText,
            toastDescriptionContent: descriptionText
          }

          if (status === 'success') {
            const text = descriptionText.replace('Redeeming', 'Redeemed')
            info.modalDescriptionText = text
            info.toastDescriptionContent = text
          }

          return info
        }
      },
      {
        msafeParams: {
          action: MsafeTransactionSubType.xCETUSRedeemLock,
          txbParams: params
        }
      }
    )
    setConvertLoading(false)

    if (res) {
      if (currentAccount) {
        setTimeout(() => {
          fetchOwnerVeNFT(currentAccount?.address, true)
        }, 2000)
      }
      setInputAmountFrom('')
      setInputAmountTo('')
      // 刷新余额
      fetchAccountBalance()
    }
  }

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Redeem',
      disabled: false
    }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // 判断输入
    if (!+inputAmountFrom) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    //判断余额
    if (+inputAmountFrom && d(inputAmountFrom).gt(availableXCetusAmount || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient xCETUS Balance`
      return btnInfo
    }

    return btnInfo
  }, [availableXCetusAmount, currentAccount?.address, inputAmountFrom])

  return {
    inputAmountFrom,
    inputAmountTo,
    handleInputChange,
    balanceInfoTo,
    convertLoading,
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled,
    handleConvertClick,
    day,
    handleDayChange,
    percent
  }
}
