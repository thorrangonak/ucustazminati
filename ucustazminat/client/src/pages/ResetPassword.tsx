import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Token doğrulama
  const { data: tokenData, isLoading: isVerifying } = trpc.auth.verifyResetToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      setIsSuccess(true);
      toast.success("Şifre sıfırlandı", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Hata", {
        description: error.message || "Şifre sıfırlanırken bir hata oluştu.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }
    
    resetPasswordMutation.mutate({ token, newPassword: password });
  };

  // Token yoksa veya geçersizse
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Geçersiz Link</CardTitle>
            <CardDescription>
              Şifre sıfırlama linki geçersiz veya eksik. Lütfen yeni bir şifre sıfırlama talebi oluşturun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sifremi-unuttum">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Yeni Şifre Sıfırlama Talebi
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token doğrulanıyor
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="mt-4 text-gray-600">Link doğrulanıyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token geçersiz veya süresi dolmuş
  if (!tokenData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Link Geçersiz</CardTitle>
            <CardDescription>
              Şifre sıfırlama linkinin süresi dolmuş veya daha önce kullanılmış. Lütfen yeni bir şifre sıfırlama talebi oluşturun.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/sifremi-unuttum">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Yeni Şifre Sıfırlama Talebi
              </Button>
            </Link>
            <Link href="/giris">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Giriş sayfasına dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Başarılı sıfırlama
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Şifre Sıfırlandı</CardTitle>
            <CardDescription>
              Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/giris">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Giriş Yap
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Şifre sıfırlama formu
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded" />
            <span className="text-xl font-bold">UçuşTazminat</span>
          </Link>
          <CardTitle className="text-2xl">Yeni Şifre Belirle</CardTitle>
          <CardDescription>
            Hesabınız için yeni bir şifre belirleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Yeni Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500">Şifreler eşleşmiyor</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={resetPasswordMutation.isPending || password !== confirmPassword}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Şifre Sıfırlanıyor...
                </>
              ) : (
                "Şifremi Sıfırla"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/giris" className="text-red-600 hover:text-red-700 font-medium">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Giriş sayfasına dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
