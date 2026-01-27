import useXCetusRedeemAction from '@/hooks/xcetus/useXCetusRedeemAction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { Block, TradeInputGroup } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { HTextLabelBox } from '@cetus/ui-kit'
import { IconProps } from '@cetus/ui-kit/src/components/Icon'
import { formatPercentage } from '@cetus/utils'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import XCetusRedeemConfirmModel from '../modal/XCetusRedeemConfirmModel'
import { CetusRedeemSlider } from './CetusRedeemSlider'

type CetusRedeemProps = {
  availableXCetusAmount: string
  iconParams: IconProps
  onIconClick: () => void
  onClose?: () => void
}

export function CetusRedeem(props: CetusRedeemProps) {
  const { availableXCetusAmount, iconParams, onIconClick, onClose } = props
  const { currentAccount, onWalletModal } = useAccountStore()
  const {
    inputAmountFrom,
    inputAmountTo,
    handleInputChange,
    balanceInfoTo,
    btnText,
    btnDisabled,
    handleConvertClick,
    day,
    handleDayChange,
    percent,
    convertLoading
  } = useXCetusRedeemAction(availableXCetusAmount)

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
          balance: availableXCetusAmount,
          value: inputAmountFrom,
          amountValue: undefined,
          loading: false,
          onChange: value => {
            handleInputChange(value, true)
          },
          selectable: false,
          placeholder: '0.0',
          token: envConfigs.x_cetus_coin
        }}
        to={{
          wrapStyle: {
            borderRadius: '12px'
          },
          title: 'To',
          balance: balanceInfoTo?.balanceFormat || '',
          value: inputAmountTo,
          half: false,
          max: false,
          amountValue: undefined,
          onChange: value => {
            handleInputChange(value, false)
          },
          selectable: false,
          placeholder: '0.0',
          token: envConfigs.cetus_coin
        }}
        iconParams={iconParams}
      />
      {/* 滑杆 */}
      <Block borderRadius="12px" p={{ base: '16px 8px', lg: '16px' }}>
        <Text mb="16px" color="primary_gray">
          Vesting duration
        </Text>
        <CetusRedeemSlider
          day={day}
          onChange={(value: string | number) => {
            handleDayChange(Number(value))
          }}
        />
      </Block>

      <Block borderRadius="12px" p="0px" border="none">
        <VStack w="100%" gap="20px">
          <Button
            mt="-1px"
            w="100%"
            borderRadius="12px"
            h="52px"
            fontSize="18px"
            fontWeight="500"
            isDisabled={btnDisabled || convertLoading}
            isLoading={convertLoading}
            onClick={() => {
              if (currentAccount) {
                // if (showConvertModel) {
                //   setIsOpenModel(true)
                // } else {
                //   handleConvertClick().then(() => {
                //     onClose && onClose()
                //   })
                // }
                setIsOpenModel(true)
              } else {
                onWalletModal(true)
              }
            }}
          >
            {btnText}
          </Button>

          {/* 展示计算结果 */}
          {+percent && (
            <HStack w="100%" p="34px 16px 20px" border="1px solid" borderColor="border" mt="-34px" borderRadius="12px">
              <HTextLabelBox
                label="Redeem ratio"
                labelStyle={{
                  fontSize: '14px'
                }}
                value={formatPercentage(percent)}
                valueStyle={{
                  fontSize: '14px'
                }}
              />
            </HStack>
          )}
        </VStack>
      </Block>

      {isOpenModel && (
        <XCetusRedeemConfirmModel
          inputAmountFrom={inputAmountFrom}
          inputAmountTo={inputAmountTo}
          day={day}
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
