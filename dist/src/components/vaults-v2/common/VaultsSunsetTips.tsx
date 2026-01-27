import { CetusTooltip } from '@cetus/design'
import { Text, TextProps } from '@chakra-ui/react'

export function VaultsSunsetTips({ status, onMouseEnter, wrapStyle }: { status: string; onMouseEnter: () => void; wrapStyle?: TextProps }) {
  return status === 'sunsetSoon' ? (
    // <Text
    //   fontSize="12px"
    //   color="text_caption"
    //   bg="process_bg_gray"
    //   p="2px 4px"
    //   borderRadius="4px"
    //   lineHeight="1"
    //   whiteSpace="nowrap"
    //   {...wrapStyle}
    //   onMouseEnter={onMouseEnter}
    //   cursor="default"
    // >
    //   Deprecated Soon
    // </Text>
    <CetusTooltip
      maxW="340px"
      tooltip={
        <Text fontSize="12px" lineHeight="20px">
          This vault will be deprecated soon. Please withdraw or migrate your assets at earliest convenience.
        </Text>
      }
      children={
        <Text
          fontSize="12px"
          color="text_caption"
          bg="process_bg_gray"
          p="2px 4px"
          borderRadius="4px"
          lineHeight="1"
          onMouseEnter={onMouseEnter}
          whiteSpace="nowrap"
          {...wrapStyle}
        >
          Deprecated Soon
        </Text>
      }
    />
  ) : (
    <CetusTooltip
      maxW="340px"
      tooltip={
        <Text fontSize="12px" lineHeight="20px">
          This vault has been deprecated. Please withdraw your assets at earliest convenience.
        </Text>
      }
      children={
        <Text
          fontSize="12px"
          color="text_caption"
          bg="process_bg_gray"
          p="2px 4px"
          borderRadius="4px"
          lineHeight="1"
          onMouseEnter={onMouseEnter}
          whiteSpace="nowrap"
          {...wrapStyle}
        >
          {status === 'sunset' ? 'Deprecated' : 'Deprecated Soon'}
        </Text>
      }
    />
  )
}
