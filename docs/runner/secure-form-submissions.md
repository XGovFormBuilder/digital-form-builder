# Secure Form Submissions

This feature allows the user to achieve secure form submissions through the addition of security headers

## Form Configuration

The configuration inherits the `MsalAuthorizerConfig`  
Refer to the [`MSAL Authentication documentation`](/docs/runner/msal-apim-authentication.md) for information about `tenantId`, `clientId`, `clientSecret` and `scopes`

```json
"secureFormSubmissionConfig": {
    "tenantId": "${env_form_submission_tenant_id}",
    "clientId": "${env_form_submission_client_id}",
    "clientSecret": "${env_form_submission_client_secret}",
    "scopes": ["${env_form_submission_scope1}", "${env_form_submission_scope2}"],
    "useAwsWafUserAgentWorkaround": boolean
  }
```

> **Note: useAwsWafUserAgentWorkaround**  
> AWS WAF requires User-Agent to be present as part of auth, setting this option to tru will make the functioality provide one to prevent 403

## How to Update env variables

Environment variables can be added or updated by following the guide at <https://ukhsa.atlassian.net/wiki/spaces/IDT/pages/294420993/XGO-007+Adding+New+Environment+Variables>

## How it works

### The following is a top-down view

The [`FormSecurityService`](/runner/src/server/services/formSecurityService.ts) supports our different security mechanisms.

- For the [`webhookHmacSharedKey`](/runner/src/server/services/formSecurityService.ts#L31) approach it generates Hmac and sets HMAC specific headers.

- For the [`APIM`](/runner/src/server/services/formSecurityService.ts#L49) approach it uses server Dependency Injection to register named instances of [`SecureFormSubmissionService`](/runner/src/server/services/secureFormSubmissionService.ts#L137) which exposes a `getAuthHeader` method that returns an object in the form of `{ Authorization: "Bearer <token>"}`.  
  Registration into DI is done on [`server initialization`](/runner/src/server/index.ts#L191) for forms declaring the `secureFormSubmissionConfig`

The `StatusService` [`invokes`](/runner/src/server/services/statusService.ts#L137) `FormSecurityService.getSecurityHeaders` method which returns headers based on what approach the form use. It then passes those headers to the `WebhookService`

The `WebhookService` accepts [`additionalHeaders?: Record<string, string>`](/runner/src/server/services/webhookService.ts#L32) as part of it's postRequest method, which it then includes when it makes the request to the form configured webhook output.

### Implementation Details: DI service registration

Per form SecureFormSubmissionService registration

```typescript
for (const form of enginePlugin.options.configs) {
  const formId = form.id;

  if (form.configuration.secureFormSubmissionConfig) {
    const instanceName = getSecureFormSubmissionServiceInstance(formId);

    const namedService = new SecureFormSubmissionService(
      form.configuration.secureFormSubmissionConfig
    );

    await server.registerService(
      Schmervice.withName(instanceName, namedService)
    );
  }
}
```

### Implementation Details: DI service resolution

Once registered, the service can be resolved from the DI using the below.  
Notice we have to do a dynamic resolution - since services are dynamically registered based on what forms are served, there is no knowledge of what services exists and in turn there's no way to statically type the access.

```typescript
const instanceName = getSecureFormSubmissionServiceInstance(formId);
if (instanceName) {
  const services = request.services([])

  const serviceInstance = services[instanceName] as SecureFormSubmissionService;
  if (serviceInstance) {
    const headers = await serviceInstance.getAuthHeader();
    ...
  }
  ....
}
```
