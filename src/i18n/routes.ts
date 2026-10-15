export type Locale = 'en' | 'id';

export interface RoutePair {
  en: string;
  id: string;
  key: string;
}

export const ROUTE_MAP: RoutePair[] = [
  { key: 'home', en: '/', id: '/id' },
  { key: 'products', en: '/products', id: '/id/produk' },
  { key: 'product-milk', en: '/products/milk', id: '/id/produk/susu' },
  { key: 'product-cocoa', en: '/products/cocoa', id: '/id/produk/cocoa' },
  { key: 'product-cacao', en: '/products/cacao', id: '/id/produk/cacao' },
  { key: 'services', en: '/services', id: '/id/layanan' },
  { key: 'about', en: '/about', id: '/id/tentang' },
  { key: 'contact', en: '/contact', id: '/id/kontak' },
  { key: 'privacy', en: '/privacy', id: '/id/privasi' },
  { key: 'terms', en: '/terms', id: '/id/ketentuan' },
  { key: 'brand-guidelines', en: '/brand-guidelines', id: '/brand-guidelines' },
  { key: 'cms', en: '/cms', id: '/cms' },
];

export function detectLocaleFromPath(path: string): Locale {
  if (path === '/id' || path.startsWith('/id/')) {
    return 'id';
  }
  return 'en';
}

export function translatePath(currentPath: string, targetLocale: Locale, dynamicProductSlugs?: Array<{ slugEn: string; slugId: string }>): string {
  const clean = currentPath === '' ? '/' : currentPath;
  const exact = ROUTE_MAP.find((r) => r.en === clean || r.id === clean);
  if (exact) {
    return targetLocale === 'en' ? exact.en : exact.id;
  }

  // Handle dynamic CMS product routes (/products/[slug] <-> /id/produk/[slug])
  if (clean.startsWith('/products/')) {
    const slug = clean.replace('/products/', '');
    const found = dynamicProductSlugs?.find((p) => p.slugEn === slug || p.slugId === slug);
    const idSlug = found ? found.slugId : slug === 'milk' ? 'susu' : slug;
    return targetLocale === 'en' ? `/products/${found ? found.slugEn : slug}` : `/id/produk/${idSlug}`;
  }

  if (clean.startsWith('/id/produk/')) {
    const slug = clean.replace('/id/produk/', '');
    const found = dynamicProductSlugs?.find((p) => p.slugId === slug || p.slugEn === slug);
    const enSlug = found ? found.slugEn : slug === 'susu' ? 'milk' : slug;
    return targetLocale === 'en' ? `/products/${enSlug}` : `/id/produk/${found ? found.slugId : slug}`;
  }

  return targetLocale === 'en' ? '/' : '/id';
}
