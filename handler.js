export const handleSource = (request, allowList) => {
  const url = new URL(request.url);
  const source = url.hostname;
  
  // Check if the hostname is an IP address
  // const ipRegex = /^([0-9]{1,3}\.){3}([0-9]{1,3})$/;
  // const isIP = ipRegex.test(source);

  // Check if the hostname or IP is in the allowlist
  if (!allowList.includes(source)) {
    return new Response('Unauthorized', { status: 403 });
  }

  return null;
};
