import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://www.ucustazminat.com';
const DEFAULT_TITLE = 'UçuşTazminat - Uçuş Gecikme ve İptal Tazminatı | 600€\'ya Kadar';
const DEFAULT_DESCRIPTION = 'Geciken, iptal edilen veya fazla rezervasyon yapılan uçuşlarınız için 600 Euro\'ya kadar tazminat alın. No Win No Fee - kazanamazsak ücret yok. Şeffaf hukuki sürec, sadece %25 komisyon.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | UçuşTazminat` : DEFAULT_TITLE;
  const fullDescription = description || DEFAULT_DESCRIPTION;
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const fullOgImage = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const updateLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Update meta tags
    updateMeta('description', fullDescription);
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', fullDescription, true);
    updateMeta('og:url', fullCanonical, true);
    updateMeta('og:image', fullOgImage, true);

    // Twitter
    updateMeta('twitter:title', fullTitle, true);
    updateMeta('twitter:description', fullDescription, true);
    updateMeta('twitter:image', fullOgImage, true);

    // Canonical
    updateLink('canonical', fullCanonical);

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, fullDescription, fullCanonical, fullOgImage, noindex]);

  return null;
}

// Page-specific SEO configurations
export const SEO_CONFIG = {
  home: {
    title: undefined, // Use default
    description: DEFAULT_DESCRIPTION,
    canonical: '/',
  },
  dashboard: {
    title: 'Panelim',
    description: 'Tazminat taleplerinizi takip edin ve yönetin.',
    canonical: '/dashboard',
    noindex: true,
  },
  newClaim: {
    title: 'Yeni Talep Oluştur',
    description: 'Uçuş gecikme veya iptal tazminatı için yeni talep oluşturun.',
    canonical: '/dashboard/claims/new',
    noindex: true,
  },
  terms: {
    title: 'Kullanım Koşulları',
    description: 'UçuşTazminat kullanım koşulları ve hizmet şartları.',
    canonical: '/terms',
  },
  privacy: {
    title: 'Gizlilik Politikası',
    description: 'UçuşTazminat gizlilik politikası ve kişisel verilerin korunması.',
    canonical: '/privacy',
  },
  kvkk: {
    title: 'KVKK Aydınlatma Metni',
    description: 'UçuşTazminat KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
    canonical: '/kvkk',
  },
  admin: {
    title: 'Admin Paneli',
    description: 'UçuşTazminat yönetim paneli.',
    canonical: '/admin',
    noindex: true,
  },
};
