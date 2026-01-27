self.onmessage = function (e) {
  const { url, interval } = e.data

  const fetchData = async () => {
    try {
      console.log('🚀 ~ file: tokenlist.ts:9 ~ fetchData ~ url:', url)
      const response = await fetch(url)

      console.log('🚀 ~ file: tokenlist.ts:9 ~ fetchData ~ response:', response)
      const data = await response.json()
      console.log('🚀 ~ file: tokenlist.js:11 ~ fetchData ~ data:', data)
      self.postMessage(data)
    } catch (error) {
      console.error('Error fetching data:', error)
      self.postMessage({ error: 'Failed to fetch data' })
    }
  }

  const poll = () => {
    fetchData()
    setTimeout(poll, interval)
  }

  poll()
}
