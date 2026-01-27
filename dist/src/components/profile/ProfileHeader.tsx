import useGlobalStore from '@/store/common/global'
import { AccountSwitch, AccountSwitchDrawer, CetusTooltip, CopyButton } from '@cetus/design'
import RecentTransactions from '@cetus/design/src/components/wallet/RecentTransactions'
import { useAccountServiceName } from '@cetus/hooks'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Icon, RefreshButton } from '@cetus/ui-kit'
import { addressAbridge } from '@cetus/utils'
import { Box, Center, HStack, Image, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { labelText } from './H5Main'

type ProfileHeaderProps = {
  handleRefresh: (isManual: boolean) => void
  totalValue: string
  isLoading: boolean
}

function ProfileHeader({ handleRefresh, totalValue, isLoading }: ProfileHeaderProps) {
  const { isApp } = useWindowWidth()
  const { currentAccount, accounts, accountServiceNameObj } = useAccountStore()
  const { isShowProfileAssets, setIsShowProfileAssets } = useGlobalStore()
  const [isOpenRecentTrans, setIsOpenRecentTrans] = useState<boolean>(false)
  const { onClose } = useDisclosure()

  const { isOpen, onOpen, onClose: onAccountClose, onToggle } = useDisclosure()
  const { getServiceNames } = useAccountServiceName()
  const handleClick = useCallback(() => {
    if (!isOpen) {
      getServiceNames(accounts)
    }
    onToggle()
  }, [isOpen, accounts])

  const imageList = [
    '/images/one.png',
    '/images/two.png',
    '/images/three.png',
    '/images/four.png',
    '/images/five.png',
    '/images/six.png',
    '/images/seven.png',
    '/images/eight.png',
    '/images/nine.png',
    '/images/ten.png'
  ]
  const [currentImage, setCurrentImage] = useState('')
  useEffect(() => {
    if (!currentAccount?.address) return

    const address = currentAccount?.address.toLowerCase()
    const storedMap = localStorage.getItem('accountImageMap')
    const accountImageMap = storedMap ? JSON.parse(storedMap) : {}

    if (accountImageMap[address]) {
      // 有缓存，直接用
      setCurrentImage(accountImageMap[address])
    } else {
      // 没有缓存，生成一个随机图片并保存
      const randomIndex = Math.floor(Math.random() * imageList.length)
      const newImage = imageList[randomIndex]
      accountImageMap[address] = newImage
      localStorage.setItem('accountImageMap', JSON.stringify(accountImageMap))
      setCurrentImage(newImage)
    }
  }, [currentAccount?.address])
  const { getExplorerUrl } = useExplorer()
  return (
    <VStack w="100%" align="flex-start" gap="12px">
      <HStack w="100%" justify="space-between">
        <HStack gap={{ base: '12px', lg: '16px' }}>
          <Box w={{ base: '48px', lg: '60px' }} h={{ base: '48px', lg: '60px' }} bg="primary_opacity.10" borderRadius="8px">
            {currentImage && <Image src={currentImage} w="100%" h="100%" borderRadius="8px" />}
          </Box>
          <VStack align="flex-start" gap={{ base: '4px', lg: '8px' }}>
            {isApp ? (
              <HStack gap="4px" cursor="pointer" align="flex-end" onClick={handleClick}>
                <VStack align="flex-start" gap="4px">
                  {currentAccount?.label && (
                    <Text fontSize="14px" lineHeight="14px">
                      {labelText(currentAccount?.label)}
                    </Text>
                  )}
                  <Text color="text_caption" fontSize="16px" fontWeight="500" lineHeight="14px">
                    {accountServiceNameObj?.[currentAccount?.address] || addressAbridge(currentAccount?.address)}
                  </Text>
                </VStack>
                {accounts?.length > 1 && (
                  <Icon
                    xlinkHref="#icon-icon_descending_nor"
                    svgFill="text_caption"
                    svgW="20px"
                    svgH="20px"
                    mb="-3px"
                    transform={'rotate(0deg)'}
                    transition="transform 0.3s"
                  />
                )}
              </HStack>
            ) : (
              <AccountSwitch currentAccount={currentAccount} accounts={accounts} onClose={onClose} isProfile={true} />
            )}
            <HStack gap="8px">
              <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Copy address</Text>}>
                <Center>
                  <CopyButton text={currentAccount?.address || ''} />
                </Center>
              </CetusTooltip>
              <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">View on Explorer</Text>}>
                <Center>
                  <Icon
                    fontSize="16px"
                    xlinkHref="#icon-icon_link3"
                    onClick={() => window.open(getExplorerUrl(currentAccount?.address, 'account'))}
                  />
                </Center>
              </CetusTooltip>
            </HStack>
          </VStack>
        </HStack>
        <HStack>
          <HStack
            w={{ base: '28px', lg: 'unset' }}
            p={{ base: '0px', lg: '6px 8px 6px 7px' }}
            h={{ base: '28px', lg: '32px' }}
            justify="center"
            align="center"
            bg="block_color_opacity.50"
            backdropFilter="blur(20px)"
            borderRadius="8px"
            border="1px solid"
            borderColor="border"
            cursor="pointer"
            gap="2px"
            _hover={{
              // bg: 'button_outline_hov_bg',
              svg: {
                fill: 'text_caption'
              },
              p: {
                color: 'text_caption'
              }
            }}
            onClick={() => {
              setIsOpenRecentTrans(true)
            }}
          >
            <Icon xlinkHref="#icon-transactions" svgW="20px" svgH="20px" />
            {!isApp && <Text>Transactions</Text>}
          </HStack>
          <HStack
            w={{ base: '28px', lg: '32px' }}
            h={{ base: '28px', lg: '32px' }}
            justify="center"
            align="center"
            bg="block_color_opacity.50"
            backdropFilter="blur(20px)"
            borderRadius="8px"
            border="1px solid"
            borderColor="border"
            cursor="pointer"
            gap="2px"
            _hover={{
              // bg: 'button_outline_hov_bg',
              svg: {
                fill: 'text_caption'
              }
            }}
            onClick={() => setIsShowProfileAssets(!isShowProfileAssets)}
          >
            <CetusTooltip
              showTooltip={isApp ? false : true}
              placement="top"
              tooltip={<Text fontSize="12px">{isShowProfileAssets ? 'Hide Value' : 'Show Value'}</Text>}
            >
              <Center>
                <Icon xlinkHref={isShowProfileAssets ? '#icon-hide_eyes' : '#icon-hide'} />
              </Center>
            </CetusTooltip>
          </HStack>
          <RefreshButton
            handleRefresh={handleRefresh}
            bg="block_color_opacity.50"
            backdropFilter="blur(20px)"
            w={{ base: '28px', lg: '32px' }}
            h={{ base: '28px', lg: '32px' }}
            isAutoRefresh={true}
            refreshInterval={30}
            innerStyle={{ bg: 'transparent' }}
          />
        </HStack>
      </HStack>
      {/* <HStack w="100%" justify="space-between" mt="2px">
        <Skeleton isLoaded={!isLoading} h="22px">
          <Text mt="-6px" letterSpacing="1px" fontSize="32px" lineHeight="32px" color="text_caption" fontWeight="500">
            {isShowAssets(formatCurrency(totalValue, 2), isShowProfileAssets)}
          </Text>
        </Skeleton>
      </HStack> */}
      {isApp && <AccountSwitchDrawer isOpen={isOpen} onClose={onAccountClose} />}
      {isOpenRecentTrans && <RecentTransactions isOpen={isOpenRecentTrans} onClose={() => setIsOpenRecentTrans(false)} />}
    </VStack>
  )
}
export default ProfileHeader
