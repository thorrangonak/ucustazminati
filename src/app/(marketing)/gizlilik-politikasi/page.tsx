import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | UçuşTazminat',
  description: 'UçuşTazminat gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında detaylı bilgi.',
  alternates: {
    canonical: 'https://ucustazminat.com/gizlilik-politikasi',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Gizlilik Politikası</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              Son güncelleme: 1 Ocak 2026
            </p>

            <h2>1. Giriş</h2>
            <p>
              UçuşTazminat ("biz", "bizim" veya "şirket") olarak, gizliliğinize saygı duyuyor ve
              kişisel verilerinizi korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, web sitemizi
              (ucustazminat.com) ziyaret ettiğinizde veya hizmetlerimizi kullandığınızda kişisel
              verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.
            </p>

            <h2>2. Topladığımız Bilgiler</h2>
            <h3>2.1 Doğrudan Sağladığınız Bilgiler</h3>
            <ul>
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
              <li><strong>Uçuş Bilgileri:</strong> Uçuş numarası, tarih, havayolu, havalimanları</li>
              <li><strong>Finansal Bilgiler:</strong> IBAN, banka hesap bilgileri (tazminat ödemesi için)</li>
              <li><strong>Belgeler:</strong> Biniş kartı, bilet, kimlik belgesi kopyaları</li>
            </ul>

            <h3>2.2 Otomatik Olarak Toplanan Bilgiler</h3>
            <ul>
              <li><strong>Cihaz Bilgileri:</strong> IP adresi, tarayıcı türü, işletim sistemi</li>
              <li><strong>Kullanım Verileri:</strong> Ziyaret edilen sayfalar, tıklama verileri</li>
              <li><strong>Çerezler:</strong> Oturum ve tercih çerezleri</li>
            </ul>

            <h2>3. Bilgilerin Kullanım Amaçları</h2>
            <p>Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:</p>
            <ul>
              <li>Tazminat talebinizi işlemek ve havayolu ile iletişime geçmek</li>
              <li>Hesabınızı oluşturmak ve yönetmek</li>
              <li>Talep durumunuz hakkında sizi bilgilendirmek</li>
              <li>Ödeme işlemlerini gerçekleştirmek</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              <li>Hizmetlerimizi geliştirmek</li>
            </ul>

            <h2>4. Bilgi Paylaşımı</h2>
            <p>Kişisel verilerinizi yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşırız:</p>
            <ul>
              <li><strong>Havayolları:</strong> Tazminat talebinizi işlemek için</li>
              <li><strong>Hukuk Büroları:</strong> Yasal süreç gerektiğinde</li>
              <li><strong>Ödeme İşlemcileri:</strong> Tazminat ödemesi için</li>
              <li><strong>Yasal Gereklilikler:</strong> Kanuni zorunluluk halinde</li>
            </ul>

            <h2>5. Veri Güvenliği</h2>
            <p>
              Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:
            </p>
            <ul>
              <li>SSL/TLS şifreleme</li>
              <li>Güvenli veri merkezleri</li>
              <li>Erişim kontrolü ve yetkilendirme</li>
              <li>Düzenli güvenlik denetimleri</li>
            </ul>

            <h2>6. Veri Saklama Süresi</h2>
            <p>
              Kişisel verilerinizi, hizmetlerimizi sunmak için gerekli olan süre boyunca ve
              yasal yükümlülüklerimizi yerine getirmek için gereken süre kadar saklarız.
              Tazminat talepleri için bu süre genellikle 10 yıldır.
            </p>

            <h2>7. Haklarınız</h2>
            <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi
                  suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde
                  zararın giderilmesini talep etme</li>
            </ul>

            <h2>8. Çerezler</h2>
            <p>
              Web sitemiz çerez kullanmaktadır. Çerez politikamız hakkında detaylı bilgi için
              <a href="/cerez-politikasi" className="text-primary"> Çerez Politikası</a> sayfamızı
              ziyaret edebilirsiniz.
            </p>

            <h2>9. Üçüncü Taraf Bağlantıları</h2>
            <p>
              Web sitemiz üçüncü taraf web sitelerine bağlantılar içerebilir. Bu sitelerin
              gizlilik uygulamalarından sorumlu değiliz.
            </p>

            <h2>10. Çocukların Gizliliği</h2>
            <p>
              Hizmetlerimiz 18 yaşın altındaki bireylere yönelik değildir. Bilerek 18 yaşın
              altındaki kişilerden kişisel veri toplamıyoruz.
            </p>

            <h2>11. Politika Değişiklikleri</h2>
            <p>
              Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada
              yayınlanacak ve önemli değişiklikler için e-posta ile bilgilendirileceksiniz.
            </p>

            <h2>12. İletişim</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <ul>
              <li><strong>E-posta:</strong> gizlilik@ucustazminat.com</li>
              <li><strong>Adres:</strong> İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
