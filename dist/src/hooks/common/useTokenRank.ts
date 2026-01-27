import { Token } from '@cetus/types'

export default function useTokenRank() {
  const getTokenRank = (sellCoin: Token, buyCoin: Token) => {
    console.log(sellCoin, buyCoin, 'useTokenRank')
    const sellRank = Number(sellCoin?.extensions?.rank) || Number(sellCoin?.rank) || 0
    const buyRank = Number(buyCoin?.extensions?.rank) || Number(buyCoin?.rank) || 0
    if (sellRank > buyRank) {
      return false
    } else if (sellRank < buyRank) {
      return true
    } else {
      return false
    }
  }
  return {
    getTokenRank
  }
}
