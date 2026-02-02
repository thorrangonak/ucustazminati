import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  Award,
  Users,
  Target,
  Heart,
  Shield,
  Scale,
  Plane,
  TrendingUp,
} from 'lucide-react'

const stats = [
  { value: '50.000+', label: 'Mutlu Müşteri', icon: Users },
  { value: '€15M+', label: 'Toplam Tazminat', icon: TrendingUp },
  { value: '%98', label: 'Başarı Oranı', icon: Award },
  { value: '3 Yıl', label: 'Deneyim', icon: Target },
]

const values = [
  {
    icon: Shield,
    title: 'Güven',
    description:
      'Müşterilerimizin haklarını korumak için var gücümüzle çalışıyoruz. Her talepte şeffaf ve dürüst iletişim kuruyoruz.',
  },
  {
    icon: Scale,
    title: 'Adalet',
    description:
      'Yolcu haklarının korunması için mücadele ediyoruz. Herkesin hak ettiği tazminatı alması gerektiğine inanıyoruz.',
  },
  {
    icon: Heart,
    title: 'Müşteri Odaklılık',
    description:
      'Müşteri memnuniyeti bizim için her şeyden önemli. Her adımda yanınızda oluyoruz.',
  },
  {
    icon: Award,
    title: 'Uzmanlik',
    description:
      'Havacılık hukuku konusunda uzman ekibimizle en karmaşık vakaları bile çözüyoruz.',
  },
]

const team = [
  {
    name: 'Ahmet Yılmaz',
    role: 'Kurucu & CEO',
    bio: '15 yıllık havacılık sektörü deneyimi',
  },
  {
    name: 'Elif Demir',
    role: 'Hukuk Direktörü',
    bio: 'Havacılık hukuku uzmanı',
  },
  {
    name: 'Mehmet Kaya',
    role: 'Operasyon Müdürü',
    bio: 'Müşteri ilişkileri uzmanı',
  },
  {
    name: 'Zeynep Arslan',
    role: 'Teknoloji Direktörü',
    bio: 'Dijital dönüşüm uzmanı',
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-blue-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                Yolcu Haklarını
                <span className="block text-primary">Koruyoruz</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                UçuşTazminat olarak, uçuş aksaklıkları yaşayan yolcuların haklarını
                savunuyoruz. Uzman ekibimiz ve %98 başarı oranımızla yanınızdayız.
              </p>
              <div className="mt-8">
                <Link href="/yeni-talep">
                  <Button size="lg">
                    Hemen Başvur
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-6 text-center">
                      <stat.icon className="mx-auto h-8 w-8 text-primary" />
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Plane className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Hikayemiz</h2>
            <div className="mt-6 space-y-4 text-lg text-gray-600">
              <p>
                UçuşTazminat, 2021 yılında kurucumuz Ahmet Yılmaz&apos;ın yaşadığı
                kişisel bir deneyimden doğdu. Havayolu şirketinin haksız tutumu
                karşısında tek başına mücadele etmek zorunda kaldığında, binlerce
                yolcunun da aynı sorunla karşılaştığını fark etti.
              </p>
              <p>
                Bu deneyim, yolcuların haklarını korumak ve onlar adına mücadele
                etmek için bir platform kurma fikrini doğurdu. Bugün, 50.000&apos;den
                fazla yolcuya yardımcı olduk ve 15 milyon Euro&apos;nun üzerinde
                tazminat kazandırdık.
              </p>
              <p>
                Misyonumuz basit: Yolcuların haklarını savunmak ve onlara hak
                ettikleri tazminatı almalarında yardımcı olmak. Tüm süreç boyunca
                yanınızdayız ve başarısız olursak hiçbir ücret talep etmiyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Değerlerimiz</h2>
            <p className="mt-4 text-lg text-gray-600">
              Bizi yönlendiren temel ilkeler
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{value.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ekibimiz</h2>
            <p className="mt-4 text-lg text-gray-600">
              Deneyimli ve tutkulu profesyonellerden oluşan ekibimiz
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl font-bold text-primary">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="mt-2 text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Hakkınızı Almak İçin Yanınızdayız
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Uçuş gecikmesi veya iptali yaşadınız mı? Hemen başvurun, tazminatınızı
            alalım.
          </p>
          <div className="mt-8">
            <Link href="/yeni-talep">
              <Button size="lg" variant="secondary">
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
