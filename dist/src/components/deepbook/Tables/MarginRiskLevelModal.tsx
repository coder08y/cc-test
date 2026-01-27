import { useCalculateRiskRatio } from '@/hooks/deepbook/margin/useCalculateRiskRatio'
import { useRiskRatios } from '@/hooks/deepbook/margin/useRiskRatios'
import { Icon } from '@cetus/ui-kit'
import { d, formatNumber } from '@cetus/utils'
import {
  Box,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack
} from '@chakra-ui/react'
import { useMemo } from 'react'
import MarginHealthyChart from '../Margin/MarginHealthyChart'
import MarginRiskRatios from '../Margin/MarginRiskRatios'

type MarginRiskLevelModalProps = {
  isOpen: boolean
  onClose: () => void
  poolAddress: string
}

export default function MarginRiskLevelModal({ isOpen, onClose, poolAddress }: MarginRiskLevelModalProps) {
  const { riskRatio } = useCalculateRiskRatio(poolAddress)
  const riskRatios = useRiskRatios()

  // 获取风险比率值
  const LR = riskRatios.find(r => r.label === 'LR')?.value || 1.25
  const MCR = riskRatios.find(r => r.label === 'MCR')?.value || 1.1
  const MWR = riskRatios.find(r => r.label === 'MWR')?.value || 1.1

  // 计算当前风险等级和状态
  const riskRatioValue = useMemo(() => {
    if (!riskRatio || riskRatio === '0' || riskRatio === 'Infinity') {
      return null
    }
    const value = d(riskRatio).toNumber()
    return isFinite(value) ? value : null
  }, [riskRatio])

  // 获取风险等级文本和颜色
  const getRiskLevelInfo = (value: number | null) => {
    if (!value) {
      return { level: 'Low risk', color: 'rgba(104, 255, 216, 1)', bg: 'rgba(104, 255, 216, 0.1)' }
    }
    if (value <= LR) {
      return { level: 'Risky', color: 'rgba(255, 80, 115, 1)', bg: 'rgba(255, 80, 115, 0.1)' }
    }
    if (value <= MCR) {
      return { level: 'Medium risk', color: 'rgba(255, 198, 90, 1)', bg: 'rgba(255, 198, 90, 0.1)' }
    }
    if (value <= MWR) {
      return { level: 'Medium risk', color: 'rgba(255, 198, 90, 1)', bg: 'rgba(255, 198, 90, 0.1)' }
    }
    return { level: 'Low risk', color: 'rgba(104, 255, 216, 1)', bg: 'rgba(104, 255, 216, 0.1)' }
  }

  const riskLevelInfo = getRiskLevelInfo(riskRatioValue)

  // 格式化风险比率显示
  const formatRiskRatio = (value: number | null) => {
    if (!value) return '∞'
    if (!isFinite(value)) return '∞'
    return formatNumber(value.toString(), 2)
  }

  // 操作限制表格数据
  const actionRestrictions = useMemo(() => {
    return [
      {
        level: 'MRL > 2',
        levelDisplay: 'MRL > 2',
        trade: true,
        borrow: true,
        withdraw: true,
        highlight: false
      },
      {
        level: '1.5 < MRL ≤ 2',
        levelDisplay: '1.5 < MRL ≤ 2',
        trade: true,
        borrow: true,
        withdraw: false,
        highlight: false
      },
      {
        level: '1.2 < MRL ≤ 1.5',
        levelDisplay: '1.2 < MRL ≤ 1.5',
        trade: true,
        borrow: false,
        withdraw: false,
        highlight: riskRatioValue !== null && riskRatioValue > 1.2 && riskRatioValue <= 1.5
      }
    ]
  }, [riskRatioValue])

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="448px" borderRadius="16px">
        <ModalHeader
          sx={{
            p: '16px 16px 0'
          }}
        >
          <HStack justifyContent="space-between" alignItems="flex-start" w="100%">
            <VStack alignItems="flex-start" gap="16px" flex="1">
              <Text fontSize="16x" color="text_caption">
                Margin Risk Level
              </Text>
              <Text lineHeight="18px" color="text_paragraph">
                Margin Risk Level is calculated as: Total Collateral ÷ Total Debt. A higher Margin Risk Level indicates a safer account with lower
                liquidation risk.
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton h="28px" />
        <ModalBody p="16px" w="100%">
          <VStack w="100%" gap="16px" alignItems="center">
            {/* Risk Level Gauge */}
            <VStack gap="16px" alignItems="center" w="100%">
              <Box display="flex" justifyContent="center" alignItems="center" w="100%">
                <MarginHealthyChart
                  value={riskRatioValue || 0}
                  minBorrowRatio={MCR}
                  minWithdrawRatio={MWR}
                  tooltip="Margin Risk Level is calculated as: Total Collateral ÷ Total Debt. A higher Margin Risk Level indicates a safer account with lower liquidation risk."
                />
              </Box>
            </VStack>

            {/* Risk Thresholds */}
            <VStack w="100%" mt="8px" alignItems="flex-start">
              <MarginRiskRatios riskRatios={riskRatios} />
            </VStack>

            {/* Action Restrictions Table */}
            <VStack w="100%" gap="12px" alignItems="flex-start" bg="bg_primary" border="1px solid" borderColor="border" borderRadius="12px" p="8px">
              <TableContainer w="100%">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th textAlign="left" lineHeight="1" p="8px">
                        Level
                      </Th>
                      <Th textAlign="center" lineHeight="1" p="8px">
                        Trade
                      </Th>
                      <Th textAlign="center" lineHeight="1" p="8px">
                        Borrow
                      </Th>
                      <Th textAlign="center" lineHeight="1">
                        Withdraw
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {actionRestrictions.map((restriction, index) => (
                      <Tr
                        key={index}
                        lineHeight="1"
                        cursor="pointer"
                        _hover={{
                          bg: 'primary_opacity.10',
                          borderRadius: '12px',
                          '& > td:first-of-type > * > *': {
                            color: 'primary'
                          }
                        }}
                      >
                        <Td color="text_caption" border="none" p="8px" borderRadius="12px 0 0 12px">
                          <HStack gap="4px" alignItems="center">
                            {restriction.warning && (
                              <Icon xlinkHref="#icon-icon_warning" fontSize="16px" svgFill="primary_red" svgHover="primary_red" />
                            )}
                            <Text fontSize="14px" textAlign="left">
                              {restriction.levelDisplay}
                            </Text>
                          </HStack>
                        </Td>
                        <Td color="text_caption" border="none" p="8px">
                          <HStack justifyContent="center" alignItems="center">
                            {restriction.trade ? (
                              <Icon xlinkHref="#icon-icon_check" fontSize="14px" svgFill="primary" svgHover="primary" />
                            ) : (
                              <Icon xlinkHref="#icon-icon_close" fontSize="14px" svgFill="text_paragraph" svgHover="text_paragraph" />
                            )}
                          </HStack>
                        </Td>
                        <Td color="text_caption" border="none" p="8px">
                          <HStack justifyContent="center" alignItems="center">
                            {restriction.borrow ? (
                              <Icon xlinkHref="#icon-icon_check" fontSize="14px" svgFill="primary" svgHover="primary" />
                            ) : (
                              <Icon xlinkHref="#icon-icon_close" fontSize="14px" svgFill="text_paragraph" svgHover="text_paragraph" />
                            )}
                          </HStack>
                        </Td>
                        <Td color="text_caption" border="none" p="8px" borderRadius="0 12px 12px 0">
                          <HStack justifyContent="center" alignItems="center">
                            {restriction.withdraw ? (
                              <Icon xlinkHref="#icon-icon_check" fontSize="14px" svgFill="primary" svgHover="primary" />
                            ) : (
                              <Icon xlinkHref="#icon-icon_close" fontSize="14px" svgFill="text_paragraph" svgHover="text_paragraph" />
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {riskRatioValue !== null && riskRatioValue <= 1.2 && (
                <Box w="calc(100% - 16px)" borderTop="1px dashed" borderColor="border" margin="0 auto" />
              )}

              {/* Warning Message for MRL ≤ 1.2 */}
              {riskRatioValue !== null && riskRatioValue <= 1.2 && (
                <HStack w="100%" justifyContent="space-between" alignItems="flex-start" p="0px 12px">
                  <HStack gap="4px">
                    <Text>MRL≤1.2</Text>
                    <Image src="/images/icon_error.png" alt="warning" w="16px" h="16px" />
                  </HStack>
                  <Text w="220px" fontSize="12px" lineHeight="16px" color="primary_red" textAlign="left">
                    All assets will be liquidated to pay back the interest and loan
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
