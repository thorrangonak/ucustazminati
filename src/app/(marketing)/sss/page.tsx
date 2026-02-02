import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowRight, MessageCircle } from 'lucide-react'

const faqCategories = [
  {
    title: 'Genel Sorular',
    faqs: [
      {
        question: 'UçuşTazminat nedir ve nasıl çalışır?',
        answer:
          'UçuşTazminat, uçuş gecikmesi, iptali veya overbooking durumlarında yolcuların tazminat haklarını takip eden bir hizmet şirketidir. Sizin adınıza havayolu şirketleriyle iletişime geçer, tüm yasal süreçleri yönetir ve başarılı olursak tazminatınızı alırız.',
      },
      {
        question: 'Hizmetiniz ücretli mi?',
        answer:
          'Başvuru tamamen ücretsizdir. Sadece başarılı olduğumuzda, yani tazminat aldığınızda, tutarın %25\'i komisyon olarak kesilir. Başarısız olursak hiçbir ücret ödemezsiniz.',
      },
      {
        question: 'Ne kadar sürede sonuç alırım?',
        answer:
          'Çoğu talep 2-8 hafta içinde sonuçlanır. Ancak havayolunun tutumuna ve vakanın karmaşıklığına bağlı olarak bu süre değişebilir. Bazı durumlarda yasal süreçlere gitmek gerekebilir, bu durumda süre uzayabilir.',
      },
      {
        question: 'Hangi havayolları için başvurabilirim?',
        answer:
          'Türkiye\'den kalkan veya Türkiye\'ye inen tüm uçuşlar için başvurabilirsiniz. THY, Pegasus, AnadoluJet gibi Türk havayollarının yanı sıra yabancı havayolları için de başvuru yapabilirsiniz.',
      },
    ],
  },
  {
    title: 'Tazminat Hakkı',
    faqs: [
      {
        question: 'Ne kadar tazminat alabilirim?',
        answer:
          'Tazminat miktarı uçuş mesafesine göre belirlenir: İç hat uçuşları için 100€, 1500 km\'ye kadar 250€, 1500-3500 km arası 400€, 3500 km üzeri uçuşlar için 600€.',
      },
      {
        question: 'Hangi durumlarda tazminat hakkım doğar?',
        answer:
          '3 saat ve üzeri gecikmeler, uçuş iptalleri, overbooking (fazla bilet satışı) nedeniyle uçuşa alınmama, bilginiz dışında alt sınıfa düşürülme durumlarında tazminat hakkınız doğar.',
      },
      {
        question: 'Olağanüstü koşullarda tazminat alabilir miyim?',
        answer:
          'Hava koşulları, grevler, terör tehditleri gibi havayolunun kontrolü dışındaki olağanüstü koşullarda genellikle tazminat hakkı doğmaz. Ancak teknik arızalar çoğu zaman tazminat hakkı doğurur.',
      },
      {
        question: 'Geçmiş uçuşlarım için başvurabilir miyim?',
        answer:
          'Evet, son 3 yıl içindeki uçuşlarınız için tazminat talep edebilirsiniz.',
      },
      {
        question: 'Alternatif uçuş teklif edildi, yine de tazminat alabilir miyim?',
        answer:
          'Eğer alternatif uçuşla varış noktasına planlanan saatten 3 saat veya daha fazla geç ulaştıysanız, tazminat hakkınız devam eder.',
      },
    ],
  },
  {
    title: 'Başvuru Süreci',
    faqs: [
      {
        question: 'Başvuru için hangi belgeler gerekli?',
        answer:
          'Biniş kartı, bilet/rezervasyon onayı ve varsa gecikme/iptal bildirimi gereklidir. Bunların dışında kimlik belgesi (TC kimlik veya pasaport) ve IBAN bilgisi istenecektir.',
      },
      {
        question: 'Biniş kartımı kaybettim, başvurabilir miyim?',
        answer:
          'Evet, biniş kartı olmadan da başvurabilirsiniz. Rezervasyon onayı veya bilet bilgisi yeterli olabilir. Gerekirse havayolundan uçuş kaydınızı doğrulayabiliriz.',
      },
      {
        question: 'Birden fazla yolcu için tek başvuru yapabilir miyim?',
        answer:
          'Evet, aynı uçuş için birden fazla yolcu adına tek başvuru yapabilirsiniz. Her yolcu için ayrı tazminat hesaplanır.',
      },
      {
        question: 'Aktarmalı uçuşlarda durum nedir?',
        answer:
          'Aktarmalı uçuşlarda, toplam gecikme süresine bakılır. Varış noktasına 3 saat veya daha fazla geç ulaştıysanız tazminat hakkınız doğar. Tek rezervasyonla alınmış aktarmalı uçuşlarda mesafe toplam mesafe üzerinden hesaplanır.',
      },
    ],
  },
  {
    title: 'Ödeme ve Sonuç',
    faqs: [
      {
        question: 'Tazminat nasıl ödenir?',
        answer:
          'Tazminat banka havalesi ile ödenir. Başarılı sonuç sonrası IBAN bilgilerinizi alır ve tutarı (komisyon düşüldükten sonra) hesabınıza aktarırız.',
      },
      {
        question: 'Komisyon oranınız nedir?',
        answer:
          'Başarı komisyonumuz %25\'tir. Yani 400€ tazminat aldığınızda 300€ size kalır, 100€ bizim komisyonumuzdur. Başarısız olursak hiç ücret alınmaz.',
      },
      {
        question: 'Talep reddedilirse ne olur?',
        answer:
          'Talep reddedilirse size neden reddedildiğini açıklarız. Gerekirse itiraz edebilir veya yasal yollara başvurabiliriz. Bu süreçte de sizden ek ücret talep etmeyiz.',
      },
      {
        question: 'Tazminat hangi para biriminde ödenir?',
        answer:
          'Tazminat genellikle Euro (€) cinsinden hesaplanır. Ödeme tercihinize göre Euro veya Türk Lirası olarak yapılabilir.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-blue-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Sık Sorulan Sorular
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Merak ettiğiniz tüm soruların cevapları burada. Bulamadığınız bir şey
            varsa bize ulaşın.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={category.title} className={categoryIndex > 0 ? 'mt-12' : ''}>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {category.title}
              </h2>
              <Accordion type="single" collapsible>
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${categoryIndex}-${faqIndex}`}
                  >
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <MessageCircle className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Hala sorunuz mu var?
          </h2>
          <p className="mt-2 text-gray-600">
            Uzman ekibimiz size yardımcı olmaktan mutluluk duyar.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/iletisim">
              <Button>
                Bize Ulaşın
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/yeni-talep">
              <Button variant="outline">Hemen Başvur</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
