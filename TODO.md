# Task: Remove static export settings from Next.js config and dynamic export from API route

## Completed Steps
- [x] Remove `output: 'export'` from `next.config.ts`
- [x] Remove `outputFileTracingRoot: path.resolve(__dirname, '../../')` from `next.config.ts`
- [x] Remove `export const dynamic = 'force-dynamic';` from `src/app/api/security-reports/route.ts`

## Followup Steps
- [ ] Verify the changes work for standard Next.js deployment on Netlify
- [ ] Test API routes to ensure they function correctly
