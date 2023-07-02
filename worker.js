import { endpoints, cacheDurationSeconds, allowedHostnames } from './config.js'
import { handleHostname } from './handler.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, allowedHostnames))
})

async function handleRequest(request, allowedHostnames) {
  try {
    const url = new URL(request.url);
    const apiURL = url.searchParams.get('api');

    // Handle hostname checking
    const hostnameCheckResponse = handleHostname(request, allowedHostnames);
    if (hostnameCheckResponse) {
      return hostnameCheckResponse;
    }

    const endpoint = endpoints.find(e => e.url === apiURL);

    if (!endpoint) {
      throw new Error('Invalid API URL');
    }

    const cache = caches.default;
    let response = await cache.match(request);

    if (!response) {
      let req = new Request(apiURL, request);
      req.headers.set('Authorization', `Bearer ${process.env[endpoint.key]}`);

      response = await fetch(req);

      if (!response.ok) {
        throw new Error(`Failed to fetch from API: ${response.statusText}`);
      }

      let responseClone = response.clone();
      responseClone.headers.append('Cache-Control', `public, max-age=${cacheDurationSeconds}`);
      event.waitUntil(cache.put(request, responseClone));
    }

    return response;
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
