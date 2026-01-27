export const TICK_SPACINGS = {
  '100': 2,
  '500': 10,
  '1000': 20,
  '2500': 60,
  '10000': 200,
  '20000': 220,
  // '2000': 60,
  '10': 1,
  // 0611新增
  '200': 4,
  '300': 6,
  '400': 8,
  '1500': 30,
  '2000': 40,
  '3000': 80,
  '4000': 100,
  '6000': 120,
  '8000': 160,
  '40000': 260
}

export const SupportedTickSpacings = Object.values(TICK_SPACINGS)
export const SupportedFeeRate = Object.keys(TICK_SPACINGS)

// toDo: 合约配置为2000但前端暂时展示2500，所以增加的配置, 后面恢复时需要删除
export const CorrectedPool: Record<string, string> = {
  '0x3f40c8bbb1c986a513373c9229bdccfe36d3d030f86d5207833b03859e48a3a9': '2500',
  '0xe01243f37f712ef87e556afb9b1d03d0fae13f96d324ec912daffc339dfdcbd2': '2500' // deep-sui暂还未确定是否更改
}

export const FrozenPools: string[] = [
  // '0xb8a67c149fd1bc7f9aca1541c61e51ba13bdded64c273c278e50850ae3bff073',
  // '0x7df346f8ef98ad20869ff6d2fc7c43c00403a524987509091b39ce61dde00957',
  // '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105'
]
