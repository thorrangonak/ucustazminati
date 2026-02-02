import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | UçuşTazminat',
  description: 'UçuşTazminat kullanım koşulları ve şartları. Hizmetlerimizi kullanmadan önce lütfen bu koşulları okuyun.',
  alternates: {
    canonical: 'https://ucustazminat.com/kullanim-kosullari',
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Kullanım Koşulları</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              Son güncelleme: 1 Ocak 2026
            </p>

            <h2>1. Kabul ve Onay</h2>
            <p>
              UçuşTazminat web sitesini (ucustazminat.com) veya hizmetlerini kullanarak,
              bu Kullanım Koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan
              etmiş olursunuz. Bu koşulları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayın.
            </p>

            <h2>2. Hizmet Tanımı</h2>
            <p>
              UçuşTazminat, uçuş gecikmeleri, iptalleri ve overbooking durumlarında yolcuların
              tazminat taleplerini takip eden bir hizmet sunmaktadır. Hizmetlerimiz şunları kapsar:
            </p>
            <ul>
              <li>Tazminat uygunluğunun değerlendirilmesi</li>
              <li>Havayolu ile iletişim ve müzakere</li>
              <li>Gerektiğinde yasal süreç yönetimi</li>
              <li>Tazminat ödemesinin takibi</li>
            </ul>

            <h2>3. Üyelik ve Hesap</h2>
            <h3>3.1 Hesap Oluşturma</h3>
            <p>
              Hizmetlerimizi kullanmak için bir hesap oluşturmanız gerekmektedir.
              Hesap oluştururken doğru ve güncel bilgiler vermeyi kabul edersiniz.
            </p>

            <h3>3.2 Hesap Güvenliği</h3>
            <p>
              Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi gizli tutmalı ve
              yetkisiz erişim durumunda derhal bizi bilgilendirmelisiniz.
            </p>

            <h2>4. Ücretler ve Ödeme</h2>
            <h3>4.1 Başarı Bazlı Ücret</h3>
            <p>
              Hizmetlerimiz "başarıya bağlı" ücretlendirme modeli ile çalışır:
            </p>
            <ul>
              <li>Başvuru ve değerlendirme ücretsizdir</li>
              <li>Yalnızca tazminat alındığında ücret alınır</li>
              <li>Standart komisyon oranı: %25 (KDV dahil)</li>
              <li>Tazminat alınamazsa herhangi bir ücret ödenmez</li>
            </ul>

            <h3>4.2 Ödeme Koşulları</h3>
            <p>
              Havayolundan tahsil edilen tazminat tutarından komisyonumuz düşüldükten sonra
              kalan miktar, belirttiğiniz banka hesabına 14 iş günü içinde aktarılır.
            </p>

            <h2>5. Yetkilendirme</h2>
            <p>
              Tazminat başvurusu yaparak, UçuşTazminat'ı aşağıdaki konularda yetkilendirmiş olursunuz:
            </p>
            <ul>
              <li>Adınıza havayolu ile iletişime geçme</li>
              <li>Tazminat talebinizi takip etme</li>
              <li>Gerektiğinde yasal süreç başlatma</li>
              <li>Tazminat ödemesini sizin adınıza tahsil etme</li>
            </ul>

            <h2>6. Kullanıcı Yükümlülükleri</h2>
            <p>Hizmetlerimizi kullanırken aşağıdaki yükümlülükleri kabul edersiniz:</p>
            <ul>
              <li>Doğru ve eksiksiz bilgi vermek</li>
              <li>Gerekli belgeleri zamanında sağlamak</li>
              <li>İletişim bilgilerinizi güncel tutmak</li>
              <li>Başvurunuz hakkında bizimle işbirliği yapmak</li>
              <li>Aynı talep için başka bir hizmet sağlayıcı ile çalışmamak</li>
            </ul>

            <h2>7. Sorumluluk Sınırlaması</h2>
            <p>
              UçuşTazminat, aşağıdaki durumlardan sorumlu tutulamaz:
            </p>
            <ul>
              <li>Havayolunun tazminat ödemeyi reddetmesi</li>
              <li>Kullanıcının yanlış veya eksik bilgi vermesi</li>
              <li>Yasal süreçlerin beklenenden uzun sürmesi</li>
              <li>Mücbir sebeplerden kaynaklanan gecikmeler</li>
            </ul>

            <h2>8. Fikri Mülkiyet</h2>
            <p>
              Web sitemizdeki tüm içerik, tasarım, logo, metin ve görseller UçuşTazminat'a
              aittir ve telif hakkı ile korunmaktadır. İzinsiz kullanım yasaktır.
            </p>

            <h2>9. Sözleşme Feshi</h2>
            <p>
              Taraflardan her biri, yazılı bildirim ile sözleşmeyi feshedebilir. Ancak,
              havayolu ile görüşmelerin başlamış olması halinde, fesih durumunda
              o ana kadar yapılan masraflar talep edilebilir.
            </p>

            <h2>10. Uyuşmazlıkların Çözümü</h2>
            <p>
              Bu koşullardan doğan uyuşmazlıklarda İstanbul Mahkemeleri ve
              İcra Daireleri yetkilidir. Türk hukuku uygulanır.
            </p>

            <h2>11. Değişiklikler</h2>
            <p>
              Bu kullanım koşullarını önceden bildirimde bulunmaksızın değiştirme
              hakkını saklı tutarız. Değişiklikler web sitemizde yayınlandığı
              tarihte yürürlüğe girer.
            </p>

            <h2>12. Bölünebilirlik</h2>
            <p>
              Bu koşulların herhangi bir hükmünün geçersiz veya uygulanamaz olması
              durumunda, diğer hükümler geçerliliğini korumaya devam eder.
            </p>

            <h2>13. İletişim</h2>
            <p>
              Kullanım koşulları hakkında sorularınız için:
            </p>
            <ul>
              <li><strong>E-posta:</strong> hukuk@ucustazminat.com</li>
              <li><strong>Adres:</strong> İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
