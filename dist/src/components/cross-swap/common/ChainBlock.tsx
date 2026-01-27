import { Icon } from '@cetus/ui-kit'
import { HStack, Image, ImageProps, StackProps, Text, TextProps } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

type ChainBlockProps = {
  chainName: string
  chainLogo: string
  type?: 'default' | 'more'
  haveMore?: boolean
  wrapStyle?: StackProps
  imageStyle?: ImageProps
  textStyle?: TextProps
}

export default function ChainBlock(props: ChainBlockProps) {
  const { chainLogo, chainName, haveMore, wrapStyle, imageStyle, textStyle, type = 'default' } = props
  const [isHover, setIsHover] = useState(false)

  // 默认样式按 type 区分
  const defaultStyles = useMemo(() => {
    if (type === 'default') {
      return {
        wrap: {
          h: '20px',
          pr: '4px',
          border: 'none',
          gap: '0px',
          bg: 'primary_opacity.15',
          padding: '4px',
          borderRadius: '14px'
        } as StackProps,
        image: {
          w: '16px',
          h: '16px'
        } as ImageProps,
        text: {
          fontSize: '12px',
          ml: '2px'
        } as TextProps
      }
    } else {
      return {
        wrap: {
          padding: '4px',
          bg: 'bg_ten',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '14px',
          cursor: 'pointer',
          gap: '0px',
          userSelect: 'none',
          boxSizing: 'border-box',
          h: '28px'
        } as StackProps,
        image: {
          w: '20px',
          h: '20px'
        } as ImageProps,
        text: {
          ml: '6px',
          fontSize: '14px'
        } as TextProps
      }
    }
  }, [type])

  return (
    <HStack {...defaultStyles.wrap} {...wrapStyle} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
      <Image borderRadius="50%" src={chainLogo} {...defaultStyles.image} {...imageStyle} />
      <Text mr="2px" color="text_caption" {...defaultStyles.text} {...textStyle}>
        {chainName}
      </Text>
      {haveMore && <Icon xlinkHref="#icon-detail" svgW="16px" svgH="16px" svgFill={isHover ? 'text_caption' : 'text_paragraph'} />}
    </HStack>
  )
}
