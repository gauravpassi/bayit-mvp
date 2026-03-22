import { NextRequest, NextResponse } from 'next/server';
import { getProperties } from '@/lib/sheets';
import type { Property } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE — sourced from Bayit_Morocco_Knowledge_Base_Complete_v2.xlsx
// ═══════════════════════════════════════════════════════════════════════════════

/** Area scores: city|area → scores + intent signals */
const AREA_SCORES: Record<string, {
  tier: string; vibe: string;
  safety: number; calm: number; nightlife: number; prestige: number;
  family: number; airbnb: number; investment: number; luxury: number;
  recommended_for: string; avoid_if: string;
}> = {
  "marrakech|gueliz":       { tier:"Mix",         vibe:"Central, trendy, walkable",             safety:7,calm:4,nightlife:8,prestige:7,family:6,airbnb:8,investment:8,luxury:6, recommended_for:"Airbnb investors, yield-focused investors",         avoid_if:"you need quiet" },
  "marrakech|hivernage":    { tier:"Luxe",        vibe:"Premium urban, polished, hotel district",safety:9,calm:6,nightlife:7,prestige:9,family:7,airbnb:8,investment:7,luxury:9, recommended_for:"premium buyers, Airbnb investors, yield-focused investors", avoid_if:"" },
  "marrakech|palmeraie":    { tier:"Luxe",        vibe:"Resort-like, green, private",           safety:9,calm:10,nightlife:3,prestige:10,family:9,airbnb:7,investment:4,luxury:10, recommended_for:"premium buyers, families, yield-focused investors", avoid_if:"you dislike car-dependency" },
  "marrakech|agdal":        { tier:"Mix",         vibe:"Residential with leisure spots",         safety:7,calm:6,nightlife:6,prestige:6,family:7,airbnb:6,investment:7,luxury:5, recommended_for:"families, couples, investors",                     avoid_if:"" },
  "marrakech|targa":        { tier:"Grand public",vibe:"Family residential, practical",          safety:7,calm:8,nightlife:3,prestige:5,family:9,airbnb:4,investment:5,luxury:4, recommended_for:"families, yield-focused investors",               avoid_if:"" },
  "marrakech|medina":       { tier:"Mix",         vibe:"Historic, cultural, touristic",          safety:6,calm:3,nightlife:7,prestige:7,family:4,airbnb:10,investment:8,luxury:6, recommended_for:"Airbnb investors, yield-focused investors",        avoid_if:"you need quiet, you dislike car-dependency, you want family-friendly surroundings" },
  "marrakech|route de casablanca": { tier:"Grand public",vibe:"Growing axis, practical",        safety:6,calm:6,nightlife:3,prestige:4,family:7,airbnb:4,investment:6,luxury:3, recommended_for:"yield-focused investors",                          avoid_if:"" },
  "marrakech|sidi ghanem":  { tier:"Mix",         vibe:"Creative, industrial-chic, emerging",   safety:6,calm:6,nightlife:5,prestige:5,family:4,airbnb:6,investment:6,luxury:4, recommended_for:"yield-focused investors",                          avoid_if:"you want family-friendly surroundings" },
  "casablanca|maarif":      { tier:"Mix",         vibe:"Business, central, active",              safety:7,calm:4,nightlife:8,prestige:7,family:6,airbnb:7,investment:8,luxury:6, recommended_for:"yield-focused investors",                          avoid_if:"you need quiet" },
  "casablanca|ain diab":    { tier:"Luxe",        vibe:"Seafront, lifestyle, premium",           safety:8,calm:6,nightlife:8,prestige:9,family:7,airbnb:9,investment:8,luxury:9, recommended_for:"premium buyers, Airbnb investors, yield-focused investors", avoid_if:"" },
  "casablanca|anfa":        { tier:"Luxe",        vibe:"Elite residential, prestigious",         safety:9,calm:8,nightlife:4,prestige:10,family:9,airbnb:6,investment:7,luxury:10, recommended_for:"premium buyers, families, yield-focused investors", avoid_if:"" },
  "casablanca|bourgogne":   { tier:"Mix",         vibe:"Urban, practical, close to sea",         safety:7,calm:5,nightlife:6,prestige:6,family:6,airbnb:6,investment:7,luxury:5, recommended_for:"yield-focused investors",                          avoid_if:"" },
  "casablanca|sidi maarouf":{ tier:"Grand public",vibe:"Corporate, practical, accessible",       safety:7,calm:6,nightlife:3,prestige:5,family:7,airbnb:4,investment:6,luxury:4, recommended_for:"yield-focused investors",                          avoid_if:"" },
  "casablanca|california":  { tier:"Luxe",        vibe:"Villa district, upper-class residential",safety:9,calm:8,nightlife:3,prestige:9,family:9,airbnb:5,investment:6,luxury:9, recommended_for:"premium buyers, families",                         avoid_if:"" },
  "casablanca|palmier":     { tier:"Mix",         vibe:"Central, polished, professional",        safety:8,calm:6,nightlife:5,prestige:7,family:7,airbnb:6,investment:7,luxury:6, recommended_for:"yield-focused investors",                          avoid_if:"" },
  "casablanca|casa finance city": { tier:"Mix",   vibe:"Modern business district",              safety:8,calm:6,nightlife:4,prestige:7,family:5,airbnb:5,investment:7,luxury:7, recommended_for:"yield-focused investors",                          avoid_if:"" },
  "rabat|agdal":            { tier:"Mix",         vibe:"Student + family, central, balanced",    safety:8,calm:6,nightlife:5,prestige:6,family:8,airbnb:5,investment:7,luxury:5, recommended_for:"families, yield-focused investors",               avoid_if:"" },
  "rabat|hay riad":         { tier:"Luxe",        vibe:"Embassy/executive, modern, safe",        safety:10,calm:8,nightlife:3,prestige:9,family:10,airbnb:4,investment:7,luxury:9, recommended_for:"premium buyers, families, yield-focused investors", avoid_if:"" },
  "rabat|souissi":          { tier:"Luxe",        vibe:"Diplomatic, villa, elite",               safety:10,calm:9,nightlife:2,prestige:10,family:9,airbnb:3,investment:5,luxury:10, recommended_for:"premium buyers, families",                       avoid_if:"" },
  "rabat|hassan":           { tier:"Mix",         vibe:"Administrative, historical, central",    safety:7,calm:6,nightlife:4,prestige:6,family:7,airbnb:5,investment:6,luxury:5, recommended_for:"professionals, families",                          avoid_if:"" },
  "rabat|ocean":            { tier:"Grand public",vibe:"Relaxed, authentic, coastal",            safety:7,calm:7,nightlife:3,prestige:5,family:8,airbnb:5,investment:5,luxury:4, recommended_for:"families, first buyers",                           avoid_if:"" },
  "rabat|yacoub el mansour":{ tier:"Grand public",vibe:"Dense, accessible, broad market",       safety:6,calm:5,nightlife:4,prestige:4,family:7,airbnb:4,investment:6,luxury:3, recommended_for:"first buyers, yield investors",                    avoid_if:"you need quiet" },
  "rabat|harhoura":         { tier:"Mix",         vibe:"Coastal, relaxed, family leisure",       safety:8,calm:8,nightlife:3,prestige:5,family:9,airbnb:5,investment:5,luxury:4, recommended_for:"families",                                         avoid_if:"" },
  "tangier|malabata":       { tier:"Luxe",        vibe:"Seafront premium, expat-friendly",       safety:8,calm:7,nightlife:5,prestige:9,family:7,airbnb:9,investment:8,luxury:9, recommended_for:"premium buyers, Airbnb investors, yield-focused investors", avoid_if:"" },
  "tangier|iberia":         { tier:"Luxe",        vibe:"Refined, residential, central",          safety:9,calm:7,nightlife:4,prestige:9,family:8,airbnb:6,investment:7,luxury:9, recommended_for:"premium buyers, families",                         avoid_if:"" },
  "tangier|city center":    { tier:"Mix",         vibe:"Central, active, convenient",            safety:6,calm:4,nightlife:7,prestige:6,family:5,airbnb:7,investment:7,luxury:5, recommended_for:"yield-focused investors",                          avoid_if:"you need quiet" },
  "tangier|marshan":        { tier:"Mix",         vibe:"Upscale heritage with views",            safety:7,calm:6,nightlife:4,prestige:7,family:6,airbnb:7,investment:7,luxury:7, recommended_for:"yield-focused investors",                          avoid_if:"" },
  "tangier|cap spartel":    { tier:"Luxe",        vibe:"Exclusive nature-coastal",               safety:9,calm:9,nightlife:2,prestige:10,family:8,airbnb:7,investment:6,luxury:10, recommended_for:"premium buyers, families",                       avoid_if:"you dislike car-dependency" },
  "agadir|founty":          { tier:"Mix",         vibe:"Tourism-driven, modern, sunny",          safety:7,calm:6,nightlife:6,prestige:6,family:7,airbnb:9,investment:8,luxury:6, recommended_for:"Airbnb investors, yield-focused investors",         avoid_if:"" },
  "agadir|marina":          { tier:"Luxe",        vibe:"Waterfront luxury",                      safety:8,calm:7,nightlife:6,prestige:9,family:7,airbnb:10,investment:9,luxury:9, recommended_for:"premium buyers, Airbnb investors, yield-focused investors", avoid_if:"" },
  "agadir|talborjt":        { tier:"Grand public",vibe:"Authentic city life",                    safety:6,calm:5,nightlife:5,prestige:4,family:6,airbnb:5,investment:5,luxury:3, recommended_for:"first buyers",                                     avoid_if:"" },
  "agadir|swiss city":      { tier:"Luxe",        vibe:"Quiet upscale residential",             safety:9,calm:9,nightlife:2,prestige:8,family:9,airbnb:5,investment:6,luxury:8, recommended_for:"premium buyers, families",                         avoid_if:"" },
  "agadir|sonaba":          { tier:"Mix",         vibe:"Beachside residential",                  safety:7,calm:7,nightlife:4,prestige:6,family:8,airbnb:7,investment:6,luxury:6, recommended_for:"families, yield-focused investors",               avoid_if:"" },
  "fes|ville nouvelle":     { tier:"Mix",         vibe:"Modern city core, practical",            safety:7,calm:6,nightlife:4,prestige:5,family:7,airbnb:5,investment:6,luxury:4, recommended_for:"families, professionals",                          avoid_if:"" },
  "fes|medina":             { tier:"Mix",         vibe:"Heritage, tourism, authentic",           safety:5,calm:3,nightlife:5,prestige:7,family:4,airbnb:10,investment:8,luxury:6, recommended_for:"Airbnb investors, yield-focused investors",         avoid_if:"you need quiet, you dislike car-dependency, you want family-friendly surroundings" },
  "fes|route d'imouzzer":   { tier:"Luxe",        vibe:"Upscale residential corridor",          safety:8,calm:7,nightlife:3,prestige:8,family:9,airbnb:4,investment:6,luxury:8, recommended_for:"families",                                         avoid_if:"" },
  "fes|batha":              { tier:"Mix",         vibe:"Heritage-adjacent tourism node",         safety:5,calm:4,nightlife:5,prestige:6,family:4,airbnb:9,investment:7,luxury:5, recommended_for:"Airbnb investors, yield-focused investors",         avoid_if:"you need quiet, you dislike car-dependency, you want family-friendly surroundings" },
};

/** City-level intelligence */
const CITY_INTEL: Record<string, { positioning: string; best_for: string; luxury: number; liquidity: number; airbnb: number; family: number }> = {
  "Marrakech": { positioning:"Tourism + lifestyle + premium second-home market",           best_for:"Luxury second homes, tourism investment, lifestyle buyers", luxury:9, liquidity:8, airbnb:9, family:7 },
  "Casablanca": { positioning:"Liquidity + corporate demand + premium seafront",           best_for:"Corporate buyers, liquidity, long-term rental investors",   luxury:9, liquidity:10, airbnb:6, family:7 },
  "Rabat":      { positioning:"Safe capital city + family/residential quality + executive demand", best_for:"Families, executives, safe primary residence",      luxury:8, liquidity:8, airbnb:4, family:10 },
  "Tangier":    { positioning:"Gateway city + seafront premium + international demand",   best_for:"Seafront premium, international buyers, mixed investment",  luxury:8, liquidity:8, airbnb:7, family:7 },
  "Agadir":     { positioning:"Sunny coastal market + tourism + second-home and yield",   best_for:"Sunny second homes, tourism and Airbnb strategies",         luxury:8, liquidity:7, airbnb:8, family:8 },
  "Fes":        { positioning:"Heritage city + boutique tourism + practical mid-market",  best_for:"Heritage/tourism plays and practical family housing",       luxury:6, liquidity:6, airbnb:7, family:7 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONA DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

type PersonaType =
  | 'luxury_buyer' | 'airbnb_investor' | 'yield_investor'
  | 'family_buyer' | 'expat_exec' | 'first_time_buyer'
  | 'creative_lifestyle' | 'young_urban' | 'retreat_seeker'
  | 'boutique_operator' | 'unknown';

function detectPersona(messages: { role: string; content: string }[]): PersonaType {
  const text = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ');
  if (text.match(/airbnb|short.?stay|tourist rental|occupancy|nightly|vacation rental/)) return 'airbnb_investor';
  if (text.match(/riad|medina|boutique|heritage|authentic property/))                     return 'boutique_operator';
  if (text.match(/yield|rental income|long.?term rent|return on investment|roi/))         return 'yield_investor';
  if (text.match(/family|kids|children|school|playground/))                               return 'family_buyer';
  if (text.match(/relocation|relocat|expat|move to morocco|moving to morocco|corporate/)) return 'expat_exec';
  if (text.match(/first.?time|first home|never bought|don.t know where to start/))        return 'first_time_buyer';
  if (text.match(/luxury|prestige|exclusive|palmeraie|high.?end|5M|4M|3\.5M/))            return 'luxury_buyer';
  if (text.match(/vibe|creative|artsy|sidi ghanem|marshan|character/))                    return 'creative_lifestyle';
  if (text.match(/retreat|private|escape|peaceful|hideaway|getaway/))                     return 'retreat_seeker';
  if (text.match(/young|professional|first apartment|modern|walkable/))                   return 'young_urban';
  return 'unknown';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER — built from Prompt_Blueprint + full knowledge base
// ═══════════════════════════════════════════════════════════════════════════════

function buildMarketContext(properties: Property[]): string {
  return Object.entries(
    properties.reduce((acc: Record<string, number[]>, p) => {
      if (!acc[p.city]) acc[p.city] = [];
      acc[p.city].push(p.price);
      return acc;
    }, {})
  ).map(([city, prices]) => {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const intel = CITY_INTEL[city];
    const ctx = intel ? ` | ${intel.positioning}` : '';
    return `${city}: ${(min/1e6).toFixed(1)}M–${(max/1e6).toFixed(1)}M MAD (avg ${(avg/1e6).toFixed(1)}M)${ctx}`;
  }).join('\n');
}

function buildAdvisoryPrompt(properties: Property[]): string {
  return `You are bAytI, a premium Moroccan real-estate advisor built for Bayit. You are not a generic chatbot and not a human agent with a fake personal name.

## MISSION
Guide users toward the right property decision with a balance of emotional intelligence, market logic, neighborhood understanding and product clarity. Do not behave like a form. Behave like an advisor having a fluid conversation.

## PERSONALITY & TONE
You are like a brilliant friend who happens to know Morocco's property market inside out. Not a stiff advisor, not a salesperson — a smart, warm, occasionally funny person who tells it straight. Think of how a knowledgeable friend talks: direct, a little playful at times, genuinely caring, never corporate.

**Emotional mirroring — this is important:**
- If the user is nervous or anxious (😩😅🙈), acknowledge it warmly before moving on: "That hesitation makes complete sense — buying property is a big deal."
- If the user is excited, match that energy: "Okay yes, Fes does that to people. It's hard not to fall for it."
- If the user is self-deprecating or funny, it's fine to be lightly funny back. Real people do that.
- If someone sends 😂 or 😅, don't respond like a bank. Loosen up a little.

**Humor — light, tasteful, occasional:**
- Use it naturally when the moment calls for it, not as a performance
- Good: "Let's avoid the classic mistake of falling in love with the wrong neighborhood 😄"
- Good: "A riad for the aesthetic? Honestly, worse reasons to buy property have been given 😄"
- Good: "Marrakech vs Tangier — the eternal debate. Let me settle it for you."
- Never: forced jokes, puns, or anything that sounds like a chatbot trying to be funny
- Never: humor when someone is clearly anxious or worried — read the room

**Emoji — light and selective:**
- Use 1–2 per message max, only when they add warmth or emphasis
- Good fits: 😄 👌 ✓ 🏡 → (for direction/flow)
- Avoid: 🔥💯🚀 — too casual and cheap for a premium brand
- Don't use emoji at all when discussing serious concerns, fears, or objections

## CORE RULES
- Interpret vague language. Ask ONE strong follow-up at a time, woven naturally into your reply
- Give real, specific recommendations with genuine reasoning — name areas, explain WHY they suit what the user described
- Take positions when useful: "Honestly, for your case, Hay Riad is the safer bet — here's why."
- Use rhetorical questions to guide reflection: "What's the point of a prestige address if the daily commute makes you miserable?"
- When someone hesitates: acknowledge the feeling first, then help them through it
- Keep messages 2–4 sentences. Conversational, warm, confident. No bullet lists
- End strong: a recommendation or a clear next-step question — not "how can I help you further?"

## PERSONA-BASED ADAPTATION
Identify the user type from their language and adapt accordingly:

**Luxury second-home buyer** (3.5M+ MAD) — speak with confidence, emphasize prestige and experience. AVOID cheap language or too many budget questions. Use: quiet prestige, refined, polished, well-positioned, exclusive
**Airbnb investor** (1M–3M MAD) — talk in yield/tourism/occupancy language. AVOID family-living framing. Always mention tourism demand and positioning
**Long-term yield investor** (900K–2.5M MAD) — compare rental demand and market depth. AVOID romanticizing lifestyle only. Mention liquidity and gross yield
**Family buyer** (1.5M–3.5M MAD) — prioritize safety, calm, schools, access, parking. AVOID nightlife-heavy areas. Use safety and calm scores
**Expat executive** (2M–4.5M MAD) — be reassuring, polished, decisive. AVOID generic replies. They value security, quality, ease
**First-time buyer** (500K–1.1M MAD) — reduce overwhelm, explain trade-offs simply. AVOID elitist suggestions. Guide in steps
**Young urban buyer** (800K–1.6M MAD) — propose central areas with realistic trade-offs. AVOID pushing luxury too early
**Creative/lifestyle buyer** (1M–2.2M MAD) — use descriptive, evocative language. AVOID purely spreadsheet-like filtering
**Retreat/calm seeker** (1.5M–4M MAD) — prioritize calmness, privacy, space. AVOID nightlife-first neighborhoods
**Boutique riad operator** (1.5M–5M MAD) — talk about story, guest appeal and operational reality. AVOID pretending hospitality is passive income

## DOMAIN RULES
**For luxury buyers:** refined, quiet prestige, polished, well-positioned, premium, exclusive
**For mid-market buyers:** strong value, balanced move, good long-term logic, less compromise
**For investment:** always clarify — Airbnb yield, long-term rental, capital appreciation, or hybrid?
**For families:** calmness, safety, schools, access, parking, long-term practicality

## INTENT RECOGNITION — WHAT USERS REALLY MEAN
When you detect these signals, use the follow-up question shown and avoid the bad behavior:

**Budget unclear** ("not too expensive") → User is vague/anxious. Anchor gently. ASK: "When you say not too expensive, are you thinking under 1M MAD, around 1.5M, or higher?"
**Location confusion** ("not sure where") → User needs guidance, not filters. Propose 2–3 areas. ASK: "Would you rather be somewhere calm, central, or better for investment?"
**Investment doubt** ("good investment") → User wants certainty and signal. ASK: "Are you aiming for Airbnb returns, long-term rental, or future resale upside?"
**Emotional hesitation** ("scared of choosing wrong") → Normalize the fear. ASK: "Totally fair — is your main concern safety, resale value, or daily quality of life?"
**Mixed objective** ("maybe I'd live there later too") → Balance lifestyle + investment. ASK: "Then we should optimize for both — do you want stronger yield now or stronger livability?"
**Luxury signal** ("I want something premium") → User buys image and feeling. Use elevated language. ASK: "Do you want privacy and exclusivity, or premium city living with more convenience?"
**Unrealistic ask** (luxury villa, low budget) → Recalibrate softly. SAY: "At that budget, the strongest move may be a premium apartment or a better-positioned area — want me to show both?"
**Need comparison** ("which one is better?") → Take a stance. SAY: "If your priority is long-term value, I'd lean toward option A. If lifestyle matters more, option B wins. Want the breakdown?"
**Need speed** ("just show me the best") → Shortlist quickly, then refine. ASK: "Should I optimize for value, prestige, or investment return first?"
**Family concern** ("good for kids") → Re-rank for family signals. ASK: "Then I'll prioritize calm, schools, access and safety. Do you also need parking and elevator?"
**Airbnb goal** → Focus on tourism zones and occupancy logic. ASK: "Do you prefer strong occupancy or a more premium nightly rate?"
**First-time buyer** → Reduce complexity. ASK: "What matters most: budget safety, location quality, or future value?"
**Trust test** ("are you sure?") → Nuance, not fake certainty. SAY: "It can be a very good move if your time horizon and target tenant profile match this area. Want me to stress-test it with you?"

## HANDLING OBJECTIONS
**"Scared of overpaying"** → Reframe around fit + comparables + horizon
**"Why this area and not another?"** → Compare priorities explicitly — what this area offers for their specific mix
**"Is this good for investment?"** → Tie to strategy, not generic yes/no
**"Should I buy or keep waiting?"** → Create a decision framework based on their priorities
**"This feels expensive"** → Anchor to value tiers: "the question is whether you're paying for real quality or just a fashionable address"
**"What if I choose the wrong neighborhood?"** → Make it criteria-based, not emotional

## CITY INTELLIGENCE (use when helping choose a city)
${Object.entries(CITY_INTEL).map(([city, c]) =>
  `**${city}** — ${c.positioning}\n  Best for: ${c.best_for}\n  Scores (out of 10): Luxury:${c.luxury} Liquidity:${c.liquidity} Airbnb:${c.airbnb} Family:${c.family}`
).join('\n\n')}

## NEIGHBORHOOD INTELLIGENCE
Use area vibes and scores to match neighborhoods to user goals. Respect AVOID IF signals — if a user says "I need quiet," do not recommend areas flagged for that.

**Marrakech:**
- Gueliz [Mix] — Central, trendy, walkable. Airbnb:8 Investment:8 Calm:4. AVOID IF: need quiet
- Hivernage [Luxe] — Premium urban, polished. Luxury:9 Prestige:9. Best for premium buyers and Airbnb
- Palmeraie [Luxe] — Resort-like, green, private. Luxury:10 Calm:10. AVOID IF: dislike car-dependency
- Agdal [Mix] — Residential with leisure. Family:7. Good for families and couples
- Medina [Mix] — Historic, cultural, touristic. Airbnb:10. AVOID IF: need quiet, family-friendly surroundings
- Sidi Ghanem [Mix] — Creative, industrial-chic. Good for creative lifestyle buyers

**Casablanca:**
- Maarif [Mix] — Business, central, active. Investment:8. AVOID IF: need quiet
- Ain Diab [Luxe] — Seafront, lifestyle, premium. Airbnb:9 Luxury:9. Great for Airbnb and premium
- Anfa [Luxe] — Elite residential. Luxury:10 Safety:9 Family:9. Best premium residential
- California [Luxe] — Villa district, upper-class. Luxury:9 Family:9

**Rabat:**
- Hay Riad [Luxe] — Embassy/executive, modern, ultra-safe. Safety:10 Family:10. Best for families and executives
- Souissi [Luxe] — Diplomatic, villa, elite. Calm:9 Luxury:10. Top-tier quiet residential
- Agdal [Mix] — Student + family, central, balanced. Good value family area
- Harhoura [Mix] — Coastal, relaxed. Family:9 Calm:8

**Tangier:**
- Malabata [Luxe] — Seafront premium, expat-friendly. Airbnb:9 Luxury:9
- Iberia [Luxe] — Refined, residential, central. Prestige:9 Safety:9
- Cap Spartel [Luxe] — Exclusive nature-coastal. Luxury:10 Calm:9. AVOID IF: dislike car-dependency

**Agadir:**
- Marina [Luxe] — Waterfront luxury. Airbnb:10 Investment:9. Top Airbnb and investment zone
- Founty [Mix] — Tourism-driven, modern, sunny. Airbnb:9. Strong investment
- Swiss City [Luxe] — Quiet upscale residential. Family:9 Calm:9

**Fes:**
- Medina [Mix] — Heritage, tourism. Airbnb:10. AVOID IF: need quiet, family-friendly
- Batha [Mix] — Heritage-adjacent tourism. Airbnb:9
- Route d'Imouzzer [Luxe] — Upscale residential. Family:9

## QUALITATIVE LANGUAGE TRANSLATION
"modern / contemporary" → Gueliz (Marrakech), Maarif/Anfa (Casablanca), Agdal (Rabat)
"calm / quiet / peaceful" → Palmeraie, Hivernage (Marrakech), Anfa (Casablanca), Hay Riad/Souissi (Rabat), Cap Spartel (Tangier), Swiss City (Agadir)
"authentic / traditional / Moroccan character" → Medina, Riad — Marrakech and Fes
"for investment / yield" → ask if Airbnb, long-term rental, or resale
"for a family" → Hay Riad (Rabat), Palmeraie/Agdal (Marrakech), Anfa/California (Casablanca), Swiss City (Agadir)
"luxury / premium" → Palmeraie, Hivernage (Marrakech), Anfa, Ain Diab (Casablanca), Hay Riad, Souissi (Rabat)
"seafront / ocean" → Ain Diab (Casablanca), Malabata/Cap Spartel (Tangier), Marina/Sonaba (Agadir)
"creative / vibe" → Sidi Ghanem (Marrakech), Marshan (Tangier), Medina (Fes)

## WHEN TO SHOW PROPERTIES
City + rough budget = enough to search. Or strong qualitative cues + budget direction. When ready, set readyToSearch:true and explain WHY these fit. If asked about shown properties, answer with full detail — their neighborhood, lifestyle, why it suits the user. Stay specific to what was shown.

## LIVE MARKET CONTEXT
${buildMarketContext(properties)}

---

## VOICE — READ THIS LAST, RIGHT BEFORE YOU WRITE

You are NOT a corporate advisor. You are the smartest, most knowledgeable friend someone could have for buying property in Morocco. Here is exactly how that sounds:

**When someone is nervous:**
User: "I'm terrified of making the wrong choice 😩"
bAytI: "That feeling is completely normal — honestly, anyone who isn't a little scared probably isn't thinking hard enough about it 😄 Let's make this less scary. What's the thing you're most worried about — the area, the price, or just the whole process?"

**When someone asks a vague question:**
User: "I want something nice, not too expensive, modern vibe"
bAytI: "Okay, 'nice and modern' I can work with 👌 In Morocco that usually points me toward a couple of very different directions depending on the city. Are you drawn more to Casablanca's urban energy or Marrakech's lifestyle feel?"

**When someone is excited about a place:**
User: "I fell in love with Fes when I visited — it felt like another world!"
bAytI: "Fes does that to people — it's genuinely hard not to fall for it. The real question is whether you want to live inside that magic (medina riad) or nearby with a bit more comfort. What's pulling you more?"

**When someone asks something obvious or funny:**
User: "Is it weird to buy a riad just because I'm obsessed with the aesthetic? 😅"
bAytI: "Honestly? Worse reasons to buy property exist 😄 The aesthetic is real — but let's also make sure the numbers work so you're not just buying a beautiful headache. Riads can be brilliant investments if positioned right."

**When someone needs a direct answer:**
User: "Just tell me — Marrakech or Tangier?"
bAytI: "Marrakech, if I had to pick for most people. More liquidity, stronger tourism demand, and the lifestyle is genuinely hard to match. Tangier is rising fast but still a bit early-stage. What's your main goal — lifestyle, investment, or both?"

**VOICE CHECKLIST — before you write your message, ask:**
- Does this sound like something a real smart friend would say?
- Or does it sound like a bank email / customer service bot?
- Is there at least some warmth and personality in here?
- If the user used 😅 or 😂, did I loosen up to match?

If it reads like a report — rewrite it.

## RESPONSE FORMAT — return ONLY valid JSON:
{"message": "your conversational response", "properties": [], "readyToSearch": false}
- message must ALWAYS contain your actual response — never empty
- properties must be [] during advisory (readyToSearch: false)
- readyToSearch: true only when ready to surface specific properties`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS PROMPT — persona-aware, area-enriched
// ═══════════════════════════════════════════════════════════════════════════════

function buildResultsPrompt(
  _properties: Property[],
  matchedProperties: Property[],
  persona: PersonaType
): string {
  const personaContext: Record<PersonaType, string> = {
    luxury_buyer:      'This is a luxury buyer. Lead with prestige, exclusivity, and lifestyle. Use elevated restrained language.',
    airbnb_investor:   'This is an Airbnb investor. Lead with yield, occupancy potential, and tourism demand.',
    yield_investor:    'This is a yield investor. Lead with rental income potential, market depth, and liquidity.',
    family_buyer:      'This is a family buyer. Lead with safety, calm, schools, and long-term practicality.',
    expat_exec:        'This is an expat executive. Be polished, decisive, reassuring. Focus on quality and ease of daily life.',
    first_time_buyer:  'This is a first-time buyer. Be clear, simple, encouraging. Reduce overwhelm.',
    creative_lifestyle:'This is a creative/lifestyle buyer. Use descriptive, evocative language. Sell the story and feel.',
    young_urban:       'This is a young urban buyer. Be direct about trade-offs. Central, modern, practical.',
    retreat_seeker:    'This is a retreat seeker. Lead with calmness, privacy, and beauty.',
    boutique_operator: 'This is a boutique/riad operator. Talk about character, guest appeal, and operational reality.',
    unknown:           'Read their tone from the conversation and match it — warm, helpful, specific.',
  };

  const enrichedProperties = matchedProperties.map(p => {
    const areaKey = `${p.city?.toLowerCase()}|${p.neighborhood?.toLowerCase()}`;
    const area = AREA_SCORES[areaKey];
    return {
      id: p.id, title: p.title, description: p.description,
      price: p.price, city: p.city, neighborhood: p.neighborhood,
      type: p.type, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
      areaSqm: p.areaSqm, features: p.features,
      imageUrl: p.imageUrl, lat: p.lat, lng: p.lng,
      // Area intelligence context
      areaVibe: area?.vibe ?? null,
      areaTier: area?.tier ?? null,
      areaAirbnbScore: area?.airbnb ?? null,
      areaInvestmentScore: area?.investment ?? null,
      areaFamilyScore: area?.family ?? null,
      areaCalmScore: area?.calm ?? null,
      areaLuxuryScore: area?.luxury ?? null,
    };
  });

  return `You are bAytI, a premium Moroccan real-estate advisor. You're presenting properties to a client.

## CLIENT CONTEXT
${personaContext[persona]}

## YOUR TASK
Introduce these properties naturally — not as a list, but as a thoughtful advisor sharing options.
- Explain in 1–2 sentences WHY each matches what the client described
- Reference the area's character and how it fits their lifestyle or investment goal
- If one stands out, say so and give a specific reason
- Use elegant but accessible language — no bullet points, no generic phrases
- Keep your intro message to 3–4 sentences. Warm, direct, conversational.

## MATCHED PROPERTIES (with area intelligence)
${JSON.stringify(enrichedProperties, null, 2)}

## RESPONSE — return ONLY valid JSON:
{"message": "your natural intro and why these fit", "properties": [{"id": "1"}, {"id": "2"}], "readyToSearch": true}
- message must explain the WHY, not just announce the properties
- properties array must contain IDs from the database above only
- readyToSearch must be true`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRITERIA EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

interface ConversationCriteria {
  budget:              number | null;
  city:                string | null;
  type:                Property['type'] | null;
  bedrooms:            number | null;
  intent:              'airbnb' | 'investment' | 'family' | 'luxury' | 'general';
  wantsQuiet:          boolean;
  wantsFamilyFriendly: boolean;
  wantsSeaView:        boolean;
}

function extractCriteria(messages: { role: string; content: string }[]): ConversationCriteria {
  const userText = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ');

  // Budget
  let budget: number | null = null;
  const budgetPatterns = [
    /(\d+(?:\.\d+)?)\s*m(?:illion)?\s*(?:mad|dh|dirham)?/i,
    /(\d[\d\s,]*)\s*(?:mad|dh|dirham)/i,
    /budget[^\d]*(\d[\d,\s]*)/i,
    /under[^\d]*(\d[\d,\s]*)/i,
    /max(?:imum)?[^\d]*(\d[\d,\s]*)/i,
  ];
  for (const re of budgetPatterns) {
    const m = userText.match(re);
    if (m) {
      let val = parseFloat(m[1].replace(/[\s,]/g, ''));
      if (val < 1000) val = val * 1_000_000;
      budget = val;
      break;
    }
  }

  // City
  const cityMap: Record<string, string> = {
    marrakech: 'Marrakech', casablanca: 'Casablanca', casa: 'Casablanca',
    rabat: 'Rabat', agadir: 'Agadir', fes: 'Fes', fez: 'Fes',
    tangier: 'Tangier', tanger: 'Tangier',
  };
  let city: string | null = null;
  for (const [key, val] of Object.entries(cityMap)) {
    if (userText.includes(key)) { city = val; break; }
  }

  // Property type
  const typeMap: Record<string, Property['type']> = {
    apartment: 'Apartment', flat: 'Apartment',
    villa: 'Villa', riad: 'Riad', studio: 'Studio',
    penthouse: 'Penthouse', house: 'House', dar: 'House',
  };
  const naturalTypeMap: Record<string, Property['type']> = {
    authentic: 'Riad', traditional: 'Riad', 'moroccan style': 'Riad',
    medina: 'Riad', courtyard: 'Riad', historic: 'Riad',
    modern: 'Apartment', contemporary: 'Apartment', gueliz: 'Apartment',
    garden: 'Villa', spacious: 'Villa',
    palmeraie: 'Villa', private: 'Villa',
  };
  let type: Property['type'] | null = null;
  for (const [key, val] of Object.entries(typeMap)) {
    if (userText.includes(key)) { type = val; break; }
  }
  if (!type) {
    for (const [key, val] of Object.entries(naturalTypeMap)) {
      if (userText.includes(key)) { type = val; break; }
    }
  }

  // Bedrooms
  let bedrooms: number | null = null;
  const bedMatch = userText.match(/(\d)\s*(?:bed(?:room)?s?|chambre)/i);
  if (bedMatch) bedrooms = parseInt(bedMatch[1], 10);

  // Intent
  const isAirbnb = /airbnb|short.?stay|tourist rental|vacation rental/.test(userText);
  const isInvest = /invest|yield|return|rental income|long.?term rent/.test(userText);
  const isFamily = /family|kids|children|school|calm|quiet|safe/.test(userText);
  const isLuxury = /luxury|premium|prestige|villa|palmeraie|exclusive|5M|4M|3\.5M/.test(userText);
  const intent = isAirbnb ? 'airbnb' : isLuxury ? 'luxury' : isFamily ? 'family' : isInvest ? 'investment' : 'general';

  const wantsQuiet          = /quiet|calm|peaceful|silent|no noise|tranquil/.test(userText);
  const wantsFamilyFriendly = /family.?friendly|kids|children|school/.test(userText);
  const wantsSeaView        = /sea view|ocean view|seafront|waterfront|beachfront/.test(userText);

  return { budget, city, type, bedrooms, intent, wantsQuiet, wantsFamilyFriendly, wantsSeaView };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMART PROPERTY SCORING — area-score-aware + intent-based ranking
// ═══════════════════════════════════════════════════════════════════════════════

function scoreProperty(p: Property, criteria: ConversationCriteria): number {
  const areaKey = `${p.city?.toLowerCase()}|${p.neighborhood?.toLowerCase()}`;
  const area = AREA_SCORES[areaKey];
  let score = 0;

  if (area) {
    // Intent-based scoring
    if (criteria.intent === 'airbnb')     score += area.airbnb * 3;
    if (criteria.intent === 'investment') score += area.investment * 3;
    if (criteria.intent === 'family')     score += area.family * 3 + area.safety * 2;
    if (criteria.intent === 'luxury')     score += area.luxury * 3 + area.prestige * 2;
    if (criteria.intent === 'general')    score += area.investment * 2 + area.family;

    // Negative matching — penalise areas flagged as unsuitable for user's stated needs
    if (criteria.wantsQuiet          && area.avoid_if.includes('need quiet'))      score -= 25;
    if (criteria.wantsFamilyFriendly && area.avoid_if.includes('family'))          score -= 25;

    // Tier bonus
    if (criteria.intent === 'luxury' && area.tier === 'Luxe')        score += 10;
    if (criteria.intent === 'airbnb' && area.tier !== 'Grand public') score += 5;
  }

  return score;
}

function matchProperties(properties: Property[], criteria: ConversationCriteria): Property[] {
  const filtered = properties.filter(p => {
    if (!p.available) return false;
    if (criteria.city && p.city.toLowerCase() !== criteria.city.toLowerCase()) return false;
    if (criteria.type && p.type !== criteria.type) return false;
    if (criteria.budget && p.price > criteria.budget * 1.2) return false;
    if (criteria.bedrooms != null && criteria.bedrooms > 0 && p.bedrooms < criteria.bedrooms) return false;
    return true;
  });

  // Score and rank by intent + area suitability
  const scored = filtered.map(p => ({ p, score: scoreProperty(p, criteria) }));
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map(s => s.p);
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPENAI CALL
// ═══════════════════════════════════════════════════════════════════════════════

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<{ message: string; properties: { id?: string }[]; readyToSearch: boolean } | null> {
  const modelsToTry = [
    process.env.OPENAI_MODEL,
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-4o',
  ].filter(Boolean) as string[];
  const seen = new Set<string>();
  const uniqueModels = modelsToTry.filter(m => { if (seen.has(m)) return false; seen.add(m); return true; });

  for (const model of uniqueModels) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
        response_format: { type: 'json_object' },
        max_tokens: 700,
        temperature: 0.88,
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      let parsed: { message?: string; properties?: { id?: string }[]; readyToSearch?: boolean };
      try { parsed = JSON.parse(raw); } catch { parsed = {}; }

      const msg = parsed.message?.trim() ?? '';
      if (!msg) {
        console.warn(`[bAytI] ${model} returned empty message — trying next`);
        continue;
      }

      console.log(`[bAytI] OK (${model}) — "${msg.slice(0, 60)}..."`);
      return {
        message:       msg,
        properties:    Array.isArray(parsed.properties) ? parsed.properties : [],
        readyToSearch: parsed.readyToSearch ?? false,
      };
    } catch (err) {
      console.warn(`[bAytI] ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

function mockConversationalResponse(
  messages: { role: string; content: string }[],
  properties: Property[],
): { message: string; properties: Property[]; readyToSearch: boolean } {
  const criteria = extractCriteria(messages);
  const { budget, city, type } = criteria;
  const userCount = messages.filter(m => m.role === 'user').length;

  if (city && budget) {
    const matches = matchProperties(properties, criteria);
    const toShow = matches.length > 0 ? matches : properties.filter(p => p.available && p.city === city).slice(0, 4);
    if (toShow.length > 0) {
      return { message: `Based on what you've shared, here are some options in ${city} that fit well. The first one in particular stands out given your priorities.`, properties: toShow, readyToSearch: true };
    }
  }

  if (!city) {
    if (userCount <= 1) return { message: `Welcome to bAytI — I'll help you find the right property in Morocco. Which city are you considering, or would you like me to help you choose?`, properties: [], readyToSearch: false };
    return { message: `Which city in Morocco are you drawn to? Marrakech, Casablanca, Rabat, Agadir, Tangier, and Fes each have a very different character — happy to compare if that helps.`, properties: [], readyToSearch: false };
  }

  if (!budget) {
    const cityAdvice: Record<string, string> = {
      'Marrakech':  `Marrakech has a wide range — riads in the medina from around 1.5M MAD, modern apartments in Gueliz from 800K. What budget are you working with?`,
      'Casablanca': `In Casablanca, solid apartments in Maarif start around 800K MAD, with Anfa options from 2M+. What's your rough range?`,
      'Rabat':      `Rabat is a stable, excellent-value market — good apartments in Agdal from around 700K MAD. What budget are you thinking?`,
      'Agadir':     `Agadir has great value, especially near the sea — apartments from 600K MAD, villas from 2M. What range suits you?`,
      'Tangier':    `Tangier is rising fast — seafront apartments in Malabata from around 1.2M MAD. What's your budget?`,
      'Fes':        `Fes offers excellent value for riads and apartments — from around 500K MAD. What are you working with?`,
    };
    return { message: cityAdvice[city] ?? `${city} is a great choice. What's your rough budget in MAD?`, properties: [], readyToSearch: false };
  }

  const matches = matchProperties(properties, criteria);
  if (matches.length > 0) {
    return { message: `Here are some ${type ?? 'property'} options in ${city} that fit your criteria — I think these will work well.`, properties: matches, readyToSearch: true };
  }

  const fallback = properties.filter(p => p.available && p.city === city).slice(0, 3);
  return {
    message: `I don't have an exact match right now in ${city} at that range, but let me show you the strongest available options — some of these may still work.`,
    properties: fallback.length > 0 ? fallback : properties.filter(p => p.available).slice(0, 3),
    readyToSearch: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: { role: string; content: string }[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const properties = await getProperties();
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const persona = detectPersona(messages);

    console.log(`[bAytI] Detected persona: ${persona}`);

    if (apiKey?.startsWith('sk-')) {
      const advisoryPrompt = buildAdvisoryPrompt(properties);
      const result = await callOpenAI(apiKey, advisoryPrompt, messages);

      if (result) {
        if (result.readyToSearch) {
          const criteria   = extractCriteria(messages);
          const matched    = matchProperties(properties, criteria);
          const toShow     = matched.length > 0 ? matched : properties.filter(p => p.available).slice(0, 4);
          const resultsPrompt  = buildResultsPrompt(properties, toShow, persona);
          const resultsResult  = await callOpenAI(apiKey, resultsPrompt, messages);

          if (resultsResult) {
            const returnedProps: Property[] = [];
            for (const item of resultsResult.properties) {
              if (item?.id) {
                const found = properties.find(p => String(p.id) === String(item.id));
                if (found) returnedProps.push(found);
              }
            }
            const finalProps = returnedProps.length > 0 ? returnedProps : toShow;
            return NextResponse.json({ message: resultsResult.message, properties: finalProps, readyToSearch: true });
          }
          return NextResponse.json({ message: result.message, properties: toShow, readyToSearch: true });
        }
        return NextResponse.json({ message: result.message, properties: [], readyToSearch: false });
      }
    }

    const mock = mockConversationalResponse(messages, properties);
    return NextResponse.json(mock);

  } catch (err) {
    console.error('[bAytI] Chat route error:', err);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.', properties: [], readyToSearch: false },
      { status: 500 }
    );
  }
}
