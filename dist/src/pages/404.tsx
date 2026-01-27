import img_nodata_404 from '@/assets/img_nodata_404@2x.png'
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
        <Image w="350px" h="529px" src={img_nodata_404} />
        {/* <Box boxShadow="0px 17px 6px rgba(0,0,0,0.5), inset 0px 3px 3px #69B1E0" fontSize="60px" mt="-80px">
          404
        </Box> */}
        {/* <Text fontSize="60px" textColor="primary" mt="-80px">
          404
        </Text> */}
        <Text fontSize="16px" textColor="text_caption">
          PAGE NOT FOUND
        </Text>
        <Button mt="40px" w="200px" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Flex>
    </ChakraProvider>
  )
}
