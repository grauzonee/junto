# Request Handler Guidance

When modifying a request handler, also update the matching OpenAPI contract in
`app/src/openapi/contracts.ts`.

After changing the contract, regenerate the published OpenAPI artifact:

```bash
cd app
npm run openapi
```
