import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { Center, HStack, Image, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import HiddenDotted from '../HiddenDotted'
import { ProfileTabProps, ProfileTabsProps } from './type'

function H5ProfileTabs({ tabList, tabData, onClickTab }: Omit<ProfileTabsProps, 'activeTab'>) {
  return (
    <VStack w="100%">
      {tabList?.map((item: any) => (
        <H5ProfileTab
          key={item.title}
          imgUrl={item.activeImgUrl}
          value={tabData[item.value].totalValue}
          title={item.title}
          url={item.route}
          tooltip={item?.tooltip}
          onClick={() => onClickTab(item.value)}
          isLoading={tabData[item.value].isLoading}
        />
      ))}
    </VStack>
  )
}

const H5ProfileTab = ({ imgUrl, value, title, url, tooltip, isLoading, onClick }: ProfileTabProps) => {
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  return (
    <HStack
      bg="bg_secondary"
      border="1px solid"
      borderColor="border"
      borderRadius="16px"
      w="100%"
      justify="space-between"
      p="16px 12px"
      onClick={onClick}
    >
      <HStack gap="12px">
        <Image w="36px" h="36px" src={imgUrl} />
        <VStack gap="2px" align="flex-start">
          <Skeleton h="24px" isLoaded={!isLoading}>
            <HiddenDotted size="l">
              <Text h="24px" lineHeight="24px" fontSize="20px" fontWeight="500" color="text_caption">
                {value}
              </Text>
            </HiddenDotted>
          </Skeleton>

          <HStack gap="4px">
            <Text fontSize="14px" h="15px" lineHeight="15px">
              {title}
            </Text>
            {tooltip && (
              // <CetusTooltip tooltip={tooltip}>
              //   <Center onClick={e => cancelBubble(e)}>
              //     <Icon xlinkHref="#icon-icon_tips" />
              //   </Center>
              // </CetusTooltip>
              <Popover isLazy trigger="click" autoFocus={false} returnFocusOnClose={false} gutter={4}>
                <PopoverTrigger>
                  <Center onClick={e => cancelBubble(e)} mb="-2px">
                    <Icon xlinkHref="#icon-icon_tips" />
                  </Center>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent w="fit-content">
                    <PopoverBody fontSize="12px" w="fit-content">
                      {tooltip}
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            )}
          </HStack>
        </VStack>
      </HStack>
      <Center bg="primary_opacity.15" w="24px" h="24px" borderRadius="50%">
        <Icon xlinkHref="#icon-icon_ascending" transform="rotate(90deg)" svgFill="primary_blue" fontSize="20px" />
      </Center>
    </HStack>
  )
}

export default H5ProfileTabs
