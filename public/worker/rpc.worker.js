importScripts('https://unpkg.com/comlink/dist/umd/comlink.js');

async function getLatestCheckpointSequenceNumber(url) {
  // const startTime = Date.now()
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'sui_getLatestCheckpointSequenceNumber',
      'params': []
    })
  })
  // const data = await response.json()
  // const endTime = Date.now()
  // const responseTime = endTime - startTime

  // return responseTime
}

const rpcApi = {
  

  async rpcSpeedTest(rpcList) {
    try {
      const results = {}

      const promises = rpcList.map((item) => {
        const startTime = Date.now()
        return getLatestCheckpointSequenceNumber(item.link).then((res) => {
          // console.log('🚀🚀🚀 ~ file: rpc.worker.js:34 ~ returngetLatestCheckpointSequenceNumber ~ res:', res)
          if(res.status == 403){
            results[item.name] = 0
          }else{
            const endTime = Date.now()
            results[item.name] = endTime - startTime
          }
        })
          .catch((error) => {
            results[item.name] = 0
          })
      })

      await Promise.allSettled(promises)
      return results

    } catch (err) {
      console.log('rpcSpeedTest###setRpcTimedelay###err###', err)
    }
  }
}

Comlink.expose(rpcApi)