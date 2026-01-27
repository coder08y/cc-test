import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, Text } from '@chakra-ui/react'

type Props = {
  children: React.ReactNode
}
function ESTAprTooltip({ children }: Props) {
  const { isApp } = useWindowWidth()
  return (
    <CetusTooltip
      placement={isApp ? 'bottom-end' : 'top-start'}
      maxW={{ base: 'calc(100vw - 16px)', lg: 'unset' }}
      tooltip={
        <Box as="div" lineHeight="20px" maxW="280px">
          <Text as="span" fontSize="12px" color="text_caption">
            The estimated APR of the current epoch for all xCETUS holders.&nbsp;
          </Text>
          <Text as="span" fontSize="12px" color="text_highlight">
            APR = ($ Rewards of the upcoming week * 52) / $ Total xCETUS staked * 100%&nbsp;
          </Text>
          <Text as="span" fontSize="12px" color="text_caption">
            Both real-time value of rewards and CETUS price will affect the APR fluctuation.
          </Text>
        </Box>
      }
    >
      {children}
    </CetusTooltip>
  )
}

export default ESTAprTooltip
