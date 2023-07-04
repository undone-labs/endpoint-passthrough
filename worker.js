import { allowList, endpoints, cacheDurationSeconds } from './config.js';
import { handleSource } from './handler.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, allowList))
})

async function handleRequest(request, allowList) {
  try {
    const url = new URL(request.url);
    const apiUrl = url.searchParams.get('api');
    

    // Handle hostname or IP checking
    const sourceAllowed = handleSource(request, allowList);
    if (sourceAllowed) {
      return sourceAllowed;
    }

    const endpoint = endpoints.find(e => e.url === apiUrl);

    if (!endpoint) {
      throw new Error('Invalid API URL');
    }

    const cache = caches.default;
    let response = await cache.match(request);

    // Delete the api param so it is omitted from the final request
    url.searchParams.delete('api');

    // Create a proxied request
    let req = new Request(apiUrl + url.search, {
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
