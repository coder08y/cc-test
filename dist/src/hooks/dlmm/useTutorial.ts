import { TourStepType } from '@/components/common/Tour'
import useDlmmPoolsStore from '@/store/pool/useDlmmPoolStore'
import useGlobalStore from '@cetus/stores/src/global'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function useTutorial() {
  const { dlmmTutorialStep, setDlmmTutorialStep } = useGlobalStore()
  const { tutorialOpen, setTutorialOpen } = useDlmmPoolsStore()
  const navigate = useNavigate()

  const showTutorial = useMemo(() => {
    return dlmmTutorialStep > 1 && dlmmTutorialStep < 7
  }, [dlmmTutorialStep])

  const showPoolsTutorial = useMemo(() => {
    return dlmmTutorialStep <= 2 && dlmmTutorialStep > 1
  }, [dlmmTutorialStep])

  const showPoolTutorial = useMemo(() => {
    return dlmmTutorialStep > 2 && dlmmTutorialStep < 7
  }, [dlmmTutorialStep])

  const onTutorialNext = useCallback(
    (dlmmPoolId?: string) => {
      // if (dlmmTutorialStep === 1) {
      //   setTutorialOpen(true)
      //   setShowModal(false)
      //   return
      // }
      if (dlmmTutorialStep === 2) {
        navigate(`/dlmm?poolId=${dlmmPoolId}`)
      }
      if (dlmmTutorialStep < 7) {
        setDlmmTutorialStep(dlmmTutorialStep + 1)
        if (dlmmTutorialStep === 6) {
          setTutorialOpen(false)
        }
      }
    },
    [dlmmTutorialStep]
  )

  // useEffect(() => {
  //   if (tutorialOpen) {
  //     setTimeout(() => {
  //       const container = document.querySelector('.scroll-container')
  //       console.log(container, 'tutorialOpen')
  //       if (container) {
  //         container?.scrollBy(0, 356)
  //       }
  //     }, 100)
  //   }
  // }, [tutorialOpen])

  useEffect(() => {
    if ([1, 2].includes(dlmmTutorialStep) && !tutorialOpen) {
      setTutorialOpen(true)
    }
  }, [dlmmTutorialStep, tutorialOpen])

  const onTutorialExit = () => {
    setDlmmTutorialStep(7)
    setTutorialOpen(false)
  }

  const onTutorialPrevious = useCallback(() => {
    if (dlmmTutorialStep > 1 && dlmmTutorialStep < 7) {
      setDlmmTutorialStep(dlmmTutorialStep - 1)
      if (dlmmTutorialStep === 3) {
        navigate(`/pools?tab=dlmm_pools`)
      }
    }
  }, [dlmmTutorialStep])

  const onStepDuration = useCallback(() => {
    console.log(dlmmTutorialStep, 'onStepDuration')
    if (dlmmTutorialStep === 1) {
      setDlmmTutorialStep(2)
    }
  }, [dlmmTutorialStep])

  const stepMap: Record<number, TourStepType> = {
    // 1: {
    //   current: 1,
    //   total: 6,
    //   title: 'Select a Token Pair',
    //   description: 'Choose the token pair you want to provide liquidity for, use the dropdown list to explore available pools',
    //   placement: 'top',
    //   target: '.dlmm-tutorial-step-1'
    // },
    2: {
      current: 1,
      total: 5,
      title: 'Select a Pool',
      description: 'Select the pool you want to provide liquidity for',
      placement: 'top',
      target: '.dlmm-tutorial-step-2'
    },
    3: {
      current: 2,
      total: 5,
      title: 'Enter Deposit Amount',
      description: 'Input the amount of Token you want to deposit',
      placement: 'bottom',
      target: '.dlmm-tutorial-step-3'
    },
    4: {
      current: 3,
      total: 5,
      title: 'Select a Strategy',
      description: 'Select how your liquidity is distributed across the new position',
      placement: 'bottom',
      target: '.dlmm-tutorial-step-4'
    },
    5: {
      current: 4,
      total: 5,
      title: 'Set Your Price Range',
      description: 'Define the price range where your liquidity will be active',
      placement: 'right',
      target: '.dlmm-tutorial-step-5'
    },
    6: {
      current: 5,
      total: 5,
      title: 'Start Earning',
      description: 'You’re all set! Confirm your position to start earning trading fees and rewards',
      placement: 'top',
      target: '.dlmm-tutorial-step-6'
    }
  }

  return {
    stepMap,
    tutorialOpen,
    onTutorialNext,
    onTutorialExit,
    onTutorialPrevious,
    onStepDuration,
    showTutorial,
    dlmmTutorialStep,
    setDlmmTutorialStep,
    showPoolTutorial,
    showPoolsTutorial
  }
}

export default useTutorial
