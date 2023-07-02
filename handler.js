export const handleHostname = (request, allowedHostnames) => {
  // 403 forbidden thrown if hostname is not on allow-list
  const url = new URL(request.url);
  
  if (!allowedHostnames.includes(url.hostname)) {
    return new Response('Unauthorized', { status: 403 });
  }
  
  return null;
};
