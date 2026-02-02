import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.terms} />
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
          <h1>Kullanım Koşulları</h1>
          <p className="text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

          <h2>1. Giriş</h2>
          <p>
            Bu Kullanım Koşulları ("Koşullar"), UçuşTazminat platformunu ("Platform", "Hizmet", "biz", "bizim") 
            kullanımınızı düzenler. Platformumuzu kullanarak bu Koşulları kabul etmiş sayılırsınız.
          </p>

          <h2>2. Hizmet Tanımı</h2>
          <p>
            UçuşTazminat, AB 261/2004 Yönetmeliği kapsamında uçuş gecikmesi, iptali veya fazla rezervasyon 
            nedeniyle hak sahibi olan yolcuların tazminat taleplerini havayolu şirketlerine iletmek ve 
            takip etmek amacıyla aracılık hizmeti sunar.
          </p>
          <p>Hizmetlerimiz şunları kapsar:</p>
          <ul>
            <li>Tazminat hakkı uygunluk değerlendirmesi</li>
            <li>Talep belgelerinin hazırlanması</li>
            <li>Havayolu şirketleri ile iletişim</li>
            <li>Gerektiğinde hukuki süreç yönetimi</li>
            <li>Tazminat ödemelerinin takibi</li>
          </ul>

          <h2>3. Kullanıcı Yükümlülükleri</h2>
          <p>Platformumuzu kullanırken aşağıdaki yükümlülükleri kabul edersiniz:</p>
          <ul>
            <li>Doğru ve eksiksiz bilgi sağlamak</li>
            <li>Gerekli belgeleri zamanında yüklemek</li>
            <li>Vekaletname ve onay formlarını imzalamak</li>
            <li>İletişim bilgilerinizi güncel tutmak</li>
            <li>Aynı talep için başka bir aracı ile çalışmamak</li>
          </ul>

          <h2>4. Ücretlendirme ve Komisyon</h2>
          <p>
            <strong>No Win No Fee:</strong> Hizmetimiz "kazanamazsak ücret yok" prensibiyle çalışır. 
            Tazminat alamazsanız herhangi bir ücret ödemezsiniz. Şeffaf hukuki sürec.
          </p>
          <p>
            <strong>Komisyon Oranı:</strong> Başarılı talepler için toplam tazminat tutarının %25'i 
            komisyon olarak kesilir. Kalan %75 size ödenir.
          </p>
          <p>
            <strong>Ödeme:</strong> Havayolu şirketinden tazminat alındıktan sonra, komisyon kesilerek 
            kalan tutar 14 iş günü içinde belirttiğiniz banka hesabına aktarılır.
          </p>

          <h2>5. Vekaletname</h2>
          <p>
            Talep oluşturma sürecinde imzaladığınız elektronik vekaletname ile UçuşTazminat'a 
            adınıza havayolu şirketi ile iletişim kurma ve tazminat talep etme yetkisi verirsiniz. 
            Bu vekaletname yalnızca belirtilen talep için geçerlidir.
          </p>

          <h2>6. Süreç ve Zaman Çizelgesi</h2>
          <p>
            Tazminat süreci havayolu şirketinin yanıt süresine bağlı olarak değişir. 
            Ortalama süreç 2-6 ay arasındadır. Hukuki süreç gerekirse bu süre uzayabilir.
          </p>
          <p>
            Talebinizin durumunu panelimizden takip edebilir, önemli güncellemelerde 
            e-posta bildirimi alırsınız.
          </p>

          <h2>7. İptal ve Cayma Hakkı</h2>
          <p>
            Talebinizi havayolu şirketine göndermeden önce iptal edebilirsiniz. 
            Talep gönderildikten sonra iptal durumunda, o ana kadar yapılan masraflar 
            talep edilebilir.
          </p>

          <h2>8. Sorumluluk Sınırlaması</h2>
          <p>
            UçuşTazminat, tazminat talebinin başarılı olacağını garanti etmez. 
            Havayolu şirketinin kararı veya olağanüstü koşullar nedeniyle reddedilen 
            talepler için sorumluluk kabul edilmez.
          </p>
          <p>
            Kullanıcı tarafından sağlanan yanlış veya eksik bilgilerden kaynaklanan 
            sorunlardan UçuşTazminat sorumlu tutulamaz.
          </p>

          <h2>9. Fikri Mülkiyet</h2>
          <p>
            Platform üzerindeki tüm içerik, tasarım, logo ve yazılım UçuşTazminat'ın 
            mülkiyetindedir ve telif hakkı ile korunmaktadır.
          </p>

          <h2>10. Değişiklikler</h2>
          <p>
            Bu Koşulları önceden bildirimde bulunarak değiştirme hakkımız saklıdır. 
            Değişiklikler yayınlandıktan sonra platformu kullanmaya devam etmeniz, 
            yeni koşulları kabul ettiğiniz anlamına gelir.
          </p>

          <h2>11. Uygulanacak Hukuk</h2>
          <p>
            Bu Koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda 
            İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>

          <h2>12. İletişim</h2>
          <p>
            Sorularınız için bizimle iletişime geçebilirsiniz:
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
