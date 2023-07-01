# Endpoint Pass-through

A serverless API endpoint proxy pass-through, currently designed to work specifically with Cloudflare Workers.

The objective of this project is to provide a small and lightweight package that can securely proxy connections from specific hostnames, allowing frontend apps to call APIs of various services without exposing secret keys.

### Usage

- Create a Cloudflare Workers account
- Create and include a key and add it to the `wrangler.toml` config file in the `account_id` variable
- Add some custom endpoints in `config.js`
- Build with `npm run build`
- Start locally with `npm run start`
- Deploy to a worker instance with `npm run ship`

### Features

- API pass through for any number of endpoints
- `GET` and `POST` compatibility
- Param preservation, parameters are not stripped and are passed to the target endpoint request
- Caching, a 30 second cache is included by default and uses Cloudflare's native cache API
