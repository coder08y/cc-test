import { Center, Spinner } from '@chakra-ui/react'

export default function ChartLoading() {
  return (
    <Center w="100%" h="100%" position="absolute" left="0px" top="0px">
      <Spinner />
    </Center>
  )
}
