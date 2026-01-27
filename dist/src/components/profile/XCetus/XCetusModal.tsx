import { CetusAdd } from '@/components/xcetus/CetusAdd'
import { CetusRedeem } from '@/components/xcetus/CetusRedeem'
import { TabTypes } from '@/pages/XCetus'
import useProfileXCetusStore from '@/store/profile/xcetus'
import { SelectTab } from '@cetus/design'
import { fromDecimalsAmountFix } from '@cetus/utils'
import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  availableXCetusAmount: string
}

const tabList: { label: TabTypes; value: TabTypes }[] = [
  {
    label: 'Get xCETUS',
    value: 'Get xCETUS'
  },
  {
    label: 'Redeem CETUS',
    value: 'Redeem CETUS'
  }
]

function XCetusModal({ isOpen, onClose, availableXCetusAmount }: Props) {
  const { currentXCetusTab, setCurrentXCetusTab } = useProfileXCetusStore()
  const [tradeIcon, setTradeIcon] = useState('#icon-a-icon_trade')
  const onTradeIconMouseEnter = () => {
    setTradeIcon('#icon-icon_swap1')
  }

  const onTradeIconMouseLeave = () => {
    setTradeIcon('#icon-a-icon_trade')
  }

  const onIconClick = () => {
    const value = tabList?.find(tab => tab?.value !== currentXCetusTab)?.value
    if (value) {
      setCurrentXCetusTab(value)
    }
  }
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader p="0 16px">
          <Box borderBottom="1px solid" borderColor="border">
            <SelectTab
              type="borderTab"
              wrapStyle={{
                w: 'fix-content',
                border: 'none',
                h: '58px',
                background: 'transparent',
                gap: '40px'
              }}
              itemStyle={{
                w: 'auto',
                fontSize: '16px'
              }}
              tabList={tabList}
              currentTab={currentXCetusTab}
              handleChangeTab={(item: any) => {
                setCurrentXCetusTab(item?.value)
              }}
            />
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p="20px 16px 16px">
          {currentXCetusTab === 'Get xCETUS' && (
            <CetusAdd
              onClose={onClose}
              availableXCetusAmount={availableXCetusAmount}
              onIconClick={onIconClick}
              iconParams={{
                xlinkHref: tradeIcon,
                svgFill: 'text_caption',
                transform: tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)',
                fontSize: tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px',
                onMouseEnter: onTradeIconMouseEnter,
                onMouseLeave: onTradeIconMouseLeave
              }}
            />
          )}
          {currentXCetusTab === 'Redeem CETUS' && (
            <CetusRedeem
              onClose={onClose}
              availableXCetusAmount={fromDecimalsAmountFix(availableXCetusAmount, 9)}
              onIconClick={onIconClick}
              iconParams={{
                xlinkHref: tradeIcon,
                svgFill: 'text_caption',
                transform: tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)',
                fontSize: tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px',
                onMouseEnter: onTradeIconMouseEnter,
                onMouseLeave: onTradeIconMouseLeave
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default XCetusModal
