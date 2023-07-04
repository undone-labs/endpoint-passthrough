export const endpoints = [
  {
    url: 'https://foo.com/api/endpoint',
    key: 'API_KEY_NAME_FOO'
  },
  {
    url: 'https://bar.com/api/endpoint',
    key: 'API_KEY_NAME_BAR'
  },
  // Add more endpoint objects as needed
];

export const allowList = [
  'app.baz.com',
  'qux.com',
  '192.168.2.1',
  // Add more allow-listed hostnames or IPs as needed
];

export const cacheDurationSeconds = 30
