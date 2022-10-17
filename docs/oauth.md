---
title: OAuth integration
nav_order: 9
layout: page
---
 
## Overview

Turnilo can integrate with your OAuth provider. 
Turnilo will:
* Redirect your users to authentication page, 
* Handle authorization code flow with PKCE (Proof Key for Code Exchange )
* Will decorate all data requests with access token. 

## Configuration

To enable OAuth support you need to add top level `oauth` option in your config with following fields:

- `clientId`: OAuth Client Identifier for your Turnilo instance
- `tokenEndpoint`: Full address of your [token endpoint](https://tools.ietf.org/html/rfc6749#section-3.2)
- `authorizationEndpoint`: Full address of your [authorization endpoint](https://tools.ietf.org/html/rfc6749#section-3.1)
- `redirectUri`: Full address of your Turnilo installation. If you go to this address in browser, your Turnilo install should launch and show home view.
- `tokenHeaderName`: Name of your choosing for the OAuth token header. You will be reading this header in your server plugin.

Example:

```yaml
oauth:
  clientId: "turnilo"
  tokenEndpoint: "https://oauth.example.com/auth/oauth/token"
  authorizationEndpoint: "https://oauth.example.com/auth/oauth/authorize"
  tokenHeaderName: "x-turnilo-oauth-token"
  redirectUri: "https://turnilo.example.com/"
```

## Further reading

Please refer to our [GitHub discussion](https://github.com/allegro/turnilo/discussions/734) for our use case. 
