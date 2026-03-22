/**
 * Bayit Smart Advisor Chat Server
 * Runs on port 3001 — no Next.js compilation needed.
 * POST /api/chat
 */
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { URL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const env = readFileSync(path.join(ROOT, '.env.local'), 'utf8');
    for (const line of env.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key) process.env[key] = val;
    }
  } catch {}
}
loadEnv();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL   = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SHEET_ID       = process.env.GOOGLE_SHEET_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// ── Property cache (60s TTL) ──────────────────────────────────────────────────
let _cachedProps = null;
let _cacheTime   = 0;

function rowToProperty(row) {
  try {
    const [id, title, description, price, city, neighborhood,
           type, bedrooms, bathrooms, areaSqm, imageUrl,
           lat, lng, features, available] = row;
    if (!id || !title) return null;
    return {
      id: id.trim(), title: title.trim(),
      description: description?.trim() ?? '',
      price: parseFloat(price) || 0,
      city: city?.trim() ?? '',
      neighborhood: neighborhood?.trim() ?? '',
      type: type?.trim() ?? 'Apartment',
      bedrooms: parseInt(bedrooms, 10) || 0,
      bathrooms: parseInt(bathrooms, 10) || 0,
      areaSqm: parseFloat(areaSqm) || 0,
      imageUrl: imageUrl?.trim() ?? '',
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      features: features ? features.split(',').map(f => f.trim()).filter(Boolean) : [],
      available: available?.trim().toUpperCase() === 'TRUE',
    };
  } catch { return null; }
}

async function fetchProperties() {
  const now = Date.now();
  if (_cachedProps && now - _cacheTime < 60000) return _cachedProps;

  if (SHEET_ID && GOOGLE_API_KEY) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Properties!A2:O?key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const props = (data.values ?? []).map(rowToProperty).filter(Boolean);
        if (props.length > 0) {
          _cachedProps = props; _cacheTime = now;
          console.log(`[Bayit] Loaded ${props.length} properties from Google Sheets`);
          return props;
        }
      }
    } catch (e) { console.error('[Bayit] Sheets error:', e.message); }
  }
  _cachedProps = SAMPLE; _cacheTime = now;
  return SAMPLE;
}

// ── Sample fallback ───────────────────────────────────────────────────────────
const SAMPLE = [
  { id:'1', title:'Luxury Riad in the Medina', description:'5-bedroom riad with rooftop terrace and zellige tilework in the heart of the old medina', price:4500000, city:'Marrakech', neighborhood:'Medina', type:'Riad', bedrooms:5, bathrooms:4, areaSqm:320, imageUrl:'https://images.unsplash.com/photo-1539437829697-1b4ed9032be3?w=800', lat:31.6295, lng:-7.9811, features:['Pool','Rooftop','AC','WiFi','Parking'], available:true },
  { id:'2', title:'Modern Apartment in Gueliz', description:'Bright 2-bedroom apartment with city views in the modern district', price:950000, city:'Marrakech', neighborhood:'Gueliz', type:'Apartment', bedrooms:2, bathrooms:1, areaSqm:85, imageUrl:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', lat:31.6317, lng:-8.0083, features:['AC','WiFi','Balcony','Security'], available:true },
  { id:'3', title:'Sea-View Villa in Agadir', description:'4-bedroom villa with panoramic Atlantic Ocean views and private pool', price:3200000, city:'Agadir', neighborhood:'Founty', type:'Villa', bedrooms:4, bathrooms:3, areaSqm:280, imageUrl:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', lat:30.4278, lng:-9.5981, features:['Pool','Garden','AC','WiFi','Garage','Sea View'], available:true },
  { id:'6', title:'Penthouse in Casablanca Maarif', description:'3-bedroom penthouse with wraparound terrace and sea glimpses', price:5500000, city:'Casablanca', neighborhood:'Maarif', type:'Apartment', bedrooms:3, bathrooms:3, areaSqm:210, imageUrl:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', lat:33.5731, lng:-7.5898, features:['Terrace','AC','WiFi','Gym','Concierge','Parking'], available:true },
];

// ── System Prompt — Smart Real Estate Advisor ─────────────────────────────────
function buildSystemPrompt(properties) {
  const pricesByCity = {};
  properties.forEach(p => {
    if (!pricesByCity[p.city]) pricesByCity[p.city] = [];
    pricesByCity[p.city].push(p.price);
  });
  const marketContext = Object.entries(pricesByCity).map(([city, prices]) => {
    const min = Math.min(...prices), max = Math.max(...prices), avg = prices.reduce((a,b)=>a+b,0)/prices.length;
    return `${city}: min ${(min/1e6).toFixed(1)}M, avg ${(avg/1e6).toFixed(1)}M, max ${(max/1e6).toFixed(1)}M MAD`;
  }).join('\n');

  const db = JSON.stringify(properties.map(p => ({
    id: p.id, title: p.title, description: p.description,
    price: p.price, city: p.city, neighborhood: p.neighborhood,
    type: p.type, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
    areaSqm: p.areaSqm, features: p.features, imageUrl: p.imageUrl,
    lat: p.lat, lng: p.lng, available: p.available,
  })), null, 2);

  return `You are Karim, a senior Moroccan real estate advisor with 12 years of experience across Marrakech, Casablanca, Rabat, Agadir, Fes, Tangier, and Essaouira. You have deep knowledge of each city's neighbourhoods, market prices, lifestyle, and investment potential.

## YOUR PERSONALITY
- Warm, knowledgeable, direct but empathetic
- You give real opinions — not just search results
- You speak naturally, like a trusted friend who knows real estate deeply
- You use short paragraphs. You never ask more than ONE question at a time.
- You notice what people don't say as much as what they do say
- Occasional French or Arabic word is natural (like "medina", "riad", "très bien")

## YOUR CORE MISSION
Help users discover what they REALLY need — not just what they ask for on the surface.

Understand:
1. Are they buying to LIVE or to INVEST? (this changes everything)
2. What's their lifestyle? (quiet family life, vibrant city, beach, culture)
3. What are their fears or hesitations? (budget, unfamiliar market, renovation risk)
4. Are they realistic about their budget for the area?

## CONVERSATION APPROACH

### DO NOT use a fixed question sequence.
Instead, read every message carefully and respond to what was actually said.

### When someone is VAGUE (e.g. "something nice, not too expensive"):
- Acknowledge what they said warmly
- Reflect back what you heard
- Ask ONE clarifying question that gets to the heart of it
- Example: "When you say 'not too expensive' — are you thinking more like under 1M MAD, or the 1-3M range? That changes where I'd look completely."

### When someone seems HESITANT or UNCERTAIN:
- Name the hesitation gently: "It sounds like you're still figuring out whether this is the right moment — is that fair?"
- Reassure with context: "Actually, Morocco's market is quite stable for buyers right now, especially in [city]."
- Don't rush them toward results — help them get clarity first

### When the BUDGET seems UNREALISTIC for what they want:
- Be honest but kind: "I want to be upfront with you — villas in Marrakech typically start around 2.5M MAD. At 1M, your best options would be a beautiful apartment or a riad to restore."
- Always follow up with what IS possible at their budget
- Never just say "no results" — pivot to alternatives immediately

### When someone says BUY TO LIVE:
- Ask about lifestyle: family size, daily routine, proximity to schools/work/beach
- Ask about long-term plans: "Is this a forever home or a 5-year plan?"

### When someone says INVEST / RENTAL:
- Focus on: rental yield potential, tourist demand, management ease
- Mention: "Marrakech and Agadir are strong for short-term rentals (Airbnb), Casablanca for long-term corporate tenants"
- Give an opinion on which property is the better investment

### When you SHOW RESULTS:
- Do NOT just list them neutrally
- For each property, give a brief advisor opinion in the "advisorNote" field
- Highlight the best match and explain WHY
- Mention any tradeoffs honestly
- If you see a genuinely great deal, say so: "This one stands out — it's priced below market for the area."

## MARKET CONTEXT (use this for reality checks)
${marketContext}

## RESPONSE FORMAT — always return valid JSON, nothing else:
{
  "message": "Your conversational advisor response. Warm, direct, 2-3 short sentences max. Use **bold** for key terms.",
  "propertyIds": [],
  "propertyNotes": {},
  "readyToSearch": false
}

Field rules:
- "propertyIds": ONLY the ID strings of matching properties (e.g. ["1","3","10"]). Keep it small — max 4 IDs. Only use IDs that exist in the database above.
- "propertyNotes": object mapping each returned ID to a 1-sentence advisor note. E.g. {"1": "Best-value riad in this price range.", "3": "Strong Airbnb yield potential."}
- "readyToSearch": true whenever propertyIds is non-empty
- When you have budget + city + type (or enough context): IMMEDIATELY populate propertyIds and set readyToSearch true. Do not keep asking questions.
- NEVER fabricate IDs. NEVER repeat "no results" twice. Always pivot to alternatives.
- Keep "message" SHORT — the cards speak for themselves.

## PROPERTY DATABASE
${db}`;
}

// ── Criteria extraction ───────────────────────────────────────────────────────
function extractCriteria(messages) {
  const text = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ');
  let budget = null;
  for (const re of [
    /(\d+(?:\.\d+)?)\s*m(?:illion)?\s*(?:mad|dh)?/i,
    /(\d[\d\s,]*)\s*(?:mad|dh|dirham)/i,
    /budget[^\d]*(\d[\d,\s]*)/i,
    /under[^\d]*(\d[\d,\s]*)/i,
    /(\d+)\s*k\s*(?:mad|dh)?/i,
  ]) {
    const m = text.match(re);
    if (m) {
      let v = parseFloat(m[1].replace(/[\s,]/g,''));
      if (re.source.includes('k')) v *= 1000;
      else if (v < 1000) v *= 1e6;
      budget = v; break;
    }
  }
  const cities = {
    marrakech:'Marrakech', casablanca:'Casablanca', casa:'Casablanca',
    rabat:'Rabat', agadir:'Agadir', fes:'Fes', fez:'Fes',
    tangier:'Tangier', tanger:'Tangier', meknes:'Meknes',
    essaouira:'Essaouira', ifrane:'Ifrane', tetouan:'Tetouan',
  };
  let city = null;
  for (const [k,v] of Object.entries(cities)) { if (text.includes(k)) { city=v; break; } }
  const types = {
    apartment:'Apartment', flat:'Apartment', villa:'Villa', riad:'Riad',
    studio:'Studio', penthouse:'Penthouse', house:'House', dar:'House',
  };
  let type = null;
  for (const [k,v] of Object.entries(types)) { if (text.includes(k)) { type=v; break; } }
  const bm = text.match(/(\d)\s*(?:bed(?:room)?s?|chambre)/i);
  let bedrooms = bm ? parseInt(bm[1]) : null;
  if (type === 'Studio') bedrooms = bedrooms ?? 0;

  const intentText = text;
  let intent = null;
  if (/invest|rental|yield|airbnb|revenue|income|return|locati/i.test(intentText)) intent = 'invest';
  else if (/live|family|home|reside|settle|move|relocat|stay|personal/i.test(intentText)) intent = 'live';

  return { budget, city, type, bedrooms, intent };
}

function isGeneralQuestion(text) {
  const t = text.toLowerCase();
  return ['what do you have','what properties','show me all','show all','list all',
    'what\'s available','what is available','all properties','what other','other properties',
    'other options','more options','what cities','which cities','what types','which types',
    'cheapest','expensive','anything else','what else','give me','show me properties',
    'do you have','any properties','all listings','browse','show everything',
    'everything you have','what can you show'].some(p => t.includes(p));
}

function matchProperties(props, { budget, city, type, bedrooms }) {
  return props.filter(p => {
    if (!p.available) return false;
    if (city && p.city.toLowerCase() !== city.toLowerCase()) return false;
    if (type && p.type !== type) return false;
    if (budget && p.price > budget * 1.1) return false;
    if (bedrooms != null && bedrooms > 0 && p.bedrooms < bedrooms) return false;
    return true;
  }).slice(0, 4);
}

// ── Mock fallback (no OpenAI key) ─────────────────────────────────────────────
function mockResponse(messages, properties) {
  const lastUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content ?? '';
  const criteria = extractCriteria(messages);
  const { budget, city, type, bedrooms, intent } = criteria;
  const userCount = messages.filter(m => m.role === 'user').length;

  if (isGeneralQuestion(lastUser)) {
    const avail = properties.filter(p => p.available);
    let results = avail, intro;
    if (city) {
      const r = avail.filter(p => p.city.toLowerCase() === city.toLowerCase());
      if (r.length) { results = r; intro = `Here's everything we have in **${city}** right now — ${r.length} listings across different budgets and styles:`; }
    }
    if (!intro) intro = `Here's a snapshot of what we have across Morocco — ${avail.length} properties in ${[...new Set(avail.map(p=>p.city))].join(', ')}:`;
    const notes = {};
    results.slice(0,6).forEach(p => {
      notes[p.id] = `Listed in ${p.neighborhood} — ${p.type} at ${(p.price/1e6).toFixed(1)}M MAD.`;
    });
    return { message: intro, properties: results.slice(0,6), propertyNotes: notes, readyToSearch: true };
  }

  if (budget && city && type) {
    const matches = matchProperties(properties, criteria);
    if (matches.length > 0) {
      const notes = {};
      matches.forEach((p, i) => {
        notes[p.id] = i === 0
          ? `Top pick for your criteria — best value ${p.type} in ${p.neighborhood}.`
          : `Good alternative — ${p.bedrooms} bedrooms, ${p.areaSqm}m² in ${p.neighborhood}.`;
      });
      const bedsText = bedrooms > 0 ? `, ${bedrooms}-bedroom` : '';
      const intentNote = intent === 'invest' ? ' These also have strong rental potential.' : '';
      return {
        message: `Here are the best **${type}${bedsText}** properties in **${city}** within **${(budget/1e6).toFixed(1)}M MAD**.${intentNote} I've highlighted the top pick for you:`,
        properties: matches, propertyNotes: notes, readyToSearch: true,
      };
    }
    const altCity = properties.filter(p => p.available && p.city.toLowerCase() === city.toLowerCase()).slice(0,4);
    const altType = properties.filter(p => p.available && p.type === type).slice(0,4);
    const fallback = altCity.length > 0 ? altCity : altType.length > 0 ? altType : properties.filter(p=>p.available).slice(0,4);
    const label = altCity.length > 0 ? `other properties in **${city}**` : `**${type}** properties in other cities`;
    const notes = {};
    fallback.forEach(p => { notes[p.id] = `Different from your original criteria, but worth considering.`; });
    return {
      message: `I'll be honest — I don't have an exact **${type}** in **${city}** under **${(budget/1e6).toFixed(1)}M MAD** right now. But here are ${label} that could still work for you:`,
      properties: fallback, propertyNotes: notes, readyToSearch: true,
    };
  }

  if (userCount === 0) {
    return { message: "مرحباً! Welcome to Bayit. I'm Karim, your Morocco real estate advisor.\n\nAre you looking to **buy a home to live in**, or are you more interested in **investment and rental income**? That changes where I'd start looking completely.", properties: [], propertyNotes: {}, readyToSearch: false };
  }
  if (!budget) return { message: "To point you in the right direction — what's your rough **budget range**? Even a ballpark helps (e.g. under 1M MAD, 1–3M, above 3M).", properties: [], propertyNotes: {}, readyToSearch: false };
  if (!city) return { message: `Got it. Which **city** are you drawn to? Marrakech, Casablanca, Rabat, Agadir, Fes, Tangier — or somewhere else?`, properties: [], propertyNotes: {}, readyToSearch: false };
  if (!type) return { message: `${city} — excellent choice. What **type of property** suits you best? (Apartment, Villa, Riad, Studio, House, Penthouse)`, properties: [], propertyNotes: {}, readyToSearch: false };
  return { message: "How many **bedrooms** do you need? Or should I show you what's available now?", properties: [], propertyNotes: {}, readyToSearch: false };
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const u = new URL(req.url, 'http://localhost');
  if (req.method !== 'POST' || u.pathname !== '/api/chat') {
    res.writeHead(404); res.end('Not found'); return;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  let messages;
  try { ({ messages } = JSON.parse(body)); } catch { res.writeHead(400); res.end('Bad JSON'); return; }

  const properties = await fetchProperties();
  res.setHeader('Content-Type', 'application/json');

  if (OPENAI_API_KEY?.startsWith('sk-')) {
    try {
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: buildSystemPrompt(properties) },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          response_format: { type: 'json_object' },
          max_tokens: 800,
          temperature: 0.7,
        }),
      });
      const ai = await aiRes.json();
      const raw = ai.choices?.[0]?.message?.content ?? '{}';
      let parsed;
      try { parsed = JSON.parse(raw); } catch { parsed = { message: raw }; }

      // Hydrate property objects from DB by ID
      const returnedProps = [];
      const ids = Array.isArray(parsed.propertyIds) ? parsed.propertyIds
        : Array.isArray(parsed.properties) ? parsed.properties.map(x => x?.id ?? x)
        : [];
      for (const id of ids) {
        const found = properties.find(p => String(p.id) === String(id));
        if (found) returnedProps.push(found);
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        message:       parsed.message ?? 'Let me help you find the right property.',
        properties:    returnedProps,
        propertyNotes: parsed.propertyNotes ?? {},
        readyToSearch: parsed.readyToSearch ?? returnedProps.length > 0,
      }));
      return;
    } catch (e) { console.error('[Bayit] OpenAI error:', e.message); }
  }

  const mock = mockResponse(messages, properties);
  res.writeHead(200);
  res.end(JSON.stringify(mock));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\n✅ Bayit Smart Advisor Chat — http://localhost:${PORT}/api/chat`);
  console.log(`   Advisor: Karim (GPT-4o-mini) — ${OPENAI_API_KEY ? 'LIVE' : 'mock mode'}`);
  console.log(`   Sheets:  ${SHEET_ID ? SHEET_ID : 'sample data'}\n`);
});
