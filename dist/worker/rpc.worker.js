const LOG_PREFIX = '[RpcWorker]'
const GRPC_GET_SERVICE_INFO_PATH = '/sui.rpc.v2.LedgerService/GetServiceInfo'
const GRPC_EMPTY_REQUEST_BODY = new Uint8Array([0, 0, 0, 0, 0])

function normalizeBaseUrl(url) {
  return url.replace(/\/$/, '')
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function parseRpcList(data) {
  if (Array.isArray(data)) {
    return data
  }
  return data?.rpcList
}

function shouldSelectFastest(data) {
  return Array.isArray(data) || data?.selectFastest === true
}

async function pingGrpc(baseUrl) {
  const endpoint = `${normalizeBaseUrl(baseUrl)}${GRPC_GET_SERVICE_INFO_PATH}`
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/grpc-web+proto',
      'X-Grpc-Web': '1'
    },
    body: GRPC_EMPTY_REQUEST_BODY
  })
}

function isSuccessResponse(res) {
  return res.ok && res.status !== 403
}

async function measureRpcLatency(rpcList) {
  const results = {}

  await Promise.all(
    rpcList.map(async rpc => {
      const startTime = Date.now()
      const endpoint = `${normalizeBaseUrl(rpc)}${GRPC_GET_SERVICE_INFO_PATH}`

      try {
        const res = await pingGrpc(rpc)

        if (isSuccessResponse(res)) {
          const latency = Date.now() - startTime
          results[rpc] = latency
          console.log(`${LOG_PREFIX} ping ok`, { rpc, endpoint, latency, status: res.status })
          return
        }

        results[rpc] = 0
        console.warn(`${LOG_PREFIX} ping unhealthy`, {
          rpc,
          endpoint,
          status: res.status,
          ok: res.ok
        })
      } catch (error) {
        results[rpc] = 0
        console.error(`${LOG_PREFIX} ping failed`, {
          rpc,
          endpoint,
          error: formatError(error)
        })
      }
    })
  )

  return results
}

function pickFastestRpc(results, rpcList) {
  let fastest = ''
  let minLatency = Infinity

  for (const rpc of rpcList) {
    const latency = results[rpc] || 0
    if (latency > 0 && latency < minLatency) {
      minLatency = latency
      fastest = rpc
    }
  }

  return fastest || rpcList[0] || ''
}

self.onmessage = async function (e) {
  const rpcList = parseRpcList(e.data)
  const selectFastest = shouldSelectFastest(e.data)

  if (!rpcList?.length) {
    console.warn(`${LOG_PREFIX} empty rpc list`, { selectFastest })
    self.postMessage(selectFastest ? '' : {})
    return
  }

  console.log(`${LOG_PREFIX} start`, {
    mode: selectFastest ? 'selectFastest' : 'measure',
    count: rpcList.length,
    rpcList
  })

  try {
    const results = await measureRpcLatency(rpcList)
    const output = selectFastest ? pickFastestRpc(results, rpcList) : results

    console.log(`${LOG_PREFIX} done`, {
      mode: selectFastest ? 'selectFastest' : 'measure',
      output,
      results
    })

    self.postMessage(output)
  } catch (error) {
    console.error(`${LOG_PREFIX} measure failed`, {
      error: formatError(error),
      selectFastest,
      rpcList
    })
    self.postMessage(selectFastest ? rpcList[0] || '' : {})
  }
}
