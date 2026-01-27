import { useSigner } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { CoinAssist, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Button, VStack } from '@chakra-ui/react'
import { Transaction, coinWithBalance } from '@mysten/sui/transactions'

export default function TestCoin() {
  const clmmSdk = useSdk('clmm')
  const { signAndExecuteTransactionBlock } = useSigner()

  const handleSpitCoin = async () => {
    const tx = new Transaction()
    const amounts = new Array(60).fill(200)
    const recipients = new Array(60).fill(clmmSdk!.getSenderAddress())
    const coins = tx.splitCoins(
      tx.object('0x4ad097ec82f4980091f19efa257642a900e7e1b6ef7e855a40daf768a57e207e'),
      amounts.map(amount => tx.pure.u64(amount))
    )

    recipients.forEach((recipient, index) => {
      tx.transferObjects([coins[index]], tx.pure.address(recipient))
    })
    tx.setGasBudget(1000000000)
    const res = await signAndExecuteTransactionBlock(tx)
    console.log('🚀 ~ handleSpitCoin ~ res:', res)
  }

  const handleCoinWithBalance = async () => {
    const startTime = new Date().getTime()
    const tx = new Transaction()
    const coins = [
      '0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX',
      '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
      '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN'
    ]
    coins.forEach(type => {
      tx.transferObjects(
        [
          coinWithBalance({
            balance:
              type === '0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX' ? toDecimalsAmount(45.8231388, 9) : 1200,
            type
          })
        ],
        clmmSdk!.getSenderAddress()
      )
    })
    console.log('🚀 ------------------------------------🚀')
    console.log('🚀 ~ handleCoinWithBalance ~ tx:', tx)
    console.log('🚀 ------------------------------------🚀')
    const res = await clmmSdk!.FullClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: clmmSdk!.getSenderAddress()
    })

    const endTime = new Date().getTime()
    console.log('🚀 ~ signAndExecuteTransactionBlock ~ 耗时:', endTime - startTime, '毫秒')
    console.log('devInspectTransactionBlock:', res)
  }

  const handleCoinForAmount = async () => {
    const startTime = new Date().getTime()
    const tx = new Transaction()
    const allAssets: any = await clmmSdk!.FullClient.getOwnerCoinAssets(clmmSdk!.getSenderAddress())
    const coins = [
      '0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX',
      '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
      '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN'
    ]
    coins.forEach(type => {
      tx.transferObjects(
        [
          CoinAssist.buildCoinForAmount(
            tx,
            allAssets,
            BigInt(
              type === '0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX' ? toDecimalsAmount(45.8231388, 9) : 1200
            ),
            type,
            false,
            true
          ).target_coin
        ],
        clmmSdk!.getSenderAddress()
      )
    })

    console.log('🚀 ------------------------------------🚀')
    console.log('🚀 ~ handleCoinWithBalance ~ tx:', tx)
    console.log('🚀 ------------------------------------🚀')

    const res = await clmmSdk!.FullClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: clmmSdk!.getSenderAddress()
    })
    const endTime = new Date().getTime()
    console.log('🚀 ~ signAndExecuteTransactionBlock ~ 耗时:', endTime - startTime, '毫秒')
    console.log('devInspectTransactionBlock:', res)
  }

  return (
    <VStack>
      <Button onClick={handleSpitCoin}>spit coin object </Button>
      <Button onClick={handleCoinWithBalance}>使用 coinWithBalance </Button>
      <Button onClick={handleCoinForAmount}>使用 buildCoinForAmount </Button>
    </VStack>
  )
}
