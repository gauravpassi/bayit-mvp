/**
 * Bayit Combined Server
 * - Handles POST /api/chat (Karim AI advisor)
 * - Proxies everything else to Next.js production (port 3003)
 * - Single port 3002 exposed publicly
 */
import http, { createServer } from 'http';
import { readFileSync } from 'fs';
import { URL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

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
      process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  } catch {}
}
loadEnv();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL   = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SHEET_ID       = process.env.GOOGLE_SHEET_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const NEXT_PORT      = 3003;
const PUBLIC_PORT    = 3002;

// ── Property cache ────────────────────────────────────────────────────────────
let _props = null, _propsTime = 0;

function rowToProperty(row) {
  try {
    const [id,title,description,price,city,neighborhood,type,bedrooms,bathrooms,areaSqm,imageUrl,lat,lng,features,available] = row;
    if (!id || !title) return null;
    return { id:id.trim(), title:title.trim(), description:description?.trim()??'', price:parseFloat(price)||0, city:city?.trim()??'', neighborhood:neighborhood?.trim()??'', type:type?.trim()??'Apartment', bedrooms:parseInt(bedrooms,10)||0, bathrooms:parseInt(bathrooms,10)||0, areaSqm:parseFloat(areaSqm)||0, imageUrl:imageUrl?.trim()??'', lat:parseFloat(lat)||0, lng:parseFloat(lng)||0, features:features?features.split(',').map(f=>f.trim()).filter(Boolean):[], available:available?.trim().toUpperCase()==='TRUE' };
  } catch { return null; }
}

async function getProperties() {
  if (_props && Date.now()-_propsTime < 60000) return _props;
  if (SHEET_ID && GOOGLE_API_KEY) {
    try {
      const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Properties!A2:O?key=${GOOGLE_API_KEY}`);
      if (r.ok) { const d=await r.json(); const p=(d.values??[]).map(rowToProperty).filter(Boolean); if(p.length){_props=p;_propsTime=Date.now();console.log(`[Bayit] ${p.length} properties from Sheets`);return p;} }
    } catch(e){console.error('Sheets:',e.message);}
  }
  _props=FALLBACK; _propsTime=Date.now(); return FALLBACK;
}

const FALLBACK = [
  {id:'1',title:'Luxury Riad in the Medina',description:'5-bedroom riad with rooftop terrace and zellige tilework',price:4500000,city:'Marrakech',neighborhood:'Medina',type:'Riad',bedrooms:5,bathrooms:4,areaSqm:320,imageUrl:'https://images.unsplash.com/photo-1539437829697-1b4ed9032be3?w=800',lat:31.6295,lng:-7.9811,features:['Pool','Rooftop','AC','WiFi','Parking'],available:true},
  {id:'2',title:'Modern Apartment in Gueliz',description:'Bright 2-bedroom apartment with city views',price:950000,city:'Marrakech',neighborhood:'Gueliz',type:'Apartment',bedrooms:2,bathrooms:1,areaSqm:85,imageUrl:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',lat:31.6317,lng:-8.0083,features:['AC','WiFi','Balcony','Security'],available:true},
  {id:'3',title:'Sea-View Villa in Agadir',description:'4-bedroom villa with Atlantic Ocean views',price:3200000,city:'Agadir',neighborhood:'Founty',type:'Villa',bedrooms:4,bathrooms:3,areaSqm:280,imageUrl:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',lat:30.4278,lng:-9.5981,features:['Pool','Garden','AC','WiFi','Garage'],available:true},
  {id:'6',title:'Penthouse in Casablanca Maarif',description:'3-bedroom penthouse with terrace',price:5500000,city:'Casablanca',neighborhood:'Maarif',type:'Apartment',bedrooms:3,bathrooms:3,areaSqm:210,imageUrl:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',lat:33.5731,lng:-7.5898,features:['Terrace','AC','WiFi','Gym'],available:true},
];

// ── System prompt ─────────────────────────────────────────────────────────────
function buildPrompt(properties) {
  const mkt = {};
  properties.forEach(p=>{if(!mkt[p.city])mkt[p.city]=[];mkt[p.city].push(p.price);});
  const marketCtx = Object.entries(mkt).map(([c,ps])=>`${c}: min ${(Math.min(...ps)/1e6).toFixed(1)}M, avg ${(ps.reduce((a,b)=>a+b,0)/ps.length/1e6).toFixed(1)}M, max ${(Math.max(...ps)/1e6).toFixed(1)}M MAD`).join('\n');
  const db = JSON.stringify(properties.map(p=>({id:p.id,title:p.title,description:p.description,price:p.price,city:p.city,neighborhood:p.neighborhood,type:p.type,bedrooms:p.bedrooms,bathrooms:p.bathrooms,areaSqm:p.areaSqm,features:p.features,imageUrl:p.imageUrl,lat:p.lat,lng:p.lng,available:p.available})),null,2);

  return `You are Karim, a senior Moroccan real estate advisor with 12 years of experience. You help users find properties through natural, intelligent conversation — not a fixed questionnaire.

## PERSONALITY
Warm, direct, knowledgeable. Give real opinions. Speak like a trusted friend who knows the Moroccan market deeply. Keep messages short (2-3 sentences max). Never ask more than one question at a time.

## CORE MISSION
Understand what the user REALLY needs:
1. Buy to LIVE or INVEST? (changes everything)
2. Lifestyle? (family, beach, city buzz, culture, quiet)
3. Fears or hesitations? (budget, unfamiliar market, renovation risk)
4. Are they realistic about budget for the area?

## BEHAVIOR
- VAGUE request ("something nice, not too expensive"): reflect back warmly, ask ONE clarifying question. E.g. "When you say not too expensive — are you thinking under 1M MAD or 1-3M range?"
- HESITANT: name the hesitation gently, reassure with market context
- UNREALISTIC budget: be honest but kind. "Villas in Marrakech start around 2.5M MAD. At your budget here's what IS possible..."
- INVEST intent: focus on rental yield, Airbnb potential, management ease
- ENOUGH CRITERIA (budget + city + type known): IMMEDIATELY show results. Do not keep asking questions.
- After results: give opinions, highlight best match, mention tradeoffs

## MARKET CONTEXT
${marketCtx}

## RESPONSE — valid JSON only:
{
  "message": "2-3 sentences max. **bold** key terms.",
  "propertyIds": [],
  "propertyNotes": {},
  "readyToSearch": false
}

- "propertyIds": max 4 ID strings from DB when showing results (e.g. ["1","10"])
- "propertyNotes": {"id": "1-sentence advisor note"} for each returned property
- "readyToSearch": true when propertyIds is non-empty
- ONLY use IDs from the database below. Never fabricate.
- When you have budget+city+type: IMMEDIATELY populate propertyIds.

## DATABASE
${db}`;
}

// ── Chat handler ──────────────────────────────────────────────────────────────
function extractCriteria(messages) {
  const text = messages.filter(m=>m.role==='user').map(m=>m.content.toLowerCase()).join(' ');
  let budget=null;
  for(const re of [/(\d+(?:\.\d+)?)\s*m(?:illion)?\s*(?:mad|dh)?/i,/(\d[\d\s,]*)\s*(?:mad|dh|dirham)/i,/budget[^\d]*(\d[\d,\s]*)/i,/under[^\d]*(\d[\d,\s]*)/i]){
    const m=text.match(re); if(m){let v=parseFloat(m[1].replace(/[\s,]/g,''));if(v<1000)v*=1e6;budget=v;break;}
  }
  const cities={marrakech:'Marrakech',casablanca:'Casablanca',casa:'Casablanca',rabat:'Rabat',agadir:'Agadir',fes:'Fes',fez:'Fes',tangier:'Tangier',tanger:'Tangier',meknes:'Meknes',essaouira:'Essaouira',ifrane:'Ifrane',tetouan:'Tetouan'};
  let city=null; for(const[k,v]of Object.entries(cities)){if(text.includes(k)){city=v;break;}}
  const types={apartment:'Apartment',flat:'Apartment',villa:'Villa',riad:'Riad',studio:'Studio',penthouse:'Penthouse',house:'House',dar:'House'};
  let type=null; for(const[k,v]of Object.entries(types)){if(text.includes(k)){type=v;break;}}
  const bm=text.match(/(\d)\s*(?:bed(?:room)?s?|chambre)/i); let bedrooms=bm?parseInt(bm[1]):null;
  const intent=/invest|rental|yield|airbnb|income|return/i.test(text)?'invest':/live|family|home|settle|move|personal/i.test(text)?'live':null;
  return {budget,city,type,bedrooms,intent};
}

function isGeneral(text){const t=text.toLowerCase();return['what do you have','what properties','show me all','show all','list all','what\'s available','all properties','what other','other properties','other options','what cities','what types','cheapest','expensive','everything you have','show everything','do you have','any properties','browse'].some(p=>t.includes(p));}

function matchProps(props,{budget,city,type,bedrooms}){
  return props.filter(p=>{
    if(!p.available)return false;
    if(city&&p.city.toLowerCase()!==city.toLowerCase())return false;
    if(type&&p.type!==type)return false;
    if(budget&&p.price>budget*1.1)return false;
    if(bedrooms!=null&&bedrooms>0&&p.bedrooms<bedrooms)return false;
    return true;
  }).slice(0,4);
}

function mockChat(messages,properties){
  const lastUser=messages.filter(m=>m.role==='user').slice(-1)[0]?.content??'';
  const c=extractCriteria(messages);
  const userCount=messages.filter(m=>m.role==='user').length;
  if(isGeneral(lastUser)){
    const avail=properties.filter(p=>p.available);
    let results=avail,intro=`Here's a snapshot of our listings across Morocco (${avail.length} properties):`;
    if(c.city){const r=avail.filter(p=>p.city.toLowerCase()===c.city.toLowerCase());if(r.length){results=r;intro=`Here are all ${r.length} properties in **${c.city}**:`;}}
    const notes={};results.slice(0,6).forEach((p,i)=>{notes[p.id]=i===0?`Top listing in ${p.neighborhood}.`:`${p.type} in ${p.neighborhood} — ${(p.price/1e6).toFixed(1)}M MAD.`;});
    return{message:intro,properties:results.slice(0,6),propertyNotes:notes,readyToSearch:true};
  }
  if(c.budget&&c.city&&c.type){
    const matches=matchProps(properties,c);
    if(matches.length>0){
      const notes={};matches.forEach((p,i)=>{notes[p.id]=i===0?`Best match for your criteria — top pick in ${p.neighborhood}.`:`Good alternative — ${p.bedrooms} bed, ${p.areaSqm}m² in ${p.neighborhood}.`;});
      return{message:`Here are the best **${c.type}** options in **${c.city}** within your budget:`,properties:matches,propertyNotes:notes,readyToSearch:true};
    }
    const alt=properties.filter(p=>p.available&&p.city.toLowerCase()===c.city.toLowerCase()).slice(0,4);
    const fallback=alt.length>0?alt:properties.filter(p=>p.available).slice(0,4);
    const notes={};fallback.forEach(p=>{notes[p.id]=`Different from your original ask, but worth a look.`;});
    return{message:`I don't have an exact **${c.type}** in **${c.city}** at that budget, but here are the closest alternatives:`,properties:fallback,propertyNotes:notes,readyToSearch:true};
  }
  if(userCount===0)return{message:`مرحباً! I'm **Karim**, your Bayit real estate advisor for Morocco.\n\nAre you looking to **buy to live in**, or more interested in **investment and rental income**?`,properties:[],propertyNotes:{},readyToSearch:false};
  if(!c.budget)return{message:`To point you in the right direction — what's your rough **budget range**? (e.g. under 1M MAD, 1–3M, above 3M)`,properties:[],propertyNotes:{},readyToSearch:false};
  if(!c.city)return{message:`Got it. Which **city** draws you? Marrakech, Casablanca, Rabat, Agadir, Fes, Tangier — or somewhere else?`,properties:[],propertyNotes:{},readyToSearch:false};
  if(!c.type)return{message:`**${c.city}** — great choice. What type of property suits you? (Apartment, Villa, Riad, Studio, House)`,properties:[],propertyNotes:{},readyToSearch:false};
  return{message:`How many **bedrooms** do you need? Or shall I show you what's available now?`,properties:[],propertyNotes:{},readyToSearch:false};
}

async function handleChat(messages) {
  const properties = await getProperties();
  if (OPENAI_API_KEY?.startsWith('sk-')) {
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:OPENAI_MODEL,messages:[{role:'system',content:buildPrompt(properties)},...messages.map(m=>({role:m.role,content:m.content}))],response_format:{type:'json_object'},max_tokens:600,temperature:0.7})});
      const ai=await r.json();
      const raw=ai.choices?.[0]?.message?.content??'{}';
      let parsed; try{parsed=JSON.parse(raw);}catch{parsed={message:raw};}
      const ids=Array.isArray(parsed.propertyIds)?parsed.propertyIds:Array.isArray(parsed.properties)?parsed.properties.map(x=>x?.id??x):[];
      const returnedProps=ids.map(id=>properties.find(p=>String(p.id)===String(id))).filter(Boolean);
      return{message:parsed.message??'Let me help you.',properties:returnedProps,propertyNotes:parsed.propertyNotes??{},readyToSearch:parsed.readyToSearch??returnedProps.length>0};
    } catch(e){console.error('OpenAI:',e.message);}
  }
  return mockChat(messages, properties);
}

// ── Proxy helper to Next.js ───────────────────────────────────────────────────
function proxyToNext(req, res) {
  const options = { hostname:'localhost', port:NEXT_PORT, path:req.url, method:req.method, headers:{...req.headers, host:`localhost:${NEXT_PORT}`} };
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxy.on('error', () => { res.writeHead(502); res.end('Next.js not ready yet'); });
  req.pipe(proxy);
}

// ── Combined HTTP server ──────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // Handle chat API directly
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const { messages } = JSON.parse(body);
      const result = await handleChat(messages);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch(e) {
      res.writeHead(400); res.end('Bad request');
    }
    return;
  }

  // Proxy everything else to Next.js
  proxyToNext(req, res);
});

// ── Start Next.js production server on internal port ─────────────────────────
console.log('\n🚀 Starting Bayit...');
const next = spawn('node_modules/.bin/next', ['start', '-p', String(NEXT_PORT)], {
  cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe']
});
next.stdout.on('data', d => process.stdout.write(d));
next.stderr.on('data', d => process.stderr.write(d));
next.on('exit', code => { console.log(`Next.js exited (${code})`); process.exit(code); });

// Start combined server after Next.js is ready
setTimeout(() => {
  server.listen(PUBLIC_PORT, () => {
    console.log(`\n✅ Bayit running on http://localhost:${PUBLIC_PORT}`);
    console.log(`   Karim AI: ${OPENAI_API_KEY?'GPT-4o-mini LIVE':'mock mode'}`);
    console.log(`   Sheets:   ${SHEET_ID?'connected':'sample data'}\n`);
  });
}, 3000);

process.on('exit', () => next.kill());
process.on('SIGINT', () => { next.kill(); process.exit(); });
