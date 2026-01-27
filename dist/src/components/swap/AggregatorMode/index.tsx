import useCustomizeRouting from '@/hooks/swap/useCustomizeRouting'
import useGetRouterConfig from '@/hooks/swap/useGetRouterConfig'
import useSwapConfigStore from '@/store/swap/swapConfig'
import { Icon } from '@cetus/ui-kit'
import { Button, FormControl, FormLabel, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Skeleton, Switch } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import confetti from 'canvas-confetti'
import { useRef, useState } from 'react'
import AggregatorModeModal from './AggregatorModal'

type AggregatorModeProps = {
  showRfqSwitch?: boolean
}

function AggregatorMode({ showRfqSwitch = true }: AggregatorModeProps) {
  const { setIsOpenRfqSwitch } = useSwapConfigStore()
  const [settingOpen, setSettingOpen] = useState(false)
  const switchRef = useRef<any>(null)
  const onClose = () => {
    setSettingOpen(false)
  }

  const { providersLoading } = useGetRouterConfig()

  const { handleSelectAllProviderClick, handleSaveClick, currProvidersSwitchStates, isOpenAggregatorMode } = useCustomizeRouting(showRfqSwitch)
  const handleChange = () => {
    if (!isOpenAggregatorMode) {
      triggerConfettiAnimation()
    }
    handleSelectAllProviderClick(!isOpenAggregatorMode)

    if (isOpenAggregatorMode) {
      setIsOpenRfqSwitch(false)
    }
  }

  useDeepCompareEffect(() => {
    handleSaveClick()
  }, [currProvidersSwitchStates])

  const triggerConfettiAnimation = () => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const rect = switchRef.current?.getBoundingClientRect()
    const x: any = rect?.left
    const y: any = rect?.top

    const scalar = 2
    const shape1 = confetti.shapeFromText({ text: '🟢', scalar })
    const shape2 = confetti.shapeFromText({ text: '🔵', scalar })
    const shape3 = confetti.shapeFromText({ text: '💚', scalar })
    const shape4 = confetti.shapeFromText({ text: '💙', scalar })
    confetti({
      particleCount: 40,
      spread: 60,
      // origin: { y: 0.6 },
      shapes: [shape1, shape2, shape3, shape4],
      scalar,
      // origin: { y: 0.2 },
      origin: { x: x / viewportWidth, y: (y * 1.2) / viewportHeight }
    })
  }

  return (
    <>
      <Skeleton isLoaded={!providersLoading} w="178px" h="28px">
        <HStack border="1px solid" borderColor="border" borderRadius="8px" h="28px" bg="bg_secondary" gap="8px">
          <Popover isLazy trigger="hover" autoFocus={false} returnFocusOnClose={false}>
            <PopoverTrigger>
              <FormControl display="flex" alignItems="center" pl="8px">
                <FormLabel
                  htmlFor="aggregator-mode"
                  mb="0"
                  bg="plus_mode_color"
                  // textFillColor="transparent"
                  sx={{
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                  backgroundClip="text"
                  h="18px"
                  lineHeight="18px"
                  fontSize="12px"
                  fontWeight="500"
                  fontStyle="normal"
                  mr="8px"
                >
                  Aggregator Mode
                </FormLabel>
                <Switch ref={switchRef} id="aggregator-mode" isChecked={isOpenAggregatorMode} onChange={handleChange} />
              </FormControl>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverBody p="12px" lineHeight="20px" fontSize="12px">
                The Aggregator Mode will aggregate external liquidity sources
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Button
            variant="unstyled"
            mr="-1px"
            minW="20px"
            w="20px"
            p="7px 4px"
            h="28px"
            bg="border"
            borderRadius="0 8px 8px 0"
            onClick={() => setSettingOpen(!settingOpen)}
            _hover={{
              svg: {
                fill: 'text_caption'
              }
            }}
          >
            <Icon xlinkHref="#icon-icon_list_token" fontSize="12px" />
          </Button>
        </HStack>
      </Skeleton>

      {settingOpen && <AggregatorModeModal isOpen={settingOpen} onClose={onClose} showRfqSwitch={showRfqSwitch} />}
    </>
  )
}

export default AggregatorMode
