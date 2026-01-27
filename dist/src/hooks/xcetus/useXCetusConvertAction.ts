import useTransaction from '@/hooks/common/useTransaction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { MsafeTransactionSubType } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo, TransactionStatusType } from '@cetus/types/src/common-types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { addComma, d } from '@cetus/utils'
import { toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { ConvertParams } from '@cetusprotocol/xcetus-sdk'
import { useMemo, useState } from 'react'
import { useGetOwnerVeNFT } from './useXCetusHelper'

export default function useXCetusConvertAction() {
  const { fetchAccountBalance } = useAccountBalance()
  const { signAndExecuteTransaction } = useTransaction()
  const { currentAccount } = useAccountStore()
  const { fetchOwnerVeNFT } = useGetOwnerVeNFT()

  const xCetusSdk = useSdk('xcetus')
  const { veNFT } = useXCetusStore()

  const [inputAmountFrom, setInputAmountFrom] = useState<string>('')
  const [inputAmountTo, setInputAmountTo] = useState<string>('')

  const { balanceInfo: balanceInfoFrom } = useGetTokenBalance(envConfigs.cetus_coin)

  const handleInputChange = (amount: string) => {
    setInputAmountFrom(amount)
    setInputAmountTo(amount)
  }

  const [convertLoading, setConvertLoading] = useState<boolean>(false)
  const handleConvertClick = async () => {
    try {
      setConvertLoading(true)

      const params: ConvertParams = {
        venft_id: veNFT?.id,
        amount: toDecimalsAmount(inputAmountFrom, 9)
      }
      const txb = await xCetusSdk!.XCetusModule.convertPayload(params)

      const res = await signAndExecuteTransaction(
        txb,
        {
          getShowInfo: (status: TransactionStatusType) => {
            const descriptionText = `Converting ${addComma(inputAmountFrom)} CETUS to ${addComma(inputAmountFrom)} xCETUS`
            const info: CommonTypeInfo = {
              modalTitleText: 'Convert',
              modalDescriptionText: descriptionText,
              toastDescriptionContent: descriptionText
            }

            if (status === 'success') {
              const text = descriptionText.replace('Converting', 'Converted')
              info.modalDescriptionText = text
              info.toastDescriptionContent = text
            }

            return info
          }
        },
        {
          msafeParams: {
            action: MsafeTransactionSubType.xCETUSConvert,
            txbParams: params
          }
        }
      )
      setConvertLoading(false)

      if (res) {
        setInputAmountFrom('')
        setInputAmountTo('')
        // 刷新余额
        setTimeout(() => {
          fetchAccountBalance()
          if (currentAccount) {
            fetchOwnerVeNFT(currentAccount?.address, true)
          }
        }, 2000)
      }
    } catch (error) {
      setConvertLoading(false)
    }
  }

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Convert',
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
    if (+inputAmountFrom && d(inputAmountFrom).gt(balanceInfoFrom?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient CETUS Balance`
      return btnInfo
    }

    return btnInfo
  }, [balanceInfoFrom?.balanceFormat, currentAccount?.address, inputAmountFrom])

  return {
    inputAmountFrom,
    inputAmountTo,
    handleInputChange,
    balanceInfoFrom,
    convertLoading,
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled,
    handleConvertClick
  }
}
