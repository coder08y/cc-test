import { TipsInfoBlock } from '@cetus/design/src/components/common/tokenSelectModal/TokenGoplusCard'
import { Icon } from '@cetus/ui-kit'
import { d, formatPercentage } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

const CoinAuditCheck = ({
  coinAuditCheckData,
  coinAuditCheckLoading,
  isSmall
}: {
  coinAuditCheckData: any
  coinAuditCheckLoading: boolean
  isSmall?: boolean
}) => {
  const auditChecks = useMemo(() => {
    const checks = [
      {
        text: 'Mint Authority',
        tips: 'Ability to mint new tokens',
        status: coinAuditCheckData?.mintAuthority === 'Disable' ? 'Disabled' : 'Yes', // 示例值：metadataModifiableValue === '0'
        isYes: coinAuditCheckData?.mintAuthority === 'Disable',
        isNo: coinAuditCheckData?.mintAuthority !== 'Disable',
        isLoading: coinAuditCheckLoading
      },
      {
        text: 'Honeypot',
        tips: "Whether the token is a honeypot, a token that can't be sold due to malicious code on its contract",
        status: coinAuditCheckData?.isHoneypot ? 'Yes' : 'No',
        isYes: !coinAuditCheckData?.isHoneypot,
        isNo: coinAuditCheckData?.isHoneypot,
        isLoading: coinAuditCheckLoading,
        statusTextColor: 'text_caption'
      },
      {
        text: 'Top 10 Holders',
        tips: '% owned by top 10 holders. Highlighted if ownership is above 15%',
        status: formatPercentage(coinAuditCheckData?.top10Holder, 2),
        isYes: !d(coinAuditCheckData?.top10Holder).gt(15),
        isNo: d(coinAuditCheckData?.top10Holder).gt(15),
        isLoading: coinAuditCheckLoading
      }
    ]
    return checks
  }, [coinAuditCheckLoading, coinAuditCheckData?.top10Holder])

  const issueNum = auditChecks.filter(check => check.isNo).length

  return (
    <VStack w="100%" gap="12px">
      <HStack w="100%">
        <TipsInfoBlock w="unset" titleSize={isSmall ? '14px' : '16px'} textColor="text_caption" text="Audit Check" />
        {!coinAuditCheckLoading && issueNum > 0 && (
          <HStack p="0px 8px 0px 4px" h="20px" bg="primary_yellow_opacity.10" borderRadius="8px" gap="4px">
            <Icon xlinkHref="#icon-warning" variant="warning" svgW="14px" svgH="14px" />
            <Text fontSize={isSmall ? '12px' : '14px'} color="primary_yellow">
              {issueNum} {issueNum > 1 ? 'Issues' : 'Issue'}
            </Text>
          </HStack>
        )}
      </HStack>

      <VStack w="100%" gap="12px">
        {auditChecks.map((check, index) => (
          <TipsInfoBlock
            key={index}
            isLoading={coinAuditCheckLoading}
            text={check.text}
            textColor="primary_gray"
            tips={check.tips}
            status={check.status}
            isYes={check.isYes}
            isNo={check.isNo}
            statusColor={check?.statusTextColor}
            titleSize={isSmall ? '12px' : '14px'}
            contentSize={isSmall ? '12px' : '14px'}
          />
        ))}
      </VStack>

      {/* {!isApp && (
        <HStack w="100%" justify="center" mt="20px">
          <Text fontSize="12px">Powered by</Text>
          <Image w="20px" src="/images/img_suivision@2x.png" />
          <Text fontSize="12px">SuiVision</Text>
        </HStack>
      )} */}
    </VStack>
  )
}

export default CoinAuditCheck
