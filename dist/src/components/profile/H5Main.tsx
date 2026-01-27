import useGlobalStore from '@/store/common/global'
import { AccountSwitchDrawer, CetusTooltip } from '@cetus/design'
import RecentTransactions from '@cetus/design/src/components/wallet/RecentTransactions'
import { useAccountServiceName } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData } from '@cetus/ui-kit'
import { addressAbridge } from '@cetus/utils'
import { Center, Flex, HStack, Image, Spinner, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'

type H5MainProps = {
  totalValue: string
  onRefreshTask: () => void
  isLoading: boolean
  children: React.ReactNode
}

function H5Main({ totalValue, onRefreshTask, isLoading, children }: H5MainProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { currentAccount, onWalletModal, accounts, accountServiceNameObj } = useAccountStore()
  const { isShowProfileAssets, setIsShowProfileAssets } = useGlobalStore()
  const [isOpenRecentTrans, setIsOpenRecentTrans] = useState<boolean>(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()
  const { getServiceNames } = useAccountServiceName()
  const handleClick = useCallback(() => {
    if (!isOpen) {
      getServiceNames(accounts)
    }
    onToggle()
    console.log('AccountSwitch###handleClick###isOpen: ', isOpen)
  }, [isOpen, accounts])

  return (
    <VStack w="100%" mt="28px">
      {!isMounted ? (
        <Flex h="300px" w="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      ) : !currentAccount?.address ? (
        <NoData
          type="nowallet"
          mt="20px"
          imgSize="120px"
          imgUrl="/images/img_wallet@2x.png"
          nowalletText="Please connect your wallet to view portfolio page "
          onboard={() => onWalletModal(true)}
        />
      ) : (
        <VStack w="100%" gap="16px" alignItems="flex-start">
          <HStack w="100%">
            <Image src="/images/img_profile@2x.png" w="72px" h="72px" />
            <VStack align="flex-start">
              <HStack w="100%" borderRadius="8px" justify="space-between">
                <HStack gap="4px" cursor="pointer" onClick={handleClick}>
                  <VStack align="flex-start">
                    {/* <Icon xlinkHref="#icon-account" svgFill="text_caption" /> */}
                    {currentAccount?.label && (
                      <Text fontSize="14px" lineHeight="14px">
                        {labelText(currentAccount?.label)}
                      </Text>
                    )}
                    <Text color="text_caption" fontSize="16px" fontWeight="500" lineHeight="14px">
                      {accountServiceNameObj?.[currentAccount?.address] || addressAbridge(currentAccount?.address)}
                    </Text>
                  </VStack>
                  <Icon
                    xlinkHref="#icon-icon_descending_nor"
                    svgFill="text_caption"
                    svgW="20px"
                    svgH="20px"
                    transform={'rotate(0deg)'}
                    transition="transform 0.3s"
                  />
                </HStack>
                <CetusTooltip
                  showTooltip={false}
                  placement="bottom-end"
                  tooltip={<Text fontSize="12px">{isShowProfileAssets ? 'Hide Value' : 'Show Value'}</Text>}
                >
                  <Center>
                    <Icon
                      xlinkHref={isShowProfileAssets ? '#icon-hide_eyes' : '#icon-hide'}
                      svgFill={isShowProfileAssets ? 'text_caption' : 'text_caption'}
                      // svgHover={isShowProfileAssets ? 'primary' : isApp ? 'text_paragraph' : 'text_caption'}
                      onClick={() => setIsShowProfileAssets(!isShowProfileAssets)}
                    />
                  </Center>
                </CetusTooltip>
              </HStack>
              {/* <Text h="18px" lineHeight="18px" fontSize={{ base: '14px', lg: '16px' }} color="text_caption">
                Total Value
              </Text>
              <CetusTooltip
                showTooltip={false}
                placement="bottom-end"
                tooltip={<Text fontSize="12px">{isShowProfileAssets ? 'Hide Value' : 'Show Value'}</Text>}
              >
                <Center>
                  <Icon
                    xlinkHref={isShowProfileAssets ? '#icon-hide_eyes' : '#icon-hide'}
                    svgFill={isShowProfileAssets ? 'text_caption' : 'text_caption'}
                    // svgHover={isShowProfileAssets ? 'primary' : isApp ? 'text_paragraph' : 'text_caption'}
                    onClick={() => setIsShowProfileAssets(!isShowProfileAssets)}
                  />
                </Center>
              </CetusTooltip> */}
              <HStack h="16px" align="center" gap="0" cursor="pointer" onClick={() => setIsOpenRecentTrans(true)}>
                <Text h="16px" lineHeight="16px">
                  Transactions
                </Text>
                <Icon xlinkHref="#icon-icon_ascending" fontSize="16px" transform="rotate(90deg)" />
              </HStack>
            </VStack>
          </HStack>
          {/* <Skeleton isLoaded={!isLoading} h="32px">
            <Text mt="-6px" letterSpacing="1px" h="32px" fontSize="28px" lineHeight="32px" color="text_caption" fontWeight="500">
              {isShowAssets(formatCurrency(totalValue, 2), isShowProfileAssets)}
            </Text>
          </Skeleton> */}
          {children}
        </VStack>
      )}
      <AccountSwitchDrawer isOpen={isOpen} onClose={onClose} />
      {isOpenRecentTrans && <RecentTransactions isOpen={isOpenRecentTrans} onClose={() => setIsOpenRecentTrans(false)} />}
    </VStack>
  )
}

export default H5Main
export const labelText = (accountLabel: string) => {
  return accountLabel?.length > 16 ? accountLabel?.substring(0, 6) + '...' + accountLabel?.substring(accountLabel?.length - 10) : accountLabel
}
