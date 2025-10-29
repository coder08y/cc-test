async function getLatestCheckpointSequenceNumber(url) {
  // const startTime = Date.now()
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
  // const data = await response.json()
  // const endTime = Date.now()
  // const responseTime = endTime - startTime

  // return responseTime
}

self.onmessage = async function (e) {
  const { rpcList } = e.data
  try {
    const results = {}

    const promises = rpcList.map(rpc => {
      const startTime = Date.now()
      return getLatestCheckpointSequenceNumber(rpc)
        .then(res => {
          //    console.log('🚀🚀🚀 ~ file: useRpcWorker.js:34 ~ returngetLatestCheckpointSequenceNumber ~ res:', res)
          if (res.status == 403) {
            results[rpc] = 0
          } else {
            const endTime = Date.now()
            results[rpc] = endTime - startTime
          }
        })
        .catch(error => {
          console.log('🚀🚀🚀 ~ file: useRpcWorker.js:40 ~ error ~ error:', rpc, error)
          results[rpc] = 0
        })
    })

    await Promise.allSettled(promises)
    self.postMessage(results)
  } catch (err) {
    console.log('🚀🚀🚀 ~ file: useRpcWorker.js:50 ~  ~ err:', err)
    self.postMessage({})
  }
}
