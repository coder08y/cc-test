import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { UnstakeAndWithdraw } from './UnstakeAndWithdraw'
import { UnstakeLp } from './UnstakeLp'

type FarmingUnstakeProps = {
  currentVaultPosition: any
  currentVaultsFarming: any
}
// vaults farming 提取
export function FarmingUnstake(props: FarmingUnstakeProps) {
  const [currentActionTab, setCurrentActionTab] = useState('Unstake LP')
  const tabList: Tab[] = [
    {
      label: 'Unstake LP',
      value: 'Unstake LP'
    },
    {
      label: 'Unstake and Withdraw',
      value: 'Unstake and Withdraw'
    }
  ]
  return (
    <VStack w="100%">
      {/* <SelectTab
        type="outlineTab"
        wrapStyle={{
          w: {
            base: '100%'
          },
          h: '42px',
          padding: '4px'
          // marginTop: '8px'
          // marginBottom: '4px'
        }}
        itemStyle={{
          w: '50%',
          fontSize: '14px',
          borderRadius: '8px'
        }}
        tabList={tabList}
        currentTab={currentActionTab}
        handleChangeTab={item => {
          setCurrentActionTab(item.value)
        }}
      /> */}
      {currentActionTab === 'Unstake LP' && <UnstakeLp {...props} />}
      {currentActionTab === 'Unstake and Withdraw' && <UnstakeAndWithdraw />}
      <Text
        w="100%"
        p="12px"
        textAlign="center"
        fontSize="12px"
        color="primary"
        bg="primary_opacity.10"
        borderRadius="12px"
        mt={currentActionTab == 'Unstake LP' ? '4px' : '8px'}
      >
        Haedal farming rewards will be claimed when unstaking.
      </Text>
    </VStack>
  )
}
