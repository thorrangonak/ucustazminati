import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Çerez Politikası | UçuşTazminat',
  description: 'UçuşTazminat çerez politikası. Web sitemizde kullanılan çerezler ve bunları nasıl yönetebileceğiniz hakkında bilgi.',
  alternates: {
    canonical: 'https://ucustazminat.com/cerez-politikasi',
  },
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Çerez Politikası</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              Son güncelleme: 1 Ocak 2026
            </p>

            <h2>1. Çerez Nedir?</h2>
            <p>
              Çerezler (cookies), web sitelerinin tarayıcınız aracılığıyla cihazınıza
              kaydettiği küçük metin dosyalarıdır. Çerezler, web sitesinin düzgün çalışması,
              güvenliğin sağlanması, kullanıcı deneyiminin iyileştirilmesi ve site
              performansının analiz edilmesi gibi amaçlarla kullanılmaktadır.
            </p>

            <h2>2. Çerez Türleri</h2>
            <h3>2.1 Zorunlu Çerezler</h3>
            <p>
              Bu çerezler web sitesinin temel işlevlerini yerine getirmesi için gereklidir.
              Bunlar olmadan site düzgün çalışamaz.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Çerez Adı</th>
                  <th className="border p-2 text-left">Amaç</th>
                  <th className="border p-2 text-left">Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">session_id</td>
                  <td className="border p-2">Oturum yönetimi</td>
                  <td className="border p-2">Oturum süresi</td>
                </tr>
                <tr>
                  <td className="border p-2">csrf_token</td>
                  <td className="border p-2">Güvenlik (CSRF koruması)</td>
                  <td className="border p-2">Oturum süresi</td>
                </tr>
                <tr>
                  <td className="border p-2">cookie_consent</td>
                  <td className="border p-2">Çerez tercihlerinizi kaydetme</td>
                  <td className="border p-2">1 yıl</td>
                </tr>
              </tbody>
            </table>

            <h3>2.2 İşlevsel Çerezler</h3>
            <p>
              Bu çerezler, dil tercihi, tema seçimi gibi kullanıcı tercihlerini hatırlamak
              için kullanılır.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Çerez Adı</th>
                  <th className="border p-2 text-left">Amaç</th>
                  <th className="border p-2 text-left">Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">language</td>
                  <td className="border p-2">Dil tercihi</td>
                  <td className="border p-2">1 yıl</td>
                </tr>
                <tr>
                  <td className="border p-2">theme</td>
                  <td className="border p-2">Tema tercihi (açık/koyu)</td>
                  <td className="border p-2">1 yıl</td>
                </tr>
              </tbody>
            </table>

            <h3>2.3 Analitik Çerezler</h3>
            <p>
              Bu çerezler, ziyaretçilerin siteyi nasıl kullandığını anlamamıza ve
              siteyi geliştirmemize yardımcı olur.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Çerez Adı</th>
                  <th className="border p-2 text-left">Sağlayıcı</th>
                  <th className="border p-2 text-left">Amaç</th>
                  <th className="border p-2 text-left">Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">_ga</td>
                  <td className="border p-2">Google Analytics</td>
                  <td className="border p-2">Kullanıcı ayrımı</td>
                  <td className="border p-2">2 yıl</td>
                </tr>
                <tr>
                  <td className="border p-2">_gid</td>
                  <td className="border p-2">Google Analytics</td>
                  <td className="border p-2">Kullanıcı ayrımı</td>
                  <td className="border p-2">24 saat</td>
                </tr>
                <tr>
                  <td className="border p-2">_gat</td>
                  <td className="border p-2">Google Analytics</td>
                  <td className="border p-2">İstek oranı sınırlama</td>
                  <td className="border p-2">1 dakika</td>
                </tr>
              </tbody>
            </table>

            <h3>2.4 Pazarlama Çerezleri</h3>
            <p>
              Bu çerezler, size ilgi alanlarınıza uygun reklamlar göstermek için kullanılır.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Çerez Adı</th>
                  <th className="border p-2 text-left">Sağlayıcı</th>
                  <th className="border p-2 text-left">Amaç</th>
                  <th className="border p-2 text-left">Süre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">_fbp</td>
                  <td className="border p-2">Facebook</td>
                  <td className="border p-2">Reklam hedefleme</td>
                  <td className="border p-2">3 ay</td>
                </tr>
                <tr>
                  <td className="border p-2">_gcl_au</td>
                  <td className="border p-2">Google Ads</td>
                  <td className="border p-2">Dönüşüm takibi</td>
                  <td className="border p-2">3 ay</td>
                </tr>
              </tbody>
            </table>

            <h2>3. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
            <h3>3.1 Tarayıcı Ayarları</h3>
            <p>
              Çoğu web tarayıcısı, çerezleri kabul etme, reddetme veya silme seçenekleri
              sunar. Tarayıcınıza göre çerez ayarlarını aşağıdaki bağlantılardan
              yönetebilirsiniz:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/tr/kb/cerezleri-silme-web-sitelerinin-bilgilerini-kaldirma" target="_blank" rel="noopener noreferrer" className="text-primary">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/tr-tr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary">Safari</a></li>
              <li><a href="https://support.microsoft.com/tr-tr/microsoft-edge/microsoft-edge-de-tanımlama-bilgilerini-silme" target="_blank" rel="noopener noreferrer" className="text-primary">Microsoft Edge</a></li>
            </ul>

            <h3>3.2 Çerez Tercih Aracı</h3>
            <p>
              Sitemizde bulunan çerez tercih aracını kullanarak çerez tercihlerinizi
              istediğiniz zaman değiştirebilirsiniz. Zorunlu çerezler dışındaki tüm
              çerezleri devre dışı bırakabilirsiniz.
            </p>

            <h3>3.3 Üçüncü Taraf Araçları</h3>
            <p>
              Çevrimiçi reklamlarda kullanılan çerezleri yönetmek için aşağıdaki
              araçları kullanabilirsiniz:
            </p>
            <ul>
              <li><a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary">Digital Advertising Alliance</a></li>
              <li><a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-primary">Your Online Choices (AB)</a></li>
            </ul>

            <h2>4. Çerezleri Reddetmenin Sonuçları</h2>
            <p>
              Çerezleri devre dışı bırakırsanız:
            </p>
            <ul>
              <li>Sitedeki bazı özellikler düzgün çalışmayabilir</li>
              <li>Oturum açık kalma özelliği devre dışı kalabilir</li>
              <li>Dil ve tema tercihleriniz kaydedilmeyebilir</li>
              <li>Size özel içerik sunmamız mümkün olmayabilir</li>
            </ul>

            <h2>5. Çerez Politikası Değişiklikleri</h2>
            <p>
              Bu Çerez Politikasını zaman zaman güncelleyebiliriz. Değişiklikler bu
              sayfada yayınlanacak ve önemli değişiklikler için ayrıca bilgilendirileceksiniz.
            </p>

            <h2>6. Benzer Teknolojiler</h2>
            <p>
              Çerezlere ek olarak, aşağıdaki benzer teknolojileri de kullanabiliriz:
            </p>
            <ul>
              <li><strong>Piksel etiketleri (web beacons):</strong> E-postalarda ve web sayfalarında
                  kullanılan küçük görüntüler</li>
              <li><strong>Yerel depolama (Local Storage):</strong> Tarayıcınızda veri saklamak için
                  kullanılan teknoloji</li>
              <li><strong>Session Storage:</strong> Oturum süresince veri saklamak için kullanılan
                  teknoloji</li>
            </ul>

            <h2>7. İletişim</h2>
            <p>
              Çerez politikamız hakkında sorularınız için:
            </p>
            <ul>
              <li><strong>E-posta:</strong> cerez@ucustazminat.com</li>
              <li><strong>Adres:</strong> İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
