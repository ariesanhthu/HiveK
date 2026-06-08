# FE Guideline

- Use Swagger UI to test APIs:
  - Admin: `hivek/api/admin/docs`
  - Client: `hivek/api/client/docs`
- Use the OpenAPI JSON endpoint when you need a machine-readable contract:
  - Admin: `hivek/api/admin/docs/openapi-json`
  - Client: `hivek/api/client/docs/openapi-json`
- The OpenAPI JSON can be used to generate frontend types or clients, including with LLM-assisted workflows or tools such as `openapi-ts`.
- Use GraphQL for the domains that already expose resolvers and benefit from field-level selection:
  - `campaign`
  - `campaignParticipants`
  - `kolProfiles`
- Access the GraphQL endpoint to test queries in the playground or with Postman:
  - `hivek/graphql`
- Swagger covers most HTTP controllers, while GraphQL is currently a focused option for the query-heavy domains above.
