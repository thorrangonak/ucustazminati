import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | UçuşTazminat',
  description: 'UçuşTazminat KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
  alternates: {
    canonical: 'https://ucustazminat.com/kvkk',
  },
}

export default function KVKKPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            KVKK Aydınlatma Metni
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              Son güncelleme: 1 Ocak 2026
            </p>

            <h2>1. Veri Sorumlusu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca,
              kişisel verileriniz; veri sorumlusu olarak UçuşTazminat Teknoloji A.Ş.
              ("Şirket") tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>

            <h2>2. Kişisel Verilerin İşlenme Amaçları</h2>
            <p>
              Toplanan kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen
              kişisel veri işleme şartları dahilinde aşağıdaki amaçlarla işlenebilecektir:
            </p>
            <ul>
              <li>Tazminat talebinizin oluşturulması ve takibi</li>
              <li>Havayolları ile iletişim ve müzakerelerin yürütülmesi</li>
              <li>Yasal süreçlerin takibi ve yönetimi</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
              <li>İletişim faaliyetlerinin yürütülmesi</li>
              <li>Hizmet kalitesinin artırılması</li>
              <li>İstatistiksel analizlerin yapılması</li>
            </ul>

            <h2>3. İşlenen Kişisel Veriler</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Veri Kategorisi</th>
                  <th className="border p-2 text-left">Veri Türleri</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Kimlik Bilgileri</td>
                  <td className="border p-2">Ad, soyad, T.C. kimlik no, doğum tarihi, pasaport bilgileri</td>
                </tr>
                <tr>
                  <td className="border p-2">İletişim Bilgileri</td>
                  <td className="border p-2">Telefon numarası, e-posta adresi, adres</td>
                </tr>
                <tr>
                  <td className="border p-2">Finansal Bilgiler</td>
                  <td className="border p-2">IBAN, banka hesap bilgileri</td>
                </tr>
                <tr>
                  <td className="border p-2">Uçuş Bilgileri</td>
                  <td className="border p-2">Uçuş numarası, tarih, rezervasyon bilgileri</td>
                </tr>
                <tr>
                  <td className="border p-2">Dijital Veriler</td>
                  <td className="border p-2">IP adresi, çerez verileri, oturum bilgileri</td>
                </tr>
              </tbody>
            </table>

            <h2>4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
            <p>
              Kişisel verileriniz, aşağıdaki yöntemlerle ve hukuki sebeplere dayanılarak toplanmaktadır:
            </p>
            <h3>Toplanma Yöntemleri:</h3>
            <ul>
              <li>Web sitesi üzerinden doldurulan formlar</li>
              <li>E-posta, telefon ve diğer iletişim kanalları</li>
              <li>Yüklenen belgeler (biniş kartı, bilet vb.)</li>
              <li>Otomatik sistemler (çerezler, log kayıtları)</li>
            </ul>

            <h3>Hukuki Sebepler:</h3>
            <ul>
              <li>Açık rızanızın bulunması</li>
              <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
              <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi</li>
              <li>Veri sorumlusunun meşru menfaatleri için zorunlu olması</li>
              <li>Bir hakkın tesisi, kullanılması veya korunması için zorunlu olması</li>
            </ul>

            <h2>5. Kişisel Verilerin Aktarılması</h2>
            <p>
              Toplanan kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi
              doğrultusunda aşağıdaki kişi ve kuruluşlara aktarılabilecektir:
            </p>
            <ul>
              <li><strong>Havayolu Şirketleri:</strong> Tazminat talebinin iletilmesi</li>
              <li><strong>Hukuk Büroları:</strong> Dava süreçlerinin yürütülmesi</li>
              <li><strong>Bankalar:</strong> Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li><strong>Kamu Kurumları:</strong> Yasal zorunluluklar kapsamında</li>
              <li><strong>Yurt Dışı Kuruluşlar:</strong> AB havayolları ile iletişim</li>
            </ul>

            <h2>6. Kişisel Veri Sahibinin Hakları</h2>
            <p>
              KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <ul>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun
                  kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı
                  üçüncü kişileri bilme</li>
              <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde
                  bunların düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel
                  verilerinizin silinmesini veya yok edilmesini isteme</li>
              <li>Düzeltme, silme veya yok etme işlemlerinin, kişisel verilerin
                  aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz
                  edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara
                  uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>

            <h2>7. Başvuru Yöntemi</h2>
            <p>
              Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle
              başvuruda bulunabilirsiniz:
            </p>
            <ul>
              <li>
                <strong>E-posta:</strong> kvkk@ucustazminat.com adresine güvenli
                elektronik imza veya mobil imza ile imzalanmış dilekçe göndererek
              </li>
              <li>
                <strong>Posta:</strong> Noter onaylı kimlik fotokopisi ve ıslak imzalı
                dilekçe ile şirket adresine göndererek
              </li>
              <li>
                <strong>Sistemimiz üzerinden:</strong> Kayıtlı e-posta adresiniz
                üzerinden talep oluşturarak
              </li>
            </ul>

            <h2>8. Veri Güvenliği</h2>
            <p>
              Şirketimiz, kişisel verilerinizin hukuka aykırı olarak işlenmesini ve
              erişilmesini önlemek ve verilerin muhafazasını sağlamak amacıyla uygun
              güvenlik düzeyini temin etmeye yönelik gerekli teknik ve idari tedbirleri
              almaktadır.
            </p>

            <h2>9. Veri Saklama Süresi</h2>
            <p>
              Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca ve
              ilgili mevzuatta öngörülen zamanaşımı süreleri kadar saklanacaktır.
              Tazminat talepleri için bu süre genel olarak 10 yıldır.
            </p>

            <h2>10. Değişiklikler</h2>
            <p>
              Şirketimiz, işbu aydınlatma metninde her zaman değişiklik yapabilir.
              Değişiklikler, güncel metnin web sitesinde yayınlanmasıyla yürürlüğe girer.
            </p>

            <h2>11. İletişim</h2>
            <p>
              KVKK kapsamındaki haklarınız ve sorularınız için:
            </p>
            <ul>
              <li><strong>Veri Sorumlusu:</strong> UçuşTazminat Teknoloji A.Ş.</li>
              <li><strong>E-posta:</strong> kvkk@ucustazminat.com</li>
              <li><strong>Adres:</strong> İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
