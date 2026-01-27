import { PosBaseInfo } from '@/types'
import { HStack, HTMLChakraProps, Text } from '@chakra-ui/react'

export type DailyEarnBlockProps = HTMLChakraProps<'div'> & {
  positionInfo: PosBaseInfo
  dailyEarnUSD: string
  dailyEarnOriginResult: any
  hasRewards: boolean
}

export default function DailyEarnBlock({ positionInfo, dailyEarnUSD, dailyEarnOriginResult, hasRewards, ...rest }: DailyEarnBlockProps) {
  return (
    <HStack {...rest}>
      <Text color="text_caption">{dailyEarnUSD}</Text>
    </HStack>
  )
  // return dailyEarnUSD === '$0' ? (
  //   <Text color="text_caption">{dailyEarnUSD}</Text>
  // ) : (
  //   <CetusTooltip
  //     tooltip={
  //       <VStack bg="bg_secondary" borderRadius="8px" minW="240px" p="16px 12px 12px">
  //         <VStack w="100%">
  //           <HStack w="100%" justify="space-between">
  //             <Text>Claimable Fees</Text>
  //             <Text color="text_caption">{}</Text>
  //           </HStack>
  //           <VStack w="100%" bg="card_bg" gap="0" borderRadius="8px">
  //             <HStack w="100%" justify="space-between" p="12px 8px">
  //               <SingleTokenInfo
  //                 token={positionInfo?.displayTokenA}
  //                 imgBoxStyle={{ w: '20px', h: '20px' }}
  //                 haveName={false}
  //                 symbolFontSize="12px"
  //                 warningIcon={{ iconW: '10px', iconH: '10px' }}
  //               />
  //               <VStack align="flex-end" gap="4px">
  //                 <Text fontSize="12px" color="text_caption">
  //                   {formatNumber(dailyEarnOriginResult?.FeeA?.dailyExpansionFactorAmount, 2)}
  //                 </Text>
  //                 <Text fontSize="12px">{formatCurrency(dailyEarnOriginResult?.FeeA?.dailyExpansionFactorUSD, 2)}</Text>
  //               </VStack>
  //             </HStack>
  //             <HStack w="100%" justify="space-between" p="0 8px 12px">
  //               <SingleTokenInfo
  //                 token={positionInfo?.displayTokenB}
  //                 imgBoxStyle={{ w: '20px', h: '20px' }}
  //                 haveName={false}
  //                 symbolFontSize="12px"
  //                 warningIcon={{ iconW: '10px', iconH: '10px' }}
  //               />
  //               <VStack align="flex-end" gap="4px">
  //                 <Text fontSize="12px" color="text_caption">
  //                   {formatNumber(dailyEarnOriginResult?.FeeB?.dailyExpansionFactorAmount, 2)}
  //                 </Text>
  //                 <Text fontSize="12px">{formatCurrency(dailyEarnOriginResult?.FeeB?.dailyExpansionFactorUSD, 2)}</Text>
  //               </VStack>
  //             </HStack>
  //           </VStack>
  //         </VStack>
  //         {hasRewards && <Box w="100%" h="1px" bg="card_bg" m="4px 0" />}
  //         {hasRewards && (
  //           <VStack w="100%">
  //             <HStack w="100%" justify="space-between">
  //               <Text>Pending Rewards</Text>
  //               <Text color="text_caption">{}</Text>
  //             </HStack>
  //             <VStack w="100%" align="flex-start" bg="card_bg" gap="0" borderRadius="8px">
  //               {dailyEarnOriginResult?.Mining?.map((item: any, index: number) => {
  //                 return (
  //                   <HStack w="100%" key={item?.CoinType} justify="space-between" p={index % 2 === 0 ? '12px 8px' : '0 8px 12px'}>
  //                     <SingleTokenInfo
  //                       coinType={item?.CoinType}
  //                       imgBoxStyle={{ w: '20px', h: '20px' }}
  //                       haveName={false}
  //                       symbolFontSize="12px"
  //                       warningIcon={{ iconW: '10px', iconH: '10px' }}
  //                     />
  //                     <VStack align="flex-end" gap="4px">
  //                       <Text fontSize="12px" color="text_caption">
  //                         {formatNumber(item?.dailyExpansionFactorAmount, 2)}
  //                       </Text>
  //                       <Text fontSize="12px"> {formatCurrency(item?.dailyExpansionFactorUSD, 2)}</Text>
  //                     </VStack>
  //                   </HStack>
  //                 )
  //               })}
  //               {/* {rewardsFarmsInfo?.map((item: any) => {
  //                 return (
  //                   <HStack key={item?.token?.coin_type} w="100%" justify="space-between" p="12px 8px">
  //                     <SingleTokenInfo
  //                       token={item?.token}
  //                       imgBoxStyle={{ w: '20px', h: '20px' }}
  //                       haveName={false}
  //                       symbolFontSize="12px"
  //                       warningIcon={{ iconW: '10px', iconH: '10px' }}
  //                     />
  //                     <VStack align="flex-end" gap="4px">
  //                       <Text fontSize="12px" color="text_caption">
  //                         {formatNumber(item?.display_amount_owed)}
  //                       </Text>
  //                       <Text fontSize="12px"> {formatCurrency(item?.amountUSD, 2)}</Text>
  //                     </VStack>
  //                   </HStack>
  //                 )
  //               })} */}
  //             </VStack>
  //           </VStack>
  //         )}
  //       </VStack>
  //     }
  //     bodyPadding="0"
  //     children={
  //       <HStack>
  //         <Text color="text_caption" borderBottom="1px dotted">
  //           {dailyEarnUSD}
  //         </Text>
  //       </HStack>
  //     }
  //   />
  // )
}
