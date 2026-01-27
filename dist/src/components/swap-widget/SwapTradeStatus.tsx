import { Block, CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { CommonTypeInfo, ToastType, TransactionStatusType, defaultExplorers } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { Button, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

type SwapTradeStatusProps = {
  data: ToastType
  onClose: () => void
}

type DescriptionProps = {
  data: ToastType
  info?: CommonTypeInfo | undefined
}

export default function SwapTradeStatus(props: SwapTradeStatusProps) {
  const { data, onClose } = props
  const { status = 'confirmation', link, tx, getShowInfo } = data

  const showInfo = useMemo(() => {
    if (getShowInfo) {
      return getShowInfo(status)
    }
    return undefined
  }, [status])

  return (
    <VStack w="100%" gap="12px" h="386px" pos="relative">
      {/* 标题 */}
      <TitleBlock status={status} />
      {/* 描述 */}
      <Description data={data} info={showInfo} />

      {(status === 'success' || status === 'rejected') && (
        <Button
          w="100%"
          pos="absolute"
          bottom="0px"
          fontWeight="500"
          fontSize="16px"
          h="52px"
          border="12px"
          onClick={() => {
            onClose()
          }}
        >
          {status === 'rejected' ? 'Retry' : 'Swap More'}
        </Button>
      )}
    </VStack>
  )
}

function Description(props: DescriptionProps) {
  const { data, info } = props
  const { status = 'confirmation', tx } = data
  const { getExplorerUrl } = useExplorer()

  const description = info?.modalDescriptionText
  const iconUrl = info?.iconUrl

  // 待确认
  if (status === 'confirmation') {
    return (
      <VStack gap="12px" h="100%" pl="12px" pr="12px" pb="56px" justifyContent="center">
        <Spinner mt="15px" mb="15px" size="xl" color="primary" thickness="4px" />
        <Text textAlign="center" color="text_caption" fontSize="16px" lineHeight="24px" mt="20px">
          {description}
        </Text>
        <Text fontSize="14px">Confirm this transaction in your wallet</Text>
      </VStack>
    )
  }

  // 已提交
  if (status === 'submitted') {
    return (
      <VStack gap="12px" h="100%" pl="12px" pr="12px" pb="56px" justifyContent="center">
        <Spinner mt="15px" mb="15px" size="xl" color="primary" thickness="4px" />
        <Text color="text_caption" fontSize="16px" lineHeight="24px" mt="20px">
          {description}
        </Text>
        <VStack gap="6px">
          <Text color="primary_gray" fontSize="14px">
            Confirmation is in progress.
          </Text>
          <Text color="primary_gray" fontSize="14px">
            Check your transaction
          </Text>
        </VStack>

        <VStack mt="5px" gap="12px">
          {tx && (
            <VStack gap="12px">
              <HStack w="100%" justifyContent="center" gap="16px">
                {defaultExplorers.map(explorer => {
                  return (
                    <Button
                      key={explorer.name}
                      variant="outline"
                      h="32px"
                      pl="12px"
                      lineHeight="1"
                      color="text_highlight"
                      fontSize="12px"
                      borderColor="swap_border"
                      borderRadius="8px"
                      leftIcon={<Image src={explorer.img} alt="SVG Image" boxSize="24px" objectFit="cover" borderRadius="8px" />}
                      rightIcon={<Icon xlinkHref="#icon-icon_link3" fontSize="16px" />}
                      _hover={{
                        borderColor: 'text_highlight',
                        svg: {
                          fill: 'text_caption'
                        }
                      }}
                      onClick={() => {
                        window.open(getExplorerUrl(tx, 'tx', explorer), '_blank')
                      }}
                    >
                      {explorer.name}
                    </Button>
                  )
                })}
              </HStack>
            </VStack>
          )}
        </VStack>
      </VStack>
    )
  }

  // 成功
  if (status === 'success') {
    return (
      <>
        <VStack gap="8px" pl="12px" pr="12px" w="100%">
          <Block w="60px" h="60px" display="flex" alignItems="center" justifyContent="center" borderRadius="60px" bg="primary_green_opacity.10">
            <Block w="40px" h="40px" display="flex" alignItems="center" justifyContent="center" borderRadius="40px" bg="primary_green">
              <Icon xlinkHref="#icon-icon_check" fontSize="30px" svgFill="#000" />
            </Block>
          </Block>

          <Text color="primary_green" fontSize="14px" lineHeight="20px">
            Swap Successful
          </Text>
          <HStack
            mt="32px"
            w="100%"
            minH="48px"
            borderRadius="8px"
            border="1px solid"
            borderColor="border"
            p="12px"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
          >
            <Text>{description}</Text>
          </HStack>

          {tx && (
            <HStack mt="32px">
              <Text color="primary_green" fontSize="12px">
                View on Explorer
              </Text>

              {defaultExplorers.map(explorer => {
                return (
                  <CetusTooltip key={explorer.name} tooltip={<Text>{explorer.name} </Text>}>
                    <Image
                      onClick={() => {
                        window.open(getExplorerUrl(tx, 'tx', explorer), '_blank')
                      }}
                      cursor="pointer"
                      src={explorer.img}
                      alt="SVG Image"
                      boxSize="16px"
                      objectFit="cover"
                      borderRadius="8px"
                    />
                  </CetusTooltip>
                )
              })}
            </HStack>
          )}
        </VStack>
      </>
    )
  }

  // 失败
  if (status === 'rejected') {
    return (
      <>
        <VStack gap="8px" pl="12px" pr="12px" w="100%">
          <Block w="60px" h="60px" display="flex" alignItems="center" justifyContent="center" borderRadius="60px" bg="primary_red_opacity.10">
            <Block w="40px" h="40px" display="flex" alignItems="center" justifyContent="center" borderRadius="40px" bg="primary_red">
              <Icon xlinkHref="#icon-caution" fontSize="24px" svgFill="#000" />
            </Block>
          </Block>

          <Text color="primary_red" fontSize="14px" lineHeight="20px">
            Swap failed
          </Text>
          <HStack
            mt="32px"
            w="100%"
            minH="48px"
            borderRadius="8px"
            border="1px solid"
            borderColor="border"
            p="12px"
            alignItems="center"
            justifyContent="center"
          >
            <Text maxW="100%" textAlign="center" lineHeight="18px">
              {description}
            </Text>
          </HStack>
        </VStack>
      </>
    )
  }

  return <></>
}

function TitleBlock({ status }: { status: TransactionStatusType }) {
  return (
    <VStack w="100%" h="56px" justifyContent="center">
      {status === 'confirmation' && (
        <Text fontSize="16px" color="text_caption">
          Waiting for Confirmation
        </Text>
      )}
      {status === 'submitted' && (
        <Text fontSize="16px" color="text_caption">
          Transaction in progress
        </Text>
      )}
    </VStack>
  )
}
