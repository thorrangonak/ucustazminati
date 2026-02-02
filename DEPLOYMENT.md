# UçuşTazminat - Deployment Rehberi

## Gereksinimler

- Node.js 20+
- PostgreSQL veritabanı (Neon, Supabase veya benzeri)
- Resend hesabı (email için)
- AWS S3 bucket (dosya yükleme için - opsiyonel)

---

## Seçenek 1: Vercel ile Deploy (ÖNERİLEN)

Vercel, Next.js'in yaratıcısı tarafından geliştirilmiştir ve en iyi Next.js desteğini sunar.

### Adım 1: Vercel Hesabı Oluştur

1. [vercel.com](https://vercel.com) adresine git
2. GitHub hesabınla kayıt ol

### Adım 2: Projeyi GitHub'a Yükle

```bash
# Proje klasöründe
cd /Users/thorium/ucustazminat

# Git repo başlat (yoksa)
git init

# .gitignore kontrol et
cat .gitignore

# Tüm dosyaları ekle
git add .

# Commit yap
git commit -m "Initial commit - UçuşTazminat"

# GitHub'da yeni repo oluştur ve bağla
git remote add origin https://github.com/KULLANICI_ADIN/ucustazminat.git
git branch -M main
git push -u origin main
```

### Adım 3: Vercel'de Projeyi Import Et

1. Vercel Dashboard'a git
2. "Add New" → "Project" tıkla
3. GitHub reposundan "ucustazminat" seç
4. "Import" tıkla

### Adım 4: Environment Variables Ekle

Vercel'de "Environment Variables" bölümünde şunları ekle:

```env
# Veritabanı
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# NextAuth
NEXTAUTH_URL=https://ucustazminat.vercel.app
NEXTAUTH_SECRET=rastgele-guclu-bir-secret-key-32-karakter

# Google OAuth (opsiyonel)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Resend Email (admin panelinden de ayarlanabilir)
RESEND_API_KEY=re_xxx

# AWS S3 (admin panelinden de ayarlanabilir)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=eu-central-1
AWS_S3_BUCKET=ucustazminat-documents
```

### Adım 5: Deploy Et

1. "Deploy" butonuna tıkla
2. Build tamamlanana kadar bekle (~2-3 dakika)
3. Site canlı! 🎉

### Adım 6: Veritabanı Migration

Deploy sonrası Prisma migration çalıştır:

```bash
# Lokal'de
npx prisma migrate deploy
```

Veya Vercel'de "Functions" → Terminal'den çalıştır.

### Adım 7: Custom Domain (Opsiyonel)

1. Vercel Dashboard → Settings → Domains
2. "ucustazminat.com" ekle
3. DNS ayarlarını yap:
   - A Record: 76.76.19.19
   - CNAME: cname.vercel-dns.com

---

## Seçenek 2: Cloudflare Pages ile Deploy

⚠️ **Not**: Cloudflare Pages, Prisma ile çalışırken "Prisma Accelerate" veya "Prisma Data Proxy" gerektirir.

### Adım 1: Prisma Accelerate Kurulumu

1. [console.prisma.io](https://console.prisma.io) adresine git
2. Yeni proje oluştur
3. Accelerate'i etkinleştir
4. Connection string al

### Adım 2: Cloudflare Pages Kurulumu

```bash
# @cloudflare/next-on-pages yükle
npm install -D @cloudflare/next-on-pages

# wrangler yükle
npm install -D wrangler
```

### Adım 3: next.config.ts Güncelle

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cloudflare Pages için
  experimental: {
    runtime: 'edge',
  },
}

export default nextConfig
```

### Adım 4: Cloudflare Dashboard'dan Deploy

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Pages
2. "Create a project" → "Connect to Git"
3. GitHub reposunu seç
4. Build settings:
   - Framework preset: Next.js
   - Build command: `npx @cloudflare/next-on-pages`
   - Build output: `.vercel/output/static`
5. Environment variables ekle
6. Deploy

---

## Seçenek 3: VPS/Dedicated Server ile Deploy

Kendi sunucunuzda çalıştırmak için:

### Adım 1: Sunucu Hazırlığı

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Node.js 20 yükle
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 yükle (process manager)
sudo npm install -g pm2
```

### Adım 2: Projeyi Sunucuya Yükle

```bash
# Proje klasörü oluştur
sudo mkdir -p /var/www/ucustazminat
cd /var/www/ucustazminat

# Git clone
git clone https://github.com/KULLANICI_ADIN/ucustazminat.git .

# Dependencies yükle
npm install

# Prisma generate
npx prisma generate

# Build
npm run build
```

### Adım 3: Environment Variables

```bash
# .env.local oluştur
sudo nano /var/www/ucustazminat/.env.local

# İçeriği yapıştır (yukarıdaki env variables)
```

### Adım 4: PM2 ile Çalıştır

```bash
# Başlat
pm2 start npm --name "ucustazminat" -- start

# Otomatik başlatma
pm2 startup
pm2 save
```

### Adım 5: Nginx Konfigürasyonu

```bash
sudo nano /etc/nginx/sites-available/ucustazminat
```

```nginx
server {
    listen 80;
    server_name ucustazminat.com www.ucustazminat.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Etkinleştir
sudo ln -s /etc/nginx/sites-available/ucustazminat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Adım 6: SSL Sertifikası

```bash
sudo certbot --nginx -d ucustazminat.com -d www.ucustazminat.com
```

---

## Veritabanı Kurulumu (Neon)

### Adım 1: Neon Hesabı Oluştur

1. [neon.tech](https://neon.tech) adresine git
2. Hesap oluştur (GitHub ile)
3. Yeni proje oluştur

### Adım 2: Database Oluştur

1. "Databases" → "New Database"
2. İsim: `ucustazminat`
3. Connection string'i kopyala

### Adım 3: Migration Çalıştır

```bash
# Lokal'de DATABASE_URL ayarla
export DATABASE_URL="postgresql://..."

# Migration çalıştır
npx prisma migrate deploy

# Seed data (opsiyonel)
npx prisma db seed
```

---

## Post-Deploy Checklist

- [ ] Site açılıyor mu?
- [ ] Kayıt/Giriş çalışıyor mu?
- [ ] Admin paneli erişilebilir mi? (/admin)
- [ ] Email gönderimi çalışıyor mu?
- [ ] Dosya yükleme çalışıyor mu?
- [ ] SSL sertifikası aktif mi?
- [ ] Admin ayarlarından API key'ler girildi mi?

---

## Sorun Giderme

### Build Hatası
```bash
# Cache temizle
rm -rf .next node_modules
npm install
npm run build
```

### Database Bağlantı Hatası
- DATABASE_URL doğru mu kontrol et
- SSL mode gerekli mi? (`?sslmode=require`)
- IP whitelist'e sunucu IP'si eklendi mi?

### 500 Hatası
- Vercel/Cloudflare logs'a bak
- Environment variables eksik olabilir

---

## Önerilen Yapı

```
Vercel (Next.js App)
    ↓
Neon (PostgreSQL)
    ↓
Cloudflare (DNS + CDN)
    ↓
AWS S3 (Dosya Depolama)
    ↓
Resend (Email)
```

Bu yapı ile:
- Ücretsiz tier'larla başlayabilirsin
- Ölçeklenebilir
- Yüksek performans
- Global CDN

---

## Maliyet Tahmini (Başlangıç)

| Servis | Ücretsiz Limit | Ücretli |
|--------|----------------|---------|
| Vercel | 100GB bandwidth/ay | $20/ay |
| Neon | 3GB storage | $19/ay |
| Cloudflare | Sınırsız | Ücretsiz |
| Resend | 3000 email/ay | $20/ay |
| AWS S3 | 5GB | ~$5/ay |

**Başlangıç için toplam: $0 (ücretsiz tier'larla)**
