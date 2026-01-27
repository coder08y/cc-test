import img_nodata_error from '@/assets/img_nodata@2x.png'
import { theme } from '@cetus/ui-kit'
import { Button, ChakraProvider, Flex, Image, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
export default function Notfound() {
  const navigate = useNavigate()
  return (
    <ChakraProvider theme={theme}>
      <Flex
        w="100%"
        h="100%"
        justifyContent="center"
        alignItems="center"
        position="fixed"
        backgroundColor="background"
        direction="column"
        left="50%"
        top="0px"
        transform="translateX(-50%)"
      >
        <Text fontSize="20px" mb="-50px" textColor="text_caption">
          Oops...
        </Text>
        <Image w="350px" h="529px" src={img_nodata_error} />
        <Text fontSize="28px" textColor="primary" mt="-80px">
          Something Error
        </Text>
        <Button mt="20px" w="200px" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </Flex>
    </ChakraProvider>
  )
}
