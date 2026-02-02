'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet'
import { Menu, Plane, User, LogOut, LayoutDashboard, ChevronDown, Home, HelpCircle, Calculator, MessageCircle, ChevronRight, Sparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home },
  { name: 'Nasıl Çalışır', href: '/nasil-calisir', icon: HelpCircle },
  { name: 'Tazminat Hesapla', href: '/tazminat-hesapla', icon: Calculator },
  { name: 'SSS', href: '/sss', icon: MessageCircle },
  { name: 'İletişim', href: '/iletisim', icon: MessageCircle },
]

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">UçuşTazminat</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          {status === 'loading' ? (
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{session.user?.name || 'Hesabım'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/giris">
                <Button variant="ghost">Giriş Yap</Button>
              </Link>
              <Link href="/yeni-talep">
                <Button>Ücretsiz Başvur</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-[320px] p-0">
            {/* Header */}
            <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-primary">UçuşTazminat</span>
                  <p className="text-xs text-muted-foreground">Hakkınızı alın</p>
                </div>
              </Link>
            </SheetHeader>

            <div className="flex flex-col h-[calc(100%-88px)]">
              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary/5 hover:text-primary transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-primary/10 transition-colors">
                      <item.icon className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </nav>

              {/* User Section */}
              <div className="p-4 border-t bg-gray-50/50">
                {session ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {session.user?.name || 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>

                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-11">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Çıkış Yap
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/yeni-talep" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-12 gap-2 shadow-lg shadow-primary/25">
                        <Sparkles className="h-4 w-4" />
                        Ücretsiz Başvur
                      </Button>
                    </Link>

                    <Link href="/giris" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-11 gap-2">
                        <User className="h-4 w-4" />
                        Giriş Yap
                      </Button>
                    </Link>

                    <p className="text-center text-xs text-muted-foreground pt-2">
                      Hesabınız yok mu?{' '}
                      <Link
                        href="/kayit"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-primary font-medium hover:underline"
                      >
                        Kayıt Olun
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
