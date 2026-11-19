# Dev-only site setup (Vercel)

The public site (www.음식만안와요.com) now shows a "service ended" notice instead
of the ordering demo. The full app still exists in this same codebase — it's
just gated behind `VITE_SITE_MODE=dev` (see `src/main.jsx`) so it can be
deployed as a second, unlisted website for you + one friend to keep testing
on, without touching the public domain.

**The dev project tracks a separate `dev` branch, not `main`** (a local `dev`
branch already exists, created off the same commit `main` is on). This means
future commits pushed to `dev` only redeploy the dev site — `main` (and the
public site + native app source) stays untouched until you deliberately merge
`dev` into `main` and push that too.

## Env vars the new project needs

A brand-new Vercel project does **not** inherit the existing project's
environment variables — you have to re-enter them, or the dev site will
crash on load with a Firebase `auth/invalid-api-key` error (the whole app,
including the passcode-gated part, needs Firebase to work). These are the
only ones this codebase reads (`grep -r "import.meta.env" src` to re-check
if this list ever goes stale):

| Key | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCDP64w8izoZloRJ1jDNRuR9fw5vlgxzew` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `foodneverarrives.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `foodneverarrives` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `foodneverarrives.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `512994586724` |
| `VITE_FIREBASE_APP_ID` | `1:512994586724:web:3e242c4d3f712d90ddaf71` |
| `VITE_SITE_MODE` | `dev` |

(These Firebase values aren't secret — they're the same ones already visible
in the production site's JS bundle. `VITE_SITE_MODE=dev` is the only one
that's actually new/different from the existing project.)

## One-time setup (do this once, after the 2026-09-11 push)

1. Go to https://vercel.com/dashboard and make sure you're logged into the
   same account/team the existing `delivery_demo` project is under.
2. Click **Add New...** (top right) → **Project**.
3. Under "Import Git Repository", find `Kimeggmari/delivery_demo` and click
   **Import**. (If it's not listed, click **Adjust GitHub App Permissions**
   and grant access to this repo, then come back.)
4. On the "Configure Project" screen:
   - **Project Name**: anything you want (e.g. `delivery-demo-dev`) — this
     name becomes part of the auto-generated URL, so avoid anything
     revealing/guessable if you want it to stay low-profile.
   - **Framework Preset**: should auto-detect as Vite — leave it.
   - **Root Directory**: leave as `./` (same repo root as the main project).
   - **Branch to deploy** (this may be under a "Git" or advanced section, or
     set afterward in Settings → Git → Production Branch): set it to `dev`,
     not `main`.
   - Expand **Environment Variables** and add all 7 rows from the table
     above (name + value, one row at a time — Vercel has an "Add" button per
     row, or a bulk paste option that accepts `KEY=value` lines).
5. Click **Deploy**. First build takes 1-2 minutes. (If the `dev` branch
   isn't on GitHub yet, this first deploy will fail — that's expected; it'll
   succeed as soon as `dev` is pushed, see the sequence below.)
6. Once it finishes, Vercel shows a congratulations screen with the
   assigned domain (something like `delivery-demo-dev.vercel.app` — also
   always visible later on the project's Overview tab). That's the dev
   site's address — nothing on the public site links to it, and it's not
   in the sitemap, so it stays effectively private.
7. Open that URL, enter the passcode (`DEV_PASSCODE` in `src/main.jsx`,
   currently `"fna_0911"`). Once entered, the browser remembers it
   (localStorage), so each of you only has to type it once per browser.

## Push sequence on 2026-09-11

1. Commit + push today's prepared work to `main` first, as planned — this is
   what makes the public site show the "service ended" notice and enables
   the native app's source to include the dev-mode gating logic.
2. Push the `dev` branch too, once, so it starts out identical to `main`:
   ```bash
   git checkout dev
   git merge main
   git push -u origin dev
   git checkout main
   ```
3. Do the Vercel project setup above (point it at `dev`).

## Ongoing workflow after that

- New feature work → commit to `dev`, push `dev` → only the dev site
  redeploys. `main` (public site, native app source) is untouched.
- When a feature is ready to become the new baseline (e.g. before a native
  app build, or just periodically) → merge `dev` into `main` and push `main`
  → the public site redeploys too, but still just shows the same "service
  ended" notice (nothing user-visible changes) unless `main.jsx` or
  `ServiceEndedPage.jsx` themselves were touched.
