import { Token } from '@cetus/types'

/**
 * key: vaultId
 * value: { vaults_id: string; clmm_pool: string; isUnstableVault?: boolean; lpToken: Token }
 */
export const vaultsMaps: Record<string, { vaults_id: string; clmm_pool: string; isUnstableVault?: boolean; lpToken: Token }> = {
  '0xff4cc0af0ad9d50d4a3264dfaafd534437d8b66c8ebe9f92b4c39d898d6870a3': {
    vaults_id: '0xff4cc0af0ad9d50d4a3264dfaafd534437d8b66c8ebe9f92b4c39d898d6870a3',
    clmm_pool: '0xa528b26eae41bcfca488a9feaa3dca614b2a1d9b9b5c78c256918ced051d4c50',
    lpToken: {
      coin_type: '0x0c8a5fcbe32b9fc88fe1d758d33dd32586143998f68656f43f3a6ced95ea4dc3::lp_token::LP_TOKEN',
      decimals: 9,
      description: '',
      logo_url: 'https://j5w37hib4ojxo6bymogsbg5r5qkkdhuvfprizrw4kxakm3jxz24q.arweave.net/T22_nQHjk3d4OGONIJux7BShnpUr4ozG3FXApm03zrk',
      name: '',
      symbol: ''
    }
  },
  '0x73e3ae25107adb4bda2a286773fd6998087c5c7978f0b5d0ceebea06e7d3e7b7': {
    vaults_id: '0x73e3ae25107adb4bda2a286773fd6998087c5c7978f0b5d0ceebea06e7d3e7b7',
    clmm_pool: '0xa528b26eae41bcfca488a9feaa3dca614b2a1d9b9b5c78c256918ced051d4c50',
    lpToken: {
      coin_type: '0xb5d24240b22fc347e37ed23b289d8ae5da95ef796a2ec70d3f223ebd2c8db72d::lp_token::LP_TOKEN',
      decimals: 9,
      description: '',
      logo_url: 'https://node1.irys.xyz/T8UCTnbIDT_8PWn04jAPsGD08wzSyryOzVYbYPzVWhw',
      name: '',
      symbol: ''
    }
  },
  '0x5732b81e659bd2db47a5b55755743dde15be99490a39717abc80d62ec812bcb6': {
    vaults_id: '0x5732b81e659bd2db47a5b55755743dde15be99490a39717abc80d62ec812bcb6',
    clmm_pool: '0x6c545e78638c8c1db7a48b282bb8ca79da107993fcb185f75cedc1f5adb2f535',
    lpToken: {
      coin_type: '0xb490d6fa9ead588a9d72da07a02914da42f6b5b1339b8118a90011a42b67a44f::lp_token::LP_TOKEN',
      decimals: 9,
      logo_url: 'https://tke7enjn3akurmshmxw2yr2yo4ru6joi6sxpnbsyk452k36vfdoa.arweave.net/monyNS3YFUiyR2XtrEdYdyNPJcj0rvaGWFc7pW_VKNw',
      description: '',
      name: '',
      symbol: ''
    }
  },
  '0xde97452e63505df696440f86f0b805263d8659b77b8c316739106009d514c270': {
    vaults_id: '0xde97452e63505df696440f86f0b805263d8659b77b8c316739106009d514c270',
    clmm_pool: '0x871d8a227114f375170f149f7e9d45be822dd003eba225e83c05ac80828596bc',
    lpToken: {
      coin_type: '0x828b452d2aa239d48e4120c24f4a59f451b8cd8ac76706129f4ac3bd78ac8809::lp_token::LP_TOKEN',
      decimals: 9,
      logo_url: 'https://dzuxtnuvuq7xqcurpbk4udj74zm2h5c52ftpaxsmgvxdt3fxtgva.arweave.net/Hml5tpWkP3gKkXhVyg0_5lmj9F3RZvBeTDVuOey3mao',
      description: '',
      name: '',
      symbol: ''
    }
  },
  '0x41a4ab1e82f90f5965bbcd828b8ffa13bab7560bd2e352ab067e343db552f527': {
    vaults_id: '0x41a4ab1e82f90f5965bbcd828b8ffa13bab7560bd2e352ab067e343db552f527',
    clmm_pool: '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105',
    lpToken: {
      name: 'SUI-USDC Haedal Vault LP Token',
      symbol: 'SUI-USDC Vault LPT',
      decimals: 6,
      logo_url: 'https://node1.irys.xyz/TZD49BnoQJTbSIsGi_qfnzfN0MuCE17hYMeOWaMqpEs',
      project_url: '',
      coin_type: '0x2f46a040b9bc3a584a3be4d7bfbb02a5fb479da17a04c6d2860ed61d95e97f3f::lpcoin::LPCOIN',
      description: ''
    }
  },
  '0xed754b6a3a6c7549c3d734cb7b464bccf9c805814b9e47b0cb99f43b4efcb4a6': {
    vaults_id: '0xed754b6a3a6c7549c3d734cb7b464bccf9c805814b9e47b0cb99f43b4efcb4a6',
    clmm_pool: '0xe01243f37f712ef87e556afb9b1d03d0fae13f96d324ec912daffc339dfdcbd2',
    lpToken: {
      name: 'DEEP-SUI Haedal Vault LP Token',
      symbol: 'DEEP-SUI Vault LPT',
      decimals: 9,
      logo_url: 'https://node1.irys.xyz/NVpcEHcDm71AOiNdu5BjfZ5RoXwROnKMUE3PEwDOKM4',
      project_url: '',
      coin_type: '0xd418945e16ef3db737df093d0827f5ce387b36f089523e13c16e50dec6bd2524::lpcoin::LPCOIN',
      description: ''
    }
  },
  '0x12ac7deea4b92b3e2c16687e2d2695fa8c045ec0a52844db7b2fc3876c9552aa': {
    vaults_id: '0x12ac7deea4b92b3e2c16687e2d2695fa8c045ec0a52844db7b2fc3876c9552aa',
    clmm_pool: '0x72f5c6eef73d77de271886219a2543e7c29a33de19a6c69c5cf1899f729c3f17',
    lpToken: {
      name: 'WAL-haSUI Haedal Vault LP Token',
      symbol: 'WAL-haSUI Vault LPT',
      decimals: 9,
      logo_url: 'https://node1.irys.xyz/byrMmE8Xu83i73BKML8yQGXq9H6a-mA6pDFnIQlu_84',
      project_url: '',
      coin_type: '0x5c79c0ab2c45682aba43b1acbe5c478d947f7c8397d47447906d6cc127e180fb::lpcoin::LPCOIN',
      description: ''
    }
  },
  '0x99db9a7d3320d31fe6e4dc4122b948162010e331c41dc279636ca75567b93497': {
    vaults_id: '0x99db9a7d3320d31fe6e4dc4122b948162010e331c41dc279636ca75567b93497',
    clmm_pool: '0xaa020ad81e1621d98d4fb82c4acb80dc064722f24ef828ab633bef50fc28268b',
    lpToken: {
      name: 'haSUI-USDC Haedal Vault LP Token',
      symbol: 'haSUI-USDC Vault LPT',
      decimals: 6,
      logo_url: 'https://node1.irys.xyz/uPsVdR-uVDtGW-FMwvSm4PV123RnHBzAYb2S9nO923E',
      project_url: '',
      coin_type: '0x0484a9162669957e1c1883fc2da59e3cce9afdc1eec3c72c983898dbc9e92b91::lpcoin::LPCOIN',
      description: ''
    }
  },
  '0xedfb22d1bbe5045fd1888bb8bc1c4bc1823ab24d40f5a4bea9f6eb9758a4b820': {
    vaults_id: '0xedfb22d1bbe5045fd1888bb8bc1c4bc1823ab24d40f5a4bea9f6eb9758a4b820',
    clmm_pool: '0x9e59de50d9e5979fc03ac5bcacdb581c823dbd27d63a036131e17b391f2fac88',
    lpToken: {
      name: 'ETH-USDC Haedal Vault LP Token',
      symbol: 'ETH-USDC Vault LPT',
      decimals: 6,
      logo_url: 'https://node1.irys.xyz/AsgmYwj4r2jNmfjHBktWEPJP1pLaamS-SMICcmFZQIc',
      project_url: '',
      coin_type: '0x8275bc774497b319db110bb97a4812a19859ab6f19dc1574746097f06103c0f9::lpcoin::LPCOIN',
      description: ''
    }
  },
  '0xbbd2d4850e4f238d39c3aa24957d2dfbb5787fa43d6c7de306bf15abe27f29f2': {
    vaults_id: '0xbbd2d4850e4f238d39c3aa24957d2dfbb5787fa43d6c7de306bf15abe27f29f2',
    clmm_pool: '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded',
    lpToken: {
      name: 'CETUS-SUI Haedal Vault LP Token',
      symbol: 'CETUS-SUI Vault LPT',
      decimals: 9,
      logo_url: 'https://node1.irys.xyz/wDk5NmfNJXk2yT_ocfN3UuYtAltpTjGGr-MQzPNl9E0',
      project_url: '',
      coin_type: '0x242ddc526b9cb75513bee2fc629e01d5b7dc6da4c02d39cdab0160794635334f::lpcoin::LPCOIN',
      description: ''
    }
  },
  '0xbd6252e0d56ae5eaabf055fd6c518ee5f66c1114287ca957cc698a17c3d25b16': {
    vaults_id: '0xbd6252e0d56ae5eaabf055fd6c518ee5f66c1114287ca957cc698a17c3d25b16',
    clmm_pool: '0x2fc6ee9183d0f1ca0d2dded02c416be6f4671bb82db55c26ce12b536812a4b8e',
    lpToken: {
      name: 'LBTC-SUI Haedal Vault LP Token',
      symbol: 'LBTC-SUI Vault LPT',
      decimals: 9,
      logo_url: 'https://node1.irys.xyz/-CIyJycPqRHU1xnI0eJLtccVFr3PJDX_Ahz7Mlh8Pvo',
      project_url: '',
      coin_type: '0xb2d502d4ef89395934de020b195ded323bfa86d7f40b65ed5b15d6b66c722a3d::lpcoin::LPCOIN',
      description: ''
    }
  },
  '0x5525f5a70fffd93f616c39b59f3abdd2054fc2d19f09c8a4d94950d611a43b74': {
    vaults_id: '0x5525f5a70fffd93f616c39b59f3abdd2054fc2d19f09c8a4d94950d611a43b74',
    clmm_pool: '0xea648440bd640d3530e8a5f02c0b56da82c2efe851156c39974b901bbb0eeab1',
    lpToken: {
      name: 'WAL-haSUI Haedal Vault LP Token',
      symbol: 'WAL-haSUI Vault LPT',
      decimals: 9,
      logo_url: 'https://node1.irys.xyz/byrMmE8Xu83i73BKML8yQGXq9H6a-mA6pDFnIQlu_84',
      project_url: '',
      coin_type: '0x5c79c0ab2c45682aba43b1acbe5c478d947f7c8397d47447906d6cc127e180fb::lpcoin::LPCOIN',
      description: ''
    }
  }
}

export const staticVaultsList: any = [
  {
    poolAddress: '0x871d8a227114f375170f149f7e9d45be822dd003eba225e83c05ac80828596bc',
    name: 'haSUI - SUI',
    isReverse: false,
    tokenA: {
      name: 'Haedal staked SUI',
      symbol: 'haSUI',
      decimals: 9,
      address: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
      balance: '9808420.561870547',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/hasui.png',
      coingecko_id: 'haedal-staked-sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI'
    },
    tokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '4906526.459378922',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    displayTokenA: {
      name: 'Haedal staked SUI',
      symbol: 'haSUI',
      decimals: 9,
      address: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
      balance: '9808420.561870547',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/hasui.png',
      coingecko_id: 'haedal-staked-sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI'
    },
    displayTokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '4906526.459378922',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    haveMining: false,
    miningRewardList: [],
    miningAprList: [],
    haveFarming: true,
    farmsRewarderList: [{ coinType: '0x2::sui::SUI', emissionsEveryDay: '1660' }],
    farmsApr: '0.0518854671450343098098316019470933000166085972573126523381066642',
    farmingAprDisplay: '5.18%',
    feeApr: '0.0024026852043393462354559911502367355412380011356114481601412655',
    feeAprDisplay: '0.24%',
    miningAprTotal: '0',
    feeAndMiningAprDisplay: '0.24%',
    totalAprDisplay: '5.42%',
    fee: '0.0001',
    feeRate: '1',
    feeDisplay: '0.01%',
    tvlDisplay: '$34,493,018.28',
    tvl: '34493018.281195',
    volume24Display: '$2,280,261.01',
    fees24Display: '$228.02',
    isVaults: true,
    farmsStatedTvl: '26486362.741908405324614107895615170922538233',
    farmsStatedTvlDisplay: '$26,486,362.74',
    feeAndFarmsApr: '0.0542881523493736560452875930973300355578465983929241004982479297',
    feeAndFarmsAprDisplay: '5.42%',
    farmsEffectiveTickLower: 458,
    farmsEffectiveTickUpper: 630,
    displayFarmsEffectMinPrice: '1.04686261985650299343324213325963175512302823358939922365776382',
    displayFarmsEffectMaxPrice: '1.065023484625683903423611073362171479042941553679249804326112882',
    farmsPoolAddress: '0x9f5fd63b2a2fd8f698ff6b7b9720dbb2aa14bedb9fc4fd6411f20e5b531a4b89',
    tickSpacing: '2',
    index: 171,
    object: {
      coin_a: 9808458908401888,
      coin_b: 4906587775647608,
      tick_spacing: 2,
      fee_rate: 100,
      liquidity: '4518573584291114825',
      current_sqrt_price: '18904297306631983245',
      rewarder_manager: {
        fields: {
          rewarders: [
            {
              fields: {
                reward_coin: { fields: { name: '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI' } },
                emissions_per_second: '0',
                growth_global: '1257881454428453'
              }
            }
          ],
          points_released: '891294616929869525730459648000000',
          points_growth_global: '21523796564358466',
          last_updated_time: 1742298390
        }
      },
      is_pause: false,
      index: 171
    },
    isUnstableVault: false,
    vaultId: '0xde97452e63505df696440f86f0b805263d8659b77b8c316739106009d514c270',
    vaultsRewards: [
      'bde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
      '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
    ],
    category: 'cetus',
    vaultsTvl: '--',
    vaultsTvlDisplay: '--',
    vaultsApy: '--',
    vaultsApyDisplay: '--',
    vaultsTotalApy: '--',
    vaultsTotalApyDisplay: '--',
    vaultsLstApy: '--',
    vaultsLstApyDisplay: '--',
    vaultsApr: '--',
    vaultsAprDisplay: '--',
    vaultsId: '0xde97452e63505df696440f86f0b805263d8659b77b8c316739106009d514c270',
    clmmPoolAddress: '0x871d8a227114f375170f149f7e9d45be822dd003eba225e83c05ac80828596bc',
    amountPerLpA: '0',
    amountPerLpB: '0',
    hardCapUSD: '0',
    depositRatioDisplay: '--',
    depositRatio: null
  },
  {
    poolAddress: '0xa528b26eae41bcfca488a9feaa3dca614b2a1d9b9b5c78c256918ced051d4c50',
    name: 'afSUI - SUI',
    isReverse: false,
    tokenA: {
      name: 'Aftermath Staked SUI',
      symbol: 'afSUI',
      decimals: 9,
      address: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
      balance: '658417.270250603',
      logo_url: 'https://aftermath.finance/coins/afsui.svg',
      coingecko_id: '',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI'
    },
    tokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '728051.794256833',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    displayTokenA: {
      name: 'Aftermath Staked SUI',
      symbol: 'afSUI',
      decimals: 9,
      address: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
      balance: '658417.270250603',
      logo_url: 'https://aftermath.finance/coins/afsui.svg',
      coingecko_id: '',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI'
    },
    displayTokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '728051.794256833',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    haveMining: false,
    miningRewardList: [],
    miningAprList: [],
    haveFarming: true,
    farmsRewarderList: [{ coinType: '0x2::sui::SUI', emissionsEveryDay: '179' }],
    farmsApr: '0.0464023636393077740203769764174118048604573922372862799918758555',
    farmingAprDisplay: '4.64%',
    feeApr: '0.0033899366954780440962433422983686951853302867916998498680873725',
    feeAprDisplay: '0.33%',
    miningAprTotal: '0',
    feeAndMiningAprDisplay: '0.33%',
    totalAprDisplay: '4.97%',
    fee: '0.0001',
    feeRate: '1',
    feeDisplay: '0.01%',
    tvlDisplay: '$3,208,847.14',
    tvl: '3208847.148567',
    volume24Display: '$299,303.7',
    fees24Display: '$29.93',
    isVaults: true,
    farmsStatedTvl: '3193543.9222334375613019913559132207271233416',
    farmsStatedTvlDisplay: '$3,193,543.92',
    feeAndFarmsApr: '0.049792300334785818116620318715780500045787679028986129859963228',
    feeAndFarmsAprDisplay: '4.97%',
    farmsEffectiveTickLower: 246,
    farmsEffectiveTickUpper: 630,
    displayFarmsEffectMinPrice: '1.024903815942060126071216020214630750602010709809178108739814341',
    displayFarmsEffectMaxPrice: '1.065023484625683903423611073362171479042941553679249804326112882',
    farmsPoolAddress: '0xa67a2c2ea1bfad784e44eaf079fbf4523f549dcbe2e1c838989aef9383e372da',
    tickSpacing: '2',
    index: 177,
    object: {
      coin_a: 658460129348399,
      coin_b: 728098232825595,
      tick_spacing: 2,
      fee_rate: 100,
      liquidity: '118870647915638752',
      current_sqrt_price: '18838643734050246682',
      rewarder_manager: {
        fields: {
          rewarders: [
            {
              fields: {
                reward_coin: { fields: { name: '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI' } },
                emissions_per_second: '0',
                growth_global: '116212414799563023'
              }
            }
          ],
          points_released: '807216091435844318162583552000000',
          points_growth_global: '16349896683785349254',
          last_updated_time: 1742298232
        }
      },
      is_pause: false,
      index: 177
    },
    isUnstableVault: false,
    vaultId: '0xff4cc0af0ad9d50d4a3264dfaafd534437d8b66c8ebe9f92b4c39d898d6870a3',
    vaultsRewards: [
      'f325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
      '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
    ],
    category: 'cetus',
    vaultsTvl: '--',
    vaultsTvlDisplay: '--',
    vaultsApy: '--',
    vaultsApyDisplay: '--',
    vaultsTotalApy: '--',
    vaultsTotalApyDisplay: '--',
    vaultsLstApy: '--',
    vaultsLstApyDisplay: '--',
    vaultsApr: '--',
    vaultsAprDisplay: '--',
    vaultsId: '0xff4cc0af0ad9d50d4a3264dfaafd534437d8b66c8ebe9f92b4c39d898d6870a3',
    clmmPoolAddress: '0xa528b26eae41bcfca488a9feaa3dca614b2a1d9b9b5c78c256918ced051d4c50',
    amountPerLpA: '0',
    amountPerLpB: '0',
    hardCapUSD: '0',
    depositRatioDisplay: '--',
    depositRatio: null
  },
  {
    poolAddress: '0x6c545e78638c8c1db7a48b282bb8ca79da107993fcb185f75cedc1f5adb2f535',
    name: 'vSUI - SUI',
    isReverse: false,
    tokenA: {
      name: 'Volo Staked SUI',
      symbol: 'vSUI',
      decimals: 9,
      address: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
      balance: '486628.267188103',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/vsui.png',
      coingecko_id: 'volo-staked-sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT'
    },
    tokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '600110.710175814',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    displayTokenA: {
      name: 'Volo Staked SUI',
      symbol: 'vSUI',
      decimals: 9,
      address: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
      balance: '486628.267188103',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/vsui.png',
      coingecko_id: 'volo-staked-sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT'
    },
    displayTokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '600110.710175814',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    haveMining: false,
    miningRewardList: [],
    miningAprList: [],
    haveFarming: true,
    farmsRewarderList: [{ coinType: '0x2::sui::SUI', emissionsEveryDay: '185' }],
    farmsApr: '0.0620621744498103516020273711367605077176330280935694176694522726',
    farmingAprDisplay: '6.2%',
    feeApr: '0.002839603128562170485549675399055637257215998153216582864163728',
    feeAprDisplay: '0.28%',
    miningAprTotal: '0',
    feeAndMiningAprDisplay: '0.28%',
    totalAprDisplay: '6.49%',
    fee: '0.0001',
    feeRate: '1',
    feeDisplay: '0.01%',
    tvlDisplay: '$2,510,926.42',
    tvl: '2510926.429555',
    volume24Display: '$196,180.07',
    fees24Display: '$19.61',
    isVaults: true,
    farmsStatedTvl: '2467770.1483943725745405060221935259780125246',
    farmsStatedTvlDisplay: '$2,467,770.14',
    feeAndFarmsApr: '0.0649017775783725220875770465358161449748490262467860005336160006',
    feeAndFarmsAprDisplay: '6.49%',
    farmsEffectiveTickLower: 198,
    farmsEffectiveTickUpper: 630,
    displayFarmsEffectMinPrice: '1.019996310431884656665875778090597179747899267937297195270940555',
    displayFarmsEffectMaxPrice: '1.065023484625683903423611073362171479042941553679249804326112882',
    farmsPoolAddress: '0xf47709fd3cfb41252cda363f32dc29f34a6eaaf3729927753e75d73abc5f5181',
    tickSpacing: '2',
    index: 175,
    object: {
      coin_a: 486658132530526,
      coin_b: 600167780501069,
      tick_spacing: 2,
      fee_rate: 100,
      liquidity: '2321413517446008068',
      current_sqrt_price: '18827542383370490467',
      rewarder_manager: {
        fields: {
          rewarders: [
            {
              fields: {
                reward_coin: { fields: { name: '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI' } },
                emissions_per_second: '0',
                growth_global: '1622087936923460'
              }
            }
          ],
          points_released: '798552762549067364341645312000000',
          points_growth_global: '31233269161567778',
          last_updated_time: 1742298387
        }
      },
      is_pause: false,
      index: 175
    },
    isUnstableVault: false,
    vaultId: '0x5732b81e659bd2db47a5b55755743dde15be99490a39717abc80d62ec812bcb6',
    vaultsRewards: [
      '549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
      '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
    ],
    category: 'cetus',
    vaultsTvl: '--',
    vaultsTvlDisplay: '--',
    vaultsApy: '--',
    vaultsApyDisplay: '--',
    vaultsTotalApy: '--',
    vaultsTotalApyDisplay: '--',
    vaultsLstApy: '--',
    vaultsLstApyDisplay: '--',
    vaultsApr: '--',
    vaultsAprDisplay: '--',
    vaultsId: '0x5732b81e659bd2db47a5b55755743dde15be99490a39717abc80d62ec812bcb6',
    clmmPoolAddress: '0x6c545e78638c8c1db7a48b282bb8ca79da107993fcb185f75cedc1f5adb2f535',
    amountPerLpA: '0',
    amountPerLpB: '0',
    hardCapUSD: '0',
    depositRatioDisplay: '--',
    depositRatio: null
  },
  {
    poolAddress: '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105',
    name: 'SUI - USDC',
    isReverse: true,
    tokenA: {
      name: 'Native USDC',
      symbol: 'USDC',
      decimals: 6,
      address: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      balance: '6994556.776019',
      logo_url: 'https://gateway.irys.xyz/EGpc2cG886CrWwLMneF2RyVpZ7D33a6znz6XE8n8nU7h',
      coingecko_id: 'usd-coin',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
    },
    tokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '6470393.713602128',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    displayTokenA: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '6470393.713602128',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    displayTokenB: {
      name: 'Native USDC',
      symbol: 'USDC',
      decimals: 6,
      address: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      balance: '6994556.776019',
      logo_url: 'https://gateway.irys.xyz/EGpc2cG886CrWwLMneF2RyVpZ7D33a6znz6XE8n8nU7h',
      coingecko_id: 'usd-coin',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
    },
    haveMining: true,
    miningRewardList: [
      { coinType: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS', emissionsEveryDay: '30000000000000' },
      { coinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', emissionsEveryDay: '2936000000000' }
    ],
    miningAprList: [
      {
        coinType: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
        apr: '0.0502302597554847335728918598923420349382548448020840644503019149',
        aprDisplay: '5.02%'
      },
      {
        coinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
        apr: '0.1121697952437793563166939156096767251552891223880879922231831828',
        aprDisplay: '11.21%'
      }
    ],
    haveFarming: false,
    farmsRewarderList: [],
    farmsApr: '0',
    farmingAprDisplay: '',
    feeApr: '1.039543323716705126378191733239089190848621545971870975717999998',
    feeAprDisplay: '103.95%',
    miningAprTotal: '0.1624000549992640898895857755020187600935439671901720566734850977',
    feeAndMiningAprDisplay: '120.19%',
    totalAprDisplay: '120.19%',
    fee: '0.0025',
    feeRate: '25',
    feeDisplay: '0.25%',
    tvlDisplay: '$21,669,273.38',
    tvl: '21669273.389889',
    volume24Display: '$25,196,763.83',
    fees24Display: '$62,991.9',
    isVaults: false,
    farmsStatedTvl: '',
    farmsStatedTvlDisplay: '',
    feeAndFarmsApr: '1.201943378715969216267777508741107950942165513162043032391485095',
    feeAndFarmsAprDisplay: '103.95%',
    farmsEffectiveTickLower: 0,
    farmsEffectiveTickUpper: 0,
    displayFarmsEffectMinPrice: '',
    displayFarmsEffectMaxPrice: '',
    farmsPoolAddress: '',
    tickSpacing: '60',
    index: 3137,
    object: {
      coin_a: 7019812001233,
      coin_b: 6481948428081738,
      tick_spacing: 60,
      fee_rate: 2500,
      liquidity: '7919792326420544',
      current_sqrt_price: '387301868084602258960',
      rewarder_manager: {
        fields: {
          rewarders: [
            {
              fields: {
                reward_coin: { fields: { name: '06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS' } },
                emissions_per_second: '6405119470038038755555555556',
                growth_global: '26676127812826120527'
              }
            },
            {
              fields: {
                reward_coin: { fields: { name: '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI' } },
                emissions_per_second: '626847692134389392877037038',
                growth_global: '5045177556068499952'
              }
            }
          ],
          points_released: '256416604813358187415601152000000',
          points_growth_global: '270015129121818228',
          last_updated_time: 1742298325
        }
      },
      is_pause: false,
      index: 3137
    },
    isUnstableVault: true,
    vaultId: '0x41a4ab1e82f90f5965bbcd828b8ffa13bab7560bd2e352ab067e343db552f527',
    vaultsRewards: [
      '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      'dba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      '06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
    ],
    category: 'haedal',
    vaultsTvl: '--',
    vaultsTvlDisplay: '--',
    vaultsApy: '--',
    vaultsApyDisplay: '--',
    vaultsTotalApy: '--',
    vaultsTotalApyDisplay: '--',
    vaultsLstApy: '--',
    vaultsLstApyDisplay: '--',
    vaultsApr: '--',
    vaultsAprDisplay: '--',
    vaultsId: '0x41a4ab1e82f90f5965bbcd828b8ffa13bab7560bd2e352ab067e343db552f527',
    clmmPoolAddress: '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105',
    amountPerLpA: '0',
    amountPerLpB: '0',
    hardCapUSD: '0',
    depositRatioDisplay: '--',
    depositRatio: null
  },
  {
    poolAddress: '0xe01243f37f712ef87e556afb9b1d03d0fae13f96d324ec912daffc339dfdcbd2',
    name: 'DEEP - SUI',
    isReverse: false,
    tokenA: {
      name: 'DeepBook Token',
      symbol: 'DEEP',
      decimals: 6,
      address: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
      balance: '38148087.736923',
      logo_url: 'https://gateway.irys.xyz/5LqWyWG5EU9wPknvW5rY6qSQPtnNAfP27X1PnAiesyFG',
      coingecko_id: 'deep',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'
    },
    tokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '768472.179325603',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    displayTokenA: {
      name: 'DeepBook Token',
      symbol: 'DEEP',
      decimals: 6,
      address: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
      balance: '38148087.736923',
      logo_url: 'https://gateway.irys.xyz/5LqWyWG5EU9wPknvW5rY6qSQPtnNAfP27X1PnAiesyFG',
      coingecko_id: 'deep',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'
    },
    displayTokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '768472.179325603',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    haveMining: true,
    miningRewardList: [
      { coinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', emissionsEveryDay: '1165000000000' },
      { coinType: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP', emissionsEveryDay: '127192000000' }
    ],
    miningAprList: [
      {
        coinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
        apr: '0.1993884036768800515130263443019041050862350874457143530980956206',
        aprDisplay: '19.93%'
      },
      {
        coinType: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
        apr: '0.7784493692315403527120642020519074423562040785734131037470931738',
        aprDisplay: '77.84%'
      }
    ],
    haveFarming: false,
    farmsRewarderList: [],
    farmsApr: '0',
    farmingAprDisplay: '',
    feeApr: '0.8393072486102057420293966869313929233028266682099922267918123755',
    feeAprDisplay: '83.93%',
    miningAprTotal: '0.9778377729084204042250905463538115474424391660191274568451887944',
    feeAndMiningAprDisplay: '181.71%',
    totalAprDisplay: '181.71%',
    fee: '0.0025',
    feeRate: '25',
    feeDisplay: '0.25%',
    tvlDisplay: '$4,837,157.78',
    tvl: '4837157.781696',
    volume24Display: '$4,467,927.46',
    fees24Display: '$11,169.81',
    isVaults: false,
    farmsStatedTvl: '',
    farmsStatedTvlDisplay: '',
    feeAndFarmsApr: '1.817145021518626146254487233285204470745265834229119683637001169',
    feeAndFarmsAprDisplay: '83.93%',
    farmsEffectiveTickLower: 0,
    farmsEffectiveTickUpper: 0,
    displayFarmsEffectMinPrice: '',
    displayFarmsEffectMaxPrice: '',
    farmsPoolAddress: '',
    tickSpacing: '60',
    index: 5056,
    object: {
      coin_a: 38251906126071,
      coin_b: 772407575970606,
      tick_spacing: 60,
      fee_rate: 2500,
      liquidity: '8295811276552121',
      current_sqrt_price: '110310797447865996218',
      rewarder_manager: {
        fields: {
          rewarders: [
            {
              fields: {
                reward_coin: { fields: { name: '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI' } },
                emissions_per_second: '248732139419810505007407408',
                growth_global: '1792995150775002027'
              }
            },
            {
              fields: {
                reward_coin: { fields: { name: 'deeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP' } },
                emissions_per_second: '27155998521102607513220741',
                growth_global: '449363617848666723'
              }
            }
          ],
          points_released: '247161190782047378116444160000000',
          points_growth_global: '95762577535111090',
          last_updated_time: 1742298343
        }
      },
      is_pause: false,
      index: 5056
    },
    isUnstableVault: true,
    vaultId: '0xed754b6a3a6c7549c3d734cb7b464bccf9c805814b9e47b0cb99f43b4efcb4a6',
    vaultsRewards: [
      'deeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
      '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
    ],
    category: 'haedal',
    vaultsTvl: '--',
    vaultsTvlDisplay: '--',
    vaultsApy: '--',
    vaultsApyDisplay: '--',
    vaultsTotalApy: '--',
    vaultsTotalApyDisplay: '--',
    vaultsLstApy: '-',
    vaultsLstApyDisplay: '--',
    vaultsApr: '--',
    vaultsAprDisplay: '--',
    vaultsId: '0xed754b6a3a6c7549c3d734cb7b464bccf9c805814b9e47b0cb99f43b4efcb4a6',
    clmmPoolAddress: '0xe01243f37f712ef87e556afb9b1d03d0fae13f96d324ec912daffc339dfdcbd2',
    amountPerLpA: '0',
    amountPerLpB: '0',
    hardCapUSD: '0',
    depositRatioDisplay: '--',
    depositRatio: null
  },
  {
    poolAddress: '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded',
    name: 'CETUS - SUI',
    isReverse: false,
    tokenA: {
      name: 'CETUS Token',
      symbol: 'CETUS',
      decimals: 9,
      address: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
      balance: '18358179.80898744',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/cetus.png',
      coingecko_id: 'cetus-protocol',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
    },
    tokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '690115.203159796',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    displayTokenA: {
      name: 'CETUS Token',
      symbol: 'CETUS',
      decimals: 9,
      address: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
      balance: '18358179.80898744',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/cetus.png',
      coingecko_id: 'cetus-protocol',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
    },
    displayTokenB: {
      name: 'SUI Token',
      symbol: 'SUI',
      decimals: 9,
      address: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      balance: '690115.203159796',
      logo_url: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      coingecko_id: 'sui',
      project_url: '',
      labels: [],
      is_verified: true,
      coin_type: '0x2::sui::SUI'
    },
    haveMining: true,
    miningRewardList: [
      { coinType: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS', emissionsEveryDay: '30000000000000' }
    ],
    miningAprList: [
      {
        coinType: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
        apr: '0.3210654055390594303577545548609292263307138720994575650218205418',
        aprDisplay: '32.1%'
      }
    ],
    haveFarming: false,
    farmsRewarderList: [],
    farmsApr: '0',
    farmingAprDisplay: '',
    feeApr: '0.590449737261882520842413517032433640716917602858166433470039506',
    feeAprDisplay: '59.04%',
    miningAprTotal: '0.3210654055390594303577545548609292263307138720994575650218205418',
    feeAndMiningAprDisplay: '91.15%',
    totalAprDisplay: '91.15%',
    fee: '0.0025',
    feeRate: '25',
    feeDisplay: '0.25%',
    tvlDisplay: '$3,390,129.27',
    tvl: '3390129.276803',
    volume24Display: '$2,082,915.62',
    fees24Display: '$5,207.28',
    isVaults: false,
    farmsStatedTvl: '',
    farmsStatedTvlDisplay: '',
    feeAndFarmsApr: '0.9115151428009419512001680718933628670476314749576239984918600478',
    feeAndFarmsAprDisplay: '59.04%',
    farmsEffectiveTickLower: 0,
    farmsEffectiveTickUpper: 0,
    displayFarmsEffectMinPrice: '',
    displayFarmsEffectMaxPrice: '',
    farmsPoolAddress: '',
    tickSpacing: '60',
    index: 17,
    object: {
      coin_a: 18373571333894680,
      coin_b: 690940315126143,
      tick_spacing: 60,
      fee_rate: 2500,
      liquidity: '263293665799460652',
      current_sqrt_price: '3861763937780779107',
      rewarder_manager: {
        fields: {
          rewarders: [
            {
              fields: {
                reward_coin: { fields: { name: '06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS' } },
                emissions_per_second: '6405119470038038755555555556',
                growth_global: '15090167137337694524'
              }
            },
            {
              fields: {
                reward_coin: { fields: { name: '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI' } },
                emissions_per_second: '0',
                growth_global: '111871157481137955'
              }
            }
          ],
          points_released: '1080698092786440464840523776000000',
          points_growth_global: '59477561914930359',
          last_updated_time: 1742298373
        }
      },
      is_pause: false,
      index: 17
    },
    isUnstableVault: true,
    vaultId: '0xbbd2d4850e4f238d39c3aa24957d2dfbb5787fa43d6c7de306bf15abe27f29f2',
    vaultsRewards: [
      '06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
      '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
    ],
    category: 'haedal',
    vaultsTvl: '--',
    vaultsTvlDisplay: '--',
    vaultsApy: '--',
    vaultsApyDisplay: '--',
    vaultsTotalApy: '--',
    vaultsTotalApyDisplay: '--',
    vaultsLstApy: '--',
    vaultsLstApyDisplay: '--',
    vaultsApr: '--',
    vaultsAprDisplay: '--',
    vaultsId: '0xbbd2d4850e4f238d39c3aa24957d2dfbb5787fa43d6c7de306bf15abe27f29f2',
    clmmPoolAddress: '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded',
    amountPerLpA: '0',
    amountPerLpB: '0',
    hardCapUSD: '0',
    depositRatioDisplay: '--',
    depositRatio: null
  }
]
