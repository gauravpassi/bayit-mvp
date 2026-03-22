/**
 * Bayit Properties - Google Apps Script (Simplified)
 *
 * HOW TO USE:
 * 1. Paste this into Extensions > Apps Script
 * 2. Click Run on "populateBayitProperties"
 * 3. Authorize when prompted
 * 4. Wait ~10 seconds - done!
 * 5. Your Sheet ID is in the URL bar between /d/ and /edit
 */

function populateBayitProperties() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  sheet.setName('Properties');
  sheet.clearContents();

  const data = [
    ['id','title','description','price','city','neighborhood','type','bedrooms','bathrooms','areaSqm','imageUrl','lat','lng','features','available'],
    ['1','Luxury Riad in the Medina','Stunning 5-bedroom riad with rooftop terrace and zellige tilework','4500000','Marrakech','Medina','Riad','5','4','320','https://images.unsplash.com/photo-1539437829697-1b4ed9032be3?w=800','31.6295','-7.9811','Pool,Rooftop,AC,WiFi,Parking','TRUE'],
    ['2','Modern Apartment in Gueliz','Bright 2-bedroom apartment with city views in the modern district','950000','Marrakech','Gueliz','Apartment','2','1','85','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','31.6317','-8.0083','AC,WiFi,Balcony,Security','TRUE'],
    ['3','Sea-View Villa in Agadir','4-bedroom villa with panoramic Atlantic Ocean views and private pool','3200000','Agadir','Founty','Villa','4','3','280','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800','30.4278','-9.5981','Pool,Garden,AC,WiFi,Garage,Sea View','TRUE'],
    ['4','Studio in Rabat Centre','Cozy modern studio ideal for young professionals near the train station','420000','Rabat','Hassan','Studio','0','1','38','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','34.0209','-6.8416','AC,WiFi,Security,Elevator','TRUE'],
    ['5','Traditional House in Fes Medina','3-bedroom Fassi house with courtyard fountain and cedar woodwork','1800000','Fes','Bali Medina','House','3','2','180','https://images.unsplash.com/photo-1590142050945-56f2e0b2abe7?w=800','34.0531','-5.0008','Courtyard,Traditional Decor,WiFi','TRUE'],
    ['6','Penthouse in Casablanca','3-bedroom penthouse with wraparound terrace in Maarif','5500000','Casablanca','Maarif','Apartment','3','3','210','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','33.5731','-7.5898','Terrace,AC,WiFi,Gym,Concierge,Parking','TRUE'],
    ['7','Beachfront Apartment in Tangier','2-bedroom apartment steps from the beach on the Tangier coastline','1350000','Tangier','Malabata','Apartment','2','2','110','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800','35.7595','-5.8330','Sea View,AC,WiFi,Balcony,Pool','TRUE'],
    ['8','Mountain Retreat in Ifrane','Chalet-style 4-bedroom villa surrounded by cedar forests','2900000','Ifrane','Ain Vittel','Villa','4','3','240','https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800','33.5228','-5.1100','Garden,Fireplace,WiFi,Garage,Mountain View','TRUE'],
    ['9','Cozy Studio in Casablanca','Affordable studio in a well-maintained building with easy metro access','380000','Casablanca','Ain Diab','Studio','0','1','35','https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800','33.5942','-7.6626','AC,WiFi,Security','TRUE'],
    ['10','Riad with Pool in Marrakech','3-bedroom riad with heated plunge pool and rooftop garden','3100000','Marrakech','Bab Doukkala','Riad','3','3','220','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800','31.6340','-7.9920','Pool,Rooftop,AC,WiFi','TRUE'],
    ['11','Family Villa in Rabat','5-bedroom villa with large garden and swimming pool','3800000','Rabat','Hay Riad','Villa','5','4','350','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800','34.0022','-6.8530','Pool,Garden,AC,WiFi,Garage,Security','TRUE'],
    ['12','Apartment in Casablanca Anfa','Contemporary 3-bedroom apartment in the prestigious Anfa neighborhood','1900000','Casablanca','Anfa','Apartment','3','2','140','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800','33.5875','-7.6401','AC,WiFi,Balcony,Security,Elevator,Gym','TRUE'],
    ['13','Boutique Riad in Essaouira','4-bedroom riad near the ramparts with Atlantic breezes','2200000','Essaouira','Medina','Riad','4','3','190','https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800','31.5085','-9.7595','Rooftop,WiFi,Traditional Decor,Courtyard','TRUE'],
    ['14','Studio in Agadir Marina','Modern studio in the marina area with resort-style amenities','650000','Agadir','Marina','Studio','0','1','42','https://images.unsplash.com/photo-1526308422422-6a57b4750d52?w=800','30.4100','-9.6062','Pool,AC,WiFi,Sea View,Gym,Concierge','TRUE'],
    ['15','House in Fes Nouvelle Ville','3-bedroom house with garden close to schools and shopping','1200000','Fes','Nouvelle Ville','House','3','2','160','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800','34.0350','-4.9998','Garden,AC,WiFi,Parking,Security','TRUE'],
    ['16','Luxury Apartment in Hivernage','Designer 2-bedroom apartment with pool access and concierge','2100000','Marrakech','Hivernage','Apartment','2','2','120','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800','31.6230','-7.9980','Pool,AC,WiFi,Concierge,Gym,Security','TRUE'],
    ['17','Seaview Villa in Tetouan','3-bedroom villa with Mediterranean sea views and terraced gardens','2700000','Tetouan','Cabo Negro','Villa','3','2','200','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','35.5889','-5.3626','Garden,Terrace,AC,WiFi,Sea View,Garage','TRUE'],
    ['18','Apartment in Rabat Agdal','2-bedroom apartment in the diplomatic quarter near embassies','1100000','Rabat','Agdal','Apartment','2','1','95','https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800','33.9800','-6.8500','AC,WiFi,Balcony,Security,Elevator','TRUE'],
    ['19','Golf Resort Villa in Palmeraie','4-bedroom villa on a golf course with private pool','7500000','Marrakech','Palmeraie','Villa','4','4','380','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','31.6800','-7.9500','Pool,Garden,Golf View,AC,WiFi,Concierge,Security,Garage','TRUE'],
    ['20','Traditional Riad in Meknes','3-bedroom riad with original stucco and mosaic work','1600000','Meknes','Medina','Riad','3','2','165','https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800','33.8935','-5.5473','Courtyard,WiFi,Traditional Decor,Rooftop','TRUE'],
  ];

  // Write all data in one call (fastest method)
  sheet.getRange(1, 1, data.length, 15).setValues(data);

  // Style header row
  const header = sheet.getRange(1, 1, 1, 15);
  header.setBackground('#1A3D6B');
  header.setFontColor('#FFFFFF');
  header.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Log the Sheet ID (view in View > Logs)
  Logger.log('Done! Sheet ID: ' + ss.getId());
  Logger.log('Add to .env.local -> GOOGLE_SHEET_ID=' + ss.getId());
}
