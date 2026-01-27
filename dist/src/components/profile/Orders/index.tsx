import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import ProfileMenus from '../ProfileMenus'
import Dca from './dca'
import Limit from './limit'

function ProfileOrders() {
  const tabList = [
    {
      label: 'Limit Orders',
      value: 'limitOrders'
    },
    {
      label: 'DCA',
      value: 'dca'
    }
  ]
  const [currentTab, setCurrentTab] = useState('limitOrders')
  const { isApp } = useWindowWidth()
  return (
    <Block
      borderRadius="16px"
      p={{ base: '0', lg: '0px 0px 16px' }}
      bg={{ base: 'none', lg: 'none' }}
      backdropFilter={{ base: 'none', lg: 'blur(20px)' }}
      border="none"
      mt={{ base: '-12px', lg: '-6px' }}
    >
      <VStack align="flex-start" gap={{ base: '12px', lg: '20px' }}>
        {/* borderBottom="1px solid" borderColor={{ base: 'transparent', lg: 'border' }} */}
        <Box w="100%">
          <ProfileMenus
            type="tab"
            currentTab={currentTab}
            tabs={tabList}
            onTabChange={tab => setCurrentTab(tab.value)}
            menuHeight={isApp ? '48px' : '60px'}
            // haveActiveLine={false}
            textStyle={{
              fontSize: '16px'
            }}
            wrapStyle={{
              bg: 'none'
            }}
          />
        </Box>
        {currentTab === 'limitOrders' && <Limit />}
        {currentTab === 'dca' && <Dca />}
      </VStack>
    </Block>
  )
}

export default ProfileOrders
