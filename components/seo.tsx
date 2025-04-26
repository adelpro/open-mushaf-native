import React from 'react';

import { Helmet } from 'react-helmet-async';

type Props = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonical?: string;
  keywords?: string;
  locale?: string;
  structuredData?: Record<string, any>; // Add structured data support
};

export default function SEO({
  title = 'Open Mushaf',
  description = 'A modern and minimalist Quran Mushaf application',
  image = 'https://open-mushaf-native.web.app/og-image.png',
  url = 'https://open-mushaf-native.web.app',
  canonical,
  keywords = 'quran, mushaf, islam, holy book, reading quran',
  locale = 'ar_DZ',
  structuredData,
}: Props) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={locale} />

      {/* Additional useful OG tags */}
      <meta property="og:site_name" content="Open Mushaf" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Mobile viewport optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Add structured data if provided */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
