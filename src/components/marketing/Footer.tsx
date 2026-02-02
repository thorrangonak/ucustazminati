import Link from 'next/link'
import { Plane, Mail, Phone, MapPin } from 'lucide-react'

const footerNavigation = {
  hizmetler: [
    { name: 'Uçuş Gecikmesi', href: '/hizmetler/ucus-gecikmesi' },
    { name: 'Uçuş İptali', href: '/hizmetler/ucus-iptali' },
    { name: 'Uçağa Alınmama', href: '/hizmetler/ucaga-alinmama' },
    { name: 'Tazminat Hesapla', href: '/tazminat-hesapla' },
  ],
  sirket: [
    { name: 'Hakkımızda', href: '/hakkimizda' },
    { name: 'Nasıl Çalışır', href: '/nasil-calisir' },
    { name: 'Blog', href: '/blog' },
    { name: 'İletişim', href: '/iletisim' },
  ],
  yasal: [
    { name: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
    { name: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
    { name: 'KVKK Aydınlatma Metni', href: '/kvkk' },
    { name: 'Çerez Politikası', href: '/cerez-politikasi' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">UçuşTazminat</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Uçuş gecikmesi veya iptali yaşadınız mı? Hak ettiğiniz tazminatı almanıza yardımcı oluyoruz.
              Başarı garantili, masrafsız başvuru.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="mailto:info@ucustazminat.com"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                info@ucustazminat.com
              </a>
              <a
                href="tel:+908501234567"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                0850 123 45 67
              </a>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                İstanbul, Türkiye
              </p>
            </div>
          </div>

          {/* Hizmetler */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Hizmetler</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.hizmetler.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Şirket */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Şirket</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.sirket.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Yasal</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.yasal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 border-t pt-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <span className="text-green-600">✓</span>
            </div>
            <span>Başarı Garantisi</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <span className="text-blue-600">🔒</span>
            </div>
            <span>256-bit SSL Güvenlik</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <span className="text-purple-600">⚖️</span>
            </div>
            <span>Yasal Koruma</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} UçuşTazminat. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}
