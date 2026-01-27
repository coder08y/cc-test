/**
 * toDo: 等Pump上线稳定后, 可以将BirdeyeChart放到公共组件里，两边都用一个组件
 */

import { Box } from '@chakra-ui/react'
import { useState } from 'react'
import ChartLoading from './ChartLoading'

type BirdeyeChartType = {
  from: string
  to: string
  chartInterval?: string
}
export default function BirdeyeChart({ from, to, chartInterval }: BirdeyeChartType) {
  const [isLoading, setLoading] = useState(true)
  return (
    <Box w="100%" h="100%" position="relative">
      {(isLoading || !from || !to) && <ChartLoading />}
      <iframe
        id="geckoterminal-embed"
        className="frame"
        height="100%"
        width="100%"
        title="GeckoTerminal Embed"
        frameBorder="0"
        allow="clipboard-write"
        allowFullScreen
        src={`https://birdeye.so/tv-widget/${from}/${to}?chain=sui&viewMode=base%2Fquote&chartInterval=${chartInterval || 5}&chartType=CANDLE&chartTimezone=Asia%2FShanghai&chartLeftToolbar=show&theme=dark`}
        onLoad={() => {
          setLoading(false)
        }}
      />
    </Box>
  )
}
