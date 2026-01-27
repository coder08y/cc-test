import { HighlightText } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'

interface ScamsAlertProps {
  scamsText: string
}
function ScamsAlert({ scamsText }: ScamsAlertProps) {
  return (
    <VStack borderRadius="8px" border="1px solid" borderColor="border" pt="12px" maxW="480px">
      <HStack>
        <Icon xlinkHref="#icon-icon_priceupdated" svgFill="primary_yellow" svgHover="primary_yellow" svgW="20px" svgH="20px" />
        <Text color="primary_yellow">Alert</Text>
      </HStack>

      <Box bg="card_bg" borderRadius="8px" p="11px">
        <HighlightText
          text={`${scamsText}  detected to have Deny List feature. It's an optional feature on Sui designed for regulated coins (learn more). However, it could be misused by HoneyPot scams, which may restrict users from selling the tokens after buying. Please be cautious.`}
          keywords={['learn more']}
          onKeywordClick={() => {
            window.open('https://docs.sui.io/guides/developer/coin/regulated', '_blank')
          }}
        />
      </Box>
    </VStack>
  )
}

export default ScamsAlert
