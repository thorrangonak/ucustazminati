import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  UserX,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plane,
  Euro,
  Users,
  Scale,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Uçağa Alınmama (Overbooking) Tazminatı | UçuşTazminat',
  description:
    'Fazla satış (overbooking) nedeniyle uçağa alınmadınız mı? EC 261/2004 ve SHY-YOLCU kapsamında 600€\'ya kadar tazminat alın.',
  keywords: [
    'overbooking tazminatı',
    'uçağa alınmama tazminatı',
    'fazla satış tazminat',
    'denied boarding',
    'uçuş tazminat',
    'havayolu tazminat',
  ],
  alternates: {
    canonical: 'https://ucustazminat.com/hizmetler/ucaga-alinmama',
  },
  openGraph: {
    title: 'Uçağa Alınmama Tazminatı | 600€\'ya Kadar Tazminat',
    description: 'Overbooking nedeniyle uçağa alınmadınız mı? Hemen tazminat hakkınızı öğrenin.',
    url: 'https://ucustazminat.com/hizmetler/ucaga-alinmama',
    type: 'website',
  },
}

const compensationTable = [
  { distance: 'Türkiye iç hat uçuşları', amount: '100 €' },
  { distance: '1.500 km\'ye kadar', amount: '250 €' },
  { distance: '1.500 - 3.500 km arası', amount: '400 €' },
  { distance: '3.500 km üzeri', amount: '600 €' },
]

const yourRights = [
  {
    icon: Euro,
    title: 'Anında Tazminat',
    description: 'Yer olmaması nedeniyle uçağa alınmadığınızda anında tazminat hakkınız doğar',
  },
  {
    icon: Plane,
    title: 'Alternatif Uçuş',
    description: 'En kısa sürede varış noktanıza ulaştırılmanız gerekir',
  },
  {
    icon: Users,
    title: 'Bakım Hizmetleri',
    description: 'Bekleme süresince yemek, içecek ve gerekirse konaklama sağlanmalı',
  },
  {
    icon: Scale,
    title: 'Tam İade Hakkı',
    description: 'İsterseniz bilet ücretinizin tam iadesini talep edebilirsiniz',
  },
]

const whatIsOverbooking = [
  'Havayolları genellikle uçuşlara kapasiteden fazla bilet satar',
  'Bu uygulama "overbooking" veya "fazla satış" olarak bilinir',
  'Tüm yolcular gelirse, bazıları uçağa alınamaz',
  'Önce gönüllü arayan havayolu, bulamazsa zorunlu indirme yapar',
  'Zorunlu indirmede TAM TAZMİNAT hakkınız doğar',
]

export default function DeniedBoardingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-600 mb-6">
              <UserX className="h-4 w-4" />
              Uçağa Alınmama Tazminatı
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Overbooking Nedeniyle Uçağa Alınmadınız mı?{' '}
              <span className="text-primary">600€&apos;ya Kadar</span> Tazminat Alın
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Fazla satış (overbooking) nedeniyle uçağa alınmadıysanız, EC 261/2004 ve
              SHY-YOLCU kapsamında anında tazminat hakkınız var.
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

      {/* What is Overbooking */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Overbooking (Fazla Satış) Nedir?
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Neden bazı yolcular uçağa alınamıyor?
            </p>

            <div className="bg-orange-50 rounded-xl p-8 border border-orange-200">
              <ul className="space-y-4">
                {whatIsOverbooking.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-orange-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Uçağa Alınmadığınızda Haklarınız
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              İsteğiniz dışında uçağa alınmadığınızda aşağıdaki haklara sahipsiniz
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Tazminat Miktarları
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

            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">
                  <strong>Önemli:</strong> Overbooking durumunda tazminat hakkı, gecikme veya
                  iptalden farklı olarak hemen doğar. Havayolunun &quot;olağanüstü hal&quot; mazereti
                  geçerli değildir çünkü fazla satış tamamen havayolunun kararıdır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voluntary vs Involuntary */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Gönüllü ve Zorunlu İndirilme Farkı
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-yellow-800 mb-4">
                    Gönüllü İndirilme
                  </h3>
                  <ul className="space-y-3 text-yellow-900">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-1 shrink-0" />
                      <span>Havayolu gönüllü arıyor ve siz kabul ediyorsunuz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-1 shrink-0" />
                      <span>Teklif edilen tazminat/voucher için pazarlık yapabilirsiniz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-1 shrink-0" />
                      <span>Yasal tazminat hakkınızdan feragat etmiş olabilirsiniz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-1 shrink-0" />
                      <span>İmzalayacağınız belgeleri dikkatli okuyun!</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-4">
                    Zorunlu İndirilme
                  </h3>
                  <ul className="space-y-3 text-green-900">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                      <span>İsteğiniz dışında uçağa alınmıyorsunuz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                      <span>TAM tazminat hakkınız otomatik olarak doğar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                      <span>Alternatif uçuş + bakım hizmetleri almalısınız</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                      <span>Havayolu mazeret ileri süremez</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Uçağa Alınmadığınızda Ne Yapmalısınız?
            </h2>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Yazılı Belge İsteyin',
                  desc: 'Havayolundan uçağa alınmama sebebini yazılı olarak isteyin. Bu belge çok önemli!',
                },
                {
                  step: 2,
                  title: 'Gönüllü Teklifi Dikkatli Değerlendirin',
                  desc: 'Gönüllü indirilme teklifi alırsanız, tazminat hakkınızdan feragat edip etmediğinizi kontrol edin.',
                },
                {
                  step: 3,
                  title: 'Haklarınızı Bilin',
                  desc: 'Bakım hizmetleri (yemek, içecek, konaklama) ve alternatif uçuş/geri ödeme hakkınızı kullanın.',
                },
                {
                  step: 4,
                  title: 'Tüm Belgeleri Saklayın',
                  desc: 'Biniş kartı, bilet, yazışmalar ve harcama makbuzlarınızı muhafaza edin.',
                },
                {
                  step: 5,
                  title: 'UçuşTazminat ile Başvurun',
                  desc: 'Biz tüm süreci sizin adınıza takip eder, tazminatınızı alırız.',
                },
              ].map((item) => (
                <Card key={item.step}>
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
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
              Uçağa Alınmadınız mı? Tazminat Alın!
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Overbooking nedeniyle mağdur oldunuz. Hakkınız olan tazminatı alın.
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
