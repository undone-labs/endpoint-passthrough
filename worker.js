import { endpoints, cacheDurationSeconds } from './config.js'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let apiURL = url.searchParams.get('api')

  if (!apiURL || !endpoints.includes(apiURL)) {
    return new Response('Invalid API URL', {status: 403})
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
