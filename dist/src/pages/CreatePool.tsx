import CreateCLMMPool from '@/components/pools/createPool/CreateCLMMPool'
import CreateDLMMPool from '@/components/pools/createPool/CreateDLMMPool'
import SelectPoolType from '@/components/pools/createPool/SelectPoolType'
import useCommonCreatePool from '@/hooks/create-pool/useCommonCreatePool'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import { useMemo } from 'react'
function CreatePool() {
  const { isReverse, handleSelectTokenChange, poolType, onPoolTypeChange } = useCommonCreatePool()
  const { currentStep } = useCreatePoolStore()

  const Pool = useMemo(() => (poolType === 'dlmm' ? CreateDLMMPool : CreateCLMMPool), [poolType])

  return (
    <Pool isReverse={isReverse} handleSelectTokenChange={handleSelectTokenChange}>
      <SelectPoolType type={poolType} onChange={onPoolTypeChange} currentStep={currentStep} fromSource="createPool" />
    </Pool>
  )
}

export default CreatePool
