/**
 * Bayit - Google Sheets Creator
 *
 * This script creates a new Google Sheet named "Bayit Properties"
 * and populates it with 20 Moroccan real estate listings.
 *
 * Usage:
 *   node scripts/create-sheet.mjs
 *
 * It will open a browser for one-time Google OAuth consent,
 * then print your GOOGLE_SHEET_ID to paste into .env.local
 */

import { google } from 'googleapis';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse } from 'url';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -------------------------------------------------------
// OAuth2 setup (uses a free public OAuth client that works
// for installed apps / scripts - you can also paste your own
// client ID from Google Cloud Console)
// -------------------------------------------------------
const REDIRECT_URI = 'http://localhost:3333/oauth2callback';
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Token cache path
const TOKEN_PATH = path.join(__dirname, '.sheet-token.json');

// -------------------------------------------------------
// Property data matching columns A:O
// -------------------------------------------------------
const HEADERS = [
  'id', 'title', 'description', 'price', 'city', 'neighborhood',
  'type', 'bedrooms', 'bathrooms', 'areaSqm', 'imageUrl',
  'lat', 'lng', 'features', 'available'
];

const PROPERTIES = [
  ['1','Luxury Riad in the Medina','Stunning 5-bedroom riad with rooftop terrace and traditional zellige tilework','4500000','Marrakech','Medina','Riad','5','4','320','https://images.unsplash.com/photo-1539437829697-1b4ed9032be3?w=800','31.6295','-7.9811','Pool,Rooftop,AC,WiFi,Parking','TRUE'],
  ['2','Modern Apartment in Gueliz','Bright 2-bedroom apartment with city views in the modern district','950000','Marrakech','Gueliz','Apartment','2','1','85','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','31.6317','-8.0083','AC,WiFi,Balcony,Security','TRUE'],
  ['3','Sea-View Villa in Agadir','Spacious 4-bedroom villa with panoramic Atlantic Ocean views and private pool','3200000','Agadir','Founty','Villa','4','3','280','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800','30.4278','-9.5981','Pool,Garden,AC,WiFi,Garage,Sea View','TRUE'],
  ['4','Studio in Rabat Centre','Cozy modern studio ideal for young professionals near the train station','420000','Rabat','Hassan','Studio','0','1','38','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','34.0209','-6.8416','AC,WiFi,Security,Elevator','TRUE'],
  ['5','Traditional House in Fes Medina','Authentic 3-bedroom Fassi house with courtyard fountain and carved cedar woodwork','1800000','Fes','Bali Medina','House','3','2','180','https://images.unsplash.com/photo-1590142050945-56f2e0b2abe7?w=800','34.0531','-5.0008','Courtyard,Traditional Decor,WiFi','TRUE'],
  ['6','Penthouse in Casablanca','Exclusive 3-bedroom penthouse with wraparound terrace in Maarif','5500000','Casablanca','Maarif','Apartment','3','3','210','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','33.5731','-7.5898','Terrace,AC,WiFi,Gym,Concierge,Parking','TRUE'],
  ['7','Beachfront Apartment in Tangier','Bright 2-bedroom apartment steps from the beach on the Tangier coastline','1350000','Tangier','Malabata','Apartment','2','2','110','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800','35.7595','-5.8330','Sea View,AC,WiFi,Balcony,Pool','TRUE'],
  ['8','Mountain Retreat in Ifrane','Chalet-style 4-bedroom villa surrounded by cedar forests near the ski slopes','2900000','Ifrane','Ain Vittel','Villa','4','3','240','https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800','33.5228','-5.1100','Garden,Fireplace,WiFi,Garage,Mountain View','TRUE'],
  ['9','Cozy Studio in Casablanca','Affordable studio apartment in a well-maintained building with easy metro access','380000','Casablanca','Ain Diab','Studio','0','1','35','https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800','33.5942','-7.6626','AC,WiFi,Security','TRUE'],
  ['10','Riad with Pool in Marrakech','Elegant 3-bedroom riad with a heated plunge pool and rooftop garden','3100000','Marrakech','Bab Doukkala','Riad','3','3','220','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800','31.6340','-7.9920','Pool,Rooftop,AC,WiFi','TRUE'],
  ['11','Family Villa in Rabat Sale','Spacious 5-bedroom family villa with large garden and swimming pool','3800000','Rabat','Hay Riad','Villa','5','4','350','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800','34.0022','-6.8530','Pool,Garden,AC,WiFi,Garage,Security','TRUE'],
  ['12','Apartment in Casablanca Anfa','Contemporary 3-bedroom apartment in the prestigious Anfa neighborhood','1900000','Casablanca','Anfa','Apartment','3','2','140','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800','33.5875','-7.6401','AC,WiFi,Balcony,Security,Elevator,Gym','TRUE'],
  ['13','Boutique Riad in Essaouira','Charming 4-bedroom riad near the ramparts with Atlantic breezes','2200000','Essaouira','Medina','Riad','4','3','190','https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800','31.5085','-9.7595','Rooftop,WiFi,Traditional Decor,Courtyard','TRUE'],
  ['14','Studio in Agadir Marina','Modern studio in the newly developed marina area with resort-style amenities','650000','Agadir','Marina','Studio','0','1','42','https://images.unsplash.com/photo-1526308422422-6a57b4750d52?w=800','30.4100','-9.6062','Pool,AC,WiFi,Sea View,Gym,Concierge','TRUE'],
  ['15','House in Fes Nouvelle Ville','Comfortable 3-bedroom house with garden in the new city close to schools','1200000','Fes','Nouvelle Ville','House','3','2','160','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800','34.0350','-4.9998','Garden,AC,WiFi,Parking,Security','TRUE'],
  ['16','Luxury Apartment in Marrakech','Designer 2-bedroom apartment with private pool access and concierge service','2100000','Marrakech','Hivernage','Apartment','2','2','120','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800','31.6230','-7.9980','Pool,AC,WiFi,Concierge,Gym,Security','TRUE'],
  ['17','Seaview Villa in Tetouan','Beautiful 3-bedroom villa with Mediterranean sea views and terraced gardens','2700000','Tetouan','Cabo Negro','Villa','3','2','200','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','35.5889','-5.3626','Garden,Terrace,AC,WiFi,Sea View,Garage','TRUE'],
  ['18','Apartment in Rabat Agdal','Elegant 2-bedroom apartment in the diplomatic quarter close to embassies','1100000','Rabat','Agdal','Apartment','2','1','95','https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800','33.9800','-6.8500','AC,WiFi,Balcony,Security,Elevator','TRUE'],
  ['19','Golf Resort Villa in Marrakech','Premium 4-bedroom villa on a golf course with private pool and 24/7 security','7500000','Marrakech','Palmeraie','Villa','4','4','380','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','31.6800','-7.9500','Pool,Garden,Golf View,AC,WiFi,Concierge,Security,Garage','TRUE'],
  ['20','Traditional Riad in Meknes','Authentically restored 3-bedroom riad with original stucco and mosaic work','1600000','Meknes','Medina','Riad','3','2','165','https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800','33.8935','-5.5473','Courtyard,WiFi,Traditional Decor,Rooftop','TRUE'],
];

// -------------------------------------------------------
// Load OAuth2 client credentials
// -------------------------------------------------------
function getOAuth2Client() {
  // Check if custom client credentials are provided via env
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('\n\x1b[31mMissing OAuth2 credentials.\x1b[0m');
    console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local');
    console.error('\nHow to get them:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Create a project, enable Google Sheets API + Google Drive API');
    console.error('3. Create OAuth2 credentials (Desktop App type)');
    console.error('4. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local\n');
    process.exit(1);
  }

  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

// -------------------------------------------------------
// Get or refresh OAuth token (opens browser on first run)
// -------------------------------------------------------
async function getAuthenticatedClient(oauth2Client) {
  if (existsSync(TOKEN_PATH)) {
    const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
    oauth2Client.setCredentials(token);
    console.log('Using saved credentials...');
    return oauth2Client;
  }

  const authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('\nOpening browser for Google authorization...');
  console.log('If browser does not open, visit:\n' + authUrl + '\n');

  // Open browser
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${authUrl}"`);

  // Wait for redirect
  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const qs = parse(req.url, true);
      if (qs.query.code) {
        res.end('<h2>Authorization successful! You can close this tab and return to the terminal.</h2>');
        server.close();
        resolve(qs.query.code);
      } else {
        res.end('<h2>No code received. Please try again.</h2>');
        reject(new Error('No auth code'));
      }
    }).listen(3333, () => {
      console.log('Waiting for authorization on http://localhost:3333 ...');
    });
  });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Credentials saved to', TOKEN_PATH);
  return oauth2Client;
}

// -------------------------------------------------------
// Main: Create and populate the Google Sheet
// -------------------------------------------------------
async function main() {
  console.log('\n\x1b[33m=== Bayit Google Sheets Creator ===\x1b[0m\n');

  const oauth2Client = getOAuth2Client();
  const auth = await getAuthenticatedClient(oauth2Client);

  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Create the spreadsheet
  console.log('Creating "Bayit Properties" spreadsheet...');
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'Bayit Properties' },
      sheets: [{ properties: { title: 'Properties', gridProperties: { frozenRowCount: 1 } } }],
    },
  });

  const spreadsheetId = createRes.data.spreadsheetId;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  console.log(`Sheet created: ${sheetUrl}\n`);

  // Write headers + data
  console.log('Populating 20 Moroccan properties...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Properties!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS, ...PROPERTIES] },
  });

  // Format header row (bold, background color)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.1, green: 0.24, blue: 0.42 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 15 },
          },
        },
      ],
    },
  });

  // Make the sheet publicly readable (so GOOGLE_API_KEY works without service account)
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: { role: 'reader', type: 'anyone' },
  });
  console.log('Sheet set to public (read-only) so API key access works.\n');

  // Print results
  console.log('\x1b[32m=== SUCCESS ===\x1b[0m');
  console.log('\nAdd these lines to your .env.local:\n');
  console.log(`\x1b[33mGOOGLE_SHEET_ID=${spreadsheetId}\x1b[0m`);
  console.log(`\x1b[33mGOOGLE_API_KEY=<your-google-api-key>\x1b[0m`);
  console.log('\nGet a free API key at: https://console.cloud.google.com/apis/credentials');
  console.log('(Enable "Google Sheets API" for your project)\n');
  console.log('Sheet URL:', sheetUrl, '\n');
}

main().catch(err => {
  console.error('\x1b[31mError:\x1b[0m', err.message);
  process.exit(1);
});
