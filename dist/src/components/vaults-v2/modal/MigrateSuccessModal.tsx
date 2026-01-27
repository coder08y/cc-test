import useExplorer from '@cetus/hooks/src/useExplorer'
import { ToastType, defaultExplorers } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { addComma, formatCurrency, formatPercentage } from '@cetus/utils'
import { addressAbridge } from '@cetus/utils/src/common'
import { HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export type MigrateSuccessResult = {
  total_amount_value: string
  share_of_pool: string
  est_daily_yield: string
  min_ft_amount: string
  vaultId: string
  tx: string
  vaultApiInfo: any
}

type MigrateSuccessProps = {
  isOpen: boolean
  onClose: (isManual: boolean) => void
  data: MigrateSuccessResult
}

export function MigrateSuccessModal(props: MigrateSuccessProps) {
  const { getExplorerUrl } = useExplorer()
  const { isOpen, onClose, data } = props
  const navigate = useNavigate()
  const { total_amount_value, share_of_pool, est_daily_yield, min_ft_amount, vaultId, tx, vaultApiInfo } = data
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={() => onClose(false)} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton onClick={() => onClose(true)} />
        <ModalBody>
          <VStack gap="8px" pb="24px" pt="28px" w="100%">
            <VStack gap="8px" alignItems="center">
              <Image src="/images/img_transactionsubmitted@2x.png" w="150px" h="150px" alt="icon" />
              <Text color="text_caption" fontSize="16px">
                Migration Completed!
              </Text>
            </VStack>

            <HStack w="100%" mt="8px" gap="6px" justifyContent="center" alignItems="center">
              <Text color="primary_gray" fontSize="12px" fontWeight="400">
                Transaction:
              </Text>
              <Text color="text_caption" fontSize="12px" fontWeight="400">
                {addressAbridge(tx)}
              </Text>
              {defaultExplorers.map(explorer => {
                return (
                  <Image
                    _hover={{
                      borderColor: 'text_highlight',
                      svg: {
                        fill: 'text_caption'
                      }
                    }}
                    src={explorer.img}
                    alt="SVG Image"
                    boxSize="16px"
                    objectFit="cover"
                    borderRadius="8px"
                    cursor="pointer"
                    onClick={() => {
                      window.open(getExplorerUrl(tx, 'tx', explorer), '_blank')
                    }}
                  />
                )
              })}
            </HStack>

            <VStack
              w="100%"
              mt="12px"
              borderRadius="12px"
              border="1px solid"
              borderColor="token_inactive_border"
              pl="12px"
              pr="12px"
              pt="16px"
              pb="16px"
              gap="8px"
            >
              <HStack w="100%" justifyContent="space-between">
                <Text color="primary_gray" fontSize="12px">
                  Received
                </Text>

                <HStack gap="4px" justifyContent="end">
                  <Text color="text_caption" fontSize="12px">
                    {addComma(min_ft_amount)} LP
                  </Text>
                  <Text color="primary_gray" fontSize="12px">
                    {formatCurrency(total_amount_value, 2)}
                  </Text>
                </HStack>
              </HStack>
              <HStack w="100%" justifyContent="space-between">
                <Text color="primary_gray" fontSize="12px">
                  Share of Pool
                </Text>

                <Text color="text_caption" fontSize="12px">
                  {share_of_pool}
                </Text>
              </HStack>

              <HStack w="100%" justifyContent="space-between">
                <Text color="primary_gray" fontSize="12px">
                  Est. Daily Yield
                </Text>

                <Text color="text_caption" fontSize="12px">
                  +{formatCurrency(est_daily_yield, 2)}
                </Text>
              </HStack>
            </VStack>

            <HStack
              justifyContent="center"
              w="100%"
              mt="4px"
              borderRadius="8px"
              border="1px solid"
              borderColor="token_inactive_border"
              h="32px"
              gap="4px"
              cursor="pointer"
              onClick={() => {
                navigate(`/vaults/${vaultId}`, { replace: true })
                onClose(true)
              }}
              _hover={{
                svg: {
                  fill: 'primary_gray'
                },
                p: {
                  color: 'primary_gray'
                }
              }}
            >
              <Text color="primary" fontSize="12px">
                View LP in {vaultApiInfo?.displayTokenA?.symbol}-{vaultApiInfo?.displayTokenB?.symbol}{' '}
                {vaultApiInfo?.category === 'cetus' ? 'Cetus' : 'Haedal'} Liquidity Vault {vaultApiInfo?.version}
              </Text>

              <Icon xlinkHref="#icon-icon_link3" fontSize="16px" svgFill="primary" />
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
