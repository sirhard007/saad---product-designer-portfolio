# Saadux CMS setup

This upgrade is local source code. It does not deploy the portfolio or modify the production database automatically.

## 1. Prepare the database

Back up your existing Supabase database. Run `db/cms.sql` in its SQL editor. It adds the CMS tables and project fields without deleting existing projects. Existing projects remain published and visible on the homepage; new projects start as drafts in the editor.

Public project reads now go through the Express API. The migration revokes direct anonymous access to the projects table so unpublished content cannot bypass the API. Apply the migration and upgraded API together when you eventually release this version; the previous API's anonymous database key will no longer work after migration. Use a separate Supabase development project containing your existing projects schema for isolated local testing.

Interface Archive was a static component, not a separate database table. Its component and public section are removed. Images still used by local project previews are retained.

## 2. Configure local environment

In your existing `.env`, configure these **server-only** values. Never prefix secrets with `VITE_` or `NEXT_PUBLIC_`, and never commit `.env`:

```dotenv
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SERVICE_ROLE_KEY
JWT_SECRET=YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

The Supabase publishable/anonymous key cannot replace the service role key for this CMS. Generate a JWT secret locally with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste it into `.env`.

## 3. Create your account

Temporarily add your chosen account values to `.env`:

```dotenv
ADMIN_USERNAME=your_username
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your_unique_password_of_at_least_12_characters
```

In the VS Code terminal, inside the repository:

```bash
npm install
npx tsx scripts/create-admin.ts
```

Remove the three `ADMIN_` values from `.env` after successful creation. The database stores a salted password hash, not your original password. The old shared-password login is replaced. Re-running creation with an existing username fails rather than overwriting it.

## 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000/admin`, then sign in with your username and password. If port 3000 is already in use, stop the earlier development terminal with Ctrl+C before restarting.

## Using the CMS

- **Projects:** edit case studies and metadata, choose image/video covers, reuse media, publish/unpublish, feature, hide from homepage, and set numeric ordering (lower numbers first).
- **Media Library:** upload JPG/PNG/WEBP/MP4, preview, search, copy URLs, and delete unused assets. Files referenced by a project or saved avatar cannot be deleted. Existing external project images are retained; new uploads populate the library.
- **Profile:** edit username/email/avatar and change password. Password changes invalidate existing sessions. Sessions expire after eight hours.
- **Messages:** view contact-form submissions and mark read/unread. Reply links open your email application; no email is sent automatically.
- **Website Settings:** set contact email, resume URL and analytics collection. Blank settings retain existing resume links. The contact section opens a form and offers your configured email as an alternative.

Uploads are limited to 4 MB to fit the existing serverless API. Use a hosted MP4 URL for larger videos. Videos autoplay muted, with a poster/image fallback; reduced-motion preferences disable autoplay. Images retain their full proportions.

## Analytics definitions and limits

Analytics starts from new recorded activity; no historical traffic is invented. Total visitors means sessions; unique visitors means anonymous browser identifiers, not verified people. A session expires after 30 minutes of inactivity. Device and source information are approximate. Visitors blocking storage/tracking or using Do Not Track / Global Privacy Control are not recorded. Review your site's privacy notice before enabling production collection.

Page views, case-study views, project links, live-site links, resume-link clicks and contact clicks are measured. Resume downloads represent clicks, not confirmed completed file transfers. Country/city appear only from trusted hosting headers on Vercel; localhost shows unavailable. The dashboard provides 7-, 30- and 90-day views. Analytics is informational and public event submissions are rate-limited, not fraud-proof.

## Verification

```bash
npm run lint
node --import tsx --test tests/cms.test.ts
npm run build
```

The automated API tests use a mocked database to check authorization, session invalidation, published-only reads, content sanitization and disabled analytics. They do not replace testing the migration, uploads and CRUD against your configured Supabase/Cloudinary accounts.
