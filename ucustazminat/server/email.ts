import { Resend } from 'resend';

// Resend client - API key env'den alınacak
const resend = new Resend(process.env.RESEND_API_KEY);

// E-posta gönderici adresi
const FROM_EMAIL = 'UçuşTazminat <bildirim@mail.ucustazminat.com>';
const FROM_EMAIL_NOREPLY = 'UçuşTazminat <noreply@mail.ucustazminat.com>';

// Durum etiketleri
const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  submitted: 'Gönderildi',
  under_review: 'İnceleniyor',
  documents_needed: 'Belge Bekleniyor',
  sent_to_airline: 'Havayoluna Gönderildi',
  airline_response: 'Havayolu Yanıtı',
  legal_action: 'Hukuki Süreç',
  approved: 'Onaylandı',
  payment_pending: 'Ödeme Bekleniyor',
  paid: 'Ödendi',
  rejected: 'Reddedildi',
  closed: 'Kapatıldı',
};

// HTML e-posta şablonu
function getEmailTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e5e5;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 24px;
      font-weight: bold;
      color: #000;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      background-color: #dc2626;
    }
    h1 {
      color: #000;
      font-size: 24px;
      margin: 24px 0 16px;
    }
    .content {
      margin-bottom: 32px;
    }
    .info-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-size: 14px;
    }
    .info-value {
      font-weight: 600;
      color: #111827;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 500;
    }
    .status-submitted { background-color: #dbeafe; color: #1d4ed8; }
    .status-under_review { background-color: #fef3c7; color: #d97706; }
    .status-documents_needed { background-color: #fee2e2; color: #dc2626; }
    .status-approved { background-color: #d1fae5; color: #059669; }
    .status-paid { background-color: #d1fae5; color: #059669; }
    .status-rejected { background-color: #fee2e2; color: #dc2626; }
    .button {
      display: inline-block;
      background-color: #dc2626;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #b91c1c;
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #dc2626;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon"></div>
        <span>UçuşTazminat</span>
      </div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Bu e-posta UçuşTazminat tarafından gönderilmiştir.</p>
      <p>
        <a href="https://www.ucustazminat.com">ucustazminat.com</a> | 
        <a href="https://www.ucustazminat.com/dashboard">Panelim</a>
      </p>
      <p style="margin-top: 16px;">
        © ${new Date().getFullYear()} UçuşTazminat. Tüm hakları saklıdır.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

// Talep oluşturuldu e-postası
export async function sendClaimCreatedEmail(params: {
  to: string;
  passengerName: string;
  claimNumber: string;
  flightNumber: string;
  flightDate: string;
  departureAirport: string;
  arrivalAirport: string;
  compensationAmount: number;
}): Promise<boolean> {
  const content = `
    <h1>Talebiniz Başarıyla Oluşturuldu</h1>
    <p>Sayın ${params.passengerName},</p>
    <p>Tazminat talebiniz başarıyla oluşturuldu ve inceleme sürecine alındı. Talebinizin durumunu aşağıdaki bilgilerle takip edebilirsiniz.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Talep Numarası</span>
        <span class="info-value">${params.claimNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Uçuş</span>
        <span class="info-value">${params.flightNumber} - ${params.departureAirport} → ${params.arrivalAirport}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Uçuş Tarihi</span>
        <span class="info-value">${params.flightDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tahmini Tazminat</span>
        <span class="info-value" style="color: #059669; font-size: 18px;">${params.compensationAmount.toFixed(2)} €</span>
      </div>
    </div>
    
    <p>Talebinizi panelimizden takip edebilirsiniz:</p>
    <p style="text-align: center;">
      <a href="https://www.ucustazminat.com/dashboard" class="button">Talebimi Görüntüle</a>
    </p>
    
    <p><strong>Sonraki Adımlar:</strong></p>
    <ul>
      <li>Belgelerinizi inceleyeceğiz</li>
      <li>Havayolu şirketi ile iletişime geçeceğiz</li>
      <li>Süreç hakkında sizi bilgilendireceğiz</li>
    </ul>
    
    <p>Herhangi bir sorunuz varsa, lütfen bizimle iletişime geçmekten çekinmeyin.</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Talebiniz Oluşturuldu - ${params.claimNumber}`,
      html: getEmailTemplate(content, 'Talep Oluşturuldu'),
    });

    if (error) {
      console.error('[Email] Failed to send claim created email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Error sending claim created email:', err);
    return false;
  }
}

// Durum değişikliği e-postası
export async function sendStatusUpdateEmail(params: {
  to: string;
  passengerName: string;
  claimNumber: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
}): Promise<boolean> {
  const statusLabel = STATUS_LABELS[params.newStatus] || params.newStatus;
  const statusClass = `status-${params.newStatus}`;
  
  let statusMessage = '';
  switch (params.newStatus) {
    case 'under_review':
      statusMessage = 'Talebiniz şu anda uzman ekibimiz tarafından incelenmektedir.';
      break;
    case 'documents_needed':
      statusMessage = 'Talebinizin işleme alınabilmesi için ek belgeler gerekmektedir. Lütfen panelinizi kontrol edin.';
      break;
    case 'sent_to_airline':
      statusMessage = 'Talebiniz havayolu şirketine iletilmiştir. Yanıt bekliyoruz.';
      break;
    case 'approved':
      statusMessage = 'Tebrikler! Talebiniz onaylandı. Ödeme süreci başlatılacaktır.';
      break;
    case 'payment_pending':
      statusMessage = 'Ödemeniz hazırlanıyor. Kısa süre içinde hesabınıza aktarılacaktır.';
      break;
    case 'paid':
      statusMessage = 'Ödemeniz başarıyla tamamlandı! Hesabınızı kontrol edebilirsiniz.';
      break;
    case 'rejected':
      statusMessage = 'Maalesef talebiniz reddedildi. Detaylar için panelinizi kontrol edin.';
      break;
    default:
      statusMessage = 'Talebinizin durumu güncellendi.';
  }

  const content = `
    <h1>Talep Durumu Güncellendi</h1>
    <p>Sayın ${params.passengerName},</p>
    <p>${params.claimNumber} numaralı talebinizin durumu güncellendi.</p>
    
    <div class="info-box" style="text-align: center;">
      <p style="margin-bottom: 8px; color: #6b7280;">Yeni Durum</p>
      <span class="status-badge ${statusClass}">${statusLabel}</span>
    </div>
    
    <p>${statusMessage}</p>
    
    ${params.note ? `
    <div class="info-box" style="background-color: #fef3c7; border-color: #fcd34d;">
      <p style="margin: 0;"><strong>Not:</strong> ${params.note}</p>
    </div>
    ` : ''}
    
    <p style="text-align: center;">
      <a href="https://www.ucustazminat.com/dashboard" class="button">Detayları Görüntüle</a>
    </p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Talep Durumu: ${statusLabel} - ${params.claimNumber}`,
      html: getEmailTemplate(content, 'Durum Güncellendi'),
    });

    if (error) {
      console.error('[Email] Failed to send status update email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Error sending status update email:', err);
    return false;
  }
}

// Belge eksikliği hatırlatma e-postası
export async function sendDocumentReminderEmail(params: {
  to: string;
  passengerName: string;
  claimNumber: string;
  missingDocuments?: string[];
}): Promise<boolean> {
  const content = `
    <h1>Belge Hatırlatması</h1>
    <p>Sayın ${params.passengerName},</p>
    <p>${params.claimNumber} numaralı talebinizin işleme alınabilmesi için bazı belgeler eksik görünüyor.</p>
    
    ${params.missingDocuments && params.missingDocuments.length > 0 ? `
    <div class="info-box">
      <p style="margin-bottom: 8px;"><strong>Eksik Belgeler:</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        ${params.missingDocuments.map(doc => `<li>${doc}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <p>Lütfen eksik belgelerinizi en kısa sürede yükleyin. Belgeleriniz tamamlandığında talebiniz otomatik olarak inceleme sürecine alınacaktır.</p>
    
    <p style="text-align: center;">
      <a href="https://www.ucustazminat.com/dashboard" class="button">Belge Yükle</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px;">
      <strong>İpucu:</strong> Biniş kartı, e-bilet veya rezervasyon onayı ve kimlik belgesi (TC kimlik veya pasaport) yüklemeniz gerekmektedir.
    </p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Belge Hatırlatması - ${params.claimNumber}`,
      html: getEmailTemplate(content, 'Belge Hatırlatması'),
    });

    if (error) {
      console.error('[Email] Failed to send document reminder email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Error sending document reminder email:', err);
    return false;
  }
}

// Hoş geldin e-postası (ilk kayıt)
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<boolean> {
  const content = `
    <h1>UçuşTazminat'a Hoş Geldiniz!</h1>
    <p>Sayın ${params.name},</p>
    <p>UçuşTazminat ailesine katıldığınız için teşekkür ederiz. Artık geciken, iptal edilen veya fazla rezervasyon yapılan uçuşlarınız için tazminat talep edebilirsiniz.</p>
    
    <div class="info-box">
      <p style="margin: 0;"><strong>Neden UçuşTazminat?</strong></p>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li>600 Euro'ya kadar tazminat</li>
        <li>Başarı garantisi - Kazanamazsak ücret yok</li>
        <li>Sadece %25 komisyon</li>
        <li>Tüm hukuki süreçleri biz yönetiyoruz</li>
      </ul>
    </div>
    
    <p style="text-align: center;">
      <a href="https://www.ucustazminat.com/#hesapla" class="button">Tazminatımı Hesapla</a>
    </p>
    
    <p>Herhangi bir sorunuz varsa, size yardımcı olmaktan mutluluk duyarız.</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: 'UçuşTazminat\'a Hoş Geldiniz!',
      html: getEmailTemplate(content, 'Hoş Geldiniz'),
    });

    if (error) {
      console.error('[Email] Failed to send welcome email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Error sending welcome email:', err);
    return false;
  }
}


// Genel e-posta gönderme fonksiyonu
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: getEmailTemplate(params.html, params.subject),
    });

    if (error) {
      console.error('[Email] Failed to send email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Error sending email:', err);
    return false;
  }
}


// Şifre sıfırlama e-postası
export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  token: string
): Promise<boolean> {
  const resetUrl = `https://www.ucustazminat.com/sifre-sifirla?token=${token}`;
  
  const content = `
    <h1>Şifre Sıfırlama Talebi</h1>
    <p>Sayın ${userName},</p>
    <p>UçuşTazminat hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
    
    <p style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="button" style="font-size: 16px; padding: 16px 32px;">Şifremi Sıfırla</a>
    </p>
    
    <div class="info-box" style="background-color: #fef3c7; border-color: #fcd34d;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ Önemli:</strong> Bu link 1 saat içinde geçerliliğini yitirecektir.
      </p>
    </div>
    
    <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz. Hesabınız güvende kalacaktır.</p>
    
    <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
      Link çalışmıyorsa, aşağıdaki adresi tarayıcınıza kopyalayın:<br>
      <span style="word-break: break-all; color: #dc2626;">${resetUrl}</span>
    </p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL_NOREPLY,
      to: to,
      subject: 'Şifre Sıfırlama Talebi - UçuşTazminat',
      html: getEmailTemplate(content, 'Şifre Sıfırlama'),
    });

    if (error) {
      console.error('[Email] Failed to send password reset email:', error);
      return false;
    }
    
    console.log(`[Email] Password reset email sent to ${to}`);
    return true;
  } catch (err) {
    console.error('[Email] Error sending password reset email:', err);
    return false;
  }
}


// E-posta doğrulama e-postası
export async function sendEmailVerificationEmail(
  to: string,
  userName: string,
  token: string
): Promise<boolean> {
  const verifyUrl = `https://www.ucustazminat.com/email-dogrula?token=${token}`;
  
  const content = `
    <h1>E-posta Adresinizi Doğrulayın</h1>
    <p>Sayın ${userName},</p>
    <p>UçuşTazminat'a hoş geldiniz! Hesabınızı aktifleştirmek için lütfen e-posta adresinizi doğrulayın:</p>
    
    <p style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" class="button" style="font-size: 16px; padding: 16px 32px;">E-postamı Doğrula</a>
    </p>
    
    <div class="info-box">
      <p style="margin: 0; font-size: 14px;">
        <strong>Neden doğrulama gerekli?</strong><br>
        E-posta doğrulaması, hesabınızın güvenliğini sağlar ve size önemli bildirimler gönderebilmemizi mümkün kılar.
      </p>
    </div>
    
    <div class="info-box" style="background-color: #fef3c7; border-color: #fcd34d; margin-top: 16px;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ Önemli:</strong> Bu link 24 saat içinde geçerliliğini yitirecektir.
      </p>
    </div>
    
    <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    
    <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
      Link çalışmıyorsa, aşağıdaki adresi tarayıcınıza kopyalayın:<br>
      <span style="word-break: break-all; color: #dc2626;">${verifyUrl}</span>
    </p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL_NOREPLY,
      to: to,
      subject: 'E-posta Adresinizi Doğrulayın - UçuşTazminat',
      html: getEmailTemplate(content, 'E-posta Doğrulama'),
    });

    if (error) {
      console.error('[Email] Failed to send verification email:', error);
      return false;
    }
    
    console.log(`[Email] Verification email sent to ${to}`);
    return true;
  } catch (err) {
    console.error('[Email] Error sending verification email:', err);
    return false;
  }
}
