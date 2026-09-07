<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Content deploy workflow (articles from the SEO team's Drive folder)

`wuling-chonburi-website` is the only branch that deploys (Vercel auto-deploys
every push to it as production — there is no separate review/staging branch).

When converting and publishing an article from the Drive folder:
1. `git checkout wuling-chonburi-website && git pull --ff-only`
2. Edit `src/lib/data/articles.ts` directly on that branch.
3. Verify: `npx tsc --noEmit`, `npx eslint <file>`, `npx next build`, plus a
   local smoke test (title/meta/schema/internal links) against the built output.
4. `git commit` and `git push origin wuling-chonburi-website` directly.

Do **not** create a `content/article-NN-slug` branch or open a PR for this.
That pattern was used for the first two articles and immediately merged
every time with no review step in between — the branch+PR added no real
review, just an extra commit (the merge commit) and a second Vercel preview
deployment for zero benefit. Push straight to `wuling-chonburi-website`
once the checks in step 3 pass.
