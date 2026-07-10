---
title: Added the initial Git-first Cloudflare deployment setup
date: "2026-03-07"
summary: Documented the initial Cloudflare deployment approach. The current production contract was later corrected to Cloudflare Workers with static assets and `site/` as the build root.
changedItems:
  - Added a Pages-ready `wrangler` config and Node version pin
  - Added `cf:preview` and `cf:deploy` scripts for local Cloudflare workflows
  - Added deployment documentation for a Git-connected Cloudflare Pages setup
reason: Complete the initial launch setup so the site could be published from Git without changing its content workflow.
impactOnPublicCopy: No visible content changed, but the site now has a defined deployment path for previews and production publishing.
---

This is a historical record of the initial setup. The current deployment documentation in `site/DEPLOYMENT.md` is authoritative: Cloudflare Workers Builds uses `site/` as the build root and deploys static assets from `site/dist/`.
