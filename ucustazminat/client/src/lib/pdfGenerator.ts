import { jsPDF } from 'jspdf';
import { interFontBase64 } from './interFont';

interface FlightInfo {
  flightNumber: string;
  flightDate: string;
  departureAirport?: string;
  arrivalAirport?: string;
}

interface PowerOfAttorneyData {
  passengerName: string;
  passengerEmail?: string;
  mainApplicantName?: string;
  // Ana uçuş bilgileri
  flightNumber?: string;
  flightDate?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  // Aktarmalı uçuş bilgileri
  isConnecting?: boolean;
  connectionAirport?: string;
  flight1?: FlightInfo;
  flight2?: FlightInfo;
  // PNR
  bookingReference?: string;
  // İmza
  signatureData?: string;
  date: string;
  isMainApplicant: boolean;
}

// Türkçe karakterleri ASCII'ye dönüştür (font desteği yoksa fallback)
function turkishToAscii(text: string): string {
  const charMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, char => charMap[char] || char);
}

// Font yükleme fonksiyonu
function loadInterFont(doc: jsPDF): boolean {
  try {
    // Inter fontunu ekle
    doc.addFileToVFS('Inter-Regular.ttf', interFontBase64);
    doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
    return true;
  } catch (e) {
    console.warn('Inter font yüklenemedi, helvetica kullanılacak:', e);
    return false;
  }
}

export function generatePowerOfAttorneyPDF(data: PowerOfAttorneyData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Font yüklemeyi dene
  const hasInterFont = loadInterFont(doc);
  const fontName = hasInterFont ? 'Inter' : 'helvetica';
  
  // Metin işleme fonksiyonu - font yoksa ASCII'ye dönüştür
  const processText = (text: string): string => {
    return hasInterFont ? text : turkishToAscii(text);
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 20;

  // Header - Logo ve Şirket Bilgisi
  // Kırmızı kare logo
  doc.setFillColor(220, 38, 38); // Kırmızı
  doc.rect(margin, yPos, 8, 8, 'F');
  
  doc.setFontSize(18);
  doc.setFont(fontName, 'normal');
  doc.text(processText('UçuşTazminat'), margin + 12, yPos + 6);
  
  doc.setFontSize(9);
  doc.setFont(fontName, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(processText('SHY-YOLCU Yönetmeliği Kapsamında Tazminat Hizmeti'), margin + 12, yPos + 11);
  
  yPos += 25;

  // Başlık
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont(fontName, 'normal');
  doc.text(processText('VEKALETNAME VE YETKİLENDİRME BELGESİ'), pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Bilgi Kutusu - Yüksekliği dinamik olarak hesapla
  const hasConnectingFlight = data.isConnecting && data.flight2?.flightNumber;
  const boxHeight = hasConnectingFlight ? 55 : 45;
  
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont(fontName, 'normal');
  
  let infoY = yPos + 8;
  
  // Sol taraf - Kişisel bilgiler
  doc.setFont(fontName, 'normal');
  doc.text(processText('YETKİ VEREN'), margin + 5, infoY);
  doc.setFont(fontName, 'normal');
  infoY += 6;
  doc.text(processText(`Ad Soyad: ${data.passengerName}`), margin + 5, infoY);
  if (data.passengerEmail) {
    infoY += 5;
    doc.text(processText(`E-posta: ${data.passengerEmail}`), margin + 5, infoY);
  }
  infoY += 5;
  doc.text(processText(`Tarih: ${data.date}`), margin + 5, infoY);
  
  if (!data.isMainApplicant && data.mainApplicantName) {
    infoY += 5;
    doc.text(processText(`Ana Başvurucu: ${data.mainApplicantName}`), margin + 5, infoY);
  }
  
  // Sağ taraf - Uçuş bilgileri
  let flightInfoY = yPos + 8;
  const rightColX = margin + contentWidth / 2;
  
  doc.setFont(fontName, 'normal');
  doc.text(processText('UÇUŞ BİLGİLERİ'), rightColX, flightInfoY);
  doc.setFont(fontName, 'normal');
  flightInfoY += 6;
  
  // PNR (Rezervasyon Numarası)
  if (data.bookingReference) {
    doc.text(processText(`PNR (Rezervasyon No): ${data.bookingReference}`), rightColX, flightInfoY);
    flightInfoY += 5;
  }
  
  // Aktarmalı uçuş kontrolü
  if (hasConnectingFlight && data.flight1 && data.flight2) {
    // Aktarmalı uçuş - her iki uçuşu da göster
    doc.setFont(fontName, 'normal');
    doc.text(processText('1. Uçuş:'), rightColX, flightInfoY);
    doc.setFont(fontName, 'normal');
    flightInfoY += 5;
    doc.text(processText(`  ${data.flight1.flightNumber} - ${data.flight1.flightDate}`), rightColX, flightInfoY);
    flightInfoY += 5;
    doc.text(processText(`  ${data.departureAirport || ''} → ${data.connectionAirport || ''}`), rightColX, flightInfoY);
    flightInfoY += 6;
    
    doc.setFont(fontName, 'normal');
    doc.text(processText('2. Uçuş:'), rightColX, flightInfoY);
    doc.setFont(fontName, 'normal');
    flightInfoY += 5;
    doc.text(processText(`  ${data.flight2.flightNumber} - ${data.flight2.flightDate}`), rightColX, flightInfoY);
    flightInfoY += 5;
    doc.text(processText(`  ${data.connectionAirport || ''} → ${data.arrivalAirport || ''}`), rightColX, flightInfoY);
  } else {
    // Direkt uçuş
    if (data.flightNumber || data.flight1?.flightNumber) {
      const flightNo = data.flightNumber || data.flight1?.flightNumber;
      doc.text(processText(`Uçuş No: ${flightNo}`), rightColX, flightInfoY);
      flightInfoY += 5;
    }
    if (data.flightDate || data.flight1?.flightDate) {
      const flightDt = data.flightDate || data.flight1?.flightDate;
      doc.text(processText(`Uçuş Tarihi: ${flightDt}`), rightColX, flightInfoY);
      flightInfoY += 5;
    }
    if (data.departureAirport && data.arrivalAirport) {
      doc.text(processText(`Güzergah: ${data.departureAirport} → ${data.arrivalAirport}`), rightColX, flightInfoY);
    }
  }
  
  yPos += boxHeight + 7;

  // Vekaletname Metni
  doc.setFontSize(10);
  doc.setFont(fontName, 'normal');
  
  // Uçuş bilgilerini metin içinde de referans olarak ekle
  let flightRefText = '';
  if (hasConnectingFlight && data.flight1 && data.flight2) {
    flightRefText = `${data.flight1.flightNumber} (${data.departureAirport} → ${data.connectionAirport}) ve ${data.flight2.flightNumber} (${data.connectionAirport} → ${data.arrivalAirport}) numaralı aktarmalı uçuşlar`;
  } else {
    const flightNo = data.flightNumber || data.flight1?.flightNumber || '[Uçuş No]';
    const route = data.departureAirport && data.arrivalAirport 
      ? `(${data.departureAirport} → ${data.arrivalAirport})` 
      : '';
    flightRefText = `${flightNo} ${route} numaralı uçuş`;
  }
  
  const pnrText = data.bookingReference ? ` (PNR: ${data.bookingReference})` : '';
  
  const consentText = `İşbu yetkilendirme belgesi, UçuşTazminat'ın Müşteri'yi tüm üçüncü taraflar nezdinde temsil etmesini, Müşteri'nin hava yolcu haklarını savunmasını ve taşıma sözleşmesi süresince yaşanan aksaklıklar ve olaylar nedeniyle havayolu şirketinden mali tazminat elde etmesini sağlar.

1. YETKİLENDİRME

Ben, aşağıda imzası bulunan kişi olarak, UçuşTazminat'ı (bundan böyle "Şirket" olarak anılacaktır) aşağıdaki konularda açıkça yetkilendiriyor, vekil tayin ediyor ve münhasır yetki veriyorum:

- ${flightRefText}${pnrText} kapsamında gerçekleştirilen seyahatle bağlantılı olarak iptal, gecikme, fazla rezervasyon veya herhangi bir aksaklıktan kaynaklanan zararlar için havayolu şirketinden mali tazminat elde etmek amacıyla beni temsil etmek, adıma talepte bulunmak ve tüm uygun işlemleri yapmak.

- Sivil ve idari yasaların izin verdiği bilgi talepleri dahil olmak üzere, Sivil Havacılık Genel Müdürlüğü (SHGM) ve diğer ilgili kurum veya kuruluşlardan bilgi talep etmek.

- Talep ve tazminatla ilgili tüm ödemeleri Şirket veya Şirket tarafından atanan harici avukatlar tarafından belirlenen banka hesaplarında adıma tahsil etmek, almak ve teslim almak.

2. HUKUKİ TEMSİL YETKİSİ

Talebin dostane çözümünün sağlanamaması halinde, UçuşTazminat'ın hukuk departmanını veya UçuşTazminat tarafından atanan herhangi bir hukuk bürosunu, avukatı veya danışmanı aşağıdaki konularda açıkça yetkilendiriyor ve vekil tayin ediyorum:

- Uçuşumun iptali, gecikmesi, fazla rezervasyonu veya herhangi bir kesintisinden kaynaklanan zararlar için tazminat elde etmek amacıyla, bu vekalet kapsamındaki Talep ile bağlantılı olarak her türlü dostane ve yargısal işlemlerde beni temsil etmek ve yardımcı olmak.

3. KİŞİSEL VERİLERİN İŞLENMESİ

6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kişisel verilerimin UçuşTazminat tarafından tazminat talebimin işlenmesi amacıyla toplanmasına, saklanmasına ve işlenmesine açıkça rıza gösteriyorum.

4. BEYAN VE TAAHHÜT

İşbu belgeyi imzalayarak:
- Yukarıda belirtilen tüm yetkileri UçuşTazminat'a verdiğimi,
- Verdiğim bilgilerin doğru ve eksiksiz olduğunu,
- UçuşTazminat'ın hizmet şartlarını ve %25 komisyon oranını okuduğumu ve kabul ettiğimi,
- Bu vekaletnamenin elektronik ortamda imzalanmasının yasal olarak bağlayıcı olduğunu

beyan ve taahhüt ederim.`;

  const lines = doc.splitTextToSize(processText(consentText), contentWidth);
  
  for (const line of lines) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, margin, yPos);
    yPos += 5;
  }

  yPos += 10;

  // İmza Alanı
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 80, yPos);
  
  doc.setFontSize(9);
  doc.text(processText('İmza'), margin, yPos + 5);
  
  // Eğer imza varsa ekle
  if (data.signatureData) {
    try {
      doc.addImage(data.signatureData, 'PNG', margin, yPos - 25, 60, 20);
    } catch (e) {
      console.error('İmza eklenemedi:', e);
    }
  }

  doc.line(margin + 90, yPos, margin + contentWidth, yPos);
  doc.text(processText('Ad Soyad: ' + data.passengerName), margin + 90, yPos + 5);

  yPos += 15;
  doc.text(processText('Tarih: ' + data.date), margin, yPos);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(processText('Bu belge UçuşTazminat tarafından elektronik ortamda oluşturulmuştur.'), pageWidth / 2, footerY, { align: 'center' });
  doc.text('www.ucustazminat.com | info@ucustazminat.com', pageWidth / 2, footerY + 4, { align: 'center' });

  return doc;
}

export function downloadPowerOfAttorneyPDF(data: PowerOfAttorneyData, filename?: string): void {
  const doc = generatePowerOfAttorneyPDF(data);
  const defaultFilename = `vekaletname_${data.passengerName.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename || defaultFilename);
}

export function getPowerOfAttorneyPDFBlob(data: PowerOfAttorneyData): Blob {
  const doc = generatePowerOfAttorneyPDF(data);
  return doc.output('blob');
}

export function getPowerOfAttorneyPDFDataUrl(data: PowerOfAttorneyData): string {
  const doc = generatePowerOfAttorneyPDF(data);
  return doc.output('dataurlstring');
}
