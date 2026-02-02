import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plane,
  Euro,
  Scale,
  FileText,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Uçuş Gecikmesi Tazminatı | 3 Saatten Fazla Gecikme | UçuşTazminat',
  description:
    'Uçuşunuz 3 saatten fazla gecikti mi? EC 261/2004 ve SHY-YOLCU kapsamında 600€\'ya kadar tazminat alın. Ücretsiz kontrol, başarıya dayalı ücret.',
  keywords: [
    'uçuş gecikmesi tazminatı',
    'geciken uçuş hakları',
    'EC 261/2004',
    'SHY-YOLCU',
    '3 saat gecikme tazminat',
    'havayolu tazminat',
  ],
  alternates: {
    canonical: 'https://ucustazminat.com/hizmetler/ucus-gecikmesi',
  },
  openGraph: {
    title: 'Uçuş Gecikmesi Tazminatı | 600€\'ya Kadar Tazminat',
    description: 'Uçuşunuz 3 saatten fazla gecikti mi? Hemen tazminat hakkınızı öğrenin.',
    url: 'https://ucustazminat.com/hizmetler/ucus-gecikmesi',
    type: 'website',
  },
}

const compensationTable = [
  { distance: 'Türkiye iç hat uçuşları', amount: '100 €', delay: '3 saat+' },
  { distance: '1.500 km\'ye kadar', amount: '250 €', delay: '3 saat+' },
  { distance: '1.500 - 3.500 km arası', amount: '400 €', delay: '3 saat+' },
  { distance: '3.500 km üzeri', amount: '600 €', delay: '4 saat+' },
]

const eligibilityConditions = [
  {
    icon: Clock,
    title: 'Minimum 3 Saat Gecikme',
    description: 'Varış noktasına 3 saatten fazla geç ulaşmanız gerekiyor.',
  },
  {
    icon: Plane,
    title: 'Havayolu Sorumlu',
    description: 'Gecikme teknik arıza, operasyonel nedenler gibi havayolunun kontrolündeki sebeplerden kaynaklanmalı.',
  },
  {
    icon: Scale,
    title: 'Son 3 Yıl İçinde',
    description: 'Türkiye\'de 3 yıl, AB\'de 6 yıla kadar geriye dönük talep hakkınız var.',
  },
]

const notEligibleCases = [
  'Hava koşulları (fırtına, sis, yıldırım)',
  'Havaalanı grevleri',
  'Güvenlik tehditleri',
  'Politik istikrarsızlık',
  'Olağanüstü doğa olayları',
]

export default function FlightDelayPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              <Clock className="h-4 w-4" />
              Uçuş Gecikmesi Tazminatı
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Uçuşunuz Gecikti mi?{' '}
              <span className="text-primary">600€&apos;ya Kadar</span> Tazminat Alın
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              3 saatten fazla geciken uçuşlar için EC 261/2004 ve SHY-YOLCU yönetmelikleri
              kapsamında tazminat hakkınız bulunuyor. Ücretsiz kontrol edin.
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

      {/* Compensation Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Gecikme Tazminat Miktarları
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Tazminat miktarı uçuş mesafesine göre belirlenir
            </p>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Uçuş Mesafesi</th>
                    <th className="px-6 py-4 text-left">Tazminat</th>
                    <th className="px-6 py-4 text-left">Minimum Gecikme</th>
                  </tr>
                </thead>
                <tbody>
                  {compensationTable.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4">{row.distance}</td>
                      <td className="px-6 py-4 font-bold text-primary">{row.amount}</td>
                      <td className="px-6 py-4">{row.delay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Conditions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Tazminat Almak İçin Koşullar
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Aşağıdaki koşulları sağlıyorsanız tazminat hakkınız var
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {eligibilityConditions.map((condition, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <condition.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{condition.title}</h3>
                    <p className="text-sm text-muted-foreground">{condition.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Not Eligible Cases */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  Tazminat Alamayacağınız Durumlar
                </h2>
                <p className="text-muted-foreground mb-6">
                  &quot;Olağanüstü hal&quot; olarak kabul edilen ve havayolunun kontrolü dışındaki
                  sebeplerden kaynaklanan gecikmelerde tazminat talep edilemez:
                </p>
                <ul className="space-y-3">
                  {notEligibleCases.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Tazminat Alabileceğiniz Durumlar
                  </h3>
                  <ul className="space-y-3 text-green-800">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" />
                      Teknik arıza ve bakım sorunları
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" />
                      Mürettebat eksikliği
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" />
                      Operasyonel problemler
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" />
                      Overbooking nedeniyle gecikme
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" />
                      Bağlantılı uçuşları kaçırma
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nasıl Çalışır?
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: FileText, title: 'Kontrol Et', desc: 'Tazminat hakkınızı ücretsiz kontrol edin' },
                { icon: Plane, title: 'Başvur', desc: 'Uçuş bilgilerinizi ve belgelerinizi gönderin' },
                { icon: Scale, title: 'Biz Takip Edelim', desc: 'Havayolu ile tüm görüşmeleri biz yaparız' },
                { icon: Euro, title: 'Tazminat Alın', desc: 'Başarıda tazminatınızı hesabınıza alın' },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Geciken Uçuşunuz İçin Tazminat Alın
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
