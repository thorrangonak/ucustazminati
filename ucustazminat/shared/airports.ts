// Türkiye ve popüler uluslararası havalimanları veritabanı
// Koordinatlar mesafe hesaplaması için kullanılacak

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export const airports: Airport[] = [
  // Türkiye Havalimanları
  { code: "IST", name: "İstanbul Havalimanı", city: "İstanbul", country: "Türkiye", lat: 41.2753, lon: 28.7519 },
  { code: "SAW", name: "Sabiha Gökçen", city: "İstanbul", country: "Türkiye", lat: 40.8986, lon: 29.3092 },
  { code: "ESB", name: "Esenboğa Havalimanı", city: "Ankara", country: "Türkiye", lat: 40.1281, lon: 32.9951 },
  { code: "ADB", name: "Adnan Menderes", city: "İzmir", country: "Türkiye", lat: 38.2924, lon: 27.1570 },
  { code: "AYT", name: "Antalya Havalimanı", city: "Antalya", country: "Türkiye", lat: 36.8987, lon: 30.8005 },
  { code: "DLM", name: "Dalaman Havalimanı", city: "Dalaman", country: "Türkiye", lat: 36.7131, lon: 28.7925 },
  { code: "BJV", name: "Milas-Bodrum", city: "Bodrum", country: "Türkiye", lat: 37.2506, lon: 27.6643 },
  { code: "GZT", name: "Gaziantep Havalimanı", city: "Gaziantep", country: "Türkiye", lat: 36.9472, lon: 37.4787 },
  { code: "TZX", name: "Trabzon Havalimanı", city: "Trabzon", country: "Türkiye", lat: 40.9950, lon: 39.7897 },
  { code: "ASR", name: "Kayseri Havalimanı", city: "Kayseri", country: "Türkiye", lat: 38.7704, lon: 35.4954 },
  { code: "VAN", name: "Ferit Melen", city: "Van", country: "Türkiye", lat: 38.4682, lon: 43.3323 },
  { code: "DIY", name: "Diyarbakır Havalimanı", city: "Diyarbakır", country: "Türkiye", lat: 37.8939, lon: 40.2010 },
  { code: "ERZ", name: "Erzurum Havalimanı", city: "Erzurum", country: "Türkiye", lat: 39.9565, lon: 41.1702 },
  { code: "SZF", name: "Samsun-Çarşamba", city: "Samsun", country: "Türkiye", lat: 41.2545, lon: 36.5671 },
  { code: "KYA", name: "Konya Havalimanı", city: "Konya", country: "Türkiye", lat: 37.9790, lon: 32.5619 },
  { code: "MLX", name: "Malatya Havalimanı", city: "Malatya", country: "Türkiye", lat: 38.4353, lon: 38.0910 },
  { code: "NAV", name: "Nevşehir Kapadokya", city: "Nevşehir", country: "Türkiye", lat: 38.7719, lon: 34.5345 },
  
  // Avrupa Havalimanları
  { code: "LHR", name: "Heathrow", city: "Londra", country: "İngiltere", lat: 51.4700, lon: -0.4543 },
  { code: "LGW", name: "Gatwick", city: "Londra", country: "İngiltere", lat: 51.1537, lon: -0.1821 },
  { code: "STN", name: "Stansted", city: "Londra", country: "İngiltere", lat: 51.8850, lon: 0.2350 },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "Fransa", lat: 49.0097, lon: 2.5479 },
  { code: "ORY", name: "Orly", city: "Paris", country: "Fransa", lat: 48.7233, lon: 2.3794 },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Almanya", lat: 50.0379, lon: 8.5622 },
  { code: "MUC", name: "Münih", city: "Münih", country: "Almanya", lat: 48.3537, lon: 11.7750 },
  { code: "DUS", name: "Düsseldorf", city: "Düsseldorf", country: "Almanya", lat: 51.2895, lon: 6.7668 },
  { code: "BER", name: "Berlin Brandenburg", city: "Berlin", country: "Almanya", lat: 52.3667, lon: 13.5033 },
  { code: "AMS", name: "Schiphol", city: "Amsterdam", country: "Hollanda", lat: 52.3105, lon: 4.7683 },
  { code: "BRU", name: "Brüksel", city: "Brüksel", country: "Belçika", lat: 50.9014, lon: 4.4844 },
  { code: "ZRH", name: "Zürih", city: "Zürih", country: "İsviçre", lat: 47.4647, lon: 8.5492 },
  { code: "GVA", name: "Cenevre", city: "Cenevre", country: "İsviçre", lat: 46.2381, lon: 6.1089 },
  { code: "VIE", name: "Viyana", city: "Viyana", country: "Avusturya", lat: 48.1103, lon: 16.5697 },
  { code: "FCO", name: "Fiumicino", city: "Roma", country: "İtalya", lat: 41.8003, lon: 12.2389 },
  { code: "MXP", name: "Malpensa", city: "Milano", country: "İtalya", lat: 45.6306, lon: 8.7281 },
  { code: "MAD", name: "Barajas", city: "Madrid", country: "İspanya", lat: 40.4983, lon: -3.5676 },
  { code: "BCN", name: "El Prat", city: "Barselona", country: "İspanya", lat: 41.2971, lon: 2.0785 },
  { code: "ATH", name: "Eleftherios Venizelos", city: "Atina", country: "Yunanistan", lat: 37.9364, lon: 23.9445 },
  { code: "CPH", name: "Kopenhag", city: "Kopenhag", country: "Danimarka", lat: 55.6180, lon: 12.6508 },
  { code: "OSL", name: "Gardermoen", city: "Oslo", country: "Norveç", lat: 60.1939, lon: 11.1004 },
  { code: "ARN", name: "Arlanda", city: "Stockholm", country: "İsveç", lat: 59.6519, lon: 17.9186 },
  { code: "HEL", name: "Vantaa", city: "Helsinki", country: "Finlandiya", lat: 60.3172, lon: 24.9633 },
  { code: "WAW", name: "Chopin", city: "Varşova", country: "Polonya", lat: 52.1657, lon: 20.9671 },
  { code: "PRG", name: "Václav Havel", city: "Prag", country: "Çekya", lat: 50.1008, lon: 14.2600 },
  { code: "BUD", name: "Liszt Ferenc", city: "Budapeşte", country: "Macaristan", lat: 47.4298, lon: 19.2611 },
  { code: "OTP", name: "Henri Coandă", city: "Bükreş", country: "Romanya", lat: 44.5711, lon: 26.0850 },
  { code: "SOF", name: "Sofya", city: "Sofya", country: "Bulgaristan", lat: 42.6952, lon: 23.4062 },
  { code: "BEG", name: "Nikola Tesla", city: "Belgrad", country: "Sırbistan", lat: 44.8184, lon: 20.3091 },
  { code: "ZAG", name: "Franjo Tuđman", city: "Zagreb", country: "Hırvatistan", lat: 45.7429, lon: 16.0688 },
  { code: "LJU", name: "Jože Pučnik", city: "Ljubljana", country: "Slovenya", lat: 46.2237, lon: 14.4576 },
  { code: "SKP", name: "Skopje", city: "Üsküp", country: "Kuzey Makedonya", lat: 41.9616, lon: 21.6214 },
  { code: "TIA", name: "Tiran", city: "Tiran", country: "Arnavutluk", lat: 41.4147, lon: 19.7206 },
  { code: "SJJ", name: "Saraybosna", city: "Saraybosna", country: "Bosna Hersek", lat: 43.8246, lon: 18.3315 },
  { code: "PRN", name: "Priştine", city: "Priştine", country: "Kosova", lat: 42.5728, lon: 21.0358 },
  { code: "TGD", name: "Podgorica", city: "Podgorica", country: "Karadağ", lat: 42.3594, lon: 19.2519 },
  { code: "KIV", name: "Kişinev", city: "Kişinev", country: "Moldova", lat: 46.9277, lon: 28.9313 },
  { code: "IEV", name: "Kiev Boryspil", city: "Kiev", country: "Ukrayna", lat: 50.3450, lon: 30.8947 },
  { code: "LIS", name: "Portela", city: "Lizbon", country: "Portekiz", lat: 38.7813, lon: -9.1359 },
  { code: "DUB", name: "Dublin", city: "Dublin", country: "İrlanda", lat: 53.4264, lon: -6.2499 },
  
  // Ortadoğu ve Körfez
  { code: "DXB", name: "Dubai", city: "Dubai", country: "BAE", lat: 25.2532, lon: 55.3657 },
  { code: "AUH", name: "Abu Dabi", city: "Abu Dabi", country: "BAE", lat: 24.4330, lon: 54.6511 },
  { code: "DOH", name: "Hamad", city: "Doha", country: "Katar", lat: 25.2731, lon: 51.6081 },
  { code: "RUH", name: "Kral Halid", city: "Riyad", country: "Suudi Arabistan", lat: 24.9576, lon: 46.6988 },
  { code: "JED", name: "Kral Abdulaziz", city: "Cidde", country: "Suudi Arabistan", lat: 21.6796, lon: 39.1565 },
  { code: "KWI", name: "Kuveyt", city: "Kuveyt", country: "Kuveyt", lat: 29.2266, lon: 47.9689 },
  { code: "BAH", name: "Bahreyn", city: "Manama", country: "Bahreyn", lat: 26.2708, lon: 50.6336 },
  { code: "TLV", name: "Ben Gurion", city: "Tel Aviv", country: "İsrail", lat: 32.0114, lon: 34.8867 },
  { code: "AMM", name: "Queen Alia", city: "Amman", country: "Ürdün", lat: 31.7226, lon: 35.9932 },
  { code: "BEY", name: "Rafik Hariri", city: "Beyrut", country: "Lübnan", lat: 33.8209, lon: 35.4884 },
  { code: "CAI", name: "Kahire", city: "Kahire", country: "Mısır", lat: 30.1219, lon: 31.4056 },
  
  // Uzak Doğu ve Asya
  { code: "PEK", name: "Capital", city: "Pekin", country: "Çin", lat: 40.0799, lon: 116.6031 },
  { code: "PVG", name: "Pudong", city: "Şanghay", country: "Çin", lat: 31.1443, lon: 121.8083 },
  { code: "HKG", name: "Hong Kong", city: "Hong Kong", country: "Hong Kong", lat: 22.3080, lon: 113.9185 },
  { code: "NRT", name: "Narita", city: "Tokyo", country: "Japonya", lat: 35.7647, lon: 140.3864 },
  { code: "HND", name: "Haneda", city: "Tokyo", country: "Japonya", lat: 35.5494, lon: 139.7798 },
  { code: "ICN", name: "Incheon", city: "Seul", country: "Güney Kore", lat: 37.4602, lon: 126.4407 },
  { code: "SIN", name: "Changi", city: "Singapur", country: "Singapur", lat: 1.3644, lon: 103.9915 },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Tayland", lat: 13.6900, lon: 100.7501 },
  { code: "KUL", name: "KLIA", city: "Kuala Lumpur", country: "Malezya", lat: 2.7456, lon: 101.7099 },
  { code: "DEL", name: "Indira Gandhi", city: "Yeni Delhi", country: "Hindistan", lat: 28.5562, lon: 77.1000 },
  { code: "BOM", name: "Chhatrapati Shivaji", city: "Mumbai", country: "Hindistan", lat: 19.0896, lon: 72.8656 },
  
  // Amerika
  { code: "JFK", name: "John F. Kennedy", city: "New York", country: "ABD", lat: 40.6413, lon: -73.7781 },
  { code: "EWR", name: "Newark", city: "New York", country: "ABD", lat: 40.6895, lon: -74.1745 },
  { code: "LAX", name: "Los Angeles", city: "Los Angeles", country: "ABD", lat: 33.9416, lon: -118.4085 },
  { code: "ORD", name: "O'Hare", city: "Chicago", country: "ABD", lat: 41.9742, lon: -87.9073 },
  { code: "MIA", name: "Miami", city: "Miami", country: "ABD", lat: 25.7959, lon: -80.2870 },
  { code: "SFO", name: "San Francisco", city: "San Francisco", country: "ABD", lat: 37.6213, lon: -122.3790 },
  { code: "ATL", name: "Hartsfield-Jackson", city: "Atlanta", country: "ABD", lat: 33.6407, lon: -84.4277 },
  { code: "IAD", name: "Dulles", city: "Washington D.C.", country: "ABD", lat: 38.9531, lon: -77.4565 },
  { code: "DCA", name: "Reagan National", city: "Washington D.C.", country: "ABD", lat: 38.8512, lon: -77.0402 },
  { code: "BOS", name: "Logan", city: "Boston", country: "ABD", lat: 42.3656, lon: -71.0096 },
  { code: "DFW", name: "Dallas/Fort Worth", city: "Dallas", country: "ABD", lat: 32.8998, lon: -97.0403 },
  { code: "IAH", name: "George Bush", city: "Houston", country: "ABD", lat: 29.9902, lon: -95.3368 },
  { code: "YYZ", name: "Pearson", city: "Toronto", country: "Kanada", lat: 43.6777, lon: -79.6248 },
  { code: "YVR", name: "Vancouver", city: "Vancouver", country: "Kanada", lat: 49.1967, lon: -123.1815 },
  { code: "MEX", name: "Benito Juárez", city: "Mexico City", country: "Meksika", lat: 19.4363, lon: -99.0721 },
  { code: "GRU", name: "Guarulhos", city: "São Paulo", country: "Brezilya", lat: -23.4356, lon: -46.4731 },
  { code: "EZE", name: "Ezeiza", city: "Buenos Aires", country: "Arjantin", lat: -34.8222, lon: -58.5358 },
  
  // Afrika
  { code: "JNB", name: "O.R. Tambo", city: "Johannesburg", country: "Güney Afrika", lat: -26.1392, lon: 28.2460 },
  { code: "CPT", name: "Cape Town", city: "Cape Town", country: "Güney Afrika", lat: -33.9715, lon: 18.6021 },
  { code: "ADD", name: "Bole", city: "Addis Ababa", country: "Etiyopya", lat: 8.9779, lon: 38.7993 },
  { code: "NBO", name: "Jomo Kenyatta", city: "Nairobi", country: "Kenya", lat: -1.3192, lon: 36.9278 },
  { code: "CMN", name: "Mohammed V", city: "Kazablanka", country: "Fas", lat: 33.3675, lon: -7.5900 },
  { code: "ALG", name: "Houari Boumediene", city: "Cezayir", country: "Cezayir", lat: 36.6910, lon: 3.2154 },
  { code: "TUN", name: "Tunus-Kartaca", city: "Tunus", country: "Tunus", lat: 36.8510, lon: 10.2272 },
  
  // Okyanusya
  { code: "SYD", name: "Kingsford Smith", city: "Sidney", country: "Avustralya", lat: -33.9399, lon: 151.1753 },
  { code: "MEL", name: "Tullamarine", city: "Melbourne", country: "Avustralya", lat: -37.6690, lon: 144.8410 },
  { code: "AKL", name: "Auckland", city: "Auckland", country: "Yeni Zelanda", lat: -37.0082, lon: 174.7850 },
];

// Havalimanı arama fonksiyonu
export function searchAirports(query: string): Airport[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.length < 2) return [];
  
  return airports
    .filter(airport => 
      airport.code.toLowerCase().includes(normalizedQuery) ||
      airport.name.toLowerCase().includes(normalizedQuery) ||
      airport.city.toLowerCase().includes(normalizedQuery) ||
      airport.country.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 10);
}

// Havalimanı kodu ile bul
export function getAirportByCode(code: string): Airport | undefined {
  return airports.find(a => a.code.toUpperCase() === code.toUpperCase());
}

// Haversine formülü ile iki nokta arası mesafe hesaplama (km)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// İki havalimanı arası mesafe hesaplama
export function calculateFlightDistance(departureCode: string, arrivalCode: string): number | null {
  const departure = getAirportByCode(departureCode);
  const arrival = getAirportByCode(arrivalCode);
  
  if (!departure || !arrival) return null;
  
  return calculateDistance(departure.lat, departure.lon, arrival.lat, arrival.lon);
}

// Türk havalimanları listesi (yurtiçi uçuş tespiti için)
// Tüm Türkiye havalimanları - SHGM kaynaklı
const turkishAirportCodes = [
  // Mevcut havalimanları
  'IST', 'SAW', 'ESB', 'AYT', 'ADB', 'DLM', 'BJV', 'TZX', 'GZT', 'ASR',
  'VAN', 'DIY', 'ERZ', 'SZF', 'KYA', 'MLX', 'NAV',
  // Ek Türkiye havalimanları
  'ADA', // Adana
  'GNY', // Şanlıurfa GAP
  'HTY', // Hatay
  'MZH', // Merzifon
  'ONQ', // Zonguldak
  'EDO', // Balıkesir Koca Seyit
  'CKZ', // Çanakkale
  'TEQ', // Tekirdağ Çorlu
  'USQ', // Uşak
  'DNZ', // Denizli Çardak
  'AOE', // Eskişehir Anadolu
  'AFY', // Afyon
  'KCM', // Kahramanmaraş
  'IGD', // Iğdır
  'MSR', // Muş
  'NOP', // Sinop
  'OGU', // Ordu-Giresun
  'BZI', // Balıkesir Merkez
  'SXZ', // Siirt
  'VAS', // Sivas
  'TJK', // Tokat
  'KFS', // Kastamonu
  'BAL', // Batman
  'YKO', // Yozgat
  'KZR', // Zafer (Kütahya-Afyon-Uşak)
  'GKD', // Gökçeada
  'ERC', // Erzincan
  'BDM', // Bandırma
  'CII', // Ayın Cikti
  'ISE', // Isparta Süleyman Demirel
  'KSY', // Kars
  'MQM', // Mardin
  'NKT', // Şırnak
  'BGG', // Bingöl
  'AJI', // Ağrı
  'GZP', // Gazipaşa Alanya
  'HTY', // Hatay
  'SFQ', // Sanlıurfa
];

// Havalimanlarının Türkiye'de olup olmadığını kontrol et
export function isTurkishAirportCode(code: string): boolean {
  return turkishAirportCodes.includes(code.toUpperCase());
}

// Uçuşun yurtiçi mi yurtdışı mı olduğunu belirle
export function isDomesticFlightByCode(departure: string, arrival: string): boolean {
  return isTurkishAirportCode(departure) && isTurkishAirportCode(arrival);
}

// Mesafeye göre tazminat miktarı hesaplama (SHY-YOLCU - 4 kategori)
export function getCompensationByDistance(
  distanceKm: number, 
  departure?: string, 
  arrival?: string
): { amount: number; category: string; minDelay: number; regulation: string } {
  // Yurtiçi uçuş kontrolü
  if (departure && arrival && isDomesticFlightByCode(departure, arrival)) {
    return { 
      amount: 100, 
      category: "Yurtiçi uçuş", 
      minDelay: 2,
      regulation: 'SHY-YOLCU'
    };
  }
  
  // Yurtdışı uçuşlar için mesafeye göre
  if (distanceKm <= 1500) {
    return { 
      amount: 250, 
      category: "Yurtdışı 1500 km'ye kadar", 
      minDelay: 2,
      regulation: 'SHY-YOLCU'
    };
  } else if (distanceKm <= 3500) {
    return { 
      amount: 400, 
      category: "Yurtdışı 1500-3500 km", 
      minDelay: 3,
      regulation: 'SHY-YOLCU'
    };
  } else {
    return { 
      amount: 600, 
      category: "Yurtdışı 3500 km üzeri", 
      minDelay: 4,
      regulation: 'SHY-YOLCU'
    };
  }
}
