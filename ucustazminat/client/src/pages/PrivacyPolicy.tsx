import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.privacy} />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <div className="w-8 h-8 bg-primary rounded" />
              <span className="font-bold text-xl">UçuşTazminat</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8 md:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-4xl">
          <h1>Gizlilik Politikası</h1>
          <p className="text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

          <h2>1. Giriş</h2>
          <p>
            UçuşTazminat olarak kişisel verilerinizin gizliliğini ve güvenliğini ciddiye alıyoruz. 
            Bu Gizlilik Politikası, hangi verileri topladığımızı, nasıl kullandığımızı ve 
            haklarınızı açıklar.
          </p>

          <h2>2. Veri Sorumlusu</h2>
          <p>
            Kişisel verilerinizin işlenmesinden UçuşTazminat sorumludur.
          </p>
          <ul>
            <li>E-posta: destek@ucustazminat.com</li>
            <li>Web: www.ucustazminat.com</li>
          </ul>

          <h2>3. Toplanan Veriler</h2>
          <p>Hizmetlerimizi sunmak için aşağıdaki kişisel verileri topluyoruz:</p>
          
          <h3>3.1. Kimlik Bilgileri</h3>
          <ul>
            <li>Ad ve soyad</li>
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>Kimlik/pasaport bilgileri (belge yüklemelerinde)</li>
          </ul>

          <h3>3.2. Uçuş Bilgileri</h3>
          <ul>
            <li>Uçuş numarası ve tarihi</li>
            <li>Kalkış ve varış havalimanları</li>
            <li>Rezervasyon referansı</li>
            <li>Biniş kartı ve bilet bilgileri</li>
          </ul>

          <h3>3.3. Teknik Veriler</h3>
          <ul>
            <li>IP adresi</li>
            <li>Tarayıcı türü ve sürümü</li>
            <li>Cihaz bilgileri</li>
            <li>Çerez verileri</li>
          </ul>

          <h2>4. Verilerin Kullanım Amaçları</h2>
          <p>Kişisel verilerinizi aşağıdaki amaçlarla kullanıyoruz:</p>
          <ul>
            <li>Tazminat talebinizi işlemek ve takip etmek</li>
            <li>Havayolu şirketleri ile iletişim kurmak</li>
            <li>Size talep durumu hakkında bilgi vermek</li>
            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            <li>Hizmetlerimizi geliştirmek</li>
          </ul>

          <h2>5. Verilerin Paylaşımı</h2>
          <p>Kişisel verilerinizi aşağıdaki taraflarla paylaşabiliriz:</p>
          <ul>
            <li><strong>Havayolu şirketleri:</strong> Tazminat talebinizi iletmek için</li>
            <li><strong>Hukuk danışmanları:</strong> Gerektiğinde hukuki süreç için</li>
            <li><strong>Ödeme sağlayıcıları:</strong> Tazminat ödemesi için</li>
            <li><strong>Yetkili makamlar:</strong> Yasal zorunluluk halinde</li>
          </ul>
          <p>
            Verilerinizi hiçbir koşulda pazarlama amacıyla üçüncü taraflarla paylaşmayız.
          </p>

          <h2>6. Veri Güvenliği</h2>
          <p>
            Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:
          </p>
          <ul>
            <li>SSL/TLS şifreleme</li>
            <li>Güvenli veri merkezleri</li>
            <li>Erişim kontrolü ve yetkilendirme</li>
            <li>Düzenli güvenlik denetimleri</li>
          </ul>

          <h2>7. Veri Saklama Süresi</h2>
          <p>
            Kişisel verilerinizi talep süreciniz tamamlandıktan sonra yasal saklama 
            yükümlülüklerimiz kapsamında (genellikle 10 yıl) saklarız. Bu süre sonunda 
            verileriniz güvenli bir şekilde silinir.
          </p>

          <h2>8. Haklarınız</h2>
          <p>KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li><strong>Erişim hakkı:</strong> Hangi verilerinizi işlediğimizi öğrenme</li>
            <li><strong>Düzeltme hakkı:</strong> Yanlış verilerin düzeltilmesini isteme</li>
            <li><strong>Silme hakkı:</strong> Verilerinizin silinmesini talep etme</li>
            <li><strong>Kısıtlama hakkı:</strong> Veri işlemenin kısıtlanmasını isteme</li>
            <li><strong>Taşınabilirlik hakkı:</strong> Verilerinizi yapılandırılmış formatta alma</li>
            <li><strong>İtiraz hakkı:</strong> Veri işlemeye itiraz etme</li>
          </ul>
          <p>
            Bu haklarınızı kullanmak için destek@ucustazminat.com adresine başvurabilirsiniz.
          </p>

          <h2>9. Çerezler</h2>
          <p>
            Web sitemizde çerezler kullanıyoruz. Çerez kullanımımız hakkında detaylı bilgi için 
            Çerez Politikamızı inceleyebilirsiniz.
          </p>

          <h2>10. Çocukların Gizliliği</h2>
          <p>
            Hizmetlerimiz 18 yaş altı bireylere yönelik değildir. Bilerek 18 yaş altı 
            bireylerden veri toplamıyoruz.
          </p>

          <h2>11. Politika Değişiklikleri</h2>
          <p>
            Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişikliklerde 
            sizi e-posta ile bilgilendireceğiz.
          </p>

          <h2>12. İletişim</h2>
          <p>
            Gizlilik ile ilgili sorularınız için:
          </p>
          <ul>
            <li>E-posta: destek@ucustazminat.com</li>
            <li>Web: www.ucustazminat.com</li>
          </ul>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} UçuşTazminat. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
