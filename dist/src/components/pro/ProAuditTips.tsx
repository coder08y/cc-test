import AuditSafeIcon from '@/assets/images/icon_audit@2x.png'
import AuditWarningIcon from '@/assets/images/icon_warning@2x.png'
import CoinAuditCheck from '@/components/common/proModeAndChart/CoinAuditCheck'
import { CetusTooltip } from '@cetus/design'
import { cancelBubble } from '@cetus/utils'
import { Box, HStack, Image, Text } from '@chakra-ui/react'

export default function ProAuditTips({
  coinAuditCheckData,
  coinAuditCheckLoading,
  total,
  warningNum
}: {
  coinAuditCheckData: any
  coinAuditCheckLoading: boolean
  total: number
  warningNum: number
}) {
  return (
    <Box onClick={(e: any) => cancelBubble(e)}>
      <CetusTooltip
        placement="bottom"
        tooltip={
          <Box w="256px" p="4px 0px">
            <CoinAuditCheck coinAuditCheckData={coinAuditCheckData} coinAuditCheckLoading={coinAuditCheckLoading} isSmall={true} />
          </Box>
        }
      >
        <HStack
          gap="2px"

          // textDecoration="underline dashed"
          // textUnderlineOffset="3px"
          // fontSize="14px"
          // color="text_caption"
        >
          <Image src={warningNum == 0 ? AuditSafeIcon : AuditWarningIcon} w="16px" h="16px" />
          <Text borderBottom="1px dotted" borderColor="primary_gray" pb="1px" color="text_caption">
            {total - warningNum}/{total}
          </Text>
        </HStack>
      </CetusTooltip>
    </Box>
  )
}
