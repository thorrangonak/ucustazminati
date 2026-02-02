/**
 * Alacak Temlik Sözleşmesi / Claim Assignment Agreement
 * Template and PDF Generation
 */

export interface ContractData {
  claimNumber: string
  // Client Info
  clientName: string
  clientEmail: string
  clientPhone: string
  clientIdNumber?: string
  // Flight Info
  bookingRef?: string
  airline: string
  flightNumber: string
  route: string
  flightDate: string
  issueType: string
  // Signature
  signature?: string
  signedAt: Date
}

export function generateContractText(data: ContractData): string {
  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return `
ALACAK TEMLİK SÖZLEŞMESİ
CLAIM ASSIGNMENT AGREEMENT

Başvuru No / Reference No: ${data.claimNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ÖNEMLİ / IMPORTANT

Bu sözleşme ile tazminat alacağınızın TAM MÜLKİYETİNİ Şirkete devrediyorsunuz.
By signing this agreement, you transfer FULL OWNERSHIP of your compensation claim to the Company.

• Temlik sonrası havayolu ile doğrudan iletişime geçemezsiniz
• You cannot contact the airline directly after assignment

✓ Başarısız olursa hiçbir ücret ödemezsiniz (No Win = No Fee)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. TARAFLAR / PARTIES

1.1. MÜŞTERİ / CLIENT ("Temlik Eden" / "Assignor")
    Ad Soyad / Full Name: ${data.clientName}
    Email: ${data.clientEmail}
    Telefon / Phone: ${data.clientPhone}
    ${data.clientIdNumber ? `TC Kimlik No / ID Number: ${data.clientIdNumber}` : ''}

1.2. ŞİRKET / COMPANY ("Temlik Alan" / "Assignee")
    Ticaret Unvanı: UçuşTazminat
    Adres: İstanbul, Türkiye
    Web: www.ucustazminat.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. UÇUŞ BİLGİLERİ / FLIGHT DETAILS

    Rezervasyon No / Booking Ref: ${data.bookingRef || '-'}
    Havayolu / Airline: ${data.airline}
    Uçuş No / Flight Number: ${data.flightNumber}
    Güzergah / Route: ${data.route}
    Tarih / Date: ${data.flightDate}
    Aksaklık / Issue: ${data.issueType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. TEMLİK / ASSIGNMENT

3.1. TAM MÜLKİYET DEVRİ / FULL OWNERSHIP TRANSFER

Müşteri, yukarıda belirtilen uçuş aksaklığından kaynaklanan tazminat alacağının tam mülkiyetini ve yasal hakkını Şirkete devretmektedir. Bu devir şunları kapsar:

The Client hereby assigns to the Company full ownership and legal title to the compensation claim. This assignment includes:

• Türkiye'de: SHY-YOLCU Yönetmeliği (100-600 EUR)
• AB'de: EC 261/2004 Yönetmeliği (250-600 EUR)
• Tüm ek haklar ve faizler / All accessory rights and interest
• Tüm ilgili masraflar / All associated costs

3.2. YASAL DAYANAK / LEGAL BASIS

Bu temlik, 6098 Sayılı Türk Borçlar Kanunu Madde 183 uyarınca yapılmaktadır: "Kanun, sözleşme veya işin niteliği engel olmadıkça alacaklı, borçlunun rızasını aramaksızın alacağını üçüncü bir kişiye devredebilir."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. ŞİRKET YETKİLERİ / COMPANY RIGHTS

Temlik ile Şirket tek yetkili / sole authority olarak:

4.1. Havayoluna doğrudan başvurma / Contact airline directly
4.2. SHGM'ye başvurma / File with Civil Aviation Authority
4.3. Müzakere yapma / Negotiate settlements
4.4. Uzlaşma tekliflerini kabul/red etme / Accept/reject settlement offers
4.5. Gerekirse dava açma / Initiate legal proceedings
4.6. Tazminat ödemesini tahsil etme / Collect compensation payment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. MÜŞTERİ TAAHHÜTLERİ / CLIENT UNDERTAKINGS

5.1. İLETİŞİM YASAĞI / NO DIRECT CONTACT

Müşteri, temlik sonrası havayolu veya SHGM ile DOĞRUDAN İLETİŞİME GEÇMEYECEĞİNİ, DOĞRUDAN ÖDEME KABUL ETMEYECEĞİNİ taahhüt eder.

Client undertakes NOT TO CONTACT the airline/authority directly and NOT TO ACCEPT direct payment.

5.2. BİLGİLENDİRME YÜKÜMLÜLÜĞÜ / DISCLOSURE OBLIGATION

Havayolu/SHGM'den doğrudan ödeme alırsa derhal Şirketi bilgilendirecektir.
If receiving direct payment, Client must notify Company immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. HİZMET BEDELİ / SERVICE FEE

┌─────────────────────────────────────────────────────────────────────────────┐
│                            NO WIN = NO FEE                                   │
│                                                                              │
│           Başarılı Olursak: %25 Hizmet Bedeli                               │
│           If Successful: 25% Service Fee                                     │
│                                                                              │
│           Başarısız Olursak: 0 TL (HİÇBİR ÜCRET YOK)                        │
│           If Unsuccessful: 0 EUR (NO FEE)                                    │
└─────────────────────────────────────────────────────────────────────────────┘

6.1. Tahsil edilen tutarın %25'i Şirket hizmet bedeli olarak alınır.
6.2. Kalan %75 tutar, Müşteriye en geç 14 iş günü içinde ödenir.
6.3. Başarısız olunması halinde Müşteriden hiçbir ücret talep edilmez.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. KİŞİSEL VERİLER / DATA PROTECTION

Müşteri, kişisel verilerinin:
• Havayoluna iletilmesini
• SHGM'ye iletilmesini
• Hukuki süreçlerde kullanılmasını
• Tazminat takibi amacıyla işlenmesini

6698 sayılı KVKK kapsamında kabul eder.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. SÜRE VE FESİH / TERM & TERMINATION

8.1. Bu sözleşme, alacak tahsil edilene veya tahsil edilemeyeceği kesinleşene kadar geçerlidir.
8.2. Müşteri, Şirket somut işleme başlamadan önce yazılı bildirimle feshedebilir.
8.3. Temlik yapıldıktan sonra tek taraflı fesih mümkün değildir.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. YEDEKLİLİK HÜKMÜ / FALLBACK PROVISION

⚠️ Önemli: Bu temlikin herhangi bir sebeple geçersiz sayılması halinde, bu sözleşme otomatik olarak VEKALETNAME'ye dönüşür ve Şirket Müşteri adına tüm işlemleri yapmaya yetkilidir.

If this assignment is deemed invalid, it shall automatically be considered a POWER OF ATTORNEY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. DİĞER HÜKÜMLER / OTHER PROVISIONS

10.1. Bu sözleşme Türk hukukuna tabidir.
10.2. İhtilaflar İstanbul mahkemelerinde çözülür.
10.3. Elektronik imza, ıslak imza ile eşdeğerdir.
10.4. Bu sözleşme noter tasdiki gerektirmez.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. KABUL VE ONAY / ACCEPTANCE

┌─────────────────────────────────────────────────────────────────────────────┐
│                           ONAY / CONFIRMATION                                │
│                                                                              │
│  Bu sözleşmeyi okudum, anladım ve kabul ediyorum. Tazminat alacağımın       │
│  tam mülkiyetini Şirkete devrettiğimi onaylıyorum.                          │
│                                                                              │
│  I have read, understood and accept this agreement. I confirm that I        │
│  transfer full ownership of my compensation claim to the Company.            │
└─────────────────────────────────────────────────────────────────────────────┘

Tarih / Date: ${today}

MÜŞTERİ / CLIENT                          ŞİRKET / COMPANY
Ad Soyad: ${data.clientName}              Yetkili: UçuşTazminat
İmza / Signature:                          İmza ve Kaşe:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

info@ucustazminat.com | +90 532 123 45 67 | www.ucustazminat.com

Bu sözleşme TBK m.183 uyarınca noter tasdiki gerektirmez ve elektronik ortamda imzalanabilir.
This agreement does not require notarization per TBK Art. 183 and can be signed electronically.
`
}

export function getIssueTypeText(type: string): string {
  const types: Record<string, string> = {
    'DELAY': 'Rötar / Delay',
    'CANCELLATION': 'İptal / Cancellation',
    'DENIED_BOARDING': 'Uçuşa Kabul Edilmeme / Denied Boarding',
    'DOWNGRADE': 'Alt Sınıfa İndirme / Downgrade',
  }
  return types[type] || type
}
