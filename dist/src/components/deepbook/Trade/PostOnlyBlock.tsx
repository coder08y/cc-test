import { CetusTooltip } from '@cetus/design'
import { CheckBox, HTextLabelBox, Icon } from '@cetus/ui-kit'
import { Box, HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'

interface PostOnlyBlockProps {
  postOnly: boolean
  setPostOnly: (postOnly: boolean) => void
  timeInForce: 'GTC' | 'IOC' | 'FOK'
  setTimeInForce: (tif: 'GTC' | 'IOC' | 'FOK') => void
}

export default function PostOnlyBlock({ postOnly, setPostOnly, timeInForce, setTimeInForce }: PostOnlyBlockProps) {
  return (
    <HTextLabelBox
      label={
        <HStack gap="8px" cursor="pointer">
          <CheckBox
            checked={postOnly}
            onClick={() => {
              const checked = !postOnly
              setPostOnly(checked)
              // 启用 Post Only 时，TIF 自动选择为 GTC
              if (checked) {
                setTimeInForce('GTC')
              }
            }}
            wrapStyle={{
              width: '16px',
              height: '16px',
              sx: {
                '& svg': {
                  w: '12px',
                  h: '12px',
                  fill: postOnly ? '#000 !important' : 'transparent !important'
                }
              }
            }}
          />

          <Text
            onClick={() => {
              const newPostOnly = !postOnly
              setPostOnly(newPostOnly)
              // 启用 Post Only 时，TIF 自动选择为 GTC
              if (newPostOnly) {
                setTimeInForce('GTC')
              }
            }}
            fontSize={'12px'}
          >
            Post Only
          </Text>
        </HStack>
      }
      value={
        <HStack>
          <CetusTooltip
            placement="top"
            tooltip={
              <Box bg="bg_secondary" borderRadius="8px">
                <Text fontSize="12px" color={'text_caption'} mb="8px">
                  Time In Force
                </Text>
                {[
                  'GTC (Good til Cancel) : Order will rest until filled or canceled',
                  'IOC (Immediate Or Cancel) : Any portion that is not immediately filled will be canceled',
                  'FOK (Fill Or Kill) : Order must be filled entirely and immediately, otherwise it will be rejected'
                ].map((item, index) => (
                  <Text fontSize="12px" mb="6px" lineHeight="16px" key={`deepbook-time-in-force-${index}`}>
                    {item}
                  </Text>
                ))}
              </Box>
            }
          >
            <Text fontSize="12px" lineHeight={'16px'} borderBottom="1px dotted" borderColor="border" cursor="pointer">
              TIF
            </Text>
          </CetusTooltip>

          <Menu>
            {({ isOpen, onClose }) => (
              <>
                <MenuButton>
                  <HStack gap="0px">
                    <Text fontSize="12px" color={'text_caption'}>
                      {timeInForce}
                    </Text>
                    <Icon
                      xlinkHref="#icon-icon_descending"
                      svgW="20px"
                      svgH="20px"
                      sx={{
                        position: 'relative',
                        top: isOpen ? '2px' : '-3px',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </HStack>
                </MenuButton>
                <MenuList bg="bg_secondary" borderRadius="8px" p="4px" minW="76px" display={'flex'} flexDirection={'column'} gap={'4px'}>
                  {['GTC', 'IOC', 'FOK'].map(item => (
                    <MenuItem
                      p="4px 16px"
                      textAlign="center"
                      borderRadius="4px"
                      sx={{
                        bg: timeInForce === item ? 'primary_opacity.10' : 'none',
                        '& p': {
                          color: timeInForce === item ? 'primary' : 'text_caption'
                        },
                        _hover: {
                          bg: 'primary_opacity.10',
                          '& p': {
                            color: 'primary'
                          }
                        }
                      }}
                      onClick={() => {
                        const newTif = item as 'GTC' | 'IOC' | 'FOK'
                        setTimeInForce(newTif)
                        // 选择 IOC、FOK 时，Post Only 取消勾选
                        if (newTif === 'IOC' || newTif === 'FOK') {
                          setPostOnly(false)
                        }
                      }}
                      key={`db-time-in-force-${item}`}
                    >
                      <Text fontSize="12px">{item}</Text>
                    </MenuItem>
                  ))}
                </MenuList>
              </>
            )}
          </Menu>
        </HStack>
      }
      labelStyle={{ fontSize: '14px' }}
      valueStyle={{ fontSize: '14px' }}
      wrapStyle={{ h: '20px', lineHeight: '20px' }}
    />
  )
}
