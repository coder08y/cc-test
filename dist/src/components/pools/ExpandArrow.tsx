import '@/assets/css/dlmm_pools_arrow_tip.css'
import { Icon } from '@cetus/ui-kit'
import { Box } from '@chakra-ui/react'
function ExpandArrow({ isOpen }: { isOpen: boolean }) {
  return (
    <Box as="div" pos="relative" w="20px" h="20px">
      <Icon
        xlinkHref="#icon-icon_descending_nor"
        transform={isOpen ? 'rotate(-180deg)' : 'rotate(0deg)'}
        transition="transform 0.5s"
        fontSize="20px"
      />
      {/* <Box as="div" className="dlmm_pools_arrow">
        <Icon xlinkHref="#icon-icon_descending_nor" fontSize="20px" className="dlmm_pools_arrow_class_4  dlmm_pools_arrow_ani_4" />
        <Icon xlinkHref="#icon-icon_descending_nor" fontSize="20px" className="dlmm_pools_arrow_class_3  dlmm_pools_arrow_ani_3" />
        <Icon xlinkHref="#icon-icon_descending_nor" fontSize="20px" className="dlmm_pools_arrow_class_2  dlmm_pools_arrow_ani_2" />
        <Icon xlinkHref="#icon-icon_descending_nor" fontSize="20px" className="dlmm_pools_arrow_class_1 dlmm_pools_arrow_ani_1" />
      </Box> */}
    </Box>
  )
}

export default ExpandArrow
