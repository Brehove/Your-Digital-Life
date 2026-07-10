# Deployment

## Production contract

The public site is deployed as a **Cloudflare Worker with static assets**. Cloudflare Workers Builds watches the GitHub repository and builds `main`; this is not a Cloudflare Pages project.

Do not change these settings during repository cleanup:

| Setting | Production value |
|---|---|
| Git branch | `main` |
| Build root | `site` |
| Build command | `npm run build` |
| Asset output | `dist` (that is, `site/dist` from the repository root) |
| Node version | `22.16.0`, pinned in `.node-version` |
| Worker name | `your-digital-life` |
| Custom domain | `https://your-digital-life.org` |

`wrangler.jsonc` points the Worker at `./dist`. Keep both the Worker name and assets directory unchanged unless a separately reviewed deployment migration calls for it.

## Normal production workflow

1. Create a branch from the current `main`.
2. Make and verify the change locally.
3. Open a pull request and wait for the `validate-site` GitHub Actions check.
4. Review any non-production Workers Build preview only if Cloudflare created one for that branch. Preview availability and URL behavior must be confirmed in the Cloudflare dashboard; do not assume fork pull requests receive previews.
5. Merge the reviewed pull request into `main`.
6. Cloudflare Workers Builds builds the repository from the `site` root and publishes the new Worker version.
7. Confirm the six public routes, the legacy redirect, and the new Worker version in Cloudflare.

Git-backed Workers Builds is the only normal production deployment path. There is deliberately no `cf:deploy` package script: running `wrangler deploy` locally could bypass the reviewed Git history and the normal production build.

## Local verification

From `site/`:

```bash
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run test:routes
```

To inspect the built static assets through the local Workers runtime:

```bash
npm run cf:preview
```

This command uses `wrangler dev --local`; it does not publish a Worker.

## Rollback

The confirmed emergency rollback path is the Cloudflare dashboard:

1. Open **Workers & Pages** and select the `your-digital-life` Worker.
2. Open **Deployments** and identify the last known-good Worker version.
3. Roll production traffic back to that version.
4. Verify all six public routes and `/benefits-and-risks/`.
5. Revert the offending Git commit through a new pull request so `main` once again describes production.

Do not force-push or reset `main`. Local Wrangler authentication and command-line rollback are not assumed to be available.

Record the Git commit SHA and resulting Worker version for every production deployment.
