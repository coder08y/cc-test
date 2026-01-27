import { Block, CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Center, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react'
import HiddenDotted from '../HiddenDotted'
import { ProfileTabsProps } from './type'

function ProfileTab({ tabList, activeTab, tabData, onClickTab }: ProfileTabsProps) {
  const { isApp } = useWindowWidth()
  return (
    <HStack
      ml={{ base: '0px', lg: '-24px' }}
      w={{ base: '100%', lg: 'calc(100% + 24px)' }}
      flexWrap="wrap"
      mb={{ base: '12px', lg: '0px' }}
      mt={{ base: '8px', lg: '12px' }}
      gap={{ base: '8px', lg: '32px' }}
    >
      {tabList.map((item: any) => (
        <Block
          key={item.value}
          w={{ base: 'calc(50% - 4px )', lg: 'unset' }}
          p={{ base: '2px 0px', lg: '12px 24px 20px 16px' }}
          // minW={{ base: 'unset', lg: '180px' }}
          // bgImage={activeTab === item.value ? 'url(/images/tab_active.png)' : 'none'}
          // bgSize="100% 100%"
          borderRadius={{ base: '12px', lg: 'unset' }}
          display="flex"
          // justifyContent="space-between"
          alignItems="center"
          cursor="pointer"
          bg="none"
          border={'1px solid'}
          // backdropFilter="blur(20px)"
          borderColor={isApp && activeTab === item.value ? 'primary' : 'transparent'}
          onClick={() => onClickTab(item.value)}
          bgImage={!isApp && activeTab === item.value ? `url(/images/wallet_active.png)` : 'none'}
          bgSize="240px 40px"
          backgroundRepeat="no-repeat"
          backgroundPosition="bottom"
        >
          <Image
            w={{ base: '48px', lg: '60px' }}
            h={{ base: '48px', lg: '60px' }}
            src={item.activeImgUrl}
            // opacity={activeTab === item.value ? '0.8' : '0.8'}
            // position={{ base: 'fixed', lg: 'unset' }}
            // left="0px"
          />
          <VStack align="flex-start" gap={{ base: '4px', lg: '4px' }}>
            <Text fontSize={{ base: '12px', lg: '14px' }} color="primary_gray">
              {item.title}
            </Text>
            <HStack h="22px">
              <HiddenDotted size="l">
                <CetusTooltip
                  placement="top"
                  tooltip={
                    <Text fontSize="12px" lineHeight="20px" color="text_caption">
                      {item.tooltip}
                    </Text>
                  }
                  showTooltip={item.showTooltip}
                >
                  <Center as="button">
                    <Skeleton isLoaded={!tabData[item.value]?.isLoading}>
                      <Text letterSpacing="0.3px" fontSize={{ base: '16px', lg: '20px' }} fontWeight="500" color="text_caption">
                        {tabData[item.value]?.totalValue}
                      </Text>
                    </Skeleton>
                  </Center>
                </CetusTooltip>
              </HiddenDotted>
            </HStack>
          </VStack>
        </Block>
      ))}
    </HStack>
  )
}

export default ProfileTab
