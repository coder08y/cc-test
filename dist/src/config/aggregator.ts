import { AggregatorDex, AggregatorProvider } from '@/types/swap'

export const AggregatorSourceImg: Omit<
  Record<AggregatorProvider, string>,
  AggregatorProvider.HAWAL | AggregatorProvider.CETUSDLMM | AggregatorProvider.FERRADLMM
> &
  Partial<Pick<Record<AggregatorProvider, string>, AggregatorProvider.HAWAL | AggregatorProvider.CETUSDLMM | AggregatorProvider.FERRADLMM>> = {
  CETUS: '/images/aggregator-source/cetus.png',
  // DEEPBOOK: '/images/aggregator-source/deepbook.png',
  KRIYA: '/images/aggregator-source/kriya.png',
  FLOWX: '/images/aggregator-source/flowx.png',
  AFTERMATH: '/images/aggregator-source/aftermath.png',
  METASTABLE: '/images/aggregator-source/metastable.png',
  TURBOS: '/images/aggregator-source/turbos.png',
  HAEDAL: '/images/aggregator-source/haedal.png',
  VOLO: '/images/aggregator-source/volo.png',
  AFSUI: '/images/aggregator-source/aftermath.png',
  BLUEMOVE: '/images/aggregator-source/bluemove.png',
  KRIYAV3: '/images/aggregator-source/kriya.png',
  FLOWXV3: '/images/aggregator-source/flowx.png',
  DEEPBOOKV3: '/images/aggregator-source/deepbook.png',
  SCALLOP: '/images/aggregator-source/scallop.png',
  SPRINGSUI: '/images/aggregator-source/suilend.png',
  BLUEFIN: '/images/aggregator-source/bluefin.png',
  HAEDALPMM: '/images/aggregator-source/haedal.png',
  HAEDALHMMV2: '/images/aggregator-source/haedal.png',
  ALPHAFI: '/images/aggregator-source/stSui.png',
  STEAMM: '/images/aggregator-source/steamm.png',
  STEAMM_OMM_V2: '/images/aggregator-source/steamm.png',
  OBRIC: '/images/aggregator-source/obric.png',
  MOMENTUM: '/images/aggregator-source/momentum.png',
  MAGMA: '/images/aggregator-source/magma.png',
  SEVENK: '/images/aggregator-source/7k.png',
  FULLSAIL: '/images/aggregator-source/fullsail.png',
  FERRACLMM: '/images/aggregator-source/ferra.png'
}

export const AggregatorDexGroup = [
  {
    groupName: 'Cetus',
    items: [AggregatorProvider.CETUS, AggregatorProvider.CETUSDLMM]
  },
  {
    groupName: 'Haedal',
    items: [AggregatorProvider.HAEDAL, AggregatorProvider.HAEDALPMM, AggregatorProvider.HAEDALHMMV2]
  },
  {
    groupName: 'Kriya',
    items: [AggregatorProvider.KRIYA, AggregatorProvider.KRIYAV3]
  },
  {
    groupName: 'FlowX',
    items: [AggregatorProvider.FLOWX, AggregatorProvider.FLOWXV3]
  },
  {
    groupName: 'Steamm',
    items: [AggregatorProvider.STEAMM, AggregatorProvider.STEAMM_OMM_V2]
  },
  {
    groupName: 'Ferra',
    items: [AggregatorProvider.FERRACLMM, AggregatorProvider.FERRADLMM]
  }
]

export const findGroupDex = (provider: AggregatorProvider) => {
  return AggregatorDexGroup.find(group => group.items.includes(provider))
}

export const findDisplayName = (provider: AggregatorProvider) => {
  const group = AggregatorDexGroup.find(group => group.items.includes(provider))
  return group?.groupName ? group.groupName : AggregatorDexMap[provider]?.name
}

export const AggregatorDexMap: Record<string, AggregatorDex> = {
  CETUS: {
    name: 'CLMM',
    groupId: 'CETUS',
    id: AggregatorProvider.CETUS,
    logo: AggregatorSourceImg['CETUS'],
    type: 'dex',
    sort: 101
  },
  CETUSDLMM: {
    name: 'DLMM',
    groupId: 'CETUS',
    id: AggregatorProvider.CETUSDLMM,
    logo: AggregatorSourceImg['CETUS'],
    type: 'dex',
    sort: 100
  },
  // DeepBook: {
  //   name: 'DeepBook',
  //   id: AggregatorProvider.DEEPBOOK,
  //   logo: AggregatorSourceImg['DEEPBOOK'],
  //   type: 'dex',
  //   sort: 99
  // },
  DEEPBOOKV3: {
    name: 'DeepBook V3',
    id: AggregatorProvider.DEEPBOOKV3,
    logo: AggregatorSourceImg[AggregatorProvider.DEEPBOOKV3],
    type: 'dex',
    sort: 99
  },

  KRIYA: {
    name: 'Kriya V2',
    groupId: 'KRIYA',
    id: AggregatorProvider.KRIYA,
    logo: AggregatorSourceImg['KRIYA'],
    type: 'dex',
    sort: 98
  },
  KRIYAV3: {
    name: 'Kriya V3',
    groupId: 'KRIYA',
    id: AggregatorProvider.KRIYAV3,
    logo: AggregatorSourceImg['KRIYA'],
    type: 'dex',
    sort: 97
  },
  FLOWX: {
    name: 'FlowX V2',
    groupId: 'FLOWX',
    id: AggregatorProvider.FLOWX,
    logo: AggregatorSourceImg['FLOWX'],
    type: 'dex',
    sort: 96
  },
  FLOWXV3: {
    name: 'FlowX V3',
    groupId: 'FLOWX',
    id: AggregatorProvider.FLOWXV3,
    logo: AggregatorSourceImg['FLOWX'],
    type: 'dex',
    sort: 95
  },
  AFTERMATH: {
    name: 'Aftermath',
    id: AggregatorProvider.AFTERMATH,
    logo: AggregatorSourceImg['AFTERMATH'],
    type: 'dex',
    sort: 94
  },
  TURBOS: {
    name: 'Turbos',
    id: AggregatorProvider.TURBOS,
    logo: AggregatorSourceImg['TURBOS'],
    type: 'dex',
    sort: 92
  },
  HAEDAL: {
    name: 'Haedal LSD',
    id: AggregatorProvider.HAEDAL,
    groupId: 'HAEDAL',
    logo: AggregatorSourceImg['HAEDAL'],
    type: 'other',
    sort: 91
  },
  HAWAL: {
    name: 'Haedal LSD',
    id: AggregatorProvider.HAWAL,
    groupId: 'HAEDAL',
    logo: AggregatorSourceImg['HAEDAL'],
    type: 'other',
    sort: 90
  },
  HAEDALPMM: {
    name: 'Haedal HMM',
    id: AggregatorProvider.HAEDALPMM,
    groupId: 'HAEDAL',
    logo: AggregatorSourceImg[AggregatorProvider.HAEDALPMM],
    type: 'other',
    sort: 89
  },
  HAEDALHMMV2: {
    name: 'Haedal HMM',
    id: AggregatorProvider.HAEDALHMMV2,
    groupId: 'HAEDAL',
    logo: AggregatorSourceImg[AggregatorProvider.HAEDALHMMV2],
    type: 'other',
    sort: 88
  },
  VOLO: {
    name: 'Volo',
    id: AggregatorProvider.VOLO,
    logo: AggregatorSourceImg['VOLO'],
    type: 'other',
    sort: 80
  },
  AFSUI: {
    name: 'Aftermath LSD',
    id: AggregatorProvider.AFSUI,
    logo: AggregatorSourceImg['AFTERMATH'],
    type: 'other',
    sort: 79
  },
  BLUEMOVE: {
    name: 'BlueMove',
    id: AggregatorProvider.BLUEMOVE,
    logo: AggregatorSourceImg['BLUEMOVE'],
    type: 'dex',
    sort: 78
  },
  BLUEFIN: {
    name: 'Bluefin',
    id: AggregatorProvider.BLUEFIN,
    logo: AggregatorSourceImg['BLUEFIN'],
    sort: 77,
    type: 'dex'
  },
  STEAMM: {
    name: 'STEAMM CPMM',
    groupId: 'STEAMM',
    id: AggregatorProvider.STEAMM,
    logo: AggregatorSourceImg[AggregatorProvider.STEAMM],
    sort: 76,
    type: 'dex'
  },
  STEAMM_OMM_V2: {
    name: 'STEAMM OMM',
    groupId: 'STEAMM',
    id: AggregatorProvider.STEAMM_OMM_V2,
    logo: AggregatorSourceImg[AggregatorProvider.STEAMM_OMM_V2],
    sort: 74,
    type: 'dex'
  },
  METASTABLE: {
    name: 'Metastable',
    id: AggregatorProvider.METASTABLE,
    logo: AggregatorSourceImg[AggregatorProvider.METASTABLE],
    sort: 70,
    type: 'dex'
  },
  OBRIC: {
    name: 'Obric',
    id: AggregatorProvider.OBRIC,
    logo: AggregatorSourceImg[AggregatorProvider.OBRIC],
    sort: 69,
    type: 'dex'
  },
  MOMENTUM: {
    name: 'Momentum',
    id: AggregatorProvider.MOMENTUM,
    logo: AggregatorSourceImg[AggregatorProvider.MOMENTUM],
    sort: 68,
    type: 'dex'
  },
  MAGMA: {
    name: 'Magma',
    id: AggregatorProvider.MAGMA,
    logo: AggregatorSourceImg[AggregatorProvider.MAGMA],
    sort: 67,
    type: 'dex'
  },
  SEVENK: {
    name: '7K Spot',
    id: AggregatorProvider.SEVENK,
    logo: AggregatorSourceImg[AggregatorProvider.SEVENK],
    sort: 66,
    type: 'dex'
  },
  FULLSAIL: {
    name: 'Full Sail',
    id: AggregatorProvider.FULLSAIL,
    logo: AggregatorSourceImg[AggregatorProvider.FULLSAIL],
    sort: 65,
    type: 'dex'
  },
  FERRACLMM: {
    name: 'Ferra CLMM',
    groupId: 'FERRA',
    id: AggregatorProvider.FERRACLMM,
    logo: AggregatorSourceImg[AggregatorProvider.FERRACLMM],
    sort: 64,
    type: 'dex'
  },
  FERRADLMM: {
    name: 'Ferra DLMM',
    groupId: 'FERRA',
    id: AggregatorProvider.FERRADLMM,
    logo: AggregatorSourceImg[AggregatorProvider.FERRACLMM],
    sort: 63,
    type: 'dex'
  },
  SCALLOP: {
    name: 'Scallop',
    id: AggregatorProvider.SCALLOP,
    logo: AggregatorSourceImg['SCALLOP'],
    type: 'other',
    sort: 60
  },
  SPRINGSUI: {
    name: 'SpringSui',
    id: AggregatorProvider.SPRINGSUI,
    logo: AggregatorSourceImg['SPRINGSUI'],
    type: 'other',
    sort: 59
  },
  ALPHAFI: {
    name: 'stSUI',
    id: AggregatorProvider.ALPHAFI,
    logo: AggregatorSourceImg.ALPHAFI,
    type: 'other',
    sort: 50
  }
}
