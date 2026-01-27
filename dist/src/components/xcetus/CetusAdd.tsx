import useXCetusConvertAction from '@/hooks/xcetus/useXCetusConvertAction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { TradeInputGroup } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { IconProps } from '@cetus/ui-kit/src/components/Icon'
import { fromDecimalsAmountFix } from '@cetus/utils'
import { Button, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import XCetusConvertConfirmModel from '../modal/XCetusConvertConfirmModel'

type CetusAddProps = {
  availableXCetusAmount: string
  iconParams: IconProps
  onIconClick: () => void
  onClose?: () => void
}

export function CetusAdd(props: CetusAddProps) {
  const { availableXCetusAmount, iconParams, onIconClick, onClose } = props
  const { currentAccount, onWalletModal } = useAccountStore()
  const { inputAmountFrom, inputAmountTo, handleInputChange, balanceInfoFrom, btnText, btnDisabled, handleConvertClick, convertLoading } =
    useXCetusConvertAction()

  const { showConvertModel } = useXCetusStore()
  const [isOpenModel, setIsOpenModel] = useState<boolean>(false)

  return (
    <VStack w="100%" gap="8px">
      <TradeInputGroup
        onClick={onIconClick}
        borderRadius="12px"
        from={{
          wrapStyle: {
            borderRadius: '12px'
          },
          title: 'From',
          balance: balanceInfoFrom?.balanceFormat || '',
          value: inputAmountFrom,
          amountValue: undefined,
          loading: false,
          onChange: value => {
            handleInputChange(value)
          },
          selectable: false,
          placeholder: '0.0',
          token: envConfigs.cetus_coin
        }}
        to={{
          wrapStyle: {
            borderRadius: '12px'
          },
          title: 'To',
          balance: fromDecimalsAmountFix(availableXCetusAmount, 9),
          value: inputAmountTo,
          half: false,
          max: false,
          amountValue: undefined,
          onChange: value => {
            handleInputChange(value)
          },
          selectable: false,
          placeholder: '0.0',
          token: envConfigs.x_cetus_coin
        }}
        iconParams={iconParams}
      />

      <Button
        w="100%"
        borderRadius="12px"
        h="52px"
        fontSize="18px"
        fontWeight="500"
        isDisabled={btnDisabled || convertLoading}
        isLoading={convertLoading}
        onClick={() => {
          console.log(currentAccount, showConvertModel, 'showConvertModel')
          if (currentAccount) {
            if (showConvertModel) {
              setIsOpenModel(true)
            } else {
              handleConvertClick().then(() => {
                onClose && onClose()
              })
            }
          } else {
            onWalletModal(true)
          }
        }}
      >
        {btnText}
      </Button>

      {isOpenModel && (
        <XCetusConvertConfirmModel
          isOpen={isOpenModel}
          onClose={() => {
            setIsOpenModel(false)
          }}
          onSubmitClick={() => {
            setIsOpenModel(false)
            handleConvertClick().then(() => {
              onClose && onClose()
            })
          }}
        />
      )}
    </VStack>
  )
}
