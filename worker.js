import { endpoints, cacheDurationSeconds, allowedHostnames } from './config.js'
import { handleHostname } from './handler.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, allowedHostnames))
})

async function handleRequest(request, allowedHostnames) {
  const url = new URL(request.url)
  let apiURL = url.searchParams.get('api')

  if (!apiURL || !endpoints.includes(apiURL)) {
    return new Response('Invalid API URL', {status: 403})
  }

  // Handle hostname checking
  const hostnameCheckResponse = handleHostname(request, allowedHostnames);
  if (hostnameCheckResponse) {
    return hostnameCheckResponse;
  }

  const cache = caches.default
  let response = await cache.match(request)

  if (!response) {
    let req = new Request(apiURL, request)
    req.headers.set('Authorization', `Bearer ${process.env[apiURL]}`)

    response = await fetch(req)

    if (response.ok) {
      let responseClone = response.clone()
      responseClone.headers.append('Cache-Control', `public, max-age=${cacheDurationSeconds}`)
      event.waitUntil(cache.put(request, responseClone))
    }
  }

  return response
}
