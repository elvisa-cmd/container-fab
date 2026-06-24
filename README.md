# Classic Container Fabricators Kenya

Full-stack marketing and admin website for **Classic Container Fabricators Kenya** — transforming shipping containers into offices, homes, and commercial spaces. Built with Next.js 14 App Router, Tailwind CSS, and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Storage + Auth) |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |

---

## Environment Variables

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Get these from: **Supabase Dashboard → Project Settings → API**.

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.local.example .env.local
# Then edit .env.local with your Supabase credentials

# 3. Run the development server
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin portal: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

> **Note:** The site works without Supabase credentials — it falls back to hardcoded mock data (`lib/mock-data.ts`). Connect Supabase to enable content editing, contact form submissions, and analytics.

---

## Supabase Setup

### 1. Create a Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project** — choose a name, region (e.g. EU West), and a strong password.
3. Wait ~2 minutes for the project to provision.
4. Copy the **Project URL** and **anon public key** from **Project Settings → API** into `.env.local`.

### 2. Run the Database Schema
1. In your Supabase Dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase-schema.sql` from this project, copy all contents, paste into the editor.
4. Click **Run** (or press `Ctrl+Enter`).

This single file:
- Creates all 7 tables with correct column types
- Inserts seed / default content for all sections
- Configures Row Level Security (RLS) policies
- Creates the `site-images` public storage bucket

### 3. Verify Storage Bucket
After running the schema, go to **Storage** in your Supabase Dashboard. You should see a `site-images` bucket listed as **Public**. If it is missing, create it manually:
1. Click **New bucket**
2. Name: `site-images`
3. Tick **Public bucket**
4. Click **Save**

### 4. Create the Admin User
Admin accounts are created manually — there is no public sign-up:
1. In the Supabase Dashboard, go to **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter the admin email address and a strong password.
4. Click **Create user**.

The user can now log in at `/admin/login` using those credentials.

---

## Deploying to Vercel

1. Push this repository to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), click **Add New → Project**, and import the repository.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
4. Click **Deploy**.

Vercel auto-detects Next.js and configures the build correctly. All routes are server-rendered on demand — no static export needed.

---

## Admin Panel Guide

Log in at `/admin/login` then use the sidebar to navigate.

### Dashboard (`/admin`)
Overview of traffic and enquiries. Shows:
- Total page views, views today, total messages, unread count
- 30-day area chart of page views and messages
- Recent enquiries preview table

### Messages (`/admin/messages`)
- Left panel: all enquiries sorted by date, with unread indicator dots
- Filter by All / Unread / Replied
- Search by name or email
- Right panel: full message, contact details, reply textarea, **Save Reply** button
- Replies are stored in Supabase (not emailed — use your own email service or Resend for that)

### Content Editors

| Page | Path | What you can edit |
|---|---|---|
| Hero | `/admin/content/hero` | All 3 headline lines, subtext, 3 stats, hero image. Live preview on the right. |
| About | `/admin/content/about` | Heading, both paragraphs, badge, all 3 pillar cards, about image |
| Services | `/admin/content/services` | Icon, title, description, active/inactive toggle per service. Reorder with arrows. Add new services. |
| Projects | `/admin/content/projects` | Add projects (title, category, description, image). Toggle featured. Reorder. Delete. |
| Reefers | `/admin/content/reefers` | Heading, subheading, description, all 4 feature bullets, section image |

### Analytics (`/admin/analytics`)
- 4 summary cards
- 90-day page views line chart
- 12-week messages bar chart
- Top pages by view count
- Recent activity feed

---

## Project Structure

```
├── app/
│   ├── globals.css                 Tailwind + CSS variables + animations
│   ├── layout.tsx                  Root layout (fonts, metadata, PageTracker)
│   ├── page.tsx                    Public homepage (server component)
│   ├── api/
│   │   ├── contact/route.ts        POST — save enquiry from contact form
│   │   ├── track/route.ts          POST — record page view
│   │   └── reply/route.ts          POST — save admin reply to a message
│   └── admin/
│       ├── login/page.tsx          Login page
│       ├── layout.tsx              Admin shell — auth guard + sidebar
│       ├── page.tsx                Dashboard
│       ├── messages/               Inbox
│       ├── analytics/              Analytics charts and tables
│       └── content/
│           ├── hero/               Hero section editor + live preview
│           ├── about/              About section editor
│           ├── services/           Services list editor (reorder, add, delete)
│           ├── projects/           Projects grid editor (featured toggle, reorder)
│           └── reefers/            Reefers section editor
├── components/
│   ├── public/
│   │   ├── Navbar.tsx              Fixed top nav with mobile hamburger
│   │   ├── Hero.tsx                Full-viewport hero with diagonal slash
│   │   ├── About.tsx               Two-column about with pillars
│   │   ├── Services.tsx            3×2 grid with ghost numbers
│   │   ├── Reefers.tsx             Dark band — image + feature bullets
│   │   ├── Process.tsx             4-step process with numbered circles
│   │   ├── Projects.tsx            Asymmetric image grid
│   │   ├── ContactForm.tsx         Contact form with validation
│   │   ├── Footer.tsx              Footer with social links
│   │   └── PageTracker.tsx         Client component — fires /api/track on mount
│   ├── admin/
│   │   ├── Sidebar.tsx             Left nav with route highlighting + unread badge
│   │   ├── StatsCard.tsx           Reusable stat card (icon, value, sublabel)
│   │   ├── ViewsChart.tsx          Recharts AreaChart (views + messages)
│   │   └── ImageUploader.tsx       Drag-drop image upload to Supabase Storage
│   └── ui/
│       ├── Button.tsx              Primary / outline / ghost / danger + loading
│       ├── Input.tsx               Input and Textarea with label + error state
│       └── Toast.tsx               Toast provider + useToast hook
├── lib/
│   ├── supabase.ts                 Browser Supabase client (createBrowserClient)
│   ├── supabase-server.ts          Server Supabase client (createServerClient + cookies)
│   └── mock-data.ts                Complete hardcoded fallback for all content tables
├── types/
│   └── index.ts                    TypeScript interfaces for all DB tables
├── middleware.ts                   Auth guard: redirects /admin/* to /admin/login
├── supabase-schema.sql             Full DB schema + seed data + RLS + storage policies
└── .env.local.example              Environment variable template
```

---

## Design Tokens

| Token | Hex | Usage |
|---|---|---|
| `--steel` | `#1A1F2E` | Dark navy — hero, footer, admin sidebar |
| `--rust` | `#C94C1A` | Brand accent — CTAs, highlights, active states |
| `--rust-lt` | `#E05A22` | Rust hover state |
| `--concrete` | `#F0EDE8` | Off-white section backgrounds |
| `--mid-gray` | `#6B7280` | Body copy |

**Fonts:** Barlow Condensed (700/800 weight, uppercase letter-spacing) for all display headings. Inter for all body text.

---

## Common Questions

**The contact form submits but I don't receive an email.**
The form saves messages to Supabase only — it does not send emails. To send email notifications, integrate [Resend](https://resend.com) or [SendGrid](https://sendgrid.com) in `app/api/contact/route.ts` after the `supabase.from('messages').insert(...)` call.

**Images uploaded in the admin aren't showing.**
Make sure the `site-images` Supabase Storage bucket is set to **Public**. Also verify your Supabase project URL is in the `remotePatterns` list in `next.config.js` (it already matches `*.supabase.co`).

**I forgot the admin password.**
Go to **Supabase Dashboard → Authentication → Users**, find the user, and click **Reset password** or delete and recreate the user.

**Can I add multiple admin users?**
Yes — create additional users via **Supabase Dashboard → Authentication → Users → Add user**. All authenticated users have full admin access.
