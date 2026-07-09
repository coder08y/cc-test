const LOG_PREFIX = '[RpcWorker]'
const GRPC_GET_SERVICE_INFO_PATH = '/sui.rpc.v2.LedgerService/GetServiceInfo'
const GRPC_EMPTY_REQUEST_BODY = new Uint8Array([0, 0, 0, 0, 0])
const RPC_CHECKPOINT_THRESHOLD = 3

function normalizeBaseUrl(url) {
  return url.replace(/\/$/, '')
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function bytesToHex(bytes) {
  return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

function bytesToBase64(bytes) {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function parseGrpcWebFrames(bodyBytes) {
  const frames = []
  let offset = 0

  while (offset + 5 <= bodyBytes.length) {
    const flag = bodyBytes[offset]
    const length = ((bodyBytes[offset + 1] << 24) | (bodyBytes[offset + 2] << 16) | (bodyBytes[offset + 3] << 8) | bodyBytes[offset + 4]) >>> 0
    const frameStart = offset + 5
    const frameEnd = frameStart + length
    const frameBytes = bodyBytes.slice(frameStart, frameEnd)
    const isTrailerFrame = (flag & 0x80) === 0x80

    frames.push({
      flag,
      type: isTrailerFrame ? 'trailers' : 'data',
      length,
      text: isTrailerFrame ? new TextDecoder().decode(new Uint8Array(frameBytes)) : undefined,
      hex: bytesToHex(frameBytes),
      base64: bytesToBase64(frameBytes)
    })

    offset = frameEnd
  }

  return frames
}

function getCheckpointHeight(res) {
  const checkpointHeight = Number(res.headers.get('x-sui-checkpoint-height') || 0)
  return Number.isFinite(checkpointHeight) ? checkpointHeight : 0
}

async function readResponseContent(res) {
  const bodyBuffer = await res.clone().arrayBuffer()
  const bodyBytes = Array.from(new Uint8Array(bodyBuffer))

  return {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    bodyText: new TextDecoder().decode(bodyBuffer),
    bodyBytes,
    bodyHex: bytesToHex(bodyBytes),
    bodyBase64: bytesToBase64(bodyBytes),
    grpcWebFrames: parseGrpcWebFrames(bodyBytes)
  }
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

function shouldReturnDetails(data) {
  return data?.includeDetails === true
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
  const rpcStatus = {}

  await Promise.all(
    rpcList.map(async rpc => {
      const startTime = Date.now()
      const endpoint = `${normalizeBaseUrl(rpc)}${GRPC_GET_SERVICE_INFO_PATH}`

      try {
        const res = await pingGrpc(rpc)
        const responseContent = await readResponseContent(res)
        console.log(`${LOG_PREFIX} ping response`, { rpc, endpoint, responseContent })

        if (isSuccessResponse(res)) {
          const latency = Date.now() - startTime
          const checkpointHeight = getCheckpointHeight(res)
          results[rpc] = latency
          rpcStatus[rpc] = {
            latency,
            checkpointHeight,
            healthy: true,
            lastCheckedAt: Date.now()
          }
          console.log(`${LOG_PREFIX} ping ok`, { rpc, endpoint, latency, checkpointHeight, status: res.status })
          return
        }

        results[rpc] = 0
        rpcStatus[rpc] = {
          latency: 0,
          checkpointHeight: 0,
          healthy: false,
          lastCheckedAt: Date.now()
        }
        console.warn(`${LOG_PREFIX} ping unhealthy`, {
          rpc,
          endpoint,
          status: res.status,
          ok: res.ok
        })
      } catch (error) {
        results[rpc] = 0
        rpcStatus[rpc] = {
          latency: 0,
          checkpointHeight: 0,
          healthy: false,
          lastCheckedAt: Date.now()
        }
        console.error(`${LOG_PREFIX} ping failed`, {
          rpc,
          endpoint,
          error: formatError(error)
        })
      }
    })
  )
  console.log('🚀🚀🚀 ~ rpc.worker.js:169 ~ measureRpcLatency ~ rpcStatus:', rpcStatus)

  return {
    results,
    rpcStatus,
    allFailed: !Object.values(rpcStatus).some(status => status?.healthy && status?.latency > 0)
  }
}

function pickDefaultRpc(rpcStatus, rpcList) {
  const healthyItems = rpcList
    .map(rpc => ({ rpc, status: rpcStatus[rpc] }))
    .filter(({ status }) => status && (status.healthy ?? status.latency > 0) && status.latency > 0)

  if (healthyItems.length === 0) {
    return rpcList[0] || ''
  }

  const maxCheckpointHeight = Math.max(...healthyItems.map(({ status }) => status.checkpointHeight || 0))
  const candidates = healthyItems
    .filter(({ status }) => maxCheckpointHeight - (status.checkpointHeight || 0) <= RPC_CHECKPOINT_THRESHOLD)
    .sort((a, b) => a.status.latency - b.status.latency)

  return candidates[0]?.rpc || rpcList[0] || ''
}

self.onmessage = async function (e) {
  const rpcList = parseRpcList(e.data)
  const selectFastest = shouldSelectFastest(e.data)
  const includeDetails = shouldReturnDetails(e.data)

  if (!rpcList?.length) {
    console.warn(`${LOG_PREFIX} empty rpc list`, { selectFastest, includeDetails })
    self.postMessage(selectFastest ? (includeDetails ? { defaultRpc: '', results: {}, rpcStatus: {}, allFailed: true } : '') : {})
    return
  }

  console.log(`${LOG_PREFIX} start`, {
    mode: selectFastest ? 'selectFastest' : 'measure',
    count: rpcList.length,
    rpcList
  })

  try {
    const { results, rpcStatus, allFailed } = await measureRpcLatency(rpcList)
    const defaultRpc = pickDefaultRpc(rpcStatus, rpcList)
    const output = selectFastest ? (includeDetails ? { defaultRpc, results, rpcStatus, allFailed } : defaultRpc) : results

    console.log(`${LOG_PREFIX} done`, {
      mode: selectFastest ? 'selectFastest' : 'measure',
      output,
      results,
      rpcStatus,
      allFailed
    })

    self.postMessage(output)
  } catch (error) {
    console.error(`${LOG_PREFIX} measure failed`, {
      error: formatError(error),
      selectFastest,
      includeDetails,
      rpcList
    })
    self.postMessage(
      selectFastest ? (includeDetails ? { defaultRpc: rpcList[0] || '', results: {}, rpcStatus: {}, allFailed: true } : rpcList[0] || '') : {}
    )
  }
}
