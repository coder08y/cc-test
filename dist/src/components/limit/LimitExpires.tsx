import useLimitActionStore from '@/store/limit/useLimitAction'
import { CetusTooltip, InputBox } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import MenuDropBlock from '../common/MenuDropBlock'
import CustomExpiryModal from './CustomExpiryModal'

type LimitExpiresProps = object

export function LimitExpires(props: LimitExpiresProps) {
  const { expiresIn, setExpiresIn } = useLimitActionStore()
  const [isOpenExpiryModal, setIsOpenExpiryModal] = useState(false)
  const expiresList = ['5 Minutes', '10 Minutes', '30 Minutes', '1 Hour', '1 Day', '3 Days', '7 Days', '1 Month', 'Custom']
  return (
    <InputBox w="156px" borderRadius="16px">
      <VStack
        w="100%"
        h="100%"
        gap="20px"
        alignItems="start"
        justify="space-between"
        sx={{
          button: {
            w: '100%',
            h: '23px',
            '>span': {
              '>div': {
                display: 'flex',
                justifyContent: 'space-between',
                p: {
                  fontSize: '16px'
                }
              }
            }
          }
        }}
      >
        <CetusTooltip
          placement="top"
          tooltip={
            <Text fontSize="12px" lineHeight="20px" maxW="280px">
              No extra cancellation fee will be charged for order expiry or cancellation. Gas will be consumed upon manual cancellation.
            </Text>
          }
        >
          <HStack gap="4px">
            <Text fontSize="13px" fontWeight="500">
              Expires in
            </Text>
            <Icon xlinkHref="#icon-icon_tips" />
          </HStack>
        </CetusTooltip>
        <MenuDropBlock
          label={expiresIn || ''}
          list={expiresList}
          onListItemClick={item => {
            if (item == 'Custom') {
              setIsOpenExpiryModal(true)
            } else {
              setExpiresIn(item)
            }
          }}
        />
      </VStack>
      {isOpenExpiryModal && <CustomExpiryModal isOpen={isOpenExpiryModal} onClose={() => setIsOpenExpiryModal(false)} />}
    </InputBox>
  )
}
