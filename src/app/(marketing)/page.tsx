'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
  Users,
  Banknote,
  FileCheck,
  Headphones,
  Star,
  Zap,
  TrendingUp,
  BadgeCheck,
} from 'lucide-react'
import { QuickCheck } from '@/components/claim/QuickCheck'

const stats = [
  { value: 'EUR600', label: 'Maksimum Tazminat', icon: Banknote, color: 'text-primary' },
  { value: '%98', label: 'Basari Orani', icon: TrendingUp, color: 'text-green-500' },
  { value: '50.000+', label: 'Mutlu Musteri', icon: Users, color: 'text-blue-500' },
  { value: '3 dk', label: 'Basvuru Suresi', icon: Zap, color: 'text-yellow-500' },
]

const steps = [
  {
    icon: FileCheck,
    title: 'Ucus Bilgilerinizi Girin',
    description: 'Binis kartinizi yukleyin veya ucus bilgilerinizi girin, aninda tazminat hakkinizi ogrenin.',
    color: 'bg-blue-500',
  },
  {
    icon: Shield,
    title: 'Biz Mucadele Edelim',
    description: 'Uzman ekibimiz havayolu sirketiyle sizin adiniza iletisime gecer ve tazminat talebinizi takip eder.',
    color: 'bg-primary',
  },
  {
    icon: Banknote,
    title: 'Tazminatinizi Alin',
    description: 'Basarili olursak tazminatiniz hesabiniza yatar. Basarisiz olursak hicbir ucret odemezsiniz.',
    color: 'bg-purple-500',
  },
]

const faqs = [
  {
    question: 'Ne kadar tazminat alabilirim?',
    answer: 'Turkiye ici ucuslarda 100 EUR, 1500 km\'ye kadar 250 EUR, 3500 km\'ye kadar 400 EUR, 3500 km uzeri ucuslarda 600 EUR\'ya kadar tazminat alabilirsiniz.',
  },
  {
    question: 'Hangi durumlarda tazminat hakkim var?',
    answer: '3 saat ve uzeri gecikmeler, ucus iptalleri, overbooking (fazla bilet satisi) nedeniyle ucusa alinmama durumlarinda tazminat hakkiniz dogar.',
  },
  {
    question: 'Basvuru ucreti var mi?',
    answer: 'Hayir, basvuru tamamen ucretsizdir. Sadece basarili olursak tazminat tutarinin %25\'i komisyon olarak alinir.',
  },
  {
    question: 'Ne kadar surede sonuclanir?',
    answer: 'Cogu talep 2-8 hafta icinde sonuclanir. Karmasik vakalar daha uzun surebilir.',
  },
]

const testimonials = [
  {
    name: 'Ahmet Y.',
    location: 'Istanbul',
    text: 'THY ucusum 5 saat gecikti. UcusTazminat sayesinde 400 EUR tazminat aldim. Harika bir hizmet!',
    rating: 5,
    amount: 400,
  },
  {
    name: 'Zeynep K.',
    location: 'Ankara',
    text: 'Ucusum iptal oldu ve ne yapacagimi bilmiyordum. Basvurum 3 hafta icinde sonuclandi.',
    rating: 5,
    amount: 250,
  },
  {
    name: 'Mehmet A.',
    location: 'Izmir',
    text: 'Profesyonel ekip, hizli surec. 600 EUR tazminatimi aldim. Tesekkurler UcusTazminat!',
    rating: 5,
    amount: 600,
  },
]

const trustBadges = [
  { icon: BadgeCheck, text: 'Resmi Yetkili', color: 'text-primary' },
  { icon: Shield, text: 'Guvenli Odeme', color: 'text-blue-600' },
  { icon: Award, text: '%98 Basari', color: 'text-yellow-600' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - AirHelp Style */}
      <section className="relative overflow-hidden bg-hero-pattern py-20 lg:py-32">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Text */}
            <div className="flex flex-col justify-center text-white">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Basari garantisi - Kazanmazsak ucret yok
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Ucus Gecikmesi mi?
                <span className="block mt-2">Tazminat Hakkiniz Var!</span>
              </h1>
              <p className="mt-6 text-xl text-white/90 leading-relaxed">
                Ucusunuz gecikti veya iptal mi oldu? <strong>EUR 600</strong>&apos;a kadar tazminat alabilirsiniz.
                3 dakikada basvurun, biz takip edelim.
              </p>

              {/* Trust Badges */}
              <div className="mt-8 flex flex-wrap items-center gap-6">
                {trustBadges.map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <badge.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/yeni-talep">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl">
                    Ucretsiz Basvur
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/nasil-calisir">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 bg-white/10 text-white hover:bg-white/20">
                    Nasil Calisir?
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Quick Check Scanner */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md animate-fade-in">
                <QuickCheck />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-8 z-10 mx-auto max-w-6xl px-4 lg:px-8">
        <Card className="shadow-xl border-0">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
              {stats.map((stat) => (
                <div key={stat.label} className="p-6 lg:p-8 text-center group hover:bg-muted/50 transition-colors">
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Zap className="h-4 w-4" />
              Cok Basit
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              3 Adimda Tazminatinizi Alin
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Karmasik prosedurlerle ugrasmayin. Biz sizin icin halledelim.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative group">
                <Card className="h-full card-hover border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} text-white shadow-lg`}>
                      <step.icon className="h-7 w-7" />
                    </div>
                    <div className="absolute top-8 right-8 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                      {index + 1}
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-gray-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/yeni-talep">
              <Button size="lg" className="shadow-lg">
                Hemen Basvur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compensation Table Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Ne Kadar Tazminat Alabilirsiniz?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              SHY-YOLCU ve EC 261/2004 yonetmeligine gore tazminat miktarlari
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
            <div className="bg-primary p-6">
              <div className="grid grid-cols-2 text-white font-semibold">
                <div>Mesafe</div>
                <div className="text-right">Tazminat</div>
              </div>
            </div>
            <div className="divide-y">
              {[
                { distance: 'Ic Hat (Turkiye)', example: 'Tum yurt ici ucuslar', amount: 100 },
                { distance: '1500 km\'ye kadar', example: 'Orn: Istanbul - Atina', amount: 250 },
                { distance: '1500 - 3500 km', example: 'Orn: Istanbul - Londra', amount: 400 },
                { distance: '3500 km uzeri', example: 'Orn: Istanbul - New York', amount: 600 },
              ].map((row) => (
                <div key={row.distance} className="grid grid-cols-2 p-6 hover:bg-primary/5 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">{row.distance}</div>
                    <div className="text-sm text-gray-500">{row.example}</div>
                  </div>
                  <div className="text-right flex items-center justify-end">
                    <span className="text-3xl font-bold text-primary">EUR {row.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500 max-w-2xl mx-auto">
            * Tazminat miktarlari 3 saat ve uzeri gecikmeler, iptaller ve overbooking durumlari icin gecerlidir.
            Tum yolcular icin ayri tazminat hesaplanir.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 mb-4">
              <Star className="h-4 w-4 fill-yellow-500" />
              50.000+ Mutlu Musteri
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Musterilerimiz Ne Diyor?
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="relative card-hover border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="absolute -top-4 right-8 flex h-12 w-20 items-center justify-center rounded-full bg-primary text-white font-bold shadow-lg">
                    EUR {testimonial.amount}
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-lg font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Sik Sorulan Sorular
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-0 mb-4">
                <AccordionTrigger className="bg-white rounded-xl px-6 py-4 text-left hover:bg-gray-50 shadow-sm hover:no-underline [&[data-state=open]]:rounded-b-none">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="bg-white rounded-b-xl px-6 pb-4 shadow-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 text-center">
            <Link href="/sss">
              <Button variant="outline" size="lg">Tum Sorular</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-hero-gradient py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Tazminat Hakkinizi Kaybetmeyin
            </h2>
            <p className="mx-auto mt-6 text-xl text-white/90">
              Son 3 yil icindeki ucuslariniz icin hala tazminat talep edebilirsiniz.
              Hemen basvurun, biz takip edelim.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/yeni-talep">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl h-14 px-8 text-lg">
                  Ucretsiz Basvur
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/iletisim">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 h-14 px-8 text-lg"
                >
                  <Headphones className="mr-2 h-5 w-5" />
                  Bize Ulasin
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Ucretsiz basvuru</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No Win No Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>%98 basari</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
