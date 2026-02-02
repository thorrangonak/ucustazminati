import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  XCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plane,
  Euro,
  Clock,
  Bell,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Uçuş İptali Tazminatı | İptal Edilen Uçuş Hakları | UçuşTazminat',
  description:
    'Uçuşunuz iptal mi edildi? EC 261/2004 ve SHY-YOLCU kapsamında 600€\'ya kadar tazminat alın. Ücretsiz kontrol, başarıya dayalı ücret.',
  keywords: [
    'uçuş iptali tazminatı',
    'iptal edilen uçuş hakları',
    'EC 261/2004',
    'SHY-YOLCU',
    'uçuş iptal tazminat',
    'havayolu iptal',
  ],
  alternates: {
    canonical: 'https://ucustazminat.com/hizmetler/ucus-iptali',
  },
  openGraph: {
    title: 'Uçuş İptali Tazminatı | 600€\'ya Kadar Tazminat',
    description: 'Uçuşunuz iptal mi edildi? Hemen tazminat hakkınızı öğrenin.',
    url: 'https://ucustazminat.com/hizmetler/ucus-iptali',
    type: 'website',
  },
}

const compensationTable = [
  { distance: 'Türkiye iç hat uçuşları', amount: '100 €' },
  { distance: '1.500 km\'ye kadar', amount: '250 €' },
  { distance: '1.500 - 3.500 km arası', amount: '400 €' },
  { distance: '3.500 km üzeri', amount: '600 €' },
]

const notificationRules = [
  {
    period: '14 günden az önce',
    condition: 'İptal bildirimi yapılmışsa',
    result: 'Tam tazminat hakkı',
  },
  {
    period: '7-14 gün önce',
    condition: 'Alternatif uçuş 2 saat önce kalkış veya 4 saat sonra varış',
    result: 'Tam tazminat hakkı',
  },
  {
    period: '7 günden az önce',
    condition: 'Alternatif uçuş 1 saat önce kalkış veya 2 saat sonra varış',
    result: 'Tam tazminat hakkı',
  },
]

const yourRights = [
  {
    icon: Euro,
    title: 'Tazminat Hakkı',
    description: 'Mesafeye göre 100€ ile 600€ arasında parasal tazminat',
  },
  {
    icon: Plane,
    title: 'Alternatif Uçuş',
    description: 'Varış noktanıza en kısa sürede ulaşacak alternatif uçuş',
  },
  {
    icon: Clock,
    title: 'Geri Ödeme',
    description: 'Bilet ücretinizin 7 gün içinde tam iadesi',
  },
  {
    icon: Bell,
    title: 'Bakım Hizmetleri',
    description: 'Yemek, içecek, konaklama ve ulaşım masrafları',
  },
]

export default function FlightCancellationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 mb-6">
              <XCircle className="h-4 w-4" />
              Uçuş İptali Tazminatı
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Uçuşunuz İptal mi Edildi?{' '}
              <span className="text-primary">600€&apos;ya Kadar</span> Tazminat Alın
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              İptal edilen uçuşlar için EC 261/2004 ve SHY-YOLCU yönetmelikleri kapsamında
              tazminat, geri ödeme ve bakım hizmetleri hakkınız bulunuyor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/yeni-talep">
                  Tazminat Talebimi Başlat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/tazminat-hesapla">Tazminatımı Hesapla</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              İptal Durumunda Haklarınız
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Uçuşunuz iptal edildiğinde aşağıdaki haklara sahipsiniz
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {yourRights.map((right, index) => (
                <Card key={index}>
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <right.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{right.title}</h3>
                      <p className="text-sm text-muted-foreground">{right.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compensation Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              İptal Tazminat Miktarları
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Tazminat miktarı uçuş mesafesine göre belirlenir
            </p>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Uçuş Mesafesi</th>
                    <th className="px-6 py-4 text-left">Tazminat Miktarı</th>
                  </tr>
                </thead>
                <tbody>
                  {compensationTable.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4">{row.distance}</td>
                      <td className="px-6 py-4 font-bold text-primary">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Rules */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Bildirim Süresi ve Tazminat Hakkı
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              İptal bildiriminin ne zaman yapıldığı tazminat hakkınızı etkiler
            </p>

            <div className="space-y-4">
              {notificationRules.map((rule, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="md:w-1/4">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {rule.period}
                        </span>
                      </div>
                      <div className="md:w-1/2">
                        <p className="text-muted-foreground">{rule.condition}</p>
                      </div>
                      <div className="md:w-1/4 text-right">
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle className="h-4 w-4" />
                          {rule.result}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Önemli Bilgi</h3>
                  <p className="text-yellow-700 text-sm">
                    14 günden fazla önce iptal bildirimi yapıldıysa tazminat hakkınız olmayabilir.
                    Ancak bilet iadesi ve alternatif uçuş haklarınız devam eder. Olağanüstü
                    haller (hava koşulları, grev vb.) nedeniyle yapılan iptallerde de tazminat
                    talep edilemez.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Do */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Uçuşunuz İptal Edildiğinde Ne Yapmalısınız?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Yapmanız Gerekenler
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm shrink-0">1</span>
                    <span>İptal bildirimini yazılı olarak isteyin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm shrink-0">2</span>
                    <span>Biniş kartı ve biletinizi saklayın</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm shrink-0">3</span>
                    <span>Tüm harcama fişlerini muhafaza edin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm shrink-0">4</span>
                    <span>Alternatif uçuş veya geri ödeme seçin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm shrink-0">5</span>
                    <span>UçuşTazminat ile başvurunuzu yapın</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Kaçınmanız Gerekenler
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm shrink-0">!</span>
                    <span>Voucher kabul etmeyin (nakit ödeme hakkınız var)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm shrink-0">!</span>
                    <span>Haklarınızdan feragat eden belge imzalamayın</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm shrink-0">!</span>
                    <span>Belgelerinizi atmayın</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm shrink-0">!</span>
                    <span>Zaman aşımı süresini kaçırmayın (3 yıl)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              İptal Edilen Uçuşunuz İçin Tazminat Alın
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Sadece 2 dakikada tazminat hakkınızı öğrenin.
              Başarısız olursak ücret yok.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/yeni-talep">
                Hemen Başvur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
