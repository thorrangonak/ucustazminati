import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

export default function VerifyEmail() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");

  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus("success");
    },
    onError: () => {
      setStatus("error");
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }
    
    verifyEmailMutation.mutate({ token });
  }, [token]);

  // Token yoksa
  if (status === "no-token") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Doğrulama Linki Eksik</CardTitle>
            <CardDescription>
              E-posta doğrulama linki eksik veya hatalı. Lütfen e-postanızdaki linke tıklayın veya yeni bir doğrulama e-postası isteyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Panele Git
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Yükleniyor
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="mt-4 text-gray-600">E-posta adresiniz doğrulanıyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Başarılı
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">E-posta Doğrulandı!</CardTitle>
            <CardDescription>
              E-posta adresiniz başarıyla doğrulandı. Artık tüm özellikleri kullanabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              <p className="font-medium mb-1">Hesabınız aktif!</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Tazminat talebi oluşturabilirsiniz</li>
                <li>Taleplerinizi takip edebilirsiniz</li>
                <li>Önemli bildirimleri alabilirsiniz</li>
              </ul>
            </div>
            
            <Link href="/dashboard">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Panele Git
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Hata
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Doğrulama Başarısız</CardTitle>
          <CardDescription>
            Doğrulama linkinin süresi dolmuş veya daha önce kullanılmış olabilir. Lütfen yeni bir doğrulama e-postası isteyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Panele Git ve Yeni E-posta İste
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
