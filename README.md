# Bayit 🏠: AI-Powered Real Estate for Morocco

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see below)

# 3. Run in development mode
npm run dev
# → Open http://localhost:3000
```

---

## Environment Variables (`.env.local`)

### OpenAI (required for full AI chat)
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini        # or gpt-4o for best quality
```
Without this key the chat still works, using keyword-matching on the sample data.

### Google Sheets (optional, for live property data)

**Step 1**: Create a Google Sheet with these columns (Row 1 = headers):
| A: id | B: title | C: description | D: price | E: city | F: neighborhood | G: type | H: bedrooms | I: bathrooms | J: area_sqm | K: image_url | L: lat | M: lng | N: features | O: available |

`type` values: `Apartment`, `Villa`, `Riad`, `Studio`, `Penthouse`, `House`
`features` = comma-separated list
`available` = `TRUE` or `FALSE`

**Step 2**: Connect it using one of two methods:

#### Option A: Service Account (recommended, works with private sheets)
1. Go to [Google Cloud Console](https://console.cloud.google.com) → Create a project
2. Enable the **Google Sheets API**
3. Create a Service Account → download the JSON key
4. Share your Google Sheet with the service account email (Viewer access)
5. Add to `.env.local`:
```
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=name@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

#### Option B: API Key (simpler, only for publicly shared sheets)
1. Enable **Google Sheets API** in Google Cloud Console
2. Create an API key (restrict to Sheets API)
3. Set the sheet to "Anyone with the link can view"
4. Add to `.env.local`:
```
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_API_KEY=AIza...
```

Without either, Bayit falls back to the built-in sample properties automatically.

---

## Project Structure

```
bayit/
├── app/
│   ├── layout.tsx          # Root layout with ChatProvider
│   ├── page.tsx            # Landing page
│   └── api/chat/route.ts   # OpenAI + Google Sheets chat API
├── components/
│   ├── Header.tsx          # Sticky nav
│   ├── Hero.tsx            # Hero section
│   ├── HowItWorks.tsx      # 3-step process
│   ├── FeaturedProperties.tsx
│   ├── WhyBayit.tsx        # Value props
│   ├── MapSection.tsx      # Leaflet map wrapper
│   ├── MapInner.tsx        # Leaflet map (client-only)
│   ├── ChatWidget.tsx      # Full chat UI with property cards
│   └── PropertyCard.tsx    # Reusable property card
├── contexts/
│   └── ChatContext.tsx     # Global chat open/close state
├── lib/
│   ├── properties.ts       # Sample data + filter helpers
│   └── sheets.ts           # Google Sheets integration
└── types/
    └── index.ts            # TypeScript types
```

---

## Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```
Add your env variables in the Vercel dashboard under Project → Settings → Environment Variables.
