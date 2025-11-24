# Deployment Notes

## Vercel Function Limit

Vercel Hobby plan limits deployments to **12 serverless functions**. This project currently has **29 API routes**, which exceeds this limit.

### Solutions

1. **Upgrade to Pro Plan** (Recommended)
   - Pro plan allows unlimited serverless functions
   - Upgrade at: https://vercel.com/pricing

2. **Reduce Model Count**
   - Remove less-used model routes from `api/` directory
   - Keep only essential models (unified routes + most popular models)

3. **Consolidate Routes**
   - We've already consolidated OpenMemory (3 → 1 function)
   - Consider consolidating more routes if possible

### Current Function Count

- Unified routes: 4 (chat, images, videos, v2/chat)
- OpenMemory: 1 (consolidated)
- OpenReason: 1
- Individual models: ~20
- Other services: ~3

**Total: ~29 functions** (exceeds 12 limit)

### Essential Routes (Keep These)

These routes are required for the unified API to work:
- `/api/unified/v1/chat/completions`
- `/api/unified/v1/images/generations`
- `/api/unified/v1/videos/generations`
- `/api/unified/v2/chat/completions`
- `/api/openmemory/memory/[...path]`
- `/api/openreason/reason`

Individual model routes can be removed if you only use the unified API endpoints.

