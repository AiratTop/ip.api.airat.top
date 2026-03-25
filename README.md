# ip.api.airat.top

![ip](https://repository-images.githubusercontent.com/1188076325/e824e73a-396f-4e6b-9a34-d34b5ded6362)

Simple Cloudflare Worker API that returns your public IP address in multiple formats.

Live endpoints:
- https://ip.api.airat.top
- https://ip.airat.top (alias)

## API

### `GET /`

Default endpoint. Returns IP and request metadata as JSON.

```bash
curl 'https://ip.api.airat.top/'
```

Example response:

```json
{
  "ip": "203.0.113.10",
  "network": {
    "asn": 13335,
    "asOrganization": "Cloudflare, Inc.",
    "colo": "SJC"
  },
  "location": {
    "city": "San Jose",
    "region": "California",
    "regionCode": "CA",
    "postalCode": "95141",
    "country": "US",
    "continent": "NA",
    "latitude": 37.3417,
    "longitude": -121.9753,
    "timezone": "America/Los_Angeles"
  },
  "connection": {
    "httpProtocol": "HTTP/2",
    "tlsVersion": "TLSv1.3",
    "tlsCipher": "AEAD-AES128-GCM-SHA256",
    "clientTcpRtt": 12
  },
  "request": {
    "method": "GET",
    "userAgent": "curl/8.8.0",
    "acceptLanguage": "en-US"
  },
  "service": "ip.api.airat.top",
  "generatedAt": "2026-03-21T15:00:00.000Z"
}
```
Test in browser: https://ip.api.airat.top

### `GET /json`

JSON alias for `/` (same payload).

```bash
curl 'https://ip.api.airat.top/json'
```
Test in browser: https://ip.api.airat.top/json

### `GET /text`

Returns only the IP address as plain text.

```bash
curl 'https://ip.api.airat.top/text'
```

Response:

```text
203.0.113.10
```
Test in browser: https://ip.api.airat.top/text


### `GET /yaml`

Returns the same payload as YAML.

```bash
curl 'https://ip.api.airat.top/yaml'
```
Test in browser: https://ip.api.airat.top/yaml

### `GET /xml`

Returns the same payload as XML.

```bash
curl 'https://ip.api.airat.top/xml'
```
Test in browser: https://ip.api.airat.top/xml

### `GET /health`

Health check endpoint.

```bash
curl 'https://ip.api.airat.top/health'
```

Response:

```json
{
  "status": "ok"
}
```
Test in browser: https://ip.api.airat.top/health

### CORS

CORS is enabled for all origins (`*`).

## Privacy

No analytics or request logs are collected by this project.

## Project structure

- `worker.js` - Cloudflare Worker script.
- `wrangler.toml` - Wrangler configuration.

## Deployment

Deploy with Wrangler:

```bash
npx wrangler deploy
```

If you use Cloudflare Workers Builds (GitHub integration), keep root directory as `/` and deploy command as `npx wrangler deploy`.

For custom domain binding, configure it in **Workers & Pages -> Domains & Routes**.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE).

---

## Author

**AiratTop**

- Website: [airat.top](https://airat.top)
- GitHub: [@AiratTop](https://github.com/AiratTop)
- Email: [mail@airat.top](mailto:mail@airat.top)
- Repository: [ip.api.airat.top](https://github.com/AiratTop/ip.api.airat.top)
