# Kwanele P. Ntshalintshali: Portfolio

Static site (HTML/CSS/JS, no build step) plus Supabase for admin sign-in, posts and media. Three.js is loaded from jsDelivr (pinned version).

## Folder structure
- `index.html`, `css/`, `js/app.js`: public site (globe, photo strip, panels, post views)
- `admin/index.html`: admin area (sign-in, create/edit/publish/unpublish/delete posts, uploads)
- `supabase/schema.sql`: tables, Row Level Security and storage rules
- `assets/photos/` (your 17 photos), `assets/team.jpg` (hero background), `assets/video/` (put `hero.mp4` here)
- `config.js`, `.env.example`, `scripts/make-config.mjs`: backend settings

## 1. Run locally (works immediately, placeholder content)
Just double-click `index.html` (internet needed only for the optional backend). To test your own video on the globe, use a local server instead (browsers block video textures from files): `python3 -m http.server 8000`, open http://localhost:8000.

## 2. Your video on the globe
Save your own video as `assets/video/hero.mp4` (H.264, ~720p, under 10 MB). Then add `<script>window.SITE_VIDEO='assets/video/hero.mp4'</script>` before `js/app.js` in `index.html`. The globe switches from photos to video (muted, looping, autoplay). Test it on a server or after deploying.

## 3. Connect Supabase (admin, posts, uploads)
1. Create a free project at supabase.com.
2. **SQL Editor**: paste and run `supabase/schema.sql`.
3. **Authentication > Providers > Email**: turn **off** "Allow new users to sign up" (no public sign-up).
4. **Authentication > Users > Add user**: create your own email and a strong password.
5. SQL Editor: `insert into public.admins select id from auth.users where email = 'kpmalekwanele@gmail.com';`
6. **Project Settings > API**: copy the Project URL and the `anon` public key into `config.js` (or set them as env vars, step 4 below). Never use or commit the `service_role` key.
7. Open `/admin/`, sign in, add a post, and publish it.

Security note: the admin page URL is not secret. Protection comes from sign-in plus Row Level Security: only users listed in `admins` can write or read drafts, and visitors can only read published posts. Media uses unguessable file names, but anyone with a direct file link can open it, so do not upload confidential files.

## 4. Deploy from GitHub
1. `git init && git add . && git commit -m "Portfolio"` and push to a new GitHub repository (`.env` is git-ignored).
2. Use Cloudflare Pages, Netlify or Vercel: import the repo, build command `node scripts/make-config.mjs`, output directory `.`.
3. Add environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the host's settings.
4. In Supabase **Authentication > URL Configuration**, set the site URL to your deployed address.

## Editing everything from the dashboard
In `/admin/` you manage: **Posts** (the three panels), **My story: moments** (the photo/video cards around the globe, each with its own long story page), and **Site content** (the text inside the globe, About, skills, languages, interests, experience, education). Nothing needs code edits. If you already ran `schema.sql` before the globe was added, run only the section marked "PART 2" in the SQL Editor.

## Editing your profile text (without the backend)
The built-in text lives in `js/defaults.js`. Once Supabase is connected, use the dashboard instead.
