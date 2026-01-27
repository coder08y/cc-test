import { CetusTooltip } from '@cetus/design'
import { formatPercentage, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, Center, CircularProgress, HStack, Progress, Text, TextProps, VStack } from '@chakra-ui/react'

type AumLimitProps = {
  depositRatio?: string
  hardCapUSD?: string
  vaultTvl?: string
  value: string | JSX.Element
  textStyle?: TextProps
  labelStyle?: TextProps
  label?: string
  haveCircleProgress?: boolean
}
// TVL/硬顶 进度条
export function AumLimit(props: AumLimitProps) {
  const { depositRatio, hardCapUSD, vaultTvl, value, label, textStyle, labelStyle, haveCircleProgress = false } = props
  return (
    <HStack w="100%" justifyContent="flex-end">
      {!haveCircleProgress && (
        <Text whiteSpace="nowrap" fontSize="12px" {...labelStyle}>
          {label}
        </Text>
      )}
      <CetusTooltip
        placement="bottom-end"
        tooltip={
          <VStack w="260px" p="4px" gap="8px">
            <HStack w="100%" justifyContent="space-between">
              <Text fontSize="12px" color="primary_gray">
                Current TVL
              </Text>
              <Text fontSize="12px" color="primary_gray">
                Capacity
              </Text>
            </HStack>
            <Progress
              h="4px"
              w="100%"
              value={Number(depositRatio)}
              bg="primary_opacity.10"
              sx={{
                'div[role="progressbar"]': {
                  bg: 'primary'
                }
              }}
            />
            <HStack w="100%" justifyContent="space-between">
              <HStack>
                <Text fontSize="12px" color="text_caption">
                  {symbolDataDisplayProcessing(vaultTvl, '$')}
                </Text>
                <Text fontSize="12px" color="primary">
                  {formatPercentage(depositRatio, 2)}
                </Text>
              </HStack>
              <Text fontSize="12px" color="text_caption">
                {symbolDataDisplayProcessing(hardCapUSD, '$')}
              </Text>
            </HStack>
          </VStack>
        }
      >
        <Center cursor="pointer">
          <HStack>
            {haveCircleProgress && (
              <HStack gap="4px">
                <CircularProgress
                  min={0}
                  max={100}
                  value={Number(depositRatio)}
                  size="16px"
                  thickness="12px"
                  color="text_highlight"
                  trackColor="circle_progress_track_color"
                />
                <Text whiteSpace="nowrap" fontSize="12px" {...labelStyle}>
                  {label}
                </Text>
              </HStack>
            )}
            <Box color="text_caption" textDecoration="underline dotted" textDecorationColor="primary_gray" fontSize="12px" {...textStyle}>
              {value}
            </Box>
          </HStack>
        </Center>
      </CetusTooltip>
    </HStack>
  )
}
