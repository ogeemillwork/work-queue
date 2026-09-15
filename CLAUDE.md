# Working agreements

- After completing a change: push the branch, open the PR, and merge it
  immediately — do not wait for human review. Merging to `main` is the
  production deploy (Vercel serves `main` at workqueue.dev), so a change
  is not done until it is merged and the production deployment is
  verified live.
- Validate before merging: typecheck (`npx tsc --noEmit`) and
  `npm run build` must pass, and UI changes should be sanity-checked in
  a real browser when possible.
