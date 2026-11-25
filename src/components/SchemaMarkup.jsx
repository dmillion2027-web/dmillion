export function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DMILLION",
    "url": "https://dmillionluxury.ca",
    "logo": "https://dmillionluxury.ca/logo.png",
    "description": "Luxury fashion and designer handbags",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1580 Kingston Rd",
      "addressLocality": "Pickering",
      "addressRegion": "Ontario",
      "postalCode": "L1V6M6",
      "addressCountry": "CA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "dmillion2027@gmail.com",
      "telephone": "+1-289-200-3045"
    },
    "sameAs": [
      "https://www.instagram.com/dmillion2026",
      "https://tiktok.com/@dmillion2027",
      "https://facebook.com/dmillion2027"
    ]
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "ECommerce",
    "name": "DMILLION Luxury Fashion",
    "url": "https://dmillionluxury.ca",
    "image": "https://dmillionluxury.ca/logo.png",
    "description": "Premium luxury fashion store specializing in designer handbags and leather accessories",
    "areaServed": "CA",
    "availableLanguage": "en",
    "potentialAction": {
      "@type": "BuyAction",
      "target": "https://dmillionluxury.ca/collection"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
    </>
  );
}
