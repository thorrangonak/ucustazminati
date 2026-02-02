import Link from 'next/link'
import { Plane } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-white">UçuşTazminat</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white">
            Uçuş Tazminatınızı Alın
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Uçuşunuz gecikti veya iptal mi oldu? €600&apos;a kadar tazminat alabilirsiniz.
            Başarısız olursak hiçbir ücret ödemezsiniz.
          </p>
          <div className="flex items-center gap-8 text-primary-foreground/60">
            <div>
              <p className="text-3xl font-bold text-white">€600</p>
              <p className="text-sm">Maksimum Tazminat</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">%98</p>
              <p className="text-sm">Başarı Oranı</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">3dk</p>
              <p className="text-sm">Başvuru Süresi</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} UçuşTazminat. Tüm hakları saklıdır.
        </p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">UçuşTazminat</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
