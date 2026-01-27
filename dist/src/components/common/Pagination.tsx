import { Icon } from '@cetus/ui-kit'
import { IconProps } from '@cetus/ui-kit/src/components/Icon'
import { Button, HStack, Text } from '@chakra-ui/react'

interface PaginationProps {
  currentPage: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

function Pagination({ currentPage, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)

  const onFirst = () => {
    onChange(1)
  }
  const onLast = () => {
    onChange(totalPages)
  }

  const onPre = () => {
    if (currentPage > 1) {
      onChange(currentPage - 1)
    }
  }

  const onNext = () => {
    if (currentPage < totalPages) {
      onChange(currentPage + 1)
    }
  }
  return (
    <HStack>
      <PageButton icon="#icon-icon_first" onClick={onFirst} disabled={currentPage === 1 || total === 0} />
      <PageButton icon="#icon-icon_page_left" onClick={onPre} disabled={currentPage === 1 || total === 0} />
      <Text pl="36px" pr="36px" color="text_caption" fontWeight="500">{`1-${totalPages} of ${currentPage}`}</Text>
      <PageButton icon="#icon-icon_page_left" onClick={onNext} transform="rotate(180deg)" disabled={currentPage >= totalPages || total === 0} />
      <PageButton icon="#icon-icon_first" onClick={onLast} transform="rotate(180deg)" disabled={currentPage >= totalPages || total === 0} />
    </HStack>
  )
}

interface PageButtonProps extends Omit<IconProps, 'xlinkHref'> {
  icon: string
  onClick: () => void
  disabled?: boolean
}

const PageButton = ({ icon, onClick, disabled = false, ...rest }: PageButtonProps) => {
  return (
    <Button
      variant="unstyled"
      flex="0 0 40px"
      h="28px"
      onClick={onClick}
      isDisabled={disabled}
      border="1px solid"
      borderColor="border"
      borderRadius="8px"
      bg="bg_secondary"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      _hover={{
        svg: {
          fill: disabled ? 'primary_gray' : 'text_caption'
        }
      }}
    >
      <Icon
        xlinkHref={icon}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        svgFill={disabled ? 'primary_gray' : 'text_paragraph'}
        svgHover={disabled ? 'primary_gray' : 'text_caption'}
        {...rest}
      />
    </Button>
  )
}

export default Pagination
