import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  FileText,
  Search,
  MessageSquare,
  Banknote,
  CheckCircle2,
  Shield,
  Clock,
  Users,
} from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: FileText,
    title: 'Başvurunuzu Yapın',
    description:
      'Online formumuz aracılığıyla uçuş bilgilerinizi girin. Sadece 3 dakika sürer. Uçuş numarası, tarih ve yaşadığınız sorun hakkında bilgi verin.',
    details: [
      'Uçuş bilgilerini girin',
      'Gecikme/iptal detaylarını belirtin',
      'Yolcu bilgilerini ekleyin',
      'Belgeleri yükleyin',
    ],
  },
  {
    number: 2,
    icon: Search,
    title: 'Talebinizi Değerlendirelim',
    description:
      'Uzman ekibimiz başvurunuzu inceleyerek tazminat hakkınızı değerlendirir. Uçuş verilerini ve yasal düzenlemeleri kontrol ederiz.',
    details: [
      'Uçuş verilerini doğrulama',
      'Tazminat hakkı kontrolü',
      'Yasal değerlendirme',
      'Belge inceleme',
    ],
  },
  {
    number: 3,
    icon: MessageSquare,
    title: 'Havayoluyla İletişim',
    description:
      'Sizin adınıza havayolu şirketiyle iletişime geçeriz. Tüm yazışmaları ve müzakereleri biz yürütürüz.',
    details: [
      'Havayoluna resmi başvuru',
      'Talep takibi',
      'Müzakere süreci',
      'Gerekirse yasal işlem',
    ],
  },
  {
    number: 4,
    icon: Banknote,
    title: 'Tazminatınızı Alın',
    description:
      'Başarılı olduğumuzda tazminat tutarı hesabınıza yatırılır. Komisyonumuz sadece başarı durumunda kesilir.',
    details: [
      'Onay bildirimi',
      'Banka bilgisi alımı',
      'Hızlı ödeme',
      'Şeffaf süreç',
    ],
  },
]

const benefits = [
  {
    icon: Shield,
    title: 'Risk Yok',
    description: 'Başarısız olursak hiçbir ücret ödemezsiniz. Tüm risk bizde.',
  },
  {
    icon: Clock,
    title: 'Zaman Kazanın',
    description: 'Tüm bürokratik işlemleri biz hallederiz. Siz sadece bekleyin.',
  },
  {
    icon: Users,
    title: 'Uzman Ekip',
    description: 'Havacılık hukuku konusunda deneyimli ekibimiz yanınızda.',
  },
  {
    icon: CheckCircle2,
    title: '%98 Başarı',
    description: 'Yüksek başarı oranımızla güvenle başvurabilirsiniz.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-blue-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Nasıl Çalışır?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            4 basit adımda uçuş tazminatınızı alın. Tüm süreci biz yönetiyoruz,
            siz sadece başvurunuzu yapın.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                      {step.number}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                  </div>
                  <p className="mt-4 text-lg text-gray-600">{step.description}</p>
                  <ul className="mt-6 space-y-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Icon Card */}
                <div className="flex-1">
                  <Card className="mx-auto max-w-sm">
                    <CardContent className="flex items-center justify-center p-12">
                      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                        <step.icon className="h-16 w-16 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Neden UçuşTazminat?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Binlerce yolcu bize güveniyor
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Hemen Başvurun
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Tazminat hakkınızı kontrol etmek sadece 3 dakika sürer.
            Başarısız olursak hiçbir ücret ödemezsiniz.
          </p>
          <div className="mt-8">
            <Link href="/yeni-talep">
              <Button size="lg">
                Ücretsiz Başvur
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
