import { Button, HStack } from '@chakra-ui/react'
import { ResolutionString } from '../../../public/charting_library_new'
interface ChartHeaderProps {
  onChangeResolution: (value: ResolutionString) => void
}
export default function ChartHeader(props: ChartHeaderProps) {
  const { onChangeResolution } = props
  return (
    <HStack>
      <Button onClick={() => onChangeResolution('1')}>1m</Button>
      <Button onClick={() => onChangeResolution('5')}>5m</Button>
      <Button onClick={() => onChangeResolution('10')}>10m</Button>
    </HStack>
  )
}
