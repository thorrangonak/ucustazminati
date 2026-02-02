import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";

export default function KVKKPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.kvkk} />
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
          <h1>KVKK Aydınlatma Metni</h1>
          <p className="text-muted-foreground">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni
          </p>
          <p className="text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

          <h2>1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz 
            veri sorumlusu sıfatıyla UçuşTazminat tarafından aşağıda açıklanan kapsamda işlenecektir.
          </p>

          <h2>2. Kişisel Verilerin İşlenme Amacı</h2>
          <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
          <ul>
            <li>Uçuş tazminat talebinizin oluşturulması ve takibi</li>
            <li>Havayolu şirketleri ile sizin adınıza iletişim kurulması</li>
            <li>Hukuki süreçlerin yürütülmesi</li>
            <li>Tazminat ödemelerinin gerçekleştirilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>İletişim faaliyetlerinin yürütülmesi</li>
            <li>Hizmet kalitesinin artırılması</li>
          </ul>

          <h2>3. İşlenen Kişisel Veriler</h2>
          <table>
            <thead>
              <tr>
                <th>Veri Kategorisi</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kimlik Bilgileri</td>
                <td>Ad, soyad, T.C. kimlik numarası, pasaport numarası</td>
              </tr>
              <tr>
                <td>İletişim Bilgileri</td>
                <td>E-posta adresi, telefon numarası, adres</td>
              </tr>
              <tr>
                <td>Uçuş Bilgileri</td>
                <td>Uçuş numarası, tarih, güzergah, rezervasyon bilgileri</td>
              </tr>
              <tr>
                <td>Finansal Bilgiler</td>
                <td>Banka hesap bilgileri (ödeme için)</td>
              </tr>
              <tr>
                <td>Hukuki İşlem Bilgileri</td>
                <td>Vekaletname, imza, onay kayıtları</td>
              </tr>
              <tr>
                <td>Dijital Veriler</td>
                <td>IP adresi, çerez verileri, log kayıtları</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
          <p>
            Kişisel verileriniz, web sitemiz üzerinden elektronik ortamda, aşağıdaki hukuki 
            sebeplere dayanılarak toplanmaktadır:
          </p>
          <ul>
            <li>Açık rızanız (KVKK m.5/1)</li>
            <li>Sözleşmenin kurulması ve ifası (KVKK m.5/2-c)</li>
            <li>Hukuki yükümlülüğün yerine getirilmesi (KVKK m.5/2-ç)</li>
            <li>Meşru menfaat (KVKK m.5/2-f)</li>
          </ul>

          <h2>5. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi kapsamında 
            aşağıdaki taraflara aktarılabilir:
          </p>
          <ul>
            <li>Havayolu şirketleri (tazminat talebi için)</li>
            <li>Hukuk büroları ve avukatlar (hukuki süreç için)</li>
            <li>Ödeme kuruluşları ve bankalar (ödeme için)</li>
            <li>Yetkili kamu kurum ve kuruluşları (yasal zorunluluk halinde)</li>
            <li>Yurt dışındaki sunucu ve hizmet sağlayıcıları (teknik altyapı için)</li>
          </ul>

          <h2>6. Kişisel Veri Sahibinin Hakları</h2>
          <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme, silme veya yok etme işlemlerinin kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>

          <h2>7. Başvuru Yöntemi</h2>
          <p>
            Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
          </p>
          <ul>
            <li><strong>E-posta:</strong> kvkk@ucustazminat.com</li>
            <li><strong>Posta:</strong> [Şirket Adresi]</li>
          </ul>
          <p>
            Başvurunuzda kimliğinizi tespit edici bilgiler ile KVKK'nın 11. maddesi kapsamında 
            kullanmak istediğiniz hakkınızı açıkça belirtmeniz gerekmektedir.
          </p>

          <h2>8. Veri Güvenliği</h2>
          <p>
            Kişisel verilerinizin hukuka aykırı olarak işlenmesini ve erişilmesini önlemek, 
            muhafazasını sağlamak amacıyla uygun güvenlik düzeyini temin etmeye yönelik gerekli 
            her türlü teknik ve idari tedbirleri almaktayız.
          </p>

          <h2>9. Değişiklikler</h2>
          <p>
            İşbu aydınlatma metninde yapılacak değişiklikler web sitemizde yayınlanacaktır. 
            Önemli değişikliklerde ayrıca e-posta ile bilgilendirme yapılacaktır.
          </p>
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
