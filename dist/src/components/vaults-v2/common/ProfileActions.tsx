import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import { Button, HStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VaultsTableAction({ poolInfo }: { poolInfo: any }) {
  const { setProfileActionTab, isProfileOpenVaultModal, setIsProfileOpenVaultModal, clearVaultsActionData, setProfilePoolInfo, setCurrTab } =
    useVaultsActionStore()
  const navigate = useNavigate()

  useEffect(() => {
    clearVaultsActionData()
  }, [isProfileOpenVaultModal])

  return (
    <>
      <HStack justify="flex-end" flexDirection={{ base: 'row-reverse', lg: 'row' }} w={{ base: '100%', lg: 'unset' }}>
        <Button
          onClick={e => {
            e.stopPropagation()
            setCurrTab('Withdraw')
            setProfilePoolInfo(poolInfo)
            setIsProfileOpenVaultModal(true)
          }}
          variant="outline"
          h="32px"
          fontSize="12px"
          borderRadius="8px"
          fontWeight="500"
          p="0 8px"
          w={{ base: 'calc(50vw - 26px)', lg: '80px' }}
        >
          Withdraw
        </Button>

        {poolInfo?.status !== 'sunset' && !poolInfo?.migrate_target_vault && (
          <Button
            onClick={e => {
              e.stopPropagation()
              setCurrTab('Deposit')
              setProfilePoolInfo(poolInfo)
              setIsProfileOpenVaultModal(true)
            }}
            h="32px"
            fontSize="12px"
            borderRadius="8px"
            fontWeight="500"
            p="0 8px"
            w={{ base: 'calc(50vw - 26px)', lg: '80px' }}
          >
            Deposit
          </Button>
        )}

        {poolInfo?.migrate_target_vault && (
          <Button
            onClick={e => {
              e.stopPropagation()
              navigate(`/vaults/${poolInfo?.vaultId}/`, { replace: true })
            }}
            h="32px"
            fontSize="12px"
            borderRadius="8px"
            fontWeight="500"
            p="0 8px"
            w={{ base: 'calc(50vw - 26px)', lg: '80px' }}
          >
            Migrate
          </Button>
        )}
      </HStack>
    </>
  )
}
