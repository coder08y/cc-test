import { Image } from '@chakra-ui/react'
import '../../assets/css/BX_style.css' // 样式文件放在 src 目录或 public 中

const VaultsFarmingStar = ({ isHover }: { isHover: boolean }) => {
  return !isHover ? (
    <Image
      src="/images/icon_star@2x.png"
      minW={{ base: '12px', lg: '16px' }}
      h={{ base: '12px', lg: '16px' }}
      position="absolute"
      top="-4px"
      right="-4px"
    />
  ) : (
    <div className="BX_AEComposition">
      <div className="BX_Class3 BX_BG3 BX_Ani3" id="BX_Layer3" />
      <div className="BX_Class2 BX_BG2 BX_Ani2" id="BX_Layer2" />
      <div className="BX_Class1 BX_BG1 BX_Ani1" id="BX_Layer1" />
    </div>
  )
  // return (
  //   <div className="BX_AEComposition">
  //     <div className="BX_Class3 BX_BG3 BX_Ani3" id="BX_Layer3" />
  //     <div className="BX_Class2 BX_BG2 BX_Ani2" id="BX_Layer2" />
  //     <div className="BX_Class1 BX_BG1 BX_Ani1" id="BX_Layer1" />
  //   </div>
  // )
}

export default VaultsFarmingStar
