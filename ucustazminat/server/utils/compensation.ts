/**
 * Tazminat Hesaplama Sistemi
 * 
 * İki farklı yönetmelik desteklenir:
 * 
 * 1. SHY-YOLCU (Türkiye kalkış/varışlı uçuşlar):
 *    - Yurtiçi uçuşlar: 100 EUR
 *    - Yurtdışı 1500 km'ye kadar: 250 EUR
 *    - Yurtdışı 1500-3500 km arası: 400 EUR
 *    - Yurtdışı 3500 km üzeri: 600 EUR
 * 
 * 2. EC-261 (Avrupa kalkış/varışlı uçuşlar):
 *    - 1500 km'ye kadar: 250 EUR
 *    - 1500-3500 km arası: 400 EUR
 *    - 3500 km üzeri: 600 EUR
 * 
 * Gecikme süreleri:
 * - 2 saat+ (1500 km'ye kadar)
 * - 3 saat+ (1500-3500 km)
 * - 4 saat+ (3500 km+)
 * - 5 saat+ tüm mesafeler için tam tazminat
 */

// Türkiye'deki havalimanları (yurtiçi uçuş tespiti için)
const turkishAirports = [
  'IST', 'SAW', 'ESB', 'AYT', 'ADB', 'DLM', 'BJV', 'TZX', 'GZT', 'ASR',
  'VAN', 'DIY', 'ERZ', 'SZF', 'KYA', 'MLX', 'ADA', 'GNY', 'HTY', 'KCM',
  'MZH', 'NOP', 'OGU', 'SXZ', 'TEQ', 'USQ', 'YEI', 'NAV', 'EDO', 'AOE',
  'CKZ', 'DNZ', 'ERC', 'EZS', 'IGD', 'ISE', 'KFS', 'KSY', 'KZR', 'MSR',
  'MQM', 'NKT', 'ONQ', 'SFQ', 'TJK', 'VAS', 'BAL', 'BDM', 'BZI', 'BGG',
  'GKD', 'KCO', 'SIC', 'TEQ', 'USQ'
];

// Avrupa Birliği havalimanları (EC-261 kapsamı için)
const euAirports = [
  // Almanya
  'FRA', 'MUC', 'DUS', 'TXL', 'BER', 'HAM', 'CGN', 'STR',
  // Fransa
  'CDG', 'ORY', 'NCE', 'LYS', 'MRS', 'TLS',
  // İngiltere (Brexit sonrası AB değil ama EC-261 benzeri kurallar)
  'LHR', 'LGW', 'STN', 'MAN', 'EDI', 'BHX',
  // İtalya
  'FCO', 'MXP', 'LIN', 'VCE', 'NAP', 'BGY',
  // İspanya
  'MAD', 'BCN', 'PMI', 'AGP', 'ALC', 'VLC',
  // Hollanda
  'AMS', 'EIN', 'RTM',
  // Belçika
  'BRU', 'CRL',
  // Avusturya
  'VIE', 'SZG', 'INN',
  // İsviçre
  'ZRH', 'GVA', 'BSL',
  // Portekiz
  'LIS', 'OPO', 'FAO',
  // Yunanistan
  'ATH', 'SKG', 'HER', 'RHO',
  // İskandinav
  'CPH', 'OSL', 'ARN', 'HEL', 'GOT',
  // Diğer AB
  'PRG', 'WAW', 'BUD', 'OTP', 'SOF', 'ZAG', 'LJU', 'DUB'
];

// Türkiye'deki havalimanları koordinatları (IATA kodu -> [lat, lon])
const airportCoordinates: Record<string, [number, number]> = {
  // Türkiye
  IST: [41.2753, 28.7519], // İstanbul Havalimanı
  SAW: [40.8986, 29.3092], // Sabiha Gökçen
  ESB: [40.1281, 32.9951], // Ankara Esenboğa
  AYT: [36.8987, 30.8005], // Antalya
  ADB: [38.2924, 27.1570], // İzmir Adnan Menderes
  DLM: [36.7131, 28.7925], // Dalaman
  BJV: [37.2506, 27.6643], // Bodrum Milas
  TZX: [40.9950, 39.7897], // Trabzon
  GZT: [36.9472, 37.4787], // Gaziantep
  ASR: [38.7704, 35.4954], // Kayseri
  VAN: [38.4682, 43.3323], // Van
  DIY: [37.8939, 40.2010], // Diyarbakır
  ERZ: [39.9565, 41.1702], // Erzurum
  SZF: [41.2545, 36.5671], // Samsun
  KYA: [37.9790, 32.5619], // Konya
  MLX: [38.4353, 38.0910], // Malatya
  ADA: [36.9822, 35.2804], // Adana
  
  // Avrupa
  FRA: [50.0379, 8.5622],  // Frankfurt
  MUC: [48.3538, 11.7861], // Münih
  CDG: [49.0097, 2.5479],  // Paris CDG
  LHR: [51.4700, -0.4543], // Londra Heathrow
  AMS: [52.3105, 4.7683],  // Amsterdam
  FCO: [41.8003, 12.2389], // Roma
  MAD: [40.4983, -3.5676], // Madrid
  BCN: [41.2974, 2.0833],  // Barcelona
  VIE: [48.1103, 16.5697], // Viyana
  ZRH: [47.4647, 8.5492],  // Zürih
  BRU: [50.9014, 4.4844],  // Brüksel
  CPH: [55.6180, 12.6560], // Kopenhag
  OSL: [60.1939, 11.1004], // Oslo
  ARN: [59.6519, 17.9186], // Stockholm
  HEL: [60.3172, 24.9633], // Helsinki
  ATH: [37.9364, 23.9445], // Atina
  LGW: [51.1537, -0.1821], // Londra Gatwick
  STN: [51.8850, 0.2350],  // Londra Stansted
  MAN: [53.3537, -2.2750], // Manchester
  DUS: [51.2895, 6.7668],  // Düsseldorf
  HAM: [53.6304, 9.9882],  // Hamburg
  BER: [52.3667, 13.5033], // Berlin
  MXP: [45.6306, 8.7281],  // Milano Malpensa
  
  // Orta Doğu
  DXB: [25.2532, 55.3657], // Dubai
  DOH: [25.2731, 51.6081], // Doha
  AUH: [24.4330, 54.6511], // Abu Dhabi
  JED: [21.6796, 39.1565], // Cidde
  RUH: [24.9576, 46.6988], // Riyad
  TLV: [32.0055, 34.8854], // Tel Aviv
  AMM: [31.7226, 35.9932], // Amman
  BEY: [33.8209, 35.4884], // Beyrut
  
  // Asya
  PEK: [40.0799, 116.6031], // Pekin
  PVG: [31.1443, 121.8083], // Şanghay
  HKG: [22.3080, 113.9185], // Hong Kong
  NRT: [35.7720, 140.3929], // Tokyo Narita
  ICN: [37.4602, 126.4407], // Seul
  SIN: [1.3644, 103.9915],  // Singapur
  BKK: [13.6900, 100.7501], // Bangkok
  DEL: [28.5562, 77.1000],  // Delhi
  BOM: [19.0896, 72.8656],  // Mumbai
  
  // Amerika
  JFK: [40.6413, -73.7781], // New York JFK
  LAX: [33.9416, -118.4085], // Los Angeles
  ORD: [41.9742, -87.9073], // Chicago
  MIA: [25.7959, -80.2870], // Miami
  SFO: [37.6213, -122.3790], // San Francisco
  IAH: [29.9902, -95.3368], // Houston
  
  // Afrika
  CAI: [30.1219, 31.4056], // Kahire
  JNB: [26.1392, 28.2460], // Johannesburg
  CPT: [-33.9715, 18.6021], // Cape Town
  ADD: [8.9779, 38.7993],  // Addis Ababa
  NBO: [-1.3192, 36.9278], // Nairobi
  CMN: [33.3675, -7.5898], // Casablanca
  TUN: [36.8510, 10.2272], // Tunus
  ALG: [36.6910, 3.2154],  // Cezayir
};

/**
 * Havalimanının Türkiye'de olup olmadığını kontrol et
 */
export function isTurkishAirport(airportCode: string): boolean {
  return turkishAirports.includes(airportCode.toUpperCase());
}

/**
 * Havalimanının AB'de olup olmadığını kontrol et
 */
export function isEUAirport(airportCode: string): boolean {
  return euAirports.includes(airportCode.toUpperCase());
}

/**
 * Uçuşun yurtiçi mi yurtdışı mı olduğunu belirle
 */
export function isDomesticFlight(departure: string, arrival: string): boolean {
  return isTurkishAirport(departure) && isTurkishAirport(arrival);
}

/**
 * Hangi yönetmeliğin geçerli olduğunu belirle
 */
export function getApplicableRegulation(departure: string, arrival: string): 'SHY-YOLCU' | 'EC-261' | 'BOTH' {
  const depTurkey = isTurkishAirport(departure);
  const arrTurkey = isTurkishAirport(arrival);
  const depEU = isEUAirport(departure);
  const arrEU = isEUAirport(arrival);
  
  // Türkiye kalkış veya varışlı = SHY-YOLCU
  // AB kalkış veya varışlı = EC-261
  // Her ikisi de geçerliyse BOTH
  
  const shyYolcu = depTurkey || arrTurkey;
  const ec261 = depEU || arrEU;
  
  if (shyYolcu && ec261) return 'BOTH';
  if (shyYolcu) return 'SHY-YOLCU';
  if (ec261) return 'EC-261';
  
  // Varsayılan olarak SHY-YOLCU (Türk vatandaşları için)
  return 'SHY-YOLCU';
}

/**
 * İki havalimanı arasındaki mesafeyi hesapla (Haversine formülü)
 */
export function calculateDistance(departure: string, arrival: string): number {
  const dep = airportCoordinates[departure.toUpperCase()];
  const arr = airportCoordinates[arrival.toUpperCase()];
  
  if (!dep || !arr) {
    // Bilinmeyen havalimanları için varsayılan mesafe
    console.warn(`Unknown airport code: ${!dep ? departure : arrival}`);
    return 1500; // Varsayılan orta mesafe
  }
  
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = toRad(arr[0] - dep[0]);
  const dLon = toRad(arr[1] - dep[1]);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(dep[0])) * Math.cos(toRad(arr[0])) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Tazminat uygunluğunu kontrol et
 */
export function checkEligibility(params: {
  disruptionType: "delay" | "cancellation" | "denied_boarding" | "downgrade";
  delayDuration?: number; // dakika
  distance: number;
}): { eligible: boolean; reason?: string } {
  const { disruptionType, delayDuration, distance } = params;
  
  // İptal ve boarding reddi her zaman uygun
  if (disruptionType === 'cancellation' || disruptionType === 'denied_boarding') {
    return { eligible: true };
  }
  
  // Downgrade için her zaman uygun
  if (disruptionType === 'downgrade') {
    return { eligible: true };
  }
  
  // Gecikme için süre kontrolü
  if (disruptionType === 'delay') {
    if (!delayDuration) {
      return { eligible: false, reason: 'Gecikme süresi belirtilmedi' };
    }
    
    const delayHours = delayDuration / 60;
    
    // Minimum gecikme süreleri (SHY-YOLCU)
    if (distance <= 1500 && delayHours < 2) {
      return { eligible: false, reason: '1500 km\'ye kadar uçuşlarda minimum 2 saat gecikme gereklidir' };
    }
    if (distance > 1500 && distance <= 3500 && delayHours < 3) {
      return { eligible: false, reason: '1500-3500 km arası uçuşlarda minimum 3 saat gecikme gereklidir' };
    }
    if (distance > 3500 && delayHours < 4) {
      return { eligible: false, reason: '3500 km üzeri uçuşlarda minimum 4 saat gecikme gereklidir' };
    }
    
    return { eligible: true };
  }
  
  return { eligible: false, reason: 'Geçersiz kesinti türü' };
}

/**
 * SHY-YOLCU'ya göre tazminat miktarını hesapla (4 kategori)
 */
export function calculateCompensationSHY(
  distance: number,
  disruptionType: "delay" | "cancellation" | "denied_boarding" | "downgrade",
  isDomestic: boolean
): { amount: number; tier: string; category: string } {
  // Downgrade için %50 indirim uygulanır
  const multiplier = disruptionType === 'downgrade' ? 0.5 : 1;
  
  // Yurtiçi uçuşlar için sabit 100 EUR
  if (isDomestic) {
    return { 
      amount: 100 * multiplier, 
      tier: 'domestic', 
      category: 'Yurtiçi uçuş' 
    };
  }
  
  // Yurtdışı uçuşlar için mesafeye göre
  if (distance <= 1500) {
    return { 
      amount: 250 * multiplier, 
      tier: 'short', 
      category: 'Yurtdışı 1500 km\'ye kadar' 
    };
  } else if (distance <= 3500) {
    return { 
      amount: 400 * multiplier, 
      tier: 'medium', 
      category: 'Yurtdışı 1500-3500 km' 
    };
  } else {
    return { 
      amount: 600 * multiplier, 
      tier: 'long', 
      category: 'Yurtdışı 3500 km üzeri' 
    };
  }
}

/**
 * EC-261'e göre tazminat miktarını hesapla (3 kategori)
 */
export function calculateCompensationEC261(
  distance: number,
  disruptionType: "delay" | "cancellation" | "denied_boarding" | "downgrade"
): { amount: number; tier: string; category: string } {
  // Downgrade için %50 indirim uygulanır
  const multiplier = disruptionType === 'downgrade' ? 0.5 : 1;
  
  if (distance <= 1500) {
    return { 
      amount: 250 * multiplier, 
      tier: 'short', 
      category: '1500 km\'ye kadar' 
    };
  } else if (distance <= 3500) {
    return { 
      amount: 400 * multiplier, 
      tier: 'medium', 
      category: '1500-3500 km' 
    };
  } else {
    return { 
      amount: 600 * multiplier, 
      tier: 'long', 
      category: '3500 km üzeri' 
    };
  }
}

/**
 * Tazminat miktarını hesapla (ana fonksiyon - geriye uyumlu)
 * Varsayılan olarak SHY-YOLCU kullanır
 */
export function calculateCompensation(
  distance: number,
  disruptionType: "delay" | "cancellation" | "denied_boarding" | "downgrade",
  departure?: string,
  arrival?: string
): { amount: number; tier: string; regulation?: string; category?: string } {
  // Kalkış ve varış bilgisi varsa, yurtiçi/yurtdışı kontrolü yap
  if (departure && arrival) {
    const domestic = isDomesticFlight(departure, arrival);
    const regulation = getApplicableRegulation(departure, arrival);
    
    // Her iki yönetmelik de geçerliyse, yüksek olanı seç
    if (regulation === 'BOTH') {
      const shy = calculateCompensationSHY(distance, disruptionType, domestic);
      const ec = calculateCompensationEC261(distance, disruptionType);
      
      if (shy.amount >= ec.amount) {
        return { ...shy, regulation: 'SHY-YOLCU' };
      } else {
        return { ...ec, regulation: 'EC-261' };
      }
    }
    
    if (regulation === 'EC-261') {
      const result = calculateCompensationEC261(distance, disruptionType);
      return { ...result, regulation: 'EC-261' };
    }
    
    // SHY-YOLCU
    const result = calculateCompensationSHY(distance, disruptionType, domestic);
    return { ...result, regulation: 'SHY-YOLCU' };
  }
  
  // Geriye uyumluluk: Eski davranış (SHY-YOLCU yurtdışı varsayımı)
  const multiplier = disruptionType === 'downgrade' ? 0.5 : 1;
  
  if (distance <= 1500) {
    return { amount: 250 * multiplier, tier: 'short' };
  } else if (distance <= 3500) {
    return { amount: 400 * multiplier, tier: 'medium' };
  } else {
    return { amount: 600 * multiplier, tier: 'long' };
  }
}

/**
 * Komisyon hesapla
 */
export function calculateCommission(
  compensationAmount: number,
  hasLegalAction: boolean = false
): { standardRate: number; legalRate: number; totalRate: number; commission: number; netPayout: number } {
  const standardRate = 25; // %25 standart
  const legalRate = hasLegalAction ? 15 : 0; // %15 hukuki süreç
  const totalRate = standardRate + legalRate;
  
  const commission = compensationAmount * (totalRate / 100);
  const netPayout = compensationAmount - commission;
  
  return {
    standardRate,
    legalRate,
    totalRate,
    commission: Math.round(commission * 100) / 100,
    netPayout: Math.round(netPayout * 100) / 100,
  };
}

/**
 * Uçuş numarasından havayolu kodunu çıkar
 */
export function extractAirlineCode(flightNumber: string): string {
  // TK1234 -> TK, PC123 -> PC
  const match = flightNumber.match(/^([A-Z]{2,3})/i);
  return match ? match[1].toUpperCase() : '';
}

/**
 * SHY-YOLCU Tazminat kategorileri (4 kategori)
 */
export const compensationTiersSHY = {
  domestic: {
    maxDistance: Infinity,
    amount: 100,
    minDelay: 2,
    description: 'Yurtiçi uçuşlar',
  },
  short: {
    maxDistance: 1500,
    amount: 250,
    minDelay: 2,
    description: 'Yurtdışı 1500 km\'ye kadar uçuşlar',
  },
  medium: {
    maxDistance: 3500,
    amount: 400,
    minDelay: 3,
    description: 'Yurtdışı 1500-3500 km arası uçuşlar',
  },
  long: {
    maxDistance: Infinity,
    amount: 600,
    minDelay: 4,
    description: 'Yurtdışı 3500 km üzeri uçuşlar',
  },
};

/**
 * EC-261 Tazminat kategorileri (3 kategori)
 */
export const compensationTiersEC261 = {
  short: {
    maxDistance: 1500,
    amount: 250,
    minDelay: 2,
    description: '1500 km\'ye kadar uçuşlar',
  },
  medium: {
    maxDistance: 3500,
    amount: 400,
    minDelay: 3,
    description: '1500-3500 km arası uçuşlar',
  },
  long: {
    maxDistance: Infinity,
    amount: 600,
    minDelay: 4,
    description: '3500 km üzeri uçuşlar',
  },
};

/**
 * Geriye uyumluluk için eski tiers
 */
export const compensationTiers = compensationTiersSHY;
