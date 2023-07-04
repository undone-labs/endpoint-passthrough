import { endpoints, cacheDurationSeconds, allowedHostnames } from './config.js'
import { handleHostname } from './handler.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, allowedHostnames))
})

async function handleRequest(request, allowedHostnames) {
  try {
    let originalUrl = new URL(request.url);
    let apiUrl = originalUrl.searchParams.get('api');
    originalUrl.searchParams.delete('api');

    // Handle hostname checking
    const hostnameCheckResponse = handleHostname(request, allowedHostnames);
    if (hostnameCheckResponse) {
      return hostnameCheckResponse;
    }

    const endpoint = endpoints.find(e => e.url === apiUrl);

    if (!endpoint) {
      throw new Error('Invalid API URL');
    }

    const cache = caches.default;
    let response = await cache.match(request);

    // Create the proxied request
    let req = new Request(apiUrl + originalUrl.search, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    req.headers.set('Authorization', `Bearer ${process.env[endpoint.key]}`);

    if (request.method === 'GET' && !response) {
      response = await fetch(req);

      if (!response.ok) {
        throw new Error(`Failed to fetch from API: ${response.statusText}`);
      }

      let responseClone = response.clone();
      responseClone.headers.append('Cache-Control', `public, max-age=${cacheDurationSeconds}`);

      // Cache the response without waiting for it to complete
      cache.put(request, responseClone).catch(e => {
        console.error('Failed to cache response:', e);
      });
    } else {
      response = await fetch(req);

      if (!response.ok) {
        throw new Error(`Failed to fetch from API: ${response.statusText}`);
      }
    }

    return response;
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
