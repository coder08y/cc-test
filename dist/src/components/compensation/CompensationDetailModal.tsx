import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { H5MapTable, Table } from '@cetus/ui-kit'
import { formatNumberWithDown, timeFormatUTC } from '@cetus/utils'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

type CompensationDetail = {
  date: string
  amount: string
  status: 'Claimed' | 'Pending Claim' | 'Locked'
  periodDetails: any[]
}

type CompensationDetailModalProps = {
  isOpen: boolean
  setIsOpen: (status: boolean) => void
}

const colorsObj: Record<CompensationDetail['status'], { bg: string; textColor: string }> = {
  Claimed: {
    bg: 'none',
    textColor: 'white_color_opacity.50'
  },
  'Pending Claim': {
    bg: 'primary_opacity.10',
    textColor: 'primary'
  },
  Locked: {
    textColor: 'text_caption',
    bg: 'white_color_opacity.10'
  }
}

const getStatusStyle = (status: CompensationDetail['status']) => colorsObj[status]

export default function CompensationDetailModal({ isOpen, setIsOpen, periodDetails }: CompensationDetailModalProps) {
  const columns = useMemo(() => {
    return [
      {
        title: (
          <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
            Release Date (UTC)
          </Text>
        ),
        key: 'date',
        render: (item: CompensationDetail) => (
          <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }} whiteSpace="nowrap">
            {timeFormatUTC(Number(item.releaseTime * 1000), 'YMDHM')}
          </Text>
        )
      },
      {
        title: (
          <Text textAlign="center" color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
            Amount (CETUS)
          </Text>
        ),
        key: 'amount',
        render: (item: CompensationDetail) => (
          <Text color="text_caption" textAlign="center" fontSize={{ base: '12px', lg: '14px' }}>
            {formatNumberWithDown(item.cetusAmount)}
          </Text>
        )
      },
      {
        title: (
          <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
            Status
          </Text>
        ),
        key: 'status',
        render: (item: CompensationDetail) => {
          const { bg, textColor } = getStatusStyle(item.status || '')
          return (
            <Text
              as="span"
              p={item.status !== 'Claimed' ? '2px 8px' : '0'}
              w="auto"
              bg={bg}
              borderRadius="8px"
              color={textColor}
              fontSize={{ base: '12px', lg: '14px' }}
              whiteSpace="nowrap"
            >
              {item.status}
            </Text>
          )
        }
      }
    ]
  }, [])

  const { isApp } = useWindowWidth()

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered>
      <ModalOverlay />
      <ModalContent minW={{ base: '100%', lg: '500px' }}>
        <ModalHeader>Compensation Details</ModalHeader>
        <ModalCloseButton mt="0px" />
        <ModalBody p={{ base: '0 8px', lg: '0' }}>
          {!isApp ? (
            <Table
              rowKey="index"
              columns={columns}
              dataSource={periodDetails}
              skeletonLength={3}
              loading={false}
              rowStyle={(_, index) => ({
                w: '100px',
                height: '48px',
                mt: index == 0 ? '12px' : '0',
                textAlign: 'center',
                _hover: {
                  bg: 'none !important'
                }
              })}
            />
          ) : (
            <H5MapTable
              rowKey="index"
              columns={columns}
              dataSource={periodDetails}
              skeletonLength={3}
              loading={false}
              itemHeight="auto"
              rowStyle={(_, index) => ({
                w: '100%',
                p: '16px 8px',
                border: 'none',
                bg: '#1C1C1C',
                borderRadius: '8px',
                gap: '16px'
              })}
              isShowBorder={false}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
