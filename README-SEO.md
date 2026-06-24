# SEO Setup Guide — Container Fabricators Kenya

## What's Already Set Up

- ✅ Full metadata (title, description, keywords, OG, Twitter cards)
- ✅ LocalBusiness JSON-LD structured data on homepage
- ✅ Service JSON-LD + BreadcrumbList on each service page
- ✅ Dynamic sitemap at `/sitemap.xml`
- ✅ Robots.txt at `/robots.txt`
- ✅ OG image auto-generated at `/opengraph-image`
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Image optimisation (AVIF + WebP formats)
- ✅ Semantic HTML (`<header>`, `<nav aria-label>`, `<footer>`)
- ✅ Canonical URLs on all public pages

---

## Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `containerfabricators.co.ke`
3. Choose **HTML tag** verification method
4. Copy the verification code (looks like `abc123def456`)
5. Open `app/layout.tsx` and update:
   ```ts
   verification: {
     google: 'your-code-here',   // ← replace this
   },
   ```
6. Deploy, then click **Verify** in Search Console

---

## After Deployment

1. Submit sitemap: `https://containerfabricators.co.ke/sitemap.xml`
2. Request indexing for the homepage
3. Check robots.txt: `https://containerfabricators.co.ke/robots.txt`
4. Test structured data: [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
5. Check OG image: [opengraph.xyz](https://www.opengraph.xyz/)

---

## Local SEO Tips

- Keep **Google Business Profile** updated with the exact address from this site
- Add the business to **Kenya Yellow Pages** and **PigiaMe**
- Encourage customers to leave Google reviews
- Post project photos on Google Business Profile regularly
- Use location keywords: "Nairobi", "Kenya", "East Africa" naturally in content

---

## Updating Metadata

All metadata lives in `app/layout.tsx` (site-wide defaults) and individual `page.tsx` files.

Service pages get metadata automatically from `data/services.json` — update the `full_description` and `description` fields in the admin panel to improve service page SEO.
