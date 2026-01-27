import NoChartDataImg from '@/assets/images/no_chart_data@2x.png'
import { Flex, Image, Text } from '@chakra-ui/react'

export default function NoLiquidityData({ isFrom, text }: { isFrom?: string; text?: string }) {
  return (
    <Flex
      bg="bg_secondary"
      w="100%"
      h={isFrom == 'position' ? 'unset' : '100%'}
      direction="column"
      justify="center"
      align="center"
      borderRadius="12px"
    >
      <Image src={NoChartDataImg} w="100px" h="100px" />
      <Text mt="20px" textAlign="center">
        {text || 'There is no liquidity data.'}
      </Text>
    </Flex>
  )
}
