import { useEffect } from 'react';

const BASE_URL = 'https://www.ucustazminat.com';

// Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UçuşTazminat",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "description": "Türkiye'nin uçuş tazminat platformu. Geciken, iptal edilen veya fazla rezervasyon yapılan uçuşlar için 600 Euro'ya kadar tazminat alın.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "TR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "bildirim@mail.ucustazminat.com",
    "availableLanguage": "Turkish"
  },
  "sameAs": []
};

// Service Schema
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Uçuş Tazminat Talebi Hizmeti",
  "description": "Geciken, iptal edilen veya fazla rezervasyon yapılan uçuşlarınız için tazminat talep etmenize yardımcı oluyoruz. Başarı garantisi ile çalışıyoruz.",
  "provider": {
    "@type": "Organization",
    "name": "UçuşTazminat"
  },
  "serviceType": "Flight Compensation Claims",
  "areaServed": {
    "@type": "Country",
    "name": "Turkey"
  },
  "offers": {
    "@type": "Offer",
    "description": "Kazanamazsak ücret yok - Sadece %25 komisyon",
    "priceCurrency": "EUR",
    "price": "0",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "25",
      "priceCurrency": "EUR",
      "unitText": "% komisyon (başarı durumunda)"
    }
  }
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Hangi durumlarda tazminat talep edebilirim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "3 saatten fazla gecikme, uçuş iptali, boarding reddi (overbooking) veya kaçırılan bağlantılı uçuş durumlarında tazminat talep edebilirsiniz. AB 261/2004 yönetmeliği kapsamında, AB'den kalkan veya AB havayolu ile AB'ye inen uçuşlar için geçerlidir."
      }
    },
    {
      "@type": "Question",
      "name": "Ne kadar tazminat alabilirim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tazminat miktarı uçuş mesafesine göre belirlenir: 1500 km'ye kadar 250€, 1500-3500 km arası 400€, 3500 km üzeri 600€. Birden fazla yolcu için her yolcu ayrı tazminat alır."
      }
    },
    {
      "@type": "Question",
      "name": "Süreç ne kadar sürer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Talep süreci genellikle 2-6 ay arasında tamamlanır. Havayolunun yanıt süresine ve talebin karmaşıklığına bağlı olarak değişebilir. Hukuki süreç gerekirse daha uzun sürebilir."
      }
    },
    {
      "@type": "Question",
      "name": "Komisyon oranınız nedir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sadece başarılı talepler için %25 komisyon alıyoruz. Tazminat alamazsanız, hiçbir ücret ödemezsiniz. Başarı garantisi ile çalışıyoruz."
      }
    },
    {
      "@type": "Question",
      "name": "Hangi belgeler gerekli?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Uçuş bileti veya rezervasyon onayı, kimlik belgesi (TC Kimlik veya Pasaport) ve varsa gecikme/iptal bildirimi gereklidir. Tüm yolcular için ayrı belgeler yüklenmelidir."
      }
    },
    {
      "@type": "Question",
      "name": "Eski uçuşlar için başvurabilir miyim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Evet, son 3 yıl içindeki uçuşlar için tazminat talep edebilirsiniz. Daha eski uçuşlar için zamanaşımı nedeniyle talep hakkınız düşmüş olabilir."
      }
    }
  ]
};

// BreadcrumbList Schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${BASE_URL}${item.url}`
    }))
  };
}

interface StructuredDataProps {
  type: 'organization' | 'service' | 'faq' | 'breadcrumb' | 'all';
  breadcrumbItems?: { name: string; url: string }[];
}

export function StructuredData({ type, breadcrumbItems }: StructuredDataProps) {
  useEffect(() => {
    const scriptId = `structured-data-${type}`;
    
    // Remove existing script if any
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    let schemas: object[] = [];

    switch (type) {
      case 'organization':
        schemas = [organizationSchema];
        break;
      case 'service':
        schemas = [serviceSchema];
        break;
      case 'faq':
        schemas = [faqSchema];
        break;
      case 'breadcrumb':
        if (breadcrumbItems) {
          schemas = [getBreadcrumbSchema(breadcrumbItems)];
        }
        break;
      case 'all':
        schemas = [organizationSchema, serviceSchema, faqSchema];
        break;
    }

    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.id = `${scriptId}-${index}`;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`${scriptId}-${index}`);
        if (script) {
          script.remove();
        }
      });
    };
  }, [type, breadcrumbItems]);

  return null;
}

// Export schemas for direct use
export { organizationSchema, serviceSchema, faqSchema };
