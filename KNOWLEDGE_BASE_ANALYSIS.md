# Bayit Knowledge Base Analysis — Chat Improvement Recommendations

**File analysed:** `Bayit_Morocco_Knowledge_Base_Complete_v2.xlsx`
**9 tabs reviewed:** README, City_Overview, Areas, Properties, User_Personas, Intent_Library, Conversation_Style, FAQ_Objections, Prompt_Blueprint

---

## Executive Summary

The knowledge base is **very well structured** and client-ready. It contains everything needed to transform the current chat from a "smart filter" into a genuine advisory experience. The gap is almost entirely in how the knowledge is surfaced to the AI — the current system prompt uses roughly **10% of the intelligence** available in this file.

---

## Tab-by-Tab Analysis

### Tab 1 — README
**Relevance: Context only**

The README confirms the positioning: *"luxury + mid-market, with focus on Achat and Investissement."* MVP target is an advisor that feels *"premium, helpful, emotionally intelligent."* The prices are curated/synthetic starter values and should be replaced with live data before launch.

**Action:** No code change needed. The positioning statement should be referenced when writing the final system prompt — it confirms the brand direction.

---

### Tab 2 — City_Overview (6 cities)
**Relevance: HIGH — currently underused**

**What it contains:** City positioning taglines, "Best For" profiles, and 4 scored dimensions per city (Luxury, Liquidity, Airbnb Potential, Family Living — all out of 10).

| City | Positioning | Luxury | Liquidity | Airbnb | Family |
|------|-------------|--------|-----------|--------|--------|
| Marrakech | Tourism + lifestyle + premium second-home | 9 | 8 | 9 | 7 |
| Casablanca | Liquidity + corporate + premium seafront | 9 | 10 | 6 | 7 |
| Rabat | Safe capital + family/residential + executive | 8 | 8 | 4 | 10 |
| Tangier | Gateway + seafront premium + international | 8 | 8 | 7 | 7 |
| Agadir | Sunny coastal + tourism + second-home | 8 | 7 | 8 | 8 |
| Fes | Heritage + boutique tourism + practical mid-market | 6 | 6 | 7 | 7 |

**Current state:** `buildMarketContext()` only generates a price range string (min/avg/max). The qualitative city intelligence is entirely absent from the prompt.

**What to change:**
- Feed the city scores into the system prompt so the AI can compare cities based on user goals (e.g. if user says "Airbnb investment" → Marrakech 9/10, Casablanca 6/10)
- Add city positioning taglines to the prompt so the AI describes cities with personality, not just prices
- Use the "Best For" column to guide city recommendations when users haven't decided yet

---

### Tab 3 — Areas (48 areas across 6 cities)
**Relevance: HIGH — should replace current baked-in neighborhood text**

**What it contains:** 22 columns per area: Tier (Luxe/Mix/Grand Public), buy price/m², rent/m², Vibe, Target Profiles, 10 lifestyle scores (Safety, Calm, Nightlife, Prestige, Family, Youth, Airbnb, Transport, Investment, Luxury), Main Pros/Cons, Recommended_For, Avoid_If.

**Current state:** The system prompt has hand-written neighborhood descriptions for a small subset of areas. The Areas sheet has 48 areas with quantified scores and explicit `Recommended_For` / `Avoid_If` fields — none of which are in the prompt.

**What to change:**
- Generate a condensed area intelligence block from this sheet: for each area, include Tier, Vibe, top 3 scores, Recommended_For, and Avoid_If
- Most importantly: use `Avoid_If` for negative matching. If a user says "I need quiet" → filter out areas tagged `Avoid_If: you need quiet` (Gueliz, Maarif, Casablanca City, Medina, Fes Medina etc.)
- Use the Calm_10 and Safety_10 scores to rank area suggestions for families vs. investors
- The Airbnb_10 score should drive Airbnb investor recommendations — currently the AI relies only on the property type name

---

### Tab 4 — Properties (192 properties)
**Relevance: CRITICAL — match logic needs a complete rethink**

**What it contains:** 40+ columns including the standard fields (ID, Title, City, Area, Type, Price, Bedrooms, etc.) plus rich metadata: `Est_Monthly_Rent_MAD`, `Furnished`, `Condition`, `Parking`, `Elevator`, `Terrace`, `Pool`, `View`, `Target_Profile`, `Intent_Fit`, `Key_Selling_Point`, `Main_Risk`, `Gross_Yield_pct`, `Investment_Score`, `Lifestyle_Score`, `Luxury_Score`.

Properties breakdown: **192 listings** — 32 per city, covering Apartment, Riad, Villa, Penthouse, Loft, Duplex, Studio, Townhouse, Family Apartment, Luxury Apartment.

**Current state:** The `matchProperties()` function filters only on city + type + budget + bedrooms. It ignores investment score, lifestyle score, luxury score, yield, target profile, and intent fit entirely.

**What to change — this is the most impactful improvement:**

1. **Replace the current matching logic** to use `Investment_Score`, `Lifestyle_Score`, and `Luxury_Score` when the AI has identified a persona type. An Airbnb investor should see properties ranked by `Investment_Score` + `Gross_Yield_pct`, not randomly filtered.

2. **Use `Target_Profile` field** to match personas from Tab 5 directly to properties. If we detect "Airbnb investor" → filter `Target_Profile` containing "Airbnb investor". Currently this signal is ignored.

3. **Surface `Key_Selling_Point` and `Main_Risk`** in the results prompt — the AI currently only receives `description`. These fields let the AI explain *why* a property matches and flag honest trade-offs, which builds trust.

4. **Add `Gross_Yield_pct` to investment discussions** — when a user asks about investment, the AI should be able to say "this property yields ~5.8% gross" rather than just naming it.

5. **Use `View`, `Pool`, `Terrace`, `Furnished`** fields for lifestyle matching — if a user says "I want something with a sea view and terrace," the current matcher will miss properties that match those specific features.

6. **Consider syncing this Excel data to Google Sheets** (or replacing it as the primary source) — it is far richer than whatever is currently in the live sheet.

---

### Tab 5 — User_Personas (12 personas)
**Relevance: HIGH — the AI should detect and adapt to persona type**

**What it contains:** 12 buyer types with Budget_Range, Risk_Level, Lifestyle_Need, Main_Fear, Best Cities/Areas, and crucially: `What_Bot_Should_Do` and `What_Bot_Should_Avoid`.

Key personas and their specific instructions:

| Persona | Budget (MAD) | Bot Should Do | Bot Should Avoid |
|---------|-------------|---------------|------------------|
| Young urban buyer | 800K–1.6M | Clarify budget, propose central areas with realistic trade-offs | Don't push luxury too early |
| Family upgrader | 1.5M–3.5M | Prioritize safety, calm, parking, schools | Avoid nightlife-heavy recommendations |
| Luxury second-home buyer | 3.5M+ | Speak with confidence, emphasize prestige | Avoid cheap language or too many budget-first questions |
| Airbnb investor | 1M–3M | Talk in yield/tourism/positioning language | Avoid family-living-heavy framing |
| Long-term yield investor | 900K–2.5M | Compare rental demand, market depth | Avoid over-romanticizing lifestyle |
| Expat executive | 2M–4.5M | Be reassuring, polished, decisive | Avoid low-context generic replies |
| Budget first-time buyer | 500K–1.1M | Reduce overwhelm, explain trade-offs simply | Avoid elitist suggestions |
| Creative lifestyle buyer | 1M–2.2M | Use descriptive language and story | Avoid purely spreadsheet-like filtering |
| Retreat/calm seeker | 1.5M–4M | Prioritize calmness, privacy, space | Avoid nightlife-first neighborhoods |

**Current state:** The AI treats all users identically. A luxury buyer gets the same conversational approach as a first-time buyer. This is the single biggest quality gap.

**What to change:**
- Add persona detection logic to the system prompt: instruct the AI to identify which persona the user most resembles based on signals (budget range, language cues, stated goals)
- Once a persona is detected, apply the corresponding `What_Bot_Should_Do` and `What_Bot_Should_Avoid` rules
- Budget ranges per persona should anchor the AI's language choices — e.g. for a 3.5M+ buyer, never use phrases like "affordable" or "not too expensive"

---

### Tab 6 — Intent_Library (15 intent patterns)
**Relevance: HIGH — the most directly applicable tab for chat quality**

**What it contains:** 15 common user intents with: User_Message_Example, Hidden_Meaning, What_bAytI_Should_Do, Best_Follow_Up_Question, Good_Tone, and Bad_Bot_Behavior.

Examples of what's currently missing:

| Intent | Hidden Meaning | Current Bot Behavior | What Should Happen |
|--------|---------------|---------------------|-------------------|
| "Budget unclear" | User is vague and anxious | Asks for city or type | Clarify gently, anchor with ranges |
| "Emotional hesitation" | User needs reassurance | Ignores emotion, moves to specs | Normalize fear, break into criteria |
| "Luxury signal" | Buying image + feeling | Treats as feature filter | Use elevated language, focus on prestige |
| "Unrealistic ask" | Needs reframing | Shows no/limited results | Recalibrate softly, offer alternatives |
| "Need speed" | User is impatient | Asks clarifying questions | Shortlist quickly, refine after |
| "Trust test" | Testing credibility | Over-promises or hedges | Answer with nuance, not fake certainty |

The `Best_Follow_Up_Question` column is gold — these specific questions are crafted to move conversations forward naturally. None of them are in the current prompt.

**What to change:**
- Add the full Intent_Library as a section in the system prompt
- Specifically inject the `Best_Follow_Up_Question` for each intent type — this will make the chat feel significantly more intelligent and human
- Add the `Bad_Bot_Behavior` rules as explicit DON'Ts in the prompt

---

### Tab 7 — Conversation_Style (12 rules)
**Relevance: MEDIUM — refines the existing approach**

**What it contains:** 12 style rules with Good_Example and Avoid columns.

Most important rules not currently implemented:
- "Ask one strong question at a time" — current prompt says this but the AI sometimes asks multiple questions
- "Brand feel = Apple-like simplicity: clean, premium, low noise" — not in current prompt
- "Explain why, not just what" — the current results prompt only asks the AI to say WHY generally; this should be more explicit
- "Take positions when useful" — current prompt avoids this; the AI often hedges

**What to change:**
- Replace the current tone section with the explicit rules + examples from this tab
- Add the "Apple-like simplicity" brand feel instruction
- Reinforce the single-question rule with a concrete example (the "Budget? City? Rooms? Parking?" bad example is very effective)

---

### Tab 8 — FAQ_Objections (10 objections)
**Relevance: MEDIUM — adds resilience to difficult conversations**

**What it contains:** 10 common objections (fear of overpaying, "why this area," "should I buy or wait," etc.) with `Best_Response_Angle` and `Sample_Response`.

**Current state:** Not in the prompt at all. If a user says "I'm scared of overpaying" the AI has no specific guidance on how to handle it.

**What to change:**
- Add a condensed FAQ/Objections section to the system prompt with the response angles (not the full sample responses — those would bloat the prompt, but the angles are concise)
- Particularly important: the "Can I come back later?" response, which should be adjusted now that the full product will save conversations

---

### Tab 9 — Prompt_Blueprint (12 sections)
**Relevance: CRITICAL — this IS the client's intended system prompt**

**What it contains:** The client's intended prompt structure — Role, Mission, Brand feel, Main rule, What to do, What to avoid, Luxury rule, Mid-market rule, Investment rule, Family rule, Closing style, Example close.

**Current state:** The current `buildAdvisoryPrompt()` was written independently and diverges significantly. The client's Prompt_Blueprint is essentially unused.

**What to change — this is the foundation:**
- Rewrite `buildAdvisoryPrompt()` starting from the Prompt_Blueprint sections as the core structure
- Then layer in the intelligence from other tabs (personas, intents, areas) on top
- Key additions from blueprint not in current prompt:
  - "Do not behave like a form. Behave like an advisor having a fluid conversation." — this exact phrasing should be in the prompt
  - The luxury/mid-market/investment/family specific rules (these are currently just generic language cues)
  - "End strong with a recommendation or clear next-step question, not a generic 'how can I help you further?'" — the current prompt has no closing guidance

---

## Priority Order of Changes

### Priority 1 — Immediate (biggest quality uplift)

**1a. Rebuild system prompt from Prompt_Blueprint foundation**
Rewrite `buildAdvisoryPrompt()` using Tab 9 as the core structure. This immediately aligns the AI with the client's intended voice.

**1b. Add Intent_Library follow-up questions**
Inject the 15 intent patterns and their `Best_Follow_Up_Question` values into the prompt. This single change will make conversations feel dramatically more natural.

**1c. Add User_Persona detection + adaptive behaviour**
Add a personas section to the prompt that instructs the AI to identify which of the 12 personas the user resembles and then apply the corresponding `What_Bot_Should_Do` / `What_Bot_Should_Avoid` rules.

---

### Priority 2 — Short-term (improves matching quality)

**2a. Improve property matching logic**
Update `matchProperties()` to use `Investment_Score`, `Lifestyle_Score`, `Luxury_Score`, and `Target_Profile` from the Properties sheet. This requires either importing the Excel data or adding these fields to Google Sheets.

**2b. Expose `Key_Selling_Point`, `Main_Risk`, and `Gross_Yield_pct` in results prompt**
Pass these fields to `buildResultsPrompt()` so the AI can give genuine, specific property narratives rather than just generic intros.

**2c. Add Areas intelligence with Avoid_If matching**
Generate a compact area-intelligence block from Tab 3 and add it to the prompt. Implement negative matching using `Avoid_If` to filter out unsuitable areas when users give negative cues ("I need quiet," "I have young kids").

---

### Priority 3 — Polish (refinement)

**3a. Add FAQ_Objections response angles**
A short objections section in the prompt to handle the 10 common hesitations.

**3b. Add City_Overview scores for city comparison**
When a user hasn't chosen a city, the AI should be able to compare cities using the quantified scores (Airbnb potential, Family living, etc.).

**3c. Replace `buildMarketContext()` with richer city context**
Add city positioning taglines and "Best For" profiles alongside the price ranges.

---

## What Will NOT Change

The current **two-phase flow** (advisory → readyToSearch → results) is well-designed and should stay as-is. The **response format** (JSON with message + properties + readyToSearch) is also correct. The **mock fallback** logic can be simplified once the prompt improvements are in place.

---

## Important Note on Data

Per the README: *"prices, yields and scores are curated/synthetic starter values — verify and replace with live market data before public launch."*

This means the 192 Excel properties are a **starter dataset**, not production data. For MVP, they're suitable for demonstrating the AI's advisory capability. Before launch, the team should replace with verified listings and update the Google Sheets source accordingly.

---

*Analysis prepared from: Bayit_Morocco_Knowledge_Base_Complete_v2.xlsx | 9 tabs, 192 properties, 48 areas, 12 personas, 15 intent patterns*
