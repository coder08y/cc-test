import ActionButton from '@/components/liquidity/common/ActionButton'
import useLiquidityStore from '@/store/clmm'
import useDepositStore from '@/store/clmm/deposit'
import { useDebounceFunction } from '@cetus/hooks'
import { Icon } from '@cetus/ui-kit'
import { Center, Divider, Flex, HStack } from '@chakra-ui/react'
import { ScaleLinear, ZoomBehavior, ZoomTransform, select, zoom, zoomIdentity } from 'd3'
import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { ZoomLevels } from './types'

type ActionButtonProps = {
  type: 'Add' | 'Sub'
  onClick: (data?: any) => void
}

const Wrapper = styled.div<{ count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ count }) => count.toString()}, 1fr);
  grid-gap: 6px;

  position: absolute;
  top: -18px;
  right: 0;
`

export const ZoomOverlay = styled.rect`
  fill: transparent;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`

export default function Zoom({
  svg,
  xScale,
  // zoom,
  setZoom,
  width,
  height,
  resetBrush,
  showResetButton,
  zoomLevels,
  isFrom,
  handleClickRefresh,
  currentRange,
  isApp
}: {
  svg: SVGElement | null
  xScale: ScaleLinear<number, number>
  // setZoom: (value: number) => void
  // zoom: number
  setZoom: (transform: ZoomTransform) => void
  width: number
  height: number
  resetBrush: () => void
  showResetButton: boolean
  zoomLevels: ZoomLevels
  isFrom?: boolean
  currentRange?: any
  handleClickRefresh: () => void
  isApp?: boolean
}) {
  const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>()
  const { setCurrentRange } = useLiquidityStore()
  const { recommendRangesInfo } = useDepositStore()
  const [zoomIn, zoomOut, zoomInitial, zoomReset] = useMemo(
    () => [
      () => {
        svg &&
          zoomBehavior.current &&
          select(svg as Element)
            .transition()
            .call(zoomBehavior.current.scaleBy, 2)
      },
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleTo, 1),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .call(zoomBehavior.current.transform, zoomIdentity.translate(0, 0).scale(1))
          .transition()
          .call(zoomBehavior.current.scaleTo, 1)
    ],
    [svg]
  )

  const debouncedSetZoom = useDebounceFunction(setZoom, 300)

  useEffect(() => {
    if (!svg) return

    zoomBehavior.current = zoom()
      .scaleExtent([0, Infinity])
      .extent([
        [0, 0],
        [width, height]
      ])
      .on('zoom', ({ transform }: { transform: ZoomTransform }) => {
        debouncedSetZoom(transform)
      })

    select(svg as Element).call(zoomBehavior.current)
    // }, [height, width, setZoom, svg, xScale, zoomBehavior, zoomLevels.max, zoomLevels.min])
  }, [height, width, setZoom, svg, zoomBehavior, zoomLevels.max, zoomLevels.min])

  useEffect(() => {
    zoomInitial()
  }, [zoomInitial, zoomLevels])

  useEffect(() => {
    zoomReset()
  }, [currentRange])
  const handleReset = () => {
    if (!isFrom) {
      setCurrentRange(recommendRangesInfo?.type === 'unstable' ? 'active' : 'default')
      zoomReset()
    }
  }

  return (
    <Flex
      w="100%"
      p="0px"
      align="center"
      opacity={isFrom ? 0 : 1}
      sx={{
        '@media screen and (max-width: 960px)': {
          flexDirection: 'column',
          w: '100%',
          alignItems: !isFrom ? 'flex-start' : 'flex-end'
        }
      }}
    >
      {/* <HStack
        as="button"
        gap="2px"
        pos="absolute"
        top={{ base: '-256px', lg: '-78px' }}
        left={{ base: '100px', lg: '-8px' }}
        _hover={{ p: { color: 'text_caption' }, svg: { fill: 'text_caption' } }}
        cursor="pointer"
        onClick={handleReset}
      >
        <Icon xlinkHref="#icon-reset" fontSize="14px" />
        <Text fontSize="12px">Reset</Text>
      </HStack> */}
      <HStack
        justify={{ base: 'flex-start', lg: 'flex-end' }}
        flex="1"
        position="absolute"
        right="0px"
        top={{ base: '-5px', lg: '-46px' }}
        flexDir={{ base: 'row-reverse', lg: 'row' }}
        gap="0"
        h="28px"
        borderRadius="8px"
        border="1px solid"
        borderColor="border"
        bg="bg_nine"
      >
        {/* <RefreshIcon handleClickRefresh={handleClickRefresh} noBg isAutoRefresh={true} /> */}
        {/* <Icon svgW="24px" svgH="24px" boxW="24px" boxH="24px" xlinkHref="#icon-icon_zoomin" onClick={zoomIn} /> */}
        {/* <Icon svgW="24px" svgH="24px" boxW="24px" boxH="24px" xlinkHref="#icon-icon_zoomout" onClick={zoomOut} /> */}

        <ActionButton
          type="Add"
          onClick={() => {
            console.log('start zoom in')
            zoomIn()
          }}
        />
        <Divider orientation="vertical" h="16px" />
        <ActionButton type="Sub" onClick={zoomOut} />
      </HStack>
    </Flex>
  )
}

function ActionButton(props: ActionButtonProps) {
  const { type, onClick } = props
  return (
    <Center w="28px" h="26px">
      <Icon xlinkHref={type === 'Add' ? '#icon-a-icon_zoomout' : '#icon-a-icon_zoomin'} onClick={onClick} />
    </Center>
  )
}
