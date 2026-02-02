import jsPDF from 'jspdf';
import { interFontBase64 } from './interFont';

// Türkçe karakterleri ASCII'ye dönüştürme (fallback)
function turkishToAscii(text: string): string {
  const map: Record<string, string> = {
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C'
  };
  return text.replace(/[ğĞüÜşŞıİöÖçÇ]/g, char => map[char] || char);
}

// Font yükleme fonksiyonu
function loadFont(doc: jsPDF): boolean {
  try {
    if (interFontBase64 && interFontBase64.length > 1000) {
      doc.addFileToVFS('Inter-Regular.ttf', interFontBase64);
      doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
      doc.setFont('Inter', 'normal');
      return true;
    }
  } catch (e) {
    console.warn('Font yüklenemedi, varsayılan font kullanılacak');
  }
  return false;
}

// Metin işleme fonksiyonu
function processText(text: string, fontLoaded: boolean): string {
  return fontLoaded ? text : turkishToAscii(text);
}

interface AssignmentAgreementData {
  referenceNo: string;
  // Müşteri bilgileri
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientIdNumber: string; // TC Kimlik No
  // Uçuş bilgileri
  bookingRef: string;
  airline: string;
  flightNumber: string;
  route: string;
  flightDate: string;
  issueType: 'cancellation' | 'delay' | 'overbooking';
  // Aktarmalı uçuş bilgileri (opsiyonel)
  isConnecting?: boolean;
  connectingFlightNumber?: string;
  connectingRoute?: string;
  // Tazminat bilgileri
  compensationAmount: number;
  regulation: 'SHY-YOLCU' | 'EC-261' | 'both';
  // İmza
  signatureData?: string;
  signedAt?: string;
}

// Şirket bilgileri
const COMPANY_INFO = {
  name: 'UçuşTazminat',
  slogan: 'Your Flight. Your Rights. Your Money.',
  address: 'İstanbul, Türkiye',
  web: 'www.ucustazminat.com',
  email: 'info@ucustazminat.com',
  phone: '+90 532 123 45 67'
};

export async function generateAssignmentAgreementPDF(data: AssignmentAgreementData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const fontLoaded = loadFont(doc);
  const p = (text: string) => processText(text, fontLoaded);
  
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Renk tanımları
  const colors = {
    primary: [0, 136, 204] as [number, number, number], // Mavi
    warning: [255, 248, 220] as [number, number, number], // Sarı arka plan
    warningBorder: [255, 193, 7] as [number, number, number],
    success: [220, 252, 231] as [number, number, number], // Yeşil arka plan
    successBorder: [34, 197, 94] as [number, number, number],
    acceptance: [252, 231, 243] as [number, number, number], // Pembe arka plan
    acceptanceBorder: [236, 72, 153] as [number, number, number],
    text: [51, 51, 51] as [number, number, number],
    lightGray: [245, 245, 245] as [number, number, number]
  };

  // ===== SAYFA 1 =====
  
  // Header - Logo ve Şirket Adı
  doc.setFontSize(24);
  doc.setTextColor(...colors.primary);
  doc.text(p(`✈ [${COMPANY_INFO.name}]`), pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(p(COMPANY_INFO.slogan), pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Başlık
  doc.setFontSize(18);
  doc.setTextColor(...colors.primary);
  doc.text(p('ALACAK TEMLİK SÖZLEŞMESİ'), pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text('CLAIM ASSIGNMENT AGREEMENT', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Başvuru No
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(p(`Başvuru No / Reference No: ${data.referenceNo}`), margin, y);
  y += 12;

  // ÖNEMLİ UYARI KUTUSU (Sarı)
  const warningBoxHeight = 45;
  doc.setFillColor(...colors.warning);
  doc.setDrawColor(...colors.warningBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, warningBoxHeight, 3, 3, 'FD');
  
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text(p('⚠ ÖNEMLİ / IMPORTANT'), pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  const warningText1 = p('Bu sözleşme ile tazminat alacağınızın TAM MÜLKİYETİNİ Şirkete devrediyorsunuz.');
  const warningText2 = 'By signing this agreement, you transfer FULL OWNERSHIP of your compensation claim to the Company.';
  doc.text(warningText1, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(warningText2, pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.text(p('• Temlik sonrası havayolu ile doğrudan iletişime geçemezsiniz'), pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('• You cannot contact the airline directly after assignment', pageWidth / 2, y, { align: 'center' });
  y += 6;
  
  doc.setTextColor(34, 197, 94);
  doc.text(p('✓ Başarısız olursa hiçbir ücret ödemezsiniz (No Win = No Fee)'), pageWidth / 2, y, { align: 'center' });
  
  y += 18;

  // 1. TARAFLAR / PARTIES
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('1. TARAFLAR / PARTIES'), margin, y);
  y += 8;

  // 1.1 Müşteri
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(p('1.1. MÜŞTERİ / CLIENT ("Temlik Eden" / "Assignor")'), margin, y);
  y += 7;

  // Müşteri bilgileri tablosu
  doc.setFillColor(...colors.lightGray);
  doc.rect(margin, y, contentWidth, 28, 'F');
  y += 6;
  
  doc.setFontSize(9);
  doc.text(p('Ad Soyad / Full Name:'), margin + 3, y);
  doc.text(p(data.clientName), margin + 50, y);
  y += 6;
  doc.text('Email:', margin + 3, y);
  doc.text(data.clientEmail, margin + 50, y);
  y += 6;
  doc.text(p('Telefon / Phone:'), margin + 3, y);
  doc.text(data.clientPhone || '-', margin + 50, y);
  y += 6;
  doc.text(p('TC Kimlik No / ID Number:'), margin + 3, y);
  doc.text(data.clientIdNumber || '-', margin + 50, y);
  y += 10;

  // 1.2 Şirket
  doc.setFontSize(10);
  doc.text(p('1.2. ŞİRKET / COMPANY ("Temlik Alan" / "Assignee")'), margin, y);
  y += 7;
  
  doc.setFontSize(9);
  doc.text(p(`Ticaret Unvanı: ${COMPANY_INFO.name}`), margin + 3, y);
  y += 5;
  doc.text(p(`Adres: ${COMPANY_INFO.address}`), margin + 3, y);
  y += 5;
  doc.text(`Web: ${COMPANY_INFO.web}`, margin + 3, y);
  y += 12;

  // 2. UÇUŞ BİLGİLERİ / FLIGHT DETAILS
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('2. UÇUŞ BİLGİLERİ / FLIGHT DETAILS'), margin, y);
  y += 8;

  doc.setFillColor(...colors.lightGray);
  doc.rect(margin, y, contentWidth, data.isConnecting ? 42 : 32, 'F');
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(p('Rezervasyon No / Booking Ref:'), margin + 3, y);
  doc.text(data.bookingRef || '-', margin + 60, y);
  y += 5;
  doc.text(p('Havayolu / Airline:'), margin + 3, y);
  doc.text(data.airline, margin + 60, y);
  y += 5;
  doc.text(p('Uçuş No / Flight Number:'), margin + 3, y);
  doc.text(data.flightNumber, margin + 60, y);
  y += 5;
  doc.text(p('Güzergah / Route:'), margin + 3, y);
  doc.text(data.route, margin + 60, y);
  y += 5;
  doc.text(p('Tarih / Date:'), margin + 3, y);
  doc.text(data.flightDate, margin + 60, y);
  y += 5;
  
  // Aksaklık türü
  const issueTypes = {
    cancellation: p('İptal / Cancellation'),
    delay: p('Rötar / Delay'),
    overbooking: 'Overbooking'
  };
  doc.text(p('Aksaklık / Issue:'), margin + 3, y);
  doc.text(issueTypes[data.issueType], margin + 60, y);
  
  if (data.isConnecting && data.connectingFlightNumber) {
    y += 5;
    doc.text(p('2. Uçuş No:'), margin + 3, y);
    doc.text(data.connectingFlightNumber, margin + 60, y);
    y += 5;
    doc.text(p('2. Güzergah:'), margin + 3, y);
    doc.text(data.connectingRoute || '-', margin + 60, y);
  }

  // ===== SAYFA 2 =====
  doc.addPage();
  y = margin;

  // 3. TEMLİK / ASSIGNMENT
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('3. TEMLİK / ASSIGNMENT'), margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(p('3.1. TAM MÜLKİYET DEVRİ / FULL OWNERSHIP TRANSFER'), margin, y);
  y += 7;

  doc.setFontSize(9);
  const assignmentText1 = doc.splitTextToSize(
    p('Müşteri, yukarıda belirtilen uçuş aksaklığından kaynaklanan tazminat alacağının tam mülkiyetini ve yasal hakkını Şirkete devretmektedir. Bu devir şunları kapsar:'),
    contentWidth
  );
  doc.text(assignmentText1, margin, y);
  y += assignmentText1.length * 4 + 3;

  const assignmentText2 = doc.splitTextToSize(
    'The Client hereby assigns to the Company full ownership and legal title to the compensation claim. This assignment includes:',
    contentWidth
  );
  doc.text(assignmentText2, margin, y);
  y += assignmentText2.length * 4 + 5;

  // Tazminat kategorileri
  doc.text(p(`• Türkiye'de: SHY-YOLCU Yönetmeliği (100-600 EUR)`), margin + 5, y);
  y += 5;
  doc.text(p(`• AB'de: EC 261/2004 Yönetmeliği (250-600 EUR)`), margin + 5, y);
  y += 5;
  doc.text(p('• Tüm ek haklar ve faizler / All accessory rights and interest'), margin + 5, y);
  y += 5;
  doc.text(p('• Tüm ilgili masraflar / All associated costs'), margin + 5, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(p('3.2. YASAL DAYANAK / LEGAL BASIS'), margin, y);
  y += 7;

  doc.setFontSize(9);
  const legalText = doc.splitTextToSize(
    p('Bu temlik, 6098 Sayılı Türk Borçlar Kanunu Madde 183 uyarınca yapılmaktadır: "Kanun, sözleşme veya işin niteliği engel olmadıkça alacaklı, borçlunun rızasını aramaksızın alacağını üçüncü bir kişiye devredebilir."'),
    contentWidth
  );
  doc.text(legalText, margin, y);
  y += legalText.length * 4 + 12;

  // 4. ŞİRKET YETKİLERİ / COMPANY RIGHTS
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('4. ŞİRKET YETKİLERİ / COMPANY RIGHTS'), margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(p('Temlik ile Şirket tek yetkili / sole authority olarak:'), margin, y);
  y += 7;

  const rights = [
    ['4.1.', p('Havayoluna doğrudan başvurma / Contact airline directly')],
    ['4.2.', p('SHGM\'ye başvurma / File with Civil Aviation Authority')],
    ['4.3.', p('Müzakere yapma / Negotiate settlements')],
    ['4.4.', p('Uzlaşma tekliflerini kabul/red etme / Accept/reject settlement offers')],
    ['4.5.', p('Gerekirse dava açma / Initiate legal proceedings')],
    ['4.6.', p('Tazminat ödemesini tahsil etme / Collect compensation payment')]
  ];

  rights.forEach(([num, text]) => {
    doc.text(`${num} ${text}`, margin, y);
    y += 5;
  });
  y += 8;

  // 5. MÜŞTERİ TAAHHÜTLERİ / CLIENT UNDERTAKINGS
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('5. MÜŞTERİ TAAHHÜTLERİ / CLIENT UNDERTAKINGS'), margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(p('5.1. İLETİŞİM YASAĞI / NO DIRECT CONTACT'), margin, y);
  y += 7;

  doc.setFontSize(9);
  const undertaking1 = doc.splitTextToSize(
    p('Müşteri, temlik sonrası havayolu veya SHGM ile DOĞRUDAN İLETİŞİME GEÇMEYECEĞİNİ, DOĞRUDAN ÖDEME KABUL ETMEYECEĞİNİ taahhüt eder.'),
    contentWidth
  );
  doc.text(undertaking1, margin, y);
  y += undertaking1.length * 4 + 3;

  const undertaking1En = doc.splitTextToSize(
    'Client undertakes NOT TO CONTACT the airline/authority directly and NOT TO ACCEPT direct payment.',
    contentWidth
  );
  doc.text(undertaking1En, margin, y);
  y += undertaking1En.length * 4 + 8;

  doc.setFontSize(10);
  doc.text(p('5.2. BİLGİLENDİRME YÜKÜMLÜLÜĞÜ / DISCLOSURE OBLIGATION'), margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.text(p('Havayolu/SHGM\'den doğrudan ödeme alırsa derhal Şirketi bilgilendirecektir.'), margin, y);
  y += 4;
  doc.text('If receiving direct payment, Client must notify Company immediately.', margin, y);

  // ===== SAYFA 3 =====
  doc.addPage();
  y = margin;

  // 6. HİZMET BEDELİ / SERVICE FEE (Yeşil kutu)
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('6. HİZMET BEDELİ / SERVICE FEE'), margin, y);
  y += 10;

  // Yeşil kutu
  const feeBoxHeight = 40;
  doc.setFillColor(...colors.success);
  doc.setDrawColor(...colors.successBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, feeBoxHeight, 3, 3, 'FD');
  
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(34, 197, 94);
  doc.text('✓ NO WIN = NO FEE', pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(p('Başarılı Olursak: %25 Hizmet Bedeli'), pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('If Successful: 25% Service Fee', pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setTextColor(34, 197, 94);
  doc.text(p('Başarısız Olursak: 0 TL (HİÇBİR ÜCRET YOK)'), pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('If Unsuccessful: 0 EUR (NO FEE)', pageWidth / 2, y, { align: 'center' });
  
  y += 18;

  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(p('6.1. Tahsil edilen tutarın %25\'i Şirket hizmet bedeli olarak alınır.'), margin, y);
  y += 5;
  doc.text(p('6.2. Kalan %75 tutar, Müşteriye en geç 14 iş günü içinde ödenir.'), margin, y);
  y += 5;
  doc.text(p('6.3. Başarısız olunması halinde Müşteriden hiçbir ücret talep edilmez.'), margin, y);
  y += 12;

  // 7. KİŞİSEL VERİLER / DATA PROTECTION
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('7. KİŞİSEL VERİLER / DATA PROTECTION'), margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(p('Müşteri, kişisel verilerinin:'), margin, y);
  y += 5;
  doc.text(p('• Havayoluna iletilmesini'), margin + 5, y);
  y += 4;
  doc.text(p('• SHGM\'ye iletilmesini'), margin + 5, y);
  y += 4;
  doc.text(p('• Hukuki süreçlerde kullanılmasını'), margin + 5, y);
  y += 4;
  doc.text(p('• Tazminat takibi amacıyla işlenmesini'), margin + 5, y);
  y += 6;
  doc.text(p('6698 sayılı KVKK kapsamında kabul eder.'), margin, y);
  y += 12;

  // 8. SÜRE VE FESİH / TERM & TERMINATION
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('8. SÜRE VE FESİH / TERM & TERMINATION'), margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(p('8.1. Bu sözleşme, alacak tahsil edilene veya tahsil edilemeyeceği kesinleşene kadar geçerlidir.'), margin, y);
  y += 5;
  doc.text(p('8.2. Müşteri, Şirket somut işleme başlamadan önce yazılı bildirimle feshedebilir.'), margin, y);
  y += 5;
  doc.text(p('8.3. Temlik yapıldıktan sonra tek taraflı fesih mümkün değildir.'), margin, y);
  y += 12;

  // 9. YEDEKLİLİK HÜKMÜ / FALLBACK PROVISION
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('9. YEDEKLİLİK HÜKMÜ / FALLBACK PROVISION'), margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  const fallbackText = doc.splitTextToSize(
    p('Önemli: Bu temlikin herhangi bir sebeple geçersiz sayılması halinde, bu sözleşme otomatik olarak VEKALETNAME\'ye dönüşür ve Şirket Müşteri adına tüm işlemleri yapmaya yetkilidir.'),
    contentWidth
  );
  doc.text(fallbackText, margin, y);
  y += fallbackText.length * 4 + 3;

  const fallbackTextEn = doc.splitTextToSize(
    'If this assignment is deemed invalid, it shall automatically be considered a POWER OF ATTORNEY.',
    contentWidth
  );
  doc.text(fallbackTextEn, margin, y);
  y += fallbackTextEn.length * 4 + 10;

  // 10. DİĞER HÜKÜMLER / OTHER PROVISIONS
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('10. DİĞER HÜKÜMLER / OTHER PROVISIONS'), margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(p('10.1. Bu sözleşme Türk hukukuna tabidir.'), margin, y);
  y += 5;
  doc.text(p('10.2. İhtilaflar İstanbul mahkemelerinde çözülür.'), margin, y);
  y += 5;
  doc.text(p('10.3. Elektronik imza, ıslak imza ile eşdeğerdir.'), margin, y);
  y += 5;
  doc.text(p('10.4. Bu sözleşme noter tasdiki gerektirmez.'), margin, y);

  // ===== SAYFA 4 =====
  doc.addPage();
  y = margin;

  // 11. KABUL VE ONAY / ACCEPTANCE (Pembe kutu)
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(p('11. KABUL VE ONAY / ACCEPTANCE'), margin, y);
  y += 10;

  // Pembe kutu
  const acceptanceBoxHeight = 50;
  doc.setFillColor(...colors.acceptance);
  doc.setDrawColor(...colors.acceptanceBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, acceptanceBoxHeight, 3, 3, 'FD');
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(p('✓ ONAY / CONFIRMATION'), pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setFontSize(9);
  const acceptanceText = doc.splitTextToSize(
    p('Bu sözleşmeyi okudum, anladım ve kabul ediyorum. Tazminat alacağımın tam mülkiyetini Şirkete devrettiğimi onaylıyorum.'),
    contentWidth - 10
  );
  doc.text(acceptanceText, pageWidth / 2, y, { align: 'center', maxWidth: contentWidth - 10 });
  y += acceptanceText.length * 4 + 5;

  const acceptanceTextEn = doc.splitTextToSize(
    'I have read, understood and accept this agreement. I confirm that I transfer full ownership of my compensation claim to the Company.',
    contentWidth - 10
  );
  doc.text(acceptanceTextEn, pageWidth / 2, y, { align: 'center', maxWidth: contentWidth - 10 });
  
  y += 25;

  // Tarih
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  const signDate = data.signedAt || new Date().toLocaleDateString('tr-TR');
  doc.text(p(`Tarih / Date: ${signDate}`), margin, y);
  y += 15;

  // İmza alanları
  const colWidth = contentWidth / 2 - 5;
  
  // Müşteri tarafı
  doc.text(p('MÜŞTERİ / CLIENT'), margin, y);
  doc.text(p('ŞİRKET / COMPANY'), margin + colWidth + 10, y);
  y += 8;
  
  doc.text(p(`Ad Soyad: ${data.clientName}`), margin, y);
  doc.text(p(`Yetkili: ${COMPANY_INFO.name}`), margin + colWidth + 10, y);
  y += 8;
  
  // İmza çizgisi
  doc.line(margin, y + 15, margin + colWidth - 10, y + 15);
  doc.line(margin + colWidth + 10, y + 15, pageWidth - margin, y + 15);
  
  doc.text(p('İmza / Signature:'), margin, y);
  doc.text(p('İmza ve Kaşe:'), margin + colWidth + 10, y);

  // Müşteri imzası (eğer varsa)
  if (data.signatureData) {
    try {
      // İmzayı çizginin hemen üstüne yerleştir (y + 5 konumunda, 50x12 boyutunda)
      doc.addImage(data.signatureData, 'PNG', margin, y + 3, 50, 10);
    } catch (e) {
      console.warn('İmza eklenemedi');
    }
  }

  y += 30;

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`${COMPANY_INFO.email} | ${COMPANY_INFO.phone} | ${COMPANY_INFO.web}`, pageWidth / 2, y, { align: 'center' });
  y += 6;
  
  doc.setFontSize(7);
  doc.text(p('Bu sözleşme TBK m.183 uyarınca noter tasdiki gerektirmez ve elektronik ortamda imzalanabilir.'), pageWidth / 2, y, { align: 'center' });
  doc.text('This agreement does not require notarization per TBK Art. 183 and can be signed electronically.', pageWidth / 2, y + 4, { align: 'center' });

  return doc;
}

export async function downloadAssignmentAgreementPDF(data: AssignmentAgreementData, filename?: string): Promise<void> {
  const doc = await generateAssignmentAgreementPDF(data);
  const fileName = filename || `Alacak_Temlik_Sozlesmesi_${data.referenceNo}.pdf`;
  doc.save(fileName);
}

export async function previewAssignmentAgreementPDF(data: AssignmentAgreementData): Promise<string> {
  const doc = await generateAssignmentAgreementPDF(data);
  return doc.output('datauristring');
}
