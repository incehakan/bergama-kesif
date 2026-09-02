import { Platform } from 'react-native'

/**
 * Expo SDK 54 Android: native fetch can fail with "Network request failed".
 * XMLHttpRequest uses a different stack and works for HTTP cleartext APIs.
 */
if (Platform.OS === 'android' && typeof global !== 'undefined') {
  const xhrFetch = (input, init = {}) =>
    new Promise((resolve, reject) => {
      const url = typeof input === 'string' ? input : input?.url
      const method = (init.method || 'GET').toUpperCase()
      const xhr = new XMLHttpRequest()
      xhr.open(method, url, true)

      const headers = init.headers || {}
      if (headers instanceof Headers) {
        headers.forEach((value, key) => xhr.setRequestHeader(key, value))
      } else if (Array.isArray(headers)) {
        headers.forEach(([key, value]) => xhr.setRequestHeader(key, value))
      } else {
        Object.entries(headers).forEach(([key, value]) => {
          if (value != null) xhr.setRequestHeader(key, String(value))
        })
      }

      xhr.onload = () => {
        const responseHeaders = new Headers()
        const raw = xhr.getAllResponseHeaders() || ''
        raw
          .trim()
          .split(/[\r\n]+/)
          .forEach((line) => {
            const i = line.indexOf(':')
            if (i > 0) {
              responseHeaders.append(line.slice(0, i).trim(), line.slice(i + 1).trim())
            }
          })

        resolve(
          new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: responseHeaders,
          })
        )
      }
      xhr.onerror = () => reject(new TypeError('Network request failed'))
      xhr.ontimeout = () => reject(new TypeError('Network request failed'))
      xhr.send(init.body ?? null)
    })

  global.fetch = xhrFetch
}
