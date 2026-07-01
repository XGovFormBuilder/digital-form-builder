# Microsoft Authentication Layer (MSAL) APIM Authentication Support

The `MsalAuthorizer` service supports MSAL authentication to communicate securely with APIM-hosted API services.

## Setup

To use MSAL Authentication you will need to configure the following environment variables:

| Variable name   | Definition                                     | Example                            |
| --------------- | ---------------------------------------------- | ---------------------------------- |
| `APIM_BASE_URL` | The base URL of the APIM hosted service        | `https://apim.example.com`         |
| `TENANT_ID`     | Azure AD tenant ID for MSAL authentication     | `tenant-id`                        |
| `CLIENT_ID`     | Azure AD client ID for MSAL authentication     | `client-id`                        |
| `CLIENT_SECRET` | Azure AD client secret for MSAL authentication | `client-secret`                    |
| `SCOPES`        | MSAL scopes required to access the service     | `["https://example.com/.default"]` |

## Multi-tenant support

Multi-tenancy is supported for each form IoC registration. Each form registers its own APIM hosted service dependencies with their respective `MsalAuthorizerConfig`, which includes its own MSAL credentials. Through this approach there is no shared state between forms or service instances on a form, so forms on the same deployed server can authenticate against different tenants independently.

## Token lifecycle

Authentication is handled by `MsalAuthorizer`, which uses the MSAL package's `acquireTokenByClientCredential`. MSAL caches tokens internally and reuses them until expiry (or at least near expiry), so there is no network call to the identity provider on every invocation. Token refresh is also handled automatically by MSAL, so no additional retry or refresh logic is needed.
