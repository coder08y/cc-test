importScripts('https://unpkg.com/comlink/dist/umd/comlink.js')

async function getLatestCheckpointSequenceNumber(url) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getLatestCheckpointSequenceNumber',
      params: []
    })
  })
}

const rpcApi = {
  async rpcSpeedTest(rpcList) {
    try {
      const results = {}

      const promises = rpcList.map(item => {
        const startTime = Date.now()
        return getLatestCheckpointSequenceNumber(item.link)
          .then(res => {
            if (res.status === 403) {
              results[item.name] = 0
            } else {
              results[item.name] = Date.now() - startTime
            }
          })
          .catch(() => {
            results[item.name] = 0
          })
      })

      await Promise.allSettled(promises)
      return results
    } catch (err) {
      console.log('rpcSpeedTest###err###', err)
      return {}
    }
  }
}

Comlink.expose(rpcApi)
